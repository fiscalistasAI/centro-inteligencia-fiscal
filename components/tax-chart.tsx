"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compactMoney, money } from "@/lib/utils";
import { monthlyTaxData } from "@/lib/demo-data";

export function TaxChart() {
  return (
    <section className="panel min-w-0 p-4 sm:p-5" aria-labelledby="tax-chart-title">
      <div className="mb-5"><h2 id="tax-chart-title" className="text-base font-semibold">Evolución de impuestos pagados</h2><p className="mt-1 text-sm text-muted">ISR, IVA y pago total mensual en MXN</p></div>
      <div className="h-[330px] w-full" role="img" aria-label="Gráfica de ISR, IVA y pago total de los últimos doce meses">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyTaxData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.92 0.01 235)" vertical={false} />
            <XAxis dataKey="monthLabel" tick={{ fill: "oklch(0.45 0.025 245)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(value) => compactMoney.format(value)} tick={{ fill: "oklch(0.45 0.025 245)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => money.format(Number(value))} contentStyle={{ borderRadius: 10, borderColor: "oklch(0.9 0.012 235)", boxShadow: "0 4px 8px oklch(0.21 0.034 250 / .08)" }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Bar dataKey="isr" name="ISR" stackId="tax" fill="oklch(0.55 0.091 210)" radius={[0, 0, 2, 2]} />
            <Bar dataKey="iva" name="IVA" stackId="tax" fill="oklch(0.74 0.09 210)" radius={[3, 3, 0, 0]} />
            <Line dataKey="totalPaid" name="Total pagado" stroke="oklch(0.32 0.1 210)" strokeWidth={2.5} dot={{ r: 2.5, fill: "oklch(0.32 0.1 210)" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
