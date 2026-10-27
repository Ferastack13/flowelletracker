import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSameAccount, requireSignedInUserId } from "./access.ts";

describe("requireSignedInUserId", () => {
  it("rejects missing authentication", () => {
    const missing = requireSignedInUserId(null, "Sign in to save a period start.");
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.match(missing.message, /sign in/i);
    }
  });

  it("returns the signed-in user", () => {
    const present = requireSignedInUserId("user-1");
    assert.equal(present.ok, true);
    if (present.ok) assert.equal(present.userId, "user-1");
  });
});

describe("isSameAccount", () => {
  it("blocks cross-account access", () => {
    assert.equal(isSameAccount("user-1", "user-1"), true);
    assert.equal(isSameAccount("user-1", "user-2"), false);
    assert.equal(isSameAccount("", "user-1"), false);
  });
});
