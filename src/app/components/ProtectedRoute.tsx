/**
 * ============================================================================
 * PROTECTED ROUTE
 * ============================================================================
 * 
 * Componente que protege rotas que requerem autenticação.
 * 
 * Se o usuário não estiver autenticado, redireciona para /login.
 * Enquanto verifica autenticação, mostra loading.
 * 
 * ============================================================================
 */

import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
