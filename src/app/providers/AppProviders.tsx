/**
 * Provider centralizado da aplicação
 * Integra Auth, React Query, Theme e outros providers
 */

import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext'; // Novo Firebase AuthContext
import { AuditProvider } from '../contexts/AuditContext';
import { WorkflowProvider } from '../contexts/WorkflowContext';
import { Toaster } from '../components/ui/sonner';
import { initDB } from '@/services/storage/db';
import { seedDatabase } from '@/services/storage/seed';

/**
 * Configuração do React Query
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antigo cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Provider de inicialização
 */
function InitializationProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        // Inicializa IndexedDB
        await initDB();
        
        // Popula banco com dados iniciais (se vazio)
        await seedDatabase();
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
      }
    }

    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Provider principal que combina todos os providers necessários
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <InitializationProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuditProvider>
              <WorkflowProvider>
                {children}
                <Toaster />
              </WorkflowProvider>
            </AuditProvider>
          </AuthProvider>
        </QueryClientProvider>
      </InitializationProvider>
    </ThemeProvider>
  );
}