"use client";

import { useActionState } from "react";
import Link from "next/link";
import { logPeriodStart, savePeriodEnd, type CycleActionState } from "@/app/cycle/actions";
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
import type { CyclePeriod } from "@/lib/cycle";
import { cn } from "@/lib/utils";

const initialState: CycleActionState = { status: "idle", message: "" };

interface CycleTrackerProps {
  signedIn: boolean;
  periods: CyclePeriod[];
}

export function CycleTracker({ signedIn, periods }: CycleTrackerProps) {
  const [startState, startAction, startPending] = useActionState(
    logPeriodStart,
    initialState,
  );
  const [endState, endAction, endPending] = useActionState(
    savePeriodEnd,
    initialState,
  );

  if (!signedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Sign in to log</CardTitle>
          <CardDescription>
            Period dates are stored only for your account. Previewing the
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
          <CardTitle className="text-xl md:text-xl">Log a period start</CardTitle>
          <CardDescription>
            This is a date you record — not a prediction of what comes next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={startAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startedOn">Start date</Label>
              <Input id="startedOn" name="startedOn" type="date" required />
            </div>
            <Button type="submit" disabled={startPending}>
              {startPending ? "Saving…" : "Save start date"}
            </Button>
            {startState.message ? (
              <p
                className={
                  startState.status === "error"
                    ? "text-sm text-destructive"
                    : "text-sm text-muted-foreground"
                }
                role="status"
              >
                {startState.message}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Recent entries</CardTitle>
          <CardDescription>
            Add an end date when your period finishes. Symptoms are not logged
            yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {periods.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No periods saved yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {periods.map((period) => (
                <li
                  key={period.id}
                  className="rounded-lg border border-border/70 bg-muted/30 p-3"
                >
                  <p className="text-sm text-plum">
                    Started{" "}
                    <time dateTime={period.startedOn}>{period.startedOn}</time>
                  </p>
                  {period.endedOn ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ended{" "}
                      <time dateTime={period.endedOn}>{period.endedOn}</time>
                    </p>
                  ) : (
                    <form action={endAction} className="mt-3 flex flex-wrap items-end gap-2">
                      <input type="hidden" name="periodId" value={period.id} />
                      <div className="space-y-1">
                        <Label htmlFor={`endedOn-${period.id}`} className="text-xs">
                          End date
                        </Label>
                        <Input
                          id={`endedOn-${period.id}`}
                          name="endedOn"
                          type="date"
                          min={period.startedOn}
                          required
                        />
                      </div>
                      <Button type="submit" size="sm" variant="outline" disabled={endPending}>
                        Save end
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
          {endState.message ? (
            <p
              className={
                endState.status === "error"
                  ? "mt-3 text-sm text-destructive"
                  : "mt-3 text-sm text-muted-foreground"
              }
              role="status"
            >
              {endState.message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
