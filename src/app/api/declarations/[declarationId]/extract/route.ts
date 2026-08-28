import { NextResponse } from "next/server";

import { extractTaxDeclaration } from "@/lib/ai/extract";
import { STORAGE_BUCKET } from "@/lib/config";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { toTaxAmounts } from "@/lib/tax/mapping";
import { normalizeRfc, sameRfc } from "@/lib/tax/rfc";
import type { TaxExtraction } from "@/lib/tax/schema";

// Vercel Hobby permite hasta 60 s; súbelo si el plan lo admite y los
// documentos son largos.
export const maxDuration = 60;

/**
 * Analiza el PDF ya almacenado y deja la declaración lista para revisión.
 *
 * Nada se marca como confirmado aquí: la extracción propone, el usuario
 * valida en la siguiente pantalla.
 */
export async function POST(
  _request: Request,
  context: RouteContext<"/api/declarations/[declarationId]/extract">,
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { declarationId } = await context.params;
  const supabase = await createClient();

  const { data: declaration } = await supabase
    .from("declarations")
    .select("id, company_id, file_path, file_name")
    .eq("id", declarationId)
    .maybeSingle();

  if (!declaration?.file_path) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: company } = await supabase
    .from("companies")
    .select("rfc")
    .eq("id", declaration.company_id)
    .maybeSingle();

  const { data: blob, error: downloadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(declaration.file_path);

  if (downloadError || !blob) {
    await markFailed(declarationId, "No pudimos leer el archivo almacenado.");
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }

  const result = await extractTaxDeclaration({
    file: new Uint8Array(await blob.arrayBuffer()),
    filename: declaration.file_name ?? "declaracion.pdf",
    mimeType: "application/pdf",
  });

  if (!result.ok) {
    console.error(`[extract] ${result.provider}: ${result.detail}`);
    await markFailed(
      declarationId,
      result.reason === "unsupported_document"
        ? "unsupported_document"
        : "extraction_failed",
    );
    return NextResponse.json(
      {
        error:
          result.reason === "unsupported_document"
            ? "unsupported_document"
            : "extraction_failed",
      },
      { status: 422 },
    );
  }

  const extraction: TaxExtraction = result.data;
  const extractedRfc = extraction.taxpayer.rfc
    ? normalizeRfc(extraction.taxpayer.rfc)
    : null;

  const { error: updateError } = await supabase
    .from("declarations")
    .update({
      document_type: extraction.document_type,
      declaration_type: extraction.declaration.declaration_type,
      period_type: extraction.period.period_type,
      year: extraction.period.year,
      month: extraction.period.month,
      filing_date: extraction.declaration.filing_date,
      operation_number: extraction.declaration.operation_number,
      rfc_extracted: extractedRfc,
      rfc_matches: extractedRfc ? sameRfc(extractedRfc, company?.rfc) : null,
      raw_extraction: result.raw as never,
      confidence: extraction.confidence as never,
      notes: extraction.notes,
      status: "review_required",
      error_message: null,
    })
    .eq("id", declarationId);

  if (updateError) {
    console.error("[extract] update", updateError.message);
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }

  // Los importes se guardan como propuesta; se confirman en la revisión.
  const amounts = toTaxAmounts(extraction);
  const { error: taxError } = await supabase
    .from("declaration_tax_data")
    .upsert(
      { declaration_id: declarationId, user_id: user.id, ...amounts },
      { onConflict: "declaration_id" },
    );

  if (taxError) {
    console.error("[extract] tax data", taxError.message);
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }

  return NextResponse.json({
    declarationId,
    companyId: declaration.company_id,
    reviewUrl: `/empresas/${declaration.company_id}/declaraciones/${declarationId}/revisar`,
  });

  async function markFailed(id: string, message: string) {
    await supabase
      .from("declarations")
      .update({ status: "failed", error_message: message })
      .eq("id", id);
  }
}
