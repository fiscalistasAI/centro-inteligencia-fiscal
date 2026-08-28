import { redirect } from "next/navigation";

import { resolveActiveCompanyId } from "@/lib/data/companies";

export default async function DeclarationsRedirect() {
  const companyId = await resolveActiveCompanyId();
  redirect(companyId ? `/empresas/${companyId}/declaraciones` : "/empresas");
}
