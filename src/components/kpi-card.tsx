import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { KpiValue } from "@/lib/tax/aggregate";
import { formatCurrency } from "@/lib/tax/format";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  kpi,
  format = "currency",
  comparisonLabel = "vs periodo anterior",
}: {
  label: string;
  kpi: KpiValue;
  format?: "currency" | "count";
  comparisonLabel?: string;
}) {
  const value =
    kpi.value === null
      ? "—"
      : format === "currency"
        ? formatCurrency(kpi.value)
        : new Intl.NumberFormat("es-MX").format(kpi.value);

  const change = kpi.change;
  const Icon = change === null ? Minus : change >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardContent className="py-1">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p
          className={cn(
            "mt-2 flex items-center gap-1 text-xs",
            change === null
              ? "text-muted-foreground"
              : change >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400",
          )}
        >
          <Icon className="size-3.5 shrink-0" />
          {change === null
            ? "Sin comparativo"
            : `${Math.abs(change * 100).toFixed(1).replace(".", ",")}% ${comparisonLabel}`}
        </p>
      </CardContent>
    </Card>
  );
}
