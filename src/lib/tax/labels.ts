import { CONFIDENCE_HIGH, CONFIDENCE_LOW } from "@/lib/config";
import type { DeclarationStatus } from "@/lib/supabase/database.types";

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  declaracion_provisional: "Declaración provisional",
  declaracion_anual: "Declaración anual",
  declaracion_informativa: "Declaración informativa",
  acuse_recibo: "Acuse de recibo",
  otro: "Otro documento",
};

export const DECLARATION_TYPE_LABELS: Record<string, string> = {
  normal: "Normal",
  complementaria: "Complementaria",
  extemporanea: "Extemporánea",
  correccion_fiscal: "Corrección fiscal",
  otro: "Otro",
};

export const PERIOD_TYPE_LABELS: Record<string, string> = {
  mensual: "Mensual",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
  otro: "Otro",
};

export function labelFor(map: Record<string, string>, value: string | null): string {
  if (!value) return "—";
  return map[value] ?? value;
}

export const STATUS_LABELS: Record<DeclarationStatus, string> = {
  processing: "Procesando",
  review_required: "Pendiente de revisión",
  completed: "Procesada",
  failed: "Error",
};

export const STATUS_VARIANTS: Record<
  DeclarationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  processing: "outline",
  review_required: "secondary",
  completed: "default",
  failed: "destructive",
};

/** Etapas visibles del procesamiento, en orden. */
export const PROCESSING_STAGES = [
  { id: "uploading", label: "Subiendo declaración…" },
  { id: "processing", label: "Analizando documento…" },
  { id: "extracting", label: "Identificando información fiscal…" },
  { id: "review_required", label: "Información lista para revisión." },
  { id: "completed", label: "Declaración procesada correctamente." },
  { id: "failed", label: "No pudimos procesar esta declaración." },
] as const;

export type ProcessingStage = (typeof PROCESSING_STAGES)[number]["id"];

export function stageLabel(stage: ProcessingStage): string {
  return PROCESSING_STAGES.find((s) => s.id === stage)!.label;
}

export type ConfidenceLevel = "high" | "review" | "low" | "unknown";

/**
 * Traducción interna del score. Al usuario nunca se le muestra el
 * porcentaje, sólo si el dato conviene revisarse.
 */
export function confidenceLevel(score: number | null | undefined): ConfidenceLevel {
  if (score === null || score === undefined) return "unknown";
  if (score >= CONFIDENCE_HIGH) return "high";
  if (score >= CONFIDENCE_LOW) return "review";
  return "low";
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: "Alta confianza",
  review: "Conviene revisar",
  low: "Baja confianza",
  unknown: "Sin dato",
};

/** Mensajes de error de cara al usuario. Sin jerga ni stack traces. */
export const USER_ERRORS = {
  invalid_pdf: "No pudimos leer este archivo. Verifica que sea un PDF válido.",
  unsupported_document:
    "No pudimos identificar este documento como una declaración compatible.",
  extraction_failed: "No pudimos extraer la información. Intenta nuevamente.",
  rfc_mismatch: "El RFC de esta declaración no coincide con la empresa seleccionada.",
  duplicate: "Parece que esta declaración ya fue registrada.",
  too_large: "El archivo supera el tamaño máximo permitido.",
  generic: "Ocurrió un problema. Intenta nuevamente en un momento.",
} as const;
