# INOX-VAL — Kilo Code Execution Pack (Prompts em Partes)

Este arquivo organiza **todos os prompts principais** enviados nesta conversa em **módulos executáveis** (um por vez), para o Kilo Code implementar sem sobrecarga.  
Regra de uso: **execute em ordem**, só avance quando o módulo atual estiver com **PASS** (build/tests/validate conforme o módulo).

---

## Índice (ordem recomendada)

1. **P0 — Mapa + Roadmap executável**
2. **P1 — Sistema de Precificação Automática (Core) — MASTER V2**
3. **P2 — Biblioteca de Equipamentos (DSL) + Templates em Lote (16 + presets)**
4. **P3 — Calibração Completa**
5. **P4 — Validação Total**
6. **P5 — Validação Avançada Extrema**
7. **P6 — Validação Corporativa (Jurídico + Contábil + Antifraude + ISO)**
8. **P7 — Sistema Único 100% Integrado (Orchestrator + Workflow + Guards)**
9. **Apêndice — Prompts auxiliares (opcionais)**

---

# P0 — MAPA TOTAL DO SISTEMA + ROADMAP EXECUTÁVEL

## Prompt

Você (Kilo Code) deve gerar um documento definitivo do INOX-VAL com:
1) Mapa de módulos (domínios, UI, infra, integrações)  
2) Dependências entre módulos (grafo)  
3) Roadmap por fases: ESSENCIAL / PRODUTIVO / DIFERENCIAL / NASA  
4) Backlog em épicos e issues (com critérios de aceite)  
5) Priorização por impacto e risco (matriz)  

Entregáveis:
- `/docs/MASTER_BLUEPRINT.md`
- `/docs/ROADMAP.md`
- `/docs/BACKLOG.md` (com IDs: EPIC-###, TASK-###)
- `/docs/DEPENDENCY_GRAPH.md` (ASCII ou Mermaid)

Critérios de aceite:
- Toda feature listada tem: objetivo, dados necessários, módulos afetados, risco, aceitação.
- O roadmap não tem itens “genéricos”; tudo vira tarefa implementável.

---

# P1 — SISTEMA DE PRECIFICAÇÃO 100% PRONTO E UTILIZÁVEL (MASTER V2)

## Prompt

Implementar um sistema onde:

1. Usuário seleciona um equipamento.
2. Usuário insere medidas.
3. Sistema gera automaticamente a estrutura completa (BOM real).
4. Sistema executa cálculos geométricos reais.
5. Sistema roda nesting real.
6. Sistema calcula custo de material real.
7. Sistema calcula custo de processos real.
8. Sistema aplica margem configurada.
9. Sistema retorna valor final.
10. Sistema gera snapshot auditável e reprodutível.

Sem intervenção manual obrigatória.

Sem valor estimado invisível.

Sem campo opcional crítico.

### Arquitetura obrigatória

Criar módulo isolado:

`/src/domains/pricingSystem/`

Arquivos obrigatórios:

- `pricing.types.ts`
- `equipment.templates.ts`
- `equipment.generator.ts`
- `structural.rules.ts`
- `geometry.pipeline.ts`
- `nesting.pipeline.ts`
- `material.cost.ts`
- `process.cost.ts`
- `pricing.engine.ts`
- `pricing.pipeline.ts`
- `snapshot.engine.ts`
- `validation.engine.ts`

A pipeline deve ser fixa e imutável.

### Fluxo completo (pipeline obrigatória)

`INPUT (equipamento + medidas)`
→ `generateEquipmentBOM()`
→ `applyStructuralRules()`
→ `runGeometryCalculations()`
→ `runNesting()`
→ `calculateMaterialCost()`
→ `calculateProcessCost()`
→ `applyOverhead()`
→ `applyMargin()`
→ `generateFinalPrice()`
→ `createSnapshot()`

Nenhuma etapa pode ser ignorada.

### Template de equipamento

Criar estrutura:

- `EquipmentTemplate` com:
  - `requiredInputs`
  - `generateBOM(inputs): BOM`
  - `structuralRules`
  - `processRules`

Implementar inicialmente:
- Mesa Lisa
- Bancada com Espelho

### BOM automática (exemplo Mesa Lisa)

Inputs:
- largura
- profundidade
- altura
- espessura
- acabamento
- comPrateleira (boolean)

Gerar automaticamente:
- SheetParts: tampo, prateleira (se aplicável)
- Tubes: 4 pés + travessas + reforço (conforme regra)
- Accessories: sapatas
- Processos: corte, solda, acabamento, montagem

### Regras estruturais automáticas (exemplos)

- IF profundidade > 700mm → adicionar reforço central
- IF largura > 2000mm → min espessura 1.5mm
- IF espessura < mínimo → bloquear orçamento
- IF altura > 900 → recalcular pés / reforços

### Motor geométrico

Para cada SheetPart:
- área, massa, perímetro de corte, blank desenvolvido (quando houver dobras)

Para tubos:
- comprimento total, massa (kg/m * comprimento)

### Nesting real (chapa)

Entrada:
- blanks, formatos permitidos, kerf, margem

Saída:
- número de chapas, aproveitamento %, kg comprado, perda real

Custo deve usar **comprado** (chapa ou kg), não só área.

### Custo de processos

Para cada processo:
- setup + tempo (métricas * minutesPerX) + custo/h + custo por métrica (se existir)

### Overhead e Margem

- overhead por empresa (% ou fixo)
- margem mínima obrigatória
- bloquear abaixo do mínimo

### Snapshot imutável

Gerar snapshot com:
- equipmentType, inputs, bom, nestingResult, materialCost, processCost, overhead, margin, finalPrice, rulesetVersion, timestamp, hash (SHA256)

Salvar snapshot como imutável.

### UI obrigatória

Criar tela `/orcamento-automatico` (ou `/orcamento-rapido`):

Fluxo:
1) Selecionar equipamento/template
2) Inserir medidas
3) Ver breakdown: material/processos/overhead/margem
4) Gerar Orçamento Oficial (snapshot + PDF)

Modo engenheiro: ver BOM, nesting, regras aplicadas, certificado/hash.

### Validações obrigatórias

Bloquear finalização se:
- material sem preço ativo
- nesting não executado
- regra estrutural violada
- margem abaixo do mínimo
- espessura inválida

### Teste obrigatório

Mesa Lisa: 2000x700x900 (304 1.2 polido, com prateleira):
- gera reforço automático
- chapas reais
- tubos reais
- solda real
- snapshot
- rebuild igual

---

# P2 — GERAR TEMPLATES (DSL) AGORA, EM LOTE (16 famílias + 40 presets)

## Prompt

Criar a biblioteca inicial de templates (Equipment DSL) com seed no Firestore e testes de sanidade, para o usuário selecionar equipamento + medidas e obter preço.

### Entregáveis obrigatórios

Código:
`/src/domains/equipmentLibrary/`
- `equipment.dsl.schema.ts`
- `equipment.expression.ts`
- `equipment.validator.ts`
- `equipment.registry.ts`
- `equipment.presets.ts`
- `equipment.templates.seed.ts`
- `equipment.seed.ts`
- `equipment.tests.spec.ts`
Docs:
- `docs/EQUIPMENT_TEMPLATES.md`

Dados:
- pelo menos **16 templates família** + **40 presets**

UI:
- `/orcamento-rapido`: categorias, templates, presets, calcular

### DSL padrão (schema)

Definir `EquipmentTemplateDSL` (JSON serializável) com:
- inputs, derived
- bom.sheetParts/tubes/accessories
- structuralRules (ADD_TUBE/ADD_SHEET/REQUIRE_MIN_SHEET_THICKNESS/BLOCK)
- processRules
- validations
- metricsModel (weldMetersExpr/finishM2Expr/cutMetersExpr)

### Avaliador de expressões (seguro)

Suportar:
- aritmética, booleanos, ternário
- funções: min/max/round/ceil/floor

Bloquear qualquer execução arbitrária.

### Templates (16 famílias)

MESAS (5)
1) MESA_LISA
2) MESA_COM_PRATELEIRA
3) MESA_CONTRAVENTADA_U
4) MESA_PAREDE_COM_ESPELHO
5) MESA_COM_RODIZIOS

BANCADAS (5)
6) BANCADA_CENTRAL
7) BANCADA_PAREDE_COM_ESPELHO
8) BANCADA_ESTREITA
9) BANCADA_COM_CUBA_1
10) BANCADA_COM_CUBAS_2

ARMÁRIOS (3)
11) ARMARIO_ABERTO
12) ARMARIO_2_PORTAS
13) GABINETE_PIA_2_PORTAS

ESTANTES (2)
14) ESTANTE_4_NIVEIS
15) ESTANTE_N_NIVEIS

CARRINHOS (1)
16) CARRINHO_N_BANDEJAS

### Regras estruturais obrigatórias (todas)

A) `D > 700` → ADD_TUBE `MID_REINF` (length `W - 80`)  
B) `W > 2000` → REQUIRE_MIN_SHEET_THICKNESS 1.5  
C) `W > 3000` → BLOCK TOO_WIDE  
D) `hasShelf == true` → suportes prateleira  
Armários: `H > 1600` → travessa extra

### Presets (40)

Criar presets comuns (700/1000/1200/1500/2000/2100/2800, D=700 e D=500; backsplash 100/150; cuba 500x400x250 etc.)

### Seed idempotente

Salvar templates em:
`/templates/{companyId}/items/{templateId}`  
Salvar presets em:
`/templates/{companyId}/presets/{presetId}` (ou coleção equivalente)

### Testes de sanidade

- todos templates passam validator
- 1 preset por template gera BOM coerente (qty >= 0, blanks > 0, lengths > 0)
- regras estruturais disparam como esperado

---

# P3 — CALIBRAÇÃO COMPLETA (MATERIAIS/PROCESSOS/PERDAS/MÉTRICAS)

## Prompt

Criar modo calibração com UI + baselines + fatores, para ajustar tudo até bater com valores reais.

Rotas admin:
- `/calibracao`
- `/calibracao/materiais`
- `/calibracao/processos`
- `/calibracao/perdas`
- `/calibracao/metricas`
- `/calibracao/overhead-margem`
- `/calibracao/validacao`
- `/calibracao/relatorio`

Coleções:
- `/calibration/{companyId}/baselines/{baselineId}`
- `/calibration/{companyId}/runs/{runId}`
- `/calibration/{companyId}/adjustments/{adjId}`

Implementar “Calibration Factors”:
- por templateKey (weld/cut/finish/assembly)
- por processKey (timeFactor/costFactor)
- global

Rodar validação contra baselines:
- erro por camada
- MAPE
- ranking de distorções

Freeze ruleset quando MAPE <= alvo por período.

Gerar `CALIBRATION_RUN_REPORT.md`.

Critério de pronto:
- 100% materiais usados com preço ativo
- 100% processos usados completos
- >= 10 baselines
- MAPE <= 5% (ou alvo configurado)
- rulesetVersion congelado

---

# P4 — VALIDAÇÃO TOTAL (PASS/FAIL)

## Prompt

Criar uma suíte de validação completa com comando único:

- `npm run validate` → gera `VALIDATION_REPORT.md` e retorna exit code (0/1)
- valida env/build, firestore, materiais, processos, settings, templates/presets, fluxo E2E, snapshot/rebuild, PDF, compras/OP, segurança, performance.

Estrutura:
`/scripts/validate/` com validators e report writer.

Fluxo E2E mínimo (10 casos):
- mesa 700, mesa 1200 com prateleira, mesa 2000 contraventada
- bancada espelho, bancada estreita, bancada cuba 1, bancada 2 cubas
- armário aberto, armário 2 portas, carrinho 2 bandejas

Strict mode negatives:
- material sem preço → bloqueia
- processo inativo → bloqueia
- margem abaixo mínimo → bloqueia
- template inválido → falha

PASS apenas se todos gates passarem.

---

# P5 — VALIDAÇÃO AVANÇADA EXTREMA (PRODUÇÃO REAL)

## Prompt

Adicionar validações avançadas:

- boundary tests (min/max e limiares 1999/2000/2001)
- stress nesting (1 grande, 20 pequenas, mixed, rotate false, grain)
- tube nesting edge cases (cortes exatos, sobras pequenas, ultrapassa barra)
- rounding consistency (preview == snapshot)
- concorrência (5 usuários simultâneos)
- dados corrompidos (sem densidade/kgm/costPerHour)
- segurança profunda (injeção no DSL)
- auditoria completa (hash/ruleset/factors)
- validação financeira cruzada (custo → preço por fórmula)
- PDF consistency (hash exibido confere)
- performance loop 100 orçamentos (média/p95/p99)
- “usabilidade real” (setup do zero, seed, gerar, PDF, compra, OP, status)

Gerar `PRODUCTION_READINESS_REPORT.md` (nota 0–100).

---

# P6 — PROMPT RAW — VALIDAÇÃO CORPORATIVA (JURÍDICA + CONTÁBIL + ANTIFRAUDE + ISO)

## Prompt

Implementar módulos:

### Jurídico/Comercial
`/src/domains/commercialCompliance/`
- termos obrigatórios em orçamento/PDF
- validade coerente com validade de preço
- exigência de aprovação para desconto/margem
- hash SHA256 do snapshot + assinatura HMAC
- aceite do cliente com timestamp

### Contábil (lucro real vs fiscal)
`/src/domains/accountingValidation/`
- classificação de custos (direto/indireto/overhead)
- simulação fiscal (Simples/Presumido/Real)
- alertas: lucro real abaixo meta; lucro fiscal negativo bloqueia

### Antifraude
`/src/domains/securityAudit/`
- bloquear/registrar alteração manual de preço final
- detectar anomalias (margem, desconto, perda, material alternativo)
- score antifraude por orçamento
- logs em `/audit/{companyId}/events/`

### Rastreabilidade ISO
`/src/domains/traceability/`
- versionamento obrigatório (templates, processos, materiais, settings, calibrationFactors)
- changelog before/after com motivo, userId, timestamp
- relatório `ISO_TRACE_REPORT.md`

### Script
`npm run corporate-validate` → `CORPORATE_VALIDATION_REPORT.md` PASS/FAIL

Critério corporativo:
- orçamento juridicamente completo
- snapshot assinado
- lucro real/fiscal calculados
- logs imutáveis e versionados

---

# P7 — PROMPT RAW — SISTEMA ÚNICO 100% INTEGRADO (ORCHESTRATOR)

## Prompt

Criar “orchestrator” para garantir que tudo ande junto e sem buracos.

### Princípios
- Engine é a única fonte da verdade (UI não calcula)
- Tudo deriva do snapshot (PDF, compra, OP, auditoria)

### Orchestrator
`/src/domains/systemOrchestrator/`
- pipeline, guards, events, reporting

### Workflow (estados fixos)
DRAFT → CALCULATED → VALIDATED → CORPORATE_OK → APPROVED → FINALIZED → DELIVERED → IN_PRODUCTION → CLOSED

### Guards (bloqueios por transição)
- Sem preço ativo → bloqueia antes de finalizar
- Sem nesting → bloqueia
- Sem termos comerciais → bloqueia PDF
- Desconto alto → exige aprovação
- Snapshot → canonical + SHA256 + HMAC (opcional)
- PDF → sempre do snapshot
- Compra/OP → sempre do snapshot

### Auditoria (eventos)
Registrar eventos críticos com correlationId, before/after.

### Health Check
`npm run health-check` bloqueia uso se faltar:
- materiais com preço ativo usados
- processos completos usados
- settings base
- templates/presets mínimos

### Validate-all
`npm run validate-all` roda:
- check/lint/test/build
- health-check
- validate
- corporate-validate
- performance sanity

Definição de pronto:
- validate-all PASS

---

# APÊNDICE — PROMPTS AUXILIARES (OPCIONAIS)

## A1 — Visual 2D do Nesting (NestingViewer)
Implementar Canvas/SVG para ver layout das peças na chapa, zoom/pan, legenda, destaques.

## A2 — Planejamento de tubos por barra (1D) + lista de cortes
Implementar bin packing 1D para barras (6m), sobras, custo e cortes.

## A3 — Cenários e simulações (Monte Carlo / risco)
Simular variações de inox/perda/tempo e calcular probabilidade de margem abaixo do mínimo.

---

## Regras de execução (para o Kilo Code)

- Sempre commitar ao final de cada prompt (ou PR local).
- Rodar `npm run validate` ao final de P4.
- Rodar `npm run corporate-validate` ao final de P6.
- Rodar `npm run validate-all` ao final de P7.
- Se qualquer falhar: corrigir antes de seguir.

---

## Status Final

### Commits Realizados

1. **COMMIT 1**: Normalização + estrutura pastas + lint/test
2. **COMMIT 2**: Types da engine + regraset + validações base
3. **COMMIT 3**: Geometry/Mass engine + testes
4. **COMMIT 4**: Nesting engine + visualização + testes
5. **COMMIT 5**: Material repository + UI materiais + seed
6. **COMMIT 6**: Process repository + UI processos + seed
7. **COMMIT 7**: MaterialCost/ProcessCost/Pricing engine + testes
8. **COMMIT 8**: Quote engine + snapshot + rebuild + auditoria
9. **COMMIT 9**: Wizard UI ponta-a-ponta
10. **COMMIT 10**: Purchasing + Production + exports
11. **COMMIT 11**: Firestore rules + RBAC
12. **COMMIT 12**: Documentação final

### Estrutura Final

```
src/
  domains/
    engine/          # Motor de cálculo puro
    materials/       # Serviço de materiais
    processes/       # Serviço de processos
    quotes/          # Repositório de orçamentos
    purchasing/      # Planos de compra
    production/      # Ordens de produção
    exports/         # Exportação CSV/JSON
    auth/            # Autenticação RBAC
  infra/
    repositories/    # Firestore repositories
  app/
    components/      # React components
    pages/           # Application pages
    hooks/           # Custom hooks
```

### Próximos Passos

1. Implementar autenticação Firebase completa
2. Adicionar testes E2E com Playwright
3. Otimizar performance do nesting
4. Implementar cache de preços
5. Adicionar relatórios avançados

