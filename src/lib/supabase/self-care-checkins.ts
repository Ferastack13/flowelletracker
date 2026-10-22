import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import type { SelfCareCheckin } from "@/lib/self-care";

interface SelfCareCheckinRow {
  id: string;
  checked_on: string;
  hydration: boolean;
  movement: boolean;
  sleep: boolean;
  personal_care: boolean;
}

function mapCheckin(row: SelfCareCheckinRow): SelfCareCheckin {
  return {
    id: row.id,
    checkedOn: row.checked_on,
    hydration: row.hydration,
    movement: row.movement,
    sleep: row.sleep,
    personalCare: row.personal_care,
  };
}

export async function listSelfCareCheckins(
  days = 28,
): Promise<SelfCareCheckin[]> {
  const userId = await getSignedInUserId();
  if (!userId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("self_care_checkins")
    .select("id, checked_on, hydration, movement, sleep, personal_care")
    .eq("user_id", userId)
    .order("checked_on", { ascending: false })
    .limit(days);

  if (error || !data) return [];
  return data.map((row) => mapCheckin(row as SelfCareCheckinRow));
}

export async function getSelfCareCheckinForDate(
  checkedOn: string,
): Promise<SelfCareCheckin | null> {
  const userId = await getSignedInUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("self_care_checkins")
    .select("id, checked_on, hydration, movement, sleep, personal_care")
    .eq("user_id", userId)
    .eq("checked_on", checkedOn)
    .maybeSingle();

  if (error || !data) return null;
  return mapCheckin(data as SelfCareCheckinRow);
}
