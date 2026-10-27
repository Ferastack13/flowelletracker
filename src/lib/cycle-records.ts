import { isCalendarDate } from "./cycle.ts";

export const PERIOD_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
