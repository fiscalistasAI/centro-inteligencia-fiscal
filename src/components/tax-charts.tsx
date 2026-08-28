"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyPoint } from "@/lib/tax/aggregate";
import { formatCurrency, formatCurrencyCompact } from "@/lib/tax/format";

type TooltipEntry = { name?: string; value?: number | null; color?: string };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover text-popover-foreground border-border rounded-lg border px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-medium">{label}</p>
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2 rounded-[2px]"
                style={{ background: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-medium tabular-nums">
              {entry.value === null || entry.value === undefined
                ? "—"
                : formatCurrency(entry.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

/** Impuestos pagados por periodo: ISR e IVA lado a lado. */
export function TaxChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Impuestos pagados por periodo</CardTitle>
        <CardDescription>ISR e IVA determinados en cada mes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={72} tickFormatter={formatCurrencyCompact} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--accent)" }} />
            <Legend
              iconType="square"
              iconSize={9}
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Bar dataKey="isr" name="ISR" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="iva" name="IVA" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/** Evolución del pago total. */
export function TaxTrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolución del pago total</CardTitle>
        <CardDescription>
          Importe pagado por mes. Los meses sin declaración quedan vacíos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={72} tickFormatter={formatCurrencyCompact} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              name="Total pagado"
              stroke="var(--chart-3)"
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 0, fill: "var(--chart-3)" }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/** IVA por periodo: trasladado, acreditable y el neto resultante. */
export function IvaChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">IVA por periodo</CardTitle>
        <CardDescription>
          Trasladado contra acreditable, y el saldo que resulta de la diferencia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={72} tickFormatter={formatCurrencyCompact} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--accent)" }} />
            <Legend
              iconType="square"
              iconSize={9}
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Bar
              dataKey="ivaCharged"
              name="IVA trasladado"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="ivaCreditable"
              name="IVA acreditable"
              fill="var(--chart-4)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="ivaBalance"
              name="Saldo (a cargo / a favor)"
              fill="var(--chart-5)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
