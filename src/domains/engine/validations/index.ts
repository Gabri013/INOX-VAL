import { EngineResult, ValidationError, ValidationWarning, Material, Process, BOM, SheetPart, TubePart } from '../types';
import { Ruleset, DEFAULT_RULESET } from '../ruleset';

/**
 * Valida um MaterialKey - verifica se existe e está ativo
 */
export function validateMaterial(
  material: Material | undefined,
  quoteDate: string
): EngineResult<Material> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!material) {
    return {
      success: false,
      errors: [{ code: 'MATERIAL_NOT_FOUND', message: 'Material não encontrado', severity: 'error' }],
      warnings: []
    };
  }

  if (!material.active) {
    errors.push({ code: 'MATERIAL_INACTIVE', message: 'Material inativo', severity: 'error' });
  }

  // Verificar preço ativo
  const activePrice = material.priceHistory.find(p => {
    const from = new Date(p.validFrom);
    const to = p.validTo ? new Date(p.validTo) : new Date('2099-12-31');
    const date = new Date(quoteDate);
    return date >= from && date <= to;
  });

  if (!activePrice) {
    warnings.push({ 
      code: 'NO_ACTIVE_PRICE', 
      message: 'Sem preço ativo na data do orçamento',
      severity: 'warning',
      suggestion: 'Cadastrar preço válido'
    });
  } else if (activePrice.validTo) {
    const daysUntilExpiry = Math.ceil((new Date(activePrice.validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 30) {
      warnings.push({
        code: 'PRICE_EXPIRING',
        message: `Preço vence em ${daysUntilExpiry} dias`,
        severity: 'warning'
      });
    }
  }

  return {
    success: errors.length === 0,
    data: material,
    errors,
    warnings
  };
}

/**
 * Valida processo - verifica se existe e está ativo
 */
export function validateProcess(process: Process | undefined): EngineResult<Process> {
  if (!process) {
    return {
      success: false,
      errors: [{ code: 'PROCESS_NOT_FOUND', message: 'Processo não encontrado', severity: 'error' }],
      warnings: []
    };
  }

  if (!process.active) {
    return {
      success: false,
      errors: [{ code: 'PROCESS_INACTIVE', message: 'Processo inativo', severity: 'error' }],
      warnings: []
    };
  }

  return { success: true, data: process, errors: [], warnings: [] };
}

/**
 * Valida BOM completa
 */
export function validateBOM(
  bom: BOM,
  materials: Map<string, Material>,
  processes: Map<string, Process>,
  ruleset: Ruleset = DEFAULT_RULESET,
  quoteDate: string
): EngineResult<BOM> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validar materiais das peças
  for (const sheet of bom.sheets) {
    const mat = materials.get(sheet.materialKey);
    const result = validateMaterial(mat, quoteDate);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  for (const tube of bom.tubes) {
    const mat = materials.get(tube.materialKey);
    const result = validateMaterial(mat, quoteDate);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  // Validar processos obrigatórios
  const requiredProcs = ruleset.requiredProcesses;
  
  if (bom.sheets.length > 0) {
    for (const proc of requiredProcs.sheet) {
      if (!bom.processes.includes(proc) && !processes.has(proc)) {
        errors.push({
          code: 'MISSING_REQUIRED_PROCESS',
          message: `Processo obrigatório para chapas: ${proc}`,
          severity: 'error'
        });
      }
    }
  }

  if (bom.tubes.length > 0) {
    for (const proc of requiredProcs.tube) {
      if (!bom.processes.includes(proc) && !processes.has(proc)) {
        errors.push({
          code: 'MISSING_REQUIRED_PROCESS',
          message: `Processo obrigatório para tubos: ${proc}`,
          severity: 'error'
        });
      }
    }
  }

  return {
    success: errors.length === 0,
    data: bom,
    errors,
    warnings
  };
}

/**
 * Valida dimensões de peça
 */
export function validatePartDimensions(part: SheetPart | TubePart): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if ('blank' in part) {
    if (part.blank.widthMm <= 0 || part.blank.heightMm <= 0) {
      warnings.push({
        code: 'INVALID_DIMENSIONS',
        message: 'Dimensões inválidas para blank',
        severity: 'warning',
        field: 'blank'
      });
    }
  }

  return warnings;
}
