// ============================================================
// MATERIAL COST ENGINE TESTS
// ============================================================

import { describe, it, expect } from 'vitest';
import { calculateMaterialCost, calculateTubeMaterialCost } from './index';
import { Material, NestingResult } from '../types';

describe('Material Cost Engine', () => {
  describe('calculateMaterialCost', () => {
    it('calcula custo de material corretamente', () => {
      const materials = new Map<string, Material>([
        ['CHAPA#304#1.2#POLIDO#3000x1250#FORN_A', {
          key: 'CHAPA#304#1.2#POLIDO#3000x1250#FORN_A',
          kind: 'sheet',
          alloy: '304',
          thicknessMm: 1.2,
          finish: 'POLIDO',
          format: { widthMm: 3000, heightMm: 1250, supplierFormatName: 'Padrão' },
          supplierId: 'FORN_A',
          densityKgM3: 7930,
          active: true,
          priceHistory: [{
            currency: 'BRL',
            pricePerKg: 48,
            supplierId: 'FORN_A',
            validFrom: '2024-01-01',
            updatedAt: '2024-01-01'
          }]
        }]
      ]);
      
      const nestingResult: NestingResult = {
        sheets: [{
          materialKey: 'CHAPA#304#1.2#POLIDO#3000x1250#FORN_A',
          quantity: 1,
          layout: [],
          utilization: 80,
          wasteKg: 5,
          wasteValue: 240
        }],
        totalUtilization: 80,
        totalWasteKg: 5,
        totalWasteValue: 240
      };
      
      const result = calculateMaterialCost({
        materials,
        nestingResult,
        quoteDate: '2024-06-01'
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.breakdown.length).toBe(1);
      expect(result.data?.totalMaterialCost).toBeGreaterThan(0);
    });

    it('retorna erro quando material não existe', () => {
      const materials = new Map<string, Material>();
      
      const nestingResult: NestingResult = {
        sheets: [{
          materialKey: 'CHAPA#304#1.2#POLIDO#3000x1250#FORN_A',
          quantity: 1,
          layout: [],
          utilization: 80,
          wasteKg: 5,
          wasteValue: 240
        }],
        totalUtilization: 80,
        totalWasteKg: 5,
        totalWasteValue: 240
      };
      
      const result = calculateMaterialCost({
        materials,
        nestingResult,
        quoteDate: '2024-06-01'
      });
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('MATERIAL_NOT_FOUND');
    });

    it('gera warning quando não há preço ativo', () => {
      const materials = new Map<string, Material>([
        ['CHAPA#304#1.2#POLIDO#3000x1250#FORN_A', {
          key: 'CHAPA#304#1.2#POLIDO#3000x1250#FORN_A',
          kind: 'sheet',
          alloy: '304',
          thicknessMm: 1.2,
          finish: 'POLIDO',
          format: { widthMm: 3000, heightMm: 1250, supplierFormatName: 'Padrão' },
          supplierId: 'FORN_A',
          densityKgM3: 7930,
          active: true,
          priceHistory: [] // Sem preços
        }]
      ]);
      
      const nestingResult: NestingResult = {
        sheets: [{
          materialKey: 'CHAPA#304#1.2#POLIDO#3000x1250#FORN_A',
          quantity: 1,
          layout: [],
          utilization: 80,
          wasteKg: 5,
          wasteValue: 240
        }],
        totalUtilization: 80,
        totalWasteKg: 5,
        totalWasteValue: 240
      };
      
      const result = calculateMaterialCost({
        materials,
        nestingResult,
        quoteDate: '2024-06-01'
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.warnings.length).toBeGreaterThan(0);
      expect(result.data?.warnings[0].code).toBe('NO_ACTIVE_PRICE');
    });

    it('calcula com preço por chapa quando disponível', () => {
      const materials = new Map<string, Material>([
        ['CHAPA#304#1.2#POLIDO#3000x1250#FORN_A', {
          key: 'CHAPA#304#1.2#POLIDO#3000x1250#FORN_A',
          kind: 'sheet',
          alloy: '304',
          thicknessMm: 1.2,
          finish: 'POLIDO',
          format: { widthMm: 3000, heightMm: 1250, supplierFormatName: 'Padrão' },
          supplierId: 'FORN_A',
          densityKgM3: 7930,
          active: true,
          priceHistory: [{
            currency: 'BRL',
            pricePerSheet: 500,
            supplierId: 'FORN_A',
            validFrom: '2024-01-01',
            updatedAt: '2024-01-01'
          }]
        }]
      ]);
      
      const nestingResult: NestingResult = {
        sheets: [{
          materialKey: 'CHAPA#304#1.2#POLIDO#3000x1250#FORN_A',
          quantity: 2,
          layout: [],
          utilization: 85,
          wasteKg: 4,
          wasteValue: 200
        }],
        totalUtilization: 85,
        totalWasteKg: 4,
        totalWasteValue: 200
      };
      
      const result = calculateMaterialCost({
        materials,
        nestingResult,
        quoteDate: '2024-06-01'
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.breakdown[0].pricePerSheet).toBe(500);
      expect(result.data?.totalMaterialCost).toBe(1000); // 2 chapas * 500
    });

    it('agrupa múltiplos materiais corretamente', () => {
      const materials = new Map<string, Material>([
        ['CHAPA#304#1.2#POLIDO#3000x1250#FORN_A', {
          key: 'CHAPA#304#1.2#POLIDO#3000x1250#FORN_A',
          kind: 'sheet',
          alloy: '304',
          thicknessMm: 1.2,
          finish: 'POLIDO',
          format: { widthMm: 3000, heightMm: 1250, supplierFormatName: 'Padrão' },
          supplierId: 'FORN_A',
          densityKgM3: 7930,
          active: true,
          priceHistory: [{
            currency: 'BRL',
            pricePerKg: 48,
            supplierId: 'FORN_A',
            validFrom: '2024-01-01',
            updatedAt: '2024-01-01'
          }]
        }],
        ['CHAPA#316L#2.0#2B#2500x1250#FORN_B', {
          key: 'CHAPA#316L#2.0#2B#2500x1250#FORN_B',
          kind: 'sheet',
          alloy: '316L',
          thicknessMm: 2.0,
          finish: '2B',
          format: { widthMm: 2500, heightMm: 1250, supplierFormatName: 'Padrão' },
          supplierId: 'FORN_B',
          densityKgM3: 8000,
          active: true,
          priceHistory: [{
            currency: 'BRL',
            pricePerKg: 65,
            supplierId: 'FORN_B',
            validFrom: '2024-01-01',
            updatedAt: '2024-01-01'
          }]
        }]
      ]);
      
      const nestingResult: NestingResult = {
        sheets: [
          {
            materialKey: 'CHAPA#304#1.2#POLIDO#3000x1250#FORN_A',
            quantity: 1,
            layout: [],
            utilization: 80,
            wasteKg: 5,
            wasteValue: 240
          },
          {
            materialKey: 'CHAPA#316L#2.0#2B#2500x1250#FORN_B',
            quantity: 1,
            layout: [],
            utilization: 75,
            wasteKg: 8,
            wasteValue: 520
          }
        ],
        totalUtilization: 77.5,
        totalWasteKg: 13,
        totalWasteValue: 760
      };
      
      const result = calculateMaterialCost({
        materials,
        nestingResult,
        quoteDate: '2024-06-01'
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.breakdown.length).toBe(2);
    });
  });

  describe('calculateTubeMaterialCost', () => {
    it('calcula custo de tubos corretamente', () => {
      const materials = new Map<string, Material>([
        ['TUBE#304#30x30x2.0#6000#FORN_A', {
          key: 'TUBE#304#30x30x2.0#6000#FORN_A',
          kind: 'tube',
          alloy: '304',
          finish: 'POLIDO',
          supplierId: 'FORN_A',
          densityKgM3: 7930,
          active: true,
          priceHistory: [{
            currency: 'BRL',
            pricePerMeter: 25,
            supplierId: 'FORN_A',
            validFrom: '2024-01-01',
            updatedAt: '2024-01-01'
          }]
        }]
      ]);
      
      const tubes = [{
        materialKey: 'TUBE#304#30x30x2.0#6000#FORN_A',
        lengthMm: 1000,
        quantity: 5,
        profile: { widthMm: 30, heightMm: 30, thicknessMm: 2.0 }
      }];
      
      const result = calculateTubeMaterialCost(tubes, materials, '2024-06-01');
      
      expect(result.success).toBe(true);
      expect(result.data?.totalCost).toBe(125); // 5m * 25/m
      expect(result.data?.breakdown.length).toBe(1);
    });

    it('calcula custo por kg quando preço por metro não disponível', () => {
      const materials = new Map<string, Material>([
        ['TUBE#304#30x30x2.0#6000#FORN_A', {
          key: 'TUBE#304#30x30x2.0#6000#FORN_A',
          kind: 'tube',
          alloy: '304',
          finish: 'POLIDO',
          supplierId: 'FORN_A',
          densityKgM3: 7930,
          active: true,
          priceHistory: [{
            currency: 'BRL',
            pricePerKg: 50,
            supplierId: 'FORN_A',
            validFrom: '2024-01-01',
            updatedAt: '2024-01-01'
          }]
        }]
      ]);
      
      const tubes = [{
        materialKey: 'TUBE#304#30x30x2.0#6000#FORN_A',
        lengthMm: 1000,
        quantity: 1,
        profile: { widthMm: 30, heightMm: 30, thicknessMm: 2.0 }
      }];
      
      const result = calculateTubeMaterialCost(tubes, materials, '2024-06-01');
      
      expect(result.success).toBe(true);
      expect(result.data?.totalCost).toBeGreaterThan(0);
    });
  });
});