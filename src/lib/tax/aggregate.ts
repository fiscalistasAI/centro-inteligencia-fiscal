/**
 * Agregación del dashboard.
 *
 * Regla que atraviesa todo el archivo: sumar `null` no produce cero.
 * Un mes sin declaración registrada queda como `null` y las gráficas lo
 * muestran como hueco, no como una caída a cero.
 */

import type { DeclarationWithTax } from "@/lib/data/declarations";
import { formatPeriodShort } from "@/lib/tax/format";
import {
  enumerateMonths,
  previousRange,
  resolveRange,
  toIndex,
  type PeriodOption,
  type PeriodRange,
  type YearMonth,
} from "@/lib/tax/periods";

export type MonthlyPoint = {
  year: number;
  month: number;
  /** Etiqueta del eje X: "Jun 26". */
  label: string;
  declarations: number;
  isr: number | null;
  iva: number | null;
  total: number | null;
  ivaCharged: number | null;
  ivaCreditable: number | null;
  ivaBalance: number | null;
};

export type KpiValue = {
  value: number | null;
  previous: number | null;
  /** Variación relativa contra el periodo anterior, o `null` si no aplica. */
  change: number | null;
};

export type Dashboard = {
  range: PeriodRange;
  series: MonthlyPoint[];
  totalPaid: KpiValue;
  isr: KpiValue;
  iva: KpiValue;
  count: KpiValue;
  /** Sólo mostramos la gráfica de IVA si hay sustancia que graficar. */
  hasIvaDetail: boolean;
  hasAnyData: boolean;
};

/** Suma preservando la ausencia: si nada aporta valor, el resultado es null. */
function sumNullable(values: (number | null)[]): number | null {
  const present = values.filter((value): value is number => value !== null);
  if (present.length === 0) return null;
  return Math.round(present.reduce((acc, value) => acc + value, 0) * 100) / 100;
}

function isrOf(declaration: DeclarationWithTax): number | null {
  return declaration.tax?.isr_tax_due ?? null;
}

function ivaOf(declaration: DeclarationWithTax): number | null {
  return declaration.tax?.iva_due ?? null;
}

function totalOf(declaration: DeclarationWithTax): number | null {
  return declaration.tax?.amount_paid ?? declaration.tax?.amount_due ?? null;
}

function isCounted(declaration: DeclarationWithTax): boolean {
  return declaration.status === "completed" && declaration.year !== null;
}

function keyOf(declaration: DeclarationWithTax): number | null {
  if (declaration.year === null) return null;
  // Una declaración anual se ancla a diciembre para poder ubicarla en la línea.
  return toIndex({ year: declaration.year, month: declaration.month ?? 12 });
}

function inRangeDeclarations(
  declarations: DeclarationWithTax[],
  range: PeriodRange,
): DeclarationWithTax[] {
  const from = toIndex(range.from);
  const to = toIndex(range.to);
  return declarations.filter((declaration) => {
    const key = keyOf(declaration);
    return key !== null && key >= from && key <= to;
  });
}

function kpi(
  current: DeclarationWithTax[],
  previous: DeclarationWithTax[],
  pick: (d: DeclarationWithTax) => number | null,
): KpiValue {
  const value = sumNullable(current.map(pick));
  const prev = sumNullable(previous.map(pick));
  const change =
    value !== null && prev !== null && prev !== 0 ? (value - prev) / prev : null;
  return { value, previous: prev, change };
}

export function buildDashboard(
  allDeclarations: DeclarationWithTax[],
  period: PeriodOption,
  now: Date = new Date(),
): Dashboard {
  const declarations = allDeclarations.filter(isCounted);
  const range = resolveRange(period, now);
  const previous = previousRange(range);

  const current = inRangeDeclarations(declarations, range);
  const before = inRangeDeclarations(declarations, previous);

  const byMonth = new Map<number, DeclarationWithTax[]>();
  for (const declaration of current) {
    const key = keyOf(declaration)!;
    const bucket = byMonth.get(key);
    if (bucket) bucket.push(declaration);
    else byMonth.set(key, [declaration]);
  }

  const series: MonthlyPoint[] = enumerateMonths(range).map((point: YearMonth) => {
    const bucket = byMonth.get(toIndex(point)) ?? [];
    return {
      year: point.year,
      month: point.month,
      label: formatPeriodShort(point.year, point.month),
      declarations: bucket.length,
      isr: sumNullable(bucket.map(isrOf)),
      iva: sumNullable(bucket.map(ivaOf)),
      total: sumNullable(bucket.map(totalOf)),
      ivaCharged: sumNullable(bucket.map((d) => d.tax?.iva_charged ?? null)),
      ivaCreditable: sumNullable(bucket.map((d) => d.tax?.iva_creditable ?? null)),
      ivaBalance: sumNullable(
        bucket.map((d) => {
          const due = d.tax?.iva_due ?? null;
          const favor = d.tax?.iva_balance_favor ?? null;
          if (due === null && favor === null) return null;
          return (due ?? 0) - (favor ?? 0);
        }),
      ),
    };
  });

  const monthsWithIvaDetail = series.filter(
    (point) => point.ivaCharged !== null || point.ivaCreditable !== null,
  ).length;

  return {
    range,
    series,
    totalPaid: kpi(current, before, totalOf),
    isr: kpi(current, before, isrOf),
    iva: kpi(current, before, ivaOf),
    count: {
      value: current.length,
      previous: before.length,
      change:
        before.length > 0 ? (current.length - before.length) / before.length : null,
    },
    hasIvaDetail: monthsWithIvaDetail >= 2,
    hasAnyData: current.length > 0,
  };
}
