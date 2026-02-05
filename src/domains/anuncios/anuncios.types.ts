/**
 * Domínio: Anúncios
 * Tipos e interfaces para sistema de comunicados administrativos
 */

export type AnuncioTipo = 'info' | 'alerta' | 'urgente' | 'manutencao';
export type AnuncioStatus = 'ativo' | 'agendado' | 'arquivado';

export interface Anuncio {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: AnuncioTipo;
  status: AnuncioStatus;
  autorId: string;
  autorNome: string;
  destinatarios: 'todos' | 'departamento' | 'role';
  departamentoAlvo?: string;
  roleAlvo?: string;
  dataInicio?: string;
  dataFim?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AnuncioLeitura {
  id: string;
  anuncioId: string;
  usuarioId: string;
  lidoEm: string;
}

// Filtros
export interface AnunciosFilters {
  tipo?: AnuncioTipo;
  status?: AnuncioStatus;
  dataInicio?: string;
  dataFim?: string;
}

// DTOs
export interface CreateAnuncioDTO {
  titulo: string;
  mensagem: string;
  tipo: AnuncioTipo;
  destinatarios: 'todos' | 'departamento' | 'role';
  departamentoAlvo?: string;
  roleAlvo?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface UpdateAnuncioDTO extends Partial<CreateAnuncioDTO> {
  status?: AnuncioStatus;
}

// Labels e cores
export const tipoLabels: Record<AnuncioTipo, string> = {
  info: 'Informação',
  alerta: 'Alerta',
  urgente: 'Urgente',
  manutencao: 'Manutenção',
};

export const tipoColors: Record<AnuncioTipo, string> = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  alerta: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  urgente: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  manutencao: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

export const statusLabels: Record<AnuncioStatus, string> = {
  ativo: 'Ativo',
  agendado: 'Agendado',
  arquivado: 'Arquivado',
};

export const statusColors: Record<AnuncioStatus, string> = {
  ativo: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  agendado: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  arquivado: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
};
