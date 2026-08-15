import Link from "next/link";
import { ArrowRight, Building2, FileCheck2 } from "lucide-react";
import type { Company } from "@/lib/types";

export function CompanyCard({ company }: { company: Company }) {
  return <Link href="/" className="panel group flex min-h-52 flex-col p-5 transition-colors hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-[10px] bg-primary/10 text-primary"><Building2 className="size-5" /></span><ArrowRight className="size-5 text-subtle transition-transform group-hover:translate-x-1 group-hover:text-primary" /></div><h2 className="mt-5 text-lg font-semibold leading-snug">{company.legalName}</h2><p className="mt-1 text-sm text-muted">RFC: {company.rfc}</p><div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm"><span className="flex items-center gap-2 text-muted"><FileCheck2 className="size-4" />{company.declarationCount} declaraciones</span><span className="font-medium">{company.latestPeriod}</span></div></Link>;
}
