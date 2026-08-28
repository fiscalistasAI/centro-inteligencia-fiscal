/**
 * "Lo que está pasando": observaciones generadas por reglas determinísticas
 * sobre los datos ya validados. Sin IA generativa y sin conclusiones
 * legales — sólo aritmética descrita en español.
 */

import type { DeclarationWithTax } from "@/lib/data/declarations";
import type { Dashboard } from "@/lib/tax/aggregate";
import { formatCurrency, formatPeriod, MONTH_NAMES } from "@/lib/tax/format";
import { toIndex } from "@/lib/tax/periods";

export type InsightTone = "neutral" | "up" | "down" | "attention";

export type Insight = {
  id: string;
  tone: InsightTone;
  text: string;
};

function percent(change: number): string {
  return `${Math.abs(change * 100).toFixed(1).replace(".", ",")}%`;
}

export function buildInsights(
  dashboard: Dashboard,
  allDeclarations: DeclarationWithTax[],
): Insight[] {
  const insights: Insight[] = [];
  const months = dashboard.series;
  const withData = months.filter((point) => point.declarations > 0);

  if (withData.length === 0) return insights;

  // 1. Variación del pago total respecto al mes previo con información.
  const lastTwo = withData.slice(-2);
  if (lastTwo.length === 2) {
    const [prev, last] = lastTwo;
    if (prev.total !== null && last.total !== null && prev.total !== 0) {
      const change = (last.total - prev.total) / prev.total;
      if (Math.abs(change) >= 0.05) {
        insights.push({
          id: "total-mom",
          tone: change > 0 ? "up" : "down",
          text: `El pago de impuestos ${change > 0 ? "aumentó" : "disminuyó"} ${percent(change)} respecto a ${formatPeriod(prev.year, prev.month)}.`,
        });
      }
    }
  }

  // 2. Racha de saldos a favor de IVA.
  let streak = 0;
  for (const point of [...months].reverse()) {
    if (point.declarations === 0) break;
    if (point.ivaBalance !== null && point.ivaBalance < 0) streak += 1;
    else break;
  }
  if (streak >= 2) {
    insights.push({
      id: "iva-favor-streak",
      tone: "attention",
      text: `Este es el ${streak.toString()}º mes consecutivo con saldo a favor de IVA.`,
    });
  }

  // 3. Mes con el ISR más alto del periodo.
  const isrMonths = withData.filter(
    (point): point is typeof point & { isr: number } => point.isr !== null,
  );
  if (isrMonths.length >= 3) {
    const max = isrMonths.reduce((a, b) => (b.isr > a.isr ? b : a));
    if (max.isr > 0) {
      insights.push({
        id: "isr-max",
        tone: "neutral",
        text: `El ISR de ${MONTH_NAMES[max.month - 1].toLowerCase()} fue el más alto del periodo, con ${formatCurrency(max.isr)}.`,
      });
    }
  }

  // 4. Comparación contra el mismo periodo del año anterior.
  const yearAgo = sumTotalForOffset(allDeclarations, dashboard, -12);
  if (dashboard.totalPaid.value !== null && yearAgo !== null && yearAgo !== 0) {
    const change = (dashboard.totalPaid.value - yearAgo) / yearAgo;
    if (Math.abs(change) >= 0.05) {
      insights.push({
        id: "total-yoy",
        tone: change > 0 ? "up" : "down",
        text: `El pago total ${change > 0 ? "aumentó" : "disminuyó"} ${percent(change)} respecto al mismo periodo del año anterior.`,
      });
    }
  }

  // 5. Huecos: meses del periodo sin declaración registrada.
  const firstWithData = months.findIndex((point) => point.declarations > 0);
  const gaps = months
    .slice(firstWithData)
    .filter((point) => point.declarations === 0)
    .slice(0, 2);

  for (const gap of gaps) {
    insights.push({
      id: `gap-${gap.year}-${gap.month}`,
      tone: "attention",
      text: `No existe declaración registrada para ${formatPeriod(gap.year, gap.month).toLowerCase()}.`,
    });
  }

  return insights.slice(0, 5);
}

/** Total pagado en el mismo rango, desplazado `offset` meses. */
function sumTotalForOffset(
  declarations: DeclarationWithTax[],
  dashboard: Dashboard,
  offset: number,
): number | null {
  const from = toIndex(dashboard.range.from) + offset;
  const to = toIndex(dashboard.range.to) + offset;

  const values = declarations
    .filter((declaration) => {
      if (declaration.status !== "completed" || declaration.year === null) return false;
      const key = toIndex({
        year: declaration.year,
        month: declaration.month ?? 12,
      });
      return key >= from && key <= to;
    })
    .map((declaration) => declaration.tax?.amount_paid ?? declaration.tax?.amount_due ?? null)
    .filter((value): value is number => value !== null);

  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
}
