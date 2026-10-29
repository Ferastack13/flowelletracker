import type { Metadata } from "next";
import { Suspense } from "react";
import { CycleOverviewCard } from "@/components/dashboard/cycle-overview-card";
import { DailyNoteCard } from "@/components/dashboard/daily-note-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentSymptoms } from "@/components/dashboard/recent-symptoms";
import { SelfCareProgress } from "@/components/dashboard/self-care-progress";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { getSignedInEmail } from "@/lib/supabase/auth";
import { loadCyclePeriods } from "@/lib/supabase/cycle-periods";
import { loadSelfCareCheckins } from "@/lib/supabase/self-care-checkins";
import { loadSymptomLogs } from "@/lib/supabase/symptom-logs";
import { getProfile } from "@/lib/supabase/profiles";
import { emptyProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Flowelle daily overview.",
};

export default function DashboardPage() {
  return (
    <AppShellWithAuth>
      <Suspense fallback={<DashboardSessionFallback />}>
        <DashboardSession />
      </Suspense>
    </AppShellWithAuth>
  );
}

async function DashboardSession() {
  const email = await getSignedInEmail();
  const signedIn = Boolean(email);
  const periods = signedIn
    ? await loadCyclePeriods()
    : { periods: [], error: null };
  const checkins = signedIn
    ? await loadSelfCareCheckins()
    : { checkins: [], error: null };
  const symptoms = signedIn
    ? await loadSymptomLogs()
    : { entries: [], error: null };
  const profile = signedIn ? await getProfile() : emptyProfile;
  const loadError = periods.error ?? checkins.error ?? symptoms.error;

  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-5 sm:gap-6">
      <WelcomeBanner
        signedIn={signedIn}
        displayName={profile.displayName}
        subtitle={
          profile.selfCareIntention ||
          "A calm overview of your cycle, care, and daily note."
        }
      />

      {loadError ? (
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-stretch lg:gap-6">
        <CycleOverviewCard
          periods={periods.periods}
          signedIn={signedIn}
          showCycleEstimate={profile.showCycleEstimate}
        />
        <DailyNoteCard />
      </div>

      <QuickActions />
      <RecentSymptoms signedIn={signedIn} entries={symptoms.entries} />
      <SelfCareProgress signedIn={signedIn} checkins={checkins.checkins} />
    </div>
  );
}

function DashboardSessionFallback() {
  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-5 sm:gap-6">
      <div className="rounded-2xl border border-border/60 bg-card/80 px-5 py-8">
        <p className="font-serif text-lg text-plum">Loading your dashboard…</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Checking whether you are signed in.
        </p>
      </div>
    </div>
  );
}
