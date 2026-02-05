/**
 * HTTP Client abstraction layer
 * 
 * Este módulo fornece uma interface unificada para chamadas HTTP.
 * Em desenvolvimento, usa MockHttpClient (IndexedDB).
 * Em produção, pode ser substituído por um cliente real (axios, fetch, etc.)
 */

import { mockClient } from './mockClient';

/**
 * Configuração de requisição
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

/**
 * Interface do HTTP Client
 */
export interface HttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

/**
 * Parâmetros de paginação padrão
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any; // Permite filtros customizados
}

/**
 * Resposta paginada padrão
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Retorna a instância do HTTP Client configurada
 * 
 * Por enquanto, sempre retorna mockClient.
 * Quando backend estiver pronto, pode verificar variável de ambiente:
 * 
 * export function getHttpClient(): HttpClient {
 *   if (import.meta.env.VITE_USE_MOCK === 'true') {
 *     return mockClient;
 *   }
 *   return realHttpClient; // axios ou fetch configurado
 * }
 */
export function getHttpClient(): HttpClient {
  return mockClient;
}

/**
 * Helper para construir query string a partir de params
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Export do httpClient (wrapper do client configurado)
 */
export const httpClient: HttpClient = {
  get: <T>(url: string, config?: RequestConfig) => getHttpClient().get<T>(url, config),
  post: <T>(url: string, data?: any, config?: RequestConfig) => getHttpClient().post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: RequestConfig) => getHttpClient().put<T>(url, data, config),
  patch: <T>(url: string, data?: any, config?: RequestConfig) => getHttpClient().patch<T>(url, data, config),
  delete: <T>(url: string, config?: RequestConfig) => getHttpClient().delete<T>(url, config),
};
