import type { Company, Declaration, MonthlyTaxData } from "@/lib/types";

export const demoCompany: Company = {
  id: "demo-company",
  legalName: "Comercializadora del Centro, S.A. de C.V.",
  tradeName: "Comercializadora del Centro",
  rfc: "CDC210315AB4",
  taxRegime: "Régimen General de Ley Personas Morales",
  declarationCount: 12,
  latestPeriod: "Julio 2026",
};

const rows = [
  ["Ago", 2025, 410000, 215000, 122000, 89000, 0],
  ["Sep", 2025, 438000, 238000, 136000, 92000, 0],
  ["Oct", 2025, 462000, 251000, 144000, 97000, 0],
  ["Nov", 2025, 449000, 228000, 139000, 96000, 7000],
  ["Dic", 2025, 521000, 289000, 181000, 108000, 0],
  ["Ene", 2026, 396000, 205000, 128000, 77000, 0],
  ["Feb", 2026, 427000, 218000, 133000, 85000, 0],
  ["Mar", 2026, 455000, 244000, 149000, 95000, 0],
  ["Abr", 2026, 478000, 262000, 165000, 97000, 0],
  ["May", 2026, 503000, 276000, 172000, 104000, 0],
  ["Jun", 2026, 548000, 309000, 196000, 113000, 0],
  ["Jul", 2026, 576000, 326000, 205000, 121000, 0],
] as const;

export const monthlyTaxData: MonthlyTaxData[] = rows.map(
  ([label, year, isr, iva, charged, creditable, favor], index) => ({
    id: `${year}-${String(((index + 7) % 12) + 1).padStart(2, "0")}`,
    year,
    month: ((index + 7) % 12) + 1,
    monthLabel: `${label} ${String(year).slice(2)}`,
    isr,
    iva,
    ivaCharged: charged,
    ivaCreditable: creditable,
    ivaBalanceFavor: favor,
    totalPaid: isr + iva,
  }),
);

export const demoDeclarations: Declaration[] = monthlyTaxData
  .slice()
  .reverse()
  .map((row, index) => ({
    id: `dec-${index + 1}`,
    period: row.monthLabel,
    declarationType: index === 3 ? "Complementaria" : "Normal",
    filingDate: `${String(17 + (index % 4)).padStart(2, "0")}/${String(row.month).padStart(2, "0")}/${row.year}`,
    operationNumber: `4200${82910 + index}`,
    isr: row.isr,
    iva: row.iva,
    totalPaid: row.totalPaid,
    status: index === 2 ? "review_required" : "completed",
    filename: `declaracion-${row.year}-${String(row.month).padStart(2, "0")}.pdf`,
  }));

export const demoCompanies: Company[] = [
  demoCompany,
  {
    id: "demo-company-2",
    legalName: "Servicios Bajío Integral, S. de R.L. de C.V.",
    tradeName: "Servicios Bajío",
    rfc: "SBI190822KQ7",
    taxRegime: "Régimen General de Ley Personas Morales",
    declarationCount: 8,
    latestPeriod: "Junio 2026",
  },
];
