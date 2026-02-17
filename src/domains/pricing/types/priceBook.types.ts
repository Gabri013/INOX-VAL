export interface PriceEntry {
  materialId: string;
  supplierId: string;
  price: number;
  unit: 'kg' | 'unit' | 'sheet' | 'meter';
  currency: 'BRL';
  quotedAt: string;
  validUntil?: string;
  source: 'csv' | 'manual' | 'api';
  confidence: number;
}

export interface Supplier {
  supplierId: string;
  name: string;
  region?: string;
  contact?: string;
}

export interface PriceBookVersion {
  versionId: string;
  createdAt: string;
  source: 'csv' | 'manual' | 'api';
  entriesCount: number;
}
