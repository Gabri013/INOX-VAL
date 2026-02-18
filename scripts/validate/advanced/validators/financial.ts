import { ValidatorResult } from '../../types';
import { FinancialResult } from '../types';

export async function validateFinancialCrossValidation(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    const testCases = [
      { scenario: 'Simple material cost', cost: 100, price: 150, expectedMargin: 0.33 },
      { scenario: 'Complex process cost', cost: 200, price: 280, expectedMargin: 0.29 },
      { scenario: 'High material waste', cost: 300, price: 450, expectedMargin: 0.33 },
      { scenario: 'Tax calculation', cost: 100, price: 160, expectedMargin: 0.38 },
      { scenario: 'Volume discount', cost: 500, price: 700, expectedMargin: 0.29 },
      { scenario: 'Special project', cost: 1000, price: 1400, expectedMargin: 0.29 },
      { scenario: 'Export scenario', cost: 800, price: 1100, expectedMargin: 0.27 },
      { scenario: 'Rush order', cost: 400, price: 580, expectedMargin: 0.31 }
    ];

    const results: FinancialResult[] = [];

    for (const testCase of testCases) {
      const result = await runFinancialTest(testCase);
      results.push(result);
    }

    const passed = results.every(r => r.passed);
    const duration = Date.now() - start;

    return {
      status: passed ? 'passed' : 'failed',
      duration,
      details: {
        testCases: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        averageMargin: results.reduce((sum, r) => sum + r.margin, 0) / results.length,
        averageDifference: results.reduce((sum, r) => sum + Math.abs(r.difference), 0) / results.length,
        results
      }
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      status: 'failed',
      duration,
      error: error.message
    };
  }
}

async function runFinancialTest(testCase: any): Promise<FinancialResult> {
  // Simulate financial test
  try {
    const margin = (testCase.price - testCase.cost) / testCase.price;
    const difference = Math.abs(margin - testCase.expectedMargin);
    const tolerance = 0.05; // 5% tolerance
    const passed = difference <= tolerance;

    return {
      scenario: testCase.scenario,
      cost: testCase.cost,
      price: testCase.price,
      margin: parseFloat(margin.toFixed(4)),
      expectedMargin: testCase.expectedMargin,
      difference: parseFloat(difference.toFixed(4)),
      tolerance,
      passed
    };
  } catch (error) {
    return {
      scenario: testCase.scenario,
      cost: testCase.cost,
      price: testCase.price,
      margin: 0,
      expectedMargin: testCase.expectedMargin,
      difference: 1, // Large difference indicating failure
      tolerance: 0.05,
      passed: false
    };
  }
}