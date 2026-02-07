# Dependências entre domínios

Objetivo: mapear dependências para reduzir acoplamento e riscos em PRs.

## Como gerar o mapa (manual)

1. Verificar imports em `src/domains/*` e `src/services/*`.
2. Registrar dependências principais:
   - Produção → `services/firestore/base.ts` (tenant + audit)
   - Orçamentos/Ordens → services Firestore correspondentes
   - Calculadora → domínio `src/app/domain/*` e/ou services.

## Observações

- Se algum módulo acessar Firestore fora de `src/services/firestore/*`, isso deve ser tratado como risco.

