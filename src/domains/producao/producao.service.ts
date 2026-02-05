/**
 * Serviço de Produção
 */

import { getHttpClient } from '@/services/http/client';
import type { 
  OrdemProducaoCompleta, 
  OrdemProducaoItem,
  MovimentacaoSetor,
  DashboardSetorData,
  ConsultaMaterial,
  SetorProducao 
} from './producao.types';

export const producaoService = {
  /**
   * Listar ordens de produção
   */
  async listOrdens(filters?: {
    status?: string;
    prioridade?: string;
    setor?: SetorProducao;
  }) {
    return getHttpClient().get<OrdemProducaoCompleta[]>('/producao/ordens', { params: filters });
  },

  /**
   * Buscar ordem por ID
   */
  async getOrdem(id: string) {
    return getHttpClient().get<OrdemProducaoCompleta>(`/producao/ordens/${id}`);
  },

  /**
   * Buscar itens por setor
   */
  async getItensPorSetor(setor: SetorProducao) {
    return getHttpClient().get<OrdemProducaoItem[]>(`/producao/setores/${setor}/itens`);
  },

  /**
   * Dar entrada em setor
   */
  async entradaSetor(itemId: string, setor: SetorProducao, observacoes?: string) {
    return getHttpClient().post<MovimentacaoSetor>(`/producao/itens/${itemId}/entrada`, {
      setor,
      observacoes,
    });
  },

  /**
   * Dar saída de setor
   */
  async saidaSetor(itemId: string, observacoes?: string) {
    return getHttpClient().post<MovimentacaoSetor>(`/producao/itens/${itemId}/saida`, {
      observacoes,
    });
  },

  /**
   * Atualizar progresso do item
   */
  async atualizarProgresso(itemId: string, progresso: number) {
    return getHttpClient().patch(`/producao/itens/${itemId}/progresso`, { progresso });
  },

  /**
   * Consultar materiais necessários
   */
  async consultarMateriais(itemId: string) {
    return getHttpClient().get<ConsultaMaterial[]>(`/producao/itens/${itemId}/materiais`);
  },

  /**
   * Dashboard por setor
   */
  async getDashboardSetor(setor?: SetorProducao) {
    const url = setor ? `/producao/dashboard/${setor}` : '/producao/dashboard';
    return getHttpClient().get<DashboardSetorData[]>(url);
  },

  /**
   * Buscar item por código/QR
   */
  async buscarItem(codigo: string) {
    return getHttpClient().get<OrdemProducaoItem>(`/producao/itens/buscar`, { 
      params: { codigo } 
    });
  },

  /**
   * Rejeitar item (problema de qualidade)
   */
  async rejeitarItem(itemId: string, motivo: string) {
    return getHttpClient().post(`/producao/itens/${itemId}/rejeitar`, { motivo });
  },

  /**
   * Pausar produção de item
   */
  async pausarItem(itemId: string, motivo: string) {
    return getHttpClient().post(`/producao/itens/${itemId}/pausar`, { motivo });
  },

  /**
   * Retomar produção de item
   */
  async retomarItem(itemId: string) {
    return getHttpClient().post(`/producao/itens/${itemId}/retomar`);
  },
};