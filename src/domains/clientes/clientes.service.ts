/**
 * Serviço de Clientes
 * Camada de acesso a dados para o domínio de clientes
 */

import { getHttpClient, PaginatedResponse, PaginationParams } from '@/services/http/client';
import { newId, type ID } from '@/shared/types/ids';
import { toISOString } from '@/shared/lib/format';
import type { Cliente, CreateClienteInput, UpdateClienteInput, ClienteFilters } from './clientes.types';

const BASE_URL = '/api/clientes';

class ClientesService {
  /**
   * Lista clientes com paginação e filtros
   */
  async list(
    params: PaginationParams & ClienteFilters = {}
  ): Promise<PaginatedResponse<Cliente>> {
    const client = getHttpClient();
    
    // Transforma filtros customizados em params
    const apiParams: PaginationParams = {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    };
    
    if (params.status && params.status !== 'all') {
      apiParams.status = params.status;
    }
    
    if (params.cidade) {
      apiParams.cidade = params.cidade;
    }
    
    if (params.estado) {
      apiParams.estado = params.estado;
    }
    
    return client.get<PaginatedResponse<Cliente>>(BASE_URL, { params: apiParams });
  }

  /**
   * Busca cliente por ID
   */
  async getById(id: ID): Promise<Cliente> {
    const client = getHttpClient();
    return client.get<Cliente>(`${BASE_URL}/${id}`);
  }

  /**
   * Cria novo cliente
   */
  async create(data: CreateClienteInput): Promise<Cliente> {
    const client = getHttpClient();
    
    const cliente: Cliente = {
      id: newId(),
      ...data,
      totalCompras: 0,
      criadoEm: toISOString(new Date()),
      atualizadoEm: toISOString(new Date()),
    };
    
    return client.post<Cliente>(BASE_URL, cliente);
  }

  /**
   * Atualiza cliente existente
   */
  async update(id: ID, data: UpdateClienteInput): Promise<Cliente> {
    const client = getHttpClient();
    
    const updates = {
      ...data,
      atualizadoEm: toISOString(new Date()),
    };
    
    return client.put<Cliente>(`${BASE_URL}/${id}`, updates);
  }

  /**
   * Deleta cliente
   */
  async delete(id: ID): Promise<void> {
    const client = getHttpClient();
    await client.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Busca estatísticas de clientes
   */
  async getStats(): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    bloqueados: number;
    volumeTotal: number;
  }> {
    // Por enquanto, calcula baseado na listagem
    // No backend real, seria um endpoint separado
    const response = await this.list({ pageSize: 1000 });
    
    const stats = {
      total: response.total,
      ativos: response.items.filter(c => c.status === 'Ativo').length,
      inativos: response.items.filter(c => c.status === 'Inativo').length,
      bloqueados: response.items.filter(c => c.status === 'Bloqueado').length,
      volumeTotal: response.items.reduce((acc, c) => acc + c.totalCompras, 0),
    };
    
    return stats;
  }
}

export const clientesService = new ClientesService();
