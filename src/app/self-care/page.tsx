import type { Metadata } from "next";
import { Suspense } from "react";
import { SelfCareTracker } from "@/app/self-care/self-care-tracker";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { DailyWellnessPanel } from "@/components/wellness/daily-wellness-panel";
import { emptyProfile } from "@/lib/profile";
import { zonedCalendarDate } from "@/lib/notifications/time";
import { getSignedInEmail } from "@/lib/supabase/auth";
import { loadCyclePeriods } from "@/lib/supabase/cycle-periods";
import { getProfile } from "@/lib/supabase/profiles";
import { listSelfCareCheckins } from "@/lib/supabase/self-care-checkins";
import { loadSymptomLogs } from "@/lib/supabase/symptom-logs";
import { loadWellnessCompletionsForDate } from "@/lib/supabase/wellness-activities";
import { buildDailyWellnessPlan } from "@/lib/wellness/daily";

export const metadata: Metadata = {
  title: "Self-care",
  description:
    "Personalized wellness suggestions and daily care check-ins in Flowelle.",
};

export default function SelfCarePage() {
  return (
    <AppShellWithAuth
      title="Self-care"
      description="Phase-aware wellness ideas plus the care you already gave yourself today."
    >
      <Suspense
        fallback={<SessionRecordsFallback label="Loading your self-care space…" />}
      >
        <SelfCareSession />
      </Suspense>
    </AppShellWithAuth>
  );
}

async function SelfCareSession() {
  const email = await getSignedInEmail();
  const signedIn = Boolean(email);
  const checkins = signedIn ? await listSelfCareCheckins() : [];
  const periods = signedIn
    ? await loadCyclePeriods()
    : { periods: [], error: null };
  const symptoms = signedIn
    ? await loadSymptomLogs()
    : { entries: [], error: null };
  const profile = signedIn ? await getProfile() : emptyProfile;
  const todayLocal = zonedCalendarDate(
    new Date(),
    profile.notifications.timezone || "UTC",
  );
  const completions = signedIn
    ? await loadWellnessCompletionsForDate(todayLocal)
    : { completions: [], completedIds: [], error: null };

  const wellness = buildDailyWellnessPlan({
    periods: periods.periods,
    today: todayLocal,
    usualCycleLengthDays: profile.usualCycleLengthDays,
    symptomEntries: symptoms.entries,
    completedIds: completions.completedIds,
    limit: 6,
  });

  const loadError =
    periods.error ?? symptoms.error ?? completions.error;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {loadError ? (
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>
      ) : null}
      <DailyWellnessPanel
        signedIn={signedIn}
        today={wellness.today}
        phase={wellness.phase}
        recommendations={wellness.recommendations}
        progress={wellness.progress}
      />
      <SelfCareTracker signedIn={signedIn} checkins={checkins} />
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
