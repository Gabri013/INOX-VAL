/**
 * Serviços da Calculadora Rápida
 */

import { httpClient } from '@/services/http/client';
import { 
  Insumo, 
  ProdutoPadrao, 
  CalculadoraOrcamento,
  ItemCalculadora,
  ResultadoCalculadora 
} from './types';

// Insumos
export const insumosService = {
  getAll: async (): Promise<Insumo[]> => {
    return httpClient.get('/api/catalogo/insumos');
  },

  getById: async (id: string): Promise<Insumo> => {
    return httpClient.get(`/api/catalogo/insumos/${id}`);
  },

  getByTipo: async (tipo: string): Promise<Insumo[]> => {
    return httpClient.get(`/api/catalogo/insumos?tipo=${tipo}`);
  },
};

// Produtos Padronizados
export const produtosPadronizadosService = {
  getAll: async (): Promise<ProdutoPadrao[]> => {
    return httpClient.get('/api/catalogo/produtos-padronizados');
  },

  getById: async (id: string): Promise<ProdutoPadrao> => {
    return httpClient.get(`/api/catalogo/produtos-padronizados/${id}`);
  },

  getByTipo: async (tipo: string): Promise<ProdutoPadrao[]> => {
    return httpClient.get(`/api/catalogo/produtos-padronizados?tipo=${tipo}`);
  },
};

// Calculadora Rápida
export const calculadoraService = {
  calcular: async (
    itens: ItemCalculadora[],
    margemLucro: number = 50
  ): Promise<ResultadoCalculadora> => {
    return httpClient.post('/api/calculadora/calcular', {
      itens,
      margemLucro,
    });
  },

  salvarOrcamento: async (resultado: ResultadoCalculadora): Promise<CalculadoraOrcamento> => {
    return httpClient.post('/api/calculadora/orcamentos', resultado);
  },

  getOrcamentos: async (): Promise<CalculadoraOrcamento[]> => {
    return httpClient.get('/api/calculadora/orcamentos');
  },

  getOrcamentoById: async (id: string): Promise<CalculadoraOrcamento> => {
    return httpClient.get(`/api/calculadora/orcamentos/${id}`);
  },

  atualizarOrcamento: async (
    id: string,
    data: Partial<CalculadoraOrcamento>
  ): Promise<CalculadoraOrcamento> => {
    return httpClient.put(`/api/calculadora/orcamentos/${id}`, data);
  },
};
