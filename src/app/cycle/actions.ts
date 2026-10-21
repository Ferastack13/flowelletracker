"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/cycle-periods";

export type CycleActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

function readDate(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

export async function logPeriodStart(
  _previous: CycleActionState,
  formData: FormData,
): Promise<CycleActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to save a period start." };
  }

  const startedOn = readDate(formData.get("startedOn"));
  if (!startedOn) {
    return { status: "error", message: "Choose a start date." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("cycle_periods").insert({
    user_id: userId,
    started_on: startedOn,
  });

  if (error) {
    return {
      status: "error",
      message: "That date could not be saved. Try again.",
    };
  }

  revalidatePath("/cycle");
  revalidatePath("/dashboard");
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

  const id = String(formData.get("periodId") ?? "");
  const endedOn = readDate(formData.get("endedOn"));
  if (!id || !endedOn) {
    return { status: "error", message: "Choose an end date." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cycle_periods")
    .update({ ended_on: endedOn, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return {
      status: "error",
      message: "The end date could not be saved. It must be on or after the start.",
    };
  }

  revalidatePath("/cycle");
  revalidatePath("/dashboard");
  return { status: "success", message: "Period end saved." };
}
