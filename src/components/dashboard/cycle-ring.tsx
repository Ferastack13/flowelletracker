interface CycleRingProps {
  progressPercent: number | null;
  headline: string;
  detail: string;
  cycleDay: number | null;
  cycleLength: number | null;
}

export function CycleRing({
  progressPercent,
  headline,
  detail,
  cycleDay,
  cycleLength,
}: CycleRingProps) {
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped =
    progressPercent == null ? 0 : Math.max(0, Math.min(100, progressPercent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg]"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--rose-soft)"
            strokeWidth={stroke}
            opacity={0.55}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--plum-soft)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex rotate-0 flex-col items-center justify-center px-8 text-center">
          <p className="font-serif text-2xl leading-tight tracking-tight text-plum sm:text-3xl">
            {headline}
          </p>
          {cycleDay != null ? (
            <p className="mt-2 text-xs tracking-[0.08em] text-muted-foreground uppercase">
              Cycle day {cycleDay}
              {cycleLength ? ` · typical ${cycleLength}d` : ""}
            </p>
          ) : null}
        </div>
      </div>
      <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}
