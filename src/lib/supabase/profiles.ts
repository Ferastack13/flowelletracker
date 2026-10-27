import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { emptyProfile, mergeProfileFields, type UserProfile } from "@/lib/profile";
import {
  PROFILE_PHOTO_BUCKET,
  PROFILE_PHOTO_SIGNED_URL_SECONDS,
  isOwnedPhotoPath,
} from "@/lib/profile-photo";

interface ProfileRow {
  display_name: string | null;
  self_care_intention: string | null;
  show_cycle_estimate: boolean;
  photo_path: string | null;
}

async function signPhotoUrl(
  photoPath: string | null,
  userId: string,
): Promise<string | null> {
  if (!photoPath || !isOwnedPhotoPath(photoPath, userId)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(PROFILE_PHOTO_BUCKET)
    .createSignedUrl(photoPath, PROFILE_PHOTO_SIGNED_URL_SECONDS);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

function mapProfile(row: ProfileRow | null, photoUrl: string | null): UserProfile {
  if (!row) return emptyProfile;
  return {
    displayName: row.display_name ?? "",
    selfCareIntention: row.self_care_intention ?? "",
    showCycleEstimate: row.show_cycle_estimate,
    photoPath: row.photo_path,
    photoUrl,
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
    .select("display_name, self_care_intention, show_cycle_estimate, photo_path")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      profile: emptyProfile,
      error: "Your preferences could not be loaded. Refresh and try again.",
    };
  }

  const row = data as ProfileRow | null;
  const photoUrl = await signPhotoUrl(row?.photo_path ?? null, userId);
  return { profile: mapProfile(row, photoUrl), error: null };
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
      photo_path: profile.photoPath,
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

export async function savePhotoPath(
  photoPath: string | null,
): Promise<{ ok: boolean; error: string | null }> {
  return saveProfileFields({ photoPath, photoUrl: null });
}

export async function removeOwnedPhotoObject(
  path: string,
  userId: string,
): Promise<boolean> {
  if (!isOwnedPhotoPath(path, userId)) return false;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([path]);
  return !error;
}

export async function removeOwnProfilePhotos(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(PROFILE_PHOTO_BUCKET)
    .list(userId, { limit: 50 });

  if (error) return false;
  const paths = (data ?? [])
    .map((file) => `${userId}/${file.name}`)
    .filter((path) => isOwnedPhotoPath(path, userId));

  if (paths.length === 0) return true;
  const removed = await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove(paths);
  return !removed.error;
}
