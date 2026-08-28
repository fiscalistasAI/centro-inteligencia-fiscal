import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT } from "@/lib/ai/prompt";
import type { ExtractionInput, ExtractionProvider, ExtractionResult } from "@/lib/ai/types";
import { extractionJsonSchema, extractionSchema } from "@/lib/tax/schema";

const DEFAULT_MODEL = "claude-opus-5";
const EFFORT = "medium" as const;
const MAX_TOKENS = 16000;

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!cachedClient) cachedClient = new Anthropic();
  return cachedClient;
}

/**
 * Extracción con un modelo multimodal de Anthropic: el PDF viaja como
 * bloque `document` y la respuesta se restringe al JSON Schema del dominio.
 */
export const anthropicProvider: ExtractionProvider = {
  id: "anthropic",
  model: process.env.EXTRACTION_MODEL ?? DEFAULT_MODEL,

  isConfigured() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },

  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        reason: "not_configured",
        detail: "Falta ANTHROPIC_API_KEY en el entorno.",
        provider: this.id,
      };
    }

    const base64 = Buffer.from(input.file).toString("base64");

    let response: Anthropic.Message;
    try {
      response = await getClient().messages.create({
        model: this.model,
        max_tokens: MAX_TOKENS,
        system: EXTRACTION_SYSTEM_PROMPT,
        output_config: {
          effort: EFFORT,
          format: { type: "json_schema", schema: extractionJsonSchema },
        },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64,
                },
              },
              { type: "text", text: EXTRACTION_USER_PROMPT },
            ],
          },
        ],
      });
    } catch (error) {
      return {
        ok: false,
        reason: "provider_error",
        detail: error instanceof Error ? error.message : String(error),
        provider: this.id,
      };
    }

    if (response.stop_reason === "refusal") {
      return {
        ok: false,
        reason: "unsupported_document",
        detail: `El modelo declinó procesar el documento (${
          response.stop_details?.category ?? "sin categoría"
        }).`,
        provider: this.id,
      };
    }

    if (response.stop_reason === "max_tokens") {
      return {
        ok: false,
        reason: "invalid_response",
        detail: "La respuesta del modelo se truncó antes de completar el JSON.",
        provider: this.id,
      };
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!text) {
      return {
        ok: false,
        reason: "invalid_response",
        detail: "El modelo no devolvió contenido de texto.",
        provider: this.id,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        ok: false,
        reason: "invalid_response",
        detail: "La respuesta del modelo no es JSON válido.",
        provider: this.id,
      };
    }

    const validated = extractionSchema.safeParse(parsed);
    if (!validated.success) {
      return {
        ok: false,
        reason: "invalid_response",
        detail: `La respuesta no cumple el esquema: ${validated.error.message}`,
        provider: this.id,
      };
    }

    return {
      ok: true,
      data: validated.data,
      provider: this.id,
      model: this.model,
      raw: parsed,
    };
  },
};
