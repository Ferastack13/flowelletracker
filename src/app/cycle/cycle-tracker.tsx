"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  deletePeriodRecord,
  logPeriodStart,
  savePeriodEnd,
  updatePeriodRecord,
  type CycleActionState,
} from "@/app/cycle/actions";
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
import { CycleEstimateSummary } from "@/components/cycle/cycle-estimate-summary";
import {
  intervalStatusLabel,
  type CycleOverview,
  type CyclePeriod,
} from "@/lib/cycle";
import { cn } from "@/lib/utils";

const initialState: CycleActionState = { status: "idle", message: "" };

interface CycleTrackerProps {
  signedIn: boolean;
  periods: CyclePeriod[];
  overview: CycleOverview;
  showCycleEstimate?: boolean;
}

export function CycleTracker({
  signedIn,
  periods,
  overview,
  showCycleEstimate = true,
}: CycleTrackerProps) {
  const [startState, startAction, startPending] = useActionState(
    logPeriodStart,
    initialState,
  );
  const [endState, endAction, endPending] = useActionState(
    savePeriodEnd,
    initialState,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updatePeriodRecord,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePeriodRecord,
    initialState,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Sign in to log</CardTitle>
          <CardDescription>
            Period dates and symptom notes are stored only for your account.
            Previewing the dashboard does not save anything.
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

  const historyById = new Map(
    overview.history.map((item) => [item.period.id, item]),
  );

  return (
    <div className="flex flex-col gap-6">
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Log a period start</CardTitle>
          <CardDescription>
            Dates you record. Next-period windows use these starts, not a
            standard 28-day cycle.
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
            Add an end date when your period finishes. Cycle length is counted
            from this start to the next start.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {periods.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No periods saved yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {periods.map((period) => {
                const item = historyById.get(period.id);
                return (
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
                  ) : null}
                  {item?.lengthDays != null && item.intervalStatus ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cycle to next start: {item.lengthDays} days ·{" "}
                      {intervalStatusLabel(item.intervalStatus)}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      No later start recorded yet, so this cycle is still open.
                    </p>
                  )}
                  {editingId === period.id ? (
                    <form action={updateAction} className="mt-3 space-y-3">
                      <input type="hidden" name="periodId" value={period.id} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor={`startedOn-${period.id}`} className="text-xs">
                            Start date
                          </Label>
                          <Input
                            id={`startedOn-${period.id}`}
                            name="startedOn"
                            type="date"
                            defaultValue={period.startedOn}
                            required
                            disabled={updatePending}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`editEndedOn-${period.id}`} className="text-xs">
                            End date
                          </Label>
                          <Input
                            id={`editEndedOn-${period.id}`}
                            name="endedOn"
                            type="date"
                            defaultValue={period.endedOn ?? ""}
                            min={period.startedOn}
                            disabled={updatePending}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" size="sm" disabled={updatePending}>
                          {updatePending ? "Saving…" : "Save changes"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={updatePending}
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!period.endedOn ? (
                        <form action={endAction} className="flex flex-wrap items-end gap-2">
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
                              disabled={endPending}
                            />
                          </div>
                          <Button type="submit" size="sm" variant="outline" disabled={endPending}>
                            Save end
                          </Button>
                        </form>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updatePending || deletePending}
                        onClick={() => {
                          setEditingId(period.id);
                          setConfirmingId(null);
                        }}
                      >
                        Edit
                      </Button>
                      {confirmingId === period.id ? (
                        <form action={deleteAction}>
                          <input type="hidden" name="periodId" value={period.id} />
                          <input type="hidden" name="confirm" value="yes" />
                          <Button type="submit" size="sm" variant="outline" disabled={deletePending}>
                            {deletePending ? "Removing…" : "Confirm remove"}
                          </Button>
                        </form>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={deletePending}
                          onClick={() => setConfirmingId(period.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  )}
                </li>
                );
              })}
            </ul>
          )}
          {[endState, updateState, deleteState]
            .filter((state) => state.message)
            .map((state) => (
              <p
                key={`${state.status}-${state.message}`}
                className={
                  state.status === "error"
                    ? "mt-3 text-sm text-destructive"
                    : "mt-3 text-sm text-muted-foreground"
                }
                role="status"
              >
                {state.message}
              </p>
            ))}
        </CardContent>
      </Card>
    </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Recorded cycles</CardTitle>
          <CardDescription>
            Lengths are the days between consecutive starts. The same numbers
            appear on the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showCycleEstimate ? (
            <CycleEstimateSummary estimate={overview.estimate} />
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              The next-period window is hidden in Settings. Lengths between
              recorded starts still appear above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
