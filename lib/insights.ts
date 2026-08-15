import type { MonthlyTaxData } from "@/lib/types";

export type Insight = {
  id: string;
  tone: "positive" | "warning" | "info";
  title: string;
  description: string;
};

export function generateInsights(data: MonthlyTaxData[]): Insight[] {
  if (data.length < 2) return [];

  const current = data.at(-1)!;
  const previous = data.at(-2)!;
  const change = ((current.totalPaid - previous.totalPaid) / previous.totalPaid) * 100;
  const maxIsr = data.reduce((max, row) => (row.isr > max.isr ? row : max));
  const favorStreak = [...data].reverse().findIndex((row) => row.ivaBalanceFavor === 0);

  const insights: Insight[] = [
    {
      id: "monthly-change",
      tone: change >= 0 ? "info" : "positive",
      title: change >= 0 ? "El pago total aumentó" : "El pago total disminuyó",
      description: `${Math.abs(change).toFixed(1)}% respecto al periodo anterior.`,
    },
    {
      id: "isr-peak",
      tone: "info",
      title: "ISR más alto del periodo",
      description: `${maxIsr.monthLabel} registró el mayor ISR de los últimos ${data.length} meses.`,
    },
  ];

  if (favorStreak > 0) {
    insights.push({
      id: "iva-favor",
      tone: "positive",
      title: "Saldo a favor consecutivo",
      description: `Hay ${favorStreak} periodos consecutivos con saldo a favor de IVA.`,
    });
  }

  return insights;
}
