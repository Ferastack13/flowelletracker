import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DISPLAY_NAME_MAX,
  parseProfileForm,
  SELF_CARE_INTENTION_MAX,
} from "./profile.ts";

describe("parseProfileForm", () => {
  it("accepts empty optional fields and keeps estimates visible by default", () => {
    const result = parseProfileForm({
      displayName: "  ",
      selfCareIntention: "",
      showCycleEstimate: true,
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.profile.displayName, "");
      assert.equal(result.profile.selfCareIntention, "");
      assert.equal(result.profile.showCycleEstimate, true);
    }
  });

  it("trims and collapses extra spaces", () => {
    const result = parseProfileForm({
      displayName: "  Ada   Elizabeth  ",
      selfCareIntention: "  Rest   more  ",
      showCycleEstimate: false,
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.profile.displayName, "Ada Elizabeth");
      assert.equal(result.profile.selfCareIntention, "Rest more");
      assert.equal(result.profile.showCycleEstimate, false);
    }
  });

  it("rejects a display name that is too long", () => {
    const result = parseProfileForm({
      displayName: "a".repeat(DISPLAY_NAME_MAX + 1),
      selfCareIntention: "",
      showCycleEstimate: true,
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.message, /display name/i);
    }
  });

  it("rejects an intention that is too long", () => {
    const result = parseProfileForm({
      displayName: "Ada",
      selfCareIntention: "x".repeat(SELF_CARE_INTENTION_MAX + 1),
      showCycleEstimate: true,
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.message, /intention/i);
    }
  });
});
