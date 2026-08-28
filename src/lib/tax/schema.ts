/**
 * Contrato de la extracción.
 *
 * Este archivo es la frontera entre la IA y el resto de la aplicación:
 * cualquier proveedor debe devolver exactamente esta forma, validada con Zod.
 * La UI no conoce al proveedor, sólo este tipo.
 *
 * Regla dura del producto: un campo que no aparece en el documento regresa
 * `null`. Nunca cero. Cero es un dato fiscal; null es ausencia de dato.
 */

import { z } from "zod";

export const DOCUMENT_TYPES = [
  "declaracion_provisional",
  "declaracion_anual",
  "declaracion_informativa",
  "acuse_recibo",
  "otro",
] as const;

export const DECLARATION_TYPES = [
  "normal",
  "complementaria",
  "extemporanea",
  "correccion_fiscal",
  "otro",
] as const;

export const PERIOD_TYPES = [
  "mensual",
  "bimestral",
  "trimestral",
  "semestral",
  "anual",
  "otro",
] as const;

/** Claves con las que el modelo reporta su nivel de certeza por dato. */
export const CONFIDENCE_FIELDS = [
  "rfc",
  "name",
  "document_type",
  "declaration_type",
  "year",
  "month",
  "filing_date",
  "operation_number",
  "isr_tax_due",
  "isr_withholdings",
  "isr_payments",
  "iva_charged",
  "iva_creditable",
  "iva_withholdings",
  "iva_due",
  "iva_balance_favor",
  "amount_due",
  "amount_paid",
] as const;

export type ConfidenceField = (typeof CONFIDENCE_FIELDS)[number];

const nullableNumber = z.number().finite().nullable();
const nullableConfidence = z.number().min(0).max(1).nullable();

const confidenceShape = Object.fromEntries(
  CONFIDENCE_FIELDS.map((field) => [field, nullableConfidence]),
) as Record<ConfidenceField, typeof nullableConfidence>;

export const extractionSchema = z.object({
  document_type: z.enum(DOCUMENT_TYPES).nullable(),
  taxpayer: z.object({
    rfc: z.string().nullable(),
    name: z.string().nullable(),
  }),
  period: z.object({
    year: z.number().int().min(1990).max(2100).nullable(),
    month: z.number().int().min(1).max(12).nullable(),
    period_type: z.enum(PERIOD_TYPES).nullable(),
  }),
  declaration: z.object({
    declaration_type: z.enum(DECLARATION_TYPES).nullable(),
    filing_date: z.string().nullable(),
    operation_number: z.string().nullable(),
  }),
  taxes: z.object({
    isr: z.object({
      tax_due: nullableNumber,
      withholdings: nullableNumber,
      payments: nullableNumber,
    }),
    iva: z.object({
      tax_charged: nullableNumber,
      creditable_tax: nullableNumber,
      withholdings: nullableNumber,
      balance_due: nullableNumber,
      balance_favor: nullableNumber,
    }),
  }),
  payment: z.object({
    amount_due: nullableNumber,
    amount_paid: nullableNumber,
  }),
  confidence: z.object(confidenceShape),
  notes: z.string().nullable(),
});

export type TaxExtraction = z.infer<typeof extractionSchema>;

/**
 * JSON Schema equivalente, en la forma que aceptan las salidas estructuradas
 * del modelo: `additionalProperties: false` en todos los objetos, sin
 * restricciones numéricas y con nulos expresados mediante `anyOf`.
 */
function nullable(schema: Record<string, unknown>) {
  return { anyOf: [schema, { type: "null" }] };
}

function objectOf(properties: Record<string, unknown>) {
  return {
    type: "object",
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}

const numberOrNull = nullable({ type: "number" });

export const extractionJsonSchema = objectOf({
  document_type: nullable({ type: "string", enum: [...DOCUMENT_TYPES] }),
  taxpayer: objectOf({
    rfc: nullable({ type: "string" }),
    name: nullable({ type: "string" }),
  }),
  period: objectOf({
    year: nullable({ type: "integer" }),
    month: nullable({ type: "integer" }),
    period_type: nullable({ type: "string", enum: [...PERIOD_TYPES] }),
  }),
  declaration: objectOf({
    declaration_type: nullable({ type: "string", enum: [...DECLARATION_TYPES] }),
    filing_date: nullable({ type: "string", format: "date" }),
    operation_number: nullable({ type: "string" }),
  }),
  taxes: objectOf({
    isr: objectOf({
      tax_due: numberOrNull,
      withholdings: numberOrNull,
      payments: numberOrNull,
    }),
    iva: objectOf({
      tax_charged: numberOrNull,
      creditable_tax: numberOrNull,
      withholdings: numberOrNull,
      balance_due: numberOrNull,
      balance_favor: numberOrNull,
    }),
  }),
  payment: objectOf({
    amount_due: numberOrNull,
    amount_paid: numberOrNull,
  }),
  confidence: objectOf(
    Object.fromEntries(CONFIDENCE_FIELDS.map((f) => [f, numberOrNull])),
  ),
  notes: nullable({ type: "string" }),
});

/** Extracción vacía: el punto de partida cuando el modelo no encuentra nada. */
export function emptyExtraction(): TaxExtraction {
  return {
    document_type: null,
    taxpayer: { rfc: null, name: null },
    period: { year: null, month: null, period_type: null },
    declaration: { declaration_type: null, filing_date: null, operation_number: null },
    taxes: {
      isr: { tax_due: null, withholdings: null, payments: null },
      iva: {
        tax_charged: null,
        creditable_tax: null,
        withholdings: null,
        balance_due: null,
        balance_favor: null,
      },
    },
    payment: { amount_due: null, amount_paid: null },
    confidence: Object.fromEntries(
      CONFIDENCE_FIELDS.map((f) => [f, null]),
    ) as TaxExtraction["confidence"],
    notes: null,
  };
}
