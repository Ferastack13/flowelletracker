import { hasAdminClientConfig } from "@/lib/supabase/admin";

/** Best-effort reminder resync after cycle or preference changes. */
export async function safeResyncUserReminders(userId: string): Promise<void> {
  if (!hasAdminClientConfig()) return;
  try {
    const { resyncUserReminders } = await import("@/lib/notifications/sync");
    await resyncUserReminders(userId);
  } catch {
    // Never block the user-facing save path on reminder sync failures.
  }
}
