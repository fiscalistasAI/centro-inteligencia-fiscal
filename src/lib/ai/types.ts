import type { TaxExtraction } from "@/lib/tax/schema";

/** Entrada del extractor: el PDF y su nombre, nada más. */
export type ExtractionInput = {
  /** Contenido del PDF. */
  file: Uint8Array;
  /** Nombre original, sólo para trazabilidad y mensajes. */
  filename: string;
  mimeType: string;
};

export type ExtractionFailureReason =
  | "unsupported_document"
  | "provider_error"
  | "invalid_response"
  | "not_configured";

export type ExtractionResult =
  | {
      ok: true;
      data: TaxExtraction;
      /** Identificador del proveedor y modelo que produjo el resultado. */
      provider: string;
      model: string;
      /** Respuesta cruda del proveedor, se guarda como `raw_extraction`. */
      raw: unknown;
    }
  | {
      ok: false;
      reason: ExtractionFailureReason;
      /** Mensaje técnico para el log del servidor, nunca para el usuario. */
      detail: string;
      provider: string;
    };

/**
 * Contrato que debe cumplir cualquier proveedor de extracción.
 * Cambiar de proveedor es implementar esta interfaz y registrarla.
 */
export type ExtractionProvider = {
  readonly id: string;
  readonly model: string;
  isConfigured(): boolean;
  extract(input: ExtractionInput): Promise<ExtractionResult>;
};
