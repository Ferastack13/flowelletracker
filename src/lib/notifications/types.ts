export const REMINDER_TYPES = [
  "period",
  "ovulation",
  "fertile_window",
  "checkin",
] as const;

export type ReminderType = (typeof REMINDER_TYPES)[number];

export type NotifyChannel = "email";

export type ScheduleStatus =
  | "pending"
  | "processing"
  | "sent"
  | "cancelled"
  | "failed";

export type DeliveryStatus =
  | "queued"
  | "accepted"
  | "delivered"
  | "failed"
  | "bounced";

export interface ReminderPreferences {
  periodReminder: boolean;
  ovulationReminder: boolean;
  fertileWindowReminder: boolean;
  checkinReminder: boolean;
  timezone: string;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  preferredChannel: NotifyChannel;
}

export interface PlannedReminder {
  reminderType: ReminderType;
  channel: NotifyChannel;
  eventDate: string;
  scheduledForIso: string;
  dedupeKey: string;
}

export interface NotificationDeliveryRow {
  id: string;
  reminderType: ReminderType;
  channel: NotifyChannel;
  status: DeliveryStatus;
  createdAt: string;
  dismissedAt: string | null;
}

export const DISCREET_EMAIL_SUBJECT = "You have a new Flowelle reminder.";

export const DISCREET_EMAIL_BODY = `Hello,

You have a personal wellness reminder from Flowelle.

Open your Flowelle dashboard to view your latest cycle information.

Your cycle information remains available inside your account.

With care,
Flowelle`;

export function reminderTypeLabel(type: ReminderType): string {
  switch (type) {
    case "period":
      return "Wellness reminder";
    case "ovulation":
      return "Wellness reminder";
    case "fertile_window":
      return "Wellness reminder";
    case "checkin":
      return "Self-care reminder";
  }
}
