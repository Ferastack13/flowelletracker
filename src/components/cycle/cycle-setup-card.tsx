"use client";

import { useActionState, useState } from "react";
import {
  completeCycleSetup,
  type CycleActionState,
} from "@/app/cycle/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CycleActionState = { status: "idle", message: "" };

const fieldClassName =
  "flex h-11 w-full rounded-md border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-soft transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function CycleSetupCard() {
  const [state, action, pending] = useActionState(
    completeCycleSetup,
    initialState,
  );
  const [knowsLength, setKnowsLength] = useState(true);

  return (
    <Card className="border-rose/30 bg-gradient-to-br from-rose-soft/20 via-card to-ivory-warm/40">
      <CardHeader>
        <CardTitle className="text-xl md:text-xl">Set up your cycle</CardTitle>
        <CardDescription>
          Add your most recent period dates. Usual cycle length is optional and
          separate from how many days you bled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="setup-startedOn">Most recent start date</Label>
            <Input
              id="setup-startedOn"
              name="startedOn"
              type="date"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-endedOn">Most recent end date</Label>
            <Input
              id="setup-endedOn"
              name="endedOn"
              type="date"
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty if this period is still ongoing.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="knowsCycleLength">Usual cycle length</Label>
            <select
              id="knowsCycleLength"
              name="knowsCycleLength"
              className={fieldClassName}
              value={knowsLength ? "yes" : "no"}
              onChange={(event) =>
                setKnowsLength(event.target.value === "yes")
              }
              disabled={pending}
            >
              <option value="yes">I know my usual cycle length</option>
              <option value="no">I do not know my usual cycle length</option>
            </select>
          </div>
          {knowsLength ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="usualCycleLength">Days from start to start</Label>
              <Input
                id="usualCycleLength"
                name="usualCycleLength"
                type="number"
                min={14}
                max={60}
                placeholder="e.g. 28"
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                This is cycle length, not bleeding duration. Example: start Nov
                6, end Nov 10 is 5 bleeding days; a usual cycle might still be
                28 days.
              </p>
            </div>
          ) : (
            <input type="hidden" name="usualCycleLength" value="unknown" />
          )}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save cycle setup"}
            </Button>
            {state.message ? (
              <p
                className={
                  state.status === "error"
                    ? "mt-3 text-sm text-destructive"
                    : "mt-3 text-sm text-muted-foreground"
                }
                role="status"
              >
                {state.message}
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
