import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, FileUp } from "lucide-react";

import { DeclarationTable, type DeclarationTableRow } from "@/components/declaration-table";
import { PageHeader, PageShell } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { getCompany } from "@/lib/data/companies";
import { listDeclarations } from "@/lib/data/declarations";

export const metadata: Metadata = { title: "Declaraciones" };

export default async function DeclarationsPage({
  params,
}: PageProps<"/empresas/[companyId]/declaraciones">) {
  const { companyId } = await params;

  const company = await getCompany(companyId);
  if (!company) notFound();

  const declarations = await listDeclarations(companyId);

  const rows: DeclarationTableRow[] = declarations.map((declaration) => ({
    id: declaration.id,
    year: declaration.year,
    month: declaration.month,
    declarationType: declaration.declaration_type,
    filingDate: declaration.filing_date,
    isr: declaration.tax?.isr_tax_due ?? null,
    iva: declaration.tax?.iva_due ?? null,
    total: declaration.tax?.amount_paid ?? declaration.tax?.amount_due ?? null,
    status: declaration.status,
    hasFile: Boolean(declaration.file_path),
  }));

  return (
    <PageShell>
      <PageHeader
        title="Declaraciones"
        subtitle={
          <>
            {company.legal_name} · <span className="font-mono">{company.rfc}</span>
          </>
        }
        actions={
          <Button asChild>
            <Link href={`/empresas/${companyId}/cargar`}>
              <FileUp className="size-4" />
              Subir declaración
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aún no hay declaraciones"
            description="Sube el primer documento y aparecerá aquí con sus importes y su estado."
            actionLabel="Subir primera declaración"
            actionHref={`/empresas/${companyId}/cargar`}
          />
        ) : (
          <DeclarationTable rows={rows} companyId={companyId} />
        )}
      </div>
    </PageShell>
  );
}
