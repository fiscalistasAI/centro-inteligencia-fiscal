import "server-only";

import { STORAGE_BUCKET } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { DeclarationRow, TaxDataRow } from "@/lib/supabase/database.types";

export type DeclarationWithTax = DeclarationRow & {
  tax: TaxDataRow | null;
};

const SELECT = "*, declaration_tax_data(*)";

type RawJoin = DeclarationRow & {
  declaration_tax_data: TaxDataRow | TaxDataRow[] | null;
};

function flatten(row: RawJoin): DeclarationWithTax {
  const { declaration_tax_data, ...declaration } = row;
  const tax = Array.isArray(declaration_tax_data)
    ? (declaration_tax_data[0] ?? null)
    : declaration_tax_data;
  return { ...declaration, tax };
}

/** Historial completo de una empresa, del periodo más reciente al más antiguo. */
export async function listDeclarations(companyId: string): Promise<DeclarationWithTax[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("declarations")
    .select(SELECT)
    .eq("company_id", companyId)
    .order("year", { ascending: false, nullsFirst: false })
    .order("month", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as RawJoin[]).map(flatten);
}

export async function getDeclaration(
  declarationId: string,
): Promise<DeclarationWithTax | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("declarations")
    .select(SELECT)
    .eq("id", declarationId)
    .maybeSingle();

  if (!data) return null;
  return flatten(data as unknown as RawJoin);
}

/** URL temporal para ver o descargar el PDF original de un bucket privado. */
export async function createSignedUrl(
  filePath: string,
  expiresInSeconds = 60 * 10,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);
  return data?.signedUrl ?? null;
}
