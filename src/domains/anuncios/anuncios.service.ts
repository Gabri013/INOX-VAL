/**
 * Anuncios Service
 * Serviço para gerenciamento de anúncios administrativos
 */

import { httpClient } from '@/services/http/client';
import type {
  Anuncio,
  AnuncioLeitura,
  AnunciosFilters,
  CreateAnuncioDTO,
  UpdateAnuncioDTO,
} from './anuncios.types';

const BASE_PATH = '/anuncios';

export const anunciosService = {
  // Anúncios
  async getAnuncios(filters?: AnunciosFilters): Promise<Anuncio[]> {
    const params = new URLSearchParams();
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters?.dataFim) params.append('dataFim', filters.dataFim);
    
    const query = params.toString();
    return httpClient.get<Anuncio[]>(
      `${BASE_PATH}${query ? `?${query}` : ''}`
    );
  },

  async getAnuncio(id: string): Promise<Anuncio> {
    return httpClient.get<Anuncio>(`${BASE_PATH}/${id}`);
  },

  async createAnuncio(data: CreateAnuncioDTO): Promise<Anuncio> {
    return httpClient.post<Anuncio>(BASE_PATH, data);
  },

  async updateAnuncio(id: string, data: UpdateAnuncioDTO): Promise<Anuncio> {
    return httpClient.put<Anuncio>(`${BASE_PATH}/${id}`, data);
  },

  async deleteAnuncio(id: string): Promise<void> {
    return httpClient.delete<void>(`${BASE_PATH}/${id}`);
  },

  // Anúncios ativos para o usuário atual
  async getAnunciosAtivos(): Promise<Anuncio[]> {
    return httpClient.get<Anuncio[]>(`${BASE_PATH}/ativos`);
  },

  // Marcar anúncio como lido
  async marcarComoLido(anuncioId: string): Promise<void> {
    return httpClient.post<void>(`${BASE_PATH}/${anuncioId}/marcar-lido`, {});
  },

  // Obter leituras de um anúncio (apenas admin)
  async getLeituras(anuncioId: string): Promise<AnuncioLeitura[]> {
    return httpClient.get<AnuncioLeitura[]>(`${BASE_PATH}/${anuncioId}/leituras`);
  },
};