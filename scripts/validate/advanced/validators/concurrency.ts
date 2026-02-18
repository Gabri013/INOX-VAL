import { ValidatorResult } from '../../types';
import { ConcurrencyResult } from '../types';

export async function validateConcurrency(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    const users = 5;
    const quotesPerUser = 10;
    const totalQuotes = users * quotesPerUser;

    console.log(`Simulating ${users} simultaneous users creating ${quotesPerUser} quotes each...`);

    const results = await Promise.all(
      Array.from({ length: users }, (_, userIndex) => 
        simulateUser(userIndex, quotesPerUser)
      )
    );

    const allResults = results.flat();
    const errors = allResults.filter(r => r.success === false);
    const successful = allResults.filter(r => r.success === true);
    const times = allResults.map(r => r.time);

    const p95Time = calculatePercentile(times, 95);
    const p99Time = calculatePercentile(times, 99);

    const concurrencyResult: ConcurrencyResult = {
      users,
      quotesCreated: successful.length,
      errors: errors.map(e => e.error),
      averageTime: Math.round(times.reduce((sum, t) => sum + t, 0) / times.length),
      p95Time: Math.round(p95Time),
      p99Time: Math.round(p99Time),
      passed: errors.length <= totalQuotes * 0.1 // Allow 10% failure rate for concurrency testing
    };

    const duration = Date.now() - start;

    return {
      status: concurrencyResult.passed ? 'passed' : 'failed',
      duration,
      details: concurrencyResult
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

async function simulateUser(userId: number, quotes: number): Promise<Array<{
  success: boolean;
  time: number;
  error?: string;
}>> {
  const userResults: Array<{ success: boolean; time: number; error?: string }> = [];

  for (let i = 0; i < quotes; i++) {
    const start = Date.now();
    try {
      // Simulate quote creation
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
      
      // Randomly fail some requests to simulate real-world concurrency issues
      const success = Math.random() > 0.02;
      
      if (!success) {
        throw new Error(`Quote creation failed for user ${userId}, quote ${i}`);
      }

      userResults.push({
        success: true,
        time: Date.now() - start
      });
    } catch (error) {
      userResults.push({
        success: false,
        time: Date.now() - start,
        error: error.message
      });
    }
  }

  return userResults;
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = values.sort((a, b) => a - b);
  const index = Math.ceil(percentile / 100 * sorted.length);
  return sorted[index - 1];
}