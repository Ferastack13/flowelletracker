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
  pillarDone,
  toggleSelfCarePillarState,
  type SelfCarePillarId,
} from "@/lib/self-care";

export type SelfCareActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

const SELF_CARE_PILLAR_NAMES: Record<SelfCarePillarId, string> = {
  hydration: "Hydration",
  movement: "Movement",
  sleep: "Sleep",
  "personal-care": "Personal care",
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

  revalidatePath("/self-care");
  revalidatePath("/dashboard");
  return {
    status: "success",
    message: pillarDone(next, pillar)
      ? `${SELF_CARE_PILLAR_NAMES[pillar]} marked for ${checkedOn}.`
      : `${SELF_CARE_PILLAR_NAMES[pillar]} cleared for ${checkedOn}.`,
  };
}
