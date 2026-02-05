/**
 * Service: Configurações do Vendedor
 * Gerencia configurações personalizadas de preços e preferências
 */

import { getHttpClient } from '@/services/http/client';
import type { 
  ConfiguracaoVendedor, 
  CreateConfiguracaoVendedorDTO, 
  UpdateConfiguracaoVendedorDTO 
} from './vendedor.types';

const BASE_URL = '/api/configuracoes-vendedor';

export const vendedorService = {
  /**
   * Buscar configuração do vendedor logado
   */
  async getMinhaConfiguracao(): Promise<ConfiguracaoVendedor | null> {
    const client = getHttpClient();
    const response = await client.get<ConfiguracaoVendedor[]>(BASE_URL);
    // Retorna a primeira configuração do usuário atual
    // Em produção, filtrar por usuarioId do contexto de autenticação
    return response[0] || null;
  },

  /**
   * Buscar configuração por ID do vendedor
   */
  async getConfiguracaoPorUsuario(usuarioId: string): Promise<ConfiguracaoVendedor | null> {
    const client = getHttpClient();
    const response = await client.get<ConfiguracaoVendedor[]>(BASE_URL, {
      params: { usuarioId }
    });
    return response[0] || null;
  },

  /**
   * Criar configuração inicial
   */
  async create(data: CreateConfiguracaoVendedorDTO): Promise<ConfiguracaoVendedor> {
    const client = getHttpClient();
    const agora = Date.now();
    
    const configuracao: Omit<ConfiguracaoVendedor, 'id'> & { id: string } = {
      id: crypto.randomUUID(),
      ...data,
      criadoEm: agora,
      atualizadoEm: agora,
    };

    return client.post<ConfiguracaoVendedor>(BASE_URL, configuracao);
  },

  /**
   * Atualizar configuração
   */
  async update(id: string, data: UpdateConfiguracaoVendedorDTO): Promise<ConfiguracaoVendedor> {
    const client = getHttpClient();
    const updates = {
      ...data,
      atualizadoEm: Date.now(),
    };

    return client.put<ConfiguracaoVendedor>(`${BASE_URL}/${id}`, updates);
  },

  /**
   * Atualizar apenas preços de materiais
   */
  async updatePrecosMateriais(
    id: string, 
    precos: ConfiguracaoVendedor['precosMateriais']
  ): Promise<ConfiguracaoVendedor> {
    return this.update(id, { precosMateriais: precos });
  },

  /**
   * Atualizar margem de lucro
   */
  async updateMargemLucro(id: string, margem: number): Promise<ConfiguracaoVendedor> {
    return this.update(id, { margemLucroPadrao: margem });
  },

  /**
   * Criar configuração padrão para novo vendedor
   */
  async criarConfiguracaoPadrao(usuarioId: string, nomeVendedor: string): Promise<ConfiguracaoVendedor> {
    const agora = Date.now();
    const configuracaoPadrao: CreateConfiguracaoVendedorDTO = {
      usuarioId,
      nomeVendedor,
      precosMateriais: {
        '201': { precoPorKg: 15.50, dataAtualizacao: agora },
        '304': { precoPorKg: 22.80, dataAtualizacao: agora },
        '316': { precoPorKg: 35.60, dataAtualizacao: agora },
        '430': { precoPorKg: 18.90, dataAtualizacao: agora },
      },
      margemLucroPadrao: 35, // 35%
      custoMaoDeObraPorHora: 45.00,
      tempoMedioBancada: 8, // 8 horas
      materialPadrao: '304',
      acabamentoPadrao: 'escovado',
      espessuraPadrao: 0.8,
      espessurasDisponiveis: [0.6, 0.8, 1.0, 1.2, 1.5, 2.0],
      embalagens: [
        {
          tipo: 'plastico-bolha',
          custoBase: 25.00,
          descricao: 'Proteção básica com plástico bolha',
          ativo: true,
        },
        {
          tipo: 'papelao',
          custoBase: 45.00,
          descricao: 'Caixa de papelão reforçado',
          ativo: true,
        },
        {
          tipo: 'madeira',
          custoBase: 180.00,
          descricao: 'Caixa de madeira para transporte pesado',
          ativo: true,
        },
        {
          tipo: 'stretch',
          custoBase: 15.00,
          descricao: 'Filme stretch industrial',
          ativo: true,
        },
        {
          tipo: 'sem-embalagem',
          custoBase: 0,
          descricao: 'Sem embalagem - retirada local',
          ativo: true,
        },
      ],
      embalagemPadrao: 'plastico-bolha',
      custosAdicionais: {
        transporte: 0,
        impostos: 0,
        outros: 0,
      },
    };

    return this.create(configuracaoPadrao);
  },
};