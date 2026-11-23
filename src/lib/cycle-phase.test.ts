import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CyclePeriod } from "./cycle.ts";
import { buildCycleIntelligence } from "./cycle-intelligence.ts";
import { resolveCyclePhase } from "./cycle-phase.ts";

function period(
  id: string,
  startedOn: string,
  endedOn: string | null = null,
): CyclePeriod {
  return { id, startedOn, endedOn };
}

describe("resolveCyclePhase", () => {
  it("marks menstrual phase while bleeding is recorded", () => {
    const intelligence = buildCycleIntelligence(
      [period("a", "2026-11-20", "2026-11-24")],
      { today: "2026-11-22", usualCycleLengthDays: 28 },
    );
    const phase = resolveCyclePhase(intelligence, "2026-11-22");
    assert.equal(phase.phase, "menstrual");
  });

  it("marks estimated ovulation when today falls in the ovulation window", () => {
    const intelligence = buildCycleIntelligence(
      [
        period("a", "2026-01-01", "2026-01-05"),
        period("b", "2026-01-29", "2026-02-02"),
      ],
      { today: "2026-02-12", usualCycleLengthDays: 28 },
    );
    const phase = resolveCyclePhase(intelligence, "2026-02-12");
    assert.equal(phase.phase, "ovulation");
  });

  it("returns unknown without cycle history", () => {
    const intelligence = buildCycleIntelligence([], { today: "2026-11-22" });
    const phase = resolveCyclePhase(intelligence, "2026-11-22");
    assert.equal(phase.phase, "unknown");
  });
});
