import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import {
  type DeliveryStatus,
  type NotificationDeliveryRow,
  type NotifyChannel,
  type ReminderType,
  REMINDER_TYPES,
} from "@/lib/notifications/types";

function isReminderType(value: string): value is ReminderType {
  return (REMINDER_TYPES as readonly string[]).includes(value);
}

function isDeliveryStatus(value: string): value is DeliveryStatus {
  return ["queued", "accepted", "delivered", "failed", "bounced"].includes(
    value,
  );
}

export async function loadNotificationHistory(): Promise<{
  entries: NotificationDeliveryRow[];
  error: string | null;
}> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { entries: [], error: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_deliveries")
    .select(
      "id, reminder_type, channel, status, created_at, dismissed_at",
    )
    .eq("user_id", userId)
    .is("dismissed_at", null)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return {
      entries: [],
      error: "Reminder history could not be loaded. Refresh and try again.",
    };
  }

  const entries: NotificationDeliveryRow[] = [];
  for (const row of data ?? []) {
    const type = String(row.reminder_type ?? "");
    const status = String(row.status ?? "");
    if (!isReminderType(type) || !isDeliveryStatus(status)) continue;
    entries.push({
      id: String(row.id),
      reminderType: type,
      channel: "email" as NotifyChannel,
      status,
      createdAt: String(row.created_at),
      dismissedAt:
        typeof row.dismissed_at === "string" ? row.dismissed_at : null,
    });
  }

  return { entries, error: null };
}

export async function dismissNotificationHistory(
  deliveryId: string,
): Promise<{ ok: boolean; message: string }> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { ok: false, message: "Sign in to update reminder history." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_deliveries")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .is("dismissed_at", null)
    .select("id");

  if (error || !data?.length) {
    return {
      ok: false,
      message: "That reminder history item could not be cleared.",
    };
  }

  return { ok: true, message: "Reminder history item cleared." };
}
