// ============================================================
// PROCESS COST ENGINE - Calculate process costs for BOM
// ============================================================

import { Process, ProcessKey, EngineResult, ValidationWarning, BOM, SheetPart, TubePart } from '../types';
import { computeCutLengthMm, computeAreaMm2 } from '../geometry';

export interface ProcessCostInput {
  processes: Map<string, Process>;
  bom: BOM;
  sheets: SheetPart[];
  tubes: TubePart[];
}

export interface ProcessCostBreakdown {
  processKey: ProcessKey;
  processLabel: string;
  setupCost: number;
  unitCost: number;
  totalCost: number;
  estimatedMinutes: number;
  details: string;
}

export interface ProcessCostResult {
  breakdown: ProcessCostBreakdown[];
  totalProcessCost: number;
  totalEstimatedMinutes: number;
  warnings: ValidationWarning[];
}

/**
 * Calcula custo de processos para um BOM
 */
export function calculateProcessCost(
  input: ProcessCostInput
): EngineResult<ProcessCostResult> {
  const errors: { code: string; message: string; severity: 'error' }[] = [];
  const warnings: ValidationWarning[] = [];
  const breakdown: ProcessCostBreakdown[] = [];
  
  let totalProcessCost = 0;
  let totalEstimatedMinutes = 0;
  
  // Processar cada processo do BOM
  for (const processKey of input.bom.processes) {
    const process = input.processes.get(processKey);
    
    if (!process) {
      errors.push({
        code: 'PROCESS_NOT_FOUND',
        message: `Processo não encontrado: ${processKey}`,
        severity: 'error'
      });
      continue;
    }
    
    if (!process.active) {
      warnings.push({
        code: 'PROCESS_INACTIVE',
        message: `Processo inativo: ${processKey}`,
        severity: 'warning'
      });
    }
    
    // Calcular custo baseado no tipo de processo
    const costResult = calculateSingleProcessCost(process, input);
    
    breakdown.push({
      processKey,
      processLabel: process.label,
      setupCost: costResult.setupCost,
      unitCost: costResult.unitCost,
      totalCost: costResult.totalCost,
      estimatedMinutes: costResult.estimatedMinutes,
      details: costResult.details
    });
    
    totalProcessCost += costResult.totalCost;
    totalEstimatedMinutes += costResult.estimatedMinutes;
  }
  
  return {
    success: errors.length === 0,
    data: {
      breakdown,
      totalProcessCost,
      totalEstimatedMinutes,
      warnings
    },
    errors,
    warnings
  };
}

/**
 * Calcula custo de um único processo
 */
function calculateSingleProcessCost(
  process: Process,
  input: ProcessCostInput
): {
  setupCost: number;
  unitCost: number;
  totalCost: number;
  estimatedMinutes: number;
  details: string;
} {
  const { costModel } = process;
  
  // Setup cost
  const setupCost = (costModel.setupMinutes / 60) * costModel.costPerHour;
  
  let unitCost = 0;
  let estimatedMinutes = costModel.setupMinutes;
  let details = '';
  
  // Calcular baseado no tipo de processo
  switch (process.key) {
    case 'CORTE_LASER':
    case 'CORTE_PLASMA': {
      // Custo por metro de corte
      let totalCutLengthM = 0;
      for (const sheet of input.sheets) {
        totalCutLengthM += computeCutLengthMm(sheet) / 1000;
      }
      if (costModel.costPerMeter) {
        unitCost = totalCutLengthM * costModel.costPerMeter;
        details = `${totalCutLengthM.toFixed(2)}m de corte`;
      }
      estimatedMinutes += totalCutLengthM * 0.5; // ~2m/min
      break;
    }
    
    case 'CORTE_GUILHOTINA': {
      // Custo por unidade/chapa
      const sheetCount = input.sheets.length;
      if (costModel.costPerUnit) {
        unitCost = sheetCount * costModel.costPerUnit;
        details = `${sheetCount} chapas`;
      }
      estimatedMinutes += sheetCount * 2;
      break;
    }
    
    case 'DOBRA': {
      // Custo por dobra
      let totalBends = 0;
      for (const sheet of input.sheets) {
        totalBends += sheet.bends.length * sheet.quantity;
      }
      if (costModel.costPerBend) {
        unitCost = totalBends * costModel.costPerBend;
        details = `${totalBends} dobras`;
      }
      estimatedMinutes += totalBends * 0.5;
      break;
    }
    
    case 'SOLDA_TIG':
    case 'SOLDA_MIG': {
      // Custo por metro de solda
      let totalWeldLengthM = 0;
      for (const tube of input.tubes) {
        // Estimativa: perímetro do tubo * quantidade
        const perimeter = 2 * (tube.profile.widthMm + tube.profile.heightMm);
        totalWeldLengthM += (perimeter / 1000) * tube.quantity;
      }
      if (costModel.costPerMeter) {
        unitCost = totalWeldLengthM * costModel.costPerMeter;
        details = `${totalWeldLengthM.toFixed(2)}m de solda`;
      }
      estimatedMinutes += totalWeldLengthM * 5; // ~12cm/min
      break;
    }
    
    case 'POLIMENTO':
    case 'ESCOVADO':
    case 'PASSIVACAO': {
      // Custo por m²
      let totalAreaM2 = 0;
      for (const sheet of input.sheets) {
        totalAreaM2 += computeAreaMm2(sheet) / 1_000_000;
      }
      if (costModel.costPerM2) {
        unitCost = totalAreaM2 * costModel.costPerM2;
        details = `${totalAreaM2.toFixed(2)}m²`;
      }
      estimatedMinutes += totalAreaM2 * 10; // ~6m²/hora
      break;
    }
    
    case 'MONTAGEM':
    case 'EMBALAGEM': {
      // Custo por unidade
      const totalUnits = input.sheets.reduce((sum, s) => sum + s.quantity, 0) +
                         input.tubes.reduce((sum, t) => sum + t.quantity, 0);
      if (costModel.costPerUnit) {
        unitCost = totalUnits * costModel.costPerUnit;
        details = `${totalUnits} unidades`;
      }
      estimatedMinutes += totalUnits * 5;
      break;
    }
    
    case 'FRETE': {
      // Custo fixo ou por km
      if (costModel.costPerUnit) {
        unitCost = costModel.costPerUnit;
        details = 'Frete estimado';
      }
      break;
    }
    
    case 'CORTE_TUBO': {
      // Custo por corte de tubo
      const tubeCount = input.tubes.reduce((sum, t) => sum + t.quantity, 0);
      if (costModel.costPerUnit) {
        unitCost = tubeCount * costModel.costPerUnit;
        details = `${tubeCount} cortes de tubo`;
      }
      estimatedMinutes += tubeCount * 2;
      break;
    }
    
    case 'DOBRA_TUBO': {
      // Custo por dobra de tubo
      let totalTubeBends = 0;
      for (const tube of input.tubes) {
        // Assumindo 2 dobras por tubo como estimativa
        totalTubeBends += tube.quantity * 2;
      }
      if (costModel.costPerBend) {
        unitCost = totalTubeBends * costModel.costPerBend;
        details = `${totalTubeBends} dobras de tubo`;
      }
      estimatedMinutes += totalTubeBends * 2;
      break;
    }
    
    case 'SOLDA_LASER': {
      // Custo por metro de solda a laser
      let totalWeldLengthM = 0;
      for (const tube of input.tubes) {
        const perimeter = 2 * (tube.profile.widthMm + tube.profile.heightMm);
        totalWeldLengthM += (perimeter / 1000) * tube.quantity;
      }
      if (costModel.costPerMeter) {
        unitCost = totalWeldLengthM * costModel.costPerMeter * 1.5; // Laser mais caro
        details = `${totalWeldLengthM.toFixed(2)}m de solda laser`;
      }
      estimatedMinutes += totalWeldLengthM * 2; // Laser mais rápido
      break;
    }
    
    default: {
      // Processo genérico - usar custo por hora estimado
      const estimatedHours = 1;
      unitCost = estimatedHours * costModel.costPerHour;
      estimatedMinutes += 60;
      details = 'Tempo estimado';
    }
  }
  
  const totalCost = setupCost + unitCost;
  
  return {
    setupCost,
    unitCost,
    totalCost,
    estimatedMinutes,
    details
  };
}

/**
 * Estima tempo total de processamento em horas
 */
export function estimateProcessingTime(
  processes: Map<string, Process>,
  bom: BOM,
  sheets: SheetPart[],
  tubes: TubePart[]
): number {
  const result = calculateProcessCost({
    processes,
    bom,
    sheets,
    tubes
  });
  
  if (result.success && result.data) {
    return result.data.totalEstimatedMinutes / 60;
  }
  
  return 0;
}