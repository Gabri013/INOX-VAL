/**
 * Hooks React Query para Nesting
 * IMPORTANTE: Este módulo NÃO calcula BOM
 * BOM vem da Calculadora Rápida (/src/domains/calculadora/engine.ts)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { nestingService } from './nesting.service';
import type { ID } from '@/shared/types/ids';
import type { NestingFilters, CreateCalculoNestingInput, UpdateCalculoNestingInput, ParametrosCalculo } from './nesting.types';
import { PaginationParams } from '@/services/http/client';

const QUERY_KEY = 'nesting';

/**
 * Hook para listar cálculos
 */
export function useCalculos(params: PaginationParams & NestingFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', params],
    queryFn: () => nestingService.list(params),
  });
}

/**
 * Hook para buscar cálculo por ID
 */
export function useCalculo(id: ID | null) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', id],
    queryFn: () => nestingService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook para criar cálculo
 */
export function useCreateCalculo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { input: CreateCalculoNestingInput; parametros?: ParametrosCalculo }) =>
      nestingService.create(params.input, params.parametros),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cálculo criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar cálculo: ${error.message}`);
    },
  });
}

/**
 * Hook para atualizar cálculo
 */
export function useUpdateCalculo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { id: ID; input: UpdateCalculoNestingInput; parametros?: ParametrosCalculo }) =>
      nestingService.update(params.id, params.input, params.parametros),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cálculo atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar cálculo: ${error.message}`);
    },
  });
}

/**
 * Hook para remover cálculo
 */
export function useDeleteCalculo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: ID) => nestingService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cálculo removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover cálculo: ${error.message}`);
    },
  });
}

/**
 * Hook para aprovar cálculo
 */
export function useApproveCalculo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { id: ID; usuarioId: string }) =>
      nestingService.approve(params.id, params.usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cálculo aprovado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao aprovar cálculo: ${error.message}`);
    },
  });
}

/**
 * Hook para duplicar cálculo
 */
export function useDuplicateCalculo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { id: ID; usuarioId: string }) =>
      nestingService.duplicate(params.id, params.usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cálculo duplicado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao duplicar cálculo: ${error.message}`);
    },
  });
}

/**
 * Hook para converter cálculo em orçamento
 */
export function useConvertToOrcamento() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { id: ID; usuarioId: string }) =>
      nestingService.convertToOrcamento(params.id, params.usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cálculo convertido em orçamento com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao converter cálculo: ${error.message}`);
    },
  });
}

/**
 * Hook para listar templates de materiais
 */
export function useTemplates() {
  return useQuery({
    queryKey: [QUERY_KEY, 'templates'],
    queryFn: () => nestingService.listTemplates(),
  });
}

/**
 * Hook para estatísticas
 */
export function useNestingStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => nestingService.getStats(),
  });
}

// REMOVIDOS: useCatalogoModelos, useCatalogoModelo, useCalcularBOM
// Motivo: Catálogo de modelos agora vem de /src/bom/models (fonte única de verdade)
// BOM é calculado pela Calculadora Rápida (/src/domains/calculadora/engine.ts)