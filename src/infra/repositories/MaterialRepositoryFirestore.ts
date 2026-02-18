import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  MaterialRepository, 
  MaterialFilters 
} from '../../domains/materials/types';
import { Material, PriceRecord } from '../../domains/engine/types';

const COLLECTION_NAME = 'materials';

export class MaterialRepositoryFirestore implements MaterialRepository {
  
  async getMaterialByKey(key: string): Promise<Material | undefined> {
    const docRef = doc(db, COLLECTION_NAME, key);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) return undefined;
    
    return this.docToMaterial(snapshot.id, snapshot.data());
  }
  
  async listMaterials(filters?: MaterialFilters): Promise<Material[]> {
    let q = query(collection(db, COLLECTION_NAME));
    
    if (filters?.kind) {
      q = query(q, where('kind', '==', filters.kind));
    }
    if (filters?.alloy) {
      q = query(q, where('alloy', '==', filters.alloy));
    }
    if (filters?.supplierId) {
      q = query(q, where('supplierId', '==', filters.supplierId));
    }
    if (filters?.active !== undefined) {
      q = query(q, where('active', '==', filters.active));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => 
      this.docToMaterial(doc.id, doc.data())
    );
  }
  
  async createMaterial(material: Omit<Material, 'key'> & { key?: string }): Promise<Material> {
    const key = material.key || this.generateKey(material);
    const docRef = doc(db, COLLECTION_NAME, key);
    
    const data = this.materialToDoc(material);
    await setDoc(docRef, data);
    
    return { ...material, key };
  }
  
  async updateMaterial(key: string, updates: Partial<Material>): Promise<Material> {
    const existing = await this.getMaterialByKey(key);
    if (!existing) {
      throw new Error(`Material não encontrado: ${key}`);
    }
    
    const docRef = doc(db, COLLECTION_NAME, key);
    const data = this.materialToDoc({ ...existing, ...updates });
    await setDoc(docRef, data, { merge: true });
    
    return { ...existing, ...updates };
  }
  
  async deleteMaterial(key: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, key);
    await deleteDoc(docRef);
  }
  
  async getActivePrice(materialKey: string, date: string): Promise<PriceRecord | undefined> {
    const material = await this.getMaterialByKey(materialKey);
    if (!material) return undefined;
    
    const targetDate = new Date(date);
    
    const activePrice = material.priceHistory.find(p => {
      const from = new Date(p.validFrom);
      const to = p.validTo ? new Date(p.validTo) : new Date('2099-12-31');
      return targetDate >= from && targetDate <= to;
    });
    
    return activePrice;
  }
  
  async addPriceRecord(materialKey: string, price: Omit<PriceRecord, 'updatedAt'>): Promise<PriceRecord> {
    const material = await this.getMaterialByKey(materialKey);
    if (!material) {
      throw new Error(`Material não encontrado: ${materialKey}`);
    }
    
    const newPrice: PriceRecord = {
      ...price,
      updatedAt: new Date().toISOString()
    };
    
    const updatedHistory = [...material.priceHistory, newPrice];
    
    await this.updateMaterial(materialKey, { 
      priceHistory: updatedHistory 
    } as Partial<Material>);
    
    return newPrice;
  }
  
  async getPriceHistory(materialKey: string): Promise<PriceRecord[]> {
    const material = await this.getMaterialByKey(materialKey);
    return material?.priceHistory || [];
  }
  
  async materialKeyExists(key: string): Promise<boolean> {
    const material = await this.getMaterialByKey(key);
    return material !== undefined;
  }
  
  async listSuppliers(): Promise<string[]> {
    const materials = await this.listMaterials();
    const suppliers = new Set(materials.map(m => m.supplierId));
    return Array.from(suppliers);
  }
  
  // Helpers
  private generateKey(material: Omit<Material, 'key'> & { key?: string }): string {
    const parts = [material.kind.toUpperCase(), material.alloy];
    
    if (material.thicknessMm) {
      parts.push(material.thicknessMm.toString());
    }
    parts.push(material.finish);
    
    if (material.format) {
      parts.push(`${material.format.widthMm}x${material.format.heightMm}`);
    }
    
    parts.push(material.supplierId);
    
    return parts.join('#');
  }
  
  private docToMaterial(id: string, data: Record<string, unknown>): Material {
    return {
      key: id,
      kind: data.kind as Material['kind'],
      alloy: data.alloy as string,
      thicknessMm: data.thicknessMm as number | undefined,
      finish: data.finish as string,
      format: data.format as Material['format'],
      tubeProfile: data.tubeProfile as Material['tubeProfile'],
      supplierId: data.supplierId as string,
      densityKgM3: data.densityKgM3 as number,
      active: data.active as boolean,
      priceHistory: (data.priceHistory as PriceRecord[]) || []
    };
  }
  
  private materialToDoc(material: Partial<Material>): Record<string, unknown> {
    return {
      kind: material.kind,
      alloy: material.alloy,
      thicknessMm: material.thicknessMm,
      finish: material.finish,
      format: material.format,
      tubeProfile: material.tubeProfile,
      supplierId: material.supplierId,
      densityKgM3: material.densityKgM3,
      active: material.active,
      priceHistory: material.priceHistory
    };
  }
}

// Singleton
export const materialRepository = new MaterialRepositoryFirestore();
