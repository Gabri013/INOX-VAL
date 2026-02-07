# Inventário Técnico: Multi-tenant (`empresaId`) + Produção

Este documento registra, de forma **operacional e auditável**, como o INOX-VAL aplica multi-tenant por `empresaId` e como o módulo de **Produção** está estruturado (UI → hooks → services → Firestore).

Objetivos:

- Servir como referência para auditoria de segurança (evitar vazamento cross-tenant).
- Servir como referência para manutenção/PRs incrementais **sem alterar o fluxo de Produção**.
- Deixar explícito “onde procurar” quando algo quebrar em Produção.

## Regras globais (fonte: `CONTEXT.md`)

As regras abaixo são **críticas** e não podem ser violadas:

- Multi-tenant obrigatório por `empresaId`.
- Nenhuma leitura/escrita pode acessar dados de outra empresa.
- Todas as queries devem filtrar por `empresaId`.
- Não alterar a lógica atual de Produção (já está operacional).
- Não modificar `firestore.rules`.
- Mudanças devem ser incrementais e de baixo risco.

## Ponto de partida: arquivos e “entry points”

- Contexto e restrições: `CONTEXT.md`
- Regras/índices Firestore: `firestore.rules`, `firestore.indexes.json`
- Firebase + contexto de empresa: `src/lib/firebase.ts`
- Auth e bootstrap do contexto: `src/contexts/AuthContext.tsx`
- Helpers Firestore (tenant enforcement): `src/services/firestore/base.ts`

Produção (arquitetura e fluxo):

- Páginas: `src/domains/producao/pages/ControleProducao.tsx`, `src/domains/producao/pages/ApontamentoOP.tsx`, `src/domains/producao/pages/DashboardTV.tsx`
- Hooks: `src/domains/producao/producao.hooks.ts`
- Service: `src/domains/producao/services/producao-itens.service.ts`
- Tipos: `src/domains/producao/producao.types.ts`

## Como o `empresaId` é derivado e aplicado

### Derivação (origem do tenant)

Padrão esperado (confirmar no código):

1. Usuário autentica via Firebase Auth.
2. O app obtém (ou já possui) um **perfil de usuário** contendo `empresaId`.
3. O app armazena esse contexto em memória (ex.: “empresa context”) para uso em services.
4. Leitura/escrita usa `getEmpresaId()` antes de qualquer acesso ao Firestore.

Onde verificar:

- `src/contexts/AuthContext.tsx`: bootstrap do usuário, carregamento de perfil e set do contexto.
- `src/lib/firebase.ts`: init do Firebase e helpers relacionados a contexto (`getEmpresaContext`).
- `src/services/firestore/base.ts`: funções `getEmpresaId()`, `getCurrentUserId()` e helpers de auditoria.

### Enforcement (aplicação do tenant)

Padrões que devem existir (e ser usados) no código:

- **Listagens/queries:** sempre `where('empresaId', '==', empresaId)`.
- **Leitura por ID:** após `getDoc`, validar que o documento retornado possui o mesmo `empresaId`.
- **Criação/atualização:** payload sempre inclui `empresaId` (e timestamps/usuário quando aplicável).

Checklist rápido de enforcement:

- Existe algum `collectionGroup(...)` sem filtro de `empresaId`?
- Existe algum `getDoc(doc(...))` sem checar `empresaId` do doc retornado?
- Existe algum write em que `empresaId` é opcional/ausente?

## Base Firestore: padrões e garantias

O arquivo `src/services/firestore/base.ts` é o “ponto de gravidade” do enforcement multi-tenant.

O que este arquivo deve garantir (documentar e checar antes de qualquer refactor):

- Um caminho único/canônico para obter `empresaId` (`getEmpresaId()`).
- Helpers reutilizáveis para queries (idealmente compondo constraints com `empresaId`).
- Helpers para auditoria (ex.: `writeAuditLog`) usados por services de domínio.

Recomendação prática para PRs futuros (sem mudar comportamento):

- Centralizar a composição de constraints (`empresaId` sempre primeiro) para reduzir riscos de esquecimento.

## Arquitetura do módulo de Produção

### Visão geral (dependências)

```mermaid
flowchart TD
  UI[UI / Pages] --> Hooks[React Query hooks]
  Hooks --> Service[Domain service]
  Service --> Firestore[(Firestore)]

  UI --> CP[ControleProducao]
  UI --> AP[ApontamentoOP]
  UI --> TV[DashboardTV]

  Hooks --> HIS[useItensSetor]
  Hooks --> HM[useMoverItem]
  Hooks --> HS[useAtualizarStatus]

  Service --> PS[producaoItensService]

  Firestore --> OP[ordens_producao/{ordemId}]
  Firestore --> IT[ordens_producao/{ordemId}/items|itens/{itemId}]
  Firestore --> MV[.../movimentacoes/{movId}]
```

Notas importantes:

- A “fonte oficial” de leitura na UI de Produção é **`collectionGroup('itens'/'items')`** (ver comentários em `DashboardTV.tsx` e `producao.hooks.ts`).
- O service de Produção deve aplicar `empresaId` em **todas** as queries e writes.

### Coleções canônicas (Produção)

De acordo com `CONTEXT.md`, a estrutura principal envolve:

- `ordens_producao/{ordemId}`
- `ordens_producao/{ordemId}/items/{itemId}` (ou `itens`, dependendo do padrão no projeto)
- `movimentacoes` (por item ou subcoleção equivalente já usada)

O que conferir no código/regras:

- O **nome real** da subcoleção (`items` vs `itens`) no Firestore.
- Se `movimentacoes` é subcoleção por OP, por item, ou uma coleção auxiliar.
- Se existe `collectionGroup('itens')` (pluralização exata) e quais campos são indexados.

### Invariantes obrigatórias (Produção)

Fonte: `CONTEXT.md`.

Para todo item de produção:

- `empresaId` do item deve ser igual ao da ordem.
- `ordemId` deve bater com o documento pai.
- `setorAtual` deve ser um setor válido.
- `status` deve ser um status válido.

Para toda movimentação:

- Referenciar item existente.
- Conter `empresaId`.
- Conter setor/status de origem e destino.
- Conter timestamp e usuário.

Onde conferir:

- Tipos: `src/domains/producao/producao.types.ts`
- Writes e payloads: `src/domains/producao/services/producao-itens.service.ts`
- UI e transições: `src/domains/producao/pages/*`

## Vetores de vazamento multi-tenant (watchlist)

1. `collectionGroup(...)` sem `where('empresaId', '==', empresaId)`.
2. Query com filtro “parcial” (ex.: filtra por setor/status, mas não por `empresaId`).
3. `getDoc` por ID sem validação do `empresaId` do documento retornado.
4. Writes que permitem `empresaId` ausente (ou setado por input do cliente sem validação).
5. Seeds/scripts que geram dados com `empresaId` errado.
6. Cache do `empresaId` no cliente ficando “stale” ao trocar de conta/sessão.

Arquivos a revisar rapidamente quando surgir risco:

- `src/services/firestore/base.ts`
- `src/domains/producao/services/producao-itens.service.ts`
- `src/domains/producao/producao.hooks.ts`
- `firestore.rules`

## Restrições do Firestore (regras e cobertura)

O Firestore é **deny-by-default**: qualquer coleção nova precisa ter `match` explícito em `firestore.rules`.

Como checar cobertura sem mudar regras:

1. Buscar no arquivo `firestore.rules` um bloco `match` correspondente ao path.
2. Confirmar que as validações exigem `empresaId` e garantem `belongsToTenant` (ou equivalente).
3. Confirmar se subcoleções têm regras próprias.

Nota: o plano de “calculadora parametrizada” propõe novas coleções. Antes de implementar persistência nelas, é obrigatório verificar se **as regras atuais já cobrem** esses paths.

## Checklist do PR (PR1)

- [ ] Este documento existe e referencia arquivos reais.
- [ ] Existe um checklist de auditoria prático (ver `docs/production-audit-checklist.md`).
- [ ] Não houve mudança em lógica de Produção.
- [ ] Não houve mudança em `firestore.rules`.

