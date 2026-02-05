# 🏭 **ERP INOX - ROADMAP TÉCNICO COMPLETO**
## **Sistema de Gestão Industrial para Fabricação de Bancadas e Equipamentos em Inox**

---

## 📌 **OBJETIVO FINAL**

> **"Orçamento em 5 minutos com preço preciso + lista de corte + OP pronta, e produção devolvendo custo real para melhorar os modelos."**

### **Características do Sistema:**
- ✅ **Não permite produtos livres** - tudo baseado em modelos parametrizados
- ✅ **Fluxo obrigatório:** Modelo → Dimensões → Blank → BOM → Nesting → Consumo → Custos → Preço
- ✅ **Chapas padrão:** Apenas 2000×1250 e 3000×1250
- ✅ **Registry único** de modelos com validações runtime
- ✅ **Sistema de apontamento** touch-friendly + dashboard TV
- ✅ **Estoque por material** (não produto genérico)
- ✅ **Verificação automática de BOM** ao criar OP
- ✅ **Geração de solicitações de compra** quando faltam materiais

---

## ✅ **ESTADO ATUAL - O QUE JÁ ESTÁ PRONTO**

### **FASE 1: Nesting Real (Concluída)**
- ✅ Algoritmo real de nesting (guillotine + shelf)
- ✅ Cálculo de aproveitamento de chapa
- ✅ Suporte a 2 formatos de chapa (2000×1250 e 3000×1250)
- ✅ Visualização gráfica do nesting
- ✅ Detecção de sobras reutilizáveis

### **FASE 2: Eliminação de Mocks (Concluída)**
- ✅ Dados vêm 100% dos modelos (sem hardcoded)
- ✅ WorkflowContext gerencia orçamentos/OPs sem localStorage
- ✅ Cálculo de BOM direto dos modelos

### **FASE 3: BOM + Whitelist + Tubos (Concluída)**
- ✅ Whitelist de chapas e perfis parametrizados
- ✅ BOM inclui tubos/perfis (não só chapas)
- ✅ Registry de materiais com validações
- ✅ Tipos: Chapa, Tubo Quadrado, Tubo Redondo, Cantoneira, Perfil U

### **FASE 4: Estoque + Compras por Material (Concluída)**
- ✅ Service dedicado `estoque-material.service.ts`
- ✅ Verificação automática de materiais da BOM ao criar OP
- ✅ Geração de solicitações de compra quando faltam materiais
- ✅ Controle de lotes e movimentações
- ✅ Recebimento de compras atualiza estoque

### **FASE 5: PDF de Proposta + Custos Profissionais (Concluída)**
- ✅ Sistema de configuração de custos empresariais
- ✅ Regime tributário (Simples Nacional / Lucro Presumido / Real)
- ✅ Custos indiretos (administrativo, comercial, logística)
- ✅ Margens por categoria de produto
- ✅ Descontos progressivos (quantidade e valor)
- ✅ Gerador de PDF profissional com jsPDF
- ✅ Preview e download de propostas
- ✅ Página de configuração de custos completa

---

## 🚀 **PRÓXIMAS 6 SPRINTS - CAMINHO PARA PRODUÇÃO**

### **SPRINT 1-2: BACKEND MULTI-USUÁRIO** (2-3 semanas)
**Objetivo:** Dados centralizados, autenticação real, múltiplos usuários simultâneos

#### **Stack Recomendada:**
- **Backend:** Node.js + NestJS (ou Express simples)
- **Banco:** PostgreSQL
- **Auth:** JWT + bcrypt
- **ORM:** Prisma (ou TypeORM)
- **Deploy:** Docker + PM2 (ou cloud: AWS/Azure/Heroku)

#### **Entregas:**
1. **API REST completa:**
   - `/auth/login` - autenticação
   - `/auth/refresh` - renovação de token
   - CRUD completo de:
     - Clientes
     - Produtos (modelos)
     - Materiais (whitelist)
     - Orçamentos
     - Ordens de Produção
     - Compras
     - Estoque
     - Usuários

2. **Banco de Dados:**
   - Schema Prisma (ou TypeORM)
   - Migrations versionadas
   - Seeds com dados de exemplo

3. **Segurança:**
   - JWT com refresh token
   - Hash de senhas com bcrypt
   - Rate limiting
   - CORS configurado

4. **Documentação:**
   - Swagger/OpenAPI para endpoints
   - README de setup
   - Variáveis de ambiente (.env.example)

#### **Arquivos de Referência no Front:**
- `/src/app/contexts/WorkflowContext.tsx` - lógica de orçamentos/OPs
- `/src/domains/estoque/estoque-material.service.ts` - lógica de estoque
- `/src/domains/custos/custos.service.ts` - lógica de custos
- `/src/bom/models/*.ts` - modelos de produto
- `/src/bom/whitelist.ts` - catálogo de materiais

**IMPORTANTE:** O front já está estruturado com Services. Basta **trocar o mock por chamadas HTTP**.

---

### **SPRINT 3: INTEGRAÇÃO FRONTEND ↔ BACKEND** (1-2 semanas)
**Objetivo:** Conectar front React ao backend real

#### **Entregas:**
1. **Client HTTP:**
   - Criar `/src/services/api.client.ts` com axios
   - Interceptors para JWT automático
   - Error handling global
   - Loading states

2. **Refatorar Services:**
   - `orcamento.service.ts` → chamar API
   - `ordem-producao.service.ts` → chamar API
   - `estoque-material.service.ts` → chamar API
   - `custos.service.ts` → chamar API
   - **Manter mesma interface** (contratos não mudam)

3. **Context Providers:**
   - `AuthContext` → autenticação real com JWT
   - `WorkflowContext` → dados da API
   - Cache local com React Query

4. **Loading/Error States:**
   - Skeletons em listas
   - Toast de erro com retry
   - Offline detection

#### **Exemplo de Refatoração:**

**ANTES (mock):**
```typescript
// estoque-material.service.ts
export function verificarDisponibilidade(materialId: string, qtd: number): boolean {
  const item = estoqueMemoria.find(e => e.materialId === materialId);
  return item ? item.quantidade >= qtd : false;
}
```

**DEPOIS (API):**
```typescript
// estoque-material.service.ts
export async function verificarDisponibilidade(materialId: string, qtd: number): Promise<boolean> {
  const response = await apiClient.post('/estoque/verificar-disponibilidade', {
    materialId,
    quantidade: qtd
  });
  return response.data.disponivel;
}
```

---

### **SPRINT 4: RBAC + AUDITORIA** (1-2 semanas)
**Objetivo:** Controle de acesso por perfil + rastreabilidade total

#### **Perfis:**
- **Admin:** acesso total
- **Comercial:** cria orçamentos, vê produtos, não mexe em whitelist/custos
- **Engenharia:** mexe em modelos, whitelist, configurações técnicas
- **Produção:** vê OP/BOM, aponta produção, não altera preços
- **Compras:** gerencia estoque e compras

#### **Entregas:**
1. **Backend:**
   - Tabela `permissions` (módulo + ação)
   - Middleware de autorização
   - Endpoints protegidos por perfil

2. **Frontend:**
   - `usePermissions()` hook
   - Botões/rotas condicionais por permissão
   - Mensagem de "Sem permissão"

3. **Auditoria:**
   - Log de **todas** as ações:
     - Quem (usuário)
     - Quando (timestamp)
     - O quê (ação + entidade)
     - Dados (antes/depois para updates)
   - Página `/auditoria` com filtros
   - Histórico por orçamento/OP

4. **Trilhas de Aprovação:**
   - Orçamento: rascunho → enviado → aprovado/rejeitado
   - OP: criada → em produção → finalizada
   - Compra: solicitada → aprovada → recebida

---

### **SPRINT 5: INTEGRAÇÃO COM PRODUÇÃO** (1-2 semanas)
**Objetivo:** Levar engenharia para o chão de fábrica

#### **Entregas:**
1. **Lista de Corte Exportável:**
   - Gerar Excel/PDF com:
     - Chapas: material, dimensões, quantidade
     - Tubos: perfil, comprimento, quantidade
     - Blanks por item
   - Agrupado por material para otimizar corte

2. **Etiquetas/QR Code:**
   - QR code por OP com:
     - Número da OP
     - Cliente
     - Produto
     - BOM resumida
   - Scanner na produção para apontar

3. **Checklist de Produção:**
   - Etapas: Corte → Dobra → Solda → Polimento → Embalagem
   - Status por OP
   - Tempo real de cada etapa
   - Interface touch-friendly (já existe)

4. **Dashboard TV Aprimorado:**
   - OPs em andamento
   - Tempo por etapa
   - Alertas de atraso
   - Performance do operador

---

### **SPRINT 6: RELATÓRIOS GERENCIAIS** (1 semana)
**Objetivo:** KPIs para gestão estratégica

#### **Entregas:**
1. **Dashboard Gerencial:**
   - **Taxa de aproveitamento de chapa** (média mensal)
   - **Custo real vs. estimado** por OP
   - **Tempo médio de produção** por tipo de bancada
   - **Compras geradas por falta** de material
   - **Margem real** (comparando custo estimado vs. real)

2. **Alertas:**
   - Materiais críticos (abaixo do mínimo)
   - OP atrasada (prazo estourado)
   - Orçamento aguardando aprovação há X dias

3. **Exportação:**
   - Excel de todos os relatórios
   - PDF para apresentação

---

## 🔮 **ROADMAP DE EVOLUÇÃO - MÉDIO/LONGO PRAZO**

### **EVOLUÇÃO 1: QUALIDADE E PADRONIZAÇÃO INDUSTRIAL**
**Timeline:** 3-6 meses após backend

#### **Objetivo:**
Sistema à prova de erros - "se passou, está certo".

#### **Entregas:**
1. **Bloqueios e Validações Avançadas:**
   - Limites de medidas por modelo:
     - Ex.: Bancada simples: L max 3000mm, P max 800mm
   - Interferências:
     - Cuba não pode ser maior que bancada
     - Pés têm altura mínima
   - Regras de fabricação:
     - Reforço obrigatório acima de 1500mm
     - Espessura mínima 0.8mm para determinados usos

2. **Checklist de Engenharia Automático:**
   - Antes de gerar OP, validar:
     - ✓ Todos os blanks têm dimensões válidas
     - ✓ Nesting tem aproveitamento > X%
     - ✓ Não há tubos com comprimento > chapa padrão
     - ✓ BOM completa (sem materiais faltando)

3. **Alertas de Custo:**
   - "Margem abaixo do mínimo (X%)"
   - "Aproveitamento de chapa muito baixo (Y%)"
   - "Preço fora do padrão para este tipo"

4. **Implementação:**
   - Adicionar campo `validations` nos modelos
   - Hook `useModelValidation()` no front
   - Endpoint `/validate-orcamento` no backend

---

### **EVOLUÇÃO 2: CUSTO REAL (FECHAR O CICLO)**
**Timeline:** 6-9 meses após backend

#### **Objetivo:**
Produção alimenta engenharia com dados reais para melhorar estimativas.

#### **O Ciclo:**
```
ENGENHARIA estimada
    ↓
PRODUÇÃO registra REAL
    ↓
SISTEMA compara e APRENDE
    ↓
ENGENHARIA melhora os MODELOS
```

#### **Entregas:**
1. **Registro de Consumo Real:**
   - Durante apontamento de produção:
     - Chapas realmente usadas (+ sobras)
     - Metros de tubo realmente cortados
     - Tempo por etapa (corte, dobra, solda, etc.)
   - Dados salvos por OP

2. **Comparação Estimado vs. Real:**
   - Tabela comparativa:
     - Material estimado | Material real | Diferença
     - Tempo estimado | Tempo real | Diferença
   - Gráficos de desvio

3. **Ajuste Automático de Modelos:**
   - Se 10 OPs de "Bancada 2000×600" sempre usam +5% de chapa:
     - Sistema sugere ajustar o modelo
     - Atualização pode ser manual ou automática
   - Perda média por tipo de material

4. **KPI de Acuracidade:**
   - % de precisão por modelo
   - Engenheiros veem onde melhorar

---

### **EVOLUÇÃO 3: INTEGRAÇÃO COMPRAS/FINANCEIRO**
**Timeline:** 9-12 meses após backend

#### **Entregas:**
1. **Pedido de Compra Automático:**
   - Gerar PDF de pedido
   - Envio por email/WhatsApp automático para fornecedor
   - Template personalizável

2. **Gestão de Fornecedores:**
   - Catálogo de fornecedores por material
   - Preço histórico (para detectar variação)
   - Lead time médio
   - Avaliação de qualidade

3. **Controle Financeiro:**
   - Integração com NFe (depende do sistema fiscal)
   - Tracking de contas a pagar/receber
   - Fluxo de caixa básico

---

### **EVOLUÇÃO 4: MULTI-UNIDADE E TABELAS DE PREÇO**
**Timeline:** 12-15 meses após backend

#### **Objetivo:**
Virar "comercial de verdade" - preços dinâmicos por contexto.

#### **Entregas:**
1. **Tabela de Preço por:**
   - **Filial:** fábrica A tem custo diferente de fábrica B
   - **Vendedor:** comissões diferentes
   - **Cliente:** desconto especial para recorrentes
   - **Região:** frete varia

2. **Simulador de Cenários:**
   - Vendedor seleciona:
     - Cliente X
     - Região Y
     - Condição Z (à vista / prazo)
   - Sistema recalcula preço automaticamente

3. **Regras de Negócio:**
   - "Cliente VIP: sempre 10% de desconto"
   - "Região Sul: +5% de frete"
   - "Vendedor Pleno: margem mínima 20%"

---

### **EVOLUÇÃO 5: INTEGRAÇÃO CAD/CAM**
**Timeline:** 15-18 meses após backend

#### **Objetivo:**
Zerar re-trabalho manual - do orçamento direto para a máquina.

#### **Entregas:**
1. **Exportação DXF:**
   - Cada blank vira um arquivo DXF
   - Compatível com corte a laser / plasma
   - Organizado por chapa (nesting)

2. **Lista de Dobra:**
   - Exportar para software de dobradeira
   - Ângulos, linhas, sequência

3. **Padronização de Part Numbers:**
   - Cada blank tem ID único
   - Rastreável na produção

4. **Integração com Softwares CAM:**
   - Ex.: Solidworks, AutoCAD, Fusion 360
   - API para importar/exportar

---

### **EVOLUÇÃO 6: BIBLIOTECA DE PRODUTOS E TEMPLATES**
**Timeline:** 18-24 meses após backend

#### **Objetivo:**
Escala comercial - orçamento complexo em segundos.

#### **Entregas:**
1. **Pacotes Prontos:**
   - "Cozinha Industrial Padrão" (10 itens)
   - "Linha Hospitalar Básica" (15 itens)
   - "Kit Restaurante Completo" (20 itens)

2. **Wizard de Montagem:**
   - Vendedor arrasta templates
   - Sistema soma tudo automaticamente
   - Ajusta quantidades

3. **Combos:**
   - "Bancada + Cuba + Prateleira = -5%"
   - Upsell automático

---

### **EVOLUÇÃO 7: VIRAR PRODUTO (SaaS)**
**Timeline:** 24+ meses após backend

#### **Se o objetivo for licenciar/vender:**

1. **Multi-Tenant:**
   - Isolamento por empresa
   - Banco de dados particionado
   - Domínio customizado (empresa.erp.com.br)

2. **Licenciamento:**
   - Planos: Starter / Pro / Enterprise
   - Limite de usuários/OPs/storage
   - Billing automático (Stripe/PagSeguro)

3. **Portal do Cliente:**
   - Cliente aprova orçamento online
   - Tracking de OP (onde está meu pedido?)
   - Histórico de compras

4. **Infraestrutura:**
   - Backups automáticos
   - Logs centralizados
   - Monitoring (Datadog/NewRelic)
   - SLA de uptime

---

## 👥 **DIVISÃO DE TIMES (10 DESENVOLVEDORES)**

### **TIME 1: BACKEND (3 devs)**
**Responsabilidade:** API, banco, auth, deploy

**Tarefas:**
- Setup NestJS + Prisma + PostgreSQL
- Endpoints CRUD completos
- JWT auth + refresh token
- Migrations e seeds
- Docker setup
- Deploy em produção

**Liderança:** Dev sênior com exp. em Node/NestJS

---

### **TIME 2: INTEGRAÇÃO FRONTEND (2 devs)**
**Responsabilidade:** Conectar React ao backend

**Tarefas:**
- Criar `api.client.ts` com axios
- Refatorar services (manter contratos)
- React Query para cache
- Loading states e skeletons
- Error handling

**Liderança:** Dev com exp. em React/TypeScript

---

### **TIME 3: RBAC + AUDITORIA (2 devs)**
**Responsabilidade:** Permissões e rastreabilidade

**Tarefas:**
- Implementar RBAC no backend
- Middleware de autorização
- Frontend com `usePermissions()`
- Sistema de logs/auditoria
- Página de histórico

**Liderança:** Dev com exp. em segurança

---

### **TIME 4: PRODUÇÃO + RELATÓRIOS (3 devs)**
**Responsabilidade:** Integração com chão de fábrica

**Tarefas:**
- Lista de corte (Excel/PDF)
- QR codes e etiquetas
- Dashboard TV aprimorado
- Relatórios gerenciais
- KPIs e gráficos (Recharts)

**Liderança:** Dev full-stack

---

## 📊 **CRONOGRAMA MACRO**

| Sprint | Semanas | Entregas |
|--------|---------|----------|
| **1-2** | 2-3 | Backend + Banco + Auth |
| **3** | 1-2 | Integração Front↔Back |
| **4** | 1-2 | RBAC + Auditoria |
| **5** | 1-2 | Produção (lista corte, QR, checklist) |
| **6** | 1 | Relatórios + KPIs |
| **Total** | **~8 semanas** | **Sistema multiusuário em produção** |

---

## 🔥 **PRÓXIMOS PASSOS IMEDIATOS**

### **SEMANA 1:**
1. ✅ **TIME 1:** Setup inicial do backend (NestJS + Prisma + Docker)
2. ✅ **TIME 2:** Criar branch `feature/api-integration` e estrutura de `api.client.ts`
3. ✅ **TIME 3:** Estudar estrutura de permissões atual no front
4. ✅ **TIME 4:** Mapear requisitos de lista de corte e QR codes

### **SEMANA 2:**
1. ✅ **TIME 1:** Endpoints de Auth + CRUD de Clientes/Produtos
2. ✅ **TIME 2:** Integrar login + listagem de clientes
3. ✅ **TIME 3:** Implementar tabela de permissões no banco
4. ✅ **TIME 4:** Protótipo de lista de corte em PDF

### **SEMANA 3+:**
- Daily standups (15min)
- Review semanal de integração
- QA contínuo

---

## 📚 **DOCUMENTAÇÃO DE REFERÊNCIA**

### **Arquivos-chave no projeto:**
- `/src/app/contexts/WorkflowContext.tsx` - Lógica central de orçamentos/OPs
- `/src/domains/estoque/estoque-material.service.ts` - Gestão de estoque
- `/src/domains/custos/custos.service.ts` - Cálculo de custos
- `/src/bom/models/*.ts` - Modelos de produto (Bancada, etc.)
- `/src/bom/whitelist.ts` - Catálogo de materiais
- `/src/app/types/workflow.ts` - Tipos principais

### **Padrões do projeto:**
- ✅ **Sem produtos livres** - tudo vem de modelos
- ✅ **Registry único** - `getModelRegistry()` é fonte da verdade
- ✅ **Validações runtime** - garantias no WorkflowContext
- ✅ **Services puros** - sem side effects, fácil de testar
- ✅ **Types first** - TypeScript strict mode

---

## 🎯 **MÉTRICAS DE SUCESSO**

### **Sprint 6 (Sistema Básico):**
- ✅ 20 usuários simultâneos sem problema
- ✅ Login em < 2s
- ✅ Criar orçamento em < 30s
- ✅ Gerar PDF em < 5s
- ✅ Auditoria completa (100% das ações logadas)

### **Evolução 2 (Custo Real):**
- ✅ 80% de acuracidade entre estimado vs. real
- ✅ Redução de 20% em desperdício de material

### **Evolução 5 (CAD/CAM):**
- ✅ Orçamento → Lista de corte em < 2 minutos
- ✅ Zero re-trabalho manual de DXF

### **Evolução 7 (SaaS):**
- ✅ 99.9% uptime
- ✅ 10+ empresas usando
- ✅ < 1s de resposta da API (p95)

---

## 📞 **CONTATOS E SUPORTE**

**Dúvidas sobre arquitetura:**
- Revisar este documento
- Consultar código-fonte atual (comentários inline)
- Daily standup

**Stack Técnica:**
- **Frontend:** React 18 + TypeScript + Tailwind CSS + React Router
- **Backend:** Node.js + NestJS + Prisma + PostgreSQL
- **Deploy:** Docker + PM2 (ou AWS/Azure)
- **CI/CD:** GitHub Actions (recomendado)

---

## 🚀 **VAMOS TRANSFORMAR ISSO EM REALIDADE!**

**Equipe de 10 devs + 20 usuários + urgência = Sistema em produção em 8 semanas.**

Este roadmap é o guia completo. Agora é executar! 💪
