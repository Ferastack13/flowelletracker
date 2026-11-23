import { sendReminderEmail } from "@/lib/notifications/email";
import {
  adjustForQuietHours,
  isWithinQuietHours,
  zonedCalendarDate,
} from "@/lib/notifications/time";
import type { ReminderType } from "@/lib/notifications/types";
import { createAdminClient, hasAdminClientConfig } from "@/lib/supabase/admin";
import { resyncAllUsersWithProfiles } from "@/lib/notifications/sync";

const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 40;

function backoffMinutes(attemptCount: number): number {
  return Math.min(60 * 6, 5 * 2 ** Math.max(0, attemptCount - 1));
}

export async function processDueNotifications(now = new Date()): Promise<{
  scanned: number;
  sent: number;
  deferred: number;
  failed: number;
  skipped: number;
  resyncedUsers: number;
  providerConfigured: boolean;
  adminConfigured: boolean;
}> {
  const providerConfigured = Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
  );
  const adminConfigured = hasAdminClientConfig();

  if (!adminConfigured) {
    return {
      scanned: 0,
      sent: 0,
      deferred: 0,
      failed: 0,
      skipped: 0,
      resyncedUsers: 0,
      providerConfigured,
      adminConfigured,
    };
  }

  const resync = await resyncAllUsersWithProfiles(200, { now });
  const admin = createAdminClient();
  // Include jobs scheduled during this run (catch-up uses the same clock).
  const dueCutoff = new Date(Math.max(now.getTime(), Date.now()));
  const { data: due } = await admin
    .from("notification_schedules")
    .select(
      "id, user_id, reminder_type, channel, scheduled_for, event_date, attempt_count, dedupe_key",
    )
    .eq("status", "pending")
    .lte("scheduled_for", dueCutoff.toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(BATCH_SIZE);

  let sent = 0;
  let deferred = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of due ?? []) {
    const claim = await admin
      .from("notification_schedules")
      .update({
        status: "processing",
        updated_at: now.toISOString(),
      })
      .eq("id", row.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (!claim.data) {
      skipped += 1;
      continue;
    }

    const { data: profile } = await admin
      .from("profiles")
      .select(
        "timezone, quiet_hours_start, quiet_hours_end, notify_period_reminder, notify_ovulation_reminder, notify_fertile_window_reminder, notify_checkin_reminder",
      )
      .eq("user_id", row.user_id)
      .maybeSingle();

    if (!profile) {
      await admin
        .from("notification_schedules")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
          last_error_category: "profile_missing",
        })
        .eq("id", row.id);
      skipped += 1;
      continue;
    }

    const enabled =
      (row.reminder_type === "period" && profile.notify_period_reminder) ||
      (row.reminder_type === "ovulation" && profile.notify_ovulation_reminder) ||
      (row.reminder_type === "fertile_window" &&
        profile.notify_fertile_window_reminder) ||
      (row.reminder_type === "checkin" && profile.notify_checkin_reminder);

    if (!enabled) {
      await admin
        .from("notification_schedules")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
          last_error_category: "preference_disabled",
        })
        .eq("id", row.id);
      skipped += 1;
      continue;
    }

    const timezone = profile.timezone || "UTC";
    const quietStart = profile.quiet_hours_start
      ? String(profile.quiet_hours_start).slice(0, 5)
      : null;
    const quietEnd = profile.quiet_hours_end
      ? String(profile.quiet_hours_end).slice(0, 5)
      : null;

    if (
      isWithinQuietHours({
        instant: now,
        timeZone: timezone,
        quietHoursStart: quietStart,
        quietHoursEnd: quietEnd,
      })
    ) {
      const deferredTo = adjustForQuietHours({
        scheduledFor: now,
        timeZone: timezone,
        quietHoursStart: quietStart,
        quietHoursEnd: quietEnd,
      });
      await admin
        .from("notification_schedules")
        .update({
          status: "pending",
          scheduled_for: deferredTo.toISOString(),
          updated_at: now.toISOString(),
          last_error_category: "quiet_hours",
        })
        .eq("id", row.id);
      deferred += 1;
      continue;
    }

    if (row.reminder_type === "checkin") {
      const today = zonedCalendarDate(now, timezone);
      const { data: checkin } = await admin
        .from("self_care_checkins")
        .select("id")
        .eq("user_id", row.user_id)
        .eq("checked_on", today)
        .maybeSingle();
      if (checkin?.id) {
        await admin
          .from("notification_schedules")
          .update({
            status: "cancelled",
            updated_at: now.toISOString(),
            last_error_category: "already_checked_in",
          })
          .eq("id", row.id);
        skipped += 1;
        continue;
      }
    }

    const { data: userData, error: userError } =
      await admin.auth.admin.getUserById(String(row.user_id));
    const email = userData.user?.email;

    if (userError || !email) {
      await admin
        .from("notification_schedules")
        .update({
          status: "failed",
          updated_at: now.toISOString(),
          last_error_category: "missing_email",
          attempt_count: Number(row.attempt_count ?? 0) + 1,
        })
        .eq("id", row.id);
      await admin.from("notification_deliveries").insert({
        schedule_id: row.id,
        user_id: row.user_id,
        reminder_type: row.reminder_type,
        channel: "email",
        status: "failed",
        error_category: "missing_email",
        attempt_count: Number(row.attempt_count ?? 0) + 1,
      });
      failed += 1;
      continue;
    }

    const result = await sendReminderEmail({
      to: email,
      reminderType: row.reminder_type as ReminderType,
    });

    const attempts = Number(row.attempt_count ?? 0) + 1;

    if (result.ok) {
      await admin
        .from("notification_schedules")
        .update({
          status: "sent",
          updated_at: now.toISOString(),
          attempt_count: attempts,
          last_error_category: null,
        })
        .eq("id", row.id);
      await admin.from("notification_deliveries").insert({
        schedule_id: row.id,
        user_id: row.user_id,
        reminder_type: row.reminder_type,
        channel: "email",
        status: "accepted",
        provider_message_id: result.providerMessageId,
        attempt_count: attempts,
      });
      sent += 1;
      continue;
    }

    if (result.retryable && attempts < MAX_ATTEMPTS) {
      const retryAt = new Date(
        now.getTime() + backoffMinutes(attempts) * 60_000,
      );
      await admin
        .from("notification_schedules")
        .update({
          status: "pending",
          scheduled_for: retryAt.toISOString(),
          updated_at: now.toISOString(),
          attempt_count: attempts,
          last_error_category: result.errorCategory,
        })
        .eq("id", row.id);
      await admin.from("notification_deliveries").insert({
        schedule_id: row.id,
        user_id: row.user_id,
        reminder_type: row.reminder_type,
        channel: "email",
        status: "failed",
        error_category: result.errorCategory,
        attempt_count: attempts,
      });
      deferred += 1;
      continue;
    }

    await admin
      .from("notification_schedules")
      .update({
        status: "failed",
        updated_at: now.toISOString(),
        attempt_count: attempts,
        last_error_category: result.errorCategory,
      })
      .eq("id", row.id);
    await admin.from("notification_deliveries").insert({
      schedule_id: row.id,
      user_id: row.user_id,
      reminder_type: row.reminder_type,
      channel: "email",
      status: result.status === "bounced" ? "bounced" : "failed",
      error_category: result.errorCategory,
      attempt_count: attempts,
    });
    failed += 1;
  }

  return {
    scanned: due?.length ?? 0,
    sent,
    deferred,
    failed,
    skipped,
    resyncedUsers: resync.users,
    providerConfigured,
    adminConfigured,
  };
}
