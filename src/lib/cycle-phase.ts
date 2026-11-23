import type { CycleIntelligence } from "./cycle-intelligence.ts";

export const CYCLE_PHASES = [
  "menstrual",
  "follicular",
  "ovulation",
  "luteal",
  "unknown",
] as const;

export type CyclePhase = (typeof CYCLE_PHASES)[number];

export interface CyclePhaseResolution {
  phase: CyclePhase;
  label: string;
  detail: string;
  confidence: "none" | "low" | "moderate";
}

function inInclusiveRange(
  today: string,
  start: string | null,
  end: string | null,
): boolean {
  if (!start || !end) return false;
  return today >= start && today <= end;
}

function isMenstruating(intelligence: CycleIntelligence, today: string): boolean {
  const presence = intelligence.overview.periodStatus.presence;
  if (
    presence === "recorded-bleeding" ||
    presence === "started-today" ||
    presence === "end-unknown"
  ) {
    return true;
  }

  const start = intelligence.overview.lastPeriodStart;
  const end = intelligence.overview.lastPeriodEnd;
  if (start && end) {
    return today >= start && today <= end;
  }
  return false;
}

/**
 * Derive a named cycle phase from shared cycle intelligence.
 * Does not invent ovulation or period dates.
 */
export function resolveCyclePhase(
  intelligence: CycleIntelligence,
  today: string,
): CyclePhaseResolution {
  if (!intelligence.overview.hasCycleData) {
    return {
      phase: "unknown",
      label: "Getting to know your cycle",
      detail:
        "Add period dates to personalise phase-aware wellness suggestions. General care tips are still available.",
      confidence: "none",
    };
  }

  if (isMenstruating(intelligence, today)) {
    return {
      phase: "menstrual",
      label: "Menstrual phase",
      detail:
        "Based on your recorded period dates. These wellness ideas are general suggestions, not medical advice.",
      confidence: "moderate",
    };
  }

  const ovulation = intelligence.ovulation;
  if (
    ovulation.status === "estimated" &&
    inInclusiveRange(today, ovulation.windowStart, ovulation.windowEnd)
  ) {
    return {
      phase: "ovulation",
      label: "Estimated ovulation phase",
      detail:
        "This window comes from Flowelle’s shared cycle estimate. Actual ovulation may happen earlier or later.",
      confidence: ovulation.confidence === "moderate" ? "moderate" : "low",
    };
  }

  if (
    ovulation.status === "estimated" &&
    ovulation.windowEnd &&
    today > ovulation.windowEnd
  ) {
    const nextStart = intelligence.nextPeriod.estimatedStart;
    if (!nextStart || today < nextStart) {
      return {
        phase: "luteal",
        label: "Estimated luteal phase",
        detail:
          "Estimated from your cycle information and a typical luteal-phase assumption. Experiences vary.",
        confidence: ovulation.confidence === "moderate" ? "moderate" : "low",
      };
    }
  }

  if (
    intelligence.overview.periodStatus.presence === "cycle-day" ||
    intelligence.overview.currentDay != null
  ) {
    if (ovulation.status === "estimated" && ovulation.windowStart) {
      if (today < ovulation.windowStart) {
        return {
          phase: "follicular",
          label: "Estimated follicular phase",
          detail:
            "Suggested from your cycle day and estimated ovulation window. Not every cycle feels the same.",
          confidence: ovulation.confidence === "moderate" ? "moderate" : "low",
        };
      }
    }

    return {
      phase: "follicular",
      label: "Follicular phase (approximate)",
      detail:
        "You are past recorded bleeding. Without a reliable ovulation estimate, this remains a gentle approximation.",
      confidence: "low",
    };
  }

  return {
    phase: "unknown",
    label: "Phase unclear",
    detail:
      "Flowelle needs clearer period history before naming a cycle phase. General wellness suggestions still apply.",
    confidence: "none",
  };
}

export function cyclePhaseLabel(phase: CyclePhase): string {
  switch (phase) {
    case "menstrual":
      return "Menstrual phase";
    case "follicular":
      return "Follicular phase";
    case "ovulation":
      return "Ovulation phase";
    case "luteal":
      return "Luteal phase";
    case "unknown":
      return "General wellness";
  }
}
