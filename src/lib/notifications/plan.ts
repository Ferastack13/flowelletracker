import type { CyclePeriod } from "../cycle.ts";
import { buildCycleIntelligence } from "../cycle-intelligence.ts";
import {
  adjustForQuietHours,
  addCalendarDaysToDate,
  zonedCalendarDate,
  zonedLocalDateTimeToUtc,
} from "./time.ts";
import type {
  PlannedReminder,
  ReminderPreferences,
  ReminderType,
} from "./types.ts";

const DEFAULT_SEND_HOUR = 9;
const DEFAULT_SEND_MINUTE = 0;
const PERIOD_LEAD_DAYS = 1;
const OVULATION_LEAD_DAYS = 1;

function scheduleLocalMorning(input: {
  calendarDate: string;
  prefs: ReminderPreferences;
}): Date {
  const base = zonedLocalDateTimeToUtc({
    calendarDate: input.calendarDate,
    hour: DEFAULT_SEND_HOUR,
    minute: DEFAULT_SEND_MINUTE,
    timeZone: input.prefs.timezone,
  });
  return adjustForQuietHours({
    scheduledFor: base,
    timeZone: input.prefs.timezone,
    quietHoursStart: input.prefs.quietHoursStart,
    quietHoursEnd: input.prefs.quietHoursEnd,
  });
}

function makeDedupeKey(type: ReminderType, eventDate: string): string {
  return `${type}:${eventDate}:email`;
}

export function planRemindersForUser(input: {
  periods: CyclePeriod[];
  prefs: ReminderPreferences;
  today?: string;
  usualCycleLengthDays?: number | null;
  hasCompletedCheckinToday?: boolean;
  now?: Date;
}): PlannedReminder[] {
  const now = input.now ?? new Date();
  const today =
    input.today ?? zonedCalendarDate(now, input.prefs.timezone);
  const planned: PlannedReminder[] = [];
  const intelligence = buildCycleIntelligence(input.periods, {
    today,
    usualCycleLengthDays: input.usualCycleLengthDays ?? null,
  });

  if (
    input.prefs.periodReminder &&
    intelligence.nextPeriod.status !== "none" &&
    intelligence.nextPeriod.estimatedStart
  ) {
    const eventDate = intelligence.nextPeriod.estimatedStart;
    const sendOn = addCalendarDaysToDate(eventDate, -PERIOD_LEAD_DAYS);
    if (sendOn >= today) {
      const scheduledFor = scheduleLocalMorning({
        calendarDate: sendOn,
        prefs: input.prefs,
      });
      if (scheduledFor.getTime() >= now.getTime() - 60_000) {
        planned.push({
          reminderType: "period",
          channel: "email",
          eventDate,
          scheduledForIso: scheduledFor.toISOString(),
          dedupeKey: makeDedupeKey("period", eventDate),
        });
      }
    }
  }

  if (
    input.prefs.ovulationReminder &&
    intelligence.ovulation.status === "estimated" &&
    intelligence.ovulation.midpoint
  ) {
    const eventDate = intelligence.ovulation.midpoint;
    const sendOn = addCalendarDaysToDate(eventDate, -OVULATION_LEAD_DAYS);
    if (sendOn >= today) {
      const scheduledFor = scheduleLocalMorning({
        calendarDate: sendOn,
        prefs: input.prefs,
      });
      if (scheduledFor.getTime() >= now.getTime() - 60_000) {
        planned.push({
          reminderType: "ovulation",
          channel: "email",
          eventDate,
          scheduledForIso: scheduledFor.toISOString(),
          dedupeKey: makeDedupeKey("ovulation", eventDate),
        });
      }
    }
  }

  if (
    input.prefs.fertileWindowReminder &&
    intelligence.fertileWindow.status === "estimated" &&
    intelligence.fertileWindow.windowStart
  ) {
    const eventDate = intelligence.fertileWindow.windowStart;
    if (eventDate >= today) {
      const scheduledFor = scheduleLocalMorning({
        calendarDate: eventDate,
        prefs: input.prefs,
      });
      if (scheduledFor.getTime() >= now.getTime() - 60_000) {
        planned.push({
          reminderType: "fertile_window",
          channel: "email",
          eventDate,
          scheduledForIso: scheduledFor.toISOString(),
          dedupeKey: makeDedupeKey("fertile_window", eventDate),
        });
      }
    }
  }

  if (input.prefs.checkinReminder && !input.hasCompletedCheckinToday) {
    const scheduledFor = scheduleLocalMorning({
      calendarDate: today,
      prefs: input.prefs,
    });
    if (scheduledFor.getTime() >= now.getTime() - 60_000) {
      planned.push({
        reminderType: "checkin",
        channel: "email",
        eventDate: today,
        scheduledForIso: scheduledFor.toISOString(),
        dedupeKey: makeDedupeKey("checkin", today),
      });
    }
  }

  return planned;
}

export function shouldSkipCheckinReminder(hasCompletedCheckinToday: boolean): boolean {
  return hasCompletedCheckinToday;
}
