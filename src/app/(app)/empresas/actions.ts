"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { STORAGE_BUCKET } from "@/lib/config";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { normalizeRfc, rfcError } from "@/lib/tax/rfc";
import { currentYearMonth, fromIndex, toIndex } from "@/lib/tax/periods";

export type CompanyFormState = {
  error: string | null;
  fieldErrors?: Partial<Record<"legal_name" | "rfc", string>>;
} | null;

export async function createCompany(
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const legalName = String(formData.get("legal_name") ?? "").trim();
  const rfc = normalizeRfc(String(formData.get("rfc") ?? ""));
  const tradeName = String(formData.get("trade_name") ?? "").trim();
  const taxRegime = String(formData.get("tax_regime") ?? "").trim();

  const fieldErrors: NonNullable<CompanyFormState>["fieldErrors"] = {};
  if (!legalName) fieldErrors.legal_name = "Captura la razón social.";
  const rfcMessage = rfcError(rfc);
  if (rfcMessage) fieldErrors.rfc = rfcMessage;

  if (Object.keys(fieldErrors).length > 0) {
    return { error: null, fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .insert({
      user_id: user.id,
      legal_name: legalName,
      rfc,
      trade_name: tradeName || null,
      tax_regime: taxRegime || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        error: null,
        fieldErrors: { rfc: "Ya registraste una empresa con este RFC." },
      };
    }
    return { error: "No pudimos guardar la empresa. Intenta nuevamente." };
  }

  revalidatePath("/empresas");
  redirect(`/empresas/${data.id}`);
}

export async function deleteCompany(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "");
  if (!companyId) return;

  const supabase = await createClient();

  // Los PDF viven en Storage y no se borran en cascada con la fila.
  const { data: files } = await supabase
    .from("declarations")
    .select("file_path")
    .eq("company_id", companyId);

  const paths = (files ?? [])
    .map((row) => row.file_path)
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  }

  await supabase.from("companies").delete().eq("id", companyId);

  revalidatePath("/empresas");
  revalidatePath("/", "layout");
  redirect("/empresas");
}

/**
 * Datos demo: una empresa marcada `is_demo` con 12 meses de declaraciones.
 * Los periodos son relativos al mes actual para que la demo no caduque.
 */
export async function seedDemoData() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      user_id: user.id,
      legal_name: "DEMOSTRACIÓN FISCAL SA DE CV",
      trade_name: "Demo Fiscal",
      rfc: "DEM250101AB1",
      tax_regime: "601 — General de Ley Personas Morales",
      is_demo: true,
    })
    .select("id")
    .single();

  if (companyError || !company) {
    // La empresa demo ya existe: lleva al usuario a ella.
    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .eq("rfc", "DEM250101AB1")
      .maybeSingle();
    if (existing) redirect(`/empresas/${existing.id}`);
    return;
  }

  const current = toIndex(currentYearMonth());
  const months = Array.from({ length: 12 }, (_, i) => fromIndex(current - 12 + i));

  for (const [i, period] of months.entries()) {
    // Tendencia creciente suave + estacionalidad + un mes atípico.
    const trend = 1 + i * 0.035;
    const season = 1 + Math.sin((period.month / 12) * Math.PI * 2) * 0.12;
    const spike = i === 8 ? 1.45 : 1;
    const scale = trend * season * spike;

    const round = (value: number) => Math.round(value * scale * 100) / 100;

    const isrTaxDue = round(162400);
    const isrWithholdings = round(9800);
    const ivaCharged = round(398500);
    const ivaCreditable = round(i % 5 === 3 ? 431000 : 286900);
    const ivaBalance = Math.round((ivaCharged - ivaCreditable) * 100) / 100;
    const ivaDue = ivaBalance > 0 ? ivaBalance : null;
    const ivaFavor = ivaBalance < 0 ? Math.abs(ivaBalance) : null;
    const amountDue =
      Math.round((isrTaxDue - isrWithholdings + (ivaDue ?? 0)) * 100) / 100;

    const filingMonth = period.month === 12 ? 1 : period.month + 1;
    const filingYear = period.month === 12 ? period.year + 1 : period.year;

    const { data: declaration } = await supabase
      .from("declarations")
      .insert({
        company_id: company.id,
        user_id: user.id,
        document_type: "declaracion_provisional",
        declaration_type: "normal",
        period_type: "mensual",
        year: period.year,
        month: period.month,
        filing_date: `${filingYear}-${String(filingMonth).padStart(2, "0")}-17`,
        operation_number: `DEMO-${period.year}${String(period.month).padStart(2, "0")}`,
        status: "completed",
        rfc_extracted: "DEM250101AB1",
        rfc_matches: true,
        is_demo: true,
        notes: "Declaración de demostración generada por la aplicación.",
      })
      .select("id")
      .single();

    if (!declaration) continue;

    await supabase.from("declaration_tax_data").insert({
      declaration_id: declaration.id,
      user_id: user.id,
      isr_tax_due: isrTaxDue,
      isr_withholdings: isrWithholdings,
      isr_payments: null,
      iva_charged: ivaCharged,
      iva_creditable: ivaCreditable,
      iva_withholdings: null,
      iva_due: ivaDue,
      iva_balance_favor: ivaFavor,
      amount_due: amountDue,
      amount_paid: amountDue,
    });
  }

  revalidatePath("/", "layout");
  redirect(`/empresas/${company.id}`);
}
