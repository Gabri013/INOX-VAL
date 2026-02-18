import { QuoteSnapshot } from '../engine/types';

export interface PurchasePlan {
  id: string;
  createdAt: string;
  createdBy: string;
  companyId: string;
  quoteId: string;
  quoteNumber: string;
  
  // Items consolidados
  items: PurchaseItem[];
  
  // Agrupado por fornecedor
  bySupplier: SupplierPurchase[];
  
  // Status
  status: 'draft' | 'approved' | 'ordered' | 'received';
}

export interface PurchaseItem {
  materialKey: string;
  description: string;
  quantity: number;
  unit: 'chapa' | 'barra' | 'kg' | 'unidade';
  
  // Para chapas
  sheetFormat?: { widthMm: number; heightMm: number };
  
  // Para tubos
  tubeLength?: number;
  
  // Preço estimado
  estimatedPrice: number;
  currency: string;
  supplierId: string;
}

export interface SupplierPurchase {
  supplierId: string;
  supplierName?: string;
  items: PurchaseItem[];
  totalEstimated: number;
  currency: string;
}

export interface PurchaseRepository {
  createPlan(plan: Omit<PurchasePlan, 'id' | 'createdAt'>): Promise<PurchasePlan>;
  getPlan(id: string): Promise<PurchasePlan | undefined>;
  listPlans(companyId: string): Promise<PurchasePlan[]>;
  updatePlanStatus(id: string, status: PurchasePlan['status']): Promise<void>;
}

export interface PurchaseService {
  repository: PurchaseRepository;
  
  // Gerar plano de compras a partir do orçamento
  generateFromQuote(snapshot: QuoteSnapshot): Promise<PurchasePlan>;
  
  // Exportar para CSV
  exportToCSV(plan: PurchasePlan): string;
  
  // Exportar para Excel (contrato)
  exportToExcel(plan: PurchasePlan): Blob;
}
