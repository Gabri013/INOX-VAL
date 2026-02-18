import { describe, it, expect } from 'vitest';
import { computeAreaMm2, computeCutLengthMm, computeBlank, computeGeometryMetrics } from './geometry/index';
import { SheetPart } from './types';

describe('Geometry Engine', () => {
  describe('computeAreaMm2', () => {
    it('calcula área básica corretamente', () => {
      const part: SheetPart = {
        id: 'test-1',
        materialKey: 'CHAPA#304#1.2#POLIDO',
        quantity: 1,
        blank: { widthMm: 1000, heightMm: 700 },
        allowRotate: true,
        features: [],
        bends: []
      };
      
      const area = computeAreaMm2(part);
      expect(area).toBe(1000 * 700); // 700000 mm²
    });
    
    it('subtrai furos da área', () => {
      const part: SheetPart = {
        id: 'test-2',
        materialKey: 'CHAPA#304#1.2#POLIDO',
        quantity: 1,
        blank: { widthMm: 1000, heightMm: 700 },
        allowRotate: true,
        features: [
          {
            type: 'hole',
            position: { x: 500, y: 350 },
            dimensions: { widthMm: 0, heightMm: 0, diameterMm: 50 }
          }
        ],
        bends: []
      };
      
      const area = computeAreaMm2(part);
      const holeArea = Math.PI * Math.pow(25, 2);
      expect(area).toBe(700000 - holeArea);
    });
  });
  
  describe('computeCutLengthMm', () => {
    it('retorna perímetro para peça sem dobras', () => {
      const part: SheetPart = {
        id: 'test-3',
        materialKey: 'CHAPA#304#1.2#POLIDO',
        quantity: 1,
        blank: { widthMm: 1000, heightMm: 700 },
        allowRotate: true,
        features: [],
        bends: []
      };
      
      const cutLength = computeCutLengthMm(part);
      expect(cutLength).toBe(2 * (1000 + 700)); // 3400mm
    });
  });
  
  describe('computeBlank', () => {
    it('retorna dimensões originais sem dobras', () => {
      const result = computeBlank(1000, 700, [], 1.2);
      expect(result.widthMm).toBe(1000);
      expect(result.heightMm).toBe(700);
    });
    
    it('calcula desenvolvimento com dobras', () => {
      const result = computeBlank(1000, 700, [{ angle: 90, position: 100, direction: 'up' }], 1.2);
      expect(result.widthMm).toBeGreaterThan(1000);
    });
  });
  
  describe('computeGeometryMetrics', () => {
    it('retorna todas as métricas', () => {
      const part: SheetPart = {
        id: 'test-4',
        materialKey: 'CHAPA#304#1.2#POLIDO',
        quantity: 1,
        blank: { widthMm: 1000, heightMm: 700 },
        allowRotate: true,
        features: [],
        bends: []
      };
      
      const metrics = computeGeometryMetrics(part, 1.2);
      
      expect(metrics.areaMm2).toBe(700000);
      expect(metrics.cutLengthMm).toBe(3400);
      expect(metrics.isEstimated).toBe(false);
      expect(metrics.warnings).toEqual([]);
    });
    
    it('marca como estimado quando tem dobras', () => {
      const part: SheetPart = {
        id: 'test-5',
        materialKey: 'CHAPA#304#1.2#POLIDO',
        quantity: 1,
        blank: { widthMm: 1000, heightMm: 700 },
        allowRotate: true,
        features: [],
        bends: [{ angle: 90, position: 100, direction: 'up' }]
      };
      
      const metrics = computeGeometryMetrics(part, 1.2);
      
      expect(metrics.isEstimated).toBe(true);
    });
  });
});
