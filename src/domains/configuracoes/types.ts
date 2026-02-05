/**
 * Tipos para o domínio de Configurações do Usuário
 */

import type { ID } from '@/shared/types/ids';

/**
 * Configurações de vendas personalizadas por usuário
 */
export interface ConfiguracoesVendas {
  margemLucroDefault: number; // Porcentagem padrão de margem de lucro
  descontoMaximo: number; // Desconto máximo permitido para o usuário
  validadeOrcamentoDias: number; // Validade padrão de orçamentos em dias
  comissaoPercentual: number; // Comissão do vendedor
  incluirImpostosAutomatico: boolean;
  incluirFreteAutomatico: boolean;
}

/**
 * Configurações de notificações
 */
export interface ConfiguracoesNotificacoes {
  emailNovoOrcamento: boolean;
  emailOrcamentoAprovado: boolean;
  emailOrcamentoRejeitado: boolean;
  emailOrdemProducao: boolean;
  notificacaoPush: boolean;
  notificacaoSonora: boolean;
}

/**
 * Configurações de aparência
 */
export interface ConfiguracoesAparencia {
  tema: 'light' | 'dark' | 'auto';
  idioma: 'pt-BR' | 'en' | 'es';
  densidade: 'comfortable' | 'compact' | 'spacious';
  exibirCodigos: boolean; // Exibir códigos de produtos sempre
  formatoData: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  formatoMoeda: 'BRL' | 'USD' | 'EUR';
}

/**
 * Dados da empresa para branding (usado em PDFs)
 */
export interface DadosEmpresa {
  nome: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  website?: string;
  logo?: string; // Base64 ou URL
}

/**
 * Configurações completas do usuário
 */
export interface ConfiguracoesUsuario {
  id: ID;
  usuarioId: ID;
  vendas: ConfiguracoesVendas;
  notificacoes: ConfiguracoesNotificacoes;
  aparencia: ConfiguracoesAparencia;
  empresa: DadosEmpresa;
  updatedAt: Date;
}

/**
 * Input para criar configurações
 */
export type CreateConfiguracoesInput = Omit<ConfiguracoesUsuario, 'id' | 'updatedAt'>;

/**
 * Input para atualizar configurações
 */
export type UpdateConfiguracoesInput = Partial<Omit<ConfiguracoesUsuario, 'id' | 'usuarioId' | 'updatedAt'>>;

/**
 * Configurações padrão
 */
export const DEFAULT_CONFIGURACOES: Omit<ConfiguracoesUsuario, 'id' | 'usuarioId' | 'updatedAt'> = {
  vendas: {
    margemLucroDefault: 50,
    descontoMaximo: 15,
    validadeOrcamentoDias: 30,
    comissaoPercentual: 3,
    incluirImpostosAutomatico: true,
    incluirFreteAutomatico: false,
  },
  notificacoes: {
    emailNovoOrcamento: true,
    emailOrcamentoAprovado: true,
    emailOrcamentoRejeitado: true,
    emailOrdemProducao: true,
    notificacaoPush: true,
    notificacaoSonora: false,
  },
  aparencia: {
    tema: 'light',
    idioma: 'pt-BR',
    densidade: 'comfortable',
    exibirCodigos: true,
    formatoData: 'DD/MM/YYYY',
    formatoMoeda: 'BRL',
  },
  empresa: {
    nome: 'Indústria de Inox LTDA',
    cnpj: '00.000.000/0001-00',
    endereco: 'Rua Industrial, 1000',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01000-000',
    telefone: '(11) 1234-5678',
    email: 'contato@industria-inox.com.br',
    website: 'www.industria-inox.com.br',
  },
};
