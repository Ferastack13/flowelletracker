import {
  buildCycleOverview,
  isCalendarDate,
  referenceDateToday,
  type CycleOverview,
  type CyclePeriod,
  type NextPeriodEstimate,
} from "./cycle.ts";
import { periodDurationDays } from "./cycle-records.ts";
import { addCalendarDays } from "./self-care.ts";

/** Assumed luteal-phase length used when estimating ovulation from next period. */
export const DEFAULT_LUTEAL_PHASE_DAYS = 14;

/** Days before ovulation included in the estimated fertile window. */
export const FERTILE_DAYS_BEFORE_OVULATION = 5;

export const USUAL_CYCLE_LENGTH_MIN = 14;
export const USUAL_CYCLE_LENGTH_MAX = 60;

export type PredictionSource = "history" | "reported" | "none";
export type PredictionConfidence = "none" | "low" | "moderate";

export interface PersonalizedNextPeriod {
  status: "none" | "reported" | "limited" | "approximate";
  source: PredictionSource;
  reason: string;
  typicalLengthDays: number | null;
  estimatedStart: string | null;
  windowStart: string | null;
  windowEnd: string | null;
  completedCyclesUsed: number;
  daysUntil: number | null;
}

export interface OvulationEstimate {
  status: "none" | "estimated";
  confidence: PredictionConfidence;
  windowStart: string | null;
  windowEnd: string | null;
  midpoint: string | null;
  reason: string;
  lutealPhaseDays: number;
}

export interface FertileWindowEstimate {
  status: "none" | "estimated";
  confidence: PredictionConfidence;
  windowStart: string | null;
  windowEnd: string | null;
  reason: string;
}

export interface CycleStatistics {
  usableCycleCount: number;
  averageCycleLength: number | null;
  shortestCycleLength: number | null;
  longestCycleLength: number | null;
  cycleVariabilityDays: number | null;
  completedPeriodCount: number;
  averagePeriodDuration: number | null;
  shortestPeriodDuration: number | null;
  longestPeriodDuration: number | null;
}

export interface CycleInsight {
  id: string;
  title: string;
  detail: string;
}

export interface CycleIntelligence {
  overview: CycleOverview;
  nextPeriod: PersonalizedNextPeriod;
  ovulation: OvulationEstimate;
  fertileWindow: FertileWindowEstimate;
  statistics: CycleStatistics;
  insights: CycleInsight[];
  progressPercent: number | null;
  irregular: boolean;
}

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function daysBetween(start: string, end: string): number {
  return Math.round(
    (parseIsoDate(end).getTime() - parseIsoDate(start).getTime()) /
      86_400_000,
  );
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

export function isUsualCycleLength(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= USUAL_CYCLE_LENGTH_MIN &&
    value <= USUAL_CYCLE_LENGTH_MAX
  );
}

export function parseUsualCycleLength(
  value: unknown,
): { ok: true; value: number | null } | { ok: false; message: string } {
  if (value == null || value === "" || value === "unknown") {
    return { ok: true, value: null };
  }
  const numeric =
    typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(numeric)) {
    return {
      ok: false,
      message: "Usual cycle length must be a whole number of days, or unknown.",
    };
  }
  if (!isUsualCycleLength(numeric)) {
    return {
      ok: false,
      message: `Usual cycle length must be between ${USUAL_CYCLE_LENGTH_MIN} and ${USUAL_CYCLE_LENGTH_MAX} days, or unknown.`,
    };
  }
  return { ok: true, value: numeric };
}

function emptyNextPeriod(reason: string): PersonalizedNextPeriod {
  return {
    status: "none",
    source: "none",
    reason,
    typicalLengthDays: null,
    estimatedStart: null,
    windowStart: null,
    windowEnd: null,
    completedCyclesUsed: 0,
    daysUntil: null,
  };
}

function withDaysUntil(
  estimate: Omit<PersonalizedNextPeriod, "daysUntil">,
  today: string,
): PersonalizedNextPeriod {
  if (!estimate.estimatedStart || !isCalendarDate(today)) {
    return { ...estimate, daysUntil: null };
  }
  return {
    ...estimate,
    daysUntil: daysBetween(today, estimate.estimatedStart),
  };
}

function fromHistoryEstimate(
  estimate: NextPeriodEstimate,
  today: string,
): PersonalizedNextPeriod {
  if (estimate.status === "none") {
    return emptyNextPeriod(estimate.reason);
  }
  return withDaysUntil(
    {
      status: estimate.status,
      source: "history",
      reason: estimate.reason,
      typicalLengthDays: estimate.typicalLengthDays,
      estimatedStart: estimate.estimatedStart,
      windowStart: estimate.windowStart,
      windowEnd: estimate.windowEnd,
      completedCyclesUsed: estimate.completedCyclesUsed,
    },
    today,
  );
}

function fromReportedLength(
  lastStart: string,
  usualCycleLengthDays: number,
  today: string,
): PersonalizedNextPeriod {
  const estimatedStart = addCalendarDays(lastStart, usualCycleLengthDays);
  return withDaysUntil(
    {
      status: "reported",
      source: "reported",
      reason:
        "This initial estimate uses the usual cycle length you reported. It is not yet based on multiple recorded cycles.",
      typicalLengthDays: usualCycleLengthDays,
      estimatedStart,
      windowStart: addCalendarDays(estimatedStart, -2),
      windowEnd: addCalendarDays(estimatedStart, 2),
      completedCyclesUsed: 0,
    },
    today,
  );
}

export function resolveNextPeriodEstimate(input: {
  overview: CycleOverview;
  usualCycleLengthDays: number | null;
  today: string;
}): PersonalizedNextPeriod {
  const { overview, usualCycleLengthDays, today } = input;
  if (overview.estimate.status !== "none") {
    return fromHistoryEstimate(overview.estimate, today);
  }

  if (
    usualCycleLengthDays != null &&
    isUsualCycleLength(usualCycleLengthDays) &&
    overview.lastPeriodStart
  ) {
    return fromReportedLength(
      overview.lastPeriodStart,
      usualCycleLengthDays,
      today,
    );
  }

  if (!overview.hasCycleData) {
    return emptyNextPeriod(
      "Log a recent period start to begin. Flowelle will not invent a 28-day cycle for you.",
    );
  }

  if (usualCycleLengthDays == null) {
    return emptyNextPeriod(
      "More recorded period starts are needed before Flowelle can estimate your next period. You can also add a usual cycle length in setup if you know it.",
    );
  }

  return emptyNextPeriod(overview.estimate.reason);
}

export function estimateOvulation(input: {
  nextPeriod: PersonalizedNextPeriod;
  lutealPhaseDays?: number;
  irregular: boolean;
}): OvulationEstimate {
  const lutealPhaseDays = input.lutealPhaseDays ?? DEFAULT_LUTEAL_PHASE_DAYS;
  const { nextPeriod, irregular } = input;

  if (
    nextPeriod.status === "none" ||
    !nextPeriod.estimatedStart ||
    nextPeriod.source === "none"
  ) {
    return {
      status: "none",
      confidence: "none",
      windowStart: null,
      windowEnd: null,
      midpoint: null,
      reason:
        "We need more cycle history before we can estimate your ovulation window.",
      lutealPhaseDays,
    };
  }

  if (irregular && nextPeriod.source === "history") {
    return {
      status: "none",
      confidence: "none",
      windowStart: null,
      windowEnd: null,
      midpoint: null,
      reason:
        "Your recorded cycles vary enough that an ovulation estimate would be unreliable right now.",
      lutealPhaseDays,
    };
  }

  const pad = nextPeriod.source === "reported" || nextPeriod.status === "limited" ? 1 : 1;
  const midpoint = addCalendarDays(nextPeriod.estimatedStart, -lutealPhaseDays);
  const windowStart = addCalendarDays(midpoint, -pad);
  const windowEnd = addCalendarDays(midpoint, pad);
  const confidence: PredictionConfidence =
    nextPeriod.source === "history" && nextPeriod.status === "approximate"
      ? "moderate"
      : "low";

  return {
    status: "estimated",
    confidence,
    windowStart,
    windowEnd,
    midpoint,
    reason:
      "This is a prediction based on your cycle information and a typical luteal-phase assumption. Actual ovulation may happen earlier or later. Flowelle cannot confirm ovulation.",
    lutealPhaseDays,
  };
}

export function estimateFertileWindow(input: {
  ovulation: OvulationEstimate;
  daysBefore?: number;
}): FertileWindowEstimate {
  const daysBefore = input.daysBefore ?? FERTILE_DAYS_BEFORE_OVULATION;
  const { ovulation } = input;

  if (
    ovulation.status !== "estimated" ||
    !ovulation.windowStart ||
    !ovulation.windowEnd
  ) {
    return {
      status: "none",
      confidence: "none",
      windowStart: null,
      windowEnd: null,
      reason:
        "We need more cycle history before we can estimate a fertile window.",
    };
  }

  return {
    status: "estimated",
    confidence: ovulation.confidence,
    windowStart: addCalendarDays(ovulation.windowStart, -daysBefore),
    windowEnd: ovulation.windowEnd,
    reason:
      "This estimated window includes the days before and around predicted ovulation. It is for cycle awareness only — not contraception, and not a confirmation of fertility.",
  };
}

export function buildCycleStatistics(input: {
  overview: CycleOverview;
  periods: CyclePeriod[];
}): CycleStatistics {
  const usable = input.overview.intervals.filter(
    (interval) => interval.usedForEstimate,
  );
  const lengths = usable.map((interval) => interval.lengthDays);
  const durations = input.periods
    .map((period) => periodDurationDays(period.startedOn, period.endedOn))
    .filter((value): value is number => value != null);

  return {
    usableCycleCount: lengths.length,
    averageCycleLength: average(lengths),
    shortestCycleLength: lengths.length ? Math.min(...lengths) : null,
    longestCycleLength: lengths.length ? Math.max(...lengths) : null,
    cycleVariabilityDays:
      lengths.length >= 2
        ? Math.max(...lengths) - Math.min(...lengths)
        : lengths.length === 1
          ? 0
          : null,
    completedPeriodCount: durations.length,
    averagePeriodDuration: average(durations),
    shortestPeriodDuration: durations.length ? Math.min(...durations) : null,
    longestPeriodDuration: durations.length ? Math.max(...durations) : null,
  };
}

export function selectCycleInsights(input: {
  overview: CycleOverview;
  nextPeriod: PersonalizedNextPeriod;
  fertileWindow: FertileWindowEstimate;
  statistics: CycleStatistics;
  irregular: boolean;
}): CycleInsight[] {
  const insights: CycleInsight[] = [];
  const {
    overview,
    nextPeriod,
    fertileWindow,
    statistics,
    irregular,
  } = input;

  if (!overview.hasCycleData) {
    insights.push({
      id: "no-period",
      title: "Start with one period record",
      detail:
        "Log your most recent period dates so Flowelle can begin personalising your overview.",
    });
    return insights;
  }

  const presence = overview.periodStatus.presence;
  if (presence === "started-today" || presence === "recorded-bleeding") {
    insights.push({
      id: "ongoing-period",
      title: "Your period is recorded as ongoing",
      detail:
        "Add daily bleeding intensity if you like, and mark an end date when bleeding stops.",
    });
  }

  if (
    nextPeriod.daysUntil != null &&
    nextPeriod.daysUntil >= 0 &&
    nextPeriod.daysUntil <= 5 &&
    nextPeriod.status !== "none"
  ) {
    insights.push({
      id: "period-approaching",
      title: "Your estimated period may be approaching",
      detail:
        nextPeriod.daysUntil === 0
          ? "Your estimated next period may be around today. This is still only an estimate."
          : `Your estimated next period may be about ${nextPeriod.daysUntil} day${nextPeriod.daysUntil === 1 ? "" : "s"} away.`,
    });
  }

  if (fertileWindow.status === "estimated" && fertileWindow.windowStart) {
    insights.push({
      id: "fertile-approaching",
      title: "Your estimated fertile window may be near",
      detail:
        "This is a calendar estimate for awareness only. It cannot confirm fertility or replace clinical advice.",
    });
  }

  if (irregular) {
    insights.push({
      id: "variable-cycles",
      title: "Your recorded cycles have been varying",
      detail:
        "Estimates may be less precise while recorded lengths differ. Your history is still saved.",
    });
  }

  if (
    overview.hasCycleData &&
    statistics.usableCycleCount < 2 &&
    nextPeriod.source !== "reported"
  ) {
    insights.push({
      id: "need-history",
      title: "More cycle history will improve estimates",
      detail:
        "Another recorded period start helps Flowelle learn from your pattern instead of a single interval.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "steady",
      title: "Your records are guiding this overview",
      detail:
        "Flowelle uses your saved period starts for estimates and will update when you add new ones.",
    });
  }

  return insights.slice(0, 3);
}

export function buildCycleIntelligence(
  periods: CyclePeriod[],
  options: {
    today?: string;
    usualCycleLengthDays?: number | null;
    lutealPhaseDays?: number;
  } = {},
): CycleIntelligence {
  const today = options.today ?? referenceDateToday();
  const usualCycleLengthDays = options.usualCycleLengthDays ?? null;
  const lutealPhaseDays =
    options.lutealPhaseDays ?? DEFAULT_LUTEAL_PHASE_DAYS;

  const overview = buildCycleOverview(periods, today);
  const statistics = buildCycleStatistics({ overview, periods });
  const irregular =
    statistics.cycleVariabilityDays != null &&
    statistics.cycleVariabilityDays >= 7;

  const nextPeriod = resolveNextPeriodEstimate({
    overview,
    usualCycleLengthDays,
    today,
  });
  const ovulation = estimateOvulation({
    nextPeriod,
    lutealPhaseDays,
    irregular,
  });
  const fertileWindow = estimateFertileWindow({ ovulation });
  const insights = selectCycleInsights({
    overview,
    nextPeriod,
    fertileWindow,
    statistics,
    irregular,
  });

  const day = overview.periodStatus.cycleDay ?? overview.currentDay;
  const length = nextPeriod.typicalLengthDays;
  const progressPercent =
    day != null && length != null && length > 0
      ? Math.min(100, Math.round((day / length) * 100))
      : null;

  return {
    overview,
    nextPeriod,
    ovulation,
    fertileWindow,
    statistics,
    insights,
    progressPercent,
    irregular,
  };
}
