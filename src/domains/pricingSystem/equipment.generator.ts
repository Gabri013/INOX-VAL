// ============================================================
// EQUIPMENT GENERATOR - Generate BOM from templates and inputs
// ============================================================

import {
  EquipmentTemplate,
  EquipmentInputs,
  BOM,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './pricing.types';
import { getTemplate } from './equipment.templates';
import { applyStructuralRules, validateStructuralRules, STRUCTURAL_RULES } from './structural.rules';

// ============================================================
// Input Validation
// ============================================================

/**
 * Validate equipment inputs before BOM generation
 */
export function validateInputs(inputs: EquipmentInputs): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Width validation
  if (inputs.width < 300) {
    errors.push({
      code: 'WIDTH_TOO_SMALL',
      message: 'Largura mínima: 300mm',
      field: 'width'
    });
  }
  if (inputs.width > 3000) {
    errors.push({
      code: 'WIDTH_TOO_LARGE',
      message: 'Largura máxima: 3000mm',
      field: 'width'
    });
  }
  
  // Depth validation
  if (inputs.depth < 300) {
    errors.push({
      code: 'DEPTH_TOO_SMALL',
      message: 'Profundidade mínima: 300mm',
      field: 'depth'
    });
  }
  if (inputs.depth > 1500) {
    errors.push({
      code: 'DEPTH_TOO_LARGE',
      message: 'Profundidade máxima: 1500mm',
      field: 'depth'
    });
  }
  
  // Height validation
  if (inputs.height < 500) {
    errors.push({
      code: 'HEIGHT_TOO_SMALL',
      message: 'Altura mínima: 500mm',
      field: 'height'
    });
  }
  if (inputs.height > 1200) {
    errors.push({
      code: 'HEIGHT_TOO_LARGE',
      message: 'Altura máxima: 1200mm',
      field: 'height'
    });
  }
  
  // Thickness validation
  if (inputs.thickness < 0.8) {
    errors.push({
      code: 'THICKNESS_TOO_SMALL',
      message: 'Espessura mínima: 0.8mm',
      field: 'thickness'
    });
  }
  if (inputs.thickness > 3.0) {
    errors.push({
      code: 'THICKNESS_TOO_LARGE',
      message: 'Espessura máxima: 3.0mm',
      field: 'thickness'
    });
  }
  
  // Finish validation
  const validFinishes = ['POLIDO', 'ESCOVADO', '2B'];
  if (!validFinishes.includes(inputs.finish)) {
    errors.push({
      code: 'INVALID_FINISH',
      message: `Acabamento inválido. Opções: ${validFinishes.join(', ')}`,
      field: 'finish'
    });
  }
  
  // Backsplash height validation (if applicable)
  if (inputs.hasBacksplash && inputs.backsplashHeight !== undefined) {
    if (inputs.backsplashHeight < 100) {
      errors.push({
        code: 'BACKSPLASH_TOO_SMALL',
        message: 'Altura do espelho mínima: 100mm',
        field: 'backsplashHeight'
      });
    }
    if (inputs.backsplashHeight > 600) {
      warnings.push({
        code: 'BACKSPLASH_HIGH',
        message: 'Espelho alto pode requerer reforço adicional',
        field: 'backsplashHeight',
        suggestion: 'Considere adicionar suportes estruturais'
      });
    }
  }
  
  // Width vs thickness relationship
  if (inputs.width > 2000 && inputs.thickness < 1.5) {
    warnings.push({
      code: 'THICKNESS_WARNING',
      message: 'Largura > 2000mm recomenda espessura >= 1.5mm',
      field: 'thickness',
      suggestion: 'Considere aumentar a espessura para maior rigidez'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================
// BOM Generation
// ============================================================

export interface BOMGenerationResult {
  success: boolean;
  bom?: BOM;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  blocked?: boolean;
  blockReason?: string;
}

/**
 * Generate a complete BOM from a template and inputs
 */
export function generateEquipmentBOM(
  template: EquipmentTemplate,
  inputs: EquipmentInputs
): BOMGenerationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Step 1: Validate inputs
  const inputValidation = validateInputs(inputs);
  if (!inputValidation.valid) {
    return {
      success: false,
      errors: inputValidation.errors,
      warnings: inputValidation.warnings
    };
  }
  warnings.push(...inputValidation.warnings);
  
  // Step 2: Validate structural rules
  const allRules = [...STRUCTURAL_RULES, ...template.structuralRules];
  const structuralValidation = validateStructuralRules(allRules, inputs);
  if (!structuralValidation.valid) {
    return {
      success: false,
      errors: structuralValidation.errors,
      warnings: [...warnings, ...structuralValidation.warnings]
    };
  }
  warnings.push(...structuralValidation.warnings);
  
  // Step 3: Generate base BOM from template
  let bom: BOM;
  try {
    bom = template.generateBOM(inputs);
  } catch (error) {
    return {
      success: false,
      errors: [{
        code: 'BOM_GENERATION_FAILED',
        message: `Falha ao gerar BOM: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }],
      warnings
    };
  }
  
  // Step 4: Apply structural rules (add reinforcements, etc.)
  const ruleResult = applyStructuralRules(allRules, bom, inputs);
  bom = ruleResult.bom;
  warnings.push(...ruleResult.warnings);
  
  if (ruleResult.blocked) {
    return {
      success: false,
      blocked: true,
      blockReason: ruleResult.blockReason,
      errors: [{
        code: ruleResult.blockReason || 'BLOCKED',
        message: ruleResult.warnings.find(w => w.code === ruleResult.blockReason)?.message || 'Configuração bloqueada por regra estrutural'
      }],
      warnings
    };
  }
  
  // Step 5: Validate generated BOM
  const bomValidation = validateBOM(bom);
  if (!bomValidation.valid) {
    return {
      success: false,
      errors: bomValidation.errors,
      warnings: [...warnings, ...bomValidation.warnings]
    };
  }
  warnings.push(...bomValidation.warnings);
  
  return {
    success: true,
    bom,
    errors,
    warnings
  };
}

/**
 * Generate BOM by template key
 */
export function generateBOMByKey(
  templateKey: string,
  inputs: EquipmentInputs
): BOMGenerationResult {
  const template = getTemplate(templateKey);
  
  if (!template) {
    return {
      success: false,
      errors: [{
        code: 'TEMPLATE_NOT_FOUND',
        message: `Template não encontrado: ${templateKey}`
      }],
      warnings: []
    };
  }
  
  return generateEquipmentBOM(template, inputs);
}

// ============================================================
// BOM Validation
// ============================================================

/**
 * Validate a generated BOM
 */
export function validateBOM(bom: BOM): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check for empty BOM
  if (bom.sheetParts.length === 0 && bom.tubes.length === 0 && bom.accessories.length === 0) {
    errors.push({
      code: 'EMPTY_BOM',
      message: 'BOM está vazia - nenhum componente definido'
    });
  }
  
  // Validate sheet parts
  for (const sheet of bom.sheetParts) {
    if (sheet.blank.width <= 0 || sheet.blank.height <= 0) {
      errors.push({
        code: 'INVALID_SHEET_DIMENSIONS',
        message: `Chapa ${sheet.id} tem dimensões inválidas`,
        field: `sheetParts.${sheet.id}`
      });
    }
    if (sheet.quantity <= 0) {
      errors.push({
        code: 'INVALID_QUANTITY',
        message: `Chapa ${sheet.id} tem quantidade inválida: ${sheet.quantity}`,
        field: `sheetParts.${sheet.id}`
      });
    }
    if (sheet.thickness <= 0) {
      errors.push({
        code: 'INVALID_THICKNESS',
        message: `Chapa ${sheet.id} tem espessura inválida: ${sheet.thickness}`,
        field: `sheetParts.${sheet.id}`
      });
    }
  }
  
  // Validate tube parts
  for (const tube of bom.tubes) {
    if (tube.length <= 0) {
      errors.push({
        code: 'INVALID_TUBE_LENGTH',
        message: `Tubo ${tube.id} tem comprimento inválido: ${tube.length}`,
        field: `tubes.${tube.id}`
      });
    }
    if (tube.quantity <= 0) {
      errors.push({
        code: 'INVALID_QUANTITY',
        message: `Tubo ${tube.id} tem quantidade inválida: ${tube.quantity}`,
        field: `tubes.${tube.id}`
      });
    }
  }
  
  // Validate accessories
  for (const acc of bom.accessories) {
    if (acc.quantity <= 0) {
      warnings.push({
        code: 'ZERO_ACCESSORY_QUANTITY',
        message: `Acessório ${acc.id} tem quantidade zero`,
        field: `accessories.${acc.id}`
      });
    }
    if (acc.unitCost < 0) {
      errors.push({
        code: 'NEGATIVE_COST',
        message: `Acessório ${acc.id} tem custo negativo: ${acc.unitCost}`,
        field: `accessories.${acc.id}`
      });
    }
  }
  
  // Check for duplicate IDs
  const allIds = [
    ...bom.sheetParts.map(s => s.id),
    ...bom.tubes.map(t => t.id),
    ...bom.accessories.map(a => a.id)
  ];
  const uniqueIds = new Set(allIds);
  if (uniqueIds.size !== allIds.length) {
    const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    errors.push({
      code: 'DUPLICATE_IDS',
      message: `IDs duplicados encontrados: ${[...new Set(duplicates)].join(', ')}`
    });
  }
  
  // Check for processes
  if (bom.processes.length === 0) {
    warnings.push({
      code: 'NO_PROCESSES',
      message: 'Nenhum processo definido no BOM',
      suggestion: 'Adicione processos de fabricação'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================
// BOM Utilities
// ============================================================

/**
 * Get total sheet area in mm²
 */
export function getTotalSheetArea(bom: BOM): number {
  return bom.sheetParts.reduce((total, sheet) => {
    return total + (sheet.blank.width * sheet.blank.height * sheet.quantity);
  }, 0);
}

/**
 * Get total tube length in mm
 */
export function getTotalTubeLength(bom: BOM): number {
  return bom.tubes.reduce((total, tube) => {
    return total + (tube.length * tube.quantity);
  }, 0);
}

/**
 * Get total accessory count
 */
export function getTotalAccessoryCount(bom: BOM): number {
  return bom.accessories.reduce((total, acc) => {
    return total + acc.quantity;
  }, 0);
}

/**
 * Get unique material keys from BOM
 */
export function getUniqueMaterialKeys(bom: BOM): string[] {
  const keys = new Set<string>();
  
  for (const sheet of bom.sheetParts) {
    keys.add(sheet.materialKey);
  }
  for (const tube of bom.tubes) {
    keys.add(tube.materialKey);
  }
  
  return Array.from(keys);
}

/**
 * Get unique process keys from BOM
 */
export function getUniqueProcessKeys(bom: BOM): string[] {
  const keys = new Set<string>();
  
  for (const process of bom.processes) {
    keys.add(process.processKey);
  }
  
  return Array.from(keys);
}

/**
 * Clone a BOM (deep copy)
 */
export function cloneBOM(bom: BOM): BOM {
  return {
    sheetParts: bom.sheetParts.map(s => ({ ...s, blank: { ...s.blank }, features: [...s.features], bends: [...s.bends] })),
    tubes: bom.tubes.map(t => ({ ...t })),
    accessories: bom.accessories.map(a => ({ ...a })),
    processes: bom.processes.map(p => ({ ...p, metrics: { ...p.metrics } }))
  };
}

/**
 * Merge multiple BOMs
 */
export function mergeBOMs(...boms: BOM[]): BOM {
  const merged: BOM = {
    sheetParts: [],
    tubes: [],
    accessories: [],
    processes: []
  };
  
  for (const bom of boms) {
    merged.sheetParts.push(...bom.sheetParts);
    merged.tubes.push(...bom.tubes);
    merged.accessories.push(...bom.accessories);
    merged.processes.push(...bom.processes);
  }
  
  return merged;
}