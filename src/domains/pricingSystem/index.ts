// ============================================================
// PRICING SYSTEM - Main export file
// ============================================================

// Types
export * from './pricing.types';

// Templates
export { 
  MESA_LISA, 
  MESA_COM_PRATELEIRA, 
  BANCADA_COM_ESPELHO,
  EQUIPMENT_TEMPLATES,
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory
} from './equipment.templates';

// Structural Rules
export {
  STRUCTURAL_RULES,
  evaluateCondition,
  evaluateRule,
  evaluateAllRules,
  applyRule,
  validateStructuralRules,
  applyStructuralRules
} from './structural.rules';

// Equipment Generator
export {
  validateInputs,
  generateEquipmentBOM,
  generateBOMByKey,
  validateBOM,
  getTotalSheetArea,
  getTotalTubeLength,
  getTotalAccessoryCount,
  getUniqueMaterialKeys,
  getUniqueProcessKeys,
  cloneBOM,
  mergeBOMs
} from './equipment.generator';

// Geometry Pipeline
export {
  runGeometryCalculations,
  computeAreaMm2,
  computeCutLengthMm,
  computeBlank,
  computeSheetMassKg,
  computeTubeMassKg,
  calculateWeldPerimeter,
  calculateTotalBends,
  calculateTotalFinishAreaM2,
  calculateTotalCutLengthM,
  estimateTotalMassKg,
  getPartGeometry
} from './geometry.pipeline';

// Nesting Pipeline
export {
  runNesting,
  prepareNestableParts,
  groupPartsByMaterial,
  getAvailableSheetsForMaterial,
  calculateWastePercent,
  canPartFitOnSheet,
  estimateSheetCount,
  getNestingStats,
  DEFAULT_NESTING_OPTIONS
} from './nesting.pipeline';

// Material Cost
export {
  calculateMaterialCost,
  calculateTubeCost,
  calculateAccessoryCost,
  calculateFullMaterialCost,
  getActivePrice,
  findMaterial,
  getTotalMass,
  getTotalWasteMass,
  calculateAverageUtilization,
  formatCost,
  getAverageCostPerKg
} from './material.cost';

// Process Cost
export {
  calculateProcessCost,
  calculateProcessMetrics,
  getProcessByKey,
  calculateTotalHours,
  getProcessSummary,
  isProcessRequiredForFinish,
  getRequiredProcesses,
  DEFAULT_PROCESS_COSTS
} from './process.cost';

// Pricing Engine
export {
  applyOverhead,
  applyMargin,
  calculateMinPrice,
  generateFinalPrice,
  calculatePricing,
  calculateMarginPercent,
  calculateMarkupPercent,
  marginToMarkup,
  markupToMargin,
  calculatePriceFromMargin,
  calculatePriceFromMarkup,
  validatePrice,
  getPricingSummary,
  calculateBreakEvenPrice,
  calculatePriceRange
} from './pricing.engine';

// Pricing Pipeline
export {
  runPricingPipeline,
  runPricingPipelineByKey,
  quickPricing,
  validatePipelineInputs,
  getPricingSummary as getPipelineSummary,
  exportResultAsJSON,
  getCostBreakdown
} from './pricing.pipeline';

// Snapshot Engine
export {
  createSnapshot,
  verifySnapshot,
  rebuildFromSnapshot,
  serializeSnapshot,
  deserializeSnapshot,
  exportSnapshot,
  downloadSnapshot,
  compareSnapshots,
  createHashFromResult,
  createSimpleHash,
  createSHA256Hash
} from './snapshot.engine';

// Validation Engine
export {
  validatePricingInputs,
  validateMaterials,
  validateProcesses,
  validatePricingResult,
  canFinalize,
  validateBOM as validateBOMFull,
  getValidationSummary,
  hasErrors,
  hasWarnings,
  getErrorMessages,
  getWarningMessages
} from './validation.engine';