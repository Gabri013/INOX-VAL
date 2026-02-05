/**
 * Domínio: Chat
 * Dados seed para desenvolvimento
 */

import type { ChatUser, ChatMessage, Conversa } from './chat.types';

// Usuários do chat (baseados nos usuários existentes)
export const chatUsersSeed: ChatUser[] = [
  {
    id: 'usr_001',
    nome: 'Admin Sistema',
    email: 'admin@mesavinda.com',
    departamento: 'TI',
    status: 'online',
    ultimaAtividade: new Date().toISOString(),
  },
  {
    id: 'usr_002',
    nome: 'João Engenheiro',
    email: 'joao@mesavinda.com',
    departamento: 'Engenharia',
    status: 'online',
    ultimaAtividade: new Date().toISOString(),
  },
  {
    id: 'usr_003',
    nome: 'Maria Produção',
    email: 'maria@mesavinda.com',
    departamento: 'Produção',
    status: 'ausente',
    ultimaAtividade: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'usr_004',
    nome: 'Carlos Comercial',
    email: 'carlos@mesavinda.com',
    departamento: 'Comercial',
    status: 'online',
    ultimaAtividade: new Date().toISOString(),
  },
  {
    id: 'usr_005',
    nome: 'Ana Vendas',
    email: 'ana@mesavinda.com',
    departamento: 'Comercial',
    status: 'offline',
    ultimaAtividade: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'usr_006',
    nome: 'Pedro Compras',
    email: 'pedro@mesavinda.com',
    departamento: 'Compras',
    status: 'online',
    ultimaAtividade: new Date().toISOString(),
  },
  {
    id: 'usr_007',
    nome: 'Julia Estoque',
    email: 'julia@mesavinda.com',
    departamento: 'Estoque',
    status: 'ausente',
    ultimaAtividade: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

// Conversas seed
export const conversasSeed: Conversa[] = [
  {
    id: 'conv_001',
    participantes: ['usr_001', 'usr_002'],
    mensagensNaoLidas: 2,
    criadoEm: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'conv_002',
    participantes: ['usr_001', 'usr_004'],
    mensagensNaoLidas: 0,
    criadoEm: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'conv_003',
    participantes: ['usr_001', 'usr_003'],
    mensagensNaoLidas: 1,
    criadoEm: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

// Mensagens seed
export const mensagensSeed: ChatMessage[] = [
  // Conversa com João Engenheiro
  {
    id: 'msg_001',
    conversaId: 'conv_001',
    remetenteId: 'usr_002',
    conteudo: 'Olá! Preciso de ajuda com o cálculo de material para a bancada MV-002.',
    tipo: 'text',
    lida: true,
    criadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'msg_002',
    conversaId: 'conv_001',
    remetenteId: 'usr_001',
    conteudo: 'Claro! Qual é a dimensão da bancada?',
    tipo: 'text',
    lida: true,
    criadoEm: new Date(Date.now() - 90 * 60000).toISOString(),
    atualizadoEm: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 'msg_003',
    conversaId: 'conv_001',
    remetenteId: 'usr_002',
    conteudo: '2000mm x 800mm x 900mm. Cliente quer prateleira inferior.',
    tipo: 'text',
    lida: true,
    criadoEm: new Date(Date.now() - 60 * 60000).toISOString(),
    atualizadoEm: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 'msg_004',
    conversaId: 'conv_001',
    remetenteId: 'usr_001',
    conteudo: 'Perfeito. Você pode usar a calculadora BOM no sistema. Selecione o modelo MV-002 e insira as dimensões.',
    tipo: 'text',
    lida: false,
    criadoEm: new Date(Date.now() - 10 * 60000).toISOString(),
    atualizadoEm: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'msg_005',
    conversaId: 'conv_001',
    remetenteId: 'usr_002',
    conteudo: 'Obrigado! Vou testar agora.',
    tipo: 'text',
    lida: false,
    criadoEm: new Date(Date.now() - 5 * 60000).toISOString(),
    atualizadoEm: new Date(Date.now() - 5 * 60000).toISOString(),
  },

  // Conversa com Carlos Comercial
  {
    id: 'msg_006',
    conversaId: 'conv_002',
    remetenteId: 'usr_004',
    conteudo: 'O cliente ABC está pedindo desconto de 15% no orçamento ORC-2024-0123',
    tipo: 'text',
    lida: true,
    criadoEm: new Date(Date.now() - 3 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'msg_007',
    conversaId: 'conv_002',
    remetenteId: 'usr_001',
    conteudo: 'Qual o valor total do orçamento?',
    tipo: 'text',
    lida: true,
    criadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'msg_008',
    conversaId: 'conv_002',
    remetenteId: 'usr_004',
    conteudo: 'R$ 45.320,00. É um pedido grande com 8 bancadas.',
    tipo: 'text',
    lida: true,
    criadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
  },

  // Conversa com Maria Produção
  {
    id: 'msg_009',
    conversaId: 'conv_003',
    remetenteId: 'usr_003',
    conteudo: 'Estamos com problema no estoque de tubo 25x25mm',
    tipo: 'text',
    lida: true,
    criadoEm: new Date(Date.now() - 45 * 60000).toISOString(),
    atualizadoEm: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'msg_010',
    conversaId: 'conv_003',
    remetenteId: 'usr_001',
    conteudo: 'Quantas barras faltam?',
    tipo: 'text',
    lida: true,
    criadoEm: new Date(Date.now() - 40 * 60000).toISOString(),
    atualizadoEm: new Date(Date.now() - 40 * 60000).toISOString(),
  },
  {
    id: 'msg_011',
    conversaId: 'conv_003',
    remetenteId: 'usr_003',
    conteudo: 'Precisamos de pelo menos 20 barras para cumprir as OPs desta semana',
    tipo: 'text',
    lida: false,
    criadoEm: new Date(Date.now() - 30 * 60000).toISOString(),
    atualizadoEm: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];
