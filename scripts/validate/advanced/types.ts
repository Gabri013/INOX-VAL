import { ValidatorResult } from '../types';

export interface AdvancedValidationResult {
  timestamp: string;
  score: number;
  allPass: boolean;
  productionReady: boolean;
  results: Array<{
    name: string;
    status: 'passed' | 'failed' | 'warning';
    duration: number;
    error?: string;
    details?: any;
  }>;
}

export interface BoundaryTestResult {
  templateKey: string;
  dimensions: {
    width: number;
    height: number;
    thickness: number;
  };
  expected: {
    materialCost: number;
    processCost: number;
    totalCost: number;
  };
  actual: {
    materialCost: number;
    processCost: number;
    totalCost: number;
  };
  tolerance: number;
  passed: boolean;
}

export interface StressNestingResult {
  scenario: string;
  partsCount: number;
  materialUtilization: number;
  nestingTime: number;
  errors: string[];
  passed: boolean;
}

export interface TubeNestingResult {
  scenario: string;
  tubeLength: number;
  cuts: number[];
  waste: number;
  errors: string[];
  passed: boolean;
}

export interface RoundingResult {
  scenario: string;
  previewValue: number;
  snapshotValue: number;
  difference: number;
  tolerance: number;
  passed: boolean;
}

export interface ConcurrencyResult {
  users: number;
  quotesCreated: number;
  errors: string[];
  averageTime: number;
  p95Time: number;
  p99Time: number;
  passed: boolean;
}

export interface CorruptedDataResult {
  scenario: string;
  field: string;
  errorHandled: boolean;
  errorMessage: string;
  passed: boolean;
}

export interface SecurityResult {
  scenario: string;
  vulnerability: string;
  exploited: boolean;
  mitigation: string;
  passed: boolean;
}

export interface AuditResult {
  scenario: string;
  hashConsistent: boolean;
  rulesetVersion: string;
  calibrationFactors: number;
  snapshotRebuilt: boolean;
  passed: boolean;
}

export interface FinancialResult {
  scenario: string;
  cost: number;
  price: number;
  margin: number;
  expectedMargin: number;
  difference: number;
  tolerance: number;
  passed: boolean;
}

export interface PDFResult {
  quoteId: string;
  contentMatches: boolean;
  hashMatches: boolean;
  sectionsPresent: number;
  totalSections: number;
  passed: boolean;
}

export interface PerformanceResult {
  iterations: number;
  averageTime: number;
  p95Time: number;
  p99Time: number;
  memoryUsage: number;
  passed: boolean;
}

export interface UsabilityResult {
  step: string;
  completed: boolean;
  timeTaken: number;
  errors: string[];
  passed: boolean;
}