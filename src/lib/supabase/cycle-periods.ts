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

export async function loadCyclePeriods(): Promise<{
  periods: CyclePeriod[];
  error: string | null;
}> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { periods: [], error: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cycle_periods")
    .select("id, started_on, ended_on")
    .eq("user_id", userId)
    .order("started_on", { ascending: false })
    .limit(24);

  if (error) {
    return {
      periods: [],
      error: "Period dates could not be loaded. Refresh and try again.",
    };
  }

  return {
    periods: (data ?? []).map((row) => mapPeriod(row as CyclePeriodRow)),
    error: null,
  };
}

export async function listCyclePeriods(): Promise<CyclePeriod[]> {
  const { periods } = await loadCyclePeriods();
  return periods;
}
