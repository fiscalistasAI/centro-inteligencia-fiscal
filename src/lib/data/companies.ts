import "server-only";

import { cookies } from "next/headers";

import { ACTIVE_COMPANY_COOKIE } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { CompanyRow } from "@/lib/supabase/database.types";

export type CompanySummary = CompanyRow & {
  declarationsCount: number;
  lastPeriod: { year: number; month: number | null } | null;
};

export async function listCompanies(): Promise<CompanySummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*, declarations(year, month, status)")
    .order("legal_name", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const { declarations, ...company } = row as CompanyRow & {
      declarations: { year: number | null; month: number | null; status: string }[];
    };

    const processed = declarations.filter((d) => d.status === "completed");
    const lastPeriod = processed
      .filter((d): d is { year: number; month: number | null; status: string } =>
        d.year !== null,
      )
      .sort((a, b) => b.year * 12 + (b.month ?? 0) - (a.year * 12 + (a.month ?? 0)))
      .at(0);

    return {
      ...company,
      declarationsCount: processed.length,
      lastPeriod: lastPeriod ? { year: lastPeriod.year, month: lastPeriod.month } : null,
    };
  });
}

/** Empresas para el selector: sólo lo que la barra lateral necesita. */
export async function listCompanyOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("id, legal_name, rfc, is_demo")
    .order("legal_name", { ascending: true });
  return data ?? [];
}

export async function getCompany(companyId: string): Promise<CompanyRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();
  return data ?? null;
}

/**
 * Empresa a la que deben apuntar las rutas que no traen id: la última
 * consultada si sigue existiendo, si no la primera disponible.
 */
export async function resolveActiveCompanyId(): Promise<string | null> {
  const options = await listCompanyOptions();
  if (options.length === 0) return null;

  const cookieStore = await cookies();
  const remembered = cookieStore.get(ACTIVE_COMPANY_COOKIE)?.value;

  if (remembered && options.some((company) => company.id === remembered)) {
    return remembered;
  }
  return options[0].id;
}
