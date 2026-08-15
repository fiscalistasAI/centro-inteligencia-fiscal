import { describe, expect, it } from "vitest";
import { monthlyTaxData } from "./demo-data";
import { generateInsights } from "./insights";

describe("generateInsights", () => {
  it("returns no insights without comparison data", () => { expect(generateInsights(monthlyTaxData.slice(0, 1))).toEqual([]); });
  it("identifies the highest ISR month", () => { expect(generateInsights(monthlyTaxData).some((item) => item.description.includes("Jul 26"))).toBe(true); });
  it("does not present legal recommendations", () => { expect(JSON.stringify(generateInsights(monthlyTaxData))).not.toMatch(/recomendación|debes|obligación/i); });
});
