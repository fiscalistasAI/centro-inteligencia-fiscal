import type { ExtractionInput, ExtractionProvider, ExtractionResult } from "@/lib/ai/types";
import { emptyExtraction, type TaxExtraction } from "@/lib/tax/schema";
import { currentYearMonth } from "@/lib/tax/periods";

/**
 * Proveedor de desarrollo: no llama a ningún modelo. Devuelve una
 * declaración plausible para poder recorrer el flujo completo —incluida la
 * pantalla de validación con datos de baja confianza— sin gastar tokens
 * ni exponer documentos reales.
 *
 * Se activa con EXTRACTION_PROVIDER=mock.
 */
export const mockProvider: ExtractionProvider = {
  id: "mock",
  model: "mock-1",

  isConfigured() {
    return true;
  },

  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const { year, month } = currentYearMonth();
    const previousMonth = month === 1 ? 12 : month - 1;
    const previousYear = month === 1 ? year - 1 : year;

    // Variación determinística a partir del nombre del archivo, para que
    // subir dos PDFs distintos no produzca exactamente los mismos importes.
    const seed = [...input.filename].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const factor = 1 + ((seed % 40) - 20) / 100;
    const round = (value: number) => Math.round(value * factor * 100) / 100;

    const isrDue = round(184320);
    const isrWithholdings = round(12480);
    const ivaCharged = round(412800);
    const ivaCreditable = round(298450);
    const ivaDue = Math.round((ivaCharged - ivaCreditable) * 100) / 100;
    const amountDue = Math.round((isrDue - isrWithholdings + ivaDue) * 100) / 100;

    const data: TaxExtraction = {
      ...emptyExtraction(),
      document_type: "declaracion_provisional",
      taxpayer: {
        rfc: "DEM250101AB1",
        name: "DEMOSTRACIÓN FISCAL SA DE CV",
      },
      period: { year: previousYear, month: previousMonth, period_type: "mensual" },
      declaration: {
        declaration_type: "normal",
        filing_date: `${previousYear}-${String(previousMonth).padStart(2, "0")}-17`,
        operation_number: `MOCK${seed}`,
      },
      taxes: {
        isr: { tax_due: isrDue, withholdings: isrWithholdings, payments: null },
        iva: {
          tax_charged: ivaCharged,
          creditable_tax: ivaCreditable,
          withholdings: null,
          balance_due: ivaDue,
          balance_favor: null,
        },
      },
      payment: { amount_due: amountDue, amount_paid: amountDue },
      confidence: {
        ...emptyExtraction().confidence,
        rfc: 0.99,
        name: 0.97,
        document_type: 0.95,
        declaration_type: 0.93,
        year: 0.99,
        month: 0.98,
        filing_date: 0.91,
        operation_number: 0.62,
        isr_tax_due: 0.96,
        isr_withholdings: 0.58,
        iva_charged: 0.94,
        iva_creditable: 0.92,
        iva_due: 0.9,
        amount_due: 0.97,
        amount_paid: 0.97,
      },
      notes:
        "Datos generados por el proveedor de desarrollo. No provienen del documento cargado.",
    };

    return { ok: true, data, provider: this.id, model: this.model, raw: data };
  },
};
