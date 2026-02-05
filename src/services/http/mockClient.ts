/**
 * Implementação mock do HTTP Client usando IndexedDB
 * Simula chamadas de API com persistência local
 */

import { 
  HttpClient, 
  RequestConfig, 
  PaginatedResponse, 
  PaginationParams 
} from './client';
import { Storage, StoreName, getDB } from '../storage/db';
import { ApiError, NotFoundError } from '@/shared/lib/errors';
import type { ID } from '@/shared/types/ids';
import { handleProducaoRequest } from './producaoMockHandler';
import { handleCalculadoraRequest } from './calculadoraMockHandler';
import { handleConfiguracoesRequest } from './configuracoesMockHandler';

/**
 * Mapeia URLs para stores do IndexedDB
 */
const URL_TO_STORE_MAP: Record<string, StoreName> = {
  '/api/clientes': 'clientes',
  '/api/produtos': 'produtos',
  '/api/estoque': 'estoque',
  '/api/movimentos-estoque': 'movimentos_estoque',
  '/api/orcamentos': 'orcamentos',
  '/api/ordens-producao': 'ordens_producao',
  '/api/boms': 'boms',
  '/api/pedidos-compra': 'pedidos_compra',
  '/api/nesting': 'nesting',
  '/api/auditoria': 'auditoria',
  '/api/configuracoes-usuario': 'auditoria', // Temporário - usar auditoria como fallback
  '/producao/ordens': 'ordens_producao',
  '/producao/setores': 'ordens_producao',
  '/producao/itens': 'ordens_producao',
  '/producao/dashboard': 'ordens_producao',
  // Rotas da Calculadora (handled by calculadoraMockHandler)
  '/api/catalogo/insumos': 'auditoria',
  '/api/catalogo/produtos-padronizados': 'auditoria',
  '/api/calculadora/calcular': 'auditoria',
  '/api/calculadora/orcamentos': 'auditoria',
  // Rotas da Calculadora Rápida (nova implementação)
  '/calculadora': 'calculadora',
};

/**
 * Simula delay de rede
 */
async function simulateNetworkDelay(ms: number = 300): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extrai o nome da store a partir da URL
 */
function getStoreFromUrl(url: string): StoreName {
  // Remove query string e trailing slash
  const cleanUrl = url.split('?')[0].replace(/\/$/, '');
  
  // Tenta match exato primeiro
  if (URL_TO_STORE_MAP[cleanUrl]) {
    return URL_TO_STORE_MAP[cleanUrl];
  }
  
  // Tenta match por prefixo (para rotas com ID)
  for (const [prefix, store] of Object.entries(URL_TO_STORE_MAP)) {
    if (cleanUrl.startsWith(prefix)) {
      return store;
    }
  }
  
  throw new ApiError(`Rota não mapeada: ${url}`, 404);
}

/**
 * Extrai ID da URL (ex: /api/clientes/123 -> 123)
 */
function extractIdFromUrl(url: string): ID | null {
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  
  // Se o último part não contém '?' e não está vazio, assume que é um ID
  if (lastPart && !lastPart.includes('?')) {
    return lastPart;
  }
  
  return null;
}

/**
 * Aplica filtros de busca em um array
 */
function applyFilters<T extends Record<string, any>>(
  items: T[],
  params: PaginationParams
): T[] {
  let filtered = [...items];
  
  // Busca textual (procura em todos os campos string)
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(item => {
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      });
    });
  }
  
  // Filtros específicos (qualquer param que não seja page, pageSize, search, sortBy, sortOrder)
  const filterKeys = Object.keys(params).filter(
    key => !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)
  );
  
  filterKeys.forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      filtered = filtered.filter(item => item[key] === value);
    }
  });
  
  return filtered;
}

/**
 * Aplica ordenação
 */
function applySort<T extends Record<string, any>>(
  items: T[],
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  if (!sortBy) return items;
  
  return [...items].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

/**
 * Aplica paginação
 */
function applyPagination<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): { items: T[]; total: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    items: items.slice(start, end),
    total,
    totalPages,
  };
}

/**
 * Mock Client implementando a interface HttpClient
 */
export class MockHttpClient implements HttpClient {
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    await simulateNetworkDelay();
    
    // Interceptar rotas de produção
    if (url.startsWith('/producao/')) {
      return handleProducaoRequest('GET', url) as Promise<T>;
    }
    
    // Interceptar rotas da calculadora
    if (url.startsWith('/api/calculadora/') || url.startsWith('/api/catalogo/')) {
      return handleCalculadoraRequest('GET', url) as Promise<T>;
    }
    
    // Interceptar rotas de configurações
    if (url.startsWith('/api/configuracoes-usuario/')) {
      return handleConfiguracoesRequest('GET', url) as Promise<T>;
    }
    
    const id = extractIdFromUrl(url);
    const storeName = getStoreFromUrl(url);
    const storage = new Storage(storeName);
    
    // GET por ID
    if (id) {
      const item = await storage.getById(id);
      if (!item) {
        throw new NotFoundError(storeName, id);
      }
      return item as T;
    }
    
    // GET lista (com paginação e filtros)
    const params = (config?.params || {}) as PaginationParams;
    let items = await storage.getAll();
    
    // Aplica filtros
    items = applyFilters(items, params);
    
    // Aplica ordenação
    items = applySort(items, params.sortBy, params.sortOrder);
    
    // Aplica paginação
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const paginated = applyPagination(items, page, pageSize);
    
    // Retorna resposta paginada
    const response: PaginatedResponse<any> = {
      items: paginated.items,
      total: paginated.total,
      page,
      pageSize,
      totalPages: paginated.totalPages,
    };
    
    return response as T;
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    await simulateNetworkDelay();
    
    // Interceptar rotas de produção
    if (url.startsWith('/producao/')) {
      return handleProducaoRequest('POST', url, data) as Promise<T>;
    }
    
    // Interceptar rotas da calculadora
    if (url.startsWith('/api/calculadora/') || url.startsWith('/api/catalogo/')) {
      return handleCalculadoraRequest('POST', url, data) as Promise<T>;
    }
    
    // Interceptar rotas de configurações
    if (url.startsWith('/api/configuracoes-usuario/')) {
      return handleConfiguracoesRequest('POST', url, data) as Promise<T>;
    }
    
    const storeName = getStoreFromUrl(url);
    const storage = new Storage(storeName);
    
    // Validação básica
    if (!data || !data.id) {
      throw new ApiError('Dados inválidos: ID é obrigatório', 400);
    }
    
    const created = await storage.create(data);
    return created as T;
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    await simulateNetworkDelay();
    
    const id = extractIdFromUrl(url);
    if (!id) {
      throw new ApiError('ID não fornecido na URL', 400);
    }
    
    const storeName = getStoreFromUrl(url);
    const storage = new Storage(storeName);
    
    const updated = await storage.update(id, data);
    return updated as T;
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    // Interceptar rotas de produção
    if (url.startsWith('/producao/')) {
      return handleProducaoRequest('PATCH', url, data) as Promise<T>;
    }
    
    // Interceptar rotas de configurações
    if (url.startsWith('/api/configuracoes-usuario/')) {
      return handleConfiguracoesRequest('PATCH', url, data) as Promise<T>;
    }
    
    // PATCH é igual ao PUT nesta implementação
    return this.put<T>(url, data, config);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    await simulateNetworkDelay();
    
    const id = extractIdFromUrl(url);
    if (!id) {
      throw new ApiError('ID não fornecido na URL', 400);
    }
    
    const storeName = getStoreFromUrl(url);
    const storage = new Storage(storeName);
    
    // Busca o item antes de deletar (para retornar)
    const item = await storage.getById(id);
    if (!item) {
      throw new NotFoundError(storeName, id);
    }
    
    await storage.delete(id);
    return item as T;
  }

  /**
   * Métodos utilitários para popular dados (usado em mocks)
   */
  
  async setAll<T extends { id: ID }>(storeName: StoreName, items: T[]): Promise<void> {
    const storage = new Storage<T>(storeName);
    await storage.setAll(items);
  }

  async getAll<T>(storeName: StoreName): Promise<T[]> {
    const storage = new Storage<T & { id: ID }>(storeName);
    return storage.getAll();
  }

  async clearStore(storeName: StoreName): Promise<void> {
    const storage = new Storage(storeName);
    await storage.clear();
  }

  /**
   * Registrar handlers customizados para rotas específicas
   */
  private customHandlers: Map<string, (url: string, data?: any) => Promise<any>> = new Map();

  onGet(pattern: string, handler: (url: string) => Promise<any>): void {
    this.customHandlers.set(`GET:${pattern}`, handler);
  }

  onPost(pattern: string, handler: (url: string, data: any) => Promise<any>): void {
    this.customHandlers.set(`POST:${pattern}`, handler);
  }

  onPut(pattern: string, handler: (url: string, data: any) => Promise<any>): void {
    this.customHandlers.set(`PUT:${pattern}`, handler);
  }

  onDelete(pattern: string, handler: (url: string) => Promise<any>): void {
    this.customHandlers.set(`DELETE:${pattern}`, handler);
  }

  private async checkCustomHandler<T>(method: string, url: string, data?: any): Promise<T | null> {
    const key = `${method}:${url}`;
    const handler = this.customHandlers.get(key);
    
    if (handler) {
      return handler(url, data) as Promise<T>;
    }

    // Tentar match por padrão (ex: /chat/* match /chat/usuarios)
    for (const [handlerKey, handlerFn] of this.customHandlers.entries()) {
      const [handlerMethod, handlerPattern] = handlerKey.split(':');
      if (handlerMethod === method && url.startsWith(handlerPattern.replace('*', ''))) {
        return handlerFn(url, data) as Promise<T>;
      }
    }

    return null;
  }
}

/**
 * Instância singleton do mock client
 */
export const mockClient = new MockHttpClient();