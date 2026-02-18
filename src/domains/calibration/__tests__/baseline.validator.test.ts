import { describe, it, expect } from 'vitest';
import { validateBaseline, validateCostBreakdown, validateBaselineComplete } from '../baseline.validator';
import { Baseline } from '../types';

describe('baseline.validator', () => {
  const validBaseline: Baseline = {
    id: 'test-baseline',
    templateKey: 'template-1',
    inputs: { size: '100x60', material: 'stainless-steel' },
    expectedCost: {
      material: 1000,
      process: 500,
      overhead: 200,
      margin: 300,
      total: 2000,
    },
    expectedMetrics: {
      weldMeters: 12,
      cutMeters: 7,
      finishM2: 3,
      bendCount: 3,
    },
    notes: 'Test baseline',
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'user@test.com',
  };

  describe('validateBaseline', () => {
    it('should validate a valid baseline', () => {
      const result = validateBaseline(validBaseline);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should invalidate missing template key', () => {
      const invalidBaseline = { ...validBaseline, templateKey: '' };
      const result = validateBaseline(invalidBaseline);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template key is required');
    });

    it('should invalidate missing inputs', () => {
      const invalidBaseline = { ...validBaseline, inputs: {} };
      const result = validateBaseline(invalidBaseline);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Baseline inputs are required');
    });

    it('should invalidate negative costs', () => {
      const invalidBaseline = { 
        ...validBaseline, 
        expectedCost: { ...validBaseline.expectedCost, material: -100 } 
      };
      const result = validateBaseline(invalidBaseline);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid material cost: must be a non-negative number');
    });

    it('should invalidate total cost mismatch', () => {
      const invalidBaseline = { 
        ...validBaseline, 
        expectedCost: { ...validBaseline.expectedCost, total: 2100 } 
      };
      const result = validateBaseline(invalidBaseline);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Total cost mismatch');
    });

    it('should invalidate negative metrics', () => {
      const invalidBaseline = { 
        ...validBaseline, 
        expectedMetrics: { ...validBaseline.expectedMetrics, weldMeters: -5 } 
      };
      const result = validateBaseline(invalidBaseline);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid weldMeters: must be a non-negative number');
    });
  });

  describe('validateCostBreakdown', () => {
    it('should validate reasonable cost breakdown', () => {
      const result = validateCostBreakdown(validBaseline);
      expect(result.valid).toBe(true);
    });

    it('should warn about very high cost percentages', () => {
      const invalidBaseline = {
        ...validBaseline,
        expectedCost: {
          material: 1900,
          process: 50,
          overhead: 25,
          margin: 25,
          total: 2000,
        },
      };
      const result = validateCostBreakdown(invalidBaseline);
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(expect.arrayContaining([
        expect.stringContaining('material cost is very high')
      ]));
    });

    it('should warn about very low cost percentages', () => {
      const invalidBaseline = {
        ...validBaseline,
        expectedCost: {
          material: 10,
          process: 950,
          overhead: 200,
          margin: 840,
          total: 2000,
        },
      };
      const result = validateCostBreakdown(invalidBaseline);
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(expect.arrayContaining([
        expect.stringContaining('material cost is very low')
      ]));
    });

    it('should invalidate negative total cost', () => {
      const invalidBaseline = {
        ...validBaseline,
        expectedCost: { ...validBaseline.expectedCost, total: -100 },
      };
      const result = validateCostBreakdown(invalidBaseline);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Total cost must be greater than zero');
    });

    it('should warn about extremely high total cost', () => {
      const invalidBaseline = {
        ...validBaseline,
        expectedCost: { ...validBaseline.expectedCost, total: 2000000 },
      };
      const result = validateCostBreakdown(invalidBaseline);
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(expect.arrayContaining([
        expect.stringContaining('Total cost seems very high')
      ]));
    });
  });

  describe('validateBaselineComplete', () => {
    it('should validate complete baseline', () => {
      const result = validateBaselineComplete(validBaseline);
      expect(result.valid).toBe(true);
    });

    it('should aggregate errors from all validators', () => {
      const invalidBaseline = {
        ...validBaseline,
        templateKey: '',
        expectedCost: { ...validBaseline.expectedCost, material: -100 },
      };
      const result = validateBaselineComplete(invalidBaseline);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([
        'Template key is required',
        'Invalid material cost: must be a non-negative number',
      ]));
    });
  });
});
