export const DISPLAY_NAME_MAX = 80;
export const SELF_CARE_INTENTION_MAX = 280;
export const DELETE_RECORDS_CONFIRMATION = "DELETE";

export interface NotificationPreferences {
  periodReminder: boolean;
  ovulationReminder: boolean;
  fertileWindowReminder: boolean;
  checkinReminder: boolean;
  timezone: string;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  preferredChannel: "email";
}

export interface UserProfile {
  displayName: string;
  selfCareIntention: string;
  showCycleEstimate: boolean;
  usualCycleLengthDays: number | null;
  notifications: NotificationPreferences;
  photoPath: string | null;
  photoUrl: string | null;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  periodReminder: true,
  ovulationReminder: true,
  fertileWindowReminder: true,
  checkinReminder: true,
  timezone: "UTC",
  quietHoursStart: null,
  quietHoursEnd: null,
  preferredChannel: "email",
};

export const emptyProfile: UserProfile = {
  displayName: "",
  selfCareIntention: "",
  showCycleEstimate: true,
  usualCycleLengthDays: null,
  notifications: { ...defaultNotificationPreferences },
  photoPath: null,
  photoUrl: null,
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

export function parseProfileIdentity(input: {
  displayName: string;
  selfCareIntention: string;
}):
  | { ok: true; displayName: string; selfCareIntention: string }
  | { ok: false; message: string } {
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
    displayName: displayName.value,
    selfCareIntention: intention.value,
  };
}

export function mergeProfileFields(
  current: UserProfile,
  fields: Partial<UserProfile>,
): UserProfile {
  return {
    displayName: fields.displayName ?? current.displayName,
    selfCareIntention: fields.selfCareIntention ?? current.selfCareIntention,
    showCycleEstimate: fields.showCycleEstimate ?? current.showCycleEstimate,
    usualCycleLengthDays:
      fields.usualCycleLengthDays === undefined
        ? current.usualCycleLengthDays
        : fields.usualCycleLengthDays,
    notifications: fields.notifications
      ? { ...current.notifications, ...fields.notifications }
      : current.notifications,
    photoPath: fields.photoPath === undefined ? current.photoPath : fields.photoPath,
    photoUrl: fields.photoUrl === undefined ? current.photoUrl : fields.photoUrl,
  };
}

export function parseProfileForm(input: {
  displayName: string;
  selfCareIntention: string;
  showCycleEstimate: boolean;
}): { ok: true; profile: UserProfile } | { ok: false; message: string } {
  const identity = parseProfileIdentity(input);
  if (!identity.ok) return identity;

  return {
    ok: true,
    profile: {
      displayName: identity.displayName,
      selfCareIntention: identity.selfCareIntention,
      showCycleEstimate: input.showCycleEstimate,
      usualCycleLengthDays: null,
      notifications: { ...defaultNotificationPreferences },
      photoPath: null,
      photoUrl: null,
    },
  };
}

export function parseNotificationPreferences(input: {
  periodReminder?: unknown;
  ovulationReminder?: unknown;
  fertileWindowReminder?: unknown;
  checkinReminder?: unknown;
  timezone?: unknown;
  quietHoursStart?: unknown;
  quietHoursEnd?: unknown;
}): NotificationPreferences {
  const asBool = (value: unknown, fallback: boolean) => {
    if (typeof value === "boolean") return value;
    if (value === "on" || value === "true" || value === "1") return true;
    if (value === "off" || value === "false" || value === "0") return false;
    return fallback;
  };

  const timezone =
    typeof input.timezone === "string" && input.timezone.trim()
      ? input.timezone.trim()
      : defaultNotificationPreferences.timezone;

  const quietHoursStart =
    typeof input.quietHoursStart === "string" && input.quietHoursStart.trim()
      ? input.quietHoursStart.trim().slice(0, 5)
      : null;
  const quietHoursEnd =
    typeof input.quietHoursEnd === "string" && input.quietHoursEnd.trim()
      ? input.quietHoursEnd.trim().slice(0, 5)
      : null;

  return {
    periodReminder: asBool(
      input.periodReminder,
      defaultNotificationPreferences.periodReminder,
    ),
    ovulationReminder: asBool(
      input.ovulationReminder,
      defaultNotificationPreferences.ovulationReminder,
    ),
    fertileWindowReminder: asBool(
      input.fertileWindowReminder,
      defaultNotificationPreferences.fertileWindowReminder,
    ),
    checkinReminder: asBool(
      input.checkinReminder,
      defaultNotificationPreferences.checkinReminder,
    ),
    timezone,
    quietHoursStart,
    quietHoursEnd,
    preferredChannel: "email",
  };
}
