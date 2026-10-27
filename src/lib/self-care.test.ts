import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkinForDate,
  emptySelfCareCheckin,
  hasAnySelfCarePillar,
  toggleSelfCarePillarState,
} from "./self-care.ts";

describe("self-care check-in updates", () => {
  it("creates a day's first check-in by toggling a pillar", () => {
    const created = toggleSelfCarePillarState(
      emptySelfCareCheckin("2026-10-27"),
      "hydration",
    );
    assert.equal(created.hydration, true);
    assert.equal(hasAnySelfCarePillar(created), true);
  });

  it("updates the same day instead of inventing a second row", () => {
    const existing = {
      id: "c1",
      checkedOn: "2026-10-27",
      hydration: true,
      movement: false,
      sleep: false,
      personalCare: false,
    };
    const sameDay = checkinForDate([existing], "2026-10-27");
    const next = toggleSelfCarePillarState(sameDay, "sleep");
    assert.equal(sameDay.id, "c1");
    assert.equal(next.hydration, true);
    assert.equal(next.sleep, true);
  });

  it("clears a day when the last pillar is turned off", () => {
    const next = toggleSelfCarePillarState(
      {
        id: "c1",
        checkedOn: "2026-10-27",
        hydration: true,
        movement: false,
        sleep: false,
        personalCare: false,
      },
      "hydration",
    );
    assert.equal(hasAnySelfCarePillar(next), false);
  });
});
