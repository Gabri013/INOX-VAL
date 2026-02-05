import { httpClient } from '../../services/httpClient';
import type { CalculadoraSalva, ResultadoCalculadora } from './types';

/**
 * Serviço de Calculadora Rápida
 * Integra com backend via httpClient para persistência
 */

const BASE_PATH = '/calculadora';

export const calculadoraService = {
  /**
   * Salvar um cálculo no backend
   */
  async salvar(dados: {
    nome: string;
    cliente?: string;
    resultado: ResultadoCalculadora;
  }): Promise<CalculadoraSalva> {
    const response = await httpClient.post<CalculadoraSalva>(BASE_PATH, {
      ...dados,
      status: 'rascunho',
    });
    return response.data;
  },

  /**
   * Atualizar um cálculo existente
   */
  async atualizar(id: string, dados: Partial<CalculadoraSalva>): Promise<CalculadoraSalva> {
    const response = await httpClient.put<CalculadoraSalva>(`${BASE_PATH}/${id}`, dados);
    return response.data;
  },

  /**
   * Buscar todos os cálculos salvos
   */
  async listar(filtros?: {
    vendedor?: string;
    cliente?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<CalculadoraSalva[]> {
    const response = await httpClient.get<CalculadoraSalva[]>(BASE_PATH, {
      params: filtros,
    });
    return response.data;
  },

  /**
   * Buscar um cálculo específico por ID
   */
  async buscarPorId(id: string): Promise<CalculadoraSalva> {
    const response = await httpClient.get<CalculadoraSalva>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Excluir um cálculo
   */
  async excluir(id: string): Promise<void> {
    await httpClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Converter cálculo em orçamento/pedido
   */
  async converter(id: string, tipo: 'orcamento' | 'pedido'): Promise<{ id: string }> {
    const response = await httpClient.post<{ id: string }>(`${BASE_PATH}/${id}/converter`, {
      tipo,
    });
    return response.data;
  },

  /**
   * Duplicar um cálculo existente
   */
  async duplicar(id: string): Promise<CalculadoraSalva> {
    const response = await httpClient.post<CalculadoraSalva>(`${BASE_PATH}/${id}/duplicar`);
    return response.data;
  },

  /**
   * Exportar cálculo em PDF
   */
  async exportarPDF(id: string): Promise<Blob> {
    const response = await httpClient.get(`${BASE_PATH}/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
