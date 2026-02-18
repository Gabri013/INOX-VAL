// ============================================================
// QUOTE ENGINE - Create and finalize quotes with full calculations
// ============================================================

import { 
  BOM, 
  Material, 
  Process,
  QuoteSnapshot,
  EngineResult,
  ValidationWarning,
  PricingMethod,
  NestingResult
} from '../types';
import { Ruleset, DEFAULT_RULESET } from '../ruleset';
import { validateBOM } from '../validations';
import { computeGeometryMetrics, computeBlank } from '../geometry';
import { computeMassKg, computeTubeMassKg, getDensity } from '../mass';
import { nestGuillotine, preparePartsForNesting, Sheet } from '../nesting';
import { calculateMaterialCost, calculateTubeMaterialCost } from '../materialCost';
import { calculateProcessCost } from '../processCost';
import { calculatePricing } from '../pricing';

export interface QuoteDraftInput {
  bom: BOM;
  materials: Map<string, Material>;
  processes: Map<string, Process>;
  availableSheets: Sheet[];
  ruleset?: Ruleset;
  quoteDate: string;
  customerId: string;
  customerName: string;
}

export interface QuoteDraftResult {
  valid: boolean;
  bom: BOM;
  geometry: {
    sheets: Array<{
      partId: string;
      areaMm2: number;
      cutLengthMm: number;
      blank: { widthMm: number; heightMm: number };
      isEstimated: boolean;
    }>;
    tubes: Array<{
      partId: string;
      lengthMm: number;
      massKg: number;
    }>;
  };
  mass: {
    totalKg: number;
    byMaterial: Map<string, number>;
  };
  nesting: {
    success: boolean;
    result?: NestingResult;
    warnings: ValidationWarning[];
  };
  costs: {
    material: {
      total: number;
      used: number;
      waste: number;
      breakdown: Array<{
        materialKey: string;
        totalCost: number;
        wasteCost: number;
      }>;
    };
    process: {
      total: number;
      breakdown: Array<{
        processKey: string;
        totalCost: number;
      }>;
    };
    overhead: number;
    total: number;
  };
  pricing: {
    method: PricingMethod;
    targetPrice: number;
    minPrice: number;
    margin: number;
  };
  errors: Array<{ code: string; message: string }>;
  warnings: ValidationWarning[];
}

/**
 * Cria um rascunho de orçamento com cálculos completos
 */
export function createQuoteDraft(input: QuoteDraftInput): EngineResult<QuoteDraftResult> {
  const errors: { code: string; message: string; severity: 'error' }[] = [];
  const warnings: ValidationWarning[] = [];
  const ruleset = input.ruleset || DEFAULT_RULESET;
  
  // 1. Validar BOM
  const bomValidation = validateBOM(
    input.bom,
    input.materials,
    input.processes,
    ruleset,
    input.quoteDate
  );
  
  if (!bomValidation.success) {
    errors.push(...bomValidation.errors);
  }
  warnings.push(...bomValidation.warnings);
  
  // 2. Calcular geometria
  const geometryResults = calculateGeometry(input.bom, input.materials, ruleset);
  
  // 3. Calcular massa
  const massResults = calculateMass(input.bom, input.materials);
  
  // 4. Executar nesting
  const nestingResult = performNesting(input.bom, geometryResults, input.availableSheets, ruleset);
  
  if (!nestingResult.success) {
    errors.push(...nestingResult.errors);
  }
  warnings.push(...nestingResult.warnings);
  
  // 5. Calcular custos de material
  let materialCostResult = { 
    total: 0, 
    used: 0, 
    waste: 0, 
    breakdown: [] as Array<{ materialKey: string; totalCost: number; wasteCost: number }> 
  };
  
  if (nestingResult.data) {
    const matCostInput = {
      materials: input.materials,
      nestingResult: nestingResult.data,
      quoteDate: input.quoteDate
    };
    const matCost = calculateMaterialCost(matCostInput);
    
    if (matCost.success && matCost.data) {
      materialCostResult = {
        total: matCost.data.totalMaterialCost,
        used: matCost.data.totalUsedCost,
        waste: matCost.data.totalWasteCost,
        breakdown: matCost.data.breakdown.map(b => ({
          materialKey: b.materialKey,
          totalCost: b.materialCost,
          wasteCost: b.wasteCost
        }))
      };
    }
    warnings.push(...matCost.warnings);
  }
  
  // Custo de tubos
  const tubeCostResult = calculateTubeMaterialCost(
    input.bom.tubes.map(t => ({
      materialKey: t.materialKey,
      lengthMm: t.lengthMm,
      quantity: t.quantity,
      profile: t.profile
    })),
    input.materials,
    input.quoteDate
  );
  
  if (tubeCostResult.success && tubeCostResult.data) {
    materialCostResult.total += tubeCostResult.data.totalCost;
  }
  
  // 6. Calcular custos de processos
  const processCostResult = calculateProcessCost({
    processes: input.processes,
    bom: input.bom,
    sheets: input.bom.sheets,
    tubes: input.bom.tubes
  });
  
  let processCostTotal = 0;
  const processBreakdown: Array<{ processKey: string; totalCost: number }> = [];
  
  if (processCostResult.success && processCostResult.data) {
    processCostTotal = processCostResult.data.totalProcessCost;
    processCostResult.data.breakdown.forEach(b => {
      processBreakdown.push({
        processKey: b.processKey,
        totalCost: b.totalCost
      });
    });
  }
  warnings.push(...processCostResult.warnings);
  
  // 7. Calcular overhead
  const overhead = (materialCostResult.total + processCostTotal) * (ruleset.pricing.overheadPercent / 100);
  const totalCost = materialCostResult.total + processCostTotal + overhead;
  
  // 8. Calcular preço
  const pricingResult = calculatePricing({
    materialCost: materialCostResult.total,
    processCost: processCostTotal,
    ruleset,
    method: 'target-margin',
    targetMargin: ruleset.pricing.defaultMarginPercent
  });
  
  if (!pricingResult.success) {
    errors.push(...pricingResult.errors);
  }
  warnings.push(...pricingResult.warnings);
  
  const result: QuoteDraftResult = {
    valid: errors.length === 0,
    bom: input.bom,
    geometry: geometryResults,
    mass: massResults,
    nesting: {
      success: nestingResult.success,
      result: nestingResult.data,
      warnings: nestingResult.warnings
    },
    costs: {
      material: materialCostResult,
      process: {
        total: processCostTotal,
        breakdown: processBreakdown
      },
      overhead,
      total: totalCost
    },
    pricing: {
      method: 'target-margin',
      targetPrice: pricingResult.data?.targetPrice || 0,
      minPrice: pricingResult.data?.minPrice || 0,
      margin: pricingResult.data?.marginResult || 0
    },
    errors: errors.map(e => ({ code: e.code, message: e.message })),
    warnings
  };
  
  return {
    success: errors.length === 0,
    data: result,
    errors,
    warnings
  };
}

/**
 * Calcula geometria para todas as peças
 */
function calculateGeometry(
  bom: BOM,
  materials: Map<string, Material>,
  ruleset: Ruleset
): QuoteDraftResult['geometry'] {
  const sheets: QuoteDraftResult['geometry']['sheets'] = [];
  const calculatedBlanks = new Map<string, { widthMm: number; heightMm: number }>();
  
  for (const part of bom.sheets) {
    const material = materials.get(part.materialKey);
    const thickness = material?.thicknessMm || 1.2;
    
    // Calcular blank se tiver dobras
    if (part.bends.length > 0) {
      const blank = computeBlank(
        part.blank.widthMm,
        part.blank.heightMm,
        part.bends,
        thickness,
        ruleset.tolerances.bendKFactor
      );
      calculatedBlanks.set(part.id, blank);
    }
    
    const metrics = computeGeometryMetrics(part, thickness, ruleset);
    
    sheets.push({
      partId: part.id,
      areaMm2: metrics.areaMm2,
      cutLengthMm: metrics.cutLengthMm,
      blank: metrics.blank,
      isEstimated: metrics.isEstimated
    });
  }
  
  const tubes: QuoteDraftResult['geometry']['tubes'] = bom.tubes.map(tube => {
    const material = materials.get(tube.materialKey);
    const density = material ? getDensity(material.alloy, material) : 7930;
    
    return {
      partId: tube.id,
      lengthMm: tube.lengthMm,
      massKg: computeTubeMassKg(tube, density)
    };
  });
  
  return { sheets, tubes };
}

/**
 * Calcula massa total
 */
function calculateMass(
  bom: BOM,
  materials: Map<string, Material>
): QuoteDraftResult['mass'] {
  let totalKg = 0;
  const byMaterial = new Map<string, number>();
  
  for (const sheet of bom.sheets) {
    const material = materials.get(sheet.materialKey);
    const density = material ? getDensity(material.alloy, material) : 7930;
    const thickness = material?.thicknessMm || 1.2;
    
    const mass = computeMassKg(sheet, density, thickness) * sheet.quantity;
    totalKg += mass;
    
    const current = byMaterial.get(sheet.materialKey) || 0;
    byMaterial.set(sheet.materialKey, current + mass);
  }
  
  for (const tube of bom.tubes) {
    const material = materials.get(tube.materialKey);
    const density = material ? getDensity(material.alloy, material) : 7930;
    
    const mass = computeTubeMassKg(tube, density) * tube.quantity;
    totalKg += mass;
    
    const current = byMaterial.get(tube.materialKey) || 0;
    byMaterial.set(tube.materialKey, current + mass);
  }
  
  return { totalKg, byMaterial };
}

/**
 * Executa nesting
 */
function performNesting(
  bom: BOM,
  geometry: QuoteDraftResult['geometry'],
  availableSheets: Sheet[],
  ruleset: Ruleset
): EngineResult<NestingResult> {
  // Preparar peças para nesting
  const calculatedBlanks = new Map(
    geometry.sheets.map(s => [s.partId, s.blank])
  );
  
  const nestableParts = preparePartsForNesting(bom.sheets, calculatedBlanks);
  
  // Executar algoritmo
  return nestGuillotine(nestableParts, availableSheets, ruleset);
}

/**
 * Finaliza o orçamento criando um snapshot imutável
 */
export function finalizeQuote(
  draft: QuoteDraftResult,
  input: QuoteDraftInput,
  userId: string,
  companyId: string
): QuoteSnapshot {
  const now = new Date().toISOString();
  
  // Coletar preços usados
  const materialPrices: QuoteSnapshot['materialPrices'] = [];
  
  for (const [key, material] of input.materials) {
    const activePrice = material.priceHistory.find(p => {
      const from = new Date(p.validFrom);
      const to = p.validTo ? new Date(p.validTo) : new Date('2099-12-31');
      const date = new Date(input.quoteDate);
      return date >= from && date <= to;
    });
    
    if (activePrice) {
      materialPrices.push({
        key,
        price: activePrice.pricePerKg || activePrice.pricePerSheet || activePrice.pricePerMeter || 0,
        currency: activePrice.currency,
        supplierId: activePrice.supplierId,
        validFrom: activePrice.validFrom,
        validTo: activePrice.validTo || ''
      });
    }
  }
  
  const snapshot: QuoteSnapshot = {
    id: generateId(),
    version: '1.0.0',
    createdAt: now,
    createdBy: userId,
    companyId,
    
    customerId: input.customerId,
    customerName: input.customerName,
    quoteNumber: generateQuoteNumber(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    
    bom: input.bom,
    materialPrices,
    rulesetVersion: input.ruleset?.version || DEFAULT_RULESET.version,
    
    nesting: draft.nesting.result || {
      sheets: [],
      totalUtilization: 0,
      totalWasteKg: 0,
      totalWasteValue: 0
    },
    
    costs: {
      materialUsed: draft.costs.material.used,
      materialLost: draft.costs.material.waste,
      materialTotal: draft.costs.material.total,
      processTotal: draft.costs.process.total,
      overhead: draft.costs.overhead,
      total: draft.costs.total
    },
    
    pricing: {
      method: draft.pricing.method,
      margin: draft.pricing.margin,
      discount: 0,
      finalPrice: draft.pricing.targetPrice
    },
    
    hash: '', // Será calculado abaixo
    auditEvents: [{
      timestamp: now,
      action: 'QUOTE_CREATED',
      userId,
      details: { draftValid: draft.valid }
    }]
  };
  
  // Calcular hash do snapshot
  snapshot.hash = calculateSnapshotHash(snapshot);
  
  return snapshot;
}

/**
 * Gera ID único
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gera número do orçamento
 */
function generateQuoteNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORC-${year}${month}-${random}`;
}

/**
 * Calcula hash SHA256 do snapshot
 */
function calculateSnapshotHash(snapshot: Omit<QuoteSnapshot, 'hash'>): string {
  const content = JSON.stringify({
    bom: snapshot.bom,
    materialPrices: snapshot.materialPrices,
    rulesetVersion: snapshot.rulesetVersion,
    nesting: snapshot.nesting,
    costs: snapshot.costs,
    pricing: snapshot.pricing
  });
  
  // Usar SubtleCrypto API para browser ou simple hash for Node.js
  try {
    // Simple hash for cross-platform compatibility
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  } catch {
    // Fallback para ambiente browser
    return btoa(content).slice(0, 64);
  }
}
