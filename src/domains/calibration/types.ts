export interface CalibrationFactor {
  id: string;
  type: 'global' | 'template' | 'process';
  targetKey?: string; // para template/process
  factors: {
    weld?: number;
    cut?: number;
    finish?: number;
    assembly?: number;
    material?: number;
  };
  description: string;
  effectiveFrom: string;
  effectiveTo?: string;
  active: boolean;
}

export interface Baseline {
  id: string;
  templateKey: string;
  inputs: Record<string, any>;
  expectedCost: {
    material: number;
    process: number;
    overhead: number;
    margin: number;
    total: number;
  };
  expectedMetrics: {
    weldMeters?: number;
    cutMeters?: number;
    finishM2?: number;
    bendCount?: number;
  };
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface CalibrationRun {
  id: string;
  companyId: string;
  baselineId: string;
  results: CalibrationResult[];
  calibrationFactors: CalibrationFactor[];
  adjustments: CalibrationAdjustment[];
  metrics: {
    mape: number; // Mean Absolute Percentage Error
    maxError: number;
    minError: number;
    errorDistribution: number[];
  };
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface CalibrationResult {
  partId: string;
  actualCost: number;
  expectedCost: number;
  error: number;
  errorPercent: number;
}

export interface CalibrationAdjustment {
  id: string;
  type: 'material' | 'process' | 'metric';
  targetId: string;
  oldValue: number;
  newValue: number;
  reason: string;
  adjustedAt: string;
  adjustedBy: string;
}

export interface CalibrationReport {
  companyId: string;
  runId: string;
  baselineId: string;
  templateKey: string;
  inputs: Record<string, any>;
  costBreakdown: {
    material: { actual: number; expected: number; error: number };
    process: { actual: number; expected: number; error: number };
    overhead: { actual: number; expected: number; error: number };
    margin: { actual: number; expected: number; error: number };
  };
  metricsBreakdown: {
    weldMeters: { actual: number; expected: number; error: number };
    cutMeters: { actual: number; expected: number; error: number };
    finishM2: { actual: number; expected: number; error: number };
    bendCount: { actual: number; expected: number; error: number };
  };
  overallMetrics: {
    mape: number;
    maxError: number;
    minError: number;
  };
  recommendations: CalibrationRecommendation[];
  createdAt: string;
}

export interface CalibrationRecommendation {
  id: string;
  type: 'factor' | 'material' | 'process' | 'metric';
  targetKey: string;
  currentValue: number;
  recommendedValue: number;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
}

export interface CostBreakdown {
  material: number;
  process: number;
  overhead: number;
  margin: number;
  total: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
