"use server";

import { revalidatePath } from "next/cache";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { getSelfCareCheckinForDate } from "@/lib/supabase/self-care-checkins";
import { createClient } from "@/lib/supabase/server";
import {
  addCalendarDays,
  emptySelfCareCheckin,
  formatUtcDate,
  hasAnySelfCarePillar,
  isSelfCarePillarId,
  toggleSelfCarePillarState,
  type SelfCarePillarId,
} from "@/lib/self-care";

export type SelfCareActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

function readDate(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function isAllowedCheckinDate(checkedOn: string): boolean {
  const latest = addCalendarDays(formatUtcDate(new Date()), 1);
  return checkedOn <= latest;
}

export async function toggleSelfCarePillar(
  _previous: SelfCareActionState,
  formData: FormData,
): Promise<SelfCareActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to save a self-care check-in." };
  }

  const checkedOn = readDate(formData.get("checkedOn"));
  const pillar = String(formData.get("pillar") ?? "");
  if (!checkedOn || !isSelfCarePillarId(pillar)) {
    return { status: "error", message: "Choose a date and a pillar." };
  }
  if (!isAllowedCheckinDate(checkedOn)) {
    return { status: "error", message: "That date is too far in the future." };
  }

  const existing =
    (await getSelfCareCheckinForDate(checkedOn)) ??
    emptySelfCareCheckin(checkedOn);
  const next = toggleSelfCarePillarState(existing, pillar);
  const supabase = await createClient();

  if (!hasAnySelfCarePillar(next)) {
    if (!existing.id) {
      return { status: "success", message: "Check-in cleared." };
    }

    const { error } = await supabase
      .from("self_care_checkins")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", userId);

    if (error) {
      return {
        status: "error",
        message: "That check-in could not be updated. Try again.",
      };
    }
  } else {
    const { error } = await supabase.from("self_care_checkins").upsert(
      {
        user_id: userId,
        checked_on: checkedOn,
        hydration: next.hydration,
        movement: next.movement,
        sleep: next.sleep,
        personal_care: next.personalCare,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,checked_on" },
    );

    if (error) {
      return {
        status: "error",
        message: "That check-in could not be saved. Try again.",
      };
    }
  }

  const { safeResyncUserReminders } = await import(
    "@/lib/notifications/safe-resync"
  );
  await safeResyncUserReminders(userId);

  revalidatePath("/self-care");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { status: "success", message: "Saved" };
}

export async function toggleWellnessActivity(
  _previous: SelfCareActionState,
  formData: FormData,
): Promise<SelfCareActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return {
      status: "error",
      message: "Sign in to update wellness activities.",
    };
  }

  const localDate = readDate(formData.get("localDate"));
  const recommendationId = String(formData.get("recommendationId") ?? "").trim();
  const shouldComplete = formData.get("completed") === "on";

  if (!localDate || !isAllowedCheckinDate(localDate)) {
    return { status: "error", message: "Choose a valid date." };
  }

  const { isWellnessRecommendationId } = await import(
    "@/lib/wellness/recommendations"
  );
  if (!isWellnessRecommendationId(recommendationId)) {
    return { status: "error", message: "That activity could not be updated." };
  }

  const supabase = await createClient();

  if (shouldComplete) {
    const { error } = await supabase.from("self_care_activity_completions").upsert(
      {
        user_id: userId,
        local_date: localDate,
        recommendation_id: recommendationId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,local_date,recommendation_id" },
    );
    if (error) {
      return {
        status: "error",
        message: "That activity could not be saved. Try again.",
      };
    }
  } else {
    const { error } = await supabase
      .from("self_care_activity_completions")
      .delete()
      .eq("user_id", userId)
      .eq("local_date", localDate)
      .eq("recommendation_id", recommendationId);
    if (error) {
      return {
        status: "error",
        message: "That activity could not be cleared. Try again.",
      };
    }
  }

  revalidatePath("/self-care");
  revalidatePath("/dashboard");
  return { status: "success", message: "Saved" };
}
