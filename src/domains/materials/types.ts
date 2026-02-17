export interface MaterialCatalogItem {
  materialId: string;
  swName: string;
  description?: string;
  classification: string;
  classifications: string[];
  kind: 'chapa' | 'tubo' | 'barra' | 'perfil' | 'diversos';
  grade?: string;
  thicknessMm?: number;
  diameterMm?: number;
  densityKgM3?: number;
  source: 'sldmat';
}
