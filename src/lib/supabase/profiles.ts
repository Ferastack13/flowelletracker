import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { emptyProfile, mergeProfileFields, type UserProfile } from "@/lib/profile";

interface ProfileRow {
  display_name: string | null;
  self_care_intention: string | null;
  show_cycle_estimate: boolean;
}

function mapProfile(row: ProfileRow | null): UserProfile {
  if (!row) return emptyProfile;
  return {
    displayName: row.display_name ?? "",
    selfCareIntention: row.self_care_intention ?? "",
    showCycleEstimate: row.show_cycle_estimate,
  };
}

export async function loadProfile(): Promise<{
  profile: UserProfile;
  error: string | null;
}> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { profile: emptyProfile, error: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, self_care_intention, show_cycle_estimate")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      profile: emptyProfile,
      error: "Your preferences could not be loaded. Refresh and try again.",
    };
  }

  return { profile: mapProfile(data as ProfileRow | null), error: null };
}

export async function getProfile(): Promise<UserProfile> {
  const { profile } = await loadProfile();
  return profile;
}

export async function upsertProfile(profile: UserProfile): Promise<boolean> {
  const userId = await getSignedInUserId();
  if (!userId) return false;

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      display_name: profile.displayName || null,
      self_care_intention: profile.selfCareIntention || null,
      show_cycle_estimate: profile.showCycleEstimate,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return !error;
}

export async function saveProfileFields(
  fields: Partial<UserProfile>,
): Promise<{ ok: boolean; error: string | null }> {
  const loaded = await loadProfile();
  if (loaded.error) {
    return { ok: false, error: loaded.error };
  }

  const saved = await upsertProfile(mergeProfileFields(loaded.profile, fields));

  if (!saved) {
    return {
      ok: false,
      error: "Those preferences could not be saved. Try again.",
    };
  }

  return { ok: true, error: null };
}
