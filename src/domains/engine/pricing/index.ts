// ============================================================
// PRICING ENGINE - Calculate final pricing using various methods
// ============================================================

import { 
  PricingMethod, 
  PricingOutput, 
  EngineResult,
  ValidationWarning 
} from '../types';
import { Ruleset, DEFAULT_RULESET } from '../ruleset';

export interface PricingCalculationInput {
  materialCost: number;
  processCost: number;
  ruleset?: Ruleset;
  method?: PricingMethod;
  targetMargin?: number;
  discount?: number;
  minProfit?: number;
}

/**
 * Calcula preço final usando o método especificado
 */
export function calculatePricing(
  input: PricingCalculationInput
): EngineResult<PricingOutput> {
  const errors: { code: string; message: string; severity: 'error' }[] = [];
  const warnings: ValidationWarning[] = [];
  
  const ruleset = input.ruleset || DEFAULT_RULESET;
  const method = input.method || 'target-margin';
  
  // Custo total base
  const totalCost = input.materialCost + input.processCost;
  
  // Overhead
  const overhead = totalCost * (ruleset.pricing.overheadPercent / 100);
  const costWithOverhead = totalCost + overhead;
  
  let targetPrice: number;
  let minPrice: number;
  let marginResult: number;
  let discountApplied = input.discount || 0;
  
  switch (method) {
    case 'markup': {
      // Preço = Custo * (1 + markup)
      const markup = input.targetMargin || ruleset.pricing.defaultMarginPercent;
      targetPrice = costWithOverhead * (1 + markup / 100);
      marginResult = markup;
      break;
    }
    
    case 'target-margin': {
      // Preço = Custo / (1 - margem)
      const targetMargin = input.targetMargin || ruleset.pricing.defaultMarginPercent;
      targetPrice = costWithOverhead / (1 - targetMargin / 100);
      marginResult = targetMargin;
      break;
    }
    
    case 'minimum-profit': {
      // Preço = Custo + lucro mínimo
      const minProfit = input.minProfit || 100;
      targetPrice = costWithOverhead + minProfit;
      marginResult = ((targetPrice - costWithOverhead) / targetPrice) * 100;
      break;
    }
    
    case 'max-discount': {
      // Preço com desconto máximo permitido
      const maxDiscount = ruleset.pricing.maxDiscountPercent;
      const basePrice = costWithOverhead / (1 - ruleset.pricing.minMarginPercent / 100);
      targetPrice = basePrice;
      marginResult = ruleset.pricing.minMarginPercent;
      discountApplied = Math.min(discountApplied, maxDiscount);
      break;
    }
    
    default: {
      targetPrice = costWithOverhead * 1.25; // 25% markup default
      marginResult = 20;
    }
  }
  
  // Aplicar desconto
  if (discountApplied > 0) {
    const maxDiscount = ruleset.pricing.maxDiscountPercent;
    if (discountApplied > maxDiscount) {
      warnings.push({
        code: 'DISCOUNT_EXCEEDS_MAX',
        message: `Desconto ${discountApplied}% excede máximo ${maxDiscount}%`,
        severity: 'warning',
        suggestion: 'Aprovação gerencial necessária'
      });
      discountApplied = maxDiscount;
    }
    targetPrice = targetPrice * (1 - discountApplied / 100);
  }
  
  // Calcular preço mínimo
  minPrice = costWithOverhead / (1 - ruleset.pricing.minMarginPercent / 100);
  
  // Verificar margem mínima
  const actualMargin = ((targetPrice - costWithOverhead) / targetPrice) * 100;
  
  if (actualMargin < ruleset.pricing.minMarginPercent) {
    errors.push({
      code: 'MARGIN_BELOW_MINIMUM',
      message: `Margem ${actualMargin.toFixed(1)}% abaixo do mínimo ${ruleset.pricing.minMarginPercent}%`,
      severity: 'error'
    });
  }
  
  marginResult = actualMargin;
  
  return {
    success: errors.length === 0,
    data: {
      totalCost: costWithOverhead,
      targetPrice,
      minPrice,
      appliedMethod: method,
      marginResult,
      discountApplied,
      warnings
    },
    errors,
    warnings
  };
}

/**
 * Verifica se o preço proposto é válido
 */
export function validatePrice(
  proposedPrice: number,
  totalCost: number,
  ruleset?: Ruleset
): { valid: boolean; margin: number; errors: string[] } {
  const rs = ruleset || DEFAULT_RULESET;
  const errors: string[] = [];
  
  const margin = ((proposedPrice - totalCost) / proposedPrice) * 100;
  
  if (margin < rs.pricing.minMarginPercent) {
    errors.push(`Margem ${margin.toFixed(1)}% abaixo do mínimo ${rs.pricing.minMarginPercent}%`);
  }
  
  if (proposedPrice < totalCost) {
    errors.push('Preço abaixo do custo');
  }
  
  return {
    valid: errors.length === 0,
    margin,
    errors
  };
}

/**
 * Calcula margem de lucro
 */
export function calculateMargin(salePrice: number, cost: number): number {
  if (salePrice === 0) return 0;
  return ((salePrice - cost) / salePrice) * 100;
}

/**
 * Calcula markup
 */
export function calculateMarkup(salePrice: number, cost: number): number {
  if (cost === 0) return 0;
  return ((salePrice - cost) / cost) * 100;
}

/**
 * Converte margem para markup
 */
export function marginToMarkup(marginPercent: number): number {
  if (marginPercent >= 100) return 0;
  return (marginPercent / (100 - marginPercent)) * 100;
}

/**
 * Converte markup para margem
 */
export function markupToMargin(markupPercent: number): number {
  return (markupPercent / (100 + markupPercent)) * 100;
}

/**
 * Calcula preço mínimo aceitável
 */
export function calculateMinPrice(
  totalCost: number,
  ruleset?: Ruleset
): number {
  const rs = ruleset || DEFAULT_RULESET;
  return totalCost / (1 - rs.pricing.minMarginPercent / 100);
}

/**
 * Calcula preço sugerido baseado na margem alvo
 */
export function calculateSuggestedPrice(
  totalCost: number,
  targetMarginPercent?: number,
  ruleset?: Ruleset
): number {
  const rs = ruleset || DEFAULT_RULESET;
  const margin = targetMarginPercent || rs.pricing.defaultMarginPercent;
  return totalCost / (1 - margin / 100);
}