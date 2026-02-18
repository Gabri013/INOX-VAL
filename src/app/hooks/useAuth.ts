import { useContext, createContext, ReactNode } from 'react';
import { User, Company, UserRole, ROLE_PERMISSIONS } from '@/domains/auth/types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO: Implement with Firebase Auth
  const user: User | null = null;
  const company: Company | null = null;
  const isLoading = false;
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission) || user.permissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };
  
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };
  
  const isAdmin = (): boolean => hasRole('admin');
  const isManager = (): boolean => hasRole('gerente') || isAdmin();
  
  return (
    <AuthContext.Provider value={{
      user,
      company,
      isAuthenticated: !!user,
      isLoading,
      hasPermission,
      hasAnyPermission,
      hasRole,
      isAdmin,
      isManager
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
