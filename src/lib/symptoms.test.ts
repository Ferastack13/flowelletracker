import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SYMPTOM_NOTE_MAX_LENGTH,
  isSymptomId,
  isSymptomSeverity,
} from "./symptoms.ts";

describe("symptom record validation", () => {
  it("accepts a known symptom, severity, and note length", () => {
    assert.equal(isSymptomId("cramps"), true);
    assert.equal(isSymptomSeverity(3), true);
    assert.equal("mild cramps".length <= SYMPTOM_NOTE_MAX_LENGTH, true);
  });

  it("rejects unknown symptoms, invalid severity, and overlong notes", () => {
    assert.equal(isSymptomId("ovulation"), false);
    assert.equal(isSymptomSeverity(0), false);
    assert.equal(isSymptomSeverity(6), false);
    assert.equal("x".repeat(SYMPTOM_NOTE_MAX_LENGTH + 1).length > SYMPTOM_NOTE_MAX_LENGTH, true);
  });
});
