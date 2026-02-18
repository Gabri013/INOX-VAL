import { QuoteSnapshot, ProcessKey } from '../engine/types';

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  createdBy: string;
  companyId: string;
  
  // Origem
  quoteId?: string;
  quoteNumber?: string;
  
  // Cliente
  customerId: string;
  customerName: string;
  
  // Peças
  parts: ProductionPart[];
  
  // Roteiro de processos
  route: ProcessRoute[];
  
  // Status
  status: ProductionStatus;
  
  // Datas
  estimatedDelivery?: string;
  startedAt?: string;
  completedAt?: string;
}

export type ProductionStatus = 
  | 'pending'
  | 'cutting'
  | 'bending'
  | 'welding'
  | 'finishing'
  | 'assembly'
  | 'completed'
  | 'delivered';

export interface ProductionPart {
  id: string;
  partId: string;
  description: string;
  quantity: number;
  materialKey: string;
  
  // Dimensões
  dimensions: {
    widthMm: number;
    heightMm: number;
    thicknessMm?: number;
  };
  
  // Status da peça
  status: ProductionStatus;
  
  // Processos concluídos
  completedProcesses: ProcessKey[];
}

export interface ProcessRoute {
  processKey: ProcessKey;
  processLabel: string;
  order: number;
  
  // Tempo estimado
  estimatedMinutes: number;
  
  // Status
  status: 'pending' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface ProductionRepository {
  createOrder(order: Omit<ProductionOrder, 'id' | 'orderNumber' | 'createdAt'>): Promise<ProductionOrder>;
  getOrder(id: string): Promise<ProductionOrder | undefined>;
  listOrders(companyId: string, filters?: OrderFilters): Promise<ProductionOrder[]>;
  updateOrderStatus(id: string, status: ProductionStatus): Promise<void>;
  updatePartStatus(orderId: string, partId: string, status: ProductionStatus): Promise<void>;
  completeProcess(orderId: string, processKey: ProcessKey, userId: string): Promise<void>;
}

export interface OrderFilters {
  status?: ProductionStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProductionService {
  repository: ProductionRepository;
  
  // Criar OP a partir do orçamento
  createFromQuote(snapshot: QuoteSnapshot): Promise<ProductionOrder>;
  
  // Atualizar status
  startProduction(orderId: string): Promise<void>;
  completeProduction(orderId: string): Promise<void>;
  
  // Relatórios
  getProductionMetrics(companyId: string): Promise<ProductionMetrics>;
}

export interface ProductionMetrics {
  totalOrders: number;
  byStatus: Record<ProductionStatus, number>;
  averageLeadTime: number;
  onTimeDelivery: number;
}