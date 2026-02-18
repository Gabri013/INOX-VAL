import { writeProductionReadinessReport } from './report';
import { calculateProductionReadinessScore } from './scoring';
import { AdvancedValidationResult } from './types';
import { validateBoundaryConditions } from './validators/boundary';
import { validateStressNesting } from './validators/stress-nesting';
import { validateTubeNesting } from './validators/tube-nesting';
import { validateRoundingConsistency } from './validators/rounding';
import { validateConcurrency } from './validators/concurrency';
import { validateCorruptedData } from './validators/corrupted-data';
import { validateDeepSecurity } from './validators/security';
import { validateCompleteAudit } from './validators/audit';
import { validateFinancialCrossValidation } from './validators/financial';
import { validatePDFConsistency } from './validators/pdf';
import { validatePerformanceLoop } from './validators/performance';
import { validateRealUsability } from './validators/usability';
import { ValidatorResult } from '../types';

export async function runAdvancedValidations(): Promise<AdvancedValidationResult> {
  const validators = [
    validateBoundaryConditions,
    validateStressNesting,
    validateTubeNesting,
    validateRoundingConsistency,
    validateConcurrency,
    validateCorruptedData,
    validateDeepSecurity,
    validateCompleteAudit,
    validateFinancialCrossValidation,
    validatePDFConsistency,
    validatePerformanceLoop,
    validateRealUsability
  ];

  console.log(`Running ${validators.length} advanced validation tests...`);

  const results = await Promise.all(validators.map(async validator => {
    const startTime = Date.now();
    try {
      console.log(`  - Running: ${validator.name}`);
      const result = await validator();
      const duration = Date.now() - startTime;
      console.log(`  ✅ Completed: ${validator.name} (${duration}ms)`);
      return {
        name: validator.name,
        ...result,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`  ❌ Failed: ${validator.name} (${duration}ms)`);
      return {
        name: validator.name,
        status: 'failed' as const,
        error: error.message || 'Unknown error',
        duration
      };
    }
  }));

  const score = calculateProductionReadinessScore(results);
  const allPass = results.every(r => r.status === 'passed');
  const productionReady = score >= 90;

  const finalResult: AdvancedValidationResult = {
    timestamp: new Date().toISOString(),
    results,
    score,
    allPass,
    productionReady
  };

  // Write report
  writeProductionReadinessReport(finalResult);

  // Print summary
  console.log('\n=== Production Readiness Summary ===');
  console.log(`Total Tests: ${validators.length}`);
  console.log(`Passed: ${results.filter(r => r.status === 'passed').length}`);
  console.log(`Failed: ${results.filter(r => r.status === 'failed').length}`);
  console.log(`Warnings: ${results.filter(r => r.status === 'warning').length}`);
  console.log(`Score: ${score}/100`);
  console.log(`Production Ready: ${productionReady ? '✅ YES' : '❌ NO'}`);

  if (!productionReady) {
    console.log('\n⚠️  System requires improvements to reach production readiness:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  return finalResult;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAdvancedValidations().catch(error => {
    console.error('Error running advanced validations:', error);
    process.exit(1);
  });
}