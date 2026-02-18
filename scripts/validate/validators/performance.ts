import { ValidatorResult } from '../types';

export async function validatePerformance(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    // In a real implementation, this would measure calculation performance
    const performanceMetrics = await measurePerformance();

    if (performanceMetrics.averageTime > 600) {
      throw new Error(`Tempo médio de cálculo excedido: ${performanceMetrics.averageTime}ms (limite: 600ms)`);
    }

    if (performanceMetrics.p95Time > 1200) {
      throw new Error(`Tempo P95 de cálculo excedido: ${performanceMetrics.p95Time}ms (limite: 1200ms)`);
    }

    if (performanceMetrics.memoryUsage > 500) {
      throw new Error(`Uso de memória excessivo: ${performanceMetrics.memoryUsage}MB (limite: 500MB)`);
    }

    const duration = Date.now() - start;
    return {
      status: 'passed',
      duration,
      details: performanceMetrics
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

async function measurePerformance(): Promise<{
  averageTime: number;
  p95Time: number;
  memoryUsage: number;
  testCount: number;
}> {
  const testCount = 20;
  const times = [];

  for (let i = 0; i < testCount; i++) {
    const startTime = Date.now();
    
    // Simulate calculation
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 600));
    
    times.push(Date.now() - startTime);
  }

  // Sort times for P95 calculation
  const sortedTimes = [...times].sort((a, b) => a - b);
  const p95Index = Math.ceil(testCount * 0.95) - 1;
  const p95Time = sortedTimes[p95Index];

  const averageTime = parseFloat((times.reduce((sum, time) => sum + time, 0) / testCount).toFixed(2));

  // Mock memory usage
  const memoryUsage = 200 + (Math.random() * 200);

  return {
    averageTime,
    p95Time,
    memoryUsage: parseFloat(memoryUsage.toFixed(2)),
    testCount
  };
}
