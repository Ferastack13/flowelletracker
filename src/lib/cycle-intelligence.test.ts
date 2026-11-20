import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CyclePeriod } from "./cycle.ts";
import {
  buildCycleIntelligence,
  estimateFertileWindow,
  estimateOvulation,
  parseUsualCycleLength,
  resolveNextPeriodEstimate,
} from "./cycle-intelligence.ts";
import { buildCycleOverview } from "./cycle.ts";

function period(
  id: string,
  startedOn: string,
  endedOn: string | null = null,
): CyclePeriod {
  return { id, startedOn, endedOn };
}

describe("parseUsualCycleLength", () => {
  it("accepts a known length or unknown", () => {
    assert.deepEqual(parseUsualCycleLength(28), { ok: true, value: 28 });
    assert.deepEqual(parseUsualCycleLength("unknown"), {
      ok: true,
      value: null,
    });
    assert.deepEqual(parseUsualCycleLength(""), { ok: true, value: null });
  });

  it("rejects out-of-range lengths", () => {
    assert.equal(parseUsualCycleLength(7).ok, false);
    assert.equal(parseUsualCycleLength(90).ok, false);
  });
});

describe("resolveNextPeriodEstimate", () => {
  it("prefers recorded history over a reported length", () => {
    const overview = buildCycleOverview(
      [
        period("a", "2026-01-01", "2026-01-05"),
        period("b", "2026-01-29", "2026-02-02"),
      ],
      "2026-02-10",
    );
    const next = resolveNextPeriodEstimate({
      overview,
      usualCycleLengthDays: 35,
      today: "2026-02-10",
    });
    assert.equal(next.source, "history");
    assert.equal(next.typicalLengthDays, 28);
  });

  it("uses a reported length when history is insufficient", () => {
    const overview = buildCycleOverview(
      [period("a", "2026-11-06", "2026-11-10")],
      "2026-11-20",
    );
    const next = resolveNextPeriodEstimate({
      overview,
      usualCycleLengthDays: 28,
      today: "2026-11-20",
    });
    assert.equal(next.source, "reported");
    assert.equal(next.estimatedStart, "2026-12-04");
    assert.equal(next.daysUntil, 14);
  });

  it("explains when neither history nor a reported length is available", () => {
    const overview = buildCycleOverview(
      [period("a", "2026-11-06")],
      "2026-11-20",
    );
    const next = resolveNextPeriodEstimate({
      overview,
      usualCycleLengthDays: null,
      today: "2026-11-20",
    });
    assert.equal(next.status, "none");
    assert.match(next.reason, /more recorded period starts/i);
  });
});

describe("ovulation and fertile window", () => {
  it("estimates ovulation from the next period using a luteal-phase assumption", () => {
    const next = resolveNextPeriodEstimate({
      overview: buildCycleOverview(
        [
          period("a", "2026-01-01", "2026-01-05"),
          period("b", "2026-01-29", "2026-02-02"),
        ],
        "2026-02-10",
      ),
      usualCycleLengthDays: null,
      today: "2026-02-10",
    });
    const ovulation = estimateOvulation({
      nextPeriod: next,
      lutealPhaseDays: 14,
      irregular: false,
    });
    assert.equal(ovulation.status, "estimated");
    assert.equal(ovulation.midpoint, "2026-02-12");
    assert.match(ovulation.reason, /cannot confirm ovulation/i);

    const fertile = estimateFertileWindow({ ovulation });
    assert.equal(fertile.status, "estimated");
    assert.equal(fertile.windowStart, "2026-02-06");
    assert.equal(fertile.windowEnd, ovulation.windowEnd);
    assert.match(fertile.reason, /not contraception/i);
  });

  it("suppresses ovulation when cycles are too irregular", () => {
    const next = resolveNextPeriodEstimate({
      overview: buildCycleOverview(
        [
          period("a", "2026-01-01"),
          period("b", "2026-01-22"),
          period("c", "2026-03-10"),
        ],
        "2026-03-20",
      ),
      usualCycleLengthDays: null,
      today: "2026-03-20",
    });
    const ovulation = estimateOvulation({
      nextPeriod: next,
      irregular: true,
    });
    assert.equal(ovulation.status, "none");
    assert.match(ovulation.reason, /unreliable/i);
  });

  it("does not invent ovulation without a next-period estimate", () => {
    const ovulation = estimateOvulation({
      nextPeriod: {
        status: "none",
        source: "none",
        reason: "Need data",
        typicalLengthDays: null,
        estimatedStart: null,
        windowStart: null,
        windowEnd: null,
        completedCyclesUsed: 0,
        daysUntil: null,
      },
      irregular: false,
    });
    assert.equal(ovulation.status, "none");
    assert.equal(ovulation.windowStart, null);
  });
});

describe("buildCycleIntelligence", () => {
  it("keeps period duration separate from cycle length", () => {
    const intelligence = buildCycleIntelligence(
      [period("a", "2026-11-06", "2026-11-10")],
      { today: "2026-11-20", usualCycleLengthDays: 28 },
    );
    assert.equal(intelligence.statistics.averagePeriodDuration, 5);
    assert.equal(intelligence.nextPeriod.typicalLengthDays, 28);
    assert.equal(intelligence.nextPeriod.source, "reported");
  });

  it("calculates statistics from multiple completed cycles and periods", () => {
    const intelligence = buildCycleIntelligence(
      [
        period("a", "2026-01-01", "2026-01-05"),
        period("b", "2026-01-29", "2026-02-03"),
        period("c", "2026-02-26", "2026-03-01"),
      ],
      { today: "2026-03-10" },
    );
    assert.equal(intelligence.statistics.usableCycleCount, 2);
    assert.equal(intelligence.statistics.averageCycleLength, 28);
    assert.equal(intelligence.statistics.averagePeriodDuration, 5);
    assert.equal(intelligence.nextPeriod.source, "history");
    assert.ok(intelligence.insights.length >= 1);
  });

  it("shows an ongoing period without inventing a completed duration", () => {
    const intelligence = buildCycleIntelligence(
      [period("a", "2026-11-06")],
      { today: "2026-11-10", usualCycleLengthDays: 28 },
    );
    assert.equal(
      intelligence.overview.periodStatus.presence,
      "recorded-bleeding",
    );
    assert.equal(intelligence.statistics.completedPeriodCount, 0);
    assert.equal(intelligence.statistics.averagePeriodDuration, null);
  });

  it("shares one prediction source for dashboard and tracker consumers", () => {
    const periods = [
      period("a", "2026-01-01", "2026-01-05"),
      period("b", "2026-01-29", "2026-02-02"),
    ];
    const first = buildCycleIntelligence(periods, { today: "2026-02-10" });
    const second = buildCycleIntelligence(periods, { today: "2026-02-10" });
    assert.deepEqual(first.nextPeriod, second.nextPeriod);
    assert.deepEqual(first.ovulation, second.ovulation);
  });
});
