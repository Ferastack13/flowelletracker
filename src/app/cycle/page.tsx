import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Cycle Tracker",
  description: "Track your menstrual cycle with Flowelle — coming soon.",
};

export default function CyclePage() {
  return (
    <PagePlaceholder
      title="Cycle Tracker"
      description="Log periods, note symptoms, and eventually see phase context — without noisy predictions."
      icon={CalendarDays}
      upcoming={[
        "Period start and end logging",
        "Symptom and mood check-ins",
        "Phase-aware overview (after you have history)",
        "Export and privacy controls",
      ]}
    />
  );
}
