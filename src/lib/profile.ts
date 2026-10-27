export const DISPLAY_NAME_MAX = 80;
export const SELF_CARE_INTENTION_MAX = 280;
export const DELETE_RECORDS_CONFIRMATION = "DELETE";

export interface UserProfile {
  displayName: string;
  selfCareIntention: string;
  showCycleEstimate: boolean;
}

export const emptyProfile: UserProfile = {
  displayName: "",
  selfCareIntention: "",
  showCycleEstimate: true,
};

export function normalizeOptionalText(
  value: string,
  maxLength: number,
): { ok: true; value: string } | { ok: false; message: string } {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length > maxLength) {
    return {
      ok: false,
      message: `Keep this to ${maxLength} characters.`,
    };
  }
  return { ok: true, value: trimmed };
}

export function parseProfileForm(input: {
  displayName: string;
  selfCareIntention: string;
  showCycleEstimate: boolean;
}): { ok: true; profile: UserProfile } | { ok: false; message: string } {
  const displayName = normalizeOptionalText(input.displayName, DISPLAY_NAME_MAX);
  if (!displayName.ok) {
    return { ok: false, message: `Display name: ${displayName.message}` };
  }

  const intention = normalizeOptionalText(
    input.selfCareIntention,
    SELF_CARE_INTENTION_MAX,
  );
  if (!intention.ok) {
    return { ok: false, message: `Self-care intention: ${intention.message}` };
  }

  return {
    ok: true,
    profile: {
      displayName: displayName.value,
      selfCareIntention: intention.value,
      showCycleEstimate: input.showCycleEstimate,
    },
  };
}
