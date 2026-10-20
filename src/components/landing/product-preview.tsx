import { Badge } from "@/components/ui/badge";
import { MOCK_DATA_NOTICE, mockPreviewCycle } from "@/lib/mock-data";

export function ProductPreview() {
  const progress = Math.round(
    ((mockPreviewCycle.currentDay ?? 0) / (mockPreviewCycle.cycleLength ?? 28)) *
      100,
  );

  return (
    <figure
      className="relative mx-auto w-full max-w-lg animate-fade-up-delay-2"
      aria-label="Product preview of the Flowelle dashboard"
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-rose/30 via-transparent to-sage/25 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lift">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg text-plum">Flowelle</span>
            <Badge variant="outline">Preview</Badge>
          </div>
          <span className="text-xs text-muted-foreground">Day {mockPreviewCycle.currentDay}</span>
        </div>
        <div className="space-y-5 p-5">
          <div className="rounded-xl bg-gradient-to-br from-plum to-plum-soft p-5 text-ivory">
            <p className="text-xs uppercase tracking-[0.14em] text-ivory/70">
              Her Daily Note
            </p>
            <p className="mt-2 font-serif text-xl leading-snug">
              Honour the quiet energy of mid-cycle with warmth and unhurried care.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Cycle overview</p>
                <p className="font-serif text-3xl text-plum">
                  Day {mockPreviewCycle.currentDay}
                </p>
              </div>
              <Badge variant="rose">{mockPreviewCycle.phaseLabel}</Badge>
            </div>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
              role="presentation"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose to-plum-soft"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Hydrate", "Rest", "Move"].map((label, index) => (
              <div
                key={label}
                className="rounded-lg border border-border/60 bg-card px-2 py-3 text-center"
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 font-serif text-sm text-plum">
                  {index === 1 ? "Open" : "Done"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted-foreground">
        {MOCK_DATA_NOTICE}
      </figcaption>
    </figure>
  );
}
