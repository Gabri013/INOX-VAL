/**
 * ============================================================================
 * HOOK: useOrdens
 * ============================================================================
 * 
 * Hook React para gerenciar ordens de produção usando Firebase.
 * 
 * Funcionalidades:
 * - Carregar lista de ordens
 * - Criar OP de orçamento
 * - Atualizar ordem
 * - Deletar ordem
 * - Iniciar/Pausar/Retomar/Concluir produção
 * - Cancelar ordem
 * - Filtrar por status e cliente
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { ordensService } from '@/services/firebase/ordens.service';
import type { OrdemProducao, StatusOrdem } from '@/app/types/workflow';
import type { ServiceResult } from '@/services/firebase/base.service';
import { toast } from 'sonner';

interface UseOrdensOptions {
  autoLoad?: boolean;
  status?: StatusOrdem;
  clienteId?: string;
}

export function useOrdens(options: UseOrdensOptions = {}) {
  const { autoLoad = true, status, clienteId } = options;
  
  const [ordens, setOrdens] = useState<OrdemProducao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar ordens
  const loadOrdens = async () => {
    try {
      setLoading(true);
      setError(null);

      let result: ServiceResult<OrdemProducao[]>;

      if (clienteId) {
        result = await ordensService.listByCliente(clienteId);
      } else if (status) {
        result = await ordensService.listByStatus(status);
      } else {
        const listResult = await ordensService.list({
          orderBy: [{ field: 'dataAbertura', direction: 'desc' }],
        });
        result = {
          success: listResult.success,
          data: listResult.data?.items,
          error: listResult.error,
        };
      }

      if (result.success && result.data) {
        setOrdens(result.data);
      } else {
        setError(result.error || 'Erro ao carregar ordens');
        toast.error(result.error || 'Erro ao carregar ordens');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Criar OP de orçamento
  const createOrdemDeOrcamento = async (
    orcamentoId: string
  ): Promise<ServiceResult<OrdemProducao>> => {
    try {
      setLoading(true);

      const result = await ordensService.criarDeOrcamento(orcamentoId);

      if (result.success && result.data) {
        setOrdens((prev) => [result.data!, ...prev]);
        toast.success(`OP ${result.data.numero} criada com sucesso!`);
      } else {
        toast.error(result.error || 'Erro ao criar ordem de produção');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Atualizar ordem
  const updateOrdem = async (
    id: string,
    updates: Partial<Omit<OrdemProducao, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<ServiceResult<OrdemProducao>> => {
    try {
      setLoading(true);

      const result = await ordensService.update(id, updates);

      if (result.success && result.data) {
        setOrdens((prev) =>
          prev.map((o) => (o.id === id ? result.data! : o))
        );
        toast.success('Ordem atualizada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao atualizar ordem');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Deletar ordem
  const deleteOrdem = async (id: string): Promise<ServiceResult<void>> => {
    try {
      setLoading(true);

      const result = await ordensService.delete(id);

      if (result.success) {
        setOrdens((prev) => prev.filter((o) => o.id !== id));
        toast.success('Ordem removida com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao remover ordem');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Iniciar produção
  const iniciarProducao = async (
    id: string,
    operadorNome: string
  ): Promise<ServiceResult<OrdemProducao>> => {
    try {
      setLoading(true);

      const result = await ordensService.iniciarProducao(id, operadorNome);

      if (result.success && result.data) {
        setOrdens((prev) =>
          prev.map((o) => (o.id === id ? result.data! : o))
        );
        toast.success('Produção iniciada!');
      } else {
        toast.error(result.error || 'Erro ao iniciar produção');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Pausar produção
  const pausarProducao = async (
    id: string,
    motivo?: string
  ): Promise<ServiceResult<OrdemProducao>> => {
    try {
      setLoading(true);

      const result = await ordensService.pausarProducao(id, motivo);

      if (result.success && result.data) {
        setOrdens((prev) =>
          prev.map((o) => (o.id === id ? result.data! : o))
        );
        toast.success('Produção pausada');
      } else {
        toast.error(result.error || 'Erro ao pausar produção');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Retomar produção
  const retomarProducao = async (id: string): Promise<ServiceResult<OrdemProducao>> => {
    try {
      setLoading(true);

      const result = await ordensService.retomarProducao(id);

      if (result.success && result.data) {
        setOrdens((prev) =>
          prev.map((o) => (o.id === id ? result.data! : o))
        );
        toast.success('Produção retomada!');
      } else {
        toast.error(result.error || 'Erro ao retomar produção');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Concluir produção
  const concluirProducao = async (id: string): Promise<ServiceResult<OrdemProducao>> => {
    try {
      setLoading(true);

      const result = await ordensService.concluirProducao(id);

      if (result.success && result.data) {
        setOrdens((prev) =>
          prev.map((o) => (o.id === id ? result.data! : o))
        );
        toast.success('Produção concluída!');
      } else {
        toast.error(result.error || 'Erro ao concluir produção');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Cancelar ordem
  const cancelarOrdem = async (
    id: string,
    motivo?: string
  ): Promise<ServiceResult<OrdemProducao>> => {
    try {
      setLoading(true);

      const result = await ordensService.cancelar(id, motivo);

      if (result.success && result.data) {
        setOrdens((prev) =>
          prev.map((o) => (o.id === id ? result.data! : o))
        );
        toast.success('Ordem cancelada');
      } else {
        toast.error(result.error || 'Erro ao cancelar ordem');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Buscar por ID
  const getOrdemById = async (id: string): Promise<OrdemProducao | null> => {
    try {
      setLoading(true);
      const result = await ordensService.getById(id);

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (err) {
      toast.error('Erro ao buscar ordem');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-load ao montar
  useEffect(() => {
    if (autoLoad) {
      loadOrdens();
    }
  }, [autoLoad, status, clienteId]);

  return {
    ordens,
    loading,
    error,
    loadOrdens,
    createOrdemDeOrcamento,
    updateOrdem,
    deleteOrdem,
    iniciarProducao,
    pausarProducao,
    retomarProducao,
    concluirProducao,
    cancelarOrdem,
    getOrdemById,
  };
}
