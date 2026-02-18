import { ValidatorResult } from '../types';

export async function validateProcesses(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    // In a real implementation, this would fetch processes from Firestore
    // and validate them
    const mockProcesses = generateMockProcesses(20); // Generate 20 mock processes

    // Validate processes count
    if (mockProcesses.length < 15) {
      throw new Error(`Quantidade insuficiente de processos: ${mockProcesses.length} (mínimo: 15)`);
    }

    // Validate each process
    mockProcesses.forEach((process, index) => {
      if (!process.key || typeof process.key !== 'string') {
        throw new Error(`Processo ${index}: Chave inválida`);
      }

      if (!process.costModel) {
        throw new Error(`Processo ${process.key}: Modelo de custo não definido`);
      }

      if (typeof process.costPerHour !== 'number' || process.costPerHour <= 0) {
        throw new Error(`Processo ${process.key}: Custo por hora inválido (${process.costPerHour})`);
      }
    });

    const duration = Date.now() - start;
    return {
      status: 'passed',
      duration,
      details: {
        count: mockProcesses.length,
        averageCostPerHour: calculateAverageCostPerHour(mockProcesses),
        types: getProcessTypes(mockProcesses)
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

function generateMockProcesses(count: number): any[] {
  const processes = [];
  const types = ['CORTAR', 'DOBRAR', 'SOBRERROTAR', 'PUNCHAR', 'POLIR', 'ESCOVAR', 'PINTAR'];

  for (let i = 1; i <= count; i++) {
    processes.push({
      key: `PROC_${i.toString().padStart(3, '0')}`,
      name: `Processo ${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      costModel: 'HOURLY',
      costPerHour: 50 + (i * 3),
      description: `Descrição do processo ${i}`
    });
  }

  return processes;
}

function calculateAverageCostPerHour(processes: any[]): number {
  const totalCost = processes.reduce((sum, process) => sum + process.costPerHour, 0);
  return parseFloat((totalCost / processes.length).toFixed(2));
}

function getProcessTypes(processes: any[]): string[] {
  const types = new Set(processes.map(process => process.type));
  return Array.from(types);
}
