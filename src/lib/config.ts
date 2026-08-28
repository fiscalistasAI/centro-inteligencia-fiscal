/**
 * Configuración de marca y límites del producto.
 *
 * El nombre vive aquí a propósito: cambiar el branding debe ser editar
 * este archivo y nada más.
 */

export const APP_NAME = "Centro de Inteligencia Fiscal";
export const APP_SHORT_NAME = "CIF";
export const APP_TAGLINE =
  "Convierte tus declaraciones fiscales en información útil sin capturar datos manualmente.";
export const APP_DESCRIPTION =
  "Sube una declaración fiscal, revisa lo que encontramos y obtén indicadores, gráficas y tendencias de tu situación fiscal.";

/** Bucket privado de Supabase Storage donde viven los PDF originales. */
export const STORAGE_BUCKET = "declarations";

/** Tamaño máximo de archivo aceptado en la carga. */
export const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 20);
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const ACCEPTED_MIME_TYPES = ["application/pdf"] as const;

/** Cookie que recuerda la última empresa consultada. */
export const ACTIVE_COMPANY_COOKIE = "cif_empresa_activa";

/** Toda la lógica de calendario se ancla explícitamente a esta zona. */
export const TIMEZONE = "America/Monterrey";

/** Umbrales de confianza para la revisión humana. */
export const CONFIDENCE_HIGH = 0.9;
export const CONFIDENCE_LOW = 0.7;
