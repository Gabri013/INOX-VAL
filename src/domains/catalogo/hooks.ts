/**
 * React Query Hooks para Calculadora Rápida
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  insumosService, 
  produtosPadronizadosService, 
  calculadoraService 
} from './services';
import { 
  ItemCalculadora, 
  ResultadoCalculadora,
  CalculadoraOrcamento 
} from './types';

// Query Keys
export const catalogoKeys = {
  all: ['catalogo'] as const,
  insumos: () => [...catalogoKeys.all, 'insumos'] as const,
  insumo: (id: string) => [...catalogoKeys.insumos(), id] as const,
  insumosByTipo: (tipo: string) => [...catalogoKeys.insumos(), 'tipo', tipo] as const,
  
  produtos: () => [...catalogoKeys.all, 'produtos-padronizados'] as const,
  produto: (id: string) => [...catalogoKeys.produtos(), id] as const,
  produtosByTipo: (tipo: string) => [...catalogoKeys.produtos(), 'tipo', tipo] as const,
  
  orcamentos: () => [...catalogoKeys.all, 'orcamentos'] as const,
  orcamento: (id: string) => [...catalogoKeys.orcamentos(), id] as const,
};

// Hooks - Insumos
export function useInsumos() {
  return useQuery({
    queryKey: catalogoKeys.insumos(),
    queryFn: insumosService.getAll,
  });
}

export function useInsumo(id: string) {
  return useQuery({
    queryKey: catalogoKeys.insumo(id),
    queryFn: () => insumosService.getById(id),
    enabled: !!id,
  });
}

export function useInsumosByTipo(tipo: string) {
  return useQuery({
    queryKey: catalogoKeys.insumosByTipo(tipo),
    queryFn: () => insumosService.getByTipo(tipo),
    enabled: !!tipo,
  });
}

// Hooks - Produtos Padronizados
export function useProdutosPadronizados() {
  return useQuery({
    queryKey: catalogoKeys.produtos(),
    queryFn: produtosPadronizadosService.getAll,
  });
}

export function useProdutoPadrao(id: string) {
  return useQuery({
    queryKey: catalogoKeys.produto(id),
    queryFn: () => produtosPadronizadosService.getById(id),
    enabled: !!id,
  });
}

export function useProdutosPadraoByTipo(tipo: string) {
  return useQuery({
    queryKey: catalogoKeys.produtosByTipo(tipo),
    queryFn: () => produtosPadronizadosService.getByTipo(tipo),
    enabled: !!tipo,
  });
}

// Hooks - Calculadora
export function useCalcularOrcamento() {
  return useMutation({
    mutationFn: ({ 
      itens, 
      margemLucro 
    }: { 
      itens: ItemCalculadora[]; 
      margemLucro: number 
    }) => calculadoraService.calcular(itens, margemLucro),
  });
}

export function useSalvarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resultado: ResultadoCalculadora) => 
      calculadoraService.salvarOrcamento(resultado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogoKeys.orcamentos() });
    },
  });
}

export function useOrcamentos() {
  return useQuery({
    queryKey: catalogoKeys.orcamentos(),
    queryFn: calculadoraService.getOrcamentos,
  });
}

export function useOrcamento(id: string) {
  return useQuery({
    queryKey: catalogoKeys.orcamento(id),
    queryFn: () => calculadoraService.getOrcamentoById(id),
    enabled: !!id,
  });
}

export function useAtualizarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<CalculadoraOrcamento> 
    }) => calculadoraService.atualizarOrcamento(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: catalogoKeys.orcamento(variables.id) });
      queryClient.invalidateQueries({ queryKey: catalogoKeys.orcamentos() });
    },
  });
}
