import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { severityName, symptomName, type SymptomLog } from "@/lib/symptoms";
import { cn } from "@/lib/utils";

interface RecentSymptomsProps {
  signedIn: boolean;
  entries: SymptomLog[];
}

export function RecentSymptoms({ signedIn, entries }: RecentSymptomsProps) {
  if (!signedIn || entries.length === 0) {
    return null;
  }

  const recent = entries.slice(0, 3);

  return (
    <section aria-labelledby="recent-symptoms-heading" className="min-w-0">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="recent-symptoms-heading"
            className="font-serif text-lg tracking-tight text-plum"
          >
            Recent symptoms
          </h2>
          <p className="text-xs text-muted-foreground">
            From your saved log. This is not a diagnosis.
          </p>
        </div>
        <Link
          href="/cycle#symptoms"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Log a symptom
        </Link>
      </div>
      <ul className="grid gap-2 sm:grid-cols-3">
        {recent.map((entry) => (
          <li
            key={entry.id}
            className="rounded-xl border border-border/80 bg-card px-4 py-3 shadow-soft"
          >
            <p className="text-sm font-medium text-plum">
              {symptomName(entry.symptom)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <time dateTime={entry.loggedOn}>{entry.loggedOn}</time>
              {" · "}
              {severityName(entry.severity)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
