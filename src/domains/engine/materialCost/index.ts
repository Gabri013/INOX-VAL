// ============================================================
// MATERIAL COST ENGINE - Calculate material costs from nesting results
// ============================================================

import { Material, PriceRecord, EngineResult, ValidationWarning, NestingResult } from '../types';
import { getDensity } from '../mass';

export interface MaterialCostInput {
  materials: Map<string, Material>;
  nestingResult: NestingResult;
  quoteDate: string;
}

export interface MaterialCostBreakdown {
  materialKey: string;
  sheetsUsed: number;
  totalKg: number;
  usedKg: number;
  wasteKg: number;
  pricePerKg: number;
  pricePerSheet?: number;
  materialCost: number;
  wasteCost: number;
  totalCost: number;
}

export interface MaterialCostResult {
  breakdown: MaterialCostBreakdown[];
  totalMaterialCost: number;
  totalUsedCost: number;
  totalWasteCost: number;
  warnings: ValidationWarning[];
}

/**
 * Calcula custo de materiais baseado no resultado do nesting
 */
export function calculateMaterialCost(
  input: MaterialCostInput
): EngineResult<MaterialCostResult> {
  const errors: { code: string; message: string; severity: 'error'; field?: string }[] = [];
  const warnings: ValidationWarning[] = [];
  const breakdown: MaterialCostBreakdown[] = [];
  
  let totalMaterialCost = 0;
  let totalUsedCost = 0;
  let totalWasteCost = 0;
  
  // Agrupar chapas por materialKey
  const sheetsByMaterial = new Map<string, typeof input.nestingResult.sheets[0][]>();
  
  for (const sheet of input.nestingResult.sheets) {
    const existing = sheetsByMaterial.get(sheet.materialKey) || [];
    existing.push(sheet);
    sheetsByMaterial.set(sheet.materialKey, existing);
  }
  
  // Calcular custo por material
  for (const [materialKey, sheets] of sheetsByMaterial) {
    const material = input.materials.get(materialKey);
    
    if (!material) {
      errors.push({
        code: 'MATERIAL_NOT_FOUND',
        message: `Material não encontrado: ${materialKey}`,
        severity: 'error'
      });
      continue;
    }
    
    // Obter preço ativo
    const activePrice = getActivePrice(material, input.quoteDate);
    
    if (!activePrice) {
      warnings.push({
        code: 'NO_ACTIVE_PRICE',
        message: `Sem preço ativo para ${materialKey}`,
        severity: 'warning',
        suggestion: 'Cadastrar preço válido'
      });
    }
    
    const pricePerKg = activePrice?.pricePerKg || 0;
    const pricePerSheet = activePrice?.pricePerSheet;
    
    // Calcular massa
    const density = getDensity(material.alloy, material);
    const thickness = material.thicknessMm || 1.2;
    
    let totalAreaM2 = 0;
    let usedAreaM2 = 0;
    
    for (const sheet of sheets) {
      // Estimar dimensões da chapa baseado no material
      const sheetWidthMm = material.format?.widthMm || 3000;
      const sheetHeightMm = material.format?.heightMm || 1250;
      const sheetAreaM2 = (sheetWidthMm * sheetHeightMm) / 1_000_000;
      totalAreaM2 += sheetAreaM2 * sheet.quantity;
      usedAreaM2 += sheetAreaM2 * (sheet.utilization / 100) * sheet.quantity;
    }
    
    const thicknessM = thickness / 1000;
    const totalKg = totalAreaM2 * thicknessM * density;
    const usedKg = usedAreaM2 * thicknessM * density;
    const wasteKg = totalKg - usedKg;
    
    // Calcular custos
    let materialCost: number;
    let wasteCost: number;
    
    if (pricePerSheet && pricePerSheet > 0) {
      // Preço por chapa
      const sheetsCount = sheets.reduce((sum, s) => sum + s.quantity, 0);
      materialCost = pricePerSheet * sheetsCount;
      wasteCost = (wasteKg / totalKg) * materialCost;
    } else {
      // Preço por kg
      materialCost = totalKg * pricePerKg;
      wasteCost = wasteKg * pricePerKg;
    }
    
    const usedCost = materialCost - wasteCost;
    
    breakdown.push({
      materialKey,
      sheetsUsed: sheets.reduce((sum, s) => sum + s.quantity, 0),
      totalKg,
      usedKg,
      wasteKg,
      pricePerKg,
      pricePerSheet,
      materialCost,
      wasteCost,
      totalCost: materialCost
    });
    
    totalMaterialCost += materialCost;
    totalUsedCost += usedCost;
    totalWasteCost += wasteCost;
  }
  
  return {
    success: errors.length === 0,
    data: {
      breakdown,
      totalMaterialCost,
      totalUsedCost,
      totalWasteCost,
      warnings
    },
    errors,
    warnings
  };
}

/**
 * Obtém preço ativo para um material na data especificada
 */
function getActivePrice(material: Material, date: string): PriceRecord | undefined {
  const targetDate = new Date(date);
  
  return material.priceHistory.find(p => {
    const from = new Date(p.validFrom);
    const to = p.validTo ? new Date(p.validTo) : new Date('2099-12-31');
    return targetDate >= from && targetDate <= to;
  });
}

/**
 * Calcula custo de material para tubos
 */
export function calculateTubeMaterialCost(
  tubes: Array<{
    materialKey: string;
    lengthMm: number;
    quantity: number;
    profile: { widthMm: number; heightMm: number; thicknessMm: number };
  }>,
  materials: Map<string, Material>,
  quoteDate: string
): EngineResult<{ totalCost: number; breakdown: Array<{ materialKey: string; totalM: number; cost: number }> }> {
  const errors: { code: string; message: string; severity: 'error' }[] = [];
  const breakdown: Array<{ materialKey: string; totalM: number; cost: number }> = [];
  let totalCost = 0;
  
  for (const tube of tubes) {
    const material = materials.get(tube.materialKey);
    
    if (!material) {
      errors.push({
        code: 'MATERIAL_NOT_FOUND',
        message: `Material não encontrado: ${tube.materialKey}`,
        severity: 'error'
      });
      continue;
    }
    
    const activePrice = getActivePrice(material, quoteDate);
    const totalLengthM = (tube.lengthMm / 1000) * tube.quantity;
    
    let cost = 0;
    if (activePrice?.pricePerMeter) {
      cost = totalLengthM * activePrice.pricePerMeter;
    } else if (activePrice?.pricePerKg) {
      const density = getDensity(material.alloy, material);
      const massKg = computeTubeMassKg(
        tube.profile,
        tube.lengthMm,
        density
      );
      cost = massKg * activePrice.pricePerKg;
    }
    
    breakdown.push({
      materialKey: tube.materialKey,
      totalM: totalLengthM,
      cost
    });
    
    totalCost += cost;
  }
  
  return {
    success: errors.length === 0,
    data: { totalCost, breakdown },
    errors,
    warnings: []
  };
}

/**
 * Calcula massa de tubo em kg
 */
function computeTubeMassKg(
  profile: { widthMm: number; heightMm: number; thicknessMm: number },
  lengthMm: number,
  densityKgM3: number
): number {
  const { widthMm, heightMm, thicknessMm } = profile;
  
  // Perímetro em mm
  const perimeterMm = 2 * (widthMm + heightMm);
  
  // Área da seção transversal em mm²
  const sectionAreaMm2 = perimeterMm * thicknessMm;
  
  // Converter para m²
  const sectionAreaM2 = sectionAreaMm2 / 1_000_000;
  
  // Comprimento em m
  const lengthM = lengthMm / 1000;
  
  // Massa = área * comprimento * densidade
  return sectionAreaM2 * lengthM * densityKgM3;
}
