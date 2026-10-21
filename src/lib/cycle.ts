export const ASSUMED_CYCLE_LENGTH_DAYS = 28;

export interface CyclePeriod {
  id: string;
  startedOn: string;
  endedOn: string | null;
}

export interface CycleOverview {
  hasCycleData: boolean;
  currentDay: number | null;
  cycleLength: number;
  lastPeriodStart: string | null;
  lastPeriodEnd: string | null;
  phaseLabel?: string | null;
}

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function utcToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function daysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000);
}

export function buildCycleOverview(periods: CyclePeriod[]): CycleOverview {
  const sorted = [...periods].sort((a, b) =>
    a.startedOn < b.startedOn ? 1 : a.startedOn > b.startedOn ? -1 : 0,
  );
  const latest = sorted[0];

  if (!latest) {
    return {
      hasCycleData: false,
      currentDay: null,
      cycleLength: ASSUMED_CYCLE_LENGTH_DAYS,
      lastPeriodStart: null,
      lastPeriodEnd: null,
      phaseLabel: null,
    };
  }

  const dayIndex = daysBetween(parseIsoDate(latest.startedOn), utcToday()) + 1;

  return {
    hasCycleData: true,
    currentDay: Math.max(1, dayIndex),
    cycleLength: ASSUMED_CYCLE_LENGTH_DAYS,
    lastPeriodStart: latest.startedOn,
    lastPeriodEnd: latest.endedOn,
    phaseLabel: null,
  };
}
