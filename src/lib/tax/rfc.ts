/**
 * Normalización y validación básica de RFC (personas físicas y morales).
 *
 * No pretende validar el dígito verificador — el MVP sólo necesita
 * descartar capturas evidentemente incorrectas y comparar contra el RFC
 * extraído del documento.
 */

/** Mayúsculas, sin espacios ni separadores. */
export function normalizeRfc(raw: string): string {
  return raw
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[\s.\-_]/g, "")
    .trim();
}

// 3 letras (moral) o 4 (física) + AAMMDD + homoclave de 3.
const RFC_PATTERN =
  /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z\d]{3})$/;

export type RfcKind = "moral" | "fisica";

export function isValidRfc(raw: string): boolean {
  return RFC_PATTERN.test(normalizeRfc(raw));
}

export function rfcKind(raw: string): RfcKind | null {
  const rfc = normalizeRfc(raw);
  if (!RFC_PATTERN.test(rfc)) return null;
  return rfc.length === 12 ? "moral" : "fisica";
}

/** Mensaje de error listo para mostrar, o `null` si el RFC es válido. */
export function rfcError(raw: string): string | null {
  const rfc = normalizeRfc(raw);
  if (!rfc) return "Captura el RFC de la empresa.";
  if (rfc.length < 12 || rfc.length > 13) {
    return "El RFC debe tener 12 caracteres (persona moral) o 13 (persona física).";
  }
  if (!RFC_PATTERN.test(rfc)) {
    return "El formato del RFC no es válido. Revisa las letras, la fecha y la homoclave.";
  }
  return null;
}

/** Compara dos RFC ignorando formato. */
export function sameRfc(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return normalizeRfc(a) === normalizeRfc(b);
}
