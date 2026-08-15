import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowSummary } from "@/components/workflow-summary";
import { KpiRow } from "@/components/kpi-row";
import { TaxChart } from "@/components/tax-chart";
import { InsightsPanel } from "@/components/insights-panel";
import { DeclarationTable } from "@/components/declaration-table";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="text-2xl font-bold tracking-[-0.02em] sm:text-[2rem]">Resumen fiscal</h1><p className="mt-1 max-w-[65ch] text-sm text-muted sm:text-base">Tus declaraciones convertidas en una vista clara de pagos, variaciones y pendientes.</p></div>
      <WorkflowSummary />
      <KpiRow />
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.78fr)]"><TaxChart /><InsightsPanel /></div>
      <section className="panel overflow-hidden" aria-labelledby="recent-title">
        <div className="flex items-center justify-between px-4 py-4 sm:px-5"><div><h2 id="recent-title" className="font-semibold">Declaraciones recientes</h2><p className="mt-1 text-sm text-muted">Últimos documentos incorporados al análisis.</p></div><Button asChild variant="ghost" size="sm"><Link href="/declaraciones">Ver todas <ArrowRight className="size-4" /></Link></Button></div>
        <DeclarationTable compact />
      </section>
    </div>
  );
}
