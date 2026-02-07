# Checklist de Auditoria: Produção (ambiente real)

Este checklist valida o módulo de Produção conforme os 4 fluxos descritos em `CONTEXT.md`.

Regras de ouro durante a auditoria:

- Auditar com usuário real (ou emulator) sempre com `empresaId` definido.
- Capturar evidências (screenshots, IDs de documentos, timestamps, usuário logado).
- Se um item “passar” na UI mas falhar no Firestore (ou vice-versa), isso é bug/crítico.

## Pré-requisitos

- 2 empresas de teste (A e B) com usuários distintos (para o teste multi-tenant).
- Dados de teste mínimos:
  - Pelo menos 1 `ordem_producao` com pelo menos 1 item.
  - Item iniciando em um setor conhecido (ex.: `Corte`).
- Telas relevantes acessíveis:
  - Controle Produção: `src/domains/producao/pages/ControleProducao.tsx`
  - Apontamento OP: `src/domains/producao/pages/ApontamentoOP.tsx`
  - Dashboard TV: `src/domains/producao/pages/DashboardTV.tsx`

## Fluxo 1 — Ordem aparece na Produção

Objetivo: confirmar que uma OP criada aparece nas telas de Produção e no Dashboard TV.

Passos:

1. Criar uma ordem de produção (no módulo/fluxo já existente do ERP).
2. Abrir Controle de Produção.
3. Confirmar que os itens da ordem aparecem no setor inicial esperado.
4. Abrir Dashboard TV.
5. Confirmar que os itens aparecem no painel.

Resultados esperados:

- Itens aparecem em Produção filtrados por `empresaId` do usuário.
- Dashboard TV reflete o estado atual (somente leitura).

Evidências:

- Screenshot (Controle de Produção e Dashboard TV).
- IDs dos docs da ordem e item no Firestore + `empresaId` presente.

## Fluxo 2 — Item passa por múltiplos setores

Objetivo: validar a transição do item (ex.: Corte → Dobra → Solda), registrando movimentações.

Passos:

1. Selecionar um item no setor atual.
2. Executar a ação de “mover”/“concluir etapa” para o próximo setor.
3. Repetir em mais de um setor.
4. A cada transição, validar no Firestore:
   - `setorAtual` atualizado.
   - nova movimentação registrada.

Resultados esperados:

- `setorAtual` sempre corresponde ao setor exibido na UI.
- Para cada troca, existe uma movimentação com:
  - `empresaId`
  - origem/destino
  - timestamp
  - usuário

Evidências:

- Screenshot da UI antes/depois da troca.
- IDs dos docs de movimentação criados.

## Fluxo 3 — Conclusão de item

Objetivo: validar finalização do item e impedir avanço adicional.

Passos:

1. Levar um item até o último setor.
2. Finalizar o item.
3. Validar no Firestore:
   - `status = 'Concluido'`.
   - movimentação final registrada.
4. Tentar avançar novamente (UI): o sistema deve impedir.

Resultados esperados:

- Item concluído não permite novas movimentações.
- Progresso/indicadores ficam coerentes (100% quando aplicável).

Evidências:

- Screenshot do item como concluído.
- Estado do item no Firestore.

## Fluxo 4 — Teste multi-tenant

Objetivo: garantir que a empresa A não enxerga nem altera dados da empresa B.

Passos:

1. Com usuário da empresa A:
   - Acessar telas de Produção e listar itens.
   - Tentar acessar diretamente por ID um doc conhecido da empresa B.
2. Com usuário da empresa B:
   - Repetir o mesmo teste apontando para docs da empresa A.
3. Validar no código (revisão rápida):
   - todas as queries incluem `where('empresaId','==', empresaId)`.
   - reads por ID validam `empresaId` do doc.

Resultados esperados:

- Listagens não retornam itens de outra empresa.
- Acesso direto por ID deve ser bloqueado pelas regras.
- Writes cross-tenant devem falhar.

Evidências:

- Prints de erro do Firestore (permission denied) quando aplicável.
- Captura de queries e filtros (referenciar `src/domains/producao/services/producao-itens.service.ts`).

