export type UserRole = 
  | 'admin'
  | 'gerente'
  | 'engenheiro'
  | 'vendedor'
  | 'producao'
  | 'compras';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  companyId: string;
  role: UserRole;
  permissions: string[];
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone?: string;
  email?: string;
  active: boolean;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface AuthContext {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Permission {
  key: string;
  label: string;
  description: string;
}

// Permissions by role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'users.read', 'users.write', 'users.delete',
    'materials.read', 'materials.write', 'materials.delete',
    'processes.read', 'processes.write', 'processes.delete',
    'quotes.read', 'quotes.write', 'quotes.delete', 'quotes.finalize',
    'purchasing.read', 'purchasing.write', 'purchasing.approve',
    'production.read', 'production.write', 'production.manage',
    'customers.read', 'customers.write', 'customers.delete',
    'settings.read', 'settings.write',
    'audit.read',
    'reports.read', 'reports.export'
  ],
  gerente: [
    'users.read',
    'materials.read', 'materials.write',
    'processes.read', 'processes.write',
    'quotes.read', 'quotes.write', 'quotes.finalize',
    'purchasing.read', 'purchasing.write', 'purchasing.approve',
    'production.read', 'production.write', 'production.manage',
    'customers.read', 'customers.write',
    'settings.read',
    'audit.read',
    'reports.read', 'reports.export'
  ],
  engenheiro: [
    'materials.read', 'materials.write',
    'processes.read', 'processes.write',
    'quotes.read', 'quotes.write', 'quotes.finalize',
    'purchasing.read', 'purchasing.write',
    'production.read', 'production.write',
    'reports.read'
  ],
  vendedor: [
    'quotes.read', 'quotes.write',
    'customers.read', 'customers.write',
    'reports.read'
  ],
  producao: [
    'production.read', 'production.write',
    'materials.read',
    'reports.read'
  ],
  compras: [
    'purchasing.read', 'purchasing.write',
    'materials.read',
    'reports.read'
  ]
};
