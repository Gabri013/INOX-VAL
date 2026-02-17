// Engine: mass.engine.ts
import type { GeometryResult } from "./geometry.engine";

export interface MassResult {
  tampoKg: number;
  cubaKg: number;
  estruturaKg: number;
  totalKg: number;
}

const DENSIDADE = {
  INOX_304: 7930,
  INOX_316: 8000,
};

export function calculateMass(geometry: GeometryResult, input: { tampo?: { materialId: string }, cuba?: { materialId: string }, estrutura?: { materialId?: string } }): MassResult {
  // Assume INOX_304 se não informado
  const getDensidade = (matId?: string) => matId === "INOX_316" ? DENSIDADE.INOX_316 : DENSIDADE.INOX_304;
  const tampoKg = geometry.tampoVolumeM3 * getDensidade(input.tampo?.materialId);
  const cubaKg = geometry.cubaVolumeM3 * getDensidade(input.cuba?.materialId);
  // Estrutura: assume tubo INOX_304
  const estruturaKg = geometry.tuboComprimentoTotalM * 2.7; // Exemplo: 2.7kg/m para tubo redondo 38,1x1,2mm
  const totalKg = (tampoKg || 0) + (cubaKg || 0) + (estruturaKg || 0);
  return { tampoKg, cubaKg, estruturaKg, totalKg };
}
