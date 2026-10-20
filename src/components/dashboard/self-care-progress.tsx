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
  TRACKING_NOT_CONNECTED,
  type MockSelfCarePillar,
  type SelfCarePillarId,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const pillarIcons: Record<SelfCarePillarId, LucideIcon> = {
  hydration: Droplets,
  movement: PersonStanding,
  sleep: Moon,
  "personal-care": Heart,
};

interface SelfCareProgressProps {
  pillars: MockSelfCarePillar[];
}

export function SelfCareProgress({ pillars }: SelfCareProgressProps) {
  return (
    <Card className="animate-fade-up-delay-3 min-h-0">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl md:text-xl">Self-care overview</CardTitle>
          <Badge variant="outline">Not connected</Badge>
        </div>
        <CardDescription>
          Hydration, movement, sleep, and personal care at a glance.{" "}
          {TRACKING_NOT_CONNECTED}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Self-care pillars preview"
        >
          {pillars.map((pillar) => {
            const Icon = pillarIcons[pillar.id];
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
                    {pillar.statusLabel}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-plum">{pillar.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {pillar.detail}
                  </p>
                </div>
                <div
                  className="mt-auto h-1 overflow-hidden rounded-full bg-secondary"
                  role="presentation"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-sage/80 transition-[width] duration-700 motion-reduce:transition-none"
                    style={{ width: `${pillar.previewLevel}%` }}
                  />
                </div>
                <p className="sr-only">
                  {pillar.name}: tracking not connected. Preview level{" "}
                  {pillar.previewLevel} percent for layout only.
                </p>
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
          Bars are visual placeholders, not live measurements.
        </p>
      </CardFooter>
    </Card>
  );
}
