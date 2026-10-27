import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyProfile } from "./profile.ts";
import {
  buildPersonalExport,
  displayInitials,
  interpretDeletion,
  isDeletionConfirmed,
} from "./settings-data.ts";

describe("buildPersonalExport", () => {
  it("maps the signed-in user's records and drops user ids", () => {
    const { document, isEmpty } = buildPersonalExport({
      exportedAt: "2026-10-27T12:00:00.000Z",
      profile: {
        displayName: "Ada",
        selfCareIntention: "Rest",
        showCycleEstimate: false,
      },
      cyclePeriods: [
        {
          id: "p1",
          user_id: "someone-else",
          started_on: "2026-10-01",
          ended_on: "2026-10-05",
        },
      ],
      symptomLogs: [
        {
          id: "s1",
          userId: "someone-else",
          logged_on: "2026-10-02",
          symptom: "cramps",
          severity: 2,
          notes: "mild",
        },
      ],
      selfCareCheckins: [
        {
          id: "c1",
          user_id: "someone-else",
          checked_on: "2026-10-02",
          hydration: true,
          movement: false,
          sleep: true,
          personal_care: false,
        },
      ],
    });

    assert.equal(isEmpty, false);
    assert.equal(document.profile.displayName, "Ada");
    assert.equal(document.profile.showNextPeriodWindow, false);
    assert.equal(document.cyclePeriods[0]?.startedOn, "2026-10-01");
    assert.equal("user_id" in document.cyclePeriods[0]!, false);
    assert.equal("userId" in document.symptomLogs[0]!, false);
    assert.equal(document.selfCareCheckins[0]?.personalCare, false);
  });

  it("treats an unused account as an empty export", () => {
    const { isEmpty, document } = buildPersonalExport({
      exportedAt: "2026-10-27T12:00:00.000Z",
      profile: emptyProfile,
      cyclePeriods: [],
      symptomLogs: [],
      selfCareCheckins: [],
    });

    assert.equal(isEmpty, true);
    assert.equal(document.cyclePeriods.length, 0);
    assert.equal(document.symptomLogs.length, 0);
    assert.equal(document.selfCareCheckins.length, 0);
  });
});

describe("deletion confirmation and leftovers", () => {
  it("accepts only the exact confirmation word", () => {
    assert.equal(isDeletionConfirmed("DELETE"), true);
    assert.equal(isDeletionConfirmed(" DELETE "), true);
    assert.equal(isDeletionConfirmed("delete"), false);
    assert.equal(isDeletionConfirmed(""), false);
  });

  it("is incomplete when any user-owned table still has rows", () => {
    const leftover = interpretDeletion({
      cycle_periods: 0,
      symptom_logs: 2,
      self_care_checkins: 0,
      profiles: 0,
    });
    assert.equal(leftover.complete, false);
    assert.deepEqual(leftover.remaining, ["symptom_logs"]);
  });

  it("treats a missing count as leftover instead of empty", () => {
    const leftover = interpretDeletion({
      cycle_periods: 0,
      symptom_logs: 0,
      self_care_checkins: 0,
    });
    assert.equal(leftover.complete, false);
    assert.deepEqual(leftover.remaining, ["profiles"]);
  });

  it("is complete only when every table is empty", () => {
    const done = interpretDeletion({
      cycle_periods: 0,
      symptom_logs: 0,
      self_care_checkins: 0,
      profiles: 0,
    });
    assert.equal(done.complete, true);
    assert.deepEqual(done.remaining, []);
  });
});

describe("displayInitials", () => {
  it("uses the first and last name letters", () => {
    assert.equal(displayInitials("Ada Elizabeth"), "AE");
  });

  it("falls back when the name is empty", () => {
    assert.equal(displayInitials("   "), "FL");
  });
});
