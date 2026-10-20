import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl md:text-5xl",
};

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 18.5c1.8 2.8 4.2 4.2 6 4.2s4.2-1.4 6-4.2c-1.2-3.4-2.8-5.6-6-7.8-3.2 2.2-4.8 4.4-6 7.8Z"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="16" cy="13" r="1.6" fill="var(--ivory)" />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
  showTagline = false,
  size = "md",
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex flex-col", className)}>
      <span className="inline-flex items-center gap-2.5 text-plum">
        <LogoMark
          className={cn(
            size === "lg" ? "h-9 w-9" : size === "md" ? "h-7 w-7" : "h-6 w-6",
          )}
        />
        <span
          className={cn(
            "font-serif font-medium tracking-tight",
            sizeClasses[size],
          )}
        >
          Flowelle
        </span>
      </span>
      {showTagline ? (
        <span className="mt-1 pl-[2.4rem] text-xs tracking-[0.08em] text-muted-foreground uppercase">
          Your cycle. Your care. Your rhythm.
        </span>
      ) : null}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="rounded-md transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Flowelle home"
    >
      {content}
    </Link>
  );
}
