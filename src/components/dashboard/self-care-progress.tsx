"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Droplets,
  Heart,
  Moon,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildSelfCareOverview,
  formatLocalDate,
  type SelfCareCheckin,
  type SelfCarePillarId,
} from "@/lib/self-care";
import { cn } from "@/lib/utils";

const pillarIcons: Record<SelfCarePillarId, LucideIcon> = {
  hydration: Droplets,
  movement: PersonStanding,
  sleep: Moon,
  "personal-care": Heart,
};

interface SelfCareProgressProps {
  signedIn: boolean;
  checkins: SelfCareCheckin[];
}

export function SelfCareProgress({ signedIn, checkins }: SelfCareProgressProps) {
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(formatLocalDate(new Date()));
  }, []);

  if (!today) {
    return (
      <Card className="min-h-0">
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Self-care overview</CardTitle>
          <CardDescription>Checking today’s date…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const pillars = buildSelfCareOverview(checkins, today);
  const doneToday = pillars.filter((pillar) => pillar.doneToday).length;

  return (
    <Card className="animate-fade-up-delay-3 min-h-0">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl md:text-xl">Self-care overview</CardTitle>
          <Badge variant={signedIn && doneToday > 0 ? "sage" : "outline"}>
            {signedIn
              ? doneToday > 0
                ? `${doneToday} of ${pillars.length} today`
                : "Nothing marked today"
              : "Sign in to save"}
          </Badge>
        </div>
        <CardDescription>
          Hydration, movement, sleep, and personal care from your saved
          check-ins. Bars count the last seven days only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Self-care pillars"
        >
          {pillars.map((pillar) => {
            const Icon = pillarIcons[pillar.id];
            const percent =
              pillar.lookbackDays === 0
                ? 0
                : Math.round((pillar.doneDays / pillar.lookbackDays) * 100);
            return (
              <li
                key={pillar.id}
                className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/70 bg-muted/25 p-4 transition-colors duration-200 hover:border-sage/50 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-soft/60 text-plum"
                    aria-hidden="true"
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    {signedIn
                      ? pillar.doneToday
                        ? "Done today"
                        : "Not yet"
                      : "Not saved"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-plum">{pillar.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {pillar.detail}
                  </p>
                </div>
                {signedIn ? (
                  <div>
                    <div
                      className="h-1 overflow-hidden rounded-full bg-secondary"
                      role="progressbar"
                      aria-valuenow={pillar.doneDays}
                      aria-valuemin={0}
                      aria-valuemax={pillar.lookbackDays}
                      aria-label={`${pillar.name} over the last ${pillar.lookbackDays} days`}
                    >
                      <div
                        className="h-full rounded-full bg-sage/80 transition-[width] duration-700 motion-reduce:transition-none"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {pillar.doneDays} of last {pillar.lookbackDays} days
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sign in to keep a real record.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <Link
          href="/self-care"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Open self-care
        </Link>
        <p className="text-xs text-muted-foreground">
          {signedIn
            ? "These counts come from dates you marked."
            : "Nothing is stored until you have an account."}
        </p>
      </CardFooter>
    </Card>
  );
}
