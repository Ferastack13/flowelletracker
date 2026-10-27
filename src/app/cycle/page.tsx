import type { Metadata } from "next";
import { Suspense } from "react";
import { CycleTracker } from "@/app/cycle/cycle-tracker";
import { SymptomLog } from "@/app/cycle/symptom-log";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { buildCycleOverview } from "@/lib/cycle";
import { getSignedInEmail } from "@/lib/supabase/auth";
import { listCyclePeriods } from "@/lib/supabase/cycle-periods";
import { getProfile } from "@/lib/supabase/profiles";
import { listSymptomLogs } from "@/lib/supabase/symptom-logs";
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
  const periods = email ? await listCyclePeriods() : [];
  const symptoms = email ? await listSymptomLogs() : [];
  const profile = email ? await getProfile() : emptyProfile;
  const overview = buildCycleOverview(periods);

  return (
    <div className="flex flex-col gap-6">
      <CycleTracker
        signedIn={Boolean(email)}
        periods={periods}
        overview={overview}
        showCycleEstimate={profile.showCycleEstimate}
      />
      {email ? <SymptomLog entries={symptoms} /> : null}
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
