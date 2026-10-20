import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Learn",
  description: "Editorial guides on cycle health and self-care — coming soon.",
};

export default function LearnPage() {
  return (
    <PagePlaceholder
      title="Learn"
      description="Editorial guides for body literacy — calm, evidence-aware, and free of shame."
      icon={BookOpen}
      upcoming={[
        "Cycle phase primers",
        "Symptom literacy articles",
        "Self-care rituals by season of your cycle",
        "Curated reading lists",
      ]}
    />
  );
}
