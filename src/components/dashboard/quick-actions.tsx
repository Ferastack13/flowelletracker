import Link from "next/link";
import {
  CalendarDays,
  Droplets,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type QuickAction =
  | {
      id: string;
      label: string;
      description: string;
      icon: LucideIcon;
      href: string;
      available: true;
    }
  | {
      id: string;
      label: string;
      description: string;
      icon: LucideIcon;
      available: false;
      unavailableReason: string;
    };

const actions: QuickAction[] = [
  {
    id: "period",
    label: "Log period",
    description: "Open the cycle tracker",
    icon: Droplets,
    href: "/cycle",
    available: true,
  },
  {
    id: "symptoms",
    label: "Record symptoms",
    description: "Logging not available yet",
    icon: CalendarDays,
    available: false,
    unavailableReason: "Symptom logging is not implemented yet",
  },
  {
    id: "self-care",
    label: "Open self-care",
    description: "Habits and rituals",
    icon: Leaf,
    href: "/self-care",
    available: true,
  },
];

export function QuickActions() {
  return (
    <section
      className="animate-fade-up-delay-2 min-w-0"
      aria-labelledby="quick-actions-heading"
    >
      <div className="mb-3">
        <h2
          id="quick-actions-heading"
          className="font-serif text-lg tracking-tight text-plum"
        >
          Quick actions
        </h2>
        <p className="text-xs text-muted-foreground">
          Shortcuts that navigate where features exist; others stay unavailable.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const baseClass = cn(
            "group flex w-full min-w-0 items-center gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3 text-left shadow-soft transition-colors duration-200",
            action.available
              ? "hover:border-plum/25 hover:bg-muted/40"
              : "cursor-not-allowed opacity-70",
          );

          const content = (
            <>
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  action.available
                    ? "bg-rose-soft/55 text-plum"
                    : "bg-secondary text-muted-foreground",
                )}
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-plum">
                  {action.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {action.description}
                </span>
              </span>
            </>
          );

          return (
            <li key={action.id} className="min-w-0">
              {action.available ? (
                <Link
                  href={action.href}
                  className={cn(
                    baseClass,
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className={baseClass}
                  aria-label={`${action.label} — ${action.unavailableReason}`}
                  title={action.unavailableReason}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
