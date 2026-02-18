// ============================================================
// AUDIT ENGINE - Audit logging, integrity verification, and rebuild
// ============================================================

import { QuoteSnapshot, AuditEvent } from '../types';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entityType: 'QUOTE' | 'ORDER' | 'MATERIAL' | 'PROCESS';
  entityId: string;
  userId: string;
  companyId: string;
  details: Record<string, unknown>;
}

export interface AuditRepository {
  append(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;
  list(entityType: string, entityId: string): Promise<AuditLog[]>;
  listByCompany(companyId: string, filters?: AuditFilters): Promise<AuditLog[]>;
}

export interface AuditFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
}

/**
 * Adiciona evento de auditoria ao snapshot
 */
export function addAuditEvent(
  snapshot: QuoteSnapshot,
  action: string,
  userId: string,
  details: Record<string, unknown>
): QuoteSnapshot {
  const event: AuditEvent = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details
  };
  
  return {
    ...snapshot,
    auditEvents: [...snapshot.auditEvents, event]
  };
}

/**
 * Verifica integridade do snapshot
 */
export function verifySnapshotIntegrity(
  snapshot: QuoteSnapshot
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verificar hash
  const calculatedHash = recalculateHash(snapshot);
  if (calculatedHash !== snapshot.hash) {
    errors.push('Hash do snapshot não confere');
  }
  
  // Verificar campos obrigatórios
  if (!snapshot.id) errors.push('ID ausente');
  if (!snapshot.createdAt) errors.push('Data de criação ausente');
  if (!snapshot.companyId) errors.push('ID da empresa ausente');
  if (!snapshot.bom) errors.push('BOM ausente');
  
  // Verificar preços
  if (snapshot.materialPrices.length === 0) {
    errors.push('Nenhum preço de material registrado');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Recalcula hash do snapshot
 */
function recalculateHash(snapshot: QuoteSnapshot): string {
  const content = JSON.stringify({
    bom: snapshot.bom,
    materialPrices: snapshot.materialPrices,
    rulesetVersion: snapshot.rulesetVersion,
    nesting: snapshot.nesting,
    costs: snapshot.costs,
    pricing: snapshot.pricing
  });
  
  // Simple hash for cross-platform compatibility
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Reconstrói orçamento a partir do snapshot
 */
export function rebuildFromSnapshot(
  snapshot: QuoteSnapshot,
  materials: Map<string, { key: string; pricePerKg?: number; pricePerSheet?: number }>,
  processes: Map<string, { key: string; costPerHour: number }>
): {
  success: boolean;
  recalculatedCosts: {
    material: number;
    process: number;
    total: number;
  };
  originalCosts: {
    material: number;
    process: number;
    total: number;
  };
  differences: Array<{
    field: string;
    original: number;
    recalculated: number;
    difference: number;
  }>;
} {
  const differences: Array<{ field: string; original: number; recalculated: number; difference: number }> = [];
  
  // Recalcular custo de material
  let recalculatedMaterial = 0;
  for (const price of snapshot.materialPrices) {
    const material = materials.get(price.key);
    if (material?.pricePerKg) {
      // Usar massa do nesting
      const mass = snapshot.nesting.totalWasteKg + 
        (snapshot.costs.materialUsed / (material.pricePerKg || 1));
      recalculatedMaterial += mass * (material.pricePerKg || price.price);
    }
  }
  
  const originalMaterial = snapshot.costs.materialTotal;
  if (Math.abs(recalculatedMaterial - originalMaterial) > 0.01) {
    differences.push({
      field: 'materialCost',
      original: originalMaterial,
      recalculated: recalculatedMaterial,
      difference: recalculatedMaterial - originalMaterial
    });
  }
  
  // Recalcular custo de processo
  let recalculatedProcess = 0;
  for (const procKey of snapshot.bom.processes) {
    const process = processes.get(procKey);
    if (process) {
      // Estimativa simplificada
      recalculatedProcess += process.costPerHour * 0.5; // 30 min estimado
    }
  }
  
  const originalProcess = snapshot.costs.processTotal;
  if (Math.abs(recalculatedProcess - originalProcess) > 0.01) {
    differences.push({
      field: 'processCost',
      original: originalProcess,
      recalculated: recalculatedProcess,
      difference: recalculatedProcess - originalProcess
    });
  }
  
  const recalculatedTotal = recalculatedMaterial + recalculatedProcess + snapshot.costs.overhead;
  const originalTotal = snapshot.costs.total;
  
  return {
    success: differences.length === 0,
    recalculatedCosts: {
      material: recalculatedMaterial,
      process: recalculatedProcess,
      total: recalculatedTotal
    },
    originalCosts: {
      material: originalMaterial,
      process: originalProcess,
      total: originalTotal
    },
    differences
  };
}

/**
 * Gera relatório de auditoria
 */
export function generateAuditReport(
  snapshot: QuoteSnapshot
): {
  summary: {
    quoteId: string;
    createdAt: string;
    createdBy: string;
    status: string;
    totalValue: number;
  };
  timeline: Array<{
    timestamp: string;
    action: string;
    userId: string;
    details: string;
  }>;
  integrity: {
    valid: boolean;
    errors: string[];
  };
} {
  const integrity = verifySnapshotIntegrity(snapshot);
  
  return {
    summary: {
      quoteId: snapshot.id,
      createdAt: snapshot.createdAt,
      createdBy: snapshot.createdBy,
      status: snapshot.pricing.finalPrice > 0 ? 'FINALIZED' : 'DRAFT',
      totalValue: snapshot.pricing.finalPrice
    },
    timeline: snapshot.auditEvents.map(e => ({
      timestamp: e.timestamp,
      action: e.action,
      userId: e.userId,
      details: JSON.stringify(e.details)
    })),
    integrity
  };
}

/**
 * Formata evento de auditoria para exibição
 */
export function formatAuditEvent(event: AuditEvent): string {
  const date = new Date(event.timestamp).toLocaleString('pt-BR');
  return `[${date}] ${event.action} por ${event.userId}: ${JSON.stringify(event.details)}`;
}

/**
 * Filtra eventos de auditoria por ação
 */
export function filterAuditEvents(
  events: AuditEvent[],
  action: string
): AuditEvent[] {
  return events.filter(e => e.action === action);
}

/**
 * Obtém último evento de um tipo específico
 */
export function getLastEvent(
  events: AuditEvent[],
  action: string
): AuditEvent | undefined {
  const filtered = events.filter(e => e.action === action);
  return filtered[filtered.length - 1];
}

/**
 * Valida sequência de eventos de auditoria
 */
export function validateAuditSequence(
  events: AuditEvent[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verificar se existe evento de criação
  const createEvent = events.find(e => e.action === 'QUOTE_CREATED');
  if (!createEvent) {
    errors.push('Snapshot sem evento de criação');
  }
  
  // Verificar ordem cronológica
  for (let i = 1; i < events.length; i++) {
    const prev = new Date(events[i - 1].timestamp);
    const curr = new Date(events[i].timestamp);
    if (curr < prev) {
      errors.push(`Eventos fora de ordem: ${events[i - 1].action} -> ${events[i].action}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Exporta eventos de auditoria para CSV
 */
export function exportAuditEventsToCSV(events: AuditEvent[]): string {
  const header = 'timestamp,action,userId,details\n';
  const rows = events.map(e => 
    `"${e.timestamp}","${e.action}","${e.userId}","${JSON.stringify(e.details).replace(/"/g, '""')}"`
  );
  return header + rows.join('\n');
}
