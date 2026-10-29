import type { Metadata } from "next";
import { Suspense } from "react";
import { CycleTracker } from "@/app/cycle/cycle-tracker";
import { SymptomLog } from "@/app/cycle/symptom-log";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { getSignedInEmail } from "@/lib/supabase/auth";
import { loadCyclePeriods } from "@/lib/supabase/cycle-periods";
import { getProfile } from "@/lib/supabase/profiles";
import { loadSymptomLogs } from "@/lib/supabase/symptom-logs";
import { emptyProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Cycle Tracker",
  description: "Log period dates and symptoms in Flowelle.",
};

export default function CyclePage() {
  return (
    <AppShellWithAuth
      title="Cycle Tracker"
      description="Record the dates and symptoms you already know. Next-period windows are approximate and never a diagnosis."
    >
      <Suspense fallback={<SessionRecordsFallback label="Loading your cycle log…" />}>
        <CycleSession />
      </Suspense>
    </AppShellWithAuth>
  );
}

async function CycleSession() {
  const email = await getSignedInEmail();
  const loadedPeriods = email
    ? await loadCyclePeriods()
    : { periods: [], error: null };
  const loadedSymptoms = email
    ? await loadSymptomLogs()
    : { entries: [], error: null };
  const profile = email ? await getProfile() : emptyProfile;

  return (
    <div className="flex flex-col gap-6">
      {loadedPeriods.error || loadedSymptoms.error ? (
        <p className="text-sm text-destructive" role="alert">
          {loadedPeriods.error ?? loadedSymptoms.error}
        </p>
      ) : null}
      <CycleTracker
        signedIn={Boolean(email)}
        periods={loadedPeriods.periods}
        showCycleEstimate={profile.showCycleEstimate}
      />
      {email ? <SymptomLog entries={loadedSymptoms.entries} /> : null}
    </div>
  );
}

function SessionRecordsFallback({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 px-5 py-8">
      <p className="font-serif text-lg text-plum">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Checking whether you are signed in.
      </p>
    </div>
  );
}
