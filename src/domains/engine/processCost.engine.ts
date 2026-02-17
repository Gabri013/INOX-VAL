// Engine: processCost.engine.ts
import type { GeometryResult } from "./geometry.engine";
import type { QuoteInput } from "./quote.engine";

export interface ProcessCostResult {
  processCost: number;
  laborHours: number;
  breakdown: { label: string; minutes: number; }[];
}

export function calculateProcessCost(geometry: GeometryResult, context: QuoteInput["pricingContext"]): ProcessCostResult {
  // Exemplo: solda = perímetro da cuba + perímetro do tampo
  let soldaMin = 0;
  let corteMin = 0;
  let montagemMin = 0;
  if (geometry.tampoVolumeM3 > 0) {
    corteMin += 10;
    montagemMin += 15;
  }
  if (geometry.cubaVolumeM3 > 0) {
    soldaMin += 20;
    montagemMin += 10;
  }
  // Total de horas
  const totalMin = soldaMin + corteMin + montagemMin;
  const laborHours = totalMin / 60;
  const processCost = laborHours * context.laborCostPerHour;
  return {
    processCost,
    laborHours,
    breakdown: [
      { label: "Solda", minutes: soldaMin },
      { label: "Corte", minutes: corteMin },
      { label: "Montagem", minutes: montagemMin },
    ],
  };
}
