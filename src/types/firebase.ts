/**
 * Tipos e configurações para Firebase
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Interface base para documentos Firebase (multi-tenant)
 */
export interface FirebaseDocument {
  id: string;
  tenantId: string; // ID da empresa (isolamento de dados)
  createdAt: Date | string; // Timestamp de criação
  updatedAt: Date | string; // Timestamp de atualização
}

/**
 * Metadados de auditoria para operações
 */
export interface AuditMetadata {
  userId: string;
  userName: string;
  timestamp: Date;
  operation: 'create' | 'update' | 'delete';
  changes?: Record<string, { old: any; new: any }>;
}

/**
 * Estrutura de coleções do Firestore
 */
export interface FirestoreCollections {
  // Empresas (tenants)
  empresas: 'empresas';
  
  // Usuários
  usuarios: 'usuarios';
  
  // Domínios principais
  clientes: 'clientes';
  orcamentos: 'orcamentos';
  ordens_producao: 'ordens_producao';
  solicitacoes_compra: 'solicitacoes_compra';
  
  // Materiais e estoque
  materiais: 'materiais';
  estoque_materiais: 'estoque_materiais';
  movimentacoes_estoque: 'movimentacoes_estoque';
  
  // Apontamento de produção
  apontamentos: 'apontamentos';
  
  // Auditoria
  auditoria: 'auditoria';
  logs: 'logs';
}

export const COLLECTIONS: FirestoreCollections = {
  empresas: 'empresas',
  usuarios: 'usuarios',
  clientes: 'clientes',
  orcamentos: 'orcamentos',
  ordens_producao: 'ordens_producao',
  solicitacoes_compra: 'solicitacoes_compra',
  materiais: 'materiais',
  estoque_materiais: 'estoque_materiais',
  movimentacoes_estoque: 'movimentacoes_estoque',
  apontamentos: 'apontamentos',
  auditoria: 'auditoria',
  logs: 'logs',
};

/**
 * Interface para empresa (tenant)
 */
export interface Empresa extends FirebaseDocument {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade: string;
  estado: string;
  cep?: string;
  plano: 'basico' | 'profissional' | 'empresarial';
  ativo: boolean;
  dataExpiracao?: Date;
}

/**
 * Interface para usuário
 */
export interface Usuario extends FirebaseDocument {
  email: string;
  nome: string;
  role: 'admin' | 'vendedor' | 'producao' | 'gerente';
  ativo: boolean;
  ultimoAcesso?: Date;
}

/**
 * Query helper types
 */
export type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'array-contains-any'
  | 'in'
  | 'not-in';

export interface QueryConstraint {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface OrderByConstraint {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  limit?: number;
  startAfter?: any;
  endBefore?: any;
}
