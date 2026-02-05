// Tipos para autenticação e controle de acesso

export type UserRole = "Admin" | "Engenharia" | "Producao" | "Comercial";

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatar?: string;
  departamento?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (module: string) => boolean;
}

// ========== PERMISSÕES POR MÓDULO (SIMPLIFICADO - APENAS VIEW) ==========
// Para permissões granulares (create, edit, delete), usar o hook usePermissions

// Definição de permissões por módulo
export const modulePermissions: Record<string, UserRole[]> = {
  dashboard: ["Admin", "Engenharia", "Producao", "Comercial"],
  clientes: ["Admin", "Comercial"],
  produtos: ["Admin", "Engenharia", "Producao"],
  catalogo: ["Admin", "Engenharia"],
  estoque: ["Admin", "Engenharia", "Producao"],
  orcamentos: ["Admin", "Comercial", "Engenharia"],
  ordens: ["Admin", "Engenharia", "Producao"],
  compras: ["Admin", "Engenharia", "Producao"],
  producao: ["Admin", "Engenharia", "Producao"],
  calculadora: ["Admin", "Engenharia"],
  auditoria: ["Admin"],
  usuarios: ["Admin"],
  configuracoes: ["Admin", "Engenharia", "Producao", "Comercial"],
  chat: ["Admin", "Engenharia", "Producao", "Comercial"],
  anuncios: ["Admin", "Engenharia", "Producao", "Comercial"],
};

// Usuários mock para demonstração (mantido para compatibilidade)
export const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    nome: "Carlos Admin",
    email: "admin@erp.com",
    password: "admin123",
    role: "Admin",
    departamento: "Administração"
  },
  {
    id: "2",
    nome: "Maria Engenheira",
    email: "engenharia@erp.com",
    password: "eng123",
    role: "Engenharia",
    departamento: "Engenharia"
  },
  {
    id: "3",
    nome: "João Produção",
    email: "producao@erp.com",
    password: "prod123",
    role: "Producao",
    departamento: "Produção"
  },
  {
    id: "4",
    nome: "Ana Comercial",
    email: "comercial@erp.com",
    password: "com123",
    role: "Comercial",
    departamento: "Comercial"
  }
];