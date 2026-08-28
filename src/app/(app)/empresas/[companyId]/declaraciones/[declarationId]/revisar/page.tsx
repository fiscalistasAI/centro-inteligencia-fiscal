import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExtractionReview } from "@/components/extraction-review";
import { PageHeader, PageShell } from "@/components/page-header";
import { getCompany } from "@/lib/data/companies";
import { createSignedUrl, getDeclaration } from "@/lib/data/declarations";
import { declarationFieldsFromRow, taxAmountsFromRow } from "@/lib/tax/mapping";

export const metadata: Metadata = { title: "Revisar declaración" };

export default async function ReviewPage({
  params,
}: PageProps<"/empresas/[companyId]/declaraciones/[declarationId]/revisar">) {
  const { companyId, declarationId } = await params;

  const [company, declaration] = await Promise.all([
    getCompany(companyId),
    getDeclaration(declarationId),
  ]);

  if (!company || !declaration || declaration.company_id !== companyId) notFound();

  const documentUrl = declaration.file_path
    ? await createSignedUrl(declaration.file_path)
    : null;

  const confidence = (declaration.confidence ?? {}) as Record<string, number | null>;
  const raw = declaration.raw_extraction as
    | { taxpayer?: { name?: string | null } }
    | null;

  return (
    <PageShell>
      <PageHeader
        title="Revisa la información encontrada"
        subtitle="Identificamos estos datos en tu declaración. Confírmalos antes de agregarlos al dashboard."
      />

      <div className="mt-6">
        <ExtractionReview
          declarationId={declaration.id}
          companyId={companyId}
          company={{ legal_name: company.legal_name, rfc: company.rfc }}
          fields={declarationFieldsFromRow(declaration)}
          amounts={taxAmountsFromRow(declaration.tax)}
          confidence={confidence}
          taxpayerName={raw?.taxpayer?.name ?? null}
          notes={declaration.notes}
          documentUrl={documentUrl}
          fileName={declaration.file_name}
        />
      </div>
    </PageShell>
  );
}
