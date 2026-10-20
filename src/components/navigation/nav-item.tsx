"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemLinkProps {
  href: string;
  title: string;
  icon: LucideIcon;
  onNavigate?: () => void;
  compact?: boolean;
}

export function NavItemLink({
  href,
  title,
  icon: Icon,
  onNavigate,
  compact = false,
}: NavItemLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
        compact &&
          "flex-col justify-center gap-1 rounded-md px-1.5 py-2 text-[10px] leading-tight tracking-wide",
        isActive
          ? compact
            ? "bg-plum text-ivory shadow-soft"
            : "bg-plum/95 text-ivory shadow-soft"
          : "text-muted-foreground hover:bg-muted/80 hover:text-plum",
      )}
    >
      {isActive && !compact ? (
        <span
          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-rose"
          aria-hidden="true"
        />
      ) : null}
      <Icon
        className={cn(
          "size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
          !isActive && "group-hover:scale-105",
          compact && "size-[1.15rem]",
        )}
        aria-hidden="true"
      />
      <span className={cn(compact && "max-w-full truncate")}>{title}</span>
    </Link>
  );
}
