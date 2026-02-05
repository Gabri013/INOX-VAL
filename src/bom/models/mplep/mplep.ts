/**
 * Modelo MPLEP
 * Encosto com Prateleira (4 pés)
 */

import { BOMResult, MesaConfig } from '../../types';
import { gerarBOM_MPLCP6 } from '../mplcp/mplcp6';

export function gerarBOM_MPLEP(config: MesaConfig): BOMResult {
  // Implementação similar ao MPLCP6 mas com 4 pés e espelho traseiro
  const result = gerarBOM_MPLCP6({ ...config, numPes: 4 });
  result.modelo = 'MPLEP';
  result.descricao = 'Encosto com Prateleira (4 pés)';
  // Adicionar espelho traseiro na BOM
  return result;
}
