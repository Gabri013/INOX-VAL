// Engine: quote.engine.ts

export interface QuoteInput {
  tipo: "somenteTampo" | "somenteCuba" | "bancadaSemCuba" | "bancadaComCuba";
  tampo?: {
    comprimento: number;
    largura: number;
    espessura: number;
    materialId: string;
  };
  estrutura?: {
    quantidadePes: number;
    alturaPes: number;
    tipoTubo: string;
  };
  cuba?: {
    L: number;
    W: number;
    H: number;
    espessura: number;
    materialId: string;
  };
  pricingContext: {
    markup: number;
    scrapPercent: number;
    overheadPercent: number;
    laborCostPerHour: number;
    riskFactor: number;
    priceBookVersionId: string;
  };
}

import { calculateGeometry } from "./geometry.engine";
import { calculateMass } from "./mass.engine";
import { calculateMaterialCost } from "./materialCost.engine";
import { calculateProcessCost } from "./processCost.engine";
import { calculatePricing } from "./pricing.engine";

export async function calculateQuote(input: QuoteInput) {
  const geometry = calculateGeometry(input);
  const mass = calculateMass(geometry, {
    tampo: input.tampo ? { materialId: input.tampo.materialId } : undefined,
    cuba: input.cuba ? { materialId: input.cuba.materialId } : undefined,
    estrutura: input.estrutura ? { materialId: undefined } : undefined,
  });
  const materialCost = await calculateMaterialCost(mass, input);
  const processCost = calculateProcessCost(geometry, input.pricingContext);
  const pricing = calculatePricing(materialCost, processCost, input.pricingContext);
  return {
    geometry,
    mass,
    materialCost,
    processCost,
    pricing,
    totalCost: pricing.totalCost,
    finalPrice: pricing.finalPrice,
  };
}
