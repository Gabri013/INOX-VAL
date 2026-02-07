# Hooks (React Query) — Produção

Este documento lista os hooks do domínio de Produção e o que cada um faz.

## Hooks

- `useItensSetor(setor)` — carrega itens do setor via `collectionGroup('itens')` filtrando por `empresaId`.
- `useMoverItem()` — mutation: move item de setor (delegado ao service).
- `useAtualizarStatus()` — mutation: atualiza status do item (delegado ao service).

Arquivo: `src/domains/producao/producao.hooks.ts`.

## Invalidações

O comportamento de cache/invalidation é parte do fluxo operacional; alterações devem ser aprovadas explicitamente.

