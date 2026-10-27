"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import {
  parsePeriodId,
  parsePeriodWrite,
  periodWriteErrorMessage,
  readCalendarDate,
} from "@/lib/cycle-records";

export type CycleActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

function revalidateCycleSurfaces() {
  revalidatePath("/cycle");
  revalidatePath("/dashboard");
}

export async function logPeriodStart(
  _previous: CycleActionState,
  formData: FormData,
): Promise<CycleActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to save a period start." };
  }

  const parsed = parsePeriodWrite({ startedOn: formData.get("startedOn") });
  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("cycle_periods").insert({
    user_id: userId,
    started_on: parsed.startedOn,
  });

  if (error) {
    return { status: "error", message: periodWriteErrorMessage(error.code) };
  }

  revalidateCycleSurfaces();
  return { status: "success", message: "Period start saved." };
}

export async function savePeriodEnd(
  _previous: CycleActionState,
  formData: FormData,
): Promise<CycleActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to update a period." };
  }

  const id = parsePeriodId(formData.get("periodId"));
  const endedOn = readCalendarDate(formData.get("endedOn"));

  if (!id || !endedOn) {
    return { status: "error", message: "Choose an end date." };
  }

  const supabase = await createClient();
  const current = await supabase
    .from("cycle_periods")
    .select("started_on")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (current.error || !current.data) {
    return {
      status: "error",
      message: "That period could not be updated. Refresh and try again.",
    };
  }

  const range = parsePeriodWrite({
    startedOn: current.data.started_on,
    endedOn,
  });
  if (!range.ok) {
    return { status: "error", message: range.message };
  }

  const { data, error } = await supabase
    .from("cycle_periods")
    .update({ ended_on: range.endedOn, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    return { status: "error", message: periodWriteErrorMessage(error.code) };
  }

  if (!data?.length) {
    return {
      status: "error",
      message: "That period could not be updated. Refresh and try again.",
    };
  }

  revalidateCycleSurfaces();
  return { status: "success", message: "Period end saved." };
}

export async function updatePeriodRecord(
  _previous: CycleActionState,
  formData: FormData,
): Promise<CycleActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to update a period." };
  }

  const id = parsePeriodId(formData.get("periodId"));
  const parsed = parsePeriodWrite({
    startedOn: formData.get("startedOn"),
    endedOn: formData.get("endedOn"),
  });

  if (!id) {
    return { status: "error", message: "That period could not be updated." };
  }
  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cycle_periods")
    .update({
      started_on: parsed.startedOn,
      ended_on: parsed.endedOn,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    return { status: "error", message: periodWriteErrorMessage(error.code) };
  }

  if (!data?.length) {
    return {
      status: "error",
      message: "That period could not be updated. Refresh and try again.",
    };
  }

  revalidateCycleSurfaces();
  return { status: "success", message: "Period updated." };
}

export async function deletePeriodRecord(
  _previous: CycleActionState,
  formData: FormData,
): Promise<CycleActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to remove a period." };
  }

  const id = parsePeriodId(formData.get("periodId"));
  if (!id) {
    return { status: "error", message: "That period could not be removed." };
  }

  if (String(formData.get("confirm") ?? "") !== "yes") {
    return { status: "error", message: "Confirm before removing this period." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cycle_periods")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    return {
      status: "error",
      message: "That period could not be removed. Try again.",
    };
  }

  if (!data?.length) {
    return {
      status: "error",
      message: "That period could not be removed. Refresh and try again.",
    };
  }

  revalidateCycleSurfaces();
  return { status: "success", message: "Period removed." };
}
