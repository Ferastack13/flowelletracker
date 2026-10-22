import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Settings",
  description: "Preferences and privacy controls for Flowelle — coming soon.",
};

export default function SettingsPage() {
  return (
    <AppShellWithAuth
      title="Settings"
      description="Sign in from the sidebar. Profile preferences still do not save."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="animate-fade-up">
          <CardHeader>
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="outline">Form preview</Badge>
            </div>
            <CardTitle>Profile preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                name="displayName"
                placeholder="How should we greet you?"
                disabled
                aria-describedby="display-name-help"
              />
              <p id="display-name-help" className="text-xs text-muted-foreground">
                Profile preferences do not save yet.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="care-note">Self-care intention</Label>
              <Textarea
                id="care-note"
                name="careNote"
                placeholder="A short intention for this season of your cycle…"
                disabled
              />
            </div>
            <Button type="button" disabled>
              Save changes (coming soon)
            </Button>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-xl">
              <Settings className="size-5" aria-hidden="true" />
              Planned controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li>Notification preferences (off by default)</li>
              <li>Data export and deletion</li>
              <li>Cycle length defaults and privacy toggles</li>
              <li>A saved display name and greeting</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShellWithAuth>
  );
}
