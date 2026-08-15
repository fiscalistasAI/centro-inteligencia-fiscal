import { ArrowDownRight, ArrowUpRight, CircleAlert, Lightbulb } from "lucide-react";
import { generateInsights } from "@/lib/insights";
import { monthlyTaxData } from "@/lib/demo-data";

const icons = { positive: ArrowDownRight, warning: CircleAlert, info: ArrowUpRight };

export function InsightsPanel() {
  const insights = generateInsights(monthlyTaxData);
  return (
    <aside className="panel p-4 sm:p-5" aria-labelledby="insights-title">
      <div className="flex items-center gap-2"><Lightbulb className="size-5 text-primary" /><h2 id="insights-title" className="text-base font-semibold">Lo que está pasando</h2></div>
      <p className="mt-1 text-sm text-muted">Observaciones calculadas a partir de tus datos.</p>
      <div className="mt-4 divide-y divide-border">
        {insights.map((insight) => {
          const Icon = icons[insight.tone];
          return <div key={insight.id} className="flex gap-3 py-4 first:pt-2"><span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${insight.tone === "positive" ? "bg-success/10 text-success" : insight.tone === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}><Icon className="size-4" /></span><div><h3 className="text-sm font-semibold">{insight.title}</h3><p className="mt-1 text-sm leading-5 text-muted">{insight.description}</p></div></div>;
        })}
      </div>
      <p className="mt-3 rounded-[10px] bg-surface px-3 py-2.5 text-xs leading-5 text-muted">Estos insights son matemáticos y no constituyen una recomendación fiscal.</p>
    </aside>
  );
}
