# Análise de Performance (somente relatório)

Este documento lista possíveis pontos de performance para inspeção **sem mudanças de lógica**.

## Suspeitas iniciais

- `DashboardTV` pode realizar múltiplas consultas por setor a cada ciclo de refresh.
- `collectionGroup('itens')` pode crescer muito em bases reais; índices e filtros são críticos.

## Como medir (sem alterar código)

- Usar DevTools (Network/Performance) e logs do emulator para contar queries.
- Registrar:
  - quantidade de reads por minuto no Dashboard TV;
  - tempo médio de render/refresh;
  - cenários com “estado vazio” e “permission denied”.

