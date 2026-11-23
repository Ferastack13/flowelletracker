import type { CyclePeriod } from "../cycle.ts";
import { buildCycleIntelligence } from "../cycle-intelligence.ts";
import { resolveCyclePhase, type CyclePhaseResolution } from "../cycle-phase.ts";
import type { SymptomId, SymptomLog } from "../symptoms.ts";
import {
  buildPersonalizedRecommendations,
  wellnessProgress,
  type PersonalizedRecommendation,
} from "./recommendations.ts";

export interface DailyWellnessPlan {
  today: string;
  phase: CyclePhaseResolution;
  recommendations: PersonalizedRecommendation[];
  progress: { total: number; completed: number; percent: number };
  recordedSymptoms: SymptomId[];
}

export function symptomsForLocalDate(
  entries: readonly SymptomLog[],
  localDate: string,
): SymptomId[] {
  const ids = new Set<SymptomId>();
  for (const entry of entries) {
    if (entry.loggedOn === localDate) {
      ids.add(entry.symptom);
    }
  }
  return [...ids];
}

export function buildDailyWellnessPlan(input: {
  periods: CyclePeriod[];
  today: string;
  usualCycleLengthDays?: number | null;
  symptomEntries: readonly SymptomLog[];
  completedIds?: readonly string[];
  limit?: number;
}): DailyWellnessPlan {
  const intelligence = buildCycleIntelligence(input.periods, {
    today: input.today,
    usualCycleLengthDays: input.usualCycleLengthDays ?? null,
  });
  const phase = resolveCyclePhase(intelligence, input.today);
  const recordedSymptoms = symptomsForLocalDate(
    input.symptomEntries,
    input.today,
  );
  const recommendations = buildPersonalizedRecommendations({
    phase: phase.phase,
    recordedSymptoms,
    completedIds: input.completedIds,
    limit: input.limit,
  });

  return {
    today: input.today,
    phase,
    recommendations,
    progress: wellnessProgress(recommendations),
    recordedSymptoms,
  };
}
