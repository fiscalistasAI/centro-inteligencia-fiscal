import type { TaxExtraction } from "@/lib/tax/schema";
import type { DeclarationRow, TaxDataRow } from "@/lib/supabase/database.types";

/** Columnas de importes, en el orden en que se muestran al usuario. */
export const TAX_FIELDS = [
  { key: "isr_tax_due", label: "ISR determinado", group: "isr" },
  { key: "isr_withholdings", label: "Retenciones de ISR", group: "isr" },
  { key: "isr_payments", label: "Pagos y acreditamientos", group: "isr" },
  { key: "iva_charged", label: "IVA trasladado", group: "iva" },
  { key: "iva_creditable", label: "IVA acreditable", group: "iva" },
  { key: "iva_withholdings", label: "IVA retenido", group: "iva" },
  { key: "iva_due", label: "IVA a cargo", group: "iva" },
  { key: "iva_balance_favor", label: "Saldo a favor de IVA", group: "iva" },
  { key: "amount_due", label: "Cantidad a cargo", group: "payment" },
  { key: "amount_paid", label: "Cantidad pagada", group: "payment" },
] as const;

export type TaxFieldKey = (typeof TAX_FIELDS)[number]["key"];

export type TaxAmounts = Record<TaxFieldKey, number | null>;

/** Aplana la extracción a las columnas de `declaration_tax_data`. */
export function toTaxAmounts(extraction: TaxExtraction): TaxAmounts {
  return {
    isr_tax_due: extraction.taxes.isr.tax_due,
    isr_withholdings: extraction.taxes.isr.withholdings,
    isr_payments: extraction.taxes.isr.payments,
    iva_charged: extraction.taxes.iva.tax_charged,
    iva_creditable: extraction.taxes.iva.creditable_tax,
    iva_withholdings: extraction.taxes.iva.withholdings,
    iva_due: extraction.taxes.iva.balance_due,
    iva_balance_favor: extraction.taxes.iva.balance_favor,
    amount_due: extraction.payment.amount_due,
    amount_paid: extraction.payment.amount_paid,
  };
}

export function taxAmountsFromRow(row: TaxDataRow | null): TaxAmounts {
  const empty = Object.fromEntries(TAX_FIELDS.map((f) => [f.key, null])) as TaxAmounts;
  if (!row) return empty;
  return {
    isr_tax_due: row.isr_tax_due,
    isr_withholdings: row.isr_withholdings,
    isr_payments: row.isr_payments,
    iva_charged: row.iva_charged,
    iva_creditable: row.iva_creditable,
    iva_withholdings: row.iva_withholdings,
    iva_due: row.iva_due,
    iva_balance_favor: row.iva_balance_favor,
    amount_due: row.amount_due,
    amount_paid: row.amount_paid,
  };
}

/** Datos de identificación de la declaración, editables en la revisión. */
export type DeclarationFields = {
  rfc: string;
  taxpayer_name: string;
  document_type: string;
  declaration_type: string;
  period_type: string;
  year: string;
  month: string;
  filing_date: string;
  operation_number: string;
};

export function toDeclarationFields(extraction: TaxExtraction): DeclarationFields {
  return {
    rfc: extraction.taxpayer.rfc ?? "",
    taxpayer_name: extraction.taxpayer.name ?? "",
    document_type: extraction.document_type ?? "",
    declaration_type: extraction.declaration.declaration_type ?? "",
    period_type: extraction.period.period_type ?? "",
    year: extraction.period.year?.toString() ?? "",
    month: extraction.period.month?.toString() ?? "",
    filing_date: extraction.declaration.filing_date ?? "",
    operation_number: extraction.declaration.operation_number ?? "",
  };
}

export function declarationFieldsFromRow(row: DeclarationRow): DeclarationFields {
  return {
    rfc: row.rfc_extracted ?? "",
    taxpayer_name: "",
    document_type: row.document_type ?? "",
    declaration_type: row.declaration_type ?? "",
    period_type: row.period_type ?? "",
    year: row.year?.toString() ?? "",
    month: row.month?.toString() ?? "",
    filing_date: row.filing_date ?? "",
    operation_number: row.operation_number ?? "",
  };
}

/**
 * Convierte lo que el usuario escribió en un importe.
 *
 * Campo vacío significa "el documento no traía este dato" y se guarda como
 * null; un "0" explícito se guarda como cero.
 */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$\s,]/g, "").trim();
  if (cleaned === "") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function amountToInput(value: number | null): string {
  return value === null ? "" : String(value);
}
