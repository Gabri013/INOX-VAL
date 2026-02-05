/**
 * Hooks React Query para Produtos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { produtosService } from './produtos.service';
import type { ID } from '@/shared/types/ids';
import type { CreateProdutoInput, UpdateProdutoInput, ProdutoFilters } from './produtos.types';
import { PaginationParams } from '@/services/http/client';

const QUERY_KEY = 'produtos';

export function useProdutos(params: PaginationParams & ProdutoFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', params],
    queryFn: () => produtosService.list(params),
  });
}

export function useProduto(id: ID | null) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', id],
    queryFn: () => produtosService.getById(id!),
    enabled: !!id,
  });
}

export function useProdutosStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => produtosService.getStats(),
  });
}

export function useCreateProduto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProdutoInput) => produtosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar produto: ${error.message}`);
    },
  });
}

export function useUpdateProduto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: ID; data: UpdateProdutoInput }) =>
      produtosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    },
  });
}

export function useDeleteProduto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: ID) => produtosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir produto: ${error.message}`);
    },
  });
}
