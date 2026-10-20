import type { Metadata } from "next";
import { CycleOverviewCard } from "@/components/dashboard/cycle-overview-card";
import { DailyNoteCard } from "@/components/dashboard/daily-note-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SelfCareProgress } from "@/components/dashboard/self-care-progress";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { AppShell } from "@/components/layout/app-shell";
import {
  mockDailyNote,
  mockEmptyCycle,
  mockSelfCarePillars,
} from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Flowelle daily overview — preview interface.",
};

/**
 * Dashboard uses empty cycle data by default so the empty state is honest.
 * Self-care pillars and the daily note are clearly labelled as not connected /
 * preview samples until persistence exists.
 */
export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-5 sm:gap-6">
        <WelcomeBanner />

        <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          <CycleOverviewCard cycle={mockEmptyCycle} />
          <DailyNoteCard note={mockDailyNote} />
        </div>

        <QuickActions />

        <SelfCareProgress pillars={mockSelfCarePillars} />
      </div>
    </AppShell>
  );
}
