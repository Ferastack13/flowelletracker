import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parsePeriodId,
  parsePeriodWrite,
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

describe("period identifiers and write errors", () => {
  it("accepts only a real period id", () => {
    assert.equal(parsePeriodId("11111111-1111-4111-8111-111111111111"), "11111111-1111-4111-8111-111111111111");
    assert.equal(parsePeriodId("not-an-id"), null);
    assert.equal(parsePeriodId(""), null);
  });

  it("maps a duplicate start to a clear message", () => {
    assert.match(periodWriteErrorMessage("23505"), /already saved/i);
    assert.match(periodWriteErrorMessage("23514"), /end date/i);
  });
});
