// ============================================================
// QUOTE TYPES - Types for quote repository and service
// ============================================================

import { QuoteSnapshot } from '../engine/types';

export interface QuoteRepository {
  // Drafts
  createDraft(draft: Partial<QuoteSnapshot>): Promise<QuoteSnapshot>;
  updateDraft(id: string, updates: Partial<QuoteSnapshot>): Promise<QuoteSnapshot>;
  getDraft(id: string): Promise<QuoteSnapshot | undefined>;
  listDrafts(companyId: string): Promise<QuoteSnapshot[]>;
  deleteDraft(id: string): Promise<void>;
  
  // Finalized
  finalize(draft: QuoteSnapshot): Promise<QuoteSnapshot>;
  getSnapshot(id: string): Promise<QuoteSnapshot | undefined>;
  listFinalized(companyId: string): Promise<QuoteSnapshot[]>;
  
  // Rebuild
  rebuild(id: string): Promise<{
    snapshot: QuoteSnapshot;
    differences: Array<{ field: string; original: number; recalculated: number }>;
  }>;
}

export interface QuoteService {
  repository: QuoteRepository;
  
  // Workflow
  createQuote(input: CreateQuoteInput): Promise<QuoteSnapshot>;
  updateQuote(id: string, updates: Partial<QuoteSnapshot>): Promise<QuoteSnapshot>;
  finalizeQuote(id: string): Promise<QuoteSnapshot>;
  
  // Validation
  canFinalize(snapshot: QuoteSnapshot): { can: boolean; reasons: string[] };
  
  // Export
  exportToJSON(snapshot: QuoteSnapshot): string;
  exportToCSV(snapshot: QuoteSnapshot): string;
}

export interface CreateQuoteInput {
  companyId: string;
  customerId: string;
  customerName: string;
  bom: QuoteSnapshot['bom'];
  validUntil?: string;
}

/**
 * Status do orçamento
 */
export type QuoteStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'converted';

/**
 * Filtros para listagem de orçamentos
 */
export interface QuoteFilters {
  status?: QuoteStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Resultado de validação de orçamento
 */
export interface QuoteValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string; suggestion?: string }>;
}

/**
 * Dados de exportação de orçamento
 */
export interface QuoteExportData {
  quoteNumber: string;
  customerName: string;
  validUntil: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  materialCost: number;
  processCost: number;
  overhead: number;
  totalCost: number;
  margin: number;
  finalPrice: number;
}

/**
 * Histórico de versões do orçamento
 */
export interface QuoteVersionHistory {
  quoteId: string;
  versions: Array<{
    version: number;
    snapshot: QuoteSnapshot;
    changedAt: string;
    changedBy: string;
    changeDescription: string;
  }>;
}

/**
 * Comparação entre versões
 */
export interface QuoteDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: 'added' | 'removed' | 'modified';
}

/**
 * Calcula diferenças entre dois snapshots
 */
export function diffSnapshots(
  oldSnapshot: QuoteSnapshot,
  newSnapshot: QuoteSnapshot
): QuoteDiff[] {
  const diffs: QuoteDiff[] = [];
  
  // Comparar preços
  if (oldSnapshot.pricing.finalPrice !== newSnapshot.pricing.finalPrice) {
    diffs.push({
      field: 'pricing.finalPrice',
      oldValue: oldSnapshot.pricing.finalPrice,
      newValue: newSnapshot.pricing.finalPrice,
      changeType: 'modified'
    });
  }
  
  // Comparar margem
  if (oldSnapshot.pricing.margin !== newSnapshot.pricing.margin) {
    diffs.push({
      field: 'pricing.margin',
      oldValue: oldSnapshot.pricing.margin,
      newValue: newSnapshot.pricing.margin,
      changeType: 'modified'
    });
  }
  
  // Comparar custos
  if (oldSnapshot.costs.total !== newSnapshot.costs.total) {
    diffs.push({
      field: 'costs.total',
      oldValue: oldSnapshot.costs.total,
      newValue: newSnapshot.costs.total,
      changeType: 'modified'
    });
  }
  
  // Comparar BOM
  const oldSheetCount = oldSnapshot.bom.sheets.length;
  const newSheetCount = newSnapshot.bom.sheets.length;
  if (oldSheetCount !== newSheetCount) {
    diffs.push({
      field: 'bom.sheets.length',
      oldValue: oldSheetCount,
      newValue: newSheetCount,
      changeType: 'modified'
    });
  }
  
  const oldTubeCount = oldSnapshot.bom.tubes.length;
  const newTubeCount = newSnapshot.bom.tubes.length;
  if (oldTubeCount !== newTubeCount) {
    diffs.push({
      field: 'bom.tubes.length',
      oldValue: oldTubeCount,
      newValue: newTubeCount,
      changeType: 'modified'
    });
  }
  
  return diffs;
}
