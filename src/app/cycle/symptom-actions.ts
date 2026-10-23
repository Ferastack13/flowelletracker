"use server";

import { revalidatePath } from "next/cache";
import { addCalendarDays, formatUtcDate } from "@/lib/self-care";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  SYMPTOM_NOTE_MAX_LENGTH,
  isSymptomId,
  isSymptomSeverity,
  symptomName,
  type SymptomId,
  type SymptomSeverity,
} from "@/lib/symptoms";

export type SymptomActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

const ENTRY_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readDate(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function isAllowedLogDate(loggedOn: string): boolean {
  const latest = addCalendarDays(formatUtcDate(new Date()), 1);
  return loggedOn >= "1900-01-01" && loggedOn <= latest;
}

function readNotes(value: FormDataEntryValue | null): string | null | undefined {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > SYMPTOM_NOTE_MAX_LENGTH) return undefined;
  return trimmed;
}

function readEntryId(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return ENTRY_ID_PATTERN.test(trimmed) ? trimmed : null;
}

function readSymptomFields(formData: FormData):
  | { ok: false; error: string }
  | {
      ok: true;
      loggedOn: string;
      symptom: SymptomId;
      severity: SymptomSeverity;
      notes: string | null;
    } {
  const loggedOn = readDate(formData.get("loggedOn"));
  const symptom = String(formData.get("symptom") ?? "");
  const severityValue = Number.parseInt(String(formData.get("severity") ?? ""), 10);
  const notes = readNotes(formData.get("notes"));

  if (!loggedOn || !isAllowedLogDate(loggedOn)) {
    return {
      ok: false,
      error: "Choose a date that is not too far in the future.",
    };
  }
  if (!isSymptomId(symptom)) {
    return { ok: false, error: "Choose a symptom from the list." };
  }
  if (!isSymptomSeverity(severityValue)) {
    return {
      ok: false,
      error: "Choose how noticeable it felt, from mild to intense.",
    };
  }
  if (notes === undefined) {
    return {
      ok: false,
      error: `Keep the optional note under ${SYMPTOM_NOTE_MAX_LENGTH} characters.`,
    };
  }

  return {
    ok: true,
    loggedOn,
    symptom,
    severity: severityValue,
    notes,
  };
}

function revalidateSymptomPaths() {
  revalidatePath("/cycle");
  revalidatePath("/dashboard");
}

export async function createSymptomLog(
  _previous: SymptomActionState,
  formData: FormData,
): Promise<SymptomActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to save a symptom." };
  }

  const fields = readSymptomFields(formData);
  if (!fields.ok) {
    return { status: "error", message: fields.error };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("symptom_logs")
    .insert({
      user_id: userId,
      logged_on: fields.loggedOn,
      symptom: fields.symptom,
      severity: fields.severity,
      notes: fields.notes,
    })
    .select("id");

  if (error || !data?.length) {
    return {
      status: "error",
      message: "That symptom could not be saved. Try again.",
    };
  }

  revalidateSymptomPaths();
  return {
    status: "success",
    message: `${symptomName(fields.symptom)} saved for ${fields.loggedOn}.`,
  };
}

export async function updateSymptomLog(
  _previous: SymptomActionState,
  formData: FormData,
): Promise<SymptomActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to update a symptom." };
  }

  const id = readEntryId(formData.get("entryId"));
  if (!id) {
    return { status: "error", message: "That entry could not be updated." };
  }

  const fields = readSymptomFields(formData);
  if (!fields.ok) {
    return { status: "error", message: fields.error };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("symptom_logs")
    .update({
      logged_on: fields.loggedOn,
      symptom: fields.symptom,
      severity: fields.severity,
      notes: fields.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    return {
      status: "error",
      message: "That symptom could not be updated. Try again.",
    };
  }

  if (!data?.length) {
    return {
      status: "error",
      message: "That entry could not be updated. Refresh and try again.",
    };
  }

  revalidateSymptomPaths();
  return {
    status: "success",
    message: `${symptomName(fields.symptom)} updated for ${fields.loggedOn}.`,
  };
}

export async function deleteSymptomLog(
  _previous: SymptomActionState,
  formData: FormData,
): Promise<SymptomActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to remove a symptom." };
  }

  const id = readEntryId(formData.get("entryId"));
  if (!id) {
    return { status: "error", message: "That entry could not be removed." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("symptom_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    return {
      status: "error",
      message: "That symptom could not be removed. Try again.",
    };
  }

  if (!data?.length) {
    return {
      status: "error",
      message: "That entry could not be removed. Refresh and try again.",
    };
  }

  revalidateSymptomPaths();
  return { status: "success", message: "Symptom entry removed." };
}
