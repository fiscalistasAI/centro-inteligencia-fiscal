import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileUp, Sparkles } from "lucide-react";

import { InsightsPanel } from "@/components/insights-panel";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader, PageShell } from "@/components/page-header";
import { PeriodSelector } from "@/components/period-selector";
import { EmptyState } from "@/components/states";
import { IvaChart, TaxChart, TaxTrendChart } from "@/components/tax-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCompany } from "@/lib/data/companies";
import { listDeclarations } from "@/lib/data/declarations";
import { buildDashboard } from "@/lib/tax/aggregate";
import { buildInsights } from "@/lib/tax/insights";
import { DEFAULT_PERIOD, isPeriodOption, periodLabel } from "@/lib/tax/periods";

export const metadata: Metadata = { title: "Dashboard" };

export default async function CompanyDashboardPage({
  params,
  searchParams,
}: PageProps<"/empresas/[companyId]">) {
  const { companyId } = await params;
  const { periodo } = await searchParams;

  const company = await getCompany(companyId);
  if (!company) notFound();

  const period = isPeriodOption(typeof periodo === "string" ? periodo : undefined)
    ? (periodo as typeof DEFAULT_PERIOD)
    : DEFAULT_PERIOD;

  const declarations = await listDeclarations(companyId);
  const pendingReview = declarations.filter((d) => d.status === "review_required");
  const dashboard = buildDashboard(declarations, period);
  const insights = buildInsights(dashboard, declarations);

  const header = (
    <PageHeader
      title={
        <span className="flex items-center gap-2">
          {company.legal_name}
          {company.is_demo ? <Badge variant="secondary">Demo</Badge> : null}
        </span>
      }
      subtitle={<span className="font-mono">{company.rfc}</span>}
      actions={
        <>
          <PeriodSelector value={period} />
          <Button asChild>
            <Link href={`/empresas/${companyId}/cargar`}>
              <FileUp className="size-4" />
              Subir declaración
            </Link>
          </Button>
        </>
      }
    />
  );

  if (declarations.length === 0) {
    return (
      <PageShell>
        {header}
        <EmptyState
          className="mt-8"
          icon={Sparkles}
          title="Tu inteligencia fiscal comienza con una declaración."
          description="Sube el primer documento y convertiremos sus datos en indicadores y gráficas."
          actionLabel="Subir primera declaración"
          actionHref={`/empresas/${companyId}/cargar`}
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      {header}

      {pendingReview.length > 0 ? (
        <div className="border-primary/30 bg-accent/60 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3.5">
          <p className="text-sm">
            {pendingReview.length === 1
              ? "Tienes una declaración esperando revisión."
              : `Tienes ${pendingReview.length} declaraciones esperando revisión.`}
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link
              href={`/empresas/${companyId}/declaraciones/${pendingReview[0].id}/revisar`}
            >
              Revisar ahora
            </Link>
          </Button>
        </div>
      ) : null}

      {!dashboard.hasAnyData ? (
        <EmptyState
          icon={Sparkles}
          title={`Sin declaraciones en ${periodLabel(period).toLowerCase()}`}
          description="Cambia el periodo o sube una declaración para ver indicadores aquí."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total pagado" kpi={dashboard.totalPaid} />
            <KpiCard label="ISR" kpi={dashboard.isr} />
            <KpiCard label="IVA" kpi={dashboard.iva} />
            <KpiCard label="Declaraciones" kpi={dashboard.count} format="count" />
          </div>

          <TaxChart data={dashboard.series} />
          <TaxTrendChart data={dashboard.series} />
          {dashboard.hasIvaDetail ? <IvaChart data={dashboard.series} /> : null}

          <InsightsPanel insights={insights} />
        </>
      )}
    </PageShell>
  );
}
