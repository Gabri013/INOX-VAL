// ============================================================
// STRUCTURAL RULES - Evaluate and apply structural constraints
// ============================================================

import {
  StructuralRule,
  EquipmentInputs,
  BOM,
  TubePart,
  SheetPart,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './pricing.types';

// ============================================================
// Default Structural Rules
// ============================================================

export const STRUCTURAL_RULES: StructuralRule[] = [
  {
    id: 'DEPTH_REINFORCEMENT',
    condition: 'depth > 700',
    action: 'ADD_TUBE',
    params: { type: 'MID_REINF', lengthExpr: 'width - 80', profile: '40x40x1.2' },
    message: 'Profundidade > 700mm requer reforço central'
  },
  {
    id: 'WIDTH_THICKNESS_2000',
    condition: 'width > 2000',
    action: 'REQUIRE_MIN_THICKNESS',
    params: { minThickness: 1.5 },
    message: 'Largura > 2000mm requer espessura mínima 1.5mm'
  },
  {
    id: 'WIDTH_THICKNESS_2500',
    condition: 'width > 2500',
    action: 'REQUIRE_MIN_THICKNESS',
    params: { minThickness: 2.0 },
    message: 'Largura > 2500mm requer espessura mínima 2.0mm'
  },
  {
    id: 'MAX_WIDTH',
    condition: 'width > 3000',
    action: 'BLOCK',
    params: { reason: 'TOO_WIDE' },
    message: 'Largura máxima permitida: 3000mm'
  },
  {
    id: 'MIN_WIDTH',
    condition: 'width < 300',
    action: 'BLOCK',
    params: { reason: 'TOO_NARROW' },
    message: 'Largura mínima permitida: 300mm'
  },
  {
    id: 'MIN_DEPTH',
    condition: 'depth < 300',
    action: 'BLOCK',
    params: { reason: 'TOO_SHALLOW' },
    message: 'Profundidade mínima permitida: 300mm'
  },
  {
    id: 'MIN_HEIGHT',
    condition: 'height < 500',
    action: 'BLOCK',
    params: { reason: 'TOO_SHORT' },
    message: 'Altura mínima permitida: 500mm'
  },
  {
    id: 'MAX_HEIGHT',
    condition: 'height > 1200',
    action: 'BLOCK',
    params: { reason: 'TOO_TALL' },
    message: 'Altura máxima permitida: 1200mm'
  },
  {
    id: 'MIN_THICKNESS',
    condition: 'thickness < 0.8',
    action: 'BLOCK',
    params: { reason: 'TOO_THIN' },
    message: 'Espessura mínima permitida: 0.8mm'
  },
  {
    id: 'MAX_THICKNESS',
    condition: 'thickness > 3.0',
    action: 'BLOCK',
    params: { reason: 'TOO_THICK' },
    message: 'Espessura máxima permitida: 3.0mm'
  },
  {
    id: 'BACKSPLASH_SUPPORT',
    condition: 'backsplashHeight > 500',
    action: 'ADD_TUBE',
    params: { type: 'BACKSPLASH_SUPPORT', lengthExpr: 'backsplashHeight - 50', profile: '30x30x1.0' },
    message: 'Espelho > 500mm requer reforço estrutural'
  }
];

// ============================================================
// Rule Evaluation
// ============================================================

/**
 * Safely evaluates a condition expression against inputs
 * Supports: comparison operators (>, <, >=, <=, ===, !==), logical operators (&&, ||)
 */
export function evaluateCondition(condition: string, inputs: EquipmentInputs): boolean {
  try {
    // Create a safe evaluation context
    const context = {
      width: inputs.width,
      depth: inputs.depth,
      height: inputs.height,
      thickness: inputs.thickness,
      finish: inputs.finish,
      hasShelf: inputs.hasShelf ?? false,
      hasBacksplash: inputs.hasBacksplash ?? false,
      backsplashHeight: inputs.backsplashHeight ?? 0,
      hasCasters: inputs.hasCasters ?? false,
      shelfCount: inputs.shelfCount ?? 0,
      doorCount: inputs.doorCount ?? 0,
      trayCount: inputs.trayCount ?? 0,
    };
    
    // Parse and evaluate the condition safely
    return safeEvaluate(condition, context);
  } catch (error) {
    console.warn(`Failed to evaluate condition: ${condition}`, error);
    return false;
  }
}

/**
 * Safe expression evaluator
 * Only allows simple comparison and logical operations
 */
function safeEvaluate(expression: string, context: Record<string, unknown>): boolean {
  // Tokenize the expression
  const tokens = tokenizeExpression(expression);
  
  // Evaluate tokens
  return evaluateTokens(tokens, context);
}

interface Token {
  type: 'identifier' | 'number' | 'string' | 'operator' | 'comparison' | 'logical' | 'paren';
  value: string | number;
}

function tokenizeExpression(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < expr.length) {
    const char = expr[i];
    
    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    // Number
    if (/[0-9.]/.test(char)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }
    
    // String
    if (char === '"' || char === "'") {
      const quote = char;
      i++;
      let str = '';
      while (i < expr.length && expr[i] !== quote) {
        str += expr[i];
        i++;
      }
      i++; // Skip closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }
    
    // Identifier
    if (/[a-zA-Z_]/.test(char)) {
      let id = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        id += expr[i];
        i++;
      }
      tokens.push({ type: 'identifier', value: id });
      continue;
    }
    
    // Comparison operators
    if (expr.slice(i, i + 2) === '===') {
      tokens.push({ type: 'comparison', value: '===' });
      i += 2;
      continue;
    }
    if (expr.slice(i, i + 2) === '!==') {
      tokens.push({ type: 'comparison', value: '!==' });
      i += 2;
      continue;
    }
    if (expr.slice(i, i + 2) === '>=') {
      tokens.push({ type: 'comparison', value: '>=' });
      i += 2;
      continue;
    }
    if (expr.slice(i, i + 2) === '<=') {
      tokens.push({ type: 'comparison', value: '<=' });
      i += 2;
      continue;
    }
    if (char === '>') {
      tokens.push({ type: 'comparison', value: '>' });
      i++;
      continue;
    }
    if (char === '<') {
      tokens.push({ type: 'comparison', value: '<' });
      i++;
      continue;
    }
    
    // Logical operators
    if (expr.slice(i, i + 2) === '&&') {
      tokens.push({ type: 'logical', value: '&&' });
      i += 2;
      continue;
    }
    if (expr.slice(i, i + 2) === '||') {
      tokens.push({ type: 'logical', value: '||' });
      i += 2;
      continue;
    }
    
    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'paren', value: '(' });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'paren', value: ')' });
      i++;
      continue;
    }
    
    // Unknown character - skip
    i++;
  }
  
  return tokens;
}

function evaluateTokens(tokens: Token[], context: Record<string, unknown>): boolean {
  // Simple recursive descent parser for boolean expressions
  let pos = 0;
  
  function parseOr(): boolean {
    let left = parseAnd();
    while (pos < tokens.length && tokens[pos].value === '||') {
      pos++;
      const right = parseAnd();
      left = left || right;
    }
    return left;
  }
  
  function parseAnd(): boolean {
    let left = parseComparison();
    while (pos < tokens.length && tokens[pos].value === '&&') {
      pos++;
      const right = parseComparison();
      left = left && right;
    }
    return left;
  }
  
  function parseComparison(): boolean {
    const left = parseValue();
    
    if (pos < tokens.length && tokens[pos].type === 'comparison') {
      const op = tokens[pos].value as string;
      pos++;
      const right = parseValue();
      
      switch (op) {
        case '>': return (left as number) > (right as number);
        case '<': return (left as number) < (right as number);
        case '>=': return (left as number) >= (right as number);
        case '<=': return (left as number) <= (right as number);
        case '===': return left === right;
        case '!==': return left !== right;
        default: return false;
      }
    }
    
    return Boolean(left);
  }
  
  function parseValue(): unknown {
    if (pos >= tokens.length) return false;
    
    const token = tokens[pos];
    
    if (token.type === 'paren' && token.value === '(') {
      pos++;
      const result = parseOr();
      if (pos < tokens.length && tokens[pos].value === ')') {
        pos++;
      }
      return result;
    }
    
    if (token.type === 'identifier') {
      pos++;
      return context[token.value as string];
    }
    
    if (token.type === 'number' || token.type === 'string') {
      pos++;
      return token.value;
    }
    
    pos++;
    return false;
  }
  
  return parseOr();
}

/**
 * Evaluate a single rule against inputs
 */
export function evaluateRule(rule: StructuralRule, inputs: EquipmentInputs): boolean {
  return evaluateCondition(rule.condition, inputs);
}

/**
 * Evaluate all rules and return results
 */
export function evaluateAllRules(
  rules: StructuralRule[],
  inputs: EquipmentInputs
): { rule: StructuralRule; triggered: boolean }[] {
  return rules.map(rule => ({
    rule,
    triggered: evaluateRule(rule, inputs)
  }));
}

// ============================================================
// Rule Application
// ============================================================

/**
 * Apply a rule's action to the BOM
 */
export function applyRule(
  rule: StructuralRule,
  bom: BOM,
  inputs: EquipmentInputs
): { bom: BOM; warnings: ValidationWarning[]; blocked: boolean; blockReason?: string } {
  const warnings: ValidationWarning[] = [];
  let blocked = false;
  let blockReason: string | undefined;
  
  switch (rule.action) {
    case 'ADD_TUBE': {
      const tube = createTubeFromRule(rule, inputs);
      if (tube) {
        bom.tubes.push(tube);
        warnings.push({
          code: rule.id,
          message: rule.message,
          suggestion: 'Reforço adicionado automaticamente'
        });
      }
      break;
    }
    
    case 'ADD_SHEET': {
      const sheet = createSheetFromRule(rule, inputs);
      if (sheet) {
        bom.sheetParts.push(sheet);
        warnings.push({
          code: rule.id,
          message: rule.message,
          suggestion: 'Chapa adicional adicionada'
        });
      }
      break;
    }
    
    case 'REQUIRE_MIN_THICKNESS': {
      const minThickness = rule.params.minThickness as number;
      if (inputs.thickness < minThickness) {
        warnings.push({
          code: rule.id,
          message: rule.message,
          suggestion: `Ajuste a espessura para ${minThickness}mm ou superior`
        });
      }
      break;
    }
    
    case 'BLOCK': {
      blocked = true;
      blockReason = rule.params.reason as string;
      warnings.push({
        code: rule.id,
        message: rule.message,
        suggestion: 'Revise as dimensões informadas'
      });
      break;
    }
  }
  
  return { bom, warnings, blocked, blockReason };
}

/**
 * Create a tube part from a rule
 */
function createTubeFromRule(rule: StructuralRule, inputs: EquipmentInputs): TubePart | null {
  const { params } = rule;
  
  // Calculate length from expression
  let length = 0;
  if (params.lengthExpr) {
    length = evaluateLengthExpression(params.lengthExpr as string, inputs);
  }
  
  return {
    id: `${rule.id}_TUBE`,
    label: params.type as string || 'Reforço',
    materialKey: `TUBE#SS304#${params.profile || '40x40x1.2'}#6000#DEFAULT`,
    quantity: 1,
    length,
    profile: params.profile as string || '40x40x1.2'
  };
}

/**
 * Create a sheet part from a rule
 */
function createSheetFromRule(rule: StructuralRule, inputs: EquipmentInputs): SheetPart | null {
  const { params } = rule;
  
  return {
    id: `${rule.id}_SHEET`,
    label: params.type as string || 'Chapa adicional',
    materialKey: `SHEET#SS304#${inputs.thickness}#${inputs.finish}#3000x1250#DEFAULT`,
    quantity: 1,
    blank: {
      width: (params.width as number) || inputs.width,
      height: (params.height as number) || inputs.depth
    },
    thickness: inputs.thickness,
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: []
  };
}

/**
 * Evaluate a length expression like "width - 80"
 */
function evaluateLengthExpression(expr: string, inputs: EquipmentInputs): number {
  const context = {
    width: inputs.width,
    depth: inputs.depth,
    height: inputs.height,
    thickness: inputs.thickness,
    backsplashHeight: inputs.backsplashHeight ?? 0,
  };
  
  // Simple expression parser for arithmetic
  try {
    // Replace identifiers with values
    let evaluated = expr;
    for (const [key, value] of Object.entries(context)) {
      evaluated = evaluated.replace(new RegExp(key, 'g'), String(value));
    }
    
    // Safe evaluation using Function constructor (limited scope)
    // Only allow basic arithmetic
    if (/^[0-9+\-*/\s().]+$/.test(evaluated)) {
      return new Function(`return ${evaluated}`)();
    }
  } catch (error) {
    console.warn(`Failed to evaluate length expression: ${expr}`, error);
  }
  
  return 0;
}

// ============================================================
// Rule Validation
// ============================================================

/**
 * Validate inputs against structural rules
 */
export function validateStructuralRules(
  rules: StructuralRule[],
  inputs: EquipmentInputs
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  for (const rule of rules) {
    const triggered = evaluateRule(rule, inputs);
    
    if (triggered) {
      if (rule.action === 'BLOCK') {
        errors.push({
          code: rule.id,
          message: rule.message,
          field: getFieldFromCondition(rule.condition)
        });
      } else {
        warnings.push({
          code: rule.id,
          message: rule.message,
          suggestion: getSuggestionForRule(rule)
        });
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get the field name from a condition expression
 */
function getFieldFromCondition(condition: string): string {
  const match = condition.match(/([a-zA-Z_]+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Get a helpful suggestion for a rule
 */
function getSuggestionForRule(rule: StructuralRule): string {
  switch (rule.action) {
    case 'ADD_TUBE':
      return 'Reforço será adicionado automaticamente';
    case 'ADD_SHEET':
      return 'Chapa adicional será incluída';
    case 'REQUIRE_MIN_THICKNESS':
      return `Use espessura de ${rule.params.minThickness}mm ou superior`;
    case 'BLOCK':
      return 'Revise as dimensões informadas';
    default:
      return '';
  }
}

/**
 * Apply all applicable rules to a BOM
 */
export function applyStructuralRules(
  rules: StructuralRule[],
  bom: BOM,
  inputs: EquipmentInputs
): { bom: BOM; warnings: ValidationWarning[]; blocked: boolean; blockReason?: string } {
  let currentBom = { ...bom, sheetParts: [...bom.sheetParts], tubes: [...bom.tubes], accessories: [...bom.accessories], processes: [...bom.processes] };
  const allWarnings: ValidationWarning[] = [];
  let blocked = false;
  let blockReason: string | undefined;
  
  for (const rule of rules) {
    const triggered = evaluateRule(rule, inputs);
    
    if (triggered) {
      const result = applyRule(rule, currentBom, inputs);
      currentBom = result.bom;
      allWarnings.push(...result.warnings);
      
      if (result.blocked) {
        blocked = true;
        blockReason = result.blockReason;
        break; // Stop processing if blocked
      }
    }
  }
  
  return { bom: currentBom, warnings: allWarnings, blocked, blockReason };
}