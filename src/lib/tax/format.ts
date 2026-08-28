import { TIMEZONE } from "@/lib/config";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyCompact = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  notation: "compact",
  maximumFractionDigits: 1,
});

const percent = new Intl.NumberFormat("es-MX", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Importes: `null` se muestra como guion largo, nunca como $0.00. */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return currency.format(value);
}

export function formatCurrencyCompact(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return currencyCompact.format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return percent.format(value);
}

export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const MONTH_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

/** "Junio 2026" · "2026" cuando no hay mes. */
export function formatPeriod(year: number | null, month: number | null): string {
  if (!year) return "—";
  if (!month) return String(year);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** "Jun 26" para ejes de gráficas. */
export function formatPeriodShort(year: number, month: number): string {
  return `${MONTH_SHORT[month - 1]} ${String(year).slice(2)}`;
}

/**
 * Fechas: se interpretan como fecha civil (sin hora) y se formatean
 * anclando explícitamente a la zona del proyecto, nunca en UTC implícito.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(date);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
