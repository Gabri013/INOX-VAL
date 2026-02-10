/**
 * ============================================================================
 * CHAT FIRESTORE SERVICE (novo padrão com auditoria + multi-tenant)
 * ============================================================================
 *
 * Substitui services/firebase/chat.service.ts.
 * Agrupa operações de conversas, mensagens e status do chat
 * usando FirestoreService<T> para conversas e helpers manuais
 * para mensagens (sub-coleção sem soft delete).
 * ============================================================================
 */

import {
  FirestoreService,
  getEmpresaId,
  getCurrentUserId,
  getCurrentUserProfile,
  writeAuditLog,
} from "./base";
import { COLLECTIONS } from "@/types/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  updateDoc,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { getFirestore } from "@/lib/firebase";
import type {
  ChatUser,
  ChatMessage,
  Conversa,
  ConversaDetalhada,
  CreateConversaDTO,
  SendMessageDTO,
  UpdateStatusDTO,
  ChatFilters,
  MensagensFilters,
} from "@/domains/chat";

const db = getFirestore();

// ---------------------------------------------------------------------------
// Conversas service (usa base com auditoria)
// ---------------------------------------------------------------------------
class ConversaService extends FirestoreService<Conversa> {
  constructor() {
    super(COLLECTIONS.conversas, { softDelete: false });
  }
}

const conversaService = new ConversaService();

// ---------------------------------------------------------------------------
// Chat service (API pública – substitui services/firebase/chat.service.ts)
// ---------------------------------------------------------------------------
export const chatService = {
  // -- Usuários do chat --
  async getUsuarios(filters?: ChatFilters) {
    const empresaId = await getEmpresaId();
    const constraints = [where("empresaId", "==", empresaId)];
    if (filters?.status) {
      constraints.push(where("status", "==", filters.status));
    }
    const q = query(collection(db, COLLECTIONS.chat_usuarios), ...constraints);
    const snap = await getDocs(q);
    let usuarios = snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as ChatUser));
    if (filters?.departamento) {
      usuarios = usuarios.filter((u) => u.departamento === filters.departamento);
    }
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      usuarios = usuarios.filter(
        (u) =>
          u.nome.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.departamento.toLowerCase().includes(term)
      );
    }
    return usuarios;
  },

  async getUsuario(id: string) {
    const ref = doc(db, COLLECTIONS.chat_usuarios, id);
    const snap = await getDoc(ref);
    return snap.exists() ? ({ id, ...snap.data() } as unknown as ChatUser) : null;
  },

  async updateStatus(data: UpdateStatusDTO) {
    const userId = await getCurrentUserId();
    const ref = doc(db, COLLECTIONS.chat_usuarios, userId);
    const snap = await getDoc(ref);
    const nowIso = new Date().toISOString();

    if (!snap.exists()) {
      const profile = await getCurrentUserProfile();
      const empresaId = await getEmpresaId();
      const nome =
        (profile as any)?.nome ||
        (profile as any)?.displayName ||
        (profile as any)?.name ||
        (profile as any)?.email ||
        "Usuário";
      const email = (profile as any)?.email || "";
      const departamento =
        (profile as any)?.departamento ||
        (profile as any)?.setor ||
        (profile as any)?.area ||
        "Geral";

      await setDoc(
        ref,
        {
          nome,
          email,
          departamento,
          status: data.status,
          ultimaAtividade: nowIso,
          empresaId,
          createdAt: serverTimestamp(),
          createdBy: userId,
          updatedAt: serverTimestamp(),
          updatedBy: userId,
        },
        { merge: true }
      );
      return;
    }

    await updateDoc(ref, {
      ...data,
      ultimaAtividade: nowIso,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
  },

  // -- Conversas --
  async getConversas() {
    const empresaId = await getEmpresaId();
    const userId = await getCurrentUserId();

    const conversasQuery = query(
      collection(db, COLLECTIONS.conversas),
      where("participantes", "array-contains", userId)
    );
    const conversasSnap = await getDocs(conversasQuery);
    let conversas = conversasSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as unknown as Conversa))
      .filter((c) => c.empresaId === empresaId);

    if (conversas.length === 0) {
      const fallbackSnap = await getDocs(
        query(collection(db, COLLECTIONS.conversas), where("empresaId", "==", empresaId))
      );
      conversas = fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Conversa));
    }

    if (conversas.length === 0) return [];

    const usuariosSnap = await getDocs(
      query(collection(db, COLLECTIONS.chat_usuarios), where("empresaId", "==", empresaId))
    );
    const usuarios = usuariosSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as ChatUser));

    const detalhadas = await Promise.all(
      conversas.map(async (conversa) => {
        const participantesDetalhes = conversa.participantes
          .filter((id) => id !== userId)
          .map((id) => usuarios.find((u) => u.id === id))
          .filter(Boolean) as ChatUser[];

        const ultimaMensagemSnap = await getDocs(
          query(
            collection(db, COLLECTIONS.mensagens),
            where("conversaId", "==", conversa.id),
            orderBy("criadoEm", "desc"),
            limit(1)
          )
        );
        const ultimaMensagemRaw = ultimaMensagemSnap.docs[0]
          ? ({ id: ultimaMensagemSnap.docs[0].id, ...ultimaMensagemSnap.docs[0].data() } as ChatMessage)
          : undefined;
        const ultimaMensagem =
          ultimaMensagemRaw && (ultimaMensagemRaw as any).empresaId === empresaId
            ? ultimaMensagemRaw
            : undefined;

        const naoLidasSnap = await getDocs(
          query(
            collection(db, COLLECTIONS.mensagens),
            where("conversaId", "==", conversa.id),
            where("lida", "==", false)
          )
        );
        const mensagensNaoLidas = naoLidasSnap.docs.filter((d) => {
          const data = d.data() as any;
          return data.empresaId === empresaId && data.remetenteId !== userId;
        }).length;

        return {
          ...conversa,
          participantesDetalhes,
          ultimaMensagem,
          mensagensNaoLidas,
        } as ConversaDetalhada;
      })
    );

    detalhadas.sort(
      (a, b) =>
        new Date(b.ultimaMensagem?.criadoEm || b.atualizadoEm || b.criadoEm).getTime() -
        new Date(a.ultimaMensagem?.criadoEm || a.atualizadoEm || a.criadoEm).getTime()
    );

    return detalhadas;
  },

  async getConversa(id: string) {
    const res = await conversaService.getById(id);
    return res.data ?? null;
  },

  async createConversa(data: CreateConversaDTO) {
    const userId = await getCurrentUserId();
    const empresaId = await getEmpresaId();

    const existenteSnap = await getDocs(
      query(
        collection(db, COLLECTIONS.conversas),
        where("empresaId", "==", empresaId),
        where("participantes", "array-contains", userId)
      )
    );
    const existente = existenteSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Conversa))
      .find((c) => c.participantes.includes(data.participanteId));

    if (existente) {
      return existente;
    }

    const res = await conversaService.create({
      participantes: [userId, data.participanteId],
      mensagensNaoLidas: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    } as any);
    return res.data ?? null;
  },

  async deleteConversa(id: string) {
    await conversaService.remove(id);
  },

  // -- Mensagens --
  async getMensagens(filters: MensagensFilters) {
    const constraints = [
      where("conversaId", "==", filters.conversaId),
      orderBy("criadoEm", "asc"),
    ];
    const q = query(collection(db, COLLECTIONS.mensagens), ...constraints);
    const snap = await getDocs(q);
    const empresaId = await getEmpresaId();
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as unknown as ChatMessage))
      .filter((m) => (m as any).empresaId === empresaId);
  },

  async sendMensagem(data: SendMessageDTO) {
    const empresaId = await getEmpresaId();
    const userId = await getCurrentUserId();
    const { anexo, ...rest } = data;
    const payload = {
      ...rest,
      remetenteId: userId,
      lida: false,
      tipo: data.tipo ?? "text",
      empresaId,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      createdAt: serverTimestamp(),
      createdBy: userId,
    };
    const ref = await addDoc(collection(db, COLLECTIONS.mensagens), payload);
    const snap = await getDoc(ref);

    const conversaRef = doc(db, COLLECTIONS.conversas, data.conversaId);
    await updateDoc(conversaRef, {
      atualizadoEm: new Date().toISOString(),
      ultimaMensagem: {
        id: ref.id,
        conversaId: data.conversaId,
        remetenteId: userId,
        conteudo: data.conteudo,
        tipo: payload.tipo,
        lida: false,
        criadoEm: payload.criadoEm,
        atualizadoEm: payload.atualizadoEm,
      },
    });

    await writeAuditLog({
      action: "create",
      collection: COLLECTIONS.mensagens,
      documentId: ref.id,
      before: null,
      after: snap.data() as Record<string, any>,
      empresaId,
      userId,
    });

    return { id: ref.id, ...snap.data() } as unknown as ChatMessage;
  },

  // -- Leitura de mensagens --
  async marcarComoLida(mensagemId: string) {
    const ref = doc(db, COLLECTIONS.mensagens, mensagemId);
    await updateDoc(ref, { lida: true, updatedAt: serverTimestamp() });
  },

  async marcarTodasComoLidas(conversaId: string) {
    const empresaId = await getEmpresaId();
    const q = query(
      collection(db, COLLECTIONS.mensagens),
      where("empresaId", "==", empresaId),
      where("conversaId", "==", conversaId),
      where("lida", "==", false)
    );
    const snap = await getDocs(q);
    const updates = snap.docs.map((d) =>
      updateDoc(doc(db, COLLECTIONS.mensagens, d.id), { lida: true, updatedAt: serverTimestamp() })
    );
    await Promise.all(updates);
  },
};
