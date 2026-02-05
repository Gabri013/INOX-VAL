# ERP Industrial - Sistema de Gestão para Fabricação em Inox

> **📚 DOCUMENTAÇÃO COMPLETA**: Este projeto está totalmente documentado. Veja o [Índice de Documentação](#-índice-de-documentação) abaixo.

---

## Por que este sistema existe

Este ERP existe para **o vendedor gerar um orçamento técnico preciso em poucos minutos**, eliminando o trabalho manual de cálculo de materiais e custos.

### O Problema

Tradicionalmente, orçar uma bancada de inox exigia:
- Desenhar cada peça manualmente
- Calcular consumo de chapa, tubos e acessórios
- Estimar quantas chapas seriam necessárias
- Calcular custos de cada item separadamente
- Adicionar perdas, mão de obra e margem

**Tempo: horas ou dias. Margem de erro: alta.**

### A Solução

O vendedor apenas:
1. Seleciona o modelo parametrizado de bancada
2. Informa as medidas (Comprimento, Largura, Altura)
3. Escolhe opções (estrutura, prateleira, cuba, etc.)
4. **Clica em "Calcular"**

O sistema retorna **imediatamente**:
- ✅ **BOM detalhada** (lista completa de materiais e quantidades)
- ✅ **Nesting automático** (quantas chapas necessárias + aproveitamento)
- ✅ **Custos por categoria** (chapa, tubos por tipo, acessórios)
- ✅ **Preço final sugerido** (com perdas, MO e markup)
- ✅ **Melhor opção de chapa** (comparação entre alternativas)

**Tempo: 2 minutos. Margem de erro: zero.**

---

## Fluxo Principal do Vendedor

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CALCULADORA RÁPIDA                                       │
│    • Selecionar modelo de bancada                           │
│    • Informar C, L, A e opções                              │
│    • Clicar "Calcular"                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. RESULTADO INSTANTÂNEO (mesma tela)                       │
│                                                              │
│    A) BOM DETALHADA                                         │
│       • Chapa: tipo, espessura, área (m²)                   │
│       • Tubos: perfil, comprimento (m)                      │
│       • Acessórios: itens e quantidades                     │
│                                                              │
│    B) NESTING                                               │
│       • Chapas necessárias: 3 unidades                      │
│       • Aproveitamento: 87%                                 │
│       • Sobra: 0,45 m²                                      │
│       • Preview visual do layout                            │
│                                                              │
│    C) PRECIFICAÇÃO                                          │
│       • Custo chapa: R$ 1.850,00                            │
│       • Custo tubos: R$ 420,00                              │
│       • Custo acessórios: R$ 280,00                         │
│       • Subtotal material: R$ 2.550,00                      │
│       • Perdas (5%): R$ 127,50                              │
│       • Mão de obra: R$ 600,00                              │
│       • Markup (40%): R$ 1.311,00                           │
│       • PREÇO FINAL: R$ 4.588,50                            │
│                                                              │
│    D) MELHOR OPÇÃO                                          │
│       ✓ Recomendado: Chapa 2,5×1,25m (3 un) - R$ 4.588,50  │
│       ○ Alternativa: Chapa 2,0×1,0m (4 un) - R$ 4.780,00   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. AÇÕES DO VENDEDOR                                        │
│    • Ajustar tabela de preços (se necessário)               │
│    • Gerar PDF da proposta                                  │
│    • Enviar para o cliente                                  │
│    • Transformar em pedido                                  │
└─────────────────────────────────────────────────────────────┘
```

Este é o **caminho do dinheiro**. Tudo fora disso é secundário.

---

## Arquitetura Técnica

### Stack Principal
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Roteamento**: React Router v7 (Data Mode)
- **Estado**: React Query (TanStack Query)
- **Formulários**: React Hook Form + Zod
- **UI Components**: Shadcn/ui (Radix UI)
- **Storage**: IndexedDB (via mock client)

### Estrutura de Pastas

```
src/
├── app/                      # Aplicação principal
│   ├── components/           # Componentes de UI
│   ├── contexts/            # Contextos globais (Auth, Audit, Workflow)
│   ├── pages/               # Páginas principais
│   └── routes.tsx           # Configuração de rotas
│
├── domains/                 # Domínios de negócio (DDD)
│   ├── clientes/           # Gestão de clientes
│   ├── produtos/           # Catálogo de produtos
│   ├── estoque/            # Controle de estoque
│   ├── nesting/            # Calculadora + Nesting ⭐
│   ├── producao/           # Controle de produção
│   ├── chat/               # Chat interno
│   ├── anuncios/           # Anúncios administrativos
│   └── ...
│
├── bom/                     # Motor BOM ⭐
│   ├── models/             # Modelos parametrizados
│   │   ├── mplc/           # Bancada encosto liso
│   │   ├── mple4_inv_ld/   # Bancada encosto + cuba direita
│   │   ├── mple4_inv_le/   # Bancada encosto + cuba esquerda
│   │   └── ...
│   └── types.ts            # Tipos compartilhados
│
├── services/               # Camada de serviços
│   ├── http/              # HTTP client (mock + real)
│   └── storage/           # IndexedDB
│
└── shared/                # Código compartilhado
    ├── components/        # Componentes reutilizáveis
    ├── lib/              # Utilitários
    └── types/            # Tipos globais
```

### Padrão de Domínios

Cada domínio segue a estrutura:
```
dominio/
├── dominio.types.ts      # Tipos e interfaces
├── dominio.service.ts    # Serviço (API calls)
├── dominio.mock.ts       # Implementação mock (IndexedDB)
├── dominio.seed.ts       # Dados iniciais
├── dominio.hooks.ts      # React Query hooks
├── dominio.schema.ts     # Validação Zod
└── pages/                # Telas do domínio
```

---

## Camada de Abstração (Pronto para Backend)

### Arquitetura de Serviços

O sistema está **100% preparado** para substituir mocks por backend real:

```typescript
// Hoje (mock via IndexedDB)
export function getHttpClient(): HttpClient {
  return mockClient; // ← IndexedDB
}

// Amanhã (backend real)
export function getHttpClient(): HttpClient {
  return apiClient; // ← Axios/Fetch para backend
}
```

**Nenhuma linha de código dos componentes precisa mudar.**

### Exemplo de Uso

```typescript
// No service (não muda nunca)
import { httpClient } from '@/services/http/client';

export const clientesService = {
  async list(filters: ClienteFilters) {
    return httpClient.get<Cliente[]>('/api/clientes', { params: filters });
  }
};

// No componente (não muda nunca)
const { data: clientes } = useQuery({
  queryKey: ['clientes', filters],
  queryFn: () => clientesService.list(filters)
});
```

### Mock Client (IndexedDB)

Implementa **100% da API REST** em memória:
- ✅ GET, POST, PUT, DELETE
- ✅ Query params (filtros, paginação, ordenação)
- ✅ Relacionamentos (JOINs simulados)
- ✅ Validações de negócio
- ✅ Delay de rede simulado (300ms)

---

## Funcionalidades Principais

### ⭐ Calculadora Rápida (Core do Sistema)
- **Localização**: `/calculadora-rapida`
- **Modelos disponíveis**: 8 modelos parametrizados
- **Saída**: BOM + Nesting + Precificação completa
- **Tempo de resposta**: < 2 segundos

### 📦 Gestão de Produtos e Clientes
- CRUD completo com validações
- Busca e filtros avançados
- Exportação para Excel

### 📊 Estoque e Produção
- Controle de saldos
- Movimentações (entrada/saída)
- Ordens de produção
- Dashboard de produção (TV)

### 💬 Chat Interno
- Mensagens em tempo real (simulado)
- Status online/ausente
- Histórico completo

### 📢 Anúncios Administrativos
- Notificações toast automáticas
- Filtros por destinatário (todos/role/departamento)
- Sistema de leituras

### 🔐 Controle de Acesso (RBAC)
- Roles: Admin, Gestor, Vendedor, Operador
- Permissões por função e setor
- Rotas protegidas

---

## Modelos Parametrizados

Veja a lista completa em [`docs/models.md`](./docs/models.md).

**Resumo**:
- `MV_ENCOSTO_LISO` - Bancada com encosto liso
- `MV_ENCOSTO_BORDA_AGUA` - Bancada com borda d'água
- `MV_ENCOSTO_CUBA` - Bancada com cuba integrada
- `MV_CENTRO_LISO` - Bancada central sem encosto
- E mais 4 variações industriais

---

## Como Executar

### Pré-requisitos
- Node.js 18+ e pnpm

### Instalação
```bash
pnpm install
```

### Desenvolvimento
```bash
pnpm dev
```

Acesse: `http://localhost:5173`

**Login de teste**:
- Admin: `admin@inox.com` / `123456`
- Vendedor: `vendedor@inox.com` / `123456`

---

## Documentação Adicional

- [`docs/vision.md`](./docs/vision.md) - Visão completa do sistema
- [`docs/models.md`](./docs/models.md) - Modelos parametrizados
- [`BACKEND_CHECKLIST.md`](./BACKEND_CHECKLIST.md) - Guia de integração backend
- [`API_ENDPOINTS.md`](./API_ENDPOINTS.md) - Documentação da API
- [`DATABASE_SCHEMAS.md`](./DATABASE_SCHEMAS.md) - Schemas do banco

---

## Prompt para IA

Ao trabalhar neste projeto, use sempre este prompt:

> **"Este ERP existe para o vendedor gerar orçamento preciso em minutos. O fluxo obrigatório é: selecionar modelo parametrizado de bancada + informar C/L/A + opções → gerar blank → gerar BOM → rodar nesting → calcular custo por item (inox, tubos por tipo, acessórios) → retornar preço final e melhor opção de chapa.**
>
> **Não adicione telas ou funcionalidades que não reforcem esse fluxo. Qualquer alteração deve explicar: qual etapa do fluxo melhora e como aumenta a precisão ou reduz o tempo do vendedor."**

---

## 📚 Índice de Documentação

### 🚀 Para Começar

| Documento | Descrição | Tempo de Leitura |
|-----------|-----------|------------------|
| **[README.md](./README.md)** (este arquivo) | Visão geral do sistema, por que existe, como executar | 10 min |
| **[docs/QUICK_START.md](./docs/QUICK_START.md)** | Onboarding rápido: instalação, testes, troubleshooting | 5 min |

### 🤖 Para IAs

| Documento | Descrição | Tempo de Leitura |
|-----------|-----------|------------------|
| **[AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md)** | **📌 OBRIGATÓRIO** - Regras, padrões, o que pode/não pode fazer | 10 min |
| **[docs/vision.md](./docs/vision.md)** | "Bíblia" do sistema: contrato, entidades, fluxo detalhado | 15 min |
| **[docs/models.md](./docs/models.md)** | Especificação completa dos modelos parametrizados | 10 min |

### 👨‍💻 Para Desenvolvedores

| Documento | Descrição |
|-----------|-----------|
| **[docs/QUICK_START.md](./docs/QUICK_START.md)** | Setup, testes, estrutura de código |
| **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** | Documentação da API REST |
| **[DATABASE_SCHEMAS.md](./DATABASE_SCHEMAS.md)** | Schemas do banco de dados |
| **[BACKEND_CHECKLIST.md](./BACKEND_CHECKLIST.md)** | Guia de integração backend |

### 📊 Para Product Managers

| Documento | Seção Relevante |
|-----------|-----------------|
| **[docs/vision.md](./docs/vision.md)** | Seção "Métricas de Sucesso" e "Roadmap" |
| **[README.md](./README.md)** | Seção "Fluxo Principal do Vendedor" |

### 📋 Resumos Executivos

| Documento | Descrição |
|-----------|-----------|
| **[DOCUMENTATION_COMPLETE.md](./DOCUMENTATION_COMPLETE.md)** | Resumo da documentação criada |
| **[CONFIRMACAO_100_PORCENTO.md](./CONFIRMACAO_100_PORCENTO.md)** | Status de implementação |
| **[STATUS_FINAL.md](./STATUS_FINAL.md)** | Status técnico do sistema |

### 🎯 Leitura Obrigatória

**Antes de trabalhar neste projeto, leia nesta ordem:**

1. ✅ **[README.md](./README.md)** (este arquivo) - 10 min
2. ✅ **[AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md)** - 10 min
3. ✅ **[docs/vision.md](./docs/vision.md)** - 15 min

**Total**: 35 minutos que economizam horas de retrabalho.

---

## Licença

Uso interno - Todos os direitos reservados