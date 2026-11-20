import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  Droplets,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions: Array<{
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
}> = [
  {
    id: "period",
    label: "Log period",
    description: "Start, end, and bleeding days",
    icon: Droplets,
    href: "/cycle",
  },
  {
    id: "symptoms",
    label: "Log symptoms",
    description: "Open symptom logging",
    icon: ClipboardList,
    href: "/cycle#symptoms",
  },
  {
    id: "checkin",
    label: "Daily check-in",
    description: "Hydration, movement, rest",
    icon: Leaf,
    href: "/self-care",
  },
  {
    id: "history",
    label: "Cycle history",
    description: "Past periods and lengths",
    icon: CalendarDays,
    href: "/cycle#history",
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
          Jump into the records you already keep in Flowelle.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.id} className="min-w-0">
              <Link
                href={action.href}
                className={cn(
                  "group flex h-full min-w-0 flex-col gap-3 rounded-2xl border border-border/80 bg-card px-3.5 py-4 shadow-soft transition-colors duration-200",
                  "hover:border-plum/25 hover:bg-muted/40",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-soft/55 text-plum">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-plum">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
