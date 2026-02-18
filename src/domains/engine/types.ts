// ============================================================
// ENGINE TYPES - Core type definitions for the INOX-VAL pricing engine
// ============================================================

// 2.1 MaterialKey (chave única)
// Formato: "CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X"
// Tipos: sheet, tube, accessory, other

export type MaterialKind = 'sheet' | 'tube' | 'accessory' | 'other';

export interface MaterialKey {
  kind: MaterialKind;
  alloy: string;           // 304, 316L, etc
  thicknessMm?: number;   // para chapas
  finish: string;          // polido, escovado, 2B
  format?: {              // para chapas
    widthMm: number;
    heightMm: number;
    supplierFormatName: string;
    grainDirection?: 'x' | 'y';
  };
  tubeProfile?: {         // para tubos
    widthMm: number;
    heightMm: number;
    thicknessMm: number;
    lengthMm: number;     // barra 6m = 6000
  };
  supplierId: string;
}

/**
 * Parse a material key string into a MaterialKey object
 * @param key - Material key in format "KIND#ALLOY#THICKNESS#FINISH#FORMAT#SUPPLIER"
 * @returns MaterialKey object
 */
export function parseMaterialKey(key: string): MaterialKey {
  const parts = key.split('#');
  
  if (parts.length < 2) {
    throw new Error(`Invalid material key format: ${key}`);
  }

  const kind = parts[0].toLowerCase() as MaterialKind;
  
  if (!['sheet', 'tube', 'accessory', 'other'].includes(kind)) {
    throw new Error(`Invalid material kind: ${parts[0]}`);
  }

  const materialKey: MaterialKey = {
    kind,
    alloy: parts[1],
    finish: parts[3] || '2B',
    supplierId: parts[5] || 'DEFAULT'
  };

  // Parse sheet format
  if (kind === 'sheet') {
    materialKey.thicknessMm = parseFloat(parts[2]) || undefined;
    if (parts[4]) {
      const [width, height] = parts[4].split('x').map(Number);
      materialKey.format = {
        widthMm: width,
        heightMm: height,
        supplierFormatName: parts[4],
        grainDirection: parts[4].includes('_X') ? 'x' : parts[4].includes('_Y') ? 'y' : undefined
      };
    }
  }

  // Parse tube profile
  if (kind === 'tube') {
    if (parts[4]) {
      const [width, height, thickness, length] = parts[4].split('x').map(Number);
      materialKey.tubeProfile = {
        widthMm: width,
        heightMm: height,
        thicknessMm: thickness,
        lengthMm: length
      };
    }
  }

  return materialKey;
}

/**
 * Format a MaterialKey object into a string key
 * @param key - MaterialKey object
 * @returns Formatted key string
 */
export function formatMaterialKey(key: MaterialKey): string {
  const parts: string[] = [
    key.kind.toUpperCase(),
    key.alloy,
    key.thicknessMm?.toString() || '',
    key.finish
  ];

  if (key.kind === 'sheet' && key.format) {
    parts.push(`${key.format.widthMm}x${key.format.heightMm}`);
  } else if (key.kind === 'tube' && key.tubeProfile) {
    const { widthMm, heightMm, thicknessMm, lengthMm } = key.tubeProfile;
    parts.push(`${widthMm}x${heightMm}x${thicknessMm}x${lengthMm}`);
  }

  parts.push(key.supplierId);

  return parts.filter(p => p).join('#');
}

// 2.2 ProcessKey
export type ProcessKey = 
  | 'CORTE_LASER' 
  | 'CORTE_GUILHOTINA' 
  | 'CORTE_PLASMA'
  | 'DOBRA' 
  | 'SOLDA_TIG' 
  | 'SOLDA_MIG' 
  | 'SOLDA_LASER'
  | 'POLIMENTO' 
  | 'ESCOVADO' 
  | 'PASSIVACAO'
  | 'MONTAGEM' 
  | 'EMBALAGEM' 
  | 'FRETE'
  | 'CORTE_TUBO' 
  | 'DOBRA_TUBO';

// 2.3 BOM Types
export interface SheetPart {
  id: string;
  materialKey: string;
  quantity: number;
  blank: { widthMm: number; heightMm: number };
  allowRotate: boolean;
  grainDirection?: 'x' | 'y' | null;
  features: PartFeature[];
  bends: Bend[];
}

export interface PartFeature {
  type: 'hole' | 'cut' | 'notch';
  position: { x: number; y: number };
  dimensions: { 
    widthMm: number; 
    heightMm: number; 
    diameterMm?: number 
  };
}

export interface Bend {
  angle: number;           // graus (90, 45, etc)
  position: number;        // mm from edge
  direction: 'up' | 'down';
  kFactor?: number;        // default 0.33
}

export interface TubePart {
  id: string;
  materialKey: string;
  quantity: number;
  lengthMm: number;
  profile: { widthMm: number; heightMm: number; thicknessMm: number };
}

export interface AccessoryPart {
  id: string;
  sku: string;
  materialKey: string;
  quantity: number;
  unitCost?: number;       // custo direto por unidade
}

export interface BOM {
  sheets: SheetPart[];
  tubes: TubePart[];
  accessories: AccessoryPart[];
  processes: ProcessKey[]; // roteiro mínimo
}

// 2.4 Quote Snapshot
export interface QuoteSnapshot {
  id: string;
  version: string;
  createdAt: string;       // ISO
  createdBy: string;
  companyId: string;
  
  // Dados do orçamento
  customerId: string;
  customerName: string;
  quoteNumber: string;
  validUntil: string;
  
  // BOM usado
  bom: BOM;
  
  // MaterialKeys com preços
  materialPrices: {
    key: string;
    price: number;
    currency: string;
    supplierId: string;
    validFrom: string;
    validTo: string;
  }[];
  
  // Regras usadas
  rulesetVersion: string;
  
  // Nesting
  nesting: NestingResult;
  
  // Custos
  costs: {
    materialUsed: number;
    materialLost: number;
    materialTotal: number;
    processTotal: number;
    overhead: number;
    total: number;
  };
  
  // Precificação
  pricing: {
    method: string;
    margin: number;
    discount: number;
    finalPrice: number;
  };
  
  // Auditoria
  hash: string;            // SHA256 do snapshot
  auditEvents: AuditEvent[];
}

export interface NestingResult {
  sheets: {
    materialKey: string;
    quantity: number;
    layout: PlacedPart[];
    utilization: number;   // %
    wasteKg: number;
    wasteValue: number;
  }[];
  totalUtilization: number;
  totalWasteKg: number;
  totalWasteValue: number;
}

export interface PlacedPart {
  partId: string;
  x: number;
  y: number;
  rotation: number;        // 0 ou 90
}

export interface AuditEvent {
  timestamp: string;
  action: string;
  userId: string;
  details: Record<string, unknown>;
}

// ============================================================
// Additional utility types
// ============================================================

export interface MaterialPrice {
  key: string;
  price: number;
  currency: string;
  supplierId: string;
  validFrom: string;
  validTo: string;
}

export interface ProcessCost {
  processKey: ProcessKey;
  costPerUnit: number;
  unit: 'mm' | 'm' | 'kg' | 'piece' | 'hour';
  minimumCost?: number;
  setupCost?: number;
}

export interface CompanySettings {
  id: string;
  name: string;
  defaultCurrency: string;
  defaultRulesetVersion: string;
  defaultMarginPercent: number;
}

// ============================================================
// 2.1 Engine Result Types (errors, warnings, result wrapper)
// ============================================================

export interface EngineResult<T> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: Record<string, unknown>;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'error';
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  severity: 'warning';
  suggestion?: string;
}

// ============================================================
// 2.2 Pricing Types
// ============================================================

export type PricingMethod = 'markup' | 'target-margin' | 'minimum-profit' | 'max-discount';

export interface PricingInput {
  materialCost: number;
  processCost: number;
  overheadPercent: number;
  method: PricingMethod;
  targetMargin?: number;
  minProfit?: number;
  discount?: number;
}

export interface PricingOutput {
  totalCost: number;
  targetPrice: number;
  minPrice: number;
  appliedMethod: PricingMethod;
  marginResult: number;
  discountApplied: number;
  warnings: ValidationWarning[];
}

// ============================================================
// 2.3 Material and Process Types (contracts)
// ============================================================

export interface Material {
  key: string;
  kind: MaterialKind;
  alloy: string;
  thicknessMm?: number;
  finish: string;
  format?: { widthMm: number; heightMm: number; supplierFormatName: string; grainDirection?: 'x' | 'y' };
  tubeProfile?: { widthMm: number; heightMm: number; thicknessMm: number; lengthMm: number };
  supplierId: string;
  densityKgM3: number;
  active: boolean;
  priceHistory: PriceRecord[];
}

export interface PriceRecord {
  currency: string;
  pricePerKg?: number;
  pricePerSheet?: number;
  pricePerMeter?: number;
  supplierId: string;
  validFrom: string;
  validTo?: string;
  updatedAt: string;
}

export interface Process {
  key: ProcessKey;
  label: string;
  active: boolean;
  costModel: {
    setupMinutes: number;
    costPerHour: number;
    costPerUnit?: number;
    costPerMeter?: number;
    costPerBend?: number;
    costPerM2?: number;
  };
  capacityModel?: {
    unitsPerDay?: number;
    minutesPerDay?: number;
  };
}
