import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CycleInsight } from "@/lib/cycle-intelligence";

interface TodayInsightsCardProps {
  insights: CycleInsight[];
}

export function TodayInsightsCard({ insights }: TodayInsightsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl md:text-xl">Today’s insights</CardTitle>
        <CardDescription>
          Gentle notes from your saved records — not a diagnosis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-xl border border-border/70 bg-gradient-to-r from-rose-soft/20 to-transparent px-4 py-3"
          >
            <p className="text-sm font-medium text-plum">{insight.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {insight.detail}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
