import { isCalendarDate } from "./cycle.ts";
import { readCalendarDate } from "./cycle-records.ts";

export const BLEEDING_INTENSITIES = [
  "none",
  "spotting",
  "light",
  "medium",
  "heavy",
] as const;

export type BleedingIntensity = (typeof BLEEDING_INTENSITIES)[number];

export interface PeriodBleedingLog {
  id: string;
  periodId: string;
  loggedOn: string;
  intensity: BleedingIntensity;
}

export const BLEEDING_INTENSITY_OPTIONS: Array<{
  id: BleedingIntensity;
  label: string;
}> = [
  { id: "none", label: "No bleeding" },
  { id: "spotting", label: "Spotting" },
  { id: "light", label: "Light" },
  { id: "medium", label: "Medium" },
  { id: "heavy", label: "Heavy" },
];

export function isBleedingIntensity(value: unknown): value is BleedingIntensity {
  return (
    typeof value === "string" &&
    (BLEEDING_INTENSITIES as readonly string[]).includes(value)
  );
}

export function bleedingIntensityLabel(intensity: BleedingIntensity): string {
  return (
    BLEEDING_INTENSITY_OPTIONS.find((option) => option.id === intensity)
      ?.label ?? intensity
  );
}

export function isBleedingDateInPeriod(input: {
  loggedOn: string;
  startedOn: string;
  endedOn: string | null;
  today?: string;
}): boolean {
  const { loggedOn, startedOn, endedOn, today } = input;
  if (!isCalendarDate(loggedOn) || !isCalendarDate(startedOn)) return false;
  if (loggedOn < startedOn) return false;
  if (endedOn != null) {
    if (!isCalendarDate(endedOn)) return false;
    return loggedOn <= endedOn;
  }
  if (today != null && isCalendarDate(today)) {
    return loggedOn <= today;
  }
  return true;
}

export function parseBleedingWrite(input: {
  periodId: unknown;
  loggedOn: unknown;
  intensity: unknown;
}):
  | {
      ok: true;
      periodId: string;
      loggedOn: string;
      intensity: BleedingIntensity;
    }
  | { ok: false; message: string } {
  const periodId =
    typeof input.periodId === "string" ? input.periodId.trim() : "";
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      periodId,
    )
  ) {
    return { ok: false, message: "Choose a period for this bleeding day." };
  }

  const loggedOn = readCalendarDate(input.loggedOn);
  if (!loggedOn) {
    return { ok: false, message: "Choose a date for this bleeding day." };
  }

  if (!isBleedingIntensity(input.intensity)) {
    return {
      ok: false,
      message: "Choose no bleeding, spotting, light, medium, or heavy.",
    };
  }

  return {
    ok: true,
    periodId,
    loggedOn,
    intensity: input.intensity,
  };
}

export function bleedingWriteErrorMessage(code: string | undefined): string {
  if (code === "23505") {
    return "That day already has a bleeding record for this period. Edit it instead.";
  }
  if (code === "23514") {
    return "That bleeding day could not be saved. Check the date and intensity.";
  }
  return "That bleeding day could not be saved. Try again.";
}
