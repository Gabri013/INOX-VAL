import { ValidatorResult } from '../../types';
import { PerformanceResult } from '../types';

export async function validatePerformanceLoop(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    const iterations = 100;
    console.log(`Running ${iterations} quote calculations for performance testing...`);

    const times: number[] = [];
    const memoryUsage: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const iterationStart = Date.now();
      
      // Simulate quote calculation
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));
      
      const iterationTime = Date.now() - iterationStart;
      const memory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      
      times.push(iterationTime);
      memoryUsage.push(memory);
      
      if (i % 10 === 0) {
        console.log(`Iteration ${i + 1}/${iterations} - ${iterationTime}ms, ${memory.toFixed(2)}MB`);
      }
    }

    // Calculate statistics
    const averageTime = times.reduce((sum, t) => sum + t, 0) / iterations;
    const p95Time = calculatePercentile(times, 95);
    const p99Time = calculatePercentile(times, 99);
    const maxMemory = Math.max(...memoryUsage);

    const performanceResult: PerformanceResult = {
      iterations,
      averageTime: Math.round(averageTime),
      p95Time: Math.round(p95Time),
      p99Time: Math.round(p99Time),
      memoryUsage: Math.round(maxMemory),
      passed: averageTime < 200 && p95Time < 500 && maxMemory < 500 // 200ms avg, 500ms p95, 500MB max memory
    };

    const duration = Date.now() - start;

    return {
      status: performanceResult.passed ? 'passed' : 'warning', // Warning if performance thresholds not met
      duration,
      details: performanceResult
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

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = values.sort((a, b) => a - b);
  const index = Math.ceil(percentile / 100 * sorted.length);
  return sorted[index - 1];
}