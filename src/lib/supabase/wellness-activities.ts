import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { isWellnessRecommendationId } from "@/lib/wellness/recommendations";

export interface WellnessActivityCompletion {
  id: string;
  localDate: string;
  recommendationId: string;
  completedAt: string;
}

export async function loadWellnessCompletionsForDate(
  localDate: string,
): Promise<{
  completions: WellnessActivityCompletion[];
  completedIds: string[];
  error: string | null;
}> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { completions: [], completedIds: [], error: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("self_care_activity_completions")
    .select("id, local_date, recommendation_id, completed_at")
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .order("completed_at", { ascending: true });

  if (error) {
    return {
      completions: [],
      completedIds: [],
      error: "Wellness activities could not be loaded. Refresh and try again.",
    };
  }

  const completions: WellnessActivityCompletion[] = [];
  for (const row of data ?? []) {
    const recommendationId = String(row.recommendation_id ?? "");
    if (!isWellnessRecommendationId(recommendationId)) continue;
    completions.push({
      id: String(row.id),
      localDate: String(row.local_date),
      recommendationId,
      completedAt: String(row.completed_at),
    });
  }

  return {
    completions,
    completedIds: completions.map((item) => item.recommendationId),
    error: null,
  };
}
