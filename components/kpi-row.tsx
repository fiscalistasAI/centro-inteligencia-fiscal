import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { money } from "@/lib/utils";

const kpis = [
  { label: "Total pagado", value: 8282000, change: 12.8, money: true },
  { label: "ISR", value: 5663000, change: 9.4, money: true },
  { label: "IVA", value: 2961000, change: 18.7, money: true },
  { label: "Declaraciones", value: 12, change: 2, money: false },
];

export function KpiRow() {
  return (
    <section className="panel grid grid-cols-2 divide-x divide-y divide-border overflow-hidden lg:grid-cols-4 lg:divide-y-0" aria-label="Indicadores principales">
      {kpis.map((item, index) => {
        const positive = item.change >= 0;
        const Icon = positive ? ArrowUpRight : ArrowDownRight;
        return (
          <div key={item.label} className="min-w-0 px-4 py-4 sm:px-5">
            <p className="text-sm font-medium text-muted">{item.label}</p>
            <p className="tabular mt-2 truncate text-xl font-bold sm:text-2xl">{item.money ? money.format(item.value) : item.value}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted"><span className="inline-flex items-center font-semibold text-success"><Icon className="size-3.5" />{item.change}%</span>{index === 3 ? "más que el periodo anterior" : "vs. periodo anterior"}</p>
          </div>
        );
      })}
    </section>
  );
}
