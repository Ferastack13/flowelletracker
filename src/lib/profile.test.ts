import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DISPLAY_NAME_MAX,
  emptyProfile,
  mergeProfileFields,
  parseProfileForm,
  parseProfileIdentity,
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

describe("parseProfileIdentity", () => {
  it("saves only name and intention, leaving cycle preference to its own action", () => {
    const result = parseProfileIdentity({
      displayName: "  Nia  ",
      selfCareIntention: "  Move gently  ",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.displayName, "Nia");
      assert.equal(result.selfCareIntention, "Move gently");
    }
  });

  it("rejects identity fields that exceed the stored limits", () => {
    const tooLongName = parseProfileIdentity({
      displayName: "a".repeat(DISPLAY_NAME_MAX + 1),
      selfCareIntention: "",
    });
    const tooLongIntention = parseProfileIdentity({
      displayName: "Nia",
      selfCareIntention: "x".repeat(SELF_CARE_INTENTION_MAX + 1),
    });

    assert.equal(tooLongName.ok, false);
    assert.equal(tooLongIntention.ok, false);
  });
});

describe("mergeProfileFields", () => {
  it("keeps the estimate preference when only identity is saved", () => {
    const merged = mergeProfileFields(
      {
        displayName: "Ada",
        selfCareIntention: "Rest",
        showCycleEstimate: false,
      },
      { displayName: "Nia", selfCareIntention: "Move gently" },
    );

    assert.equal(merged.displayName, "Nia");
    assert.equal(merged.selfCareIntention, "Move gently");
    assert.equal(merged.showCycleEstimate, false);
  });

  it("keeps identity when only the estimate preference changes", () => {
    const merged = mergeProfileFields(
      {
        displayName: "Ada",
        selfCareIntention: "Rest",
        showCycleEstimate: true,
      },
      { showCycleEstimate: false },
    );

    assert.equal(merged.displayName, "Ada");
    assert.equal(merged.selfCareIntention, "Rest");
    assert.equal(merged.showCycleEstimate, false);
  });

  it("can start from an empty profile without inventing a name", () => {
    const merged = mergeProfileFields(emptyProfile, {
      displayName: "Ada",
    });

    assert.equal(merged.displayName, "Ada");
    assert.equal(merged.selfCareIntention, "");
    assert.equal(merged.showCycleEstimate, true);
  });
});
