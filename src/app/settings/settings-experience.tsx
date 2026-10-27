"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import {
  BellOff,
  Download,
  HeartHandshake,
  Lock,
  Shield,
  UserRound,
  Waves,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import {
  deleteSavedRecords,
  exportMyData,
  saveProfileSettings,
  type ExportActionState,
  type SettingsActionState,
} from "@/app/settings/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DELETE_RECORDS_CONFIRMATION,
  DISPLAY_NAME_MAX,
  SELF_CARE_INTENTION_MAX,
  type UserProfile,
} from "@/lib/profile";
import { cn } from "@/lib/utils";

const initialState: SettingsActionState = { status: "idle", message: "" };
const initialExport: ExportActionState = { status: "idle", message: "" };

const sections = [
  { id: "profile", label: "My Profile", icon: UserRound },
  { id: "cycle", label: "Cycle", icon: Waves },
  { id: "notifications", label: "Notifications", icon: BellOff },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "account", label: "Account", icon: Lock },
] as const;

interface SettingsExperienceProps {
  signedIn: boolean;
  email: string | null;
  profile: UserProfile;
}

export function SettingsExperience({
  signedIn,
  email,
  profile,
}: SettingsExperienceProps) {
  const [saveState, saveAction, savePending] = useActionState(
    saveProfileSettings,
    initialState,
  );
  const [exportState, exportAction, exportPending] = useActionState(
    exportMyData,
    initialExport,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteSavedRecords,
    initialState,
  );

  useEffect(() => {
    if (!exportState.payload || !exportState.filename) return;
    const blob = new Blob([exportState.payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportState.filename;
    link.click();
    URL.revokeObjectURL(url);
  }, [exportState.payload, exportState.filename]);

  if (!signedIn) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Sign in to manage settings</CardTitle>
          <CardDescription>
            Preferences, export, and record deletion stay with your account.
            Previewing the app does not create a profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className={cn(buttonVariants())}>
            Sign in or sign up
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
      <nav
        aria-label="Settings sections"
        className="rounded-xl border border-border/70 bg-card/80 p-2 shadow-soft lg:sticky lg:top-8"
      >
        <ul className="flex gap-1 overflow-x-auto lg:flex-col">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-plum"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex min-w-0 flex-col gap-6">
        <form action={saveAction} className="flex flex-col gap-6">
          <Card id="profile" className="scroll-mt-24">
            <CardHeader>
              <p className="text-[11px] font-medium tracking-[0.14em] text-rose-muted uppercase">
                My Profile
              </p>
              <CardTitle className="text-xl md:text-xl">How Flowelle greets you</CardTitle>
              <CardDescription>
                A name and a short intention. These are preferences, not cycle
                records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={profile.displayName}
                  maxLength={DISPLAY_NAME_MAX}
                  placeholder="How should we greet you?"
                  autoComplete="nickname"
                  disabled={savePending}
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Up to {DISPLAY_NAME_MAX} characters.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="selfCareIntention">Self-care intention</Label>
                <Textarea
                  id="selfCareIntention"
                  name="selfCareIntention"
                  defaultValue={profile.selfCareIntention}
                  maxLength={SELF_CARE_INTENTION_MAX}
                  placeholder="A short intention for this season…"
                  disabled={savePending}
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Kept on your profile only. Up to{" "}
                  {SELF_CARE_INTENTION_MAX} characters.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="cycle" className="scroll-mt-24">
            <CardHeader>
              <p className="text-[11px] font-medium tracking-[0.14em] text-rose-muted uppercase">
                Cycle preferences
              </p>
              <CardTitle className="text-xl md:text-xl">Next-period window</CardTitle>
              <CardDescription>
                Estimates still come only from recorded period starts. Flowelle
                does not let you set a 28-day default.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                <input
                  type="checkbox"
                  name="showCycleEstimate"
                  value="on"
                  defaultChecked={profile.showCycleEstimate}
                  disabled={savePending}
                  className="mt-1 size-4 accent-plum"
                />
                <span>
                  <span className="block text-sm font-medium text-plum">
                    Show the next-period window
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    When this is on, the dashboard and Cycle Tracker show the
                    approximate window after more than one recorded start. Turn
                    it off to keep only the dates you logged.
                  </span>
                </span>
              </label>
              <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <HeartHandshake className="mt-0.5 size-4 shrink-0 text-sage-deep" aria-hidden="true" />
                Usable cycle lengths stay between 14 and 60 days. That is how
                the existing calculation decides what to include.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={savePending}>
              {savePending ? "Saving…" : "Save preferences"}
            </Button>
            {saveState.message ? (
              <p
                className={
                  saveState.status === "error"
                    ? "text-sm text-destructive"
                    : "text-sm text-muted-foreground"
                }
                role="status"
              >
                {saveState.message}
              </p>
            ) : null}
          </div>
        </form>

        <Card id="notifications" className="scroll-mt-24">
          <CardHeader>
            <p className="text-[11px] font-medium tracking-[0.14em] text-rose-muted uppercase">
              Notifications
            </p>
            <CardTitle className="text-xl md:text-xl">Reminders are not available</CardTitle>
            <CardDescription>
              Flowelle does not send email, push, or SMS reminders yet. No
              notification preference is stored, and nothing will arrive.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card id="privacy" className="scroll-mt-24">
          <CardHeader>
            <p className="text-[11px] font-medium tracking-[0.14em] text-rose-muted uppercase">
              Privacy & data
            </p>
            <CardTitle className="text-xl md:text-xl">What is saved</CardTitle>
            <CardDescription>
              Signed-in records stay on your account: period dates, symptom
              notes, self-care check-ins, and these preferences. Today’s note is
              general for the date. Flowelle does not diagnose or confirm
              ovulation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={exportAction}>
              <Button type="submit" variant="outline" disabled={exportPending}>
                <Download className="size-4" aria-hidden="true" />
                {exportPending ? "Preparing…" : "Download my data"}
              </Button>
              {exportState.message ? (
                <p
                  className={
                    exportState.status === "error"
                      ? "mt-3 text-sm text-destructive"
                      : "mt-3 text-sm text-muted-foreground"
                  }
                  role="status"
                >
                  {exportState.message}
                </p>
              ) : null}
            </form>

            <div className="rounded-xl border border-border/70 bg-muted/25 px-4 py-4">
              <p className="font-serif text-lg text-plum">Delete saved records</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                This removes period dates, symptom notes, self-care check-ins,
                and profile preferences for this account. It does not close the
                sign-in itself.
              </p>
              <form action={deleteAction} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="confirmation">
                    Type {DELETE_RECORDS_CONFIRMATION} to confirm
                  </Label>
                  <Input
                    id="confirmation"
                    name="confirmation"
                    autoComplete="off"
                    disabled={deletePending}
                  />
                </div>
                <Button type="submit" variant="outline" disabled={deletePending}>
                  {deletePending ? "Removing…" : "Delete saved records"}
                </Button>
                {deleteState.message ? (
                  <p
                    className={
                      deleteState.status === "error"
                        ? "text-sm text-destructive"
                        : "text-sm text-muted-foreground"
                    }
                    role="status"
                  >
                    {deleteState.message}
                  </p>
                ) : null}
              </form>
            </div>
          </CardContent>
        </Card>

        <Card id="account" className="scroll-mt-24">
          <CardHeader>
            <p className="text-[11px] font-medium tracking-[0.14em] text-rose-muted uppercase">
              Account
            </p>
            <CardTitle className="text-xl md:text-xl">Signed in</CardTitle>
            <CardDescription>
              This is the email on the current session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="truncate text-sm text-plum" title={email ?? undefined}>
              {email}
            </p>
            <form action={signOut}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
