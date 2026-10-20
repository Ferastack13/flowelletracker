import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  className?: string;
  rows?: number;
}

function LoadingState({
  label = "Loading…",
  className,
  rows = 3,
}: LoadingStateProps) {
  return (
    <div
      className={cn("space-y-3", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-4 animate-soft-pulse rounded-md bg-secondary"
          style={{ width: `${88 - index * 12}%` }}
        />
      ))}
    </div>
  );
}

export { LoadingState };
