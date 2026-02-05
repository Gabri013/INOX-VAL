# Sistema ERP Industrial - Documentação

## 🎯 Visão Geral

Sistema ERP completo para gestão empresarial industrial com foco em metalurgia e fabricação. O sistema oferece controle total sobre o fluxo de trabalho desde o orçamento até a entrega, com auditoria completa e controle de acesso por perfis.

## ✨ Funcionalidades Principais

### 1. Sistema de Auditoria 📋
- **Log completo de ações**: Toda ação no sistema é registrada com usuário, data/hora e detalhes
- **Rastreabilidade**: Histórico completo de criação, edição e exclusão de registros
- **Tipos de ação**: Criação, Edição, Exclusão, Visualização, Importação, Exportação
- **Filtros avançados**: Por data, usuário, módulo, ação e termo de busca
- **Página dedicada**: `/auditoria` - Acesso exclusivo para Administradores

**Uso no código:**
```typescript
import { useModuleAudit } from '../contexts/AuditContext';

const { logCreate, logUpdate, logDelete, logView } = useModuleAudit('clientes');

// Exemplo de uso
logCreate('123', 'Empresa ABC', clienteData);
logUpdate('123', 'Empresa ABC', oldData, newData);
logDelete('123', 'Empresa ABC', clienteData);
```

### 2. Componente Base ListPage 🎨
- **Padronização**: Todas as telas de listagem seguem o mesmo padrão
- **Breadcrumb**: Navegação contextual
- **Barra de ações**: Botões de Novo, Exportar e ações customizadas
- **Cards de estatísticas**: KPIs visuais no topo
- **Filtros recolhíveis**: Área de filtros com animação
- **Tabela padronizada**: Com ordenação e formatação consistente
- **Paginação**: Controle de páginas e registros por página
- **Ações por linha**: Visualizar, Editar, Excluir (customizável)

**Exemplo de uso:**
```typescript
<ListPage
  breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Clientes" }]}
  title="Clientes"
  description="Gerencie seus clientes"
  icon={<Users className="size-8" />}
  onNew={handleNew}
  stats={statsArray}
  columns={columnsArray}
  data={filteredData}
  keyExtractor={(item) => item.id}
  actions={actionsArray}
/>
```

### 3. Fluxo de Integração entre Módulos 🔄

**Fluxo completo:**
```
Orçamento → Ordem de Produção → Consumo de Estoque → Solicitação de Compra
```

#### 3.1 Orçamentos
- Criar propostas comerciais
- Enviar para clientes
- Converter em Ordem de Produção com um clique
- Status: Rascunho, Enviado, Aprovado, Rejeitado, Convertido

#### 3.2 Ordens de Produção
- Criadas manualmente ou convertidas de orçamentos
- Verificação automática de materiais em estoque
- Reserva de materiais
- Consumo automático ao iniciar produção
- Status: Pendente, Em Produção, Pausada, Concluída, Cancelada
- Prioridades: Baixa, Normal, Alta, Urgente

#### 3.3 Integração com Estoque
- Verificação automática de disponibilidade
- Sistema de reserva de materiais
- Consumo automático na produção
- Alertas de materiais críticos
- Histórico de movimentações

#### 3.4 Solicitações de Compra
- Geração automática quando falta material
- Dialog mostrando materiais faltantes
- Cálculo automático do valor estimado
- Vinculação com a ordem que originou
- Status: Solicitada, Cotação, Aprovada, Pedido Enviado, Recebida

**Uso no código:**
```typescript
import { useWorkflow } from '../contexts/WorkflowContext';

const { 
  converterOrcamentoEmOrdem,
  iniciarProducao,
  verificarNecessidadeCompra,
  addSolicitacao 
} = useWorkflow();

// Converter orçamento em ordem
const ordem = converterOrcamentoEmOrdem(orcamentoId);

// Iniciar produção (verifica e consome estoque)
const sucesso = iniciarProducao(ordemId);

// Verificar materiais faltantes
const faltantes = verificarNecessidadeCompra(ordemId);

// Criar solicitação de compra
const solicitacao = addSolicitacao({ ... });
```

### 4. Dashboard de Gestão 📊

**Widgets implementados:**

#### KPIs Principais
- Receita total com tendência
- Ordens em aberto
- Materiais críticos (com alerta)
- Compras pendentes

#### Alertas Críticos
- Card destacado para materiais esgotados
- Materiais que impedem a produção
- Ação rápida para solicitar compra

#### Ordens em Produção
- Lista de ordens ativas
- Barra de progresso visual
- Previsão de conclusão
- Link direto para detalhes

#### Materiais Abaixo do Mínimo
- Lista de materiais críticos
- Indicador visual de urgência (cores)
- Percentual em relação ao mínimo
- Link para gestão de estoque

#### Gráficos Gerenciais
- **Produção e Faturamento**: Gráfico de barras combinado
  - Faturamento mensal (R$)
  - Número de ordens produzidas
- **Categorias de Produtos**: Gráfico de pizza
  - Distribuição por tipo de material

#### Ações Rápidas
- Novo Orçamento
- Nova Ordem de Produção
- Solicitar Compra
- Calculadora BOM

### 5. Sistema de Autenticação 🔐

#### Perfis de Usuário
1. **Admin** (Administrador)
   - Acesso total ao sistema
   - Único com acesso à Auditoria
   - Gestão completa

2. **Engenharia**
   - Produtos e Calculadora BOM
   - Ordens de Produção
   - Estoque e Compras
   - Orçamentos (visualização)

3. **Produção**
   - Ordens de Produção (foco principal)
   - Estoque e Compras
   - Produtos (consulta)

4. **Comercial**
   - Clientes
   - Orçamentos
   - Dashboard

#### Tela de Login
- Interface moderna e profissional
- Credenciais de demonstração visíveis
- Validação de autenticação
- Feedback visual de erro
- Armazenamento em localStorage

**Credenciais de Demonstração:**
- Admin: `admin@erp.com` / `admin123`
- Engenharia: `engenharia@erp.com` / `eng123`
- Produção: `producao@erp.com` / `prod123`
- Comercial: `comercial@erp.com` / `com123`

#### Menu de Usuário
- Avatar com iniciais
- Nome e perfil (role)
- Badge colorido por perfil
- Dropdown com informações
- Botão de logout

#### Controle de Acesso
- Rotas protegidas
- Verificação de permissão por módulo
- Menu dinâmico (exibe apenas módulos permitidos)
- Página de "Acesso Negado" para módulos restritos

**Uso no código:**
```typescript
import { useAuth } from '../contexts/AuthContext';

const { user, isAuthenticated, login, logout, hasPermission } = useAuth();

// Login
const success = await login(email, password);

// Verificar permissão
if (hasPermission('auditoria')) {
  // Usuário tem acesso
}

// Logout
logout();
```

## 🗂️ Estrutura de Arquivos

```
/src/app/
├── components/
│   ├── layout/
│   │   ├── Root.tsx                    # Layout principal com sidebar
│   │   ├── ListPage.tsx                # Componente base reutilizável
│   │   └── ProtectedRoute.tsx          # HOC para proteção de rotas
│   └── ui/                             # Componentes shadcn/ui
├── contexts/
│   ├── AuthContext.tsx                 # Contexto de autenticação
│   ├── AuditContext.tsx                # Contexto de auditoria
│   └── WorkflowContext.tsx             # Contexto de workflow integrado
├── types/
│   ├── auth.ts                         # Tipos de autenticação
│   ├── audit.ts                        # Tipos de auditoria
│   └── workflow.ts                     # Tipos de workflow (Orçamentos, Ordens, etc)
├── pages/
│   ├── Login.tsx                       # Página de login
│   ├── Dashboard.tsx                   # Dashboard com widgets de gestão
│   ├── Clientes.tsx                    # Gestão de clientes
│   ├── Produtos.tsx                    # Catálogo de produtos
│   ├── Estoque.tsx                     # Controle de estoque
│   ├── Orcamentos.tsx                  # Orçamentos (com integração)
│   ├── Ordens.tsx                      # Ordens de Produção (com integração)
│   ├── Compras.tsx                     # Solicitações de compra
│   ├── Calculadora.tsx                 # Calculadora BOM
│   └── Auditoria.tsx                   # Logs de auditoria
├── routes.ts                           # Configuração de rotas
└── App.tsx                             # Root component
```

## 🎨 Design System

### Cores por Perfil
- **Admin**: Roxo (`purple-*`)
- **Engenharia**: Azul (`blue-*`)
- **Produção**: Verde (`green-*`)
- **Comercial**: Laranja (`orange-*`)

### Status de Ordens
- **Pendente**: Amarelo/Outline
- **Em Produção**: Azul/Secondary
- **Concluída**: Verde/Default
- **Cancelada**: Vermelho/Destructive

### Alertas
- **Crítico**: Vermelho - Material esgotado
- **Alta**: Amarelo - Abaixo de 60% do mínimo
- **Média**: Azul - Abaixo de 80% do mínimo

## 🚀 Próximos Passos (Sugestões)

1. **Biblioteca de Modelos de BOM**
   - Salvar templates de produtos comuns
   - Gerar BOM automaticamente a partir de medidas
   - Integração direta com Ordens e Estoque

2. **Relatórios Avançados**
   - Relatório de produção por período
   - Análise de custos por produto
   - Gráfico de consumo de materiais
   - Previsão de necessidade de compras

3. **Notificações**
   - Sistema de notificações em tempo real
   - Alertas de materiais críticos
   - Notificações de aprovação de orçamentos
   - Avisos de ordens atrasadas

4. **Mobile Responsivo**
   - Melhorar experiência mobile
   - App para chão de fábrica
   - Scanner de códigos de barras

5. **Integração com Backend**
   - API REST para todos os módulos
   - Persistência real de dados
   - Upload de arquivos (PDFs, imagens)
   - Sincronização offline

## 📝 Notas Técnicas

- **Framework**: React 18.3.1
- **Routing**: React Router 7
- **Styling**: Tailwind CSS 4.1 + shadcn/ui
- **Estado**: Context API (escalável para Redux/Zustand)
- **Gráficos**: Recharts 2.15
- **Ícones**: Lucide React
- **Tema**: next-themes (light/dark)
- **Notificações**: Sonner (toast)
- **Formulários**: React Hook Form (preparado)

## 🎯 Diferenciais do Sistema

1. ✅ **Auditoria Completa**: Rastreabilidade total de ações
2. ✅ **Fluxo Integrado**: Orçamento → Ordem → Estoque → Compra automatizado
3. ✅ **Design System Padronizado**: Componente ListPage reutilizável
4. ✅ **Controle de Acesso**: 4 perfis com permissões granulares
5. ✅ **Dashboard Gerencial**: Widgets focados em produção industrial
6. ✅ **Interface Moderna**: Dark/Light mode, responsiva, acessível

---

**Desenvolvido para gestão industrial profissional** 🏭
