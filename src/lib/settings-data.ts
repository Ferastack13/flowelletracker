export const RECORD_TABLES = [
  "cycle_periods",
  "symptom_logs",
  "self_care_checkins",
  "profiles",
] as const;

export type RecordTable = (typeof RECORD_TABLES)[number];

export interface ExportPeriod {
  id: string;
  startedOn: string;
  endedOn: string | null;
}

export interface ExportSymptom {
  id: string;
  loggedOn: string;
  symptom: string;
  severity: number;
  notes: string | null;
}

export interface ExportCheckin {
  id: string;
  checkedOn: string;
  hydration: boolean;
  movement: boolean;
  sleep: boolean;
  personalCare: boolean;
}

export interface PersonalExport {
  exportedAt: string;
  profile: {
    displayName: string;
    selfCareIntention: string;
    showNextPeriodWindow: boolean;
    hasProfilePhoto: boolean;
  };
  cyclePeriods: ExportPeriod[];
  symptomLogs: ExportSymptom[];
  selfCareCheckins: ExportCheckin[];
}

export function isDeletionConfirmed(value: string): boolean {
  return value.trim() === "DELETE";
}

export function remainingRecordTables(
  counts: Partial<Record<RecordTable, number>>,
): RecordTable[] {
  return RECORD_TABLES.filter((table) => (counts[table] ?? 1) > 0);
}

export function interpretDeletion(counts: Partial<Record<RecordTable, number>>): {
  complete: boolean;
  remaining: RecordTable[];
} {
  const remaining = remainingRecordTables(counts);
  return { complete: remaining.length === 0, remaining };
}

function omitInternalKeys<T extends Record<string, unknown>>(
  row: T,
): Omit<T, "user_id" | "userId"> {
  const { user_id: _userIdSnake, userId: _userIdCamel, ...safe } = row;
  return safe;
}

export function buildPersonalExport(input: {
  exportedAt: string;
  profile: {
    displayName: string;
    selfCareIntention: string;
    showCycleEstimate: boolean;
    photoPath?: string | null;
  };
  cyclePeriods: Array<Record<string, unknown>>;
  symptomLogs: Array<Record<string, unknown>>;
  selfCareCheckins: Array<Record<string, unknown>>;
}): { document: PersonalExport; isEmpty: boolean } {
  const cyclePeriods = input.cyclePeriods.map((row) => {
    const safe = omitInternalKeys(row);
    return {
      id: String(safe.id ?? ""),
      startedOn: String(safe.started_on ?? safe.startedOn ?? ""),
      endedOn:
        typeof safe.ended_on === "string"
          ? safe.ended_on
          : typeof safe.endedOn === "string"
            ? safe.endedOn
            : null,
    };
  });

  const symptomLogs = input.symptomLogs.map((row) => {
    const safe = omitInternalKeys(row);
    return {
      id: String(safe.id ?? ""),
      loggedOn: String(safe.logged_on ?? safe.loggedOn ?? ""),
      symptom: String(safe.symptom ?? ""),
      severity: Number(safe.severity ?? 0),
      notes: typeof safe.notes === "string" ? safe.notes : null,
    };
  });

  const selfCareCheckins = input.selfCareCheckins.map((row) => {
    const safe = omitInternalKeys(row);
    return {
      id: String(safe.id ?? ""),
      checkedOn: String(safe.checked_on ?? safe.checkedOn ?? ""),
      hydration: Boolean(safe.hydration),
      movement: Boolean(safe.movement),
      sleep: Boolean(safe.sleep),
      personalCare: Boolean(safe.personal_care ?? safe.personalCare),
    };
  });

  const document: PersonalExport = {
    exportedAt: input.exportedAt,
    profile: {
      displayName: input.profile.displayName,
      selfCareIntention: input.profile.selfCareIntention,
      showNextPeriodWindow: input.profile.showCycleEstimate,
      hasProfilePhoto: Boolean(input.profile.photoPath),
    },
    cyclePeriods,
    symptomLogs,
    selfCareCheckins,
  };

  const isEmpty =
    !document.profile.displayName &&
    !document.profile.selfCareIntention &&
    document.cyclePeriods.length === 0 &&
    document.symptomLogs.length === 0 &&
    document.selfCareCheckins.length === 0;

  return { document, isEmpty };
}

export function displayInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FL";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}
