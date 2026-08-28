import { AlertCircle, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Insight, InsightTone } from "@/lib/tax/insights";

const TONE_ICONS: Record<InsightTone, typeof Minus> = {
  neutral: Minus,
  up: TrendingUp,
  down: TrendingDown,
  attention: AlertCircle,
};

const TONE_STYLES: Record<InsightTone, string> = {
  neutral: "text-muted-foreground bg-muted",
  up: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400",
  down: "text-amber-700 bg-amber-500/10 dark:text-amber-400",
  attention: "text-primary bg-accent",
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lo que está pasando</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((insight) => {
            const Icon = TONE_ICONS[insight.tone];
            return (
              <li key={insight.id} className="flex items-start gap-3">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full ${TONE_STYLES[insight.tone]}`}
                >
                  <Icon className="size-3.5" />
                </span>
                <p className="text-sm text-pretty">{insight.text}</p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
