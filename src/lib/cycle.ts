/** Marketing sample only — never treat this as a personalised cycle length. */
export const ASSUMED_CYCLE_LENGTH_DAYS = 28;

export const USABLE_CYCLE_MIN_DAYS = 14;
export const USABLE_CYCLE_MAX_DAYS = 60;

export const CYCLE_ESTIMATE_DISCLAIMER =
  "This is an approximate window from your recorded period starts. Cycle length varies. It cannot confirm ovulation and is not contraception.";

export interface CyclePeriod {
  id: string;
  startedOn: string;
  endedOn: string | null;
}

export type CycleIntervalStatus =
  | "usable"
  | "too-short"
  | "too-long"
  | "duplicate"
  | "overlapping"
  | "incomplete";

export interface CycleInterval {
  fromPeriodId: string;
  toPeriodId: string;
  fromStart: string;
  toStart: string;
  lengthDays: number;
  status: CycleIntervalStatus;
  usedForEstimate: boolean;
}

export interface CycleHistoryItem {
  period: CyclePeriod;
  followingStart: string | null;
  lengthDays: number | null;
  intervalStatus: CycleIntervalStatus | null;
}

export type NextPeriodEstimateStatus = "none" | "limited" | "approximate";

export interface NextPeriodEstimate {
  status: NextPeriodEstimateStatus;
  reason: string;
  typicalLengthDays: number | null;
  estimatedStart: string | null;
  windowStart: string | null;
  windowEnd: string | null;
  completedCyclesUsed: number;
}

export interface CycleOverview {
  hasCycleData: boolean;
  currentDay: number | null;
  cycleLength: number | null;
  lastPeriodStart: string | null;
  lastPeriodEnd: string | null;
  phaseLabel?: string | null;
  intervals: CycleInterval[];
  history: CycleHistoryItem[];
  estimate: NextPeriodEstimate;
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === (month ?? 1) - 1 &&
    date.getUTCDate() === day
  );
}

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function formatUtcDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addCalendarDays(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return formatUtcDate(date);
}

function daysBetween(start: string, end: string): number {
  return Math.round(
    (parseIsoDate(end).getTime() - parseIsoDate(start).getTime()) /
      86_400_000,
  );
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[middle] ?? null;
  }
  const left = sorted[middle - 1];
  const right = sorted[middle];
  if (left == null || right == null) return null;
  return Math.round((left + right) / 2);
}

function classifyInterval(
  previous: CyclePeriod,
  next: CyclePeriod,
  today: string,
): CycleIntervalStatus {
  const lengthDays = daysBetween(previous.startedOn, next.startedOn);

  if (lengthDays === 0) return "duplicate";
  if (next.startedOn > today) return "incomplete";
  if (
    previous.endedOn &&
    isCalendarDate(previous.endedOn) &&
    previous.endedOn >= previous.startedOn &&
    previous.endedOn > next.startedOn
  ) {
    return "overlapping";
  }
  if (lengthDays < USABLE_CYCLE_MIN_DAYS) return "too-short";
  if (lengthDays > USABLE_CYCLE_MAX_DAYS) return "too-long";
  return "usable";
}

function emptyEstimate(reason: string): NextPeriodEstimate {
  return {
    status: "none",
    reason,
    typicalLengthDays: null,
    estimatedStart: null,
    windowStart: null,
    windowEnd: null,
    completedCyclesUsed: 0,
  };
}

function buildEstimate(
  usable: CycleInterval[],
  lastStart: string | null,
): NextPeriodEstimate {
  if (!lastStart) {
    return emptyEstimate(
      "A recorded period start on or before today is needed before Flowelle can count from your history.",
    );
  }

  if (usable.length === 0) {
    return emptyEstimate(
      "At least two period starts are needed to estimate the next one from your history. Flowelle does not fill the gap with a standard 28-day cycle.",
    );
  }

  const lengths = usable.map((interval) => interval.lengthDays);
  const typicalLengthDays = median(lengths);
  if (typicalLengthDays == null) {
    return emptyEstimate(
      "Your recorded starts could not be turned into a cycle length yet.",
    );
  }

  const shortest = Math.min(...lengths);
  const longest = Math.max(...lengths);
  const estimatedStart = addCalendarDays(lastStart, typicalLengthDays);
  const padding = usable.length === 1 ? 2 : longest === shortest ? 1 : 0;
  const windowStart = addCalendarDays(lastStart, shortest - padding);
  const windowEnd = addCalendarDays(lastStart, longest + padding);

  if (usable.length === 1) {
    return {
      status: "limited",
      reason:
        "This window uses only one completed cycle. Another start date will make the estimate less fragile.",
      typicalLengthDays,
      estimatedStart,
      windowStart,
      windowEnd,
      completedCyclesUsed: 1,
    };
  }

  return {
    status: "approximate",
    reason:
      longest - shortest >= 7
        ? "Your recorded cycles vary, so this is a window rather than a single date."
        : "This window uses the median of your recorded cycle lengths.",
    typicalLengthDays,
    estimatedStart,
    windowStart,
    windowEnd,
    completedCyclesUsed: usable.length,
  };
}

function emptyOverview(estimateReason: string): CycleOverview {
  return {
    hasCycleData: false,
    currentDay: null,
    cycleLength: null,
    lastPeriodStart: null,
    lastPeriodEnd: null,
    phaseLabel: null,
    intervals: [],
    history: [],
    estimate: emptyEstimate(estimateReason),
  };
}

export function referenceDateToday(): string {
  return formatUtcDate(new Date());
}

export function intervalStatusLabel(status: CycleIntervalStatus): string {
  switch (status) {
    case "usable":
      return "Used for the estimate";
    case "too-short":
      return "Unusually short — not used for the estimate";
    case "too-long":
      return "Unusually long — not used for the estimate";
    case "duplicate":
      return "Same start date — not used for the estimate";
    case "overlapping":
      return "Overlaps the next start — not used for the estimate";
    case "incomplete":
      return "Includes a future start — not used for the estimate";
  }
}

export function buildCycleOverview(
  periods: CyclePeriod[],
  today: string = referenceDateToday(),
): CycleOverview {
  const valid = periods
    .filter((period) => isCalendarDate(period.startedOn))
    .map((period) => ({
      ...period,
      endedOn:
        period.endedOn && isCalendarDate(period.endedOn)
          ? period.endedOn
          : null,
    }));

  if (valid.length === 0) {
    return emptyOverview(
      "Log at least two period starts to estimate the next one from your history. Flowelle does not assume a 28-day cycle for you.",
    );
  }

  const chronological = [...valid].sort((a, b) => {
    if (a.startedOn === b.startedOn) return a.id.localeCompare(b.id);
    return a.startedOn < b.startedOn ? -1 : 1;
  });

  const intervals: CycleInterval[] = [];
  for (let index = 0; index < chronological.length - 1; index += 1) {
    const previous = chronological[index];
    const next = chronological[index + 1];
    if (!previous || !next) continue;

    const lengthDays = daysBetween(previous.startedOn, next.startedOn);
    const status = classifyInterval(previous, next, today);
    intervals.push({
      fromPeriodId: previous.id,
      toPeriodId: next.id,
      fromStart: previous.startedOn,
      toStart: next.startedOn,
      lengthDays,
      status,
      usedForEstimate: status === "usable",
    });
  }

  const usable = intervals.filter((interval) => interval.usedForEstimate);
  const lastRecorded = [...chronological]
    .reverse()
    .find((period) => period.startedOn <= today);
  const estimate = buildEstimate(usable, lastRecorded?.startedOn ?? null);

  if (!usable.length && lastRecorded && chronological.length === 1) {
    estimate.reason =
      "Only one period start is recorded. Log another start to estimate the next period from your history. Flowelle does not assume a 28-day cycle for you.";
  } else if (!usable.length && intervals.length > 0) {
    estimate.reason =
      "Your recorded starts are too close, too far apart, overlapping, duplicated, or still in the future, so Flowelle is not estimating a next period from them.";
  }

  const intervalByFromId = new Map(
    intervals.map((interval) => [interval.fromPeriodId, interval]),
  );
  const history: CycleHistoryItem[] = [...chronological].reverse().map((period) => {
    const interval = intervalByFromId.get(period.id);
    return {
      period,
      followingStart: interval?.toStart ?? null,
      lengthDays: interval?.lengthDays ?? null,
      intervalStatus: interval?.status ?? null,
    };
  });

  const currentDay = lastRecorded
    ? Math.max(1, daysBetween(lastRecorded.startedOn, today) + 1)
    : null;

  return {
    hasCycleData: true,
    currentDay,
    cycleLength: estimate.typicalLengthDays,
    lastPeriodStart: lastRecorded?.startedOn ?? null,
    lastPeriodEnd: lastRecorded?.endedOn ?? null,
    phaseLabel: null,
    intervals,
    history,
    estimate,
  };
}
