/**
 * Domínio: Anúncios
 * Dados seed para desenvolvimento
 */

import type { Anuncio, AnuncioLeitura } from './anuncios.types';

export const anunciosSeed: Anuncio[] = [
  {
    id: 'anc_001',
    titulo: 'Manutenção Programada do Sistema',
    mensagem:
      'O sistema passará por manutenção no próximo sábado (10/02) das 8h às 12h. Durante este período, o acesso ao ERP estará indisponível. Por favor, planeje suas atividades com antecedência.',
    tipo: 'manutencao',
    status: 'ativo',
    autorId: 'usr_001',
    autorNome: 'Admin Sistema',
    destinatarios: 'todos',
    dataInicio: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    dataFim: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
    criadoEm: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
  },
  {
    id: 'anc_002',
    titulo: 'Nova Funcionalidade: Chat Interno',
    mensagem:
      'Agora você pode se comunicar em tempo real com seus colegas através do Chat Interno! Acesse o menu lateral e clique em "Chat" para começar a usar. Mantenha-se conectado com a equipe.',
    tipo: 'info',
    status: 'ativo',
    autorId: 'usr_001',
    autorNome: 'Admin Sistema',
    destinatarios: 'todos',
    criadoEm: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
  },
  {
    id: 'anc_003',
    titulo: 'Atualização de Preços de Matéria-Prima',
    mensagem:
      'Atenção equipe Comercial: Os preços de tubos e chapas de inox foram atualizados. Por favor, revise todos os orçamentos pendentes antes de enviar aos clientes.',
    tipo: 'alerta',
    status: 'ativo',
    autorId: 'usr_001',
    autorNome: 'Admin Sistema',
    destinatarios: 'role',
    roleAlvo: 'Comercial',
    criadoEm: new Date(Date.now() - 6 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'anc_004',
    titulo: 'URGENTE: Falta de Material no Estoque',
    mensagem:
      'Produção está parada por falta de tubo 25x25mm. Compras, priorizar pedido imediatamente. Prazo máximo: hoje às 17h.',
    tipo: 'urgente',
    status: 'ativo',
    autorId: 'usr_003',
    autorNome: 'Maria Produção',
    destinatarios: 'departamento',
    departamentoAlvo: 'Compras',
    criadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'anc_005',
    titulo: 'Treinamento - Nova Calculadora BOM',
    mensagem:
      'Foi implementada a nova Calculadora BOM Industrial com 11 modelos padronizados da linha Mesa Vinda. Haverá treinamento na sexta-feira às 14h para toda a equipe de Engenharia.',
    tipo: 'info',
    status: 'agendado',
    autorId: 'usr_002',
    autorNome: 'João Engenheiro',
    destinatarios: 'departamento',
    departamentoAlvo: 'Engenharia',
    dataInicio: new Date(Date.now() + 2 * 24 * 3600000).toISOString(),
    criadoEm: new Date(Date.now() - 12 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

export const anunciosLeiturasSeed: AnuncioLeitura[] = [
  {
    id: 'leit_001',
    anuncioId: 'anc_002',
    usuarioId: 'usr_001',
    lidoEm: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'leit_002',
    anuncioId: 'anc_002',
    usuarioId: 'usr_002',
    lidoEm: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
  {
    id: 'leit_003',
    anuncioId: 'anc_003',
    usuarioId: 'usr_004',
    lidoEm: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
];
