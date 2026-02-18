// ============================================================
// MATERIAL COST - Calculate material costs from nesting results
// ============================================================

import {
  MaterialCostBreakdown,
  NestingResult,
  SheetLayout,
  BOM,
  TubePart,
  AccessoryPart,
} from './pricing.types';
import { Material, PriceRecord } from '../engine/types';
import { DEFAULT_DENSITIES } from '../engine/mass';

// ============================================================
// Types
// ============================================================

export interface MaterialCostResult {
  success: boolean;
  breakdown: MaterialCostBreakdown[];
  tubeCost: TubeCostBreakdown[];
  accessoryCost: AccessoryCostBreakdown[];
  totalMaterialCost: number;
  totalUsedCost: number;
  totalWasteCost: number;
  errors: MaterialCostError[];
}

export interface TubeCostBreakdown {
  partId: string;
  materialKey: string;
  totalLengthM: number;
  pricePerMeter?: number;
  pricePerKg?: number;
  massKg: number;
  cost: number;
}

export interface AccessoryCostBreakdown {
  partId: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface MaterialCostError {
  code: string;
  message: string;
  materialKey?: string;
}

// ============================================================
// Price Helpers
// ============================================================

/**
 * Get active price for a material at a specific date
 */
export function getActivePrice(
  material: Material,
  date: string = new Date().toISOString()
): PriceRecord | undefined {
  const targetDate = new Date(date);
  
  return material.priceHistory.find(p => {
    const from = new Date(p.validFrom);
    const to = p.validTo ? new Date(p.validTo) : new Date('2099-12-31');
    return targetDate >= from && targetDate <= to;
  });
}

/**
 * Find material by key or partial key match
 */
export function findMaterial(
  materialKey: string,
  materials: Material[]
): Material | undefined {
  // Try exact match first
  const exact = materials.find(m => m.key === materialKey);
  if (exact) return exact;
  
  // Try partial match (first 4 segments)
  const keyParts = materialKey.split('#');
  if (keyParts.length >= 4) {
    const partialKey = keyParts.slice(0, 4).join('#');
    return materials.find(m => m.key.startsWith(partialKey));
  }
  
  return undefined;
}

/**
 * Get density for an alloy
 */
export function getDensityForAlloy(alloy: string): number {
  const normalized = alloy.replace('SS', '').replace('AISI', '');
  return DEFAULT_DENSITIES[normalized] || 8000;
}

// ============================================================
// Sheet Material Cost
// ============================================================

/**
 * Calculate material costs from nesting result
 */
export function calculateMaterialCost(
  nestingResult: NestingResult,
  materials: Material[],
  quoteDate: string = new Date().toISOString()
): MaterialCostResult {
  const breakdown: MaterialCostBreakdown[] = [];
  const errors: MaterialCostError[] = [];
  
  let totalMaterialCost = 0;
  let totalUsedCost = 0;
  let totalWasteCost = 0;
  
  // Group layouts by material
  const layoutsByMaterial = new Map<string, SheetLayout[]>();
  for (const layout of nestingResult.layouts) {
    const existing = layoutsByMaterial.get(layout.materialKey) || [];
    existing.push(layout);
    layoutsByMaterial.set(layout.materialKey, existing);
  }
  
  // Calculate cost for each material
  for (const [materialKey, layouts] of layoutsByMaterial) {
    const material = findMaterial(materialKey, materials);
    
    if (!material) {
      errors.push({
        code: 'MATERIAL_NOT_FOUND',
        message: `Material não encontrado: ${materialKey}`,
        materialKey
      });
      continue;
    }
    
    const activePrice = getActivePrice(material, quoteDate);
    
    if (!activePrice) {
      errors.push({
        code: 'NO_ACTIVE_PRICE',
        message: `Sem preço ativo para: ${materialKey}`,
        materialKey
      });
    }
    
    const pricePerKg = activePrice?.pricePerKg || 50; // Default fallback
    const pricePerSheet = activePrice?.pricePerSheet;
    
    // Calculate totals
    const sheetsUsed = layouts.length;
    const thickness = material.thicknessMm || 1.2;
    const density = material.densityKgM3 || getDensityForAlloy(material.alloy);
    
    let totalAreaM2 = 0;
    let usedAreaM2 = 0;
    
    for (const layout of layouts) {
      const sheetAreaM2 = (layout.sheetWidth * layout.sheetHeight) / 1_000_000;
      totalAreaM2 += sheetAreaM2;
      usedAreaM2 += layout.usedArea / 1_000_000;
    }
    
    // Calculate mass
    const thicknessM = thickness / 1000;
    const totalKg = totalAreaM2 * thicknessM * density;
    const usedKg = usedAreaM2 * thicknessM * density;
    const wasteKg = totalKg - usedKg;
    
    // Calculate costs
    let materialCost: number;
    let wasteCost: number;
    
    if (pricePerSheet && pricePerSheet > 0) {
      // Price per sheet
      materialCost = pricePerSheet * sheetsUsed;
      const wasteRatio = wasteKg / totalKg;
      wasteCost = materialCost * wasteRatio;
    } else {
      // Price per kg
      materialCost = totalKg * pricePerKg;
      wasteCost = wasteKg * pricePerKg;
    }
    
    const usedCost = materialCost - wasteCost;
    
    breakdown.push({
      materialKey,
      sheetsUsed,
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
    breakdown,
    tubeCost: [], // Calculated separately
    accessoryCost: [], // Calculated separately
    totalMaterialCost,
    totalUsedCost,
    totalWasteCost,
    errors
  };
}

// ============================================================
// Tube Material Cost
// ============================================================

/**
 * Calculate tube material costs
 */
export function calculateTubeCost(
  tubes: TubePart[],
  materials: Material[],
  quoteDate: string = new Date().toISOString()
): TubeCostBreakdown[] {
  const results: TubeCostBreakdown[] = [];
  
  for (const tube of tubes) {
    const material = findMaterial(tube.materialKey, materials);
    const activePrice = material ? getActivePrice(material, quoteDate) : undefined;
    
    // Parse profile
    const profileDims = parseTubeProfile(tube.profile);
    
    // Calculate mass
    const density = material?.densityKgM3 || getDensityForAlloy(material?.alloy || '304');
    const perimeterMm = 2 * (profileDims.width + profileDims.height);
    const sectionAreaMm2 = perimeterMm * profileDims.thickness;
    const sectionAreaM2 = sectionAreaMm2 / 1_000_000;
    const lengthM = tube.length / 1000;
    const massKg = sectionAreaM2 * lengthM * density * tube.quantity;
    
    // Calculate cost
    let cost = 0;
    const totalLengthM = lengthM * tube.quantity;
    
    if (activePrice?.pricePerMeter) {
      cost = totalLengthM * activePrice.pricePerMeter;
    } else if (activePrice?.pricePerKg) {
      cost = massKg * activePrice.pricePerKg;
    } else {
      // Default fallback: R$ 30/m for standard tube
      cost = totalLengthM * 30;
    }
    
    results.push({
      partId: tube.id,
      materialKey: tube.materialKey,
      totalLengthM,
      pricePerMeter: activePrice?.pricePerMeter,
      pricePerKg: activePrice?.pricePerKg,
      massKg,
      cost
    });
  }
  
  return results;
}

/**
 * Parse tube profile string
 */
function parseTubeProfile(profile: string): { width: number; height: number; thickness: number } {
  const parts = profile.split('x').map(Number);
  return {
    width: parts[0] || 40,
    height: parts[1] || 40,
    thickness: parts[2] || 1.2
  };
}

// ============================================================
// Accessory Cost
// ============================================================

/**
 * Calculate accessory costs
 */
export function calculateAccessoryCost(
  accessories: AccessoryPart[]
): AccessoryCostBreakdown[] {
  return accessories.map(acc => ({
    partId: acc.id,
    sku: acc.sku,
    quantity: acc.quantity,
    unitCost: acc.unitCost,
    totalCost: acc.unitCost * acc.quantity
  }));
}

// ============================================================
// Combined Material Cost Calculation
// ============================================================

export interface FullMaterialCostResult {
  success: boolean;
  sheets: MaterialCostBreakdown[];
  tubes: TubeCostBreakdown[];
  accessories: AccessoryCostBreakdown[];
  totalSheetCost: number;
  totalTubeCost: number;
  totalAccessoryCost: number;
  totalMaterialCost: number;
  totalWasteCost: number;
  errors: MaterialCostError[];
}

/**
 * Calculate all material costs (sheets, tubes, accessories)
 */
export function calculateFullMaterialCost(
  nestingResult: NestingResult,
  bom: BOM,
  materials: Material[],
  quoteDate: string = new Date().toISOString()
): FullMaterialCostResult {
  // Sheet costs
  const sheetResult = calculateMaterialCost(nestingResult, materials, quoteDate);
  
  // Tube costs
  const tubeCosts = calculateTubeCost(bom.tubes, materials, quoteDate);
  const totalTubeCost = tubeCosts.reduce((sum, t) => sum + t.cost, 0);
  
  // Accessory costs
  const accessoryCosts = calculateAccessoryCost(bom.accessories);
  const totalAccessoryCost = accessoryCosts.reduce((sum, a) => sum + a.totalCost, 0);
  
  // Totals
  const totalSheetCost = sheetResult.totalMaterialCost;
  const totalWasteCost = sheetResult.totalWasteCost;
  const totalMaterialCost = totalSheetCost + totalTubeCost + totalAccessoryCost;
  
  return {
    success: sheetResult.success,
    sheets: sheetResult.breakdown,
    tubes: tubeCosts,
    accessories: accessoryCosts,
    totalSheetCost,
    totalTubeCost,
    totalAccessoryCost,
    totalMaterialCost,
    totalWasteCost,
    errors: sheetResult.errors
  };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get total mass from material breakdown
 */
export function getTotalMass(breakdown: MaterialCostBreakdown[]): number {
  return breakdown.reduce((sum, b) => sum + b.totalKg, 0);
}

/**
 * Get total waste mass
 */
export function getTotalWasteMass(breakdown: MaterialCostBreakdown[]): number {
  return breakdown.reduce((sum, b) => sum + b.wasteKg, 0);
}

/**
 * Calculate average utilization
 */
export function calculateAverageUtilization(breakdown: MaterialCostBreakdown[]): number {
  if (breakdown.length === 0) return 0;
  
  const totalUsed = breakdown.reduce((sum, b) => sum + b.usedKg, 0);
  const totalMass = breakdown.reduce((sum, b) => sum + b.totalKg, 0);
  
  return totalMass > 0 ? (totalUsed / totalMass) * 100 : 0;
}

/**
 * Format cost for display
 */
export function formatCost(cost: number, currency: string = 'R$'): string {
  return `${currency} ${cost.toFixed(2)}`;
}

/**
 * Get cost per kg average
 */
export function getAverageCostPerKg(breakdown: MaterialCostBreakdown[]): number {
  const totalKg = getTotalMass(breakdown);
  const totalCost = breakdown.reduce((sum, b) => sum + b.materialCost, 0);
  
  return totalKg > 0 ? totalCost / totalKg : 0;
}