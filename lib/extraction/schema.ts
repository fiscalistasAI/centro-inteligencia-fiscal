import { z } from "zod";

const nullableAmount = z.number().nonnegative().nullable();

export const taxDeclarationSchema = z.object({
  document_type: z.string(),
  taxpayer: z.object({ rfc: z.string(), name: z.string() }),
  period: z.object({ year: z.number().int().nullable(), month: z.number().int().min(1).max(12).nullable() }),
  declaration: z.object({
    declaration_type: z.string(),
    filing_date: z.string(),
    operation_number: z.string(),
  }),
  taxes: z.object({
    isr: z.object({ tax_due: nullableAmount, withholdings: nullableAmount, payments: nullableAmount }),
    iva: z.object({
      tax_charged: nullableAmount,
      creditable_tax: nullableAmount,
      withholdings: nullableAmount,
      balance_due: nullableAmount,
      balance_favor: nullableAmount,
    }),
  }),
  payment: z.object({ amount_due: nullableAmount, amount_paid: nullableAmount }),
  confidence: z.record(z.string(), z.number().min(0).max(1)),
});

export type TaxDeclarationExtraction = z.infer<typeof taxDeclarationSchema>;
