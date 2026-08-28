import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DeclarationUploader } from "@/components/declaration-uploader";
import { PageHeader, PageShell } from "@/components/page-header";
import { getCompany } from "@/lib/data/companies";

export const metadata: Metadata = { title: "Subir declaración" };

export default async function UploadPage({
  params,
}: PageProps<"/empresas/[companyId]/cargar">) {
  const { companyId } = await params;
  const company = await getCompany(companyId);
  if (!company) notFound();

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        title="Subir declaración"
        subtitle={
          <>
            {company.legal_name} · <span className="font-mono">{company.rfc}</span>
          </>
        }
      />

      <div className="mt-6">
        <DeclarationUploader companyId={company.id} />
      </div>

      <p className="text-muted-foreground mt-6 text-sm text-pretty">
        Leemos el documento y te mostramos los datos encontrados para que los
        confirmes. No necesitas capturar nada a mano.
      </p>
    </PageShell>
  );
}
