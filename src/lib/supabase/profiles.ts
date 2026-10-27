import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { emptyProfile, type UserProfile } from "@/lib/profile";

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

export async function getProfile(): Promise<UserProfile> {
  const userId = await getSignedInUserId();
  if (!userId) return emptyProfile;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, self_care_intention, show_cycle_estimate")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return emptyProfile;
  return mapProfile(data as ProfileRow);
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
