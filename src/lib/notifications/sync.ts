import type { CyclePeriod } from "@/lib/cycle";
import { planRemindersForUser } from "@/lib/notifications/plan";
import type { ReminderPreferences } from "@/lib/notifications/types";
import { zonedCalendarDate } from "@/lib/notifications/time";
import { createAdminClient } from "@/lib/supabase/admin";

interface ProfileNotifyRow {
  user_id: string;
  usual_cycle_length_days: number | null;
  notify_period_reminder: boolean;
  notify_ovulation_reminder: boolean;
  notify_fertile_window_reminder: boolean;
  notify_checkin_reminder: boolean;
  timezone: string;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  preferred_notify_channel: string;
}

function mapPrefs(row: ProfileNotifyRow): ReminderPreferences {
  return {
    periodReminder: row.notify_period_reminder,
    ovulationReminder: row.notify_ovulation_reminder,
    fertileWindowReminder: row.notify_fertile_window_reminder,
    checkinReminder: row.notify_checkin_reminder,
    timezone: row.timezone || "UTC",
    quietHoursStart: row.quiet_hours_start
      ? String(row.quiet_hours_start).slice(0, 5)
      : null,
    quietHoursEnd: row.quiet_hours_end
      ? String(row.quiet_hours_end).slice(0, 5)
      : null,
    preferredChannel: "email",
  };
}

async function loadPeriods(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<CyclePeriod[]> {
  const { data } = await admin
    .from("cycle_periods")
    .select("id, started_on, ended_on")
    .eq("user_id", userId)
    .order("started_on", { ascending: false })
    .limit(60);

  return (data ?? []).map((row) => ({
    id: String(row.id),
    startedOn: String(row.started_on),
    endedOn: typeof row.ended_on === "string" ? row.ended_on : null,
  }));
}

async function hasCheckinToday(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  today: string,
): Promise<boolean> {
  const { data } = await admin
    .from("self_care_checkins")
    .select("id")
    .eq("user_id", userId)
    .eq("checked_on", today)
    .maybeSingle();
  return Boolean(data?.id);
}

export async function resyncUserReminders(userId: string): Promise<{
  ok: boolean;
  planned: number;
  cancelled: number;
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select(
        "user_id, usual_cycle_length_days, notify_period_reminder, notify_ovulation_reminder, notify_fertile_window_reminder, notify_checkin_reminder, timezone, quiet_hours_start, quiet_hours_end, preferred_notify_channel",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return {
        ok: false,
        planned: 0,
        cancelled: 0,
        error: "profile_missing",
      };
    }

    const prefs = mapPrefs(profile as ProfileNotifyRow);
    const now = new Date();
    const today = zonedCalendarDate(now, prefs.timezone);
    const periods = await loadPeriods(admin, userId);
    const completedCheckin = await hasCheckinToday(admin, userId, today);
    const planned = planRemindersForUser({
      periods,
      prefs,
      today,
      usualCycleLengthDays: profile.usual_cycle_length_days,
      hasCompletedCheckinToday: completedCheckin,
      now,
    });

    const desiredKeys = new Set(planned.map((item) => item.dedupeKey));

    const { data: existing } = await admin
      .from("notification_schedules")
      .select("id, dedupe_key, status, scheduled_for")
      .eq("user_id", userId)
      .eq("status", "pending");

    let cancelled = 0;
    for (const row of existing ?? []) {
      if (!desiredKeys.has(String(row.dedupe_key))) {
        const { error } = await admin
          .from("notification_schedules")
          .update({
            status: "cancelled",
            updated_at: now.toISOString(),
          })
          .eq("id", row.id)
          .eq("user_id", userId)
          .eq("status", "pending");
        if (!error) cancelled += 1;
      }
    }

    for (const item of planned) {
      const { data: active } = await admin
        .from("notification_schedules")
        .select("id, status")
        .eq("user_id", userId)
        .eq("dedupe_key", item.dedupeKey)
        .in("status", ["pending", "processing", "sent"])
        .maybeSingle();

      if (active?.status === "sent" || active?.status === "processing") {
        continue;
      }

      if (active?.status === "pending") {
        await admin
          .from("notification_schedules")
          .update({
            scheduled_for: item.scheduledForIso,
            event_date: item.eventDate,
            reminder_type: item.reminderType,
            channel: item.channel,
            updated_at: now.toISOString(),
            last_error_category: null,
          })
          .eq("id", active.id);
        continue;
      }

      await admin.from("notification_schedules").insert({
        user_id: userId,
        reminder_type: item.reminderType,
        channel: item.channel,
        scheduled_for: item.scheduledForIso,
        event_date: item.eventDate,
        status: "pending",
        dedupe_key: item.dedupeKey,
        updated_at: now.toISOString(),
      });
    }

    return { ok: true, planned: planned.length, cancelled };
  } catch {
    return {
      ok: false,
      planned: 0,
      cancelled: 0,
      error: "resync_failed",
    };
  }
}

export async function resyncAllUsersWithProfiles(limit = 200): Promise<{
  users: number;
  errors: number;
}> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("user_id")
    .limit(limit);

  let users = 0;
  let errors = 0;
  for (const row of data ?? []) {
    const result = await resyncUserReminders(String(row.user_id));
    users += 1;
    if (!result.ok) errors += 1;
  }
  return { users, errors };
}
