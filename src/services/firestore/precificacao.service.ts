import { FirestoreService } from "./base";
import { COLLECTIONS } from "@/types/firebase";

export interface PrecificacaoRun {
  id: string;
  sheetName: string;
  mode?: "classic" | "op";
  inputFileName?: string;
  empresaId?: string;
  userId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  overrides: Record<string, any>;
  outputs: Record<string, any>;
}

class PrecificacaoService extends FirestoreService<PrecificacaoRun> {
  constructor() {
    super(COLLECTIONS.pricing_runs, { softDelete: false });
  }
}

export const precificacaoService = new PrecificacaoService();
