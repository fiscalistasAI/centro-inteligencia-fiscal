"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { STORAGE_BUCKET } from "@/lib/config";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { TAX_FIELDS, parseAmount } from "@/lib/tax/mapping";
import { normalizeRfc, sameRfc } from "@/lib/tax/rfc";

export type ReviewState = {
  error: string | null;
  /** Se encontró una declaración equivalente; el usuario debe confirmar. */
  duplicateOf?: { id: string; label: string } | null;
} | null;

function optionalInt(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalText(raw: FormDataEntryValue | null): string | null {
  const value = String(raw ?? "").trim();
  return value === "" ? null : value;
}

/**
 * Confirma la revisión humana: escribe los datos definitivos y saca la
 * declaración del estado "pendiente de revisión".
 */
export async function confirmDeclaration(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const declarationId = String(formData.get("declaration_id") ?? "");
  const companyId = String(formData.get("company_id") ?? "");
  if (!declarationId || !companyId) {
    return { error: "Falta información de la declaración." };
  }

  const supabase = await createClient();

  const year = optionalInt(formData.get("year"));
  const month = optionalInt(formData.get("month"));
  const declarationType = optionalText(formData.get("declaration_type"));
  const operationNumber = optionalText(formData.get("operation_number"));
  const rfcRaw = optionalText(formData.get("rfc"));
  const rfc = rfcRaw ? normalizeRfc(rfcRaw) : null;

  if (year !== null && (year < 1990 || year > 2100)) {
    return { error: "El ejercicio no parece válido." };
  }
  if (month !== null && (month < 1 || month > 12)) {
    return { error: "El periodo debe ser un mes entre 1 y 12." };
  }

  // Prevención de duplicados: mismo periodo, tipo y número de operación.
  if (formData.get("acknowledge_duplicate") !== "1") {
    let query = supabase
      .from("declarations")
      .select("id, year, month")
      .eq("company_id", companyId)
      .eq("status", "completed")
      .neq("id", declarationId)
      .limit(1);

    if (operationNumber) {
      query = query.eq("operation_number", operationNumber);
    } else {
      query = query
        .eq("year", year as number)
        .eq("month", month as number)
        .eq("declaration_type", declarationType as string);
    }

    const { data: duplicate } = await query.maybeSingle();

    if (duplicate) {
      return {
        error: null,
        duplicateOf: {
          id: duplicate.id,
          label: operationNumber
            ? `número de operación ${operationNumber}`
            : `el mismo periodo y tipo de declaración`,
        },
      };
    }
  }

  const { data: company } = await supabase
    .from("companies")
    .select("rfc")
    .eq("id", companyId)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from("declarations")
    .update({
      document_type: optionalText(formData.get("document_type")),
      declaration_type: declarationType,
      period_type: optionalText(formData.get("period_type")),
      year,
      month,
      filing_date: optionalText(formData.get("filing_date")),
      operation_number: operationNumber,
      rfc_extracted: rfc,
      rfc_matches: rfc ? sameRfc(rfc, company?.rfc) : null,
      status: "completed",
      error_message: null,
    })
    .eq("id", declarationId);

  if (updateError) {
    if (updateError.code === "23505") {
      return {
        error:
          "Ya existe una declaración registrada con ese número de operación para este periodo.",
      };
    }
    return { error: "No pudimos guardar los datos. Intenta nuevamente." };
  }

  const amounts = Object.fromEntries(
    TAX_FIELDS.map((field) => [field.key, parseAmount(String(formData.get(field.key) ?? ""))]),
  );

  const { error: taxError } = await supabase
    .from("declaration_tax_data")
    .upsert(
      { declaration_id: declarationId, user_id: user.id, ...amounts },
      { onConflict: "declaration_id" },
    );

  if (taxError) {
    return { error: "No pudimos guardar los importes. Intenta nuevamente." };
  }

  revalidatePath(`/empresas/${companyId}`, "layout");
  redirect(`/empresas/${companyId}`);
}

export async function deleteDeclaration(formData: FormData) {
  const declarationId = String(formData.get("declaration_id") ?? "");
  const companyId = String(formData.get("company_id") ?? "");
  if (!declarationId || !companyId) return;

  const supabase = await createClient();

  const { data: declaration } = await supabase
    .from("declarations")
    .select("file_path")
    .eq("id", declarationId)
    .maybeSingle();

  if (declaration?.file_path) {
    await supabase.storage.from(STORAGE_BUCKET).remove([declaration.file_path]);
  }

  await supabase.from("declarations").delete().eq("id", declarationId);

  revalidatePath(`/empresas/${companyId}`, "layout");
  redirect(`/empresas/${companyId}/declaraciones`);
}

/** Descarta una carga que quedó a medias sin confirmar. */
export async function cancelReview(formData: FormData) {
  await deleteDeclaration(formData);
}
