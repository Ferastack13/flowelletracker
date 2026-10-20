import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-soft/40 text-plum"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <h3 className="font-serif text-lg text-plum">{title}</h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
