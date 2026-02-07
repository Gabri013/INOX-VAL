# Fluxo Firestore — Produção

Este documento registra quais paths do Firestore são usados por Produção e como eles se relacionam.

Fonte de verdade: `CONTEXT.md` e `firestore.rules`.

## Estrutura esperada (Produção)

- `ordens_producao/{ordemId}`
- `ordens_producao/{ordemId}/itens/{itemId}`
- `ordens_producao/{ordemId}/movimentacoes/{movId}`

Observação importante:

- A UI atual de Produção usa `collectionGroup('itens')` como fonte oficial para listar itens por setor.

## Campos mínimos

Para itens:

- `empresaId`
- `ordemId`
- `setorAtual`
- `status`

Para movimentações:

- `empresaId`
- referência ao item
- setor/status origem/destino
- `createdAt` e `createdBy`

