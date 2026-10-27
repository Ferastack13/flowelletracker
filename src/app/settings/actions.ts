"use server";

import { revalidatePath } from "next/cache";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { getProfile, upsertProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import {
  DELETE_RECORDS_CONFIRMATION,
  parseProfileForm,
} from "@/lib/profile";

export type SettingsActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

export type ExportActionState = SettingsActionState & {
  filename?: string;
  payload?: string;
};

function revalidateSettingsSurfaces() {
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/cycle");
}

export async function saveProfileSettings(
  _previous: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to save your preferences." };
  }

  const parsed = parseProfileForm({
    displayName: String(formData.get("displayName") ?? ""),
    selfCareIntention: String(formData.get("selfCareIntention") ?? ""),
    showCycleEstimate: formData.get("showCycleEstimate") === "on",
  });

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const saved = await upsertProfile(parsed.profile);
  if (!saved) {
    return {
      status: "error",
      message: "Those preferences could not be saved. Try again.",
    };
  }

  revalidateSettingsSurfaces();
  return { status: "success", message: "Preferences saved." };
}

export async function exportMyData(
  _previous: ExportActionState,
  _formData?: FormData,
): Promise<ExportActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to download your data." };
  }

  const supabase = await createClient();
  const [profile, periods, symptoms, checkins] = await Promise.all([
    getProfile(),
    supabase
      .from("cycle_periods")
      .select("id, started_on, ended_on, created_at, updated_at")
      .eq("user_id", userId)
      .order("started_on", { ascending: false }),
    supabase
      .from("symptom_logs")
      .select("id, logged_on, symptom, severity, notes, created_at, updated_at")
      .eq("user_id", userId)
      .order("logged_on", { ascending: false }),
    supabase
      .from("self_care_checkins")
      .select(
        "id, checked_on, hydration, movement, sleep, personal_care, created_at, updated_at",
      )
      .eq("user_id", userId)
      .order("checked_on", { ascending: false }),
  ]);

  if (periods.error || symptoms.error || checkins.error) {
    return {
      status: "error",
      message: "Your export could not be prepared. Try again.",
    };
  }

  const payload = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      profile,
      cyclePeriods: periods.data ?? [],
      symptomLogs: symptoms.data ?? [],
      selfCareCheckins: checkins.data ?? [],
    },
    null,
    2,
  );

  return {
    status: "success",
    message: "Your data file is ready.",
    filename: `flowelle-export-${new Date().toISOString().slice(0, 10)}.json`,
    payload,
  };
}

export async function deleteSavedRecords(
  _previous: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to delete saved records." };
  }

  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== DELETE_RECORDS_CONFIRMATION) {
    return {
      status: "error",
      message: `Type ${DELETE_RECORDS_CONFIRMATION} to confirm.`,
    };
  }

  const supabase = await createClient();
  const tables = [
    "cycle_periods",
    "symptom_logs",
    "self_care_checkins",
    "profiles",
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) {
      return {
        status: "error",
        message: "Saved records could not be fully removed. Try again.",
      };
    }
  }

  revalidateSettingsSurfaces();
  return {
    status: "success",
    message:
      "Saved records were removed. Your sign-in still works. This does not delete the account itself.",
  };
}
