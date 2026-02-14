export type MaterialNameNormalized =
  | "#304"
  | "#430"
  | "#316"
  | "GALV"
  | "ALUZINC"
  | "ALUMINIO"
  | "ACO"
  | "INOX"
  | "OUTRO";

export type ProcessCategory = "sheet" | "tube" | "purchase" | "other";

export type MaterialKind = "sheet_metal" | "tube_profile" | "non_metal" | "unknown";

export type RouteDecision =
  | "sheet_area"
  | "tube_pending"
  | "purchase_excluded"
  | "other_excluded"
  | "sheet_missing_data";

export type OpItemPendingCode =
  | "missing_qty"
  | "missing_x"
  | "missing_y"
  | "missing_material"
  | "missing_thickness"
  | "process_material_conflict";

export interface ProcessRule {
  id?: string;
  processNamePattern: string;
  category: ProcessCategory;
  confidence?: number;
  priority?: number;
  active?: boolean;
}

export interface ProcessCategoryResolution {
  category: ProcessCategory;
  confidence: number;
  matchedPattern?: string;
}

export interface MaterialClassification {
  kind: MaterialKind;
  materialName: MaterialNameNormalized | null;
  thicknessMm: number | null;
  rawMaterialCode: string | null;
  confidence: number;
}

export interface OpItemClassificationResult {
  rowIndex: number;
  processCategory: ProcessCategory;
  processConfidence: number;
  materialKind: MaterialKind;
  materialConfidence: number;
  finalCategory: ProcessCategory;
  decision: RouteDecision;
  conflict?: string;
}

export interface OpNormalizedItem {
  rowIndex: number;
  partCode: string;
  description: string;
  qty: number;
  qtyOriginal: number | null;
  qtyTotalOriginal: number | null;
  blankX: number | null;
  blankY: number | null;
  process: string;
  materialRaw: string;
  rawMaterialCode: string | null;
  materialKind: MaterialKind;
  materialName: MaterialNameNormalized | null;
  thicknessMm: number | null;
  pending: OpItemPendingCode[];
}

export interface OpNormalizationSummary {
  totalRows: number;
  parsedItems: number;
  pendingItems: number;
  rowsWithXy: number;
  rowsWithMaterialThickness: number;
}

export interface OpNormalizationResult {
  sheetName: string;
  headerRowIndex: number;
  items: OpNormalizedItem[];
  summary: OpNormalizationSummary;
}

export interface SheetSpec {
  id: string;
  materialName: MaterialNameNormalized;
  thicknessMm: number;
  widthMm: number;
  heightMm: number;
  costPerSheet: number;
  defaultScrapPct: number;
  defaultEfficiency: number;
  materialKey?: string;
  empresaId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface SheetEstimationOverride {
  scrapPct?: number;
  efficiency?: number;
}

export type SheetPendingCode =
  | "missing_xy"
  | "missing_material"
  | "missing_thickness"
  | "missing_sheet_spec"
  | "process_material_conflict"
  | "tube_not_implemented"
  | "purchase_item_no_cost";

export interface SheetEstimationPending {
  code: SheetPendingCode;
  message: string;
  rowIndex?: number;
  groupKey?: string;
  critical: boolean;
}

export interface SheetExcludedItem {
  rowIndex: number;
  reason: string;
  item: OpNormalizedItem;
}

export interface SheetEstimationGroup {
  groupKey: string;
  materialName: MaterialNameNormalized;
  thicknessMm: number;
  itemCount: number;
  totalQty: number;
  areaTotalMm2: number;
  areaTotalM2: number;
  sheetWidthMm: number;
  sheetHeightMm: number;
  sheetAreaMm2: number;
  costPerSheet: number;
  scrapPct: number;
  efficiency: number;
  estimatedSheets: number;
  materialCost: number;
}

export interface SheetEstimationResult {
  includedItems: OpNormalizedItem[];
  excludedItems: SheetExcludedItem[];
  classificationResults: OpItemClassificationResult[];
  pending: SheetEstimationPending[];
  groups: SheetEstimationGroup[];
  totals: {
    areaTotalMm2: number;
    areaTotalM2: number;
    estimatedSheets: number;
    materialCost: number;
  };
  canFinalize: boolean;
}

export interface OpPricingTotals {
  custoMaterialChapa: number;
  demaisCustos: number;
  subtotalBase: number;
  margemPct: number;
  margemValor: number;
  impostosPct: number;
  impostosValor: number;
  precoFinal: number;
}

export interface OpPricingSnapshot {
  fileName?: string;
  sheetName?: string;
  items: OpNormalizedItem[];
  classificationResults: OpItemClassificationResult[];
  processRulesUsed?: ProcessRule[];
  overrides: SheetEstimationOverride;
  breakdown: SheetEstimationGroup[];
  excludedItems: SheetExcludedItem[];
  pending: SheetEstimationPending[];
  totals: OpPricingTotals;
  canFinalize: boolean;
}
