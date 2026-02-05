/**
 * Tipos do domínio de Produtos
 */

import type { ID } from '@/shared/types/ids';

export type ProdutoTipo = 'Acabado' | 'Semiacabado' | 'Matéria-Prima' | 'Componente';
export type ProdutoUnidade = 'UN' | 'KG' | 'MT' | 'M2' | 'M3' | 'LT';

export interface Produto {
  id: ID;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: ProdutoTipo;
  unidade: ProdutoUnidade;
  preco: number;
  custo: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateProdutoInput {
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: ProdutoTipo;
  unidade: ProdutoUnidade;
  preco: number;
  custo: number;
  estoqueMinimo: number;
  ativo: boolean;
  observacoes?: string;
}

export interface UpdateProdutoInput extends Partial<CreateProdutoInput> {}

export interface ProdutoFilters {
  search?: string;
  tipo?: ProdutoTipo | 'all';
  ativo?: boolean;
}
