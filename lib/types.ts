export type DeclarationStatus = "completed" | "review_required" | "failed";

export type MonthlyTaxData = {
  id: string;
  year: number;
  month: number;
  monthLabel: string;
  isr: number;
  iva: number;
  ivaCharged: number;
  ivaCreditable: number;
  ivaBalanceFavor: number;
  totalPaid: number;
};

export type Declaration = {
  id: string;
  period: string;
  declarationType: string;
  filingDate: string;
  operationNumber: string;
  isr: number | null;
  iva: number | null;
  totalPaid: number | null;
  status: DeclarationStatus;
  filename: string;
};

export type Company = {
  id: string;
  legalName: string;
  tradeName?: string;
  rfc: string;
  taxRegime?: string;
  declarationCount: number;
  latestPeriod: string | null;
};
