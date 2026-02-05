/**
 * Modelo MPLEP6
 * Encosto com Prateleira (6 pés)
 */

import { BOMResult, MesaConfig } from '../../types';
import { gerarBOM_MPLCP6 } from '../mplcp/mplcp6';

export function gerarBOM_MPLEP6(config: MesaConfig): BOMResult {
  // Implementação similar ao MPLCP6 mas com espelho traseiro
  const result = gerarBOM_MPLCP6(config);
  result.modelo = 'MPLEP6';
  result.descricao = 'Encosto com Prateleira (6 pés)';
  // Adicionar espelho traseiro na BOM
  return result;
}
