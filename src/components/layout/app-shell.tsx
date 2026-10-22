"use client";

import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NavItemLink } from "@/components/navigation/nav-item";
import { Button } from "@/components/ui/button";
import { appNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  accountPanel?: React.ReactNode;
}

export function AppShell({
  children,
  title,
  description,
  accountPanel,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] xl:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-lift"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden border-r border-border/70 bg-card/80 backdrop-blur-sm lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:overflow-y-auto lg:px-3 lg:py-7 xl:px-4">
        <div className="px-3 pb-7">
          <Logo href="/dashboard" size="sm" />
          <p className="mt-3 max-w-[12rem] text-[11px] leading-relaxed tracking-[0.04em] text-muted-foreground">
            Your cycle. Your care. Your rhythm.
          </p>
        </div>
        <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-1">
          {appNavItems.map((item) => (
            <NavItemLink
              key={item.href}
              href={item.href}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </nav>
        <div className="mt-8">
          {accountPanel ?? (
            <div className="rounded-xl border border-border/60 bg-muted/40 px-3.5 py-3.5">
              <p className="font-serif text-sm text-plum">Private by design</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                Sign in from the login page to save period dates and self-care.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Content column */}
      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/70 bg-ivory/92 px-4 py-3 backdrop-blur-md lg:hidden">
          <Logo href="/dashboard" size="sm" />
          <Button
            variant="outline"
            size="icon"
            aria-expanded={mobileOpen}
            aria-controls={panelId}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </header>

        {/* Mobile drawer */}
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden",
            mobileOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <button
            type="button"
            className={cn(
              "absolute inset-0 bg-plum-deep/35 transition-opacity duration-300 motion-reduce:transition-none",
              mobileOpen ? "opacity-100" : "opacity-0",
            )}
            aria-label="Close navigation overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id={panelId}
            className={cn(
              "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-border bg-card p-4 shadow-lift transition-transform duration-300 motion-reduce:transition-none",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="mb-6 flex items-center justify-between gap-2">
              <Logo href="/dashboard" size="sm" />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X />
              </Button>
            </div>
            <nav aria-label="Mobile primary" className="flex flex-col gap-1">
              {appNavItems.map((item) => (
                <NavItemLink
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  icon={item.icon}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </nav>
            <div className="mt-auto">
              {accountPanel ?? (
                <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Preview mode — sign in to save period dates and self-care.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <main
          id="main-content"
          className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 pb-24 sm:px-6 sm:py-7 lg:px-8 lg:py-8 lg:pb-10 xl:px-10"
        >
          {(title || description) && (
            <header className="mb-6 max-w-3xl animate-fade-up sm:mb-8">
              {title ? (
                <h1 className="font-serif text-3xl tracking-tight text-plum md:text-4xl">
                  {title}
                </h1>
              ) : null}
              {description ? (
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </header>
          )}
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          aria-label="Mobile quick navigation"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-card/96 px-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md lg:hidden"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5">
            {appNavItems.map((item) => (
              <li key={item.href} className="min-w-0">
                <NavItemLink
                  href={item.href}
                  title={item.title.split(" ")[0] ?? item.title}
                  icon={item.icon}
                  compact
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
