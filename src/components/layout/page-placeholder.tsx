import type { LucideIcon } from "lucide-react";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  upcoming: string[];
}

export function PagePlaceholder({
  title,
  description,
  icon: Icon,
  upcoming,
}: PagePlaceholderProps) {
  return (
    <AppShellWithAuth title={title} description={description}>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="animate-fade-up">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="sage">Coming soon</Badge>
            </div>
            <CardTitle>This space is ready for your rhythm</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Icon className="size-5" aria-hidden="true" />}
              title={`${title} is not connected yet`}
              description="Guides are not published yet. Period dates, self-care check-ins, and today’s general note live on their own pages."
            />
          </CardContent>
        </Card>

        <Card className="animate-fade-up-delay-1">
          <CardHeader>
            <CardTitle className="text-xl md:text-xl">Planned here</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcoming.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShellWithAuth>
  );
}
