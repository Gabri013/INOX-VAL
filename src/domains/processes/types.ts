import { Process, ProcessKey } from '../engine/types';

export interface ProcessRepository {
  // CRUD básico
  getProcess(key: ProcessKey): Promise<Process | undefined>;
  listProcesses(filters?: ProcessFilters): Promise<Process[]>;
  createProcess(process: Omit<Process, 'key'> & { key?: ProcessKey }): Promise<Process>;
  updateProcess(key: ProcessKey, updates: Partial<Process>): Promise<Process>;
  deleteProcess(key: ProcessKey): Promise<void>;
  
  // Utilitários
  processKeyExists(key: ProcessKey): Promise<boolean>;
  getRequiredProcessesForBOM(bomType: 'sheet' | 'tube' | 'accessory'): Promise<ProcessKey[]>;
}

export interface ProcessFilters {
  active?: boolean;
  hasSetupCost?: boolean;
  hasHourlyCost?: boolean;
}

export interface ProcessService {
  repository: ProcessRepository;
  
  // Cálculo de custo
  calculateProcessCost(params: {
    process: Process;
    quantity?: number;
    lengthMm?: number;
    areaMm2?: number;
    bendCount?: number;
    estimatedMinutes?: number;
  }): {
    setupCost: number;
    unitCost: number;
    totalCost: number;
    estimatedTime: number;
  };
  
  // Validação
  validateProcessForQuote(processKey: ProcessKey): Promise<{
    valid: boolean;
    process?: Process;
    errors: string[];
  }>;
  
  // Roteiro mínimo
  getMinimumRoute(bomType: 'sheet' | 'tube' | 'accessory', options?: {
    hasBends?: boolean;
    hasWelding?: boolean;
    finishType?: 'polido' | 'escovado' | '2B';
  }): Promise<ProcessKey[]>;
}
