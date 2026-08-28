import "server-only";

import { anthropicProvider } from "@/lib/ai/providers/anthropic";
import { mockProvider } from "@/lib/ai/providers/mock";
import type { ExtractionInput, ExtractionProvider, ExtractionResult } from "@/lib/ai/types";

const PROVIDERS: Record<string, ExtractionProvider> = {
  anthropic: anthropicProvider,
  mock: mockProvider,
};

function resolveProvider(): ExtractionProvider {
  const configured = process.env.EXTRACTION_PROVIDER;
  if (configured && PROVIDERS[configured]) return PROVIDERS[configured];
  // Sin API key, el proveedor de desarrollo mantiene el flujo utilizable.
  return anthropicProvider.isConfigured() ? anthropicProvider : mockProvider;
}

/**
 * Punto de entrada único de la extracción.
 *
 * El resto de la aplicación —route handlers, server actions, componentes—
 * sólo conoce esta función y el tipo `TaxExtraction`. Cambiar de proveedor
 * de IA es cambiar `PROVIDERS` y la variable de entorno; nada más.
 */
export async function extractTaxDeclaration(
  input: ExtractionInput,
): Promise<ExtractionResult> {
  return resolveProvider().extract(input);
}

/** Para mostrar en ajustes o diagnósticos qué motor está activo. */
export function activeExtractionProvider(): { id: string; model: string } {
  const provider = resolveProvider();
  return { id: provider.id, model: provider.model };
}

export type { ExtractionInput, ExtractionResult };
