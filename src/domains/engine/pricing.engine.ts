// Engine: pricing.engine.ts
import type { MaterialCostResult } from "./materialCost.engine";
import type { ProcessCostResult } from "./processCost.engine";
import type { QuoteInput } from "./quote.engine";

export interface PricingResult {
  totalCost: number;
  finalPrice: number;
  margin: number;
  breakdown: {
    baseCost: number;
    scrapCost: number;
    overheadCost: number;
    riskCost: number;
    totalCost: number;
    finalPrice: number;
  };
}

export function calculatePricing(materialCost: MaterialCostResult, processCost: ProcessCostResult, context: QuoteInput["pricingContext"]): PricingResult {
  const baseCost = materialCost.materialCost + processCost.processCost;
  const scrapCost = baseCost * (context.scrapPercent ?? 0);
  const overheadCost = baseCost * (context.overheadPercent ?? 0);
  const riskCost = baseCost * (context.riskFactor ?? 0);
  const totalCost = baseCost + scrapCost + overheadCost + riskCost;
  const finalPrice = totalCost * (context.markup ?? 1);
  const margin = finalPrice - totalCost;
  return {
    totalCost,
    finalPrice,
    margin,
    breakdown: {
      baseCost,
      scrapCost,
      overheadCost,
      riskCost,
      totalCost,
      finalPrice,
    },
  };
}
