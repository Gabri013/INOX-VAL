/**
 * Hooks React Query para usuários
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from './usuarios.service';
import type { ID } from '@/shared/types/ids';
import type { Usuario, CreateUsuarioInput, UpdateUsuarioInput, UsuariosFilters } from './usuarios.types';
import { toast } from 'sonner';

// Query keys
export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  list: (filters?: UsuariosFilters) => [...usuariosKeys.lists(), { filters }] as const,
  details: () => [...usuariosKeys.all, 'detail'] as const,
  detail: (id: ID) => [...usuariosKeys.details(), id] as const,
  stats: () => [...usuariosKeys.all, 'stats'] as const,
};

/**
 * Hook para listar usuários
 */
export function useUsuarios(filters?: UsuariosFilters) {
  return useQuery({
    queryKey: usuariosKeys.list(filters),
    queryFn: () => usuariosService.getAll(filters),
  });
}

/**
 * Hook para buscar usuário por ID
 */
export function useUsuario(id: ID) {
  return useQuery({
    queryKey: usuariosKeys.detail(id),
    queryFn: () => usuariosService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para estatísticas
 */
export function useUsuariosStats() {
  return useQuery({
    queryKey: usuariosKeys.stats(),
    queryFn: () => usuariosService.getStats(),
  });
}

/**
 * Hook para criar usuário
 */
export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUsuarioInput) => usuariosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.stats() });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar usuário');
    },
  });
}

/**
 * Hook para atualizar usuário
 */
export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: ID; data: UpdateUsuarioInput }) =>
      usuariosService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.stats() });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar usuário');
    },
  });
}

/**
 * Hook para deletar usuário
 */
export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: ID) => usuariosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.stats() });
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir usuário');
    },
  });
}

/**
 * Hook para alterar senha
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      id,
      senhaAtual,
      novaSenha,
    }: {
      id: ID;
      senhaAtual: string;
      novaSenha: string;
    }) => usuariosService.changePassword(id, senhaAtual, novaSenha),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao alterar senha');
    },
  });
}

/**
 * Hook para atualizar permissões customizadas
 */
export function useUpdatePermissoes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permissoes }: { id: ID; permissoes: Usuario['permissoesCustomizadas'] }) =>
      usuariosService.updatePermissoes(id, permissoes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(variables.id) });
      toast.success('Permissões atualizadas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar permissões');
    },
  });
}

/**
 * Hook para resetar permissões para padrão
 */
export function useResetPermissoes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: ID) => usuariosService.resetPermissoes(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(id) });
      toast.success('Permissões resetadas para padrão!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao resetar permissões');
    },
  });
}
