import { taxDeclarationSchema, type TaxDeclarationExtraction } from "./schema";

export interface TaxDeclarationExtractor {
  extract(file: File): Promise<TaxDeclarationExtraction>;
}

class DemoTaxDeclarationExtractor implements TaxDeclarationExtractor {
  async extract(file: File) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return taxDeclarationSchema.parse({
      document_type: "Declaración provisional o definitiva de impuestos federales",
      taxpayer: { rfc: "CDC210315AB4", name: "Comercializadora del Centro, S.A. de C.V." },
      period: { year: 2026, month: 8 },
      declaration: { declaration_type: "Normal", filing_date: "17/09/2026", operation_number: "420083102" },
      taxes: {
        isr: { tax_due: 598400, withholdings: 22400, payments: 0 },
        iva: { tax_charged: 352100, creditable_tax: 211500, withholdings: 0, balance_due: 140600, balance_favor: null },
      },
      payment: { amount_due: 717000, amount_paid: 717000 },
      confidence: { taxpayer_rfc: 0.99, filing_date: 0.96, isr_tax_due: 0.94, iva_balance_due: 0.76, amount_paid: 0.98 },
      source_filename: file.name,
    });
  }
}

export async function extractTaxDeclaration(file: File): Promise<TaxDeclarationExtraction> {
  const extractor: TaxDeclarationExtractor = new DemoTaxDeclarationExtractor();
  return extractor.extract(file);
}
