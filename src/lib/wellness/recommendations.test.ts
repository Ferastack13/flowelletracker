import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPersonalizedRecommendations,
  wellnessProgress,
} from "./recommendations.ts";

describe("buildPersonalizedRecommendations", () => {
  it("uses menstrual suggestions for the menstrual phase", () => {
    const items = buildPersonalizedRecommendations({
      phase: "menstrual",
      recordedSymptoms: [],
      limit: 6,
    });
    assert.ok(items.length > 0);
    assert.ok(items.some((item) => item.id.startsWith("menstrual-")));
    assert.ok(items.every((item) => item.source === "phase" || item.source === "general"));
  });

  it("adds symptom suggestions only for recorded symptoms", () => {
    const withCramps = buildPersonalizedRecommendations({
      phase: "luteal",
      recordedSymptoms: ["cramps"],
      limit: 6,
    });
    assert.ok(withCramps.some((item) => item.source === "symptom"));
    assert.ok(withCramps.some((item) => item.id.includes("cramps")));

    const without = buildPersonalizedRecommendations({
      phase: "luteal",
      recordedSymptoms: [],
      limit: 6,
    });
    assert.ok(!without.some((item) => item.id.includes("cramps")));
  });

  it("marks completed ids and avoids duplicates", () => {
    const items = buildPersonalizedRecommendations({
      phase: "follicular",
      recordedSymptoms: ["fatigue", "fatigue"],
      completedIds: ["symptom-fatigue-sleep"],
      limit: 8,
    });
    const ids = items.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
    const fatigueSleep = items.find((item) => item.id === "symptom-fatigue-sleep");
    assert.equal(fatigueSleep?.completed, true);
  });

  it("offers general tips when phase is unknown", () => {
    const items = buildPersonalizedRecommendations({
      phase: "unknown",
      recordedSymptoms: [],
      limit: 4,
    });
    assert.ok(items.length >= 2);
    assert.ok(items.every((item) => item.source === "general" || item.source === "phase"));
  });
});

describe("wellnessProgress", () => {
  it("computes completion percent", () => {
    const items = buildPersonalizedRecommendations({
      phase: "menstrual",
      recordedSymptoms: [],
      completedIds: [],
      limit: 4,
    }).map((item, index) => ({ ...item, completed: index === 0 }));
    const progress = wellnessProgress(items);
    assert.equal(progress.total, items.length);
    assert.equal(progress.completed, 1);
    assert.ok(progress.percent > 0);
  });
});
