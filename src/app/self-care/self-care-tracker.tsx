"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  Droplets,
  Heart,
  Moon,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";
import {
  toggleSelfCarePillar,
  type SelfCareActionState,
} from "@/app/self-care/actions";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SELF_CARE_PILLARS,
  checkinForDate,
  countCompletedPillars,
  formatLocalDate,
  pillarDone,
  type SelfCareCheckin,
  type SelfCarePillarId,
} from "@/lib/self-care";
import { cn } from "@/lib/utils";

const initialState: SelfCareActionState = { status: "idle", message: "" };

const pillarIcons: Record<SelfCarePillarId, LucideIcon> = {
  hydration: Droplets,
  movement: PersonStanding,
  sleep: Moon,
  "personal-care": Heart,
};

interface SelfCareTrackerProps {
  signedIn: boolean;
  checkins: SelfCareCheckin[];
}

export function SelfCareTracker({
  signedIn,
  checkins,
}: SelfCareTrackerProps) {
  const [today, setToday] = useState("");
  const [checkedOn, setCheckedOn] = useState("");

  useEffect(() => {
    const next = formatLocalDate(new Date());
    setToday(next);
    setCheckedOn((current) => current || next);
  }, []);
  const [state, action, pending] = useActionState(
    toggleSelfCarePillar,
    initialState,
  );
  const selected = checkinForDate(checkins, checkedOn);
  const recent = checkins.filter((row) => countCompletedPillars(row) > 0);

  if (!signedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Sign in to check in</CardTitle>
          <CardDescription>
            Self-care marks are stored only for your account. Previewing the
            dashboard does not save anything.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className={cn(buttonVariants())}>
            Sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Today’s four pillars</CardTitle>
          <CardDescription>
            Mark what you did. This is a record you keep — not a streak score.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkedOn">Date</Label>
            <Input
              id="checkedOn"
              name="checkedOn"
              type="date"
              value={checkedOn}
              max={today}
              onChange={(event) => setCheckedOn(event.target.value)}
            />
          </div>

          <ul
            className="grid gap-3 sm:grid-cols-2"
            aria-label="Self-care pillars"
          >
            {SELF_CARE_PILLARS.map((pillar) => {
              const Icon = pillarIcons[pillar.id];
              const done = pillarDone(selected, pillar.id);
              return (
                <li key={pillar.id}>
                  <form action={action}>
                    <input type="hidden" name="checkedOn" value={checkedOn} />
                    <input type="hidden" name="pillar" value={pillar.id} />
                    <button
                      type="submit"
                      disabled={pending}
                      aria-pressed={done}
                      className={cn(
                        "flex w-full min-w-0 items-start gap-3 rounded-xl border px-4 py-4 text-left transition-colors duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        done
                          ? "border-sage/50 bg-sage-soft/40 hover:bg-sage-soft/55"
                          : "border-border/70 bg-muted/25 hover:border-sage/40 hover:bg-muted/40",
                      )}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-plum"
                        aria-hidden="true"
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-plum">
                          {pillar.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {pillar.detail}
                        </span>
                        <span className="mt-2 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                          {done ? "Done" : "Not yet"}
                        </span>
                      </span>
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>

          {state.message ? (
            <p
              className={
                state.status === "error"
                  ? "text-sm text-destructive"
                  : "text-sm text-muted-foreground"
              }
              role="status"
            >
              {state.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Recent check-ins</CardTitle>
          <CardDescription>
            Saved days from the last few weeks. Custom rituals are not available
            yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No self-care days saved yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {recent.map((row) => (
                <li key={row.id || row.checkedOn}>
                  <button
                    type="button"
                    onClick={() => setCheckedOn(row.checkedOn)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-3 text-left transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      row.checkedOn === checkedOn
                        ? "border-sage/50 bg-sage-soft/30"
                        : "border-border/70 bg-muted/30 hover:bg-muted/45",
                    )}
                  >
                    <p className="text-sm text-plum">
                      <time dateTime={row.checkedOn}>{row.checkedOn}</time>
                      {row.checkedOn === today ? " · today" : null}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {countCompletedPillars(row)} of {SELF_CARE_PILLARS.length}{" "}
                      pillars
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
