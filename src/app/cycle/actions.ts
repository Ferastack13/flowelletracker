"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import {
  isBleedingDateInPeriod,
  parseBleedingWrite,
  bleedingWriteErrorMessage,
} from "@/lib/bleeding";
import { referenceDateToday, type CyclePeriod } from "@/lib/cycle";
import { parseUsualCycleLength } from "@/lib/cycle-intelligence";
import {
  findOverlappingPeriod,
  overlapConflictMessage,
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
  revalidatePath("/settings");
}

async function resyncReminders(userId: string) {
  const { safeResyncUserReminders } = await import(
    "@/lib/notifications/safe-resync"
  );
  await safeResyncUserReminders(userId);
}

async function loadOwnPeriods(
  userId: string,
): Promise<{ periods: CyclePeriod[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cycle_periods")
    .select("id, started_on, ended_on")
    .eq("user_id", userId)
    .order("started_on", { ascending: false })
    .limit(60);

  if (error) {
    return { periods: [], error: "Period dates could not be checked." };
  }

  return {
    periods: (data ?? []).map((row) => ({
      id: String(row.id),
      startedOn: String(row.started_on),
      endedOn: typeof row.ended_on === "string" ? row.ended_on : null,
    })),
    error: null,
  };
}

async function assertNoOverlap(input: {
  userId: string;
  startedOn: string;
  endedOn: string | null;
  excludeId?: string | null;
}): Promise<CycleActionState | null> {
  const loaded = await loadOwnPeriods(input.userId);
  if (loaded.error) {
    return { status: "error", message: loaded.error };
  }

  const conflict = findOverlappingPeriod(
    loaded.periods,
    { startedOn: input.startedOn, endedOn: input.endedOn },
    input.excludeId,
  );
  if (conflict) {
    return { status: "error", message: overlapConflictMessage(conflict) };
  }
  return null;
}

async function assertBleedingFitsPeriod(input: {
  userId: string;
  periodId: string;
  loggedOn: string;
}): Promise<
  | { ok: true; period: CyclePeriod }
  | { ok: false; message: string }
> {
  const supabase = await createClient();
  const current = await supabase
    .from("cycle_periods")
    .select("id, started_on, ended_on")
    .eq("id", input.periodId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (current.error || !current.data) {
    return {
      ok: false,
      message: "That period could not be found. Refresh and try again.",
    };
  }

  const period: CyclePeriod = {
    id: String(current.data.id),
    startedOn: String(current.data.started_on),
    endedOn:
      typeof current.data.ended_on === "string" ? current.data.ended_on : null,
  };

  if (
    !isBleedingDateInPeriod({
      loggedOn: input.loggedOn,
      startedOn: period.startedOn,
      endedOn: period.endedOn,
      today: referenceDateToday(),
    })
  ) {
    return {
      ok: false,
      message: period.endedOn
        ? `Bleeding days must fall between ${period.startedOn} and ${period.endedOn}.`
        : `Bleeding days must fall between ${period.startedOn} and today for this ongoing period.`,
    };
  }

  return { ok: true, period };
}

async function assertPeriodRangeKeepsBleeding(input: {
  userId: string;
  periodId: string;
  startedOn: string;
  endedOn: string | null;
}): Promise<CycleActionState | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("period_bleeding_logs")
    .select("logged_on")
    .eq("user_id", input.userId)
    .eq("period_id", input.periodId);

  if (error) {
    return {
      status: "error",
      message: "Existing bleeding days could not be checked.",
    };
  }

  for (const row of data ?? []) {
    const loggedOn = String(row.logged_on ?? "");
    if (
      !isBleedingDateInPeriod({
        loggedOn,
        startedOn: input.startedOn,
        endedOn: input.endedOn,
      })
    ) {
      return {
        status: "error",
        message: `A bleeding day on ${loggedOn} would fall outside the new dates. Change or remove that day first.`,
      };
    }
  }

  return null;
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

  const overlap = await assertNoOverlap({
    userId,
    startedOn: parsed.startedOn,
    endedOn: null,
  });
  if (overlap) return overlap;

  const supabase = await createClient();
  const { error } = await supabase.from("cycle_periods").insert({
    user_id: userId,
    started_on: parsed.startedOn,
  });

  if (error) {
    return { status: "error", message: periodWriteErrorMessage(error.code) };
  }

  await resyncReminders(userId);
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

  const overlap = await assertNoOverlap({
    userId,
    startedOn: range.startedOn,
    endedOn: range.endedOn,
    excludeId: id,
  });
  if (overlap) return overlap;

  const bleedingGuard = await assertPeriodRangeKeepsBleeding({
    userId,
    periodId: id,
    startedOn: range.startedOn,
    endedOn: range.endedOn,
  });
  if (bleedingGuard) return bleedingGuard;

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

  await resyncReminders(userId);
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

  const overlap = await assertNoOverlap({
    userId,
    startedOn: parsed.startedOn,
    endedOn: parsed.endedOn,
    excludeId: id,
  });
  if (overlap) return overlap;

  const bleedingGuard = await assertPeriodRangeKeepsBleeding({
    userId,
    periodId: id,
    startedOn: parsed.startedOn,
    endedOn: parsed.endedOn,
  });
  if (bleedingGuard) return bleedingGuard;

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

  await resyncReminders(userId);
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

  await resyncReminders(userId);
  revalidateCycleSurfaces();
  return { status: "success", message: "Period removed." };
}

export async function upsertBleedingLog(
  _previous: CycleActionState,
  formData: FormData,
): Promise<CycleActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to save bleeding days." };
  }

  const parsed = parseBleedingWrite({
    periodId: formData.get("periodId"),
    loggedOn: formData.get("loggedOn"),
    intensity: formData.get("intensity"),
  });
  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const fit = await assertBleedingFitsPeriod({
    userId,
    periodId: parsed.periodId,
    loggedOn: parsed.loggedOn,
  });
  if (!fit.ok) {
    return { status: "error", message: fit.message };
  }

  const supabase = await createClient();
  const existing = await supabase
    .from("period_bleeding_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("period_id", parsed.periodId)
    .eq("logged_on", parsed.loggedOn)
    .maybeSingle();

  if (existing.error) {
    return {
      status: "error",
      message: "That bleeding day could not be saved. Try again.",
    };
  }

  if (existing.data?.id) {
    const { data, error } = await supabase
      .from("period_bleeding_logs")
      .update({
        intensity: parsed.intensity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.data.id)
      .eq("user_id", userId)
      .select("id");

    if (error || !data?.length) {
      return {
        status: "error",
        message: bleedingWriteErrorMessage(error?.code),
      };
    }

    revalidateCycleSurfaces();
    return { status: "success", message: "Bleeding day updated." };
  }

  const { error } = await supabase.from("period_bleeding_logs").insert({
    user_id: userId,
    period_id: parsed.periodId,
    logged_on: parsed.loggedOn,
    intensity: parsed.intensity,
  });

  if (error) {
    return { status: "error", message: bleedingWriteErrorMessage(error.code) };
  }

  revalidateCycleSurfaces();
  return { status: "success", message: "Bleeding day saved." };
}

export async function deleteBleedingLog(
  _previous: CycleActionState,
  formData: FormData,
): Promise<CycleActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to remove a bleeding day." };
  }

  const id = parsePeriodId(formData.get("bleedingId"));
  if (!id) {
    return {
      status: "error",
      message: "That bleeding day could not be removed.",
    };
  }

  if (String(formData.get("confirm") ?? "") !== "yes") {
    return {
      status: "error",
      message: "Confirm before removing this bleeding day.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("period_bleeding_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");

  if (error || !data?.length) {
    return {
      status: "error",
      message: "That bleeding day could not be removed. Refresh and try again.",
    };
  }

  revalidateCycleSurfaces();
  return { status: "success", message: "Bleeding day removed." };
}

export async function completeCycleSetup(
  _previous: CycleActionState,
  formData: FormData,
): Promise<CycleActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to complete cycle setup." };
  }

  const parsed = parsePeriodWrite({
    startedOn: formData.get("startedOn"),
    endedOn: formData.get("endedOn"),
  });
  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const lengthRaw = formData.get("usualCycleLength");
  const knowsLength = String(formData.get("knowsCycleLength") ?? "") !== "no";
  let usualCycleLengthDays: number | null = null;
  if (knowsLength) {
    const length = parseUsualCycleLength(lengthRaw);
    if (!length.ok) {
      return { status: "error", message: length.message };
    }
    usualCycleLengthDays = length.value;
  }

  const overlap = await assertNoOverlap({
    userId,
    startedOn: parsed.startedOn,
    endedOn: parsed.endedOn,
  });
  if (overlap) return overlap;

  const supabase = await createClient();
  const { error } = await supabase.from("cycle_periods").insert({
    user_id: userId,
    started_on: parsed.startedOn,
    ended_on: parsed.endedOn,
  });

  if (error) {
    return { status: "error", message: periodWriteErrorMessage(error.code) };
  }

  const { saveProfileFields } = await import("@/lib/supabase/profiles");
  const saved = await saveProfileFields({ usualCycleLengthDays });
  await resyncReminders(userId);
  if (!saved.ok) {
    revalidateCycleSurfaces();
    return {
      status: "success",
      message:
        "Period dates were saved, but your usual cycle length could not be stored. You can add it in Settings.",
    };
  }

  revalidateCycleSurfaces();
  return {
    status: "success",
    message: usualCycleLengthDays
      ? "Cycle setup saved. Estimates will use your reported length until more history is recorded."
      : "Cycle setup saved. More period starts will help Flowelle estimate your next period.",
  };
}
