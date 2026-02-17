// Engine: geometry.engine.ts
// Responsável por calcular volumes e comprimentos a partir do input
import type { QuoteInput } from "./quote.engine";

export interface GeometryResult {
  tampoVolumeM3: number;
  cubaVolumeM3: number;
  tuboComprimentoTotalM: number;
}

export function calculateGeometry(input: QuoteInput): GeometryResult {
  // mm -> m
  const mmToM = (v: number) => v / 1000;
  let tampoVolumeM3 = 0;
  let cubaVolumeM3 = 0;
  let tuboComprimentoTotalM = 0;

  if (input.tampo) {
    const { comprimento, largura, espessura } = input.tampo;
    tampoVolumeM3 = mmToM(comprimento) * mmToM(largura) * mmToM(espessura);
  }
  if (input.cuba) {
    const { L, W, H, espessura } = input.cuba;
    // Cuba: volume da caixa externa menos paredes (simplificado)
    const ext = mmToM(L) * mmToM(W) * mmToM(H);
    const int = mmToM(L - 2 * espessura) * mmToM(W - 2 * espessura) * mmToM(H - espessura);
    cubaVolumeM3 = Math.max(0, ext - int);
  }
  if (input.estrutura) {
    // Exemplo: pés = quantidade * altura
    tuboComprimentoTotalM = (input.estrutura.quantidadePes || 0) * mmToM(input.estrutura.alturaPes || 0);
  }
  return { tampoVolumeM3, cubaVolumeM3, tuboComprimentoTotalM };
}
