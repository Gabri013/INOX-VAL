// ============================================================
// EQUIPMENT DSL SCHEMA - Serializable schema for equipment templates
// ============================================================

/**
 * Equipment categories available in the system
 */
export type EquipmentCategory = 
  | 'MESA' 
  | 'BANCADA' 
  | 'ARMARIO' 
  | 'ESTANTE' 
  | 'CARRINHO';

/**
 * Main DSL schema for equipment templates
 * This schema is fully serializable and can be stored in Firestore
 */
export interface EquipmentTemplateDSL {
  // Identification
  key: string;                    // ex: "MESA_LISA"
  label: string;                  // ex: "Mesa Lisa"
  category: EquipmentCategory;
  description: string;
  
  // User inputs
  inputs: InputFieldDSL[];
  
  // Derived fields (expressions)
  derived: DerivedFieldDSL[];
  
  // Bill of Materials
  bom: {
    sheetParts: SheetPartDSL[];
    tubes: TubePartDSL[];
    accessories: AccessoryPartDSL[];
  };
  
  // Structural rules
  structuralRules: StructuralRuleDSL[];
  
  // Process rules
  processRules: ProcessRuleDSL[];
  
  // Validations
  validations: ValidationDSL[];
  
  // Metrics model
  metricsModel: MetricsModelDSL;
  
  // Metadata
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Input field definition for user-provided values
 */
export interface InputFieldDSL {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'select';
  unit?: string;
  default?: unknown;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  required?: boolean;
}

/**
 * Derived field calculated from expressions
 */
export interface DerivedFieldDSL {
  key: string;
  expression: string;  // ex: "width - 40"
  description: string;
}

/**
 * Sheet part definition with expressions
 */
export interface SheetPartDSL {
  id: string;
  label: string;
  materialKeyExpr: string;  // ex: "'CHAPA#' + alloy + '#' + thickness + '#' + finish"
  quantityExpr: string;     // ex: "1"
  widthExpr: string;        // ex: "width"
  heightExpr: string;       // ex: "depth"
  thicknessExpr: string;    // ex: "thickness"
  allowRotate: boolean | string;  // can be expression
  grainDirection: 'x' | 'y' | 'none' | string;  // can be expression
  features: PartFeatureDSL[];
  bends: BendDSL[];
}

/**
 * Part feature definition
 */
export interface PartFeatureDSL {
  type: 'hole' | 'cut' | 'notch';
  positionXExpr: string;
  positionYExpr: string;
  widthExpr?: string;
  heightExpr?: string;
  diameterExpr?: string;
}

/**
 * Bend definition
 */
export interface BendDSL {
  angleExpr: string;        // ex: "90"
  positionExpr: string;     // ex: "50"
  direction: 'up' | 'down';
  kFactor?: number;         // default 0.33
}

/**
 * Tube part definition with expressions
 */
export interface TubePartDSL {
  id: string;
  label: string;
  materialKeyExpr: string;
  quantityExpr: string;
  lengthExpr: string;
  profileExpr: string;      // ex: "'40x40x1.2'"
}

/**
 * Accessory part definition
 */
export interface AccessoryPartDSL {
  id: string;
  label: string;
  sku: string;
  quantityExpr: string;
}

/**
 * Structural rule definition
 */
export interface StructuralRuleDSL {
  id: string;
  condition: string;  // ex: "depth > 700"
  action: StructuralAction;
  params: Record<string, unknown>;
  message: string;
  severity: 'warning' | 'error' | 'info';
}

/**
 * Actions that can be taken by structural rules
 */
export type StructuralAction = 
  | 'ADD_TUBE' 
  | 'ADD_SHEET' 
  | 'REQUIRE_MIN_THICKNESS' 
  | 'BLOCK'
  | 'ADD_ACCESSORY';

/**
 * Process rule definition
 */
export interface ProcessRuleDSL {
  processKey: string;
  partId: string;
  condition?: string;
  metricsExpr: Record<string, string>;  // ex: { cutLength: "2 * (width + depth)" }
}

/**
 * Validation definition
 */
export interface ValidationDSL {
  id: string;
  condition: string;
  message: string;
  severity: 'warning' | 'error';
}

/**
 * Metrics model for calculating process metrics
 */
export interface MetricsModelDSL {
  weldMetersExpr?: string;
  finishM2Expr?: string;
  cutMetersExpr?: string;
  bendCountExpr?: string;
}

// ============================================================
// EVALUATED TYPES (Runtime results)
// ============================================================

/**
 * Evaluated sheet part with concrete values
 */
export interface EvaluatedSheetPart {
  id: string;
  label: string;
  materialKey: string;
  quantity: number;
  width: number;
  height: number;
  thickness: number;
  allowRotate: boolean;
  grainDirection: 'x' | 'y' | null;
  features: EvaluatedPartFeature[];
  bends: EvaluatedBend[];
}

/**
 * Evaluated part feature
 */
export interface EvaluatedPartFeature {
  type: 'hole' | 'cut' | 'notch';
  position: { x: number; y: number };
  dimensions: { 
    width: number; 
    height: number; 
    diameter?: number;
  };
}

/**
 * Evaluated bend
 */
export interface EvaluatedBend {
  angle: number;
  position: number;
  direction: 'up' | 'down';
  kFactor: number;
}

/**
 * Evaluated tube part
 */
export interface EvaluatedTubePart {
  id: string;
  label: string;
  materialKey: string;
  quantity: number;
  length: number;
  profile: string;
}

/**
 * Evaluated accessory
 */
export interface EvaluatedAccessoryPart {
  id: string;
  label: string;
  sku: string;
  quantity: number;
}

/**
 * Evaluated BOM
 */
export interface EvaluatedBOM {
  sheetParts: EvaluatedSheetPart[];
  tubes: EvaluatedTubePart[];
  accessories: EvaluatedAccessoryPart[];
}

/**
 * Structural rule result
 */
export interface StructuralRuleResult {
  ruleId: string;
  triggered: boolean;
  action: StructuralAction;
  params: Record<string, unknown>;
  message: string;
  severity: 'warning' | 'error' | 'info';
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
}

/**
 * Complete evaluation result
 */
export interface EvaluationResult {
  templateKey: string;
  inputs: Record<string, unknown>;
  derived: Record<string, unknown>;
  bom: EvaluatedBOM;
  structuralResults: StructuralRuleResult[];
  validation: ValidationResult;
  metrics: {
    weldMeters?: number;
    finishM2?: number;
    cutMeters?: number;
    bendCount?: number;
  };
}

// ============================================================
// PRESET TYPE
// ============================================================

/**
 * Equipment preset for quick selection
 */
export interface EquipmentPreset {
  id: string;
  templateKey: string;
  label: string;
  description?: string;
  values: Record<string, unknown>;
  isDefault?: boolean;
}

// ============================================================
// FIRESTORE DOCUMENT TYPES
// ============================================================

/**
 * Template document in Firestore
 */
export interface TemplateDocument extends EquipmentTemplateDSL {
  id: string;
  companyId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/**
 * Preset document in Firestore
 */
export interface PresetDocument extends EquipmentPreset {
  id: string;
  companyId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Seed result
 */
export interface SeedResult {
  success: boolean;
  templatesCreated: number;
  presetsCreated: number;
  templatesSkipped: number;
  presetsSkipped: number;
  errors: string[];
}
