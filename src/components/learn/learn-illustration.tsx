import { cn } from "@/lib/utils";

interface LearnIllustrationProps {
  className?: string;
  title?: string;
}

export function LearnIllustration({
  className,
  title = "Editorial botanical illustration",
}: LearnIllustrationProps) {
  return (
    <svg
      viewBox="0 0 640 360"
      role="img"
      aria-label={title}
      className={cn("h-full w-full", className)}
    >
      <rect width="640" height="360" fill="#F3EBE2" />
      <rect x="0" y="0" width="640" height="360" fill="#E8C4CE" opacity="0.28" />
      <circle cx="520" cy="70" r="120" fill="#C5C8B8" opacity="0.45" />
      <circle cx="90" cy="300" r="90" fill="#D69AA8" opacity="0.22" />
      <g fill="none" stroke="#4A263B" strokeOpacity="0.45" strokeWidth="1.6">
        <path d="M80 300 C140 240, 170 180, 210 90" />
        <path d="M210 90 C250 40, 310 30, 360 70" />
        <path d="M200 210 C260 170, 330 190, 390 150" />
        <path d="M390 150 C450 110, 500 140, 560 100" />
      </g>
      <g fill="#6B3A55" fillOpacity="0.55">
        <ellipse cx="210" cy="92" rx="28" ry="14" transform="rotate(-28 210 92)" />
        <ellipse cx="318" cy="58" rx="34" ry="16" transform="rotate(18 318 58)" />
        <ellipse cx="392" cy="148" rx="26" ry="13" transform="rotate(-12 392 148)" />
        <ellipse cx="498" cy="126" rx="32" ry="15" transform="rotate(24 498 126)" />
      </g>
      <g fill="#A5A995" fillOpacity="0.7">
        <ellipse cx="168" cy="168" rx="22" ry="11" transform="rotate(-40 168 168)" />
        <ellipse cx="276" cy="186" rx="24" ry="12" transform="rotate(12 276 186)" />
        <ellipse cx="444" cy="188" rx="20" ry="10" transform="rotate(-8 444 188)" />
      </g>
      <text
        x="48"
        y="312"
        fill="#4A263B"
        fillOpacity="0.55"
        fontFamily="Georgia, serif"
        fontSize="22"
      >
        A quieter kind of literacy
      </text>
    </svg>
  );
}
