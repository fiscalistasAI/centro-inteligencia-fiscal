import type { Metadata } from "next";
import Link from "next/link";
import { Building2, FileText, Sparkles } from "lucide-react";

import { CompanyDialog } from "./company-dialog";
import { seedDemoData } from "./actions";
import { PageHeader, PageShell } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCompanies } from "@/lib/data/companies";
import { formatPeriod } from "@/lib/tax/format";

export const metadata: Metadata = { title: "Empresas" };

export default async function CompaniesPage() {
  const companies = await listCompanies();

  if (companies.length === 0) {
    return (
      <PageShell>
        <PageHeader title="Empresas" />
        <EmptyState
          className="mt-8"
          icon={Building2}
          title="Crea tu primera empresa"
          description="Registra la empresa para empezar a convertir sus declaraciones en indicadores y tendencias."
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <CompanyDialog />
            <form action={seedDemoData}>
              <Button type="submit" variant="outline">
                <Sparkles className="size-4" />
                Cargar datos demo
              </Button>
            </form>
          </div>
        </EmptyState>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Empresas"
        subtitle={`${companies.length} ${companies.length === 1 ? "empresa registrada" : "empresas registradas"}`}
        actions={<CompanyDialog />}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/empresas/${company.id}`}
            className="focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Card className="hover:border-primary/40 h-full transition-colors">
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2 text-base leading-snug">
                  <span className="min-w-0 flex-1">{company.legal_name}</span>
                  {company.is_demo ? (
                    <Badge variant="secondary" className="shrink-0">
                      Demo
                    </Badge>
                  ) : null}
                </CardTitle>
                <p className="text-muted-foreground font-mono text-xs">{company.rfc}</p>
              </CardHeader>
              <CardContent className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">Declaraciones</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-lg font-semibold tabular-nums">
                    <FileText className="text-muted-foreground size-4" />
                    {company.declarationsCount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Último periodo</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {company.lastPeriod
                      ? formatPeriod(company.lastPeriod.year, company.lastPeriod.month)
                      : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
