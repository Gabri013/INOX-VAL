/**
 * Hooks React Query para Clientes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientesService } from './clientes.service';
import type { ID } from '@/shared/types/ids';
import type { CreateClienteInput, UpdateClienteInput, ClienteFilters } from './clientes.types';
import { PaginationParams } from '@/services/http/client';

const QUERY_KEY = 'clientes';

/**
 * Hook para listar clientes
 */
export function useClientes(params: PaginationParams & ClienteFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', params],
    queryFn: () => clientesService.list(params),
  });
}

/**
 * Hook para buscar cliente por ID
 */
export function useCliente(id: ID | null) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', id],
    queryFn: () => clientesService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook para estatísticas de clientes
 */
export function useClientesStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => clientesService.getStats(),
  });
}

/**
 * Hook para criar cliente
 */
export function useCreateCliente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateClienteInput) => clientesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar cliente: ${error.message}`);
    },
  });
}

/**
 * Hook para atualizar cliente
 */
export function useUpdateCliente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: ID; data: UpdateClienteInput }) =>
      clientesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar cliente: ${error.message}`);
    },
  });
}

/**
 * Hook para deletar cliente
 */
export function useDeleteCliente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: ID) => clientesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir cliente: ${error.message}`);
    },
  });
}
