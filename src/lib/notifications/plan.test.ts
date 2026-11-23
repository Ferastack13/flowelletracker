import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CyclePeriod } from "../cycle.ts";
import { planRemindersForUser, shouldSkipCheckinReminder } from "./plan.ts";
import type { ReminderPreferences } from "./types.ts";
import {
  adjustForQuietHours,
  isWithinQuietHours,
  parseClockTime,
  parseTimezone,
} from "./time.ts";
import { buildReminderEmail, sendReminderEmail } from "./email.ts";

function period(
  id: string,
  startedOn: string,
  endedOn: string | null = null,
): CyclePeriod {
  return { id, startedOn, endedOn };
}

const basePrefs: ReminderPreferences = {
  periodReminder: true,
  ovulationReminder: true,
  fertileWindowReminder: true,
  checkinReminder: true,
  timezone: "UTC",
  quietHoursStart: null,
  quietHoursEnd: null,
  preferredChannel: "email",
};

describe("planRemindersForUser", () => {
  it("schedules period, ovulation, and fertile reminders from shared intelligence", () => {
    const planned = planRemindersForUser({
      periods: [
        period("a", "2026-01-01", "2026-01-05"),
        period("b", "2026-01-29", "2026-02-02"),
      ],
      prefs: basePrefs,
      today: "2026-02-01",
      now: new Date("2026-02-01T08:00:00.000Z"),
    });

    const types = planned.map((item) => item.reminderType).sort();
    assert.deepEqual(
      types,
      ["checkin", "fertile_window", "ovulation", "period"].sort(),
    );
    assert.ok(planned.every((item) => item.channel === "email"));
  });

  it("does not schedule disabled reminders", () => {
    const planned = planRemindersForUser({
      periods: [
        period("a", "2026-01-01", "2026-01-05"),
        period("b", "2026-01-29", "2026-02-02"),
      ],
      prefs: {
        ...basePrefs,
        periodReminder: false,
        ovulationReminder: false,
        fertileWindowReminder: false,
        checkinReminder: false,
      },
      today: "2026-02-10",
      now: new Date("2026-02-10T08:00:00.000Z"),
    });
    assert.equal(planned.length, 0);
  });

  it("skips cycle reminders when history is insufficient", () => {
    const planned = planRemindersForUser({
      periods: [period("a", "2026-11-06")],
      prefs: {
        ...basePrefs,
        checkinReminder: false,
      },
      today: "2026-11-20",
      usualCycleLengthDays: null,
      now: new Date("2026-11-20T08:00:00.000Z"),
    });
    assert.equal(planned.length, 0);
  });

  it("skips check-in reminder after the day is already completed", () => {
    assert.equal(shouldSkipCheckinReminder(true), true);
    const planned = planRemindersForUser({
      periods: [],
      prefs: {
        ...basePrefs,
        periodReminder: false,
        ovulationReminder: false,
        fertileWindowReminder: false,
        checkinReminder: true,
      },
      today: "2026-11-20",
      hasCompletedCheckinToday: true,
      now: new Date("2026-11-20T08:00:00.000Z"),
    });
    assert.equal(planned.length, 0);
  });

  it("catches up a missed morning check-in later the same day", () => {
    const now = new Date("2026-11-20T15:30:00.000Z");
    const planned = planRemindersForUser({
      periods: [],
      prefs: {
        ...basePrefs,
        periodReminder: false,
        ovulationReminder: false,
        fertileWindowReminder: false,
        checkinReminder: true,
      },
      today: "2026-11-20",
      hasCompletedCheckinToday: false,
      now,
    });
    assert.equal(planned.length, 1);
    assert.equal(planned[0]?.reminderType, "checkin");
    assert.equal(planned[0]?.eventDate, "2026-11-20");
    assert.ok(
      new Date(planned[0]!.scheduledForIso).getTime() >= now.getTime() - 60_000,
    );
  });
});

describe("quiet hours and timezone parsing", () => {
  it("parses timezone and clock values", () => {
    assert.equal(parseTimezone("Africa/Lagos").ok, true);
    assert.equal(parseTimezone("Not/AZone").ok, false);
    assert.deepEqual(parseClockTime("22:30"), { ok: true, value: "22:30" });
  });

  it("defers delivery while inside quiet hours", () => {
    const inside = new Date("2026-11-20T23:15:00.000Z");
    assert.equal(
      isWithinQuietHours({
        instant: inside,
        timeZone: "UTC",
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
      }),
      true,
    );
    const adjusted = adjustForQuietHours({
      scheduledFor: inside,
      timeZone: "UTC",
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    });
    assert.ok(adjusted.getTime() > inside.getTime());
  });
});

describe("email provider helpers", () => {
  it("keeps reminder subjects discreet", () => {
    const message = buildReminderEmail("period");
    assert.match(message.subject, /Flowelle reminder/i);
    assert.doesNotMatch(message.subject, /period|ovulation|fertile/i);
  });

  it("fails closed without credentials", async () => {
    const previousKey = process.env.RESEND_API_KEY;
    const previousFrom = process.env.RESEND_FROM_EMAIL;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    const result = await sendReminderEmail({
      to: "person@example.com",
      reminderType: "checkin",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.errorCategory, "missing_credentials");
    }
    if (previousKey) process.env.RESEND_API_KEY = previousKey;
    if (previousFrom) process.env.RESEND_FROM_EMAIL = previousFrom;
  });

  it("records provider acceptance through a mocked fetch", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "Flowelle <reminders@example.com>";
    const result = await sendReminderEmail({
      to: "person@example.com",
      reminderType: "period",
      fetchImpl: async () =>
        new Response(JSON.stringify({ id: "msg_123" }), { status: 200 }),
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.providerMessageId, "msg_123");
    }
  });
});
