/**
 * Chat Service
 * Serviço para gerenciamento de chat e mensagens
 */

import { httpClient } from '@/services/http/client';
import type {
  ChatUser,
  ChatMessage,
  Conversa,
  ConversaDetalhada,
  ChatFilters,
  MensagensFilters,
  CreateConversaDTO,
  SendMessageDTO,
  UpdateStatusDTO,
} from './chat.types';

const BASE_PATH = '/chat';

export const chatService = {
  // Usuários do chat
  async getUsuarios(filters?: ChatFilters): Promise<ChatUser[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.departamento) params.append('departamento', filters.departamento);
    
    const query = params.toString();
    return httpClient.get<ChatUser[]>(
      `${BASE_PATH}/usuarios${query ? `?${query}` : ''}`
    );
  },

  async getUsuario(id: string): Promise<ChatUser> {
    return httpClient.get<ChatUser>(`${BASE_PATH}/usuarios/${id}`);
  },

  async updateStatus(data: UpdateStatusDTO): Promise<void> {
    return httpClient.put<void>(`${BASE_PATH}/status`, data);
  },

  // Conversas
  async getConversas(): Promise<ConversaDetalhada[]> {
    return httpClient.get<ConversaDetalhada[]>(`${BASE_PATH}/conversas`);
  },

  async getConversa(id: string): Promise<ConversaDetalhada> {
    return httpClient.get<ConversaDetalhada>(`${BASE_PATH}/conversas/${id}`);
  },

  async createConversa(data: CreateConversaDTO): Promise<Conversa> {
    return httpClient.post<Conversa>(`${BASE_PATH}/conversas`, data);
  },

  async deleteConversa(id: string): Promise<void> {
    return httpClient.delete<void>(`${BASE_PATH}/conversas/${id}`);
  },

  // Mensagens
  async getMensagens(filters: MensagensFilters): Promise<ChatMessage[]> {
    const params = new URLSearchParams();
    params.append('conversaId', filters.conversaId);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    
    return httpClient.get<ChatMessage[]>(`${BASE_PATH}/mensagens?${params.toString()}`);
  },

  async sendMensagem(data: SendMessageDTO): Promise<ChatMessage> {
    return httpClient.post<ChatMessage>(`${BASE_PATH}/mensagens`, data);
  },

  async marcarComoLida(mensagemId: string): Promise<void> {
    return httpClient.put<void>(`${BASE_PATH}/mensagens/${mensagemId}/lida`, {});
  },

  async marcarTodasComoLidas(conversaId: string): Promise<void> {
    return httpClient.put<void>(`${BASE_PATH}/conversas/${conversaId}/marcar-lidas`, {});
  },
};