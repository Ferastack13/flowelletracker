import { isCalendarDate, type CyclePeriod } from "./cycle.ts";

export const PERIOD_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const OPEN_PERIOD_SENTINEL = "9999-12-31";

export function readCalendarDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return isCalendarDate(trimmed) ? trimmed : null;
}

export function isValidPeriodRange(
  startedOn: string,
  endedOn: string | null,
): boolean {
  if (!isCalendarDate(startedOn)) return false;
  if (endedOn == null) return true;
  return isCalendarDate(endedOn) && endedOn >= startedOn;
}

/** Inclusive bleeding days from start to end. Null while the period is ongoing. */
export function periodDurationDays(
  startedOn: string,
  endedOn: string | null,
): number | null {
  if (!isCalendarDate(startedOn)) return null;
  if (endedOn == null || !isCalendarDate(endedOn) || endedOn < startedOn) {
    return null;
  }
  const [startYear, startMonth, startDay] = startedOn.split("-").map(Number);
  const [endYear, endMonth, endDay] = endedOn.split("-").map(Number);
  const start = Date.UTC(startYear, (startMonth ?? 1) - 1, startDay ?? 1);
  const end = Date.UTC(endYear, (endMonth ?? 1) - 1, endDay ?? 1);
  return Math.round((end - start) / 86_400_000) + 1;
}

export function periodsOverlap(
  a: { startedOn: string; endedOn: string | null },
  b: { startedOn: string; endedOn: string | null },
): boolean {
  if (!isCalendarDate(a.startedOn) || !isCalendarDate(b.startedOn)) {
    return false;
  }
  const aEnd =
    a.endedOn && isCalendarDate(a.endedOn) ? a.endedOn : OPEN_PERIOD_SENTINEL;
  const bEnd =
    b.endedOn && isCalendarDate(b.endedOn) ? b.endedOn : OPEN_PERIOD_SENTINEL;
  return a.startedOn <= bEnd && b.startedOn <= aEnd;
}

export function findOverlappingPeriod(
  periods: CyclePeriod[],
  candidate: { startedOn: string; endedOn: string | null },
  excludeId?: string | null,
): CyclePeriod | null {
  for (const period of periods) {
    if (excludeId && period.id === excludeId) continue;
    if (periodsOverlap(period, candidate)) return period;
  }
  return null;
}

export function overlapConflictMessage(other: CyclePeriod): string {
  if (other.endedOn) {
    return `This overlaps the period from ${other.startedOn} to ${other.endedOn}. Change the dates or edit that record first.`;
  }
  return `This overlaps an ongoing period that started on ${other.startedOn}. End or edit that record first.`;
}

export function parsePeriodWrite(input: {
  startedOn: unknown;
  endedOn?: unknown;
}):
  | { ok: true; startedOn: string; endedOn: string | null }
  | { ok: false; message: string } {
  const startedOn = readCalendarDate(input.startedOn);
  if (!startedOn) {
    return { ok: false, message: "Choose a start date." };
  }

  const rawEnd = input.endedOn;
  const endedOn =
    rawEnd == null || rawEnd === ""
      ? null
      : readCalendarDate(rawEnd);

  if (rawEnd != null && rawEnd !== "" && !endedOn) {
    return { ok: false, message: "Choose a valid end date." };
  }

  if (!isValidPeriodRange(startedOn, endedOn)) {
    return {
      ok: false,
      message: "The end date must be on or after the start.",
    };
  }

  return { ok: true, startedOn, endedOn };
}

export function parsePeriodId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return PERIOD_ID_PATTERN.test(trimmed) ? trimmed : null;
}

export function periodWriteErrorMessage(code: string | undefined): string {
  if (code === "23505") {
    return "That start date is already saved.";
  }
  if (code === "23514") {
    return "The end date must be on or after the start.";
  }
  return "That period could not be saved. Try again.";
}
