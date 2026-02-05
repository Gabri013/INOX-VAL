/**
 * Serviço de Estoque com sistema de movimentos
 * Gerencia saldo, disponibilidade e movimentações
 */

import { getHttpClient, PaginatedResponse, PaginationParams } from '@/services/http/client';
import { newId, type ID } from '@/shared/types/ids';
import { toISOString } from '@/shared/lib/format';
import { Storage } from '@/services/storage/db';
import { produtosService } from '../produtos/produtos.service';
import type { 
  MovimentoEstoque, 
  CreateMovimentoInput, 
  SaldoEstoque,
  EstoqueFilters 
} from './estoque.types';

const BASE_URL = '/api/movimentos-estoque';

class EstoqueService {
  /**
   * Lista movimentos com paginação e filtros
   */
  async listMovimentos(
    params: PaginationParams & EstoqueFilters = {}
  ): Promise<PaginatedResponse<MovimentoEstoque>> {
    const client = getHttpClient();
    
    const apiParams: PaginationParams = {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy || 'data',
      sortOrder: params.sortOrder || 'desc',
    };
    
    if (params.tipo && params.tipo !== 'all') {
      apiParams.tipo = params.tipo;
    }
    
    if (params.produtoId) {
      apiParams.produtoId = params.produtoId;
    }
    
    if (params.dataInicio) {
      apiParams.dataInicio = params.dataInicio;
    }
    
    if (params.dataFim) {
      apiParams.dataFim = params.dataFim;
    }
    
    return client.get<PaginatedResponse<MovimentoEstoque>>(BASE_URL, { params: apiParams });
  }

  /**
   * Calcula saldo atual de um produto baseado em movimentos
   */
  async calcularSaldo(produtoId: ID): Promise<{
    saldo: number;
    reservado: number;
    disponivel: number;
  }> {
    const storage = new Storage<MovimentoEstoque>('movimentos_estoque');
    const movimentos = await storage.getByIndex('by-produto', produtoId);
    
    let saldo = 0;
    let reservado = 0;
    
    for (const movimento of movimentos) {
      switch (movimento.tipo) {
        case 'ENTRADA':
        case 'AJUSTE':
          saldo += movimento.quantidade;
          break;
        case 'SAIDA':
          saldo -= movimento.quantidade;
          break;
        case 'RESERVA':
          reservado += movimento.quantidade;
          break;
        case 'ESTORNO':
          // Estorno é tratado no momento da criação
          break;
      }
    }
    
    return {
      saldo,
      reservado,
      disponivel: saldo - reservado,
    };
  }

  /**
   * Lista saldos de estoque de todos os produtos
   */
  async listSaldos(): Promise<SaldoEstoque[]> {
    // Busca todos os produtos
    const produtosResponse = await produtosService.list({ pageSize: 1000 });
    const produtos = produtosResponse.items;
    
    const saldos: SaldoEstoque[] = [];
    
    for (const produto of produtos) {
      const { saldo, reservado, disponivel } = await this.calcularSaldo(produto.id);
      
      // Busca última movimentação
      const storage = new Storage<MovimentoEstoque>('movimentos_estoque');
      const movimentos = await storage.getByIndex('by-produto', produto.id);
      const ultimaMovimentacao = movimentos.length > 0
        ? movimentos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0].data
        : undefined;
      
      saldos.push({
        produtoId: produto.id,
        produtoNome: produto.nome,
        produtoCodigo: produto.codigo,
        saldo,
        saldoDisponivel: disponivel,
        saldoReservado: reservado,
        estoqueMinimo: produto.estoqueMinimo,
        unidade: produto.unidade,
        ultimaMovimentacao,
      });
    }
    
    return saldos;
  }

  /**
   * Busca saldo de um produto específico
   */
  async getSaldo(produtoId: ID): Promise<SaldoEstoque> {
    const produto = await produtosService.getById(produtoId);
    const { saldo, reservado, disponivel } = await this.calcularSaldo(produtoId);
    
    const storage = new Storage<MovimentoEstoque>('movimentos_estoque');
    const movimentos = await storage.getByIndex('by-produto', produtoId);
    const ultimaMovimentacao = movimentos.length > 0
      ? movimentos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0].data
      : undefined;
    
    return {
      produtoId: produto.id,
      produtoNome: produto.nome,
      produtoCodigo: produto.codigo,
      saldo,
      saldoDisponivel: disponivel,
      saldoReservado: reservado,
      estoqueMinimo: produto.estoqueMinimo,
      unidade: produto.unidade,
      ultimaMovimentacao,
    };
  }

  /**
   * Cria movimento genérico (base interna)
   */
  private async criarMovimento(input: CreateMovimentoInput): Promise<MovimentoEstoque> {
    const produto = await produtosService.getById(input.produtoId);
    const { saldo } = await this.calcularSaldo(input.produtoId);
    
    const movimento: MovimentoEstoque = {
      id: newId(),
      produtoId: input.produtoId,
      produtoNome: produto.nome,
      produtoCodigo: produto.codigo,
      tipo: input.tipo,
      quantidade: input.quantidade,
      saldoAnterior: saldo,
      saldoNovo: input.tipo === 'ENTRADA' || input.tipo === 'AJUSTE'
        ? saldo + input.quantidade
        : saldo - input.quantidade,
      origem: input.origem,
      observacoes: input.observacoes,
      usuario: input.usuario,
      data: toISOString(new Date()),
      criadoEm: toISOString(new Date()),
    };
    
    const client = getHttpClient();
    return client.post<MovimentoEstoque>(BASE_URL, movimento);
  }

  /**
   * Entrada de material no estoque
   */
  async entrada(
    produtoId: ID,
    quantidade: number,
    origem: string,
    usuario: string,
    observacoes?: string
  ): Promise<MovimentoEstoque> {
    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser positiva');
    }
    
    return this.criarMovimento({
      produtoId,
      tipo: 'ENTRADA',
      quantidade,
      origem,
      usuario,
      observacoes,
    });
  }

  /**
   * Saída de material do estoque
   */
  async saida(
    produtoId: ID,
    quantidade: number,
    origem: string,
    usuario: string,
    observacoes?: string
  ): Promise<MovimentoEstoque> {
    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser positiva');
    }
    
    const { disponivel } = await this.calcularSaldo(produtoId);
    
    if (quantidade > disponivel) {
      throw new Error(`Saldo insuficiente. Disponível: ${disponivel}, Solicitado: ${quantidade}`);
    }
    
    return this.criarMovimento({
      produtoId,
      tipo: 'SAIDA',
      quantidade,
      origem,
      usuario,
      observacoes,
    });
  }

  /**
   * Reserva de material (não retira do estoque físico, mas bloqueia disponibilidade)
   */
  async reserva(
    produtoId: ID,
    quantidade: number,
    origem: string,
    usuario: string,
    observacoes?: string
  ): Promise<MovimentoEstoque> {
    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser positiva');
    }
    
    const { disponivel } = await this.calcularSaldo(produtoId);
    
    if (quantidade > disponivel) {
      throw new Error(`Saldo disponível insuficiente para reserva. Disponível: ${disponivel}, Solicitado: ${quantidade}`);
    }
    
    return this.criarMovimento({
      produtoId,
      tipo: 'RESERVA',
      quantidade,
      origem,
      usuario,
      observacoes: observacoes || 'Reserva automática',
    });
  }

  /**
   * Estorno de movimento (libera reserva ou reverte movimento)
   */
  async estorno(
    movimentoId: ID,
    usuario: string,
    observacoes?: string
  ): Promise<MovimentoEstoque> {
    const storage = new Storage<MovimentoEstoque>('movimentos_estoque');
    const movimentoOriginal = await storage.getById(movimentoId);
    
    if (!movimentoOriginal) {
      throw new Error('Movimento não encontrado');
    }
    
    if (movimentoOriginal.tipo === 'ESTORNO') {
      throw new Error('Não é possível estornar um estorno');
    }
    
    // Cria movimento inverso
    return this.criarMovimento({
      produtoId: movimentoOriginal.produtoId,
      tipo: 'ESTORNO',
      quantidade: movimentoOriginal.quantidade,
      origem: `Estorno de ${movimentoOriginal.tipo} - ${movimentoOriginal.origem}`,
      usuario,
      observacoes: observacoes || `Estorno do movimento ${movimentoId}`,
    });
  }

  /**
   * Ajuste de estoque (para correções)
   */
  async ajuste(
    produtoId: ID,
    quantidade: number,
    origem: string,
    usuario: string,
    observacoes?: string
  ): Promise<MovimentoEstoque> {
    return this.criarMovimento({
      produtoId,
      tipo: 'AJUSTE',
      quantidade: Math.abs(quantidade), // Ajuste pode ser positivo ou negativo
      origem,
      usuario,
      observacoes,
    });
  }

  /**
   * Estatísticas de estoque
   */
  async getStats(): Promise<{
    totalProdutos: number;
    totalMovimentos: number;
    baixoEstoque: number;
    semEstoque: number;
    valorTotal: number;
  }> {
    const saldos = await this.listSaldos();
    const storage = new Storage<MovimentoEstoque>('movimentos_estoque');
    const movimentos = await storage.getAll();
    
    const produtos = await produtosService.list({ pageSize: 1000 });
    
    let valorTotal = 0;
    for (const saldo of saldos) {
      const produto = produtos.items.find(p => p.id === saldo.produtoId);
      if (produto) {
        valorTotal += saldo.saldo * produto.custo;
      }
    }
    
    return {
      totalProdutos: saldos.length,
      totalMovimentos: movimentos.length,
      baixoEstoque: saldos.filter(s => s.saldo > 0 && s.saldo <= s.estoqueMinimo).length,
      semEstoque: saldos.filter(s => s.saldo === 0).length,
      valorTotal,
    };
  }
}

export const estoqueService = new EstoqueService();
