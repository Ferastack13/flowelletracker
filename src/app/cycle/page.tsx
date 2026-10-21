import type { Metadata } from "next";
import { CycleTracker } from "@/app/cycle/cycle-tracker";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { getSignedInEmail } from "@/lib/supabase/auth";
import { listCyclePeriods } from "@/lib/supabase/cycle-periods";

export const metadata: Metadata = {
  title: "Cycle Tracker",
  description: "Log period start and end dates in Flowelle.",
};

export default async function CyclePage() {
  const email = await getSignedInEmail();
  const periods = email ? await listCyclePeriods() : [];

  return (
    <AppShellWithAuth
      title="Cycle Tracker"
      description="Record the dates you already know. Flowelle does not predict your next period."
    >
      <CycleTracker signedIn={Boolean(email)} periods={periods} />
    </AppShellWithAuth>
  );
}
