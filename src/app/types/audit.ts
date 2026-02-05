// Tipos para o sistema de auditoria

export type AuditActionType = 
  | "create" 
  | "update" 
  | "delete" 
  | "view"
  | "export"
  | "import";

export type AuditModule = 
  | "clientes"
  | "produtos" 
  | "estoque"
  | "orcamentos"
  | "ordens"
  | "compras"
  | "calculadora"
  | "dashboard"
  | "system";

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditActionType;
  module: AuditModule;
  recordId?: string;
  recordName?: string;
  description: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: AuditActionType;
  module?: AuditModule;
  searchTerm?: string;
}

export interface AuditContextType {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, "id" | "timestamp" | "userId" | "userName" | "userRole">) => void;
  getLogs: (filter?: AuditLogFilter) => AuditLog[];
  getLogsByRecord: (module: AuditModule, recordId: string) => AuditLog[];
  clearLogs: () => void;
}
