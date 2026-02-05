/**
 * Utilitários de formatação
 */

/**
 * Converte Date para string ISO ou retorna string ISO se já for
 */
export function toISOString(date?: Date | string | null): string {
  if (!date) return new Date().toISOString();
  if (typeof date === 'string') return date;
  return date.toISOString();
}

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata hora para exibição
 */
export function formatTime(date: string | Date): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata número com casas decimais
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}