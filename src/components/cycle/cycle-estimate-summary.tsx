import { Badge } from "@/components/ui/badge";
import {
  CYCLE_ESTIMATE_DISCLAIMER,
  type NextPeriodEstimate,
} from "@/lib/cycle";

interface CycleEstimateSummaryProps {
  estimate: NextPeriodEstimate;
}

export function CycleEstimateSummary({ estimate }: CycleEstimateSummaryProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-serif text-base text-plum">Next period</p>
        <Badge variant={estimate.status === "none" ? "outline" : "soft"}>
          {estimate.status === "approximate"
            ? "Approximate window"
            : estimate.status === "limited"
              ? "Limited history"
              : "Not estimated"}
        </Badge>
      </div>
      {estimate.status === "none" || !estimate.windowStart || !estimate.windowEnd ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {estimate.reason}
        </p>
      ) : (
        <>
          <p className="mt-2 font-serif text-xl tracking-tight text-plum">
            <time dateTime={estimate.windowStart}>{estimate.windowStart}</time>
            {estimate.windowStart !== estimate.windowEnd ? (
              <>
                {" – "}
                <time dateTime={estimate.windowEnd}>{estimate.windowEnd}</time>
              </>
            ) : null}
          </p>
          {estimate.estimatedStart &&
          estimate.estimatedStart !== estimate.windowStart ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Midpoint around{" "}
              <time dateTime={estimate.estimatedStart}>
                {estimate.estimatedStart}
              </time>
              {estimate.typicalLengthDays
                ? ` · typical recorded length ${estimate.typicalLengthDays} days`
                : null}
            </p>
          ) : estimate.typicalLengthDays ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Typical recorded length {estimate.typicalLengthDays} days
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {estimate.reason}
          </p>
        </>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        {CYCLE_ESTIMATE_DISCLAIMER}
      </p>
    </div>
  );
}
