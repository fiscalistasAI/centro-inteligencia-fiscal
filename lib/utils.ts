import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export const compactMoney = new Intl.NumberFormat("es-MX", {
  notation: "compact",
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 1,
});
