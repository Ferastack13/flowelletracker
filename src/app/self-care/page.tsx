import type { Metadata } from "next";
import { SelfCareTracker } from "@/app/self-care/self-care-tracker";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { getSignedInEmail } from "@/lib/supabase/auth";
import { listSelfCareCheckins } from "@/lib/supabase/self-care-checkins";

export const metadata: Metadata = {
  title: "Self-care",
  description: "Log hydration, movement, sleep, and personal care in Flowelle.",
};

export default async function SelfCarePage() {
  const email = await getSignedInEmail();
  const checkins = email ? await listSelfCareCheckins() : [];

  return (
    <AppShellWithAuth
      title="Self-care"
      description="Mark the care you already gave yourself. Flowelle does not score or streak these yet."
    >
      <SelfCareTracker signedIn={Boolean(email)} checkins={checkins} />
    </AppShellWithAuth>
  );
}
