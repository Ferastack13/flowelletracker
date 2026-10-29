import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSelfCareOverview,
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

describe("self-care dashboard counts", () => {
  it("marks a pillar done only for the selected local date", () => {
    const checkins = [
      {
        id: "c1",
        checkedOn: "2026-10-29",
        hydration: true,
        movement: false,
        sleep: false,
        personalCare: false,
      },
      {
        id: "c2",
        checkedOn: "2026-10-28",
        hydration: false,
        movement: true,
        sleep: true,
        personalCare: false,
      },
    ];

    const today = buildSelfCareOverview(checkins, "2026-10-29");
    const hydration = today.find((pillar) => pillar.id === "hydration");
    const movement = today.find((pillar) => pillar.id === "movement");

    assert.equal(hydration?.doneToday, true);
    assert.equal(movement?.doneToday, false);
    assert.equal(hydration?.doneDays, 1);
    assert.equal(movement?.doneDays, 1);
  });

  it("does not count another day's check-in as today", () => {
    const overview = buildSelfCareOverview(
      [
        {
          id: "c1",
          checkedOn: "2026-10-01",
          hydration: true,
          movement: true,
          sleep: true,
          personalCare: true,
        },
      ],
      "2026-10-29",
    );

    assert.equal(
      overview.every((pillar) => pillar.doneToday === false),
      true,
    );
    assert.equal(
      overview.every((pillar) => pillar.doneDays === 0),
      true,
    );
  });
});
