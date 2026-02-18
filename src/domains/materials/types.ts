import { Material, PriceRecord } from '../engine/types';

export interface MaterialRepository {
  // CRUD básico
  getMaterialByKey(key: string): Promise<Material | undefined>;
  listMaterials(filters?: MaterialFilters): Promise<Material[]>;
  createMaterial(material: Omit<Material, 'key'> & { key?: string }): Promise<Material>;
  updateMaterial(key: string, updates: Partial<Material>): Promise<Material>;
  deleteMaterial(key: string): Promise<void>;
  
  // Preços
  getActivePrice(materialKey: string, date: string): Promise<PriceRecord | undefined>;
  addPriceRecord(materialKey: string, price: Omit<PriceRecord, 'updatedAt'>): Promise<PriceRecord>;
  getPriceHistory(materialKey: string): Promise<PriceRecord[]>;
  
  // Utilitários
  materialKeyExists(key: string): Promise<boolean>;
  listSuppliers(): Promise<string[]>;
}

export interface MaterialFilters {
  kind?: 'sheet' | 'tube' | 'accessory' | 'other';
  alloy?: string;
  supplierId?: string;
  active?: boolean;
  hasActivePrice?: boolean;
}

export interface MaterialService {
  repository: MaterialRepository;
  
  // Validações de negócio
  validateMaterialForQuote(materialKey: string, quoteDate: string): Promise<{
    valid: boolean;
    material?: Material;
    price?: PriceRecord;
    errors: string[];
    warnings: string[];
  }>;
  
  // Formatação de chave
  formatMaterialKey(params: {
    kind: 'sheet' | 'tube' | 'accessory' | 'other';
    alloy: string;
    thicknessMm?: number;
    finish: string;
    format?: { widthMm: number; heightMm: number; supplierFormatName: string };
    tubeProfile?: { widthMm: number; heightMm: number; thicknessMm: number };
    supplierId: string;
  }): string;
  
  parseMaterialKey(key: string): {
    kind: string;
    alloy: string;
    thicknessMm?: number;
    finish: string;
    supplierId: string;
  };
}
