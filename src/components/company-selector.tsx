"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CompanyOption = {
  id: string;
  legal_name: string;
  rfc: string;
  is_demo?: boolean;
};

/**
 * Cambia de empresa conservando la sección en la que está el usuario:
 * si viene del historial, aterriza en el historial de la otra empresa.
 */
export function CompanySelector({
  companies,
  activeCompanyId,
  section = "",
  className,
}: {
  companies: CompanyOption[];
  activeCompanyId: string | null;
  section?: string;
  className?: string;
}) {
  const router = useRouter();

  if (companies.length === 0) return null;

  return (
    <Select
      value={activeCompanyId ?? undefined}
      onValueChange={(id) => router.push(`/empresas/${id}${section}`)}
    >
      <SelectTrigger className={className} aria-label="Empresa activa">
        <SelectValue placeholder="Selecciona una empresa" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            <span className="flex min-w-0 flex-col items-start">
              <span className="truncate">{company.legal_name}</span>
              <span className="text-muted-foreground font-mono text-[0.6875rem]">
                {company.rfc}
                {company.is_demo ? " · demo" : ""}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
