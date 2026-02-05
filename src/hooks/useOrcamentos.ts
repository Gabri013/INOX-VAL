/**
 * ============================================================================
 * HOOK: useOrcamentos
 * ============================================================================
 * 
 * Hook React para gerenciar orçamentos usando Firebase.
 * 
 * Funcionalidades:
 * - Carregar lista de orçamentos
 * - Criar novo orçamento
 * - Atualizar orçamento
 * - Deletar orçamento
 * - Aprovar/Rejeitar orçamento
 * - Filtrar por status e cliente
 * - Estatísticas
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { orcamentosService } from '@/services/firebase/orcamentos.service';
import type { Orcamento, StatusOrcamento } from '@/app/types/workflow';
import type { ServiceResult } from '@/services/firebase/base.service';
import { toast } from 'sonner';

interface UseOrcamentosOptions {
  autoLoad?: boolean;
  status?: StatusOrcamento;
  clienteId?: string;
}

export function useOrcamentos(options: UseOrcamentosOptions = {}) {
  const { autoLoad = true, status, clienteId } = options;
  
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar orçamentos
  const loadOrcamentos = async () => {
    try {
      setLoading(true);
      setError(null);

      let result: ServiceResult<Orcamento[]>;

      if (clienteId) {
        result = await orcamentosService.listByCliente(clienteId);
      } else if (status) {
        result = await orcamentosService.listByStatus(status);
      } else {
        const listResult = await orcamentosService.list({
          orderBy: [{ field: 'data', direction: 'desc' }],
        });
        result = {
          success: listResult.success,
          data: listResult.data?.items,
          error: listResult.error,
        };
      }

      if (result.success && result.data) {
        setOrcamentos(result.data);
      } else {
        setError(result.error || 'Erro ao carregar orçamentos');
        toast.error(result.error || 'Erro ao carregar orçamentos');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Criar orçamento
  const createOrcamento = async (
    data: Omit<Orcamento, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceResult<Orcamento>> => {
    try {
      setLoading(true);

      const result = await orcamentosService.create(data);

      if (result.success && result.data) {
        setOrcamentos((prev) => [result.data!, ...prev]);
        toast.success('Orçamento criado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao criar orçamento');
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

  // Atualizar orçamento
  const updateOrcamento = async (
    id: string,
    updates: Partial<Omit<Orcamento, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<ServiceResult<Orcamento>> => {
    try {
      setLoading(true);

      const result = await orcamentosService.update(id, updates);

      if (result.success && result.data) {
        setOrcamentos((prev) =>
          prev.map((o) => (o.id === id ? result.data! : o))
        );
        toast.success('Orçamento atualizado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao atualizar orçamento');
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

  // Deletar orçamento
  const deleteOrcamento = async (id: string): Promise<ServiceResult<void>> => {
    try {
      setLoading(true);

      const result = await orcamentosService.delete(id);

      if (result.success) {
        setOrcamentos((prev) => prev.filter((o) => o.id !== id));
        toast.success('Orçamento removido com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao remover orçamento');
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

  // Aprovar orçamento
  const aprovarOrcamento = async (id: string): Promise<ServiceResult<Orcamento>> => {
    try {
      setLoading(true);

      const result = await orcamentosService.aprovar(id);

      if (result.success && result.data) {
        setOrcamentos((prev) =>
          prev.map((o) => (o.id === id ? result.data! : o))
        );
        toast.success('Orçamento aprovado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao aprovar orçamento');
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

  // Rejeitar orçamento
  const rejeitarOrcamento = async (
    id: string,
    motivo?: string
  ): Promise<ServiceResult<Orcamento>> => {
    try {
      setLoading(true);

      const result = await orcamentosService.rejeitar(id, motivo);

      if (result.success && result.data) {
        setOrcamentos((prev) =>
          prev.map((o) => (o.id === id ? result.data! : o))
        );
        toast.success('Orçamento rejeitado');
      } else {
        toast.error(result.error || 'Erro ao rejeitar orçamento');
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
  const getOrcamentoById = async (id: string): Promise<Orcamento | null> => {
    try {
      setLoading(true);
      const result = await orcamentosService.getById(id);

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (err) {
      toast.error('Erro ao buscar orçamento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obter estatísticas
  const getEstatisticas = async () => {
    try {
      const result = await orcamentosService.getEstatisticas();

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (err) {
      toast.error('Erro ao carregar estatísticas');
      return null;
    }
  };

  // Auto-load ao montar
  useEffect(() => {
    if (autoLoad) {
      loadOrcamentos();
    }
  }, [autoLoad, status, clienteId]);

  return {
    orcamentos,
    loading,
    error,
    loadOrcamentos,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    aprovarOrcamento,
    rejeitarOrcamento,
    getOrcamentoById,
    getEstatisticas,
  };
}
