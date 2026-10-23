import type { Metadata } from "next";
import { Suspense } from "react";
import { SelfCareTracker } from "@/app/self-care/self-care-tracker";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { getSignedInEmail } from "@/lib/supabase/auth";
import { listSelfCareCheckins } from "@/lib/supabase/self-care-checkins";

export const metadata: Metadata = {
  title: "Self-care",
  description: "Log hydration, movement, sleep, and personal care in Flowelle.",
};

export default function SelfCarePage() {
  return (
    <AppShellWithAuth
      title="Self-care"
      description="Mark the care you already gave yourself. Flowelle does not score or streak these yet."
    >
      <Suspense fallback={<SessionRecordsFallback label="Loading your self-care log…" />}>
        <SelfCareSession />
      </Suspense>
    </AppShellWithAuth>
  );
}

async function SelfCareSession() {
  const email = await getSignedInEmail();
  const checkins = email ? await listSelfCareCheckins() : [];

  return <SelfCareTracker signedIn={Boolean(email)} checkins={checkins} />;
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
