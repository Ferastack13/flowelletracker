import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import {
  isBleedingIntensity,
  type PeriodBleedingLog,
} from "@/lib/bleeding";

interface BleedingLogRow {
  id: string;
  period_id: string;
  logged_on: string;
  intensity: string;
}

function mapLog(row: BleedingLogRow): PeriodBleedingLog | null {
  if (!isBleedingIntensity(row.intensity)) return null;
  return {
    id: row.id,
    periodId: row.period_id,
    loggedOn: row.logged_on,
    intensity: row.intensity,
  };
}

export async function loadBleedingLogs(): Promise<{
  entries: PeriodBleedingLog[];
  error: string | null;
}> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { entries: [], error: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("period_bleeding_logs")
    .select("id, period_id, logged_on, intensity")
    .eq("user_id", userId)
    .order("logged_on", { ascending: false })
    .limit(120);

  if (error) {
    return {
      entries: [],
      error: "Bleeding days could not be loaded. Refresh and try again.",
    };
  }

  const entries: PeriodBleedingLog[] = [];
  for (const row of data ?? []) {
    const mapped = mapLog(row as BleedingLogRow);
    if (mapped) entries.push(mapped);
  }

  return { entries, error: null };
}
