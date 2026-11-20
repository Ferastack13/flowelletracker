import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bleedingWriteErrorMessage,
  isBleedingDateInPeriod,
  isBleedingIntensity,
  parseBleedingWrite,
} from "./bleeding.ts";

describe("bleeding intensity parsing", () => {
  it("accepts the five intensity levels", () => {
    assert.equal(isBleedingIntensity("none"), true);
    assert.equal(isBleedingIntensity("spotting"), true);
    assert.equal(isBleedingIntensity("light"), true);
    assert.equal(isBleedingIntensity("medium"), true);
    assert.equal(isBleedingIntensity("heavy"), true);
    assert.equal(isBleedingIntensity("severe"), false);
  });

  it("parses a valid bleeding write", () => {
    const result = parseBleedingWrite({
      periodId: "11111111-1111-4111-8111-111111111111",
      loggedOn: "2026-11-07",
      intensity: "light",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.loggedOn, "2026-11-07");
      assert.equal(result.intensity, "light");
    }
  });

  it("rejects invalid intensity and dates", () => {
    assert.equal(
      parseBleedingWrite({
        periodId: "11111111-1111-4111-8111-111111111111",
        loggedOn: "2026-11-07",
        intensity: "severe",
      }).ok,
      false,
    );
    assert.equal(
      parseBleedingWrite({
        periodId: "not-an-id",
        loggedOn: "2026-11-07",
        intensity: "light",
      }).ok,
      false,
    );
  });
});

describe("bleeding date bounds", () => {
  it("keeps days inside a completed period", () => {
    assert.equal(
      isBleedingDateInPeriod({
        loggedOn: "2026-11-07",
        startedOn: "2026-11-06",
        endedOn: "2026-11-10",
      }),
      true,
    );
    assert.equal(
      isBleedingDateInPeriod({
        loggedOn: "2026-11-11",
        startedOn: "2026-11-06",
        endedOn: "2026-11-10",
      }),
      false,
    );
  });

  it("allows ongoing period days through today", () => {
    assert.equal(
      isBleedingDateInPeriod({
        loggedOn: "2026-11-08",
        startedOn: "2026-11-06",
        endedOn: null,
        today: "2026-11-09",
      }),
      true,
    );
    assert.equal(
      isBleedingDateInPeriod({
        loggedOn: "2026-11-10",
        startedOn: "2026-11-06",
        endedOn: null,
        today: "2026-11-09",
      }),
      false,
    );
  });
});

describe("bleeding write errors", () => {
  it("explains duplicate day conflicts", () => {
    assert.match(bleedingWriteErrorMessage("23505"), /already has/i);
  });
});
