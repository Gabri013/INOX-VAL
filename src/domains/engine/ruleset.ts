// ============================================================
// RULESET - Configuration rules for the pricing engine
// ============================================================

import { ProcessKey } from './types';

export interface Ruleset {
  version: string;         // "1.0.0"
  
  // Configurações de nesting
  nesting: {
    kerfMm: number;        // default 0.5mm
    marginMm: number;      // default 5mm
    minUtilizationPercent: number;
    allowRotate: boolean;
  };
  
  // Configurações de precificação
  pricing: {
    defaultMarginPercent: number;
    minMarginPercent: number;
    maxDiscountPercent: number;
    overheadPercent: number;
  };
  
  // Tolerâncias
  tolerances: {
    bendKFactor: number;   // default 0.33
    lengthToleranceMm: number;
    angleToleranceDeg: number;
  };
  
  // Processos obrigatórios por tipo
  requiredProcesses: {
    sheet: ProcessKey[];
    tube: ProcessKey[];
    accessory: ProcessKey[];
  };
}

export const DEFAULT_RULESET: Ruleset = {
  version: "1.0.0",
  nesting: {
    kerfMm: 0.5,
    marginMm: 5,
    minUtilizationPercent: 70,
    allowRotate: true
  },
  pricing: {
    defaultMarginPercent: 25,
    minMarginPercent: 10,
    maxDiscountPercent: 15,
    overheadPercent: 10
  },
  tolerances: {
    bendKFactor: 0.33,
    lengthToleranceMm: 1,
    angleToleranceDeg: 2
  },
  requiredProcesses: {
    sheet: ['CORTE_LASER', 'DOBRA', 'MONTAGEM', 'EMBALAGEM'],
    tube: ['CORTE_TUBO', 'SOLDA_TIG', 'MONTAGEM', 'EMBALAGEM'],
    accessory: ['MONTAGEM', 'EMBALAGEM']
  }
};

// Helper function to get required processes for a material kind
export function getRequiredProcesses(kind: 'sheet' | 'tube' | 'accessory'): ProcessKey[] {
  return DEFAULT_RULESET.requiredProcesses[kind];
}

// Helper to validate ruleset version compatibility
export function isRulesetCompatible(version: string): boolean {
  const [major] = version.split('.').map(Number);
  const [defaultMajor] = DEFAULT_RULESET.version.split('.').map(Number);
  return major === defaultMajor;
}
