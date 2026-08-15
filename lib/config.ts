export const appConfig = {
  name: "Centro de Inteligencia Fiscal",
  shortName: "CIF",
  description: "Convierte declaraciones fiscales en información útil.",
  maxPdfSizeMb: Number(process.env.MAX_PDF_SIZE_MB ?? 10),
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
  storageBucket: "tax-declarations",
} as const;
