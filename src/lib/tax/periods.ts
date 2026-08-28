/**
 * Rangos de periodo del dashboard.
 *
 * Todo el cálculo de calendario se ancla a `America/Monterrey`: el "mes
 * actual" del usuario no es el mes UTC del servidor de Vercel.
 */

import { TIMEZONE } from "@/lib/config";

export const PERIOD_OPTIONS = [
  { value: "last_6", label: "Últimos 6 meses" },
  { value: "last_12", label: "Últimos 12 meses" },
  { value: "current_year", label: "Año actual" },
  { value: "previous_year", label: "Año anterior" },
] as const;

export type PeriodOption = (typeof PERIOD_OPTIONS)[number]["value"];
export const DEFAULT_PERIOD: PeriodOption = "last_12";

export function isPeriodOption(value: string | undefined): value is PeriodOption {
  return PERIOD_OPTIONS.some((option) => option.value === value);
}

export function periodLabel(period: PeriodOption): string {
  return PERIOD_OPTIONS.find((option) => option.value === period)!.label;
}

/** Un punto en la línea del tiempo fiscal: año + mes, comparable como entero. */
export type YearMonth = { year: number; month: number };

export function toIndex({ year, month }: YearMonth): number {
  return year * 12 + (month - 1);
}

export function fromIndex(index: number): YearMonth {
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** Mes actual en la zona horaria del proyecto. */
export function currentYearMonth(now: Date = new Date()): YearMonth {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")!.value);
  const month = Number(parts.find((p) => p.type === "month")!.value);
  return { year, month };
}

export type PeriodRange = {
  /** Primer mes incluido. */
  from: YearMonth;
  /** Último mes incluido. */
  to: YearMonth;
  /** Cantidad de meses del rango. */
  months: number;
};

export function resolveRange(period: PeriodOption, now: Date = new Date()): PeriodRange {
  const current = currentYearMonth(now);

  switch (period) {
    case "last_6":
      return buildRange(current, 6);
    case "last_12":
      return buildRange(current, 12);
    case "current_year":
      return {
        from: { year: current.year, month: 1 },
        to: { year: current.year, month: 12 },
        months: 12,
      };
    case "previous_year":
      return {
        from: { year: current.year - 1, month: 1 },
        to: { year: current.year - 1, month: 12 },
        months: 12,
      };
  }
}

function buildRange(end: YearMonth, months: number): PeriodRange {
  const endIndex = toIndex(end);
  return {
    from: fromIndex(endIndex - (months - 1)),
    to: end,
    months,
  };
}

/**
 * El rango inmediatamente anterior, del mismo tamaño. Es la base de todas
 * las comparaciones "vs periodo anterior" de los KPI.
 */
export function previousRange(range: PeriodRange): PeriodRange {
  const fromIdx = toIndex(range.from);
  return {
    from: fromIndex(fromIdx - range.months),
    to: fromIndex(fromIdx - 1),
    months: range.months,
  };
}

/** Todos los meses del rango, en orden cronológico. */
export function enumerateMonths(range: PeriodRange): YearMonth[] {
  const start = toIndex(range.from);
  return Array.from({ length: range.months }, (_, i) => fromIndex(start + i));
}

export function inRange(point: YearMonth, range: PeriodRange): boolean {
  const index = toIndex(point);
  return index >= toIndex(range.from) && index <= toIndex(range.to);
}
