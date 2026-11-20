import type { Metadata } from "next";
import { Suspense } from "react";
import { CycleSetupCard } from "@/components/cycle/cycle-setup-card";
import { CycleCalendar } from "@/components/dashboard/cycle-calendar";
import { CycleOverviewCard } from "@/components/dashboard/cycle-overview-card";
import { CycleStatsCard } from "@/components/dashboard/cycle-stats-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentSymptoms } from "@/components/dashboard/recent-symptoms";
import { SelfCareProgress } from "@/components/dashboard/self-care-progress";
import { TodayInsightsCard } from "@/components/dashboard/today-insights-card";
import { UpcomingCycleEvents } from "@/components/dashboard/upcoming-cycle-events";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { referenceDateToday } from "@/lib/cycle";
import { buildCycleIntelligence } from "@/lib/cycle-intelligence";
import { emptyProfile } from "@/lib/profile";
import { getSignedInEmail } from "@/lib/supabase/auth";
import { loadBleedingLogs } from "@/lib/supabase/bleeding-logs";
import { loadCyclePeriods } from "@/lib/supabase/cycle-periods";
import { getProfile } from "@/lib/supabase/profiles";
import { loadSelfCareCheckins } from "@/lib/supabase/self-care-checkins";
import { loadSymptomLogs } from "@/lib/supabase/symptom-logs";

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
  const bleeding = signedIn
    ? await loadBleedingLogs()
    : { entries: [], error: null };
  const checkins = signedIn
    ? await loadSelfCareCheckins()
    : { checkins: [], error: null };
  const symptoms = signedIn
    ? await loadSymptomLogs()
    : { entries: [], error: null };
  const profile = signedIn ? await getProfile() : emptyProfile;
  const loadError =
    periods.error ?? bleeding.error ?? checkins.error ?? symptoms.error;

  const intelligence = buildCycleIntelligence(periods.periods, {
    today: referenceDateToday(),
    usualCycleLengthDays: profile.usualCycleLengthDays,
  });

  const needsSetup = signedIn && periods.periods.length === 0;
  const cycleSummary = !signedIn
    ? "Preview your dashboard. Sign in to save period dates and care records."
    : needsSetup
      ? "Start with your most recent period dates to personalise this overview."
      : intelligence.overview.periodStatus.detail;

  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-5 sm:gap-6">
      <WelcomeBanner
        signedIn={signedIn}
        displayName={profile.displayName}
        photoUrl={profile.photoUrl}
        cycleSummary={cycleSummary}
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

      {needsSetup ? <CycleSetupCard /> : null}

      <div className="grid min-w-0 gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch lg:gap-6">
        <CycleOverviewCard
          periods={periods.periods}
          signedIn={signedIn}
          showCycleEstimate={profile.showCycleEstimate}
          usualCycleLengthDays={profile.usualCycleLengthDays}
        />
        <TodayInsightsCard insights={intelligence.insights} />
      </div>

      <QuickActions />

      <UpcomingCycleEvents
        nextPeriod={intelligence.nextPeriod}
        ovulation={intelligence.ovulation}
        fertileWindow={intelligence.fertileWindow}
        showEstimates={profile.showCycleEstimate}
      />

      <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-stretch lg:gap-6">
        <CycleStatsCard
          statistics={intelligence.statistics}
          irregular={intelligence.irregular}
        />
        <SelfCareProgress signedIn={signedIn} checkins={checkins.checkins} />
      </div>

      <CycleCalendar
        periods={periods.periods}
        ovulation={intelligence.ovulation}
        fertileWindow={intelligence.fertileWindow}
        showEstimates={profile.showCycleEstimate}
      />

      <RecentSymptoms signedIn={signedIn} entries={symptoms.entries} />
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
