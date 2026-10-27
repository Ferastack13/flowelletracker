"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getSignedInUserId } from "@/lib/supabase/auth";
import {
  getProfile,
  removeOwnProfilePhotos,
  removeOwnedPhotoObject,
  savePhotoPath,
  saveProfileFields,
} from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { parseProfileIdentity } from "@/lib/profile";
import {
  PROFILE_PHOTO_BUCKET,
  buildOwnedPhotoPath,
  inspectProfilePhoto,
} from "@/lib/profile-photo";
import {
  buildPersonalExport,
  interpretDeletion,
  isDeletionConfirmed,
  RECORD_TABLES,
  type RecordTable,
} from "@/lib/settings-data";

export type SettingsActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

export type ExportActionState = SettingsActionState & {
  filename?: string;
  payload?: string;
  exportId?: string;
};

function revalidateSettingsSurfaces() {
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/cycle");
  revalidatePath("/self-care");
  revalidatePath("/learn");
}

async function requireUserId(): Promise<string | null> {
  return getSignedInUserId();
}

export async function saveProfileSettings(
  _previous: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const userId = await requireUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to save your preferences." };
  }

  const parsed = parseProfileIdentity({
    displayName: String(formData.get("displayName") ?? ""),
    selfCareIntention: String(formData.get("selfCareIntention") ?? ""),
  });
  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const saved = await saveProfileFields({
    displayName: parsed.displayName,
    selfCareIntention: parsed.selfCareIntention,
  });
  if (!saved.ok) {
    return {
      status: "error",
      message: saved.error ?? "Those preferences could not be saved. Try again.",
    };
  }

  revalidateSettingsSurfaces();
  return { status: "success", message: "Profile saved." };
}

export async function saveCycleEstimatePreference(
  _previous: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const userId = await requireUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to save this preference." };
  }

  const saved = await saveProfileFields({
    showCycleEstimate: formData.get("showCycleEstimate") === "on",
  });
  if (!saved.ok) {
    return {
      status: "error",
      message: saved.error ?? "That preference could not be saved. Try again.",
    };
  }

  revalidateSettingsSurfaces();
  return {
    status: "success",
    message:
      formData.get("showCycleEstimate") === "on"
        ? "The next-period window will show when enough starts are recorded."
        : "The next-period window is hidden. Your logged dates are unchanged.",
  };
}

export async function uploadProfilePhoto(
  _previous: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const userId = await requireUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to change your photo." };
  }

  const file = formData.get("photo");
  if (!(file instanceof File)) {
    return { status: "error", message: "Choose a photo to upload." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const inspected = inspectProfilePhoto({
    userId,
    bytes,
    declaredType: file.type,
    declaredSize: file.size,
  });
  if (!inspected.ok) {
    return { status: "error", message: inspected.message };
  }

  const nextPath = buildOwnedPhotoPath(userId, randomUUID(), inspected.kind);
  if (!nextPath) {
    return { status: "error", message: "That photo could not be stored." };
  }

  const current = await getProfile();
  const supabase = await createClient();
  const uploaded = await supabase.storage
    .from(PROFILE_PHOTO_BUCKET)
    .upload(nextPath, bytes, {
      contentType:
        inspected.kind === "jpeg"
          ? "image/jpeg"
          : inspected.kind === "png"
            ? "image/png"
            : "image/webp",
      upsert: false,
    });

  if (uploaded.error) {
    return {
      status: "error",
      message: "That photo could not be uploaded. Try again.",
    };
  }

  const saved = await savePhotoPath(nextPath);
  if (!saved.ok) {
    await removeOwnedPhotoObject(nextPath, userId);
    return {
      status: "error",
      message: saved.error ?? "That photo could not be saved. Try again.",
    };
  }

  if (current.photoPath && current.photoPath !== nextPath) {
    await removeOwnedPhotoObject(current.photoPath, userId);
  }

  revalidateSettingsSurfaces();
  return { status: "success", message: "Profile photo saved." };
}

export async function removeProfilePhoto(): Promise<SettingsActionState> {
  const userId = await requireUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to remove your photo." };
  }

  const current = await getProfile();
  const saved = await savePhotoPath(null);
  if (!saved.ok) {
    return {
      status: "error",
      message: saved.error ?? "That photo could not be removed. Try again.",
    };
  }

  if (current.photoPath) {
    const removed = await removeOwnedPhotoObject(current.photoPath, userId);
    if (!removed) {
      return {
        status: "error",
        message:
          "The photo was cleared from your profile, but the file may still be there. Try again.",
      };
    }
  }

  revalidateSettingsSurfaces();
  return { status: "success", message: "Profile photo removed." };
}

export async function exportMyData(
  _previous: ExportActionState,
  _formData?: FormData,
): Promise<ExportActionState> {
  const userId = await requireUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to download your data." };
  }

  const supabase = await createClient();
  const [profile, periods, symptoms, checkins] = await Promise.all([
    getProfile(),
    supabase
      .from("cycle_periods")
      .select("id, started_on, ended_on")
      .eq("user_id", userId)
      .order("started_on", { ascending: false }),
    supabase
      .from("symptom_logs")
      .select("id, logged_on, symptom, severity, notes")
      .eq("user_id", userId)
      .order("logged_on", { ascending: false }),
    supabase
      .from("self_care_checkins")
      .select("id, checked_on, hydration, movement, sleep, personal_care")
      .eq("user_id", userId)
      .order("checked_on", { ascending: false }),
  ]);

  if (periods.error || symptoms.error || checkins.error) {
    return {
      status: "error",
      message: "Your export could not be prepared. Try again.",
    };
  }

  const { document, isEmpty } = buildPersonalExport({
    exportedAt: new Date().toISOString(),
    profile,
    cyclePeriods: periods.data ?? [],
    symptomLogs: symptoms.data ?? [],
    selfCareCheckins: checkins.data ?? [],
  });

  return {
    status: "success",
    message: isEmpty
      ? "No saved records yet. A small file with your current preferences is ready."
      : "Your data file is ready.",
    filename: `flowelle-export-${new Date().toISOString().slice(0, 10)}.json`,
    payload: JSON.stringify(document, null, 2),
    exportId: `${Date.now()}`,
  };
}

async function countOwnRows(
  table: RecordTable,
  userId: string,
): Promise<number | null> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("user_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error || count == null) return null;
  return count;
}

export async function deleteSavedRecords(
  _previous: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const userId = await requireUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to delete saved records." };
  }

  if (!isDeletionConfirmed(String(formData.get("confirmation") ?? ""))) {
    return {
      status: "error",
      message: "Type DELETE to confirm. This does not close your account.",
    };
  }

  const supabase = await createClient();
  for (const table of RECORD_TABLES) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) {
      return {
        status: "error",
        message: "Saved records could not be fully removed. Try again.",
      };
    }
  }

  const leftover: Partial<Record<RecordTable, number>> = {};
  for (const table of RECORD_TABLES) {
    const remaining = await countOwnRows(table, userId);
    if (remaining == null) {
      return {
        status: "error",
        message:
          "Records were removed, but Flowelle could not confirm they are gone. Refresh and check again.",
      };
    }
    leftover[table] = remaining;
  }

  const result = interpretDeletion(leftover);
  if (!result.complete) {
    return {
      status: "error",
      message: "Some records are still there. Refresh and try again.",
    };
  }

  const photosRemoved = await removeOwnProfilePhotos(userId);
  if (!photosRemoved) {
    return {
      status: "error",
      message:
        "Records were removed, but the profile photo could not be cleared. Try again.",
    };
  }

  revalidateSettingsSurfaces();
  return {
    status: "success",
    message:
      "Saved records were removed. You are still signed in. This did not delete the account.",
  };
}
