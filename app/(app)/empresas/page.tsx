import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyCard } from "@/components/company-card";
import { demoCompanies } from "@/lib/demo-data";

export default function CompaniesPage() {
  return <div className="flex flex-col gap-6"><div className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-[-0.02em] sm:text-[2rem]">Empresas</h1><p className="mt-1 text-sm text-muted sm:text-base">Mantén separada la información fiscal de cada contribuyente.</p></div><Button><Plus className="size-4" />Agregar empresa</Button></div><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{demoCompanies.map((company)=><CompanyCard company={company} key={company.id} />)}</section></div>;
}
