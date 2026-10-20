import type { Metadata } from "next";
import { HeartPulse } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Self-care",
  description: "Build self-care habits with Flowelle — coming soon.",
};

export default function SelfCarePage() {
  return (
    <PagePlaceholder
      title="Self-care"
      description="Gentle habits and rituals that move with your energy through the month."
      icon={HeartPulse}
      upcoming={[
        "Daily habit check-ins",
        "Custom ritual lists",
        "Streaks that feel encouraging, not punishing",
        "Phase-aware suggestions (future)",
      ]}
    />
  );
}
