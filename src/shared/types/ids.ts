/**
 * Sistema de IDs padronizado para todo o ERP
 */

export type ID = string;

/**
 * Gera um novo ID único (UUID v4 simplificado)
 */
export function newId(): ID {
  return crypto.randomUUID();
}

/**
 * Valida se uma string é um ID válido
 */
export function isValidId(id: unknown): id is ID {
  return typeof id === 'string' && id.length > 0;
}
