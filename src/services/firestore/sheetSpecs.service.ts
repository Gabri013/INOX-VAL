import { FirestoreService } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import type { MaterialNameNormalized } from "@/domains/precificacao/types/opPricing";

export interface SheetSpecDoc {
  id: string;
  materialName: MaterialNameNormalized;
  thicknessMm: number;
  widthMm: number;
  heightMm: number;
  costPerSheet: number;
  defaultScrapPct: number;
  defaultEfficiency: number;
  materialKey: string;
  active?: boolean;
  empresaId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const normalizeMaterialKey = (materialName: string) =>
  materialName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

export class SheetSpecsService extends FirestoreService<SheetSpecDoc> {
  constructor() {
    super(COLLECTIONS.sheet_specs, { softDelete: true });
  }

  async listActive() {
    const result = await this.list({
      where: [{ field: "active", operator: "==", value: true }],
      orderBy: [{ field: "materialName", direction: "asc" }],
    });

    if (result.success && result.data) return result;

    // Compatibilidade com base antiga sem campo `active`
    const fallback = await this.list({
      orderBy: [{ field: "materialName", direction: "asc" }],
    });
    if (!fallback.success || !fallback.data) return fallback;
    return {
      success: true as const,
      data: {
        ...fallback.data,
        items: fallback.data.items.filter((item) => item.active !== false),
      },
    };
  }

  async create(data: Omit<SheetSpecDoc, "id" | "materialKey">) {
    return super.create({
      ...data,
      materialKey: normalizeMaterialKey(data.materialName),
      active: data.active ?? true,
    } as Omit<SheetSpecDoc, "id">);
  }

  async update(id: string, data: Partial<SheetSpecDoc>) {
    const payload: Partial<SheetSpecDoc> = { ...data };
    if (data.materialName) {
      payload.materialKey = normalizeMaterialKey(data.materialName);
    }
    return super.update(id, payload);
  }

  async getByMaterialThickness(materialName: string, thicknessMm: number) {
    const materialKey = normalizeMaterialKey(materialName);
    const result = await this.list({
      where: [{ field: "materialKey", operator: "==", value: materialKey }],
      orderBy: [{ field: "thicknessMm", direction: "asc" }],
    });
    if (!result.success || !result.data) return result;

    const found = result.data.items.find((item) => Math.abs(item.thicknessMm - thicknessMm) <= 0.05);
    return {
      success: true as const,
      data: found ?? null,
    };
  }
}

export const sheetSpecsService = new SheetSpecsService();
