import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findOverlappingPeriod,
  parsePeriodId,
  parsePeriodWrite,
  periodDurationDays,
  periodsOverlap,
  periodWriteErrorMessage,
} from "./cycle-records.ts";

describe("parsePeriodWrite", () => {
  it("creates a start-only period", () => {
    const result = parsePeriodWrite({ startedOn: "2026-10-01" });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.startedOn, "2026-10-01");
      assert.equal(result.endedOn, null);
    }
  });

  it("updates start and end when the range is valid", () => {
    const result = parsePeriodWrite({
      startedOn: "2026-10-01",
      endedOn: "2026-10-05",
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.endedOn, "2026-10-05");
  });

  it("rejects an end before the start", () => {
    const result = parsePeriodWrite({
      startedOn: "2026-10-05",
      endedOn: "2026-10-01",
    });
    assert.equal(result.ok, false);
  });

  it("rejects an invalid calendar date", () => {
    const result = parsePeriodWrite({ startedOn: "2026-13-40" });
    assert.equal(result.ok, false);
  });
});

describe("periodDurationDays", () => {
  it("counts completed periods inclusively", () => {
    assert.equal(periodDurationDays("2026-11-06", "2026-11-08"), 3);
    assert.equal(periodDurationDays("2026-11-06", "2026-11-10"), 5);
    assert.equal(periodDurationDays("2026-11-01", "2026-11-07"), 7);
    assert.equal(periodDurationDays("2026-11-06", "2026-11-06"), 1);
  });

  it("returns null while a period is ongoing", () => {
    assert.equal(periodDurationDays("2026-11-06", null), null);
  });
});

describe("periodsOverlap", () => {
  it("detects overlapping completed ranges", () => {
    assert.equal(
      periodsOverlap(
        { startedOn: "2026-11-01", endedOn: "2026-11-05" },
        { startedOn: "2026-11-04", endedOn: "2026-11-08" },
      ),
      true,
    );
  });

  it("allows adjacent completed periods", () => {
    assert.equal(
      periodsOverlap(
        { startedOn: "2026-11-01", endedOn: "2026-11-05" },
        { startedOn: "2026-11-06", endedOn: "2026-11-08" },
      ),
      false,
    );
  });

  it("treats an ongoing period as open-ended", () => {
    assert.equal(
      periodsOverlap(
        { startedOn: "2026-11-01", endedOn: null },
        { startedOn: "2026-11-10", endedOn: "2026-11-12" },
      ),
      true,
    );
  });

  it("finds the conflicting period when excluding the edited row", () => {
    const conflict = findOverlappingPeriod(
      [
        {
          id: "11111111-1111-4111-8111-111111111111",
          startedOn: "2026-11-01",
          endedOn: "2026-11-05",
        },
        {
          id: "22222222-2222-4222-8222-222222222222",
          startedOn: "2026-10-01",
          endedOn: "2026-10-04",
        },
      ],
      { startedOn: "2026-11-03", endedOn: "2026-11-07" },
      "22222222-2222-4222-8222-222222222222",
    );
    assert.equal(conflict?.id, "11111111-1111-4111-8111-111111111111");
  });
});

describe("period identifiers and write errors", () => {
  it("accepts only a real period id", () => {
    assert.equal(
      parsePeriodId("11111111-1111-4111-8111-111111111111"),
      "11111111-1111-4111-8111-111111111111",
    );
    assert.equal(parsePeriodId("not-an-id"), null);
    assert.equal(parsePeriodId(""), null);
  });

  it("maps a duplicate start to a clear message", () => {
    assert.match(periodWriteErrorMessage("23505"), /already saved/i);
    assert.match(periodWriteErrorMessage("23514"), /end date/i);
  });
});
