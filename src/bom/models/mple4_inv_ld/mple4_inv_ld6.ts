/**
 * Modelo MPLE4_INV_LD6
 * Encosto Espelho Traseiro + Lateral Dir (6 pés)
 */

import { BOMResult, MesaConfig } from '../../types';
import { gerarBOM_MPLEP6 } from '../mplep/mplep6';

export function gerarBOM_MPLE4_INV_LD6(config: MesaConfig): BOMResult {
  const result = gerarBOM_MPLEP6(config);
  result.modelo = 'MPLE4_INV_LD6';
  result.descricao = 'Encosto Espelho Traseiro + Lateral Dir (6 pés)';
  return result;
}
