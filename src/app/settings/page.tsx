import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsExperience } from "@/app/settings/settings-experience";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { getSignedInEmail } from "@/lib/supabase/auth";
import { loadNotificationHistory } from "@/lib/supabase/notification-history";
import { loadProfile } from "@/lib/supabase/profiles";
import { emptyProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Settings",
  description: "Profile, cycle preferences, privacy, and account controls.",
};

export default function SettingsPage() {
  return (
    <AppShellWithAuth
      title="Settings"
      description="Make Flowelle feel more like you. Update your profile, how the next-period window is shown, and how you use your data."
    >
      <Suspense fallback={<SettingsFallback />}>
        <SettingsSession />
      </Suspense>
    </AppShellWithAuth>
  );
}

async function SettingsSession() {
  const email = await getSignedInEmail();
  const loaded = email ? await loadProfile() : { profile: emptyProfile, error: null };
  const history = email
    ? await loadNotificationHistory()
    : { entries: [], error: null };

  return (
    <SettingsExperience
      signedIn={Boolean(email)}
      email={email}
      profile={loaded.profile}
      reminderHistory={history.entries}
      loadError={loaded.error ?? history.error}
    />
  );
}

function SettingsFallback() {
  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-border/60 bg-card/80 px-5 py-8">
      <p className="font-serif text-lg text-plum">Loading your settings…</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Checking whether you are signed in.
      </p>
    </div>
  );
}
