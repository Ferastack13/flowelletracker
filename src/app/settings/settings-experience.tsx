"use client";

import { useActionState, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  dismissReminderHistoryItem,
  exportMyData,
  saveCycleEstimatePreference,
  saveNotificationPreferences,
  saveProfileSettings,
  saveUsualCycleLengthPreference,
  type ExportActionState,
  type SettingsActionState,
} from "@/app/settings/actions";
import type { NotificationDeliveryRow } from "@/lib/notifications/types";
import { reminderTypeLabel } from "@/lib/notifications/types";
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
  reminderHistory?: NotificationDeliveryRow[];
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
  reminderHistory = [],
  loadError,
}: SettingsExperienceProps) {
  const router = useRouter();
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
  const [lengthState, lengthAction, lengthPending] = useActionState(
    saveUsualCycleLengthPreference,
    initialState,
  );
  const [notifyState, notifyAction, notifyPending] = useActionState(
    saveNotificationPreferences,
    initialState,
  );
  const [historyState, historyAction, historyPending] = useActionState(
    dismissReminderHistoryItem,
    initialState,
  );
  const [knowsLength, setKnowsLength] = useState(
    profile.usualCycleLengthDays != null,
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
    if (saveState.status === "success") {
      setClientError(null);
    }
  }, [saveState.status]);

  useEffect(() => {
    const leaveAfterSave = [
      saveState.status,
      cycleState.status,
      lengthState.status,
      notifyState.status,
    ].includes("success");
    if (!leaveAfterSave) return;

    const timer = window.setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [
    saveState.status,
    cycleState.status,
    lengthState.status,
    notifyState.status,
    router,
  ]);

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
              <form action={lengthAction} className="mt-5 space-y-3 border-t border-border/60 pt-5">
                <div className="space-y-2">
                  <Label htmlFor="knowsCycleLength">Usual cycle length</Label>
                  <select
                    id="knowsCycleLength"
                    name="knowsCycleLength"
                    className="flex h-11 w-full rounded-md border border-input bg-card px-3.5 py-2 text-sm"
                    value={knowsLength ? "yes" : "no"}
                    onChange={(event) =>
                      setKnowsLength(event.target.value === "yes")
                    }
                    disabled={lengthPending}
                  >
                    <option value="yes">I know my usual cycle length</option>
                    <option value="no">I do not know my usual cycle length</option>
                  </select>
                </div>
                {knowsLength ? (
                  <div className="space-y-2">
                    <Label htmlFor="usualCycleLength">Days from start to start</Label>
                    <Input
                      id="usualCycleLength"
                      name="usualCycleLength"
                      type="number"
                      min={14}
                      max={60}
                      defaultValue={profile.usualCycleLengthDays ?? ""}
                      disabled={lengthPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate from period duration. Used only when recorded
                      history is still thin.
                    </p>
                  </div>
                ) : (
                  <input type="hidden" name="usualCycleLength" value="unknown" />
                )}
                <Button type="submit" variant="outline" disabled={lengthPending}>
                  {lengthPending ? "Saving…" : "Save usual length"}
                </Button>
                {lengthState.message ? (
                  <p className={statusClass(lengthState.status)} role="status">
                    {lengthState.message}
                  </p>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card id="notifications" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="text-xl md:text-xl">Notifications</CardTitle>
              <CardDescription>
                Email reminders use discreet wording by default. Browser push is
                not enabled in this phase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form action={notifyAction} className="space-y-3">
                {(
                  [
                    {
                      name: "periodReminder",
                      label: "Upcoming period reminder",
                      checked: profile.notifications.periodReminder,
                    },
                    {
                      name: "ovulationReminder",
                      label: "Estimated ovulation reminder",
                      checked: profile.notifications.ovulationReminder,
                    },
                    {
                      name: "fertileWindowReminder",
                      label: "Estimated fertile-window reminder",
                      checked: profile.notifications.fertileWindowReminder,
                    },
                    {
                      name: "checkinReminder",
                      label: "Optional self-care reminder",
                      checked: profile.notifications.checkinReminder,
                    },
                  ] as const
                ).map((item) => (
                  <label
                    key={item.name}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      name={item.name}
                      value="on"
                      defaultChecked={item.checked}
                      disabled={notifyPending}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-plum">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Subject lines stay discreet. Details stay in your
                        account.
                      </span>
                    </span>
                  </label>
                ))}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      name="timezone"
                      defaultValue={profile.notifications.timezone}
                      placeholder="Africa/Lagos"
                      disabled={notifyPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredChannel">Delivery channel</Label>
                    <Input
                      id="preferredChannel"
                      name="preferredChannel"
                      value="email"
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quietHoursStart">Quiet hours start</Label>
                    <Input
                      id="quietHoursStart"
                      name="quietHoursStart"
                      type="time"
                      defaultValue={profile.notifications.quietHoursStart ?? ""}
                      disabled={notifyPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quietHoursEnd">Quiet hours end</Label>
                    <Input
                      id="quietHoursEnd"
                      name="quietHoursEnd"
                      type="time"
                      defaultValue={profile.notifications.quietHoursEnd ?? ""}
                      disabled={notifyPending}
                    />
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Delivery needs Resend credentials and the hourly Vercel cron
                  job. Clearing history does not disable future reminders.
                </p>
                <Button type="submit" variant="outline" disabled={notifyPending}>
                  {notifyPending ? "Saving…" : "Save reminder preferences"}
                </Button>
                {notifyState.message ? (
                  <p className={statusClass(notifyState.status)} role="status">
                    {notifyState.message}
                  </p>
                ) : null}
              </form>

              <div className="border-t border-border/60 pt-5">
                <p className="text-sm font-medium text-plum">Recent reminders</p>
                {reminderHistory.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No reminder history yet.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {reminderHistory.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm"
                      >
                        <span>
                          <span className="font-medium text-plum">
                            {reminderTypeLabel(entry.reminderType)}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {entry.channel} · {entry.status} ·{" "}
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </span>
                        <form action={historyAction}>
                          <input
                            type="hidden"
                            name="deliveryId"
                            value={entry.id}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="ghost"
                            disabled={historyPending}
                          >
                            Clear
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
                {historyState.message ? (
                  <p className={`mt-2 ${statusClass(historyState.status)}`} role="status">
                    {historyState.message}
                  </p>
                ) : null}
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
                There is no password in Flowelle. Use Google, GitHub, or a new
                email link if you need to sign in again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
