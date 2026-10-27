"use client";

import { useActionState, useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  BellOff,
  Download,
  Lock,
  Shield,
  Trash2,
  UserRound,
  Waves,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import {
  deleteSavedRecords,
  exportMyData,
  saveCycleEstimatePreference,
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
  parseProfileIdentity,
  SELF_CARE_INTENTION_MAX,
  type UserProfile,
} from "@/lib/profile";
import { ProfilePhotoEditor } from "@/app/settings/profile-photo-editor";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { cn } from "@/lib/utils";

const initialState: SettingsActionState = { status: "idle", message: "" };
const initialExport: ExportActionState = { status: "idle", message: "" };

const sections = [
  { id: "profile", label: "My Profile", icon: UserRound },
  { id: "cycle", label: "Cycle Preferences", icon: Waves },
  { id: "notifications", label: "Notifications", icon: BellOff },
  { id: "privacy", label: "Privacy & Data", icon: Shield },
  { id: "account", label: "Account", icon: Lock },
] as const;

interface SettingsExperienceProps {
  signedIn: boolean;
  email: string | null;
  profile: UserProfile;
  loadError: string | null;
}

function statusClass(status: SettingsActionState["status"]) {
  return status === "error"
    ? "text-sm text-destructive"
    : "text-sm text-muted-foreground";
}

export function SettingsExperience({
  signedIn,
  email,
  profile,
  loadError,
}: SettingsExperienceProps) {
  const switchId = useId();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [intention, setIntention] = useState(profile.selfCareIntention);
  const [clientError, setClientError] = useState<string | null>(null);
  const [saveState, saveAction, savePending] = useActionState(
    saveProfileSettings,
    initialState,
  );
  const [cycleState, cycleAction, cyclePending] = useActionState(
    saveCycleEstimatePreference,
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
    setDisplayName(profile.displayName);
    setIntention(profile.selfCareIntention);
  }, [profile.displayName, profile.selfCareIntention]);

  useEffect(() => {
    if (!exportState.payload || !exportState.filename || !exportState.exportId) {
      return;
    }
    const blob = new Blob([exportState.payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportState.filename;
    link.click();
    URL.revokeObjectURL(url);
  }, [exportState.payload, exportState.filename, exportState.exportId]);

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
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:items-start">
      <nav
        aria-label="Settings sections"
        className="rounded-2xl border border-border/70 bg-card/90 p-2 shadow-soft lg:sticky lg:top-8"
      >
        <ul className="flex gap-1 overflow-x-auto lg:flex-col">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-plum"
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex min-w-0 flex-col gap-5">
        {loadError ? (
          <p className="text-sm text-destructive" role="alert">
            {loadError}
          </p>
        ) : null}

        <Card id="profile" className="scroll-mt-24">
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <ProfileAvatar
                name={displayName}
                photoUrl={profile.photoUrl}
              />
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-[0.14em] text-rose-muted uppercase">
                  Hello
                </p>
                <CardTitle className="truncate text-xl md:text-xl">
                  {displayName || "Your space"}
                </CardTitle>
                <CardDescription className="mt-1">
                  {intention || "Add a name and a short intention when you are ready."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProfilePhotoEditor
              displayName={displayName}
              photoUrl={profile.photoUrl}
            />
            <form
              action={saveAction}
              className="space-y-5"
              onSubmit={(event) => {
                const parsed = parseProfileIdentity({
                  displayName,
                  selfCareIntention: intention,
                });
                if (!parsed.ok) {
                  event.preventDefault();
                  setClientError(parsed.message);
                  return;
                }
                setClientError(null);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={DISPLAY_NAME_MAX}
                  placeholder="How should we greet you?"
                  autoComplete="nickname"
                  disabled={savePending}
                />
                <p className="text-xs text-muted-foreground">
                  {displayName.length}/{DISPLAY_NAME_MAX}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="selfCareIntention">Self-care intention</Label>
                <Textarea
                  id="selfCareIntention"
                  name="selfCareIntention"
                  value={intention}
                  onChange={(event) => setIntention(event.target.value)}
                  maxLength={SELF_CARE_INTENTION_MAX}
                  placeholder="A short intention for this season…"
                  disabled={savePending}
                />
                <p className="text-xs text-muted-foreground">
                  {intention.length}/{SELF_CARE_INTENTION_MAX}. This stays on
                  your profile, not in cycle records.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <p
                  className={statusClass(
                    clientError ? "error" : saveState.status,
                  )}
                  role="status"
                >
                  {clientError ?? saveState.message}
                </p>
                <Button type="submit" disabled={savePending}>
                  {savePending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card id="cycle" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="text-xl md:text-xl">Cycle preferences</CardTitle>
              <CardDescription>
                Estimates still come only from recorded period starts. Turning
                this off hides the window. It does not delete dates or change
                the calculation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={cycleAction} className="space-y-3">
                <input
                  type="hidden"
                  name="showCycleEstimate"
                  value={profile.showCycleEstimate ? "" : "on"}
                />
                <button
                  type="submit"
                  id={switchId}
                  role="switch"
                  aria-checked={profile.showCycleEstimate}
                  disabled={cyclePending}
                  className="flex w-full items-start justify-between gap-4 rounded-xl border border-border/70 bg-muted/25 px-4 py-3 text-left disabled:opacity-60"
                >
                  <span>
                    <span className="block text-sm font-medium text-plum">
                      Show next-period window
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {cyclePending
                        ? "Saving…"
                        : "Uses your recorded starts after more than one cycle. Not contraception."}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1 inline-flex h-6 w-10 shrink-0 rounded-full p-0.5 transition-colors",
                      profile.showCycleEstimate ? "bg-plum" : "bg-border",
                    )}
                  >
                    <span
                      className={cn(
                        "block size-5 rounded-full bg-card shadow-soft transition-transform",
                        profile.showCycleEstimate ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </span>
                </button>
                {cycleState.message ? (
                  <p className={statusClass(cycleState.status)} role="status">
                    {cycleState.message}
                  </p>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card id="notifications" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="text-xl md:text-xl">Notifications</CardTitle>
              <CardDescription>
                Get updates and reminders when they exist. Nothing is stored
                here yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/70 bg-muted/25 px-4 py-3">
                <p className="text-sm font-medium text-plum">
                  Reminders are not available yet
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Flowelle does not send email, push, or SMS. There are no
                  notification toggles to promise a reminder.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="privacy" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="text-xl md:text-xl">Privacy & data</CardTitle>
              <CardDescription>
                Your account can hold period dates, symptom notes, self-care
                check-ins, and these preferences. Today’s note is general.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form action={exportAction}>
                <Button type="submit" variant="outline" disabled={exportPending}>
                  <Download className="size-4" aria-hidden="true" />
                  {exportPending ? "Preparing…" : "Download my data"}
                </Button>
                {exportState.message ? (
                  <p className={`mt-3 ${statusClass(exportState.status)}`} role="status">
                    {exportState.message}
                  </p>
                ) : null}
              </form>

              <div className="rounded-xl border border-border/70 bg-muted/25 px-4 py-4">
                <p className="font-serif text-lg text-plum">Delete saved records</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Removes period dates, symptom notes, self-care check-ins, and
                  profile preferences. It does not close the sign-in.
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
                    <Trash2 className="size-4" aria-hidden="true" />
                    {deletePending ? "Removing…" : "Delete saved records"}
                  </Button>
                  {deleteState.message ? (
                    <p className={statusClass(deleteState.status)} role="status">
                      {deleteState.message}
                    </p>
                  ) : null}
                </form>
              </div>
            </CardContent>
          </Card>

          <Card id="account" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="text-xl md:text-xl">Account</CardTitle>
              <CardDescription>
                This is the email on the current session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="flex items-center gap-2 text-sm text-plum">
                <span
                  className="size-2 rounded-full bg-sage-deep"
                  aria-hidden="true"
                />
                <span className="truncate" title={email ?? undefined}>
                  {email}
                </span>
              </p>
              <form action={signOut}>
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
              <p className="text-xs leading-relaxed text-muted-foreground">
                There is no password in Flowelle. Use Google or a new email
                link if you need to sign in again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
