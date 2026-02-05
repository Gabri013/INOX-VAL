import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: string;
}

export function ProtectedRoute({ children, requiredModule }: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se requerer módulo específico, verificar permissão
  if (requiredModule && !hasPermission(requiredModule)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔒</div>
          <h2 className="text-2xl font-bold">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar este módulo.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;