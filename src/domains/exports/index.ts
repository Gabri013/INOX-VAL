import { QuoteSnapshot } from '../engine/types';
import { PurchasePlan } from '../purchasing/types';
import { ProductionOrder } from '../production/types';

/**
 * Exporta orçamento para JSON
 */
export function exportQuoteToJSON(snapshot: QuoteSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Exporta orçamento para CSV
 */
export function exportQuoteToCSV(snapshot: QuoteSnapshot): string {
  const headers = [
    'Item',
    'Material',
    'Quantidade',
    'Largura (mm)',
    'Altura (mm)',
    'Processos'
  ];
  
  const rows: string[][] = [];
  
  // Chapas
  for (const sheet of snapshot.bom.sheets) {
    rows.push([
      sheet.id,
      sheet.materialKey,
      sheet.quantity.toString(),
      sheet.blank.widthMm.toString(),
      sheet.blank.heightMm.toString(),
      snapshot.bom.processes.join('; ')
    ]);
  }
  
  // Tubos
  for (const tube of snapshot.bom.tubes) {
    rows.push([
      tube.id,
      tube.materialKey,
      tube.quantity.toString(),
      tube.profile.widthMm.toString(),
      tube.profile.heightMm.toString(),
      snapshot.bom.processes.join('; ')
    ]);
  }
  
  return [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
}

/**
 * Exporta plano de compras para CSV
 */
export function exportPurchasePlanToCSV(plan: PurchasePlan): string {
  const headers = [
    'Material',
    'Descrição',
    'Quantidade',
    'Unidade',
    'Fornecedor',
    'Preço Estimado'
  ];
  
  const rows = plan.items.map(item => [
    item.materialKey,
    item.description,
    item.quantity.toString(),
    item.unit,
    item.supplierId,
    item.estimatedPrice.toFixed(2)
  ]);
  
  return [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
}

/**
 * Exporta ordem de produção para CSV
 */
export function exportProductionOrderToCSV(order: ProductionOrder): string {
  const headers = [
    'OP',
    'Cliente',
    'Status',
    'Peça',
    'Material',
    'Qtd',
    'Processos Concluídos'
  ];
  
  const rows = order.parts.map(part => [
    order.orderNumber,
    order.customerName,
    order.status,
    part.description,
    part.materialKey,
    part.quantity.toString(),
    part.completedProcesses.join('; ')
  ]);
  
  return [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

/**
 * Export helpers
 */
export const exporters = {
  quote: {
    toJSON: exportQuoteToJSON,
    toCSV: exportQuoteToCSV,
  },
  purchase: {
    toCSV: exportPurchasePlanToCSV,
  },
  production: {
    toCSV: exportProductionOrderToCSV,
  }
};