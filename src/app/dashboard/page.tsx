import type { Metadata } from "next";
import { CycleOverviewCard } from "@/components/dashboard/cycle-overview-card";
import { DailyNoteCard } from "@/components/dashboard/daily-note-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SelfCareProgress } from "@/components/dashboard/self-care-progress";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { buildCycleOverview } from "@/lib/cycle";
import {
  mockDailyNote,
  mockEmptyCycle,
  mockSelfCarePillars,
} from "@/lib/mock-data";
import { getSignedInEmail } from "@/lib/supabase/auth";
import { listCyclePeriods } from "@/lib/supabase/cycle-periods";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Flowelle daily overview — preview interface.",
};

export default async function DashboardPage() {
  const email = await getSignedInEmail();
  const periods = email ? await listCyclePeriods() : [];
  const cycle = email ? buildCycleOverview(periods) : mockEmptyCycle;

  return (
    <AppShellWithAuth>
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-5 sm:gap-6">
        <WelcomeBanner signedIn={Boolean(email)} />

        <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          <CycleOverviewCard
            cycle={cycle}
            signedIn={Boolean(email)}
          />
          <DailyNoteCard note={mockDailyNote} />
        </div>

        <QuickActions />

        <SelfCareProgress pillars={mockSelfCarePillars} />
      </div>
    </AppShellWithAuth>
  );
}
