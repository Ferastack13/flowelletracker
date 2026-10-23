import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ASSUMED_CYCLE_LENGTH_DAYS,
  buildCycleOverview,
  type CyclePeriod,
} from "./cycle.ts";

function period(
  id: string,
  startedOn: string,
  endedOn: string | null = null,
): CyclePeriod {
  return { id, startedOn, endedOn };
}

describe("buildCycleOverview", () => {
  it("returns no data and no 28-day personalisation when nothing is recorded", () => {
    const overview = buildCycleOverview([], "2026-03-01");

    assert.equal(overview.hasCycleData, false);
    assert.equal(overview.cycleLength, null);
    assert.equal(overview.estimate.status, "none");
    assert.match(overview.estimate.reason, /does not assume a 28-day cycle/i);
    assert.notEqual(overview.cycleLength, ASSUMED_CYCLE_LENGTH_DAYS);
  });

  it("counts the current day from one start without inventing a cycle length", () => {
    const overview = buildCycleOverview(
      [period("a", "2026-02-20")],
      "2026-03-01",
    );

    assert.equal(overview.hasCycleData, true);
    assert.equal(overview.currentDay, 10);
    assert.equal(overview.cycleLength, null);
    assert.equal(overview.estimate.status, "none");
    assert.equal(overview.estimate.estimatedStart, null);
    assert.match(overview.estimate.reason, /only one period start/i);
    assert.match(overview.estimate.reason, /28-day/i);
  });

  it("calculates a completed cycle from consecutive starts and gives a limited estimate", () => {
    const overview = buildCycleOverview(
      [period("b", "2026-01-29", "2026-02-03"), period("a", "2026-01-01", "2026-01-05")],
      "2026-02-05",
    );

    assert.equal(overview.intervals.length, 1);
    assert.equal(overview.intervals[0]?.lengthDays, 28);
    assert.equal(overview.intervals[0]?.usedForEstimate, true);
    assert.equal(overview.estimate.status, "limited");
    assert.equal(overview.estimate.typicalLengthDays, 28);
    assert.equal(overview.estimate.completedCyclesUsed, 1);
    assert.equal(overview.estimate.estimatedStart, "2026-02-26");
    assert.equal(overview.estimate.windowStart, "2026-02-24");
    assert.equal(overview.estimate.windowEnd, "2026-02-28");
    assert.equal(overview.currentDay, 8);
    assert.equal(overview.cycleLength, 28);
  });

  it("uses the median of variable recorded cycles for an approximate window", () => {
    const overview = buildCycleOverview(
      [
        period("c", "2026-02-28"),
        period("b", "2026-01-25"),
        period("a", "2026-01-01"),
      ],
      "2026-03-05",
    );

    assert.deepEqual(
      overview.intervals.map((interval) => interval.lengthDays),
      [24, 34],
    );
    assert.equal(overview.estimate.status, "approximate");
    assert.equal(overview.estimate.typicalLengthDays, 29);
    assert.equal(overview.estimate.completedCyclesUsed, 2);
    assert.equal(overview.estimate.estimatedStart, "2026-03-29");
    assert.equal(overview.estimate.windowStart, "2026-03-24");
    assert.equal(overview.estimate.windowEnd, "2026-04-03");
    assert.match(overview.estimate.reason, /vary/i);
  });

  it("rounds the median of an even number of cycle lengths", () => {
    const overview = buildCycleOverview(
      [
        period("e", "2026-05-05"),
        period("d", "2026-04-03"),
        period("c", "2026-03-02"),
        period("b", "2026-01-31"),
        period("a", "2026-01-01"),
      ],
      "2026-05-10",
    );

    assert.deepEqual(
      overview.intervals.map((interval) => interval.lengthDays),
      [30, 30, 32, 32],
    );
    assert.equal(overview.estimate.typicalLengthDays, 31);
  });

  it("does not estimate from duplicate start dates", () => {
    const overview = buildCycleOverview(
      [period("a", "2026-01-01"), period("b", "2026-01-01")],
      "2026-01-20",
    );

    assert.equal(overview.intervals[0]?.status, "duplicate");
    assert.equal(overview.intervals[0]?.usedForEstimate, false);
    assert.equal(overview.estimate.status, "none");
    assert.equal(overview.estimate.estimatedStart, null);
    assert.match(overview.estimate.reason, /duplicated|too close|overlapping/i);
  });

  it("does not estimate from overlapping periods", () => {
    const overview = buildCycleOverview(
      [
        period("a", "2026-01-01", "2026-01-20"),
        period("b", "2026-01-10", "2026-01-25"),
      ],
      "2026-01-30",
    );

    assert.equal(overview.intervals[0]?.status, "overlapping");
    assert.equal(overview.intervals[0]?.usedForEstimate, false);
    assert.equal(overview.estimate.status, "none");
  });

  it("records unusually short cycles without using them for a prediction", () => {
    const overview = buildCycleOverview(
      [period("a", "2026-01-01", "2026-01-04"), period("b", "2026-01-08")],
      "2026-01-20",
    );

    assert.equal(overview.intervals[0]?.lengthDays, 7);
    assert.equal(overview.intervals[0]?.status, "too-short");
    assert.equal(overview.estimate.status, "none");
    assert.equal(overview.estimate.estimatedStart, null);
  });

  it("records unusually long cycles without using them for a prediction", () => {
    const overview = buildCycleOverview(
      [period("a", "2026-01-01"), period("b", "2026-04-01")],
      "2026-04-10",
    );

    assert.equal(overview.intervals[0]?.lengthDays, 90);
    assert.equal(overview.intervals[0]?.status, "too-long");
    assert.equal(overview.estimate.status, "none");
  });

  it("ignores a future start as the current cycle and as completed history", () => {
    const overview = buildCycleOverview(
      [period("a", "2026-01-01"), period("b", "2026-03-01")],
      "2026-01-15",
    );

    assert.equal(overview.lastPeriodStart, "2026-01-01");
    assert.equal(overview.currentDay, 15);
    assert.equal(overview.intervals[0]?.status, "incomplete");
    assert.equal(overview.estimate.status, "none");
    assert.equal(overview.estimate.estimatedStart, null);
  });

  it("does not count a current day from future-only records", () => {
    const overview = buildCycleOverview(
      [period("a", "2026-04-01")],
      "2026-03-01",
    );

    assert.equal(overview.hasCycleData, true);
    assert.equal(overview.currentDay, null);
    assert.equal(overview.lastPeriodStart, null);
    assert.equal(overview.estimate.status, "none");
    assert.match(overview.estimate.reason, /on or before today/i);
  });

  it("drops invalid calendar dates instead of inventing a length", () => {
    const overview = buildCycleOverview(
      [period("bad", "2026-02-31"), period("a", "2026-01-01")],
      "2026-01-20",
    );

    assert.equal(overview.history.length, 1);
    assert.equal(overview.intervals.length, 0);
    assert.equal(overview.estimate.status, "none");
  });

  it("treats a broken end date as missing instead of skipping the start", () => {
    const overview = buildCycleOverview(
      [
        period("a", "2026-01-01", "2026-02-31"),
        period("b", "2026-01-29"),
      ],
      "2026-02-05",
    );

    assert.equal(overview.intervals[0]?.lengthDays, 28);
    assert.equal(overview.intervals[0]?.status, "usable");
  });

  it("sorts unsorted input before calculating lengths", () => {
    const overview = buildCycleOverview(
      [period("later", "2026-02-01"), period("earlier", "2026-01-04")],
      "2026-02-10",
    );

    assert.equal(overview.intervals[0]?.fromStart, "2026-01-04");
    assert.equal(overview.intervals[0]?.toStart, "2026-02-01");
    assert.equal(overview.intervals[0]?.lengthDays, 28);
  });

  it("still calculates start-to-start length when an end date is missing", () => {
    const overview = buildCycleOverview(
      [period("a", "2026-01-01"), period("b", "2026-01-29")],
      "2026-02-01",
    );

    assert.equal(overview.intervals[0]?.lengthDays, 28);
    assert.equal(overview.intervals[0]?.usedForEstimate, true);
  });

  it("does not treat an end date before its start as an overlap", () => {
    const overview = buildCycleOverview(
      [
        period("a", "2026-01-01", "2025-12-20"),
        period("b", "2026-01-29"),
      ],
      "2026-02-01",
    );

    assert.equal(overview.intervals[0]?.status, "usable");
    assert.equal(overview.estimate.status, "limited");
  });

  it("uses only plausible intervals when history is mixed", () => {
    const overview = buildCycleOverview(
      [
        period("a", "2026-01-01"),
        period("b", "2026-01-08"),
        period("c", "2026-02-05"),
      ],
      "2026-02-10",
    );

    assert.equal(overview.intervals[0]?.status, "too-short");
    assert.equal(overview.intervals[1]?.status, "usable");
    assert.equal(overview.intervals[1]?.lengthDays, 28);
    assert.equal(overview.estimate.status, "limited");
    assert.equal(overview.estimate.completedCyclesUsed, 1);
    assert.equal(overview.estimate.typicalLengthDays, 28);
  });

  it("returns the same overview for the same records so dashboard and tracker stay aligned", () => {
    const periods = [
      period("c", "2026-03-01"),
      period("a", "2026-01-01"),
      period("b", "2026-01-30"),
    ];

    assert.deepEqual(
      buildCycleOverview(periods, "2026-03-10"),
      buildCycleOverview(periods, "2026-03-10"),
    );
  });
});
