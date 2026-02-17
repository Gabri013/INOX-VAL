// Engine: materialCost.engine.ts
import type { MassResult } from "./mass.engine";
import type { QuoteInput } from "./quote.engine";

export interface MaterialCostBreakdown {
  label: string;
  materialId: string;
  kg: number;
  unitPrice: number;
  subtotal: number;
}

export interface MaterialCostResult {
  materialCost: number;
  breakdown: MaterialCostBreakdown[];
}

// getBestPrice deve ser importado do service real
// Aqui é um mock para manter engine pura
export async function getBestPrice(materialId: string): Promise<number | undefined> {
  // Substitua por fetch real do pricebook
  if (materialId === "INOX_316") return 60;
  return 45;
}

export async function calculateMaterialCost(mass: MassResult, input: QuoteInput): Promise<MaterialCostResult> {
  const breakdown: MaterialCostBreakdown[] = [];
  let total = 0;
  // Tampo
  if (mass.tampoKg > 0 && input.tampo) {
    const unitPrice = await getBestPrice(input.tampo.materialId) ?? 45;
    breakdown.push({ label: "Tampo", materialId: input.tampo.materialId, kg: mass.tampoKg, unitPrice, subtotal: mass.tampoKg * unitPrice });
    total += mass.tampoKg * unitPrice;
  }
  // Cuba
  if (mass.cubaKg > 0 && input.cuba) {
    const unitPrice = await getBestPrice(input.cuba.materialId) ?? 45;
    breakdown.push({ label: "Cuba", materialId: input.cuba.materialId, kg: mass.cubaKg, unitPrice, subtotal: mass.cubaKg * unitPrice });
    total += mass.cubaKg * unitPrice;
  }
  // Estrutura
  if (mass.estruturaKg > 0 && input.estrutura) {
    const unitPrice = await getBestPrice("TUBO_INOX") ?? 45;
    breakdown.push({ label: "Estrutura", materialId: "TUBO_INOX", kg: mass.estruturaKg, unitPrice, subtotal: mass.estruturaKg * unitPrice });
    total += mass.estruturaKg * unitPrice;
  }
  return { materialCost: total, breakdown };
}
