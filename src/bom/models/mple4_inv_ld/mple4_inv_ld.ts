/**
 * Modelo MPLE4_INV_LD
 * Encosto Espelho Traseiro + Lateral Dir (4 pés)
 */

import { BOMResult, MesaConfig } from '../../types';
import { gerarBOM_MPLEP } from '../mplep/mplep';

export function gerarBOM_MPLE4_INV_LD(config: MesaConfig): BOMResult {
  const result = gerarBOM_MPLEP(config);
  result.modelo = 'MPLE4_INV_LD';
  result.descricao = 'Encosto Espelho Traseiro + Lateral Dir (4 pés)';
  return result;
}
