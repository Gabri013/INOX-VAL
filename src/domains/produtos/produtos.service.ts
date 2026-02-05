/**
 * Serviço de Produtos
 */

import { getHttpClient, PaginatedResponse, PaginationParams } from '@/services/http/client';
import { newId, type ID } from '@/shared/types/ids';
import { toISOString } from '@/shared/lib/format';
import type { Produto, CreateProdutoInput, UpdateProdutoInput, ProdutoFilters } from './produtos.types';

const BASE_URL = '/api/produtos';

class ProdutosService {
  async list(
    params: PaginationParams & ProdutoFilters = {}
  ): Promise<PaginatedResponse<Produto>> {
    const client = getHttpClient();
    
    const apiParams: PaginationParams = {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    };
    
    if (params.tipo && params.tipo !== 'all') {
      apiParams.tipo = params.tipo;
    }
    
    if (params.ativo !== undefined) {
      apiParams.ativo = params.ativo;
    }
    
    return client.get<PaginatedResponse<Produto>>(BASE_URL, { params: apiParams });
  }

  async getById(id: ID): Promise<Produto> {
    const client = getHttpClient();
    return client.get<Produto>(`${BASE_URL}/${id}`);
  }

  async create(data: CreateProdutoInput): Promise<Produto> {
    const client = getHttpClient();
    
    const produto: Produto = {
      id: newId(),
      ...data,
      estoque: 0, // Estoque inicial sempre 0
      criadoEm: toISOString(new Date()),
      atualizadoEm: toISOString(new Date()),
    };
    
    return client.post<Produto>(BASE_URL, produto);
  }

  async update(id: ID, data: UpdateProdutoInput): Promise<Produto> {
    const client = getHttpClient();
    
    const updates = {
      ...data,
      atualizadoEm: toISOString(new Date()),
    };
    
    return client.put<Produto>(`${BASE_URL}/${id}`, updates);
  }

  async delete(id: ID): Promise<void> {
    const client = getHttpClient();
    await client.delete(`${BASE_URL}/${id}`);
  }

  async getStats(): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    baixoEstoque: number;
    valorEstoque: number;
  }> {
    const response = await this.list({ pageSize: 1000 });
    
    const stats = {
      total: response.total,
      ativos: response.items.filter(p => p.ativo).length,
      inativos: response.items.filter(p => !p.ativo).length,
      baixoEstoque: response.items.filter(p => p.estoque <= p.estoqueMinimo).length,
      valorEstoque: response.items.reduce((acc, p) => acc + (p.estoque * p.custo), 0),
    };
    
    return stats;
  }
}

export const produtosService = new ProdutosService();
