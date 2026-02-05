/**
 * Hook para verificação granular de permissões (RBAC)
 */

import { useAuth } from '@/contexts/AuthContext';
import type { Module, Permission } from '@/domains/usuarios/usuarios.types';
import { hasPermission, hasModuleAccess } from '@/domains/usuarios/usuarios.types';

export function usePermissions() {
  const { user } = useAuth();

  /**
   * Verifica se usuário tem permissão específica em um módulo
   */
  const can = (module: Module, permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user as any, module, permission);
  };

  /**
   * Verifica se usuário tem acesso ao módulo (pelo menos view)
   */
  const canAccess = (module: Module): boolean => {
    if (!user) return false;
    return hasModuleAccess(user as any, module);
  };

  /**
   * Verifica se usuário é Admin
   */
  const isAdmin = (): boolean => {
    return user?.role === 'Admin';
  };

  /**
   * Verifica se usuário tem uma das roles especificadas
   */
  const hasRole = (...roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    can,
    canAccess,
    isAdmin,
    hasRole,
    user,
  };
}