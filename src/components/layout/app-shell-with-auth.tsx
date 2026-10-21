import { AccountPanel } from "@/components/auth/account-panel";
import { AppShell } from "@/components/layout/app-shell";

interface AppShellWithAuthProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export async function AppShellWithAuth({
  children,
  title,
  description,
}: AppShellWithAuthProps) {
  return (
    <AppShell
      title={title}
      description={description}
      accountPanel={<AccountPanel />}
    >
      {children}
    </AppShell>
  );
}
