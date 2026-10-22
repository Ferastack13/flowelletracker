import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import type { CyclePeriod } from "@/lib/cycle";

interface CyclePeriodRow {
  id: string;
  started_on: string;
  ended_on: string | null;
}

function mapPeriod(row: CyclePeriodRow): CyclePeriod {
  return {
    id: row.id,
    startedOn: row.started_on,
    endedOn: row.ended_on,
  };
}

export async function listCyclePeriods(): Promise<CyclePeriod[]> {
  const userId = await getSignedInUserId();
  if (!userId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cycle_periods")
    .select("id, started_on, ended_on")
    .eq("user_id", userId)
    .order("started_on", { ascending: false })
    .limit(24);

  if (error || !data) return [];
  return data.map((row) => mapPeriod(row as CyclePeriodRow));
}
