import { ProcessRepository, ProcessService } from './types';
import { Process, ProcessKey } from '../engine/types';

export function createProcessService(repository: ProcessRepository): ProcessService {
  return {
    repository,
    
    calculateProcessCost(params) {
      const { process, quantity = 1, lengthMm, areaMm2, bendCount, estimatedMinutes } = params;
      const { costModel } = process;
      
      // Custo de setup
      const setupCost = (costModel.setupMinutes / 60) * costModel.costPerHour;
      
      // Custo por unidade
      let unitCost = 0;
      
      if (costModel.costPerUnit) {
        unitCost += costModel.costPerUnit * quantity;
      }
      
      if (costModel.costPerMeter && lengthMm) {
        const lengthM = lengthMm / 1000;
        unitCost += costModel.costPerMeter * lengthM * quantity;
      }
      
      if (costModel.costPerBend && bendCount) {
        unitCost += costModel.costPerBend * bendCount * quantity;
      }
      
      if (costModel.costPerM2 && areaMm2) {
        const areaM2 = areaMm2 / 1_000_000;
        unitCost += costModel.costPerM2 * areaM2 * quantity;
      }
      
      // Tempo estimado
      let estimatedTime = costModel.setupMinutes;
      if (estimatedMinutes) {
        estimatedTime += estimatedMinutes * quantity;
      }
      
      const totalCost = setupCost + unitCost;
      
      return {
        setupCost,
        unitCost,
        totalCost,
        estimatedTime
      };
    },
    
    async validateProcessForQuote(processKey: ProcessKey) {
      const errors: string[] = [];
      let process: Process | undefined;
      
      process = await repository.getProcess(processKey);
      if (!process) {
        errors.push(`Processo não encontrado: ${processKey}`);
        return { valid: false, errors };
      }
      
      if (!process.active) {
        errors.push('Processo inativo');
      }
      
      // Verificar se tem custo configurado
      const hasCost = 
        process.costModel.costPerHour > 0 ||
        process.costModel.costPerUnit !== undefined ||
        process.costModel.costPerMeter !== undefined ||
        process.costModel.costPerBend !== undefined ||
        process.costModel.costPerM2 !== undefined;
      
      if (!hasCost) {
        errors.push('Processo sem custo configurado');
      }
      
      return {
        valid: errors.length === 0,
        process,
        errors
      };
    },
    
    async getMinimumRoute(bomType, options = {}) {
      const { hasBends = false, hasWelding = false, finishType } = options;
      
      const baseProcesses = await repository.getRequiredProcessesForBOM(bomType);
      const route: ProcessKey[] = [...baseProcesses];
      
      // Adicionar dobra se necessário
      if (hasBends && !route.includes('DOBRA')) {
        route.push('DOBRA');
      }
      
      // Adicionar solda se necessário
      if (hasWelding && !route.includes('SOLDA_TIG')) {
        route.push('SOLDA_TIG');
      }
      
      // Adicionar acabamento
      if (finishType === 'polido' && !route.includes('POLIMENTO')) {
        route.push('POLIMENTO');
      } else if (finishType === 'escovado' && !route.includes('ESCOVADO')) {
        route.push('ESCOVADO');
      }
      
      return route;
    }
  };
}
