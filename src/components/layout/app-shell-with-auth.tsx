import { Suspense } from "react";
import {
  AccountPanel,
  AccountPanelFallback,
} from "@/components/auth/account-panel";
import { AppShell } from "@/components/layout/app-shell";

interface AppShellWithAuthProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AppShellWithAuth({
  children,
  title,
  description,
}: AppShellWithAuthProps) {
  return (
    <AppShell
      title={title}
      description={description}
      accountPanel={
        <Suspense fallback={<AccountPanelFallback />}>
          <AccountPanel />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
