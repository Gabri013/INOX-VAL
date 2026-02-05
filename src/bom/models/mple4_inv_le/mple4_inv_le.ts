/**
 * Modelo MPLE4_INV_LE
 * Encosto Espelho Traseiro + Lateral Esq (4 pés)
 */

import { BOMResult, MesaConfig } from '../../types';
import { gerarBOM_MPLEP } from '../mplep/mplep';

export function gerarBOM_MPLE4_INV_LE(config: MesaConfig): BOMResult {
  // Implementação com espelho traseiro e lateral esquerdo
  const result = gerarBOM_MPLEP(config);
  result.modelo = 'MPLE4_INV_LE';
  result.descricao = 'Encosto Espelho Traseiro + Lateral Esq (4 pés)';
  // Adicionar espelho lateral esquerdo na BOM
  return result;
}
