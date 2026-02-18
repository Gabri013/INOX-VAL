import { writeProductionReadinessReport } from './report';
import { AdvancedValidationResult } from './types';

// Test data to see if report generation works
const testResult: AdvancedValidationResult = {
  timestamp: new Date().toISOString(),
  score: 92,
  allPass: false,
  productionReady: true,
  results: [
    {
      name: 'validateBoundaryConditions',
      status: 'passed',
      duration: 2000,
      details: { testCases: 8, passed: 8, failed: 0 }
    },
    {
      name: 'validateStressNesting',
      status: 'passed',
      duration: 3000,
      details: { testCases: 6, passed: 6, failed: 0 }
    },
    {
      name: 'validateTubeNesting',
      status: 'warning',
      duration: 1500,
      details: { testCases: 6, passed: 5, failed: 1 },
      error: 'One test case failed'
    },
    {
      name: 'validateRoundingConsistency',
      status: 'passed',
      duration: 500,
      details: { testCases: 8, passed: 8, failed: 0 }
    },
    {
      name: 'validateConcurrency',
      status: 'passed',
      duration: 4000,
      details: { users: 5, quotesCreated: 50, errors: 2 }
    },
    {
      name: 'validateCorruptedData',
      status: 'passed',
      duration: 1000,
      details: { testCases: 8, passed: 8, failed: 0 }
    },
    {
      name: 'validateDeepSecurity',
      status: 'passed',
      duration: 2500,
      details: { testCases: 8, passed: 8, failed: 0 }
    },
    {
      name: 'validateCompleteAudit',
      status: 'passed',
      duration: 1800,
      details: { testCases: 6, passed: 6, failed: 0 }
    },
    {
      name: 'validateFinancialCrossValidation',
      status: 'passed',
      duration: 1200,
      details: { testCases: 8, passed: 8, failed: 0 }
    },
    {
      name: 'validatePDFConsistency',
      status: 'passed',
      duration: 2000,
      details: { testCases: 8, passed: 8, failed: 0 }
    },
    {
      name: 'validatePerformanceLoop',
      status: 'warning',
      duration: 30000,
      details: { iterations: 100, averageTime: 150, p95Time: 450, memoryUsage: 250 },
      error: 'Performance is acceptable but close to thresholds'
    },
    {
      name: 'validateRealUsability',
      status: 'passed',
      duration: 15000,
      details: { steps: 10, completed: 10, passed: 10, failed: 0 }
    }
  ]
};

console.log('Testing report generation...');
writeProductionReadinessReport(testResult);
console.log('Report generated successfully!');
console.log('File created: PRODUCTION_READINESS_REPORT.md');