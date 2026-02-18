import { QuoteSnapshot } from '../engine/types';
import { PurchasePlan, PurchaseItem, SupplierPurchase, PurchaseService, PurchaseRepository } from './types';

export function createPurchaseService(repository: PurchaseRepository): PurchaseService {
  return {
    repository,
    
    async generateFromQuote(snapshot: QuoteSnapshot): Promise<PurchasePlan> {
      const items: PurchaseItem[] = [];
      
      // Consolidar chapas do nesting
      for (const sheet of snapshot.nesting.sheets) {
        const existingItem = items.find(i => i.materialKey === sheet.materialKey);
        
        if (existingItem) {
          existingItem.quantity += sheet.quantity;
        } else {
          items.push({
            materialKey: sheet.materialKey,
            description: `Chapa ${sheet.materialKey}`,
            quantity: sheet.quantity,
            unit: 'chapa',
            estimatedPrice: 0, // TODO: buscar do preço
            currency: 'BRL',
            supplierId: 'DEFAULT'
          });
        }
      }
      
      // Agrupar por fornecedor
      const bySupplier = groupBySupplier(items);
      
      return repository.createPlan({
        createdBy: snapshot.createdBy,
        companyId: snapshot.companyId,
        quoteId: snapshot.id,
        quoteNumber: snapshot.quoteNumber,
        items,
        bySupplier,
        status: 'draft'
      });
    },
    
    exportToCSV(plan: PurchasePlan): string {
      const headers = ['Material', 'Quantidade', 'Unidade', 'Fornecedor', 'Preço Est.'];
      const rows = plan.items.map(item => [
        item.materialKey,
        item.quantity.toString(),
        item.unit,
        item.supplierId,
        item.estimatedPrice.toFixed(2)
      ]);
      
      return [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');
    },
    
    exportToExcel(plan: PurchasePlan): Blob {
      // Placeholder - em produção usar xlsx library
      const csv = this.exportToCSV(plan);
      return new Blob([csv], { type: 'text/csv' });
    }
  };
}

function groupBySupplier(items: PurchaseItem[]): SupplierPurchase[] {
  const groups = new Map<string, PurchaseItem[]>();
  
  for (const item of items) {
    const existing = groups.get(item.supplierId) || [];
    existing.push(item);
    groups.set(item.supplierId, existing);
  }
  
  return Array.from(groups.entries()).map(([supplierId, items]) => ({
    supplierId,
    items,
    totalEstimated: items.reduce((sum, i) => sum + i.estimatedPrice, 0),
    currency: 'BRL'
  }));
}
