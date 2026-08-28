import { redirect } from "next/navigation";

import { resolveActiveCompanyId } from "@/lib/data/companies";

/** Atajo: lleva al dashboard de la última empresa consultada. */
export default async function DashboardRedirect() {
  const companyId = await resolveActiveCompanyId();
  redirect(companyId ? `/empresas/${companyId}` : "/empresas");
}
