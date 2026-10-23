import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/app/login/login-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Flowelle with an email link.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-dvh flex-col px-4 py-8 sm:px-6">
      <header className="mx-auto flex w-full max-w-md items-center justify-between">
        <Logo size="sm" href="/" />
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Open dashboard
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 items-center py-10">
        <Card className="w-full">
          <CardHeader>
            <p className="text-[11px] font-medium tracking-[0.14em] text-rose-muted uppercase">
              Account
            </p>
            <CardTitle className="text-2xl md:text-2xl">
              Sign in to your space
            </CardTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We send a one-time link to your email. No password. Period dates,
              symptoms, and self-care check-ins save after you sign in.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense fallback={null}>
              <LoginCallbackNotice searchParams={searchParams} />
            </Suspense>
            <LoginForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

async function LoginCallbackNotice({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (params.error !== "callback") return null;

  return (
    <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      That sign-in link could not be completed. Request a new one.
    </p>
  );
}
