# 🔌 **INTEGRAÇÃO FRONTEND ↔ BACKEND**

## **TIME 2: Conectar React ao Backend Real**

---

## 🎯 **OBJETIVO**

Substituir os **mocks/localStorage** por **chamadas HTTP reais** para a API backend, **mantendo os mesmos contratos** dos services existentes.

---

## 📋 **PRINCÍPIOS**

1. ✅ **Não quebrar nada:** Services mantêm mesma interface
2. ✅ **Tipagem forte:** TypeScript em tudo
3. ✅ **Cache inteligente:** React Query para otimizar
4. ✅ **Error handling:** Toast + retry automático
5. ✅ **Loading states:** Skeletons e spinners
6. ✅ **Offline-first:** Detectar perda de conexão

---

## 🗂️ **ESTRUTURA DE ARQUIVOS**

```
src/
├── services/
│   ├── api/
│   │   ├── api.client.ts           # Axios configurado
│   │   ├── api.types.ts            # Tipos de request/response
│   │   ├── endpoints.ts            # Constantes de URLs
│   │   └── interceptors.ts         # JWT, error handling
│   │
│   ├── auth.service.ts             # Autenticação (API)
│   ├── orcamento.service.ts        # Orçamentos (API)
│   ├── ordem-producao.service.ts   # OPs (API)
│   └── estoque.service.ts          # Estoque (API)
│
├── hooks/
│   ├── useAuth.ts                  # Hook de autenticação
│   ├── useOrcamentos.ts            # Hook com React Query
│   ├── useOrdens.ts                # Hook com React Query
│   └── useEstoque.ts               # Hook com React Query
│
├── contexts/
│   ├── AuthContext.tsx             # Context de auth (API real)
│   └── WorkflowContext.tsx         # Context de workflow (API real)
│
└── app/
    └── pages/
        ├── Login.tsx               # Já existe (adaptar para API)
        ├── Orcamentos.tsx          # Adaptar para React Query
        └── Ordens.tsx              # Adaptar para React Query
```

---

## 🔧 **1. CONFIGURAR AXIOS CLIENT**

### **src/services/api/api.client.ts:**

```typescript
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Cliente HTTP configurado com interceptors
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de REQUEST: adiciona JWT automaticamente
 */
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de RESPONSE: trata erros globalmente
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Token expirado → tentar refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retentar requisição original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh falhou → forçar logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Outros erros: mostrar toast
    const message = (error.response?.data as any)?.message || 'Erro ao conectar com servidor';
    toast.error(message);

    return Promise.reject(error);
  }
);
```

---

## 🔐 **2. SERVICE DE AUTENTICAÇÃO**

### **src/services/auth.service.ts (REFATORADO):**

```typescript
import { apiClient } from './api/api.client';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nome: string;
    role: string;
  };
}

/**
 * Fazer login
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  
  // Salvar tokens no localStorage
  localStorage.setItem('accessToken', response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  
  return response.data;
}

/**
 * Fazer logout
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

/**
 * Obter usuário atual (via token)
 */
export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export const authService = {
  login,
  logout,
  getCurrentUser,
};
```

---

## 📦 **3. SERVICE DE ORÇAMENTOS**

### **src/services/orcamento.service.ts (REFATORADO):**

```typescript
import { apiClient } from './api/api.client';
import type { Orcamento, StatusOrcamento } from '@/app/types/workflow';

/**
 * Listar orçamentos
 */
export async function listarOrcamentos(): Promise<Orcamento[]> {
  const response = await apiClient.get<Orcamento[]>('/orcamentos');
  return response.data;
}

/**
 * Obter orçamento por ID
 */
export async function obterOrcamento(id: string): Promise<Orcamento> {
  const response = await apiClient.get<Orcamento>(`/orcamentos/${id}`);
  return response.data;
}

/**
 * Criar orçamento
 */
export async function criarOrcamento(data: Partial<Orcamento>): Promise<Orcamento> {
  const response = await apiClient.post<Orcamento>('/orcamentos', data);
  return response.data;
}

/**
 * Atualizar orçamento
 */
export async function atualizarOrcamento(id: string, data: Partial<Orcamento>): Promise<Orcamento> {
  const response = await apiClient.patch<Orcamento>(`/orcamentos/${id}`, data);
  return response.data;
}

/**
 * Converter orçamento em OP
 */
export async function converterEmOrdem(orcamentoId: string) {
  const response = await apiClient.post(`/orcamentos/${orcamentoId}/converter`);
  return response.data;
}

/**
 * Atualizar status do orçamento
 */
export async function atualizarStatus(id: string, status: StatusOrcamento): Promise<Orcamento> {
  const response = await apiClient.patch<Orcamento>(`/orcamentos/${id}/status`, { status });
  return response.data;
}

export const orcamentoService = {
  listarOrcamentos,
  obterOrcamento,
  criarOrcamento,
  atualizarOrcamento,
  converterEmOrdem,
  atualizarStatus,
};
```

---

## 🪝 **4. REACT QUERY HOOKS**

### **Instalar dependências:**

```bash
npm install @tanstack/react-query
```

### **src/hooks/useOrcamentos.ts:**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orcamentoService } from '@/services/orcamento.service';
import { toast } from 'sonner';
import type { Orcamento } from '@/app/types/workflow';

/**
 * Hook para listar orçamentos
 */
export function useOrcamentos() {
  return useQuery({
    queryKey: ['orcamentos'],
    queryFn: () => orcamentoService.listarOrcamentos(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para criar orçamento
 */
export function useCreateOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Orcamento>) => orcamentoService.criarOrcamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      toast.success('Orçamento criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar orçamento: ${error.message}`);
    },
  });
}

/**
 * Hook para atualizar orçamento
 */
export function useUpdateOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Orcamento> }) =>
      orcamentoService.atualizarOrcamento(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      toast.success('Orçamento atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

/**
 * Hook para converter orçamento em OP
 */
export function useConverterOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orcamentoId: string) => orcamentoService.converterEmOrdem(orcamentoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['ordens'] });
      toast.success('Orçamento convertido em OP!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao converter: ${error.message}`);
    },
  });
}
```

---

## 📄 **5. REFATORAR PÁGINA DE ORÇAMENTOS**

### **src/app/pages/Orcamentos.tsx (REFATORADO):**

```typescript
import { useState } from "react";
import { FileText, Download, Eye as EyeIcon, FileDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { toast } from "sonner";
import { ListPage } from "../components/layout/ListPage";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { OrcamentoForm } from "../components/workflow/OrcamentoForm";
import { pdfService } from "@/domains/custos/pdf.service";
import type { Orcamento, StatusOrcamento } from "../types/workflow";

// ✅ AGORA USA REACT QUERY
import { useOrcamentos, useConverterOrcamento } from "@/hooks/useOrcamentos";

export default function Orcamentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusOrcamento | "all">("all");
  const [showFormulario, setShowFormulario] = useState(false);

  // ✅ Hook do React Query (substitui WorkflowContext)
  const { data: orcamentos = [], isLoading, error } = useOrcamentos();
  const converterMutation = useConverterOrcamento();

  // Filtros
  const filteredOrcamentos = orcamentos.filter((orc) => {
    const matchesSearch = 
      orc.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || orc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = [
    {
      title: "Total de Orçamentos",
      value: orcamentos.length,
      description: "Cadastrados no sistema"
    },
    {
      title: "Enviados",
      value: orcamentos.filter(o => o.status === "Enviado").length,
      description: "Aguardando resposta",
      className: "border-yellow-200 dark:border-yellow-800"
    },
    {
      title: "Aprovados",
      value: orcamentos.filter(o => o.status === "Aprovado").length,
      description: "Prontos para conversão",
      className: "border-green-200 dark:border-green-800"
    },
    {
      title: "Valor Total",
      value: `R$ ${(orcamentos.reduce((acc, o) => acc + o.total, 0) / 1000).toFixed(0)}k`,
      description: "Valor de todos orçamentos"
    }
  ];

  // Ações
  const actions = [
    {
      icon: EyeIcon,
      label: "Pré-visualizar PDF",
      onClick: (orc: Orcamento) => {
        try {
          pdfService.visualizarPDFProposta(orc, {
            mostrarCondicoesPagamento: true,
            mostrarObservacoes: true,
            vendedor: "Comercial",
          });
        } catch (error) {
          toast.error("Erro ao gerar preview do PDF");
        }
      }
    },
    {
      icon: FileDown,
      label: "Baixar PDF",
      onClick: (orc: Orcamento) => {
        try {
          pdfService.baixarPDFProposta(orc, {
            mostrarCondicoesPagamento: true,
            mostrarObservacoes: true,
            vendedor: "Comercial",
          });
          toast.success(`PDF ${orc.numero} baixado com sucesso`);
        } catch (error) {
          toast.error("Erro ao gerar PDF");
        }
      }
    },
    {
      icon: FileText,
      label: "Criar OP",
      onClick: (orc: Orcamento) => {
        if (orc.status === "Convertido") {
          toast.error("Este orçamento já foi convertido");
          return;
        }
        
        // ✅ Usa mutation do React Query
        converterMutation.mutate(orc.id);
      },
      show: (orc: Orcamento) => orc.status === "Aprovado"
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <p className="font-semibold">Erro ao carregar orçamentos</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ListPage
        title="Orçamentos"
        subtitle="Gerencie propostas comerciais"
        icon={FileText}
        stats={stats}
        searchPlaceholder="Buscar por número ou cliente..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onNew={() => setShowFormulario(true)}
        newButtonLabel="Novo Orçamento"
        filters={
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Rascunho">Rascunho</SelectItem>
              <SelectItem value="Enviado">Enviado</SelectItem>
              <SelectItem value="Aprovado">Aprovado</SelectItem>
              <SelectItem value="Rejeitado">Rejeitado</SelectItem>
              <SelectItem value="Convertido">Convertido</SelectItem>
            </SelectContent>
          </Select>
        }
        items={filteredOrcamentos}
        renderItem={(orc) => ({
          title: orc.numero,
          subtitle: orc.clienteNome,
          badge: (
            <Badge variant={orc.status === "Aprovado" ? "default" : "outline"}>
              {orc.status}
            </Badge>
          ),
          meta: `R$ ${orc.total.toLocaleString('pt-BR')}`,
          date: orc.dataEmissao ? format(new Date(orc.dataEmissao), "dd/MM/yyyy", { locale: ptBR }) : undefined,
        })}
        actions={actions}
        emptyMessage="Nenhum orçamento encontrado"
      />

      {/* Dialog de Formulário */}
      <Dialog open={showFormulario} onOpenChange={setShowFormulario}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
          </DialogHeader>
          <OrcamentoForm onClose={() => setShowFormulario(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## 🔄 **6. CONFIGURAR REACT QUERY PROVIDER**

### **src/app/providers/AppProviders.tsx (ATUALIZAR):**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { WorkflowProvider } from '../contexts/WorkflowContext';
import { AuthProvider } from '../contexts/AuthContext';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <WorkflowProvider>
            {children}
            <Toaster position="top-right" />
          </WorkflowProvider>
        </AuthProvider>
      </ThemeProvider>
      {/* Devtools (só em dev) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 🌐 **7. VARIÁVEIS DE AMBIENTE**

### **.env.example (CRIAR NO FRONTEND):**

```env
# URL da API backend
VITE_API_URL=http://localhost:3000/api

# Modo de desenvolvimento
VITE_DEV_MODE=true
```

### **.env.local (criar localmente):**

```env
VITE_API_URL=http://localhost:3000/api
VITE_DEV_MODE=true
```

---

## 📝 **8. CHECKLIST DE REFATORAÇÃO**

### **Para cada service:**

- [ ] Trocar lógica de mock por `apiClient.get/post/patch/delete`
- [ ] Manter mesma interface (funções retornam mesmos tipos)
- [ ] Adicionar try/catch e error handling
- [ ] Criar hook do React Query correspondente
- [ ] Atualizar componentes para usar hooks
- [ ] Adicionar loading states (skeleton ou spinner)
- [ ] Adicionar error states (mensagem amigável)
- [ ] Testar fluxo completo (criar, listar, editar, deletar)

---

## 🧪 **9. TESTES**

### **Testar cada endpoint:**

1. **Login:**
   - ✅ Login com credenciais válidas
   - ✅ Login com credenciais inválidas
   - ✅ Token salvo no localStorage
   - ✅ Token enviado em requisições subsequentes

2. **Orçamentos:**
   - ✅ Listar orçamentos
   - ✅ Criar orçamento
   - ✅ Atualizar orçamento
   - ✅ Converter em OP
   - ✅ Filtros funcionando

3. **Estoque:**
   - ✅ Verificar disponibilidade
   - ✅ Registrar movimentação
   - ✅ Listar histórico

---

## 🚀 **10. CRONOGRAMA - TIME 2**

### **Semana 1:**
- ✅ Configurar `api.client.ts` com interceptors
- ✅ Refatorar `auth.service.ts`
- ✅ Atualizar `AuthContext` para usar API
- ✅ Testar login/logout

### **Semana 2:**
- ✅ Instalar React Query
- ✅ Configurar provider
- ✅ Refatorar `orcamento.service.ts` + hook
- ✅ Atualizar página de Orçamentos
- ✅ Adicionar loading/error states

### **Semana 3:**
- ✅ Refatorar `ordem-producao.service.ts` + hook
- ✅ Refatorar `estoque.service.ts` + hook
- ✅ Atualizar páginas correspondentes
- ✅ Testes E2E

---

## 🎯 **MÉTRICAS DE SUCESSO**

- ✅ 0 chamadas localStorage para dados (só auth)
- ✅ 100% dos services usando API
- ✅ Cache funcionando (React Query)
- ✅ Loading states em todas as listas
- ✅ Error handling em todas as operações
- ✅ Refresh token funcionando automaticamente

---

**Mãos à obra! 🔥**
