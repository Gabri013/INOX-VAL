/**
 * Classes de erro personalizadas para o ERP
 */

/**
 * Erro genérico da API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Erro de não encontrado
 */
export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} com ID ${id} não encontrado` : `${resource} não encontrado`);
    this.name = 'NotFoundError';
  }
}

/**
 * Erro de autenticação
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Não autenticado') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Erro de autorização
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'Sem permissão para esta operação') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Helper para verificar se é um erro de API
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Helper para extrair mensagem de erro
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erro desconhecido';
}
