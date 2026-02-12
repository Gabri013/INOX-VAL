import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "@/lib/firebase";
import { FirestoreService, getCurrentUserId, getEmpresaId, writeAuditLog, type ServiceResult } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import type { Orcamento, OrdemProducao } from "@/app/types/workflow";

const db = getFirestore();

class OrdensService extends FirestoreService<OrdemProducao> {
  constructor() {
    super(COLLECTIONS.ordens_producao, { softDelete: true });
  }

  private toDateValue(value: unknown): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (value as { toDate?: unknown }).toDate === "function"
    ) {
      const dateValue = (value as { toDate: () => Date }).toDate();
      return dateValue instanceof Date ? dateValue : new Date();
    }
    return new Date();
  }

  async createFromApprovedBudgetAtomic(orcamentoId: string): Promise<ServiceResult<OrdemProducao>> {
    try {
      const empresaId = await getEmpresaId();
      const userId = await getCurrentUserId();
      const orcamentoRef = doc(db, COLLECTIONS.orcamentos, orcamentoId);
      const ordemRef = doc(collection(db, COLLECTIONS.ordens_producao));
      const numero = `OP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const transactionResult = await runTransaction(db, async (transaction) => {
        const orcamentoSnap = await transaction.get(orcamentoRef);

        if (!orcamentoSnap.exists()) {
          console.warn("[ordens] Conversão bloqueada: orçamento inexistente", { orcamentoId });
          throw new Error("ORCAMENTO_NAO_ENCONTRADO");
        }

        const orcamento = { id: orcamentoSnap.id, ...orcamentoSnap.data() } as Orcamento & {
          isDeleted?: boolean;
        };

        if (orcamento.empresaId !== empresaId) {
          console.warn("[ordens] Conversão bloqueada: acesso negado por empresaId", {
            orcamentoId,
            empresaIdSolicitante: empresaId,
            empresaIdDocumento: orcamento.empresaId,
          });
          throw new Error("ACESSO_NEGADO");
        }

        if (orcamento.isDeleted) {
          console.warn("[ordens] Conversão bloqueada: orçamento removido", { orcamentoId });
          throw new Error("ORCAMENTO_REMOVIDO");
        }

        if (orcamento.status !== "Aprovado") {
          console.warn("[ordens] Conversão bloqueada: orçamento não aprovado", {
            orcamentoId,
            status: orcamento.status,
          });
          throw new Error("ORCAMENTO_NAO_APROVADO");
        }

        if (orcamento.ordemId) {
          console.warn("[ordens] Conversão bloqueada: orçamento já possui ordemId", {
            orcamentoId,
            ordemId: orcamento.ordemId,
          });
          throw new Error("ORCAMENTO_JA_CONVERTIDO");
        }

        const dataAprovacao = this.toDateValue(
          (orcamento as { aprovadoEm?: unknown }).aprovadoEm ??
            (orcamento as { updatedAt?: unknown }).updatedAt ??
            orcamento.data
        );

        const dataAbertura = new Date();
        const dataPrevisao = new Date(dataAprovacao.getTime() + 15 * 24 * 60 * 60 * 1000);

        const novaOrdem: Record<string, unknown> = {
          numero,
          orcamentoId: orcamento.id,
          clienteId: orcamento.clienteId,
          clienteNome: orcamento.clienteNome,
          dataAbertura,
          dataPrevisao,
          status: "Pendente",
          itens: (orcamento.itens || []).map((item) => ({
            id: item.id,
            produtoId: item.modeloId,
            produtoNome: item.descricao,
            quantidade: item.quantidade,
            unidade: "un",
            precoUnitario: item.precoUnitario,
            subtotal: item.subtotal,
          })),
          total: orcamento.total,
          prioridade: "Normal",
          observacoes: `Convertido do orçamento ${orcamento.numero}`,
          materiaisReservados: false,
          materiaisConsumidos: false,
          empresaId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: userId,
          updatedBy: userId,
          isDeleted: false,
        };

        transaction.set(ordemRef, novaOrdem);
        transaction.update(orcamentoRef, {
          ordemId: ordemRef.id,
          updatedAt: serverTimestamp(),
          updatedBy: userId,
        });

        return {
          ordemId: ordemRef.id,
          orcamentoAntes: orcamento,
          orcamentoDepois: { ...orcamento, ordemId: ordemRef.id },
          ordemCriada: { id: ordemRef.id, ...novaOrdem } as OrdemProducao,
        };
      });

      await writeAuditLog({
        action: "create",
        collection: COLLECTIONS.ordens_producao,
        documentId: transactionResult.ordemId,
        before: null,
        after: transactionResult.ordemCriada as unknown as Record<string, unknown>,
        empresaId,
        userId,
      });

      await writeAuditLog({
        action: "update",
        collection: COLLECTIONS.orcamentos,
        documentId: orcamentoId,
        before: transactionResult.orcamentoAntes as unknown as Record<string, unknown>,
        after: transactionResult.orcamentoDepois as unknown as Record<string, unknown>,
        empresaId,
        userId,
      });

      console.info("[ordens] Conversão orçamento->OP concluída", {
        orcamentoId,
        ordemId: transactionResult.ordemId,
      });

      const created = await this.getById(transactionResult.ordemId);
      return created.success && created.data
        ? created
        : { success: true, data: transactionResult.ordemCriada };
    } catch (error) {
      const code = error instanceof Error ? error.message : "ERRO_DESCONHECIDO";

      if (code === "ORCAMENTO_JA_CONVERTIDO") {
        return { success: false, error: "Este orçamento já foi convertido em OP" };
      }
      if (code === "ORCAMENTO_NAO_APROVADO") {
        return { success: false, error: "Apenas orçamentos aprovados podem gerar OP" };
      }
      if (code === "ORCAMENTO_NAO_ENCONTRADO") {
        return { success: false, error: "Orçamento não encontrado" };
      }
      if (code === "ACESSO_NEGADO") {
        return { success: false, error: "Acesso negado para converter este orçamento" };
      }
      if (code === "ORCAMENTO_REMOVIDO") {
        return { success: false, error: "Não é possível converter um orçamento removido" };
      }

      console.error("[ordens] Falha na conversão orçamento->OP", { orcamentoId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao converter orçamento em OP",
      };
    }
  }
}

export const ordensService = new OrdensService();
