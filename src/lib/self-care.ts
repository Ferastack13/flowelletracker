export const SELF_CARE_LOOKBACK_DAYS = 7;

export type SelfCarePillarId =
  | "hydration"
  | "movement"
  | "sleep"
  | "personal-care";

export const SELF_CARE_PILLARS = [
  {
    id: "hydration",
    column: "hydration",
    name: "Hydration",
    detail: "Warm drinks & water",
  },
  {
    id: "movement",
    column: "movement",
    name: "Movement",
    detail: "Gentle body care",
  },
  {
    id: "sleep",
    column: "sleep",
    name: "Sleep",
    detail: "Rest & recovery",
  },
  {
    id: "personal-care",
    column: "personal_care",
    name: "Personal care",
    detail: "Rituals & comfort",
  },
] as const satisfies ReadonlyArray<{
  id: SelfCarePillarId;
  column: "hydration" | "movement" | "sleep" | "personal_care";
  name: string;
  detail: string;
}>;

export interface SelfCareCheckin {
  id: string;
  checkedOn: string;
  hydration: boolean;
  movement: boolean;
  sleep: boolean;
  personalCare: boolean;
}

export interface SelfCarePillarOverview {
  id: SelfCarePillarId;
  name: string;
  detail: string;
  doneToday: boolean;
  doneDays: number;
  lookbackDays: number;
}

const PILLAR_FIELDS: Record<
  SelfCarePillarId,
  keyof Pick<
    SelfCareCheckin,
    "hydration" | "movement" | "sleep" | "personalCare"
  >
> = {
  hydration: "hydration",
  movement: "movement",
  sleep: "sleep",
  "personal-care": "personalCare",
};

export function isSelfCarePillarId(value: string): value is SelfCarePillarId {
  return SELF_CARE_PILLARS.some((pillar) => pillar.id === value);
}

export function formatUtcDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function emptySelfCareCheckin(checkedOn: string): SelfCareCheckin {
  return {
    id: "",
    checkedOn,
    hydration: false,
    movement: false,
    sleep: false,
    personalCare: false,
  };
}

export function checkinForDate(
  checkins: SelfCareCheckin[],
  checkedOn: string,
): SelfCareCheckin {
  return (
    checkins.find((row) => row.checkedOn === checkedOn) ??
    emptySelfCareCheckin(checkedOn)
  );
}

export function pillarDone(
  checkin: SelfCareCheckin,
  pillarId: SelfCarePillarId,
): boolean {
  return checkin[PILLAR_FIELDS[pillarId]];
}

export function countCompletedPillars(checkin: SelfCareCheckin): number {
  return SELF_CARE_PILLARS.filter((pillar) =>
    pillarDone(checkin, pillar.id),
  ).length;
}

export function buildSelfCareOverview(
  checkins: SelfCareCheckin[],
  today: string,
): SelfCarePillarOverview[] {
  const byDate = new Map(checkins.map((row) => [row.checkedOn, row]));

  return SELF_CARE_PILLARS.map((pillar) => {
    let doneDays = 0;
    for (let offset = 0; offset < SELF_CARE_LOOKBACK_DAYS; offset += 1) {
      const date = addCalendarDays(today, -offset);
      const row = byDate.get(date);
      if (row && pillarDone(row, pillar.id)) doneDays += 1;
    }

    const todayRow = byDate.get(today);
    return {
      id: pillar.id,
      name: pillar.name,
      detail: pillar.detail,
      doneToday: todayRow ? pillarDone(todayRow, pillar.id) : false,
      doneDays,
      lookbackDays: SELF_CARE_LOOKBACK_DAYS,
    };
  });
}
