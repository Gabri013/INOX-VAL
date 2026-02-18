// ============================================================
// PRICING ENGINE TESTS
// ============================================================

import { describe, it, expect } from 'vitest';
import { 
  calculatePricing, 
  validatePrice,
  calculateMargin,
  calculateMarkup,
  marginToMarkup,
  markupToMargin,
  calculateMinPrice,
  calculateSuggestedPrice
} from './index';
import { DEFAULT_RULESET } from '../ruleset';

describe('Pricing Engine', () => {
  describe('calculatePricing', () => {
    it('calcula preço com markup', () => {
      const result = calculatePricing({
        materialCost: 100,
        processCost: 50,
        method: 'markup',
        targetMargin: 30
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.targetPrice).toBeGreaterThan(150);
      // Custo com overhead: 150 * 1.10 = 165
      // Preço com markup 30%: 165 * 1.30 = 214.50
      expect(result.data?.targetPrice).toBeCloseTo(214.50, 1);
    });

    it('calcula preço com margem alvo', () => {
      const result = calculatePricing({
        materialCost: 100,
        processCost: 50,
        method: 'target-margin',
        targetMargin: 25
      });
      
      expect(result.success).toBe(true);
      // Custo com overhead: 150 * 1.10 = 165
      // Preço = 165 / (1 - 0.25) = 220
      expect(result.data?.targetPrice).toBeCloseTo(220, 0);
    });

    it('aplica desconto corretamente', () => {
      const result = calculatePricing({
        materialCost: 100,
        processCost: 50,
        method: 'target-margin',
        targetMargin: 25,
        discount: 10
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.discountApplied).toBe(10);
      // Preço base: 220
      // Com desconto 10%: 220 * 0.90 = 198
      expect(result.data?.targetPrice).toBeCloseTo(198, 0);
    });

    it('rejeita margem abaixo do mínimo', () => {
      const result = calculatePricing({
        materialCost: 100,
        processCost: 50,
        method: 'minimum-profit',
        minProfit: 5 // Margem muito baixa
      });
      
      // Custo com overhead: 165
      // Preço: 165 + 5 = 170
      // Margem: (170 - 165) / 170 = 2.94%
      expect(result.data?.marginResult).toBeLessThan(DEFAULT_RULESET.pricing.minMarginPercent);
    });

    it('gera warning quando desconto excede máximo', () => {
      const result = calculatePricing({
        materialCost: 100,
        processCost: 50,
        method: 'target-margin',
        targetMargin: 25,
        discount: 20 // Excede máximo de 15%
      });
      
      expect(result.data?.warnings.length).toBeGreaterThan(0);
      expect(result.data?.warnings[0].code).toBe('DISCOUNT_EXCEEDS_MAX');
      // Desconto deve ser limitado a 15%
      expect(result.data?.discountApplied).toBe(15);
    });

    it('calcula preço mínimo corretamente', () => {
      const result = calculatePricing({
        materialCost: 100,
        processCost: 50,
        method: 'target-margin',
        targetMargin: 25
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.minPrice).toBeGreaterThan(0);
      // Custo com overhead: 165
      // Preço mínimo (margem 10%): 165 / 0.90 = 183.33
      expect(result.data?.minPrice).toBeCloseTo(183.33, 0);
    });

    it('usa margem padrão quando não especificada', () => {
      const result = calculatePricing({
        materialCost: 100,
        processCost: 50,
        method: 'target-margin'
      });
      
      expect(result.success).toBe(true);
      // Margem padrão: 25%
      // Custo com overhead: 165
      // Preço: 165 / 0.75 = 220
      expect(result.data?.targetPrice).toBeCloseTo(220, 0);
    });

    it('calcula overhead corretamente', () => {
      const result = calculatePricing({
        materialCost: 100,
        processCost: 50,
        method: 'target-margin',
        targetMargin: 25
      });
      
      expect(result.success).toBe(true);
      // Overhead: 10% de 150 = 15
      // Total: 165
      expect(result.data?.totalCost).toBeCloseTo(165, 0);
    });
  });

  describe('validatePrice', () => {
    it('valida preço acima do custo', () => {
      const result = validatePrice(200, 150);
      
      expect(result.valid).toBe(true);
      expect(result.margin).toBeGreaterThan(0);
      // Margem: (200 - 150) / 200 = 25%
      expect(result.margin).toBeCloseTo(25, 0);
    });

    it('rejeita preço abaixo do custo', () => {
      const result = validatePrice(100, 150);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejeita preço com margem abaixo do mínimo', () => {
      // Preço 160, custo 150
      // Margem: (160 - 150) / 160 = 6.25%
      // Mínimo: 10%
      const result = validatePrice(160, 150);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('abaixo do mínimo'))).toBe(true);
    });

    it('aceita preço na margem mínima', () => {
      // Custo: 150
      // Margem 10%: Preço = 150 / 0.90 = 166.67
      const result = validatePrice(167, 150);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('calculateMargin', () => {
    it('calcula margem corretamente', () => {
      const margin = calculateMargin(200, 150);
      // (200 - 150) / 200 = 25%
      expect(margin).toBeCloseTo(25, 1);
    });

    it('retorna 0 para preço zero', () => {
      const margin = calculateMargin(0, 100);
      expect(margin).toBe(0);
    });

    it('retorna negativo para prejuízo', () => {
      const margin = calculateMargin(80, 100);
      expect(margin).toBeLessThan(0);
    });
  });

  describe('calculateMarkup', () => {
    it('calcula markup corretamente', () => {
      const markup = calculateMarkup(200, 100);
      // (200 - 100) / 100 = 100%
      expect(markup).toBeCloseTo(100, 1);
    });

    it('retorna 0 para custo zero', () => {
      const markup = calculateMarkup(200, 0);
      expect(markup).toBe(0);
    });
  });

  describe('marginToMarkup', () => {
    it('converte margem para markup', () => {
      // Margem 25% -> Markup 33.33%
      const markup = marginToMarkup(25);
      expect(markup).toBeCloseTo(33.33, 1);
    });

    it('converte margem 50% para markup 100%', () => {
      const markup = marginToMarkup(50);
      expect(markup).toBeCloseTo(100, 1);
    });
  });

  describe('markupToMargin', () => {
    it('converte markup para margem', () => {
      // Markup 100% -> Margem 50%
      const margin = markupToMargin(100);
      expect(margin).toBeCloseTo(50, 1);
    });

    it('converte markup 33.33% para margem 25%', () => {
      const margin = markupToMargin(33.33);
      expect(margin).toBeCloseTo(25, 1);
    });
  });

  describe('calculateMinPrice', () => {
    it('calcula preço mínimo com margem padrão', () => {
      const minPrice = calculateMinPrice(150);
      // Margem mínima: 10%
      // Preço = 150 / 0.90 = 166.67
      expect(minPrice).toBeCloseTo(166.67, 0);
    });
  });

  describe('calculateSuggestedPrice', () => {
    it('calcula preço sugerido com margem padrão', () => {
      const suggestedPrice = calculateSuggestedPrice(150);
      // Margem padrão: 25%
      // Preço = 150 / 0.75 = 200
      expect(suggestedPrice).toBeCloseTo(200, 0);
    });

    it('calcula preço sugerido com margem customizada', () => {
      const suggestedPrice = calculateSuggestedPrice(150, 30);
      // Margem: 30%
      // Preço = 150 / 0.70 = 214.29
      expect(suggestedPrice).toBeCloseTo(214.29, 0);
    });
  });
});