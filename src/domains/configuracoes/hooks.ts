/**
 * React Query hooks para Configurações
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configuracoesService } from './services';
import type { UpdateConfiguracoesInput } from './types';
import { toast } from 'sonner';

/**
 * Hook para buscar configurações do usuário
 */
export function useMinhasConfiguracoes() {
  return useQuery({
    queryKey: ['configuracoes', 'me'],
    queryFn: () => configuracoesService.getMinhasConfiguracoes(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para atualizar configurações
 */
export function useUpdateConfiguracoes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateConfiguracoesInput) =>
      configuracoesService.updateConfiguracoes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao atualizar configurações');
    },
  });
}

/**
 * Hook para resetar configurações
 */
export function useResetConfiguracoes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => configuracoesService.resetConfiguracoes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast.success('Configurações resetadas para o padrão!');
    },
    onError: (error) => {
      console.error('Erro ao resetar configurações:', error);
      toast.error('Erro ao resetar configurações');
    },
  });
}
