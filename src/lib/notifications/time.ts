const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

export function isValidIanaTimeZone(value: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function parseClockTime(
  value: unknown,
): { ok: true; value: string | null } | { ok: false; message: string } {
  if (value == null || value === "") {
    return { ok: true, value: null };
  }
  if (typeof value !== "string") {
    return { ok: false, message: "Choose a valid quiet-hours time." };
  }
  const trimmed = value.trim();
  if (!TIME_PATTERN.test(trimmed)) {
    return { ok: false, message: "Quiet hours must use HH:MM." };
  }
  const match = trimmed.match(TIME_PATTERN);
  if (!match) {
    return { ok: false, message: "Quiet hours must use HH:MM." };
  }
  return { ok: true, value: `${match[1]}:${match[2]}` };
}

export function parseTimezone(
  value: unknown,
): { ok: true; value: string } | { ok: false; message: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { ok: false, message: "Choose a timezone." };
  }
  const trimmed = value.trim();
  if (!isValidIanaTimeZone(trimmed)) {
    return { ok: false, message: "That timezone is not recognised." };
  }
  return { ok: true, value: trimmed };
}

/** Local calendar YYYY-MM-DD for an instant in a timezone. */
export function zonedCalendarDate(isoInstant: string | Date, timeZone: string): string {
  const date = typeof isoInstant === "string" ? new Date(isoInstant) : isoInstant;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: isValidIanaTimeZone(timeZone) ? timeZone : "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: isValidIanaTimeZone(timeZone) ? timeZone : "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

/** Build a UTC Date for a local wall time in a timezone (best-effort). */
export function zonedLocalDateTimeToUtc(input: {
  calendarDate: string;
  hour: number;
  minute: number;
  timeZone: string;
}): Date {
  const [year, month, day] = input.calendarDate.split("-").map(Number);
  const utcGuess = Date.UTC(
    year,
    (month ?? 1) - 1,
    day ?? 1,
    input.hour,
    input.minute,
    0,
  );
  let instant = new Date(utcGuess);
  for (let i = 0; i < 3; i += 1) {
    const local = zonedParts(instant, input.timeZone);
    const desiredAsUtc = Date.UTC(
      year,
      (month ?? 1) - 1,
      day ?? 1,
      input.hour,
      input.minute,
      0,
    );
    const actualAsUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      0,
    );
    instant = new Date(instant.getTime() + (desiredAsUtc - actualAsUtc));
  }
  return instant;
}

export function minutesFromClock(clock: string): number {
  const [hour, minute] = clock.split(":").map(Number);
  return (hour ?? 0) * 60 + (minute ?? 0);
}

export function isWithinQuietHours(input: {
  instant: Date;
  timeZone: string;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}): boolean {
  if (!input.quietHoursStart || !input.quietHoursEnd) return false;
  const local = zonedParts(input.instant, input.timeZone);
  const current = local.hour * 60 + local.minute;
  const start = minutesFromClock(input.quietHoursStart);
  const end = minutesFromClock(input.quietHoursEnd);
  if (start === end) return false;
  if (start < end) {
    return current >= start && current < end;
  }
  return current >= start || current < end;
}

/** If inside quiet hours, push to the next quiet-hours end in local time. */
export function adjustForQuietHours(input: {
  scheduledFor: Date;
  timeZone: string;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}): Date {
  if (
    !isWithinQuietHours({
      instant: input.scheduledFor,
      timeZone: input.timeZone,
      quietHoursStart: input.quietHoursStart,
      quietHoursEnd: input.quietHoursEnd,
    })
  ) {
    return input.scheduledFor;
  }

  const end = input.quietHoursEnd!;
  const [endHour, endMinute] = end.split(":").map(Number);
  const localDate = zonedCalendarDate(input.scheduledFor, input.timeZone);
  let candidate = zonedLocalDateTimeToUtc({
    calendarDate: localDate,
    hour: endHour ?? 0,
    minute: endMinute ?? 0,
    timeZone: input.timeZone,
  });

  if (candidate.getTime() <= input.scheduledFor.getTime()) {
    const nextDay = new Date(input.scheduledFor.getTime() + 86_400_000);
    const nextDate = zonedCalendarDate(nextDay, input.timeZone);
    candidate = zonedLocalDateTimeToUtc({
      calendarDate: nextDate,
      hour: endHour ?? 0,
      minute: endMinute ?? 0,
      timeZone: input.timeZone,
    });
  }

  return candidate;
}

export function addCalendarDaysToDate(calendarDate: string, days: number): string {
  const [year, month, day] = calendarDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
