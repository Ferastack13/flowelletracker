import { createClient } from "@/lib/supabase/server";
import { getSignedInUserId } from "@/lib/supabase/auth";
import {
  isSymptomId,
  isSymptomSeverity,
  type SymptomLog,
} from "@/lib/symptoms";

interface SymptomLogRow {
  id: string;
  logged_on: string;
  symptom: string;
  severity: number;
  notes: string | null;
}

function mapSymptomLog(row: SymptomLogRow): SymptomLog | null {
  if (!isSymptomId(row.symptom) || !isSymptomSeverity(row.severity)) {
    return null;
  }

  return {
    id: row.id,
    loggedOn: row.logged_on,
    symptom: row.symptom,
    severity: row.severity,
    notes: row.notes,
  };
}

export async function loadSymptomLogs(): Promise<{
  entries: SymptomLog[];
  error: string | null;
}> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { entries: [], error: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("symptom_logs")
    .select("id, logged_on, symptom, severity, notes")
    .eq("user_id", userId)
    .order("logged_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return {
      entries: [],
      error: "Symptom entries could not be loaded. Refresh and try again.",
    };
  }

  return {
    entries: (data ?? [])
      .map((row) => mapSymptomLog(row as SymptomLogRow))
      .filter((row): row is SymptomLog => row !== null),
    error: null,
  };
}

export async function listSymptomLogs(): Promise<SymptomLog[]> {
  const { entries } = await loadSymptomLogs();
  return entries;
}
