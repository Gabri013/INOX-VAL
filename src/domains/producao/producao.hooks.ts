/**
 * Hooks React Query para Produção
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { producaoService } from './producao.service';
import type { SetorProducao } from './producao.types';

const QUERY_KEY = 'producao';

/**
 * Hook para listar ordens de produção
 */
export function useOrdensProducao(filters?: any) {
  return useQuery({
    queryKey: [QUERY_KEY, 'ordens', filters],
    queryFn: () => producaoService.listOrdens(filters),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}

/**
 * Hook para buscar ordem específica
 */
export function useOrdemProducao(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, 'ordem', id],
    queryFn: () => producaoService.getOrdem(id!),
    enabled: !!id,
    refetchInterval: 15000, // Atualiza a cada 15 segundos
  });
}

/**
 * Hook para itens de um setor
 */
export function useItensSetor(setor: SetorProducao | null) {
  return useQuery({
    queryKey: [QUERY_KEY, 'setor', setor],
    queryFn: () => producaoService.getItensPorSetor(setor!),
    enabled: !!setor,
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });
}

/**
 * Hook para dashboard de setores
 */
export function useDashboardSetores(setor?: SetorProducao) {
  return useQuery({
    queryKey: [QUERY_KEY, 'dashboard', setor],
    queryFn: () => producaoService.getDashboardSetor(setor),
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
}

/**
 * Hook para consultar materiais
 */
export function useConsultaMateriais(itemId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, 'materiais', itemId],
    queryFn: () => producaoService.consultarMateriais(itemId!),
    enabled: !!itemId,
  });
}

/**
 * Hook para dar entrada em setor
 */
export function useEntradaSetor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, setor, observacoes }: { 
      itemId: string; 
      setor: SetorProducao; 
      observacoes?: string 
    }) => producaoService.entradaSetor(itemId, setor, observacoes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`Item movido para ${variables.setor}`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao dar entrada: ${error.message}`);
    },
  });
}

/**
 * Hook para dar saída de setor
 */
export function useSaidaSetor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, observacoes }: { itemId: string; observacoes?: string }) =>
      producaoService.saidaSetor(itemId, observacoes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Item finalizado no setor');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao dar saída: ${error.message}`);
    },
  });
}

/**
 * Hook para atualizar progresso
 */
export function useAtualizarProgresso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, progresso }: { itemId: string; progresso: number }) =>
      producaoService.atualizarProgresso(itemId, progresso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar progresso: ${error.message}`);
    },
  });
}

/**
 * Hook para rejeitar item
 */
export function useRejeitarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, motivo }: { itemId: string; motivo: string }) =>
      producaoService.rejeitarItem(itemId, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.error('Item rejeitado');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao rejeitar item: ${error.message}`);
    },
  });
}

/**
 * Hook para pausar item
 */
export function usePausarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, motivo }: { itemId: string; motivo: string }) =>
      producaoService.pausarItem(itemId, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.warning('Produção pausada');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao pausar: ${error.message}`);
    },
  });
}

/**
 * Hook para retomar item
 */
export function useRetomarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => producaoService.retomarItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Produção retomada');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao retomar: ${error.message}`);
    },
  });
}
