# Engine Domain

Motor de cálculo puro para orçamentos industriais.

## Princípios

1. **Pureza**: Zero dependências de Firebase/React
2. **Determinismo**: Mesmas entradas = mesmas saídas
3. **Imutabilidade**: Snapshots com hash SHA256
4. **Testabilidade**: 100% coberto por testes unitários

## Módulos

### [`types.ts`](types.ts)
Tipos fundamentais: Material, Process, BOM, Quote, Ruleset.

### [`ruleset.ts`](ruleset.ts)
Configurações de negócio: margens, tolerâncias, aninhamento.

### [`validations/`](validations/index.ts)
Validadores: validateMaterial, validateProcess, validateBOM.

### [`geometry/`](geometry/index.ts)
Cálculos geométricos: área, blank, perímetro de corte.

### [`mass/`](mass/index.ts)
Cálculo de massa: chapas, tubos, barras.

### [`nesting/`](nesting/index.ts)
Algoritmo Guillotine Best-Fit para otimização de chapas.

### [`materialCost/`](materialCost/index.ts)
Custo de materiais com histórico de preços.

### [`processCost/`](processCost/index.ts)
Custo de processos por tempo, área ou linear.

### [`pricing/`](pricing/index.ts)
4 métodos de precificação: Fixed Margin, Cost Plus, Market Price, Mixed Margin.

### [`quote/`](quote/index.ts)
Criação e finalização de orçamentos com snapshots.

### [`audit/`](audit/index.ts)
Rastreabilidade: eventos de auditoria, verificação de integridade.

## Uso

```typescript
import { 
  createQuoteDraft,
  calculateMaterialCost,
  calculateProcessCost,
  calculatePricing,
  finalizeQuote
} from '@/domains/engine';

// Criar orçamento
const draft = createQuoteDraft(customer, product, bom);

// Calcular custos
const materialCosts = bom.items.map(item => 
  calculateMaterialCost(item, materials[item.materialKey], ruleset)
);

// Finalizar
const quote = finalizeQuote(draft, ruleset, userId);
```

## Estrutura de Arquivos

```
engine/
  index.ts              # Exportações públicas
  types.ts              # Tipos fundamentais
  ruleset.ts            # Configurações de negócio
  
  geometry/
    index.ts            # Funções geométricas
  mass/
    index.ts            # Funções de massa
  nesting/
    index.ts            # Algoritmo de nesting
  materialCost/
    index.ts            # Cálculo de custo de material
    index.test.ts       # Testes unitários
  processCost/
    index.ts            # Cálculo de custo de processo
  pricing/
    index.ts            # Métodos de precificação
    index.test.ts       # Testes unitários
  quote/
    index.ts            # Lógica de orçamentos
    index.test.ts       # Testes unitários
  audit/
    index.ts            # Sistema de auditoria
    index.test.ts       # Testes unitários
  validations/
    index.ts            # Validadores
  adapters/
    bancadas.adapter.ts # Adaptador para bancadas
  usecases/
    calculateBancadasQuote.usecase.ts # Caso de uso
```

## Testes

```bash
# Executar testes da engine
npm test -- --grep "engine"

# Executar com coverage
npm run test:coverage -- --grep "engine"
```

## Dependências

O módulo engine é intencionalmente isolado:

- **Zero dependências Firebase** - Sem chamadas de API externas
- **Zero dependências React** - Lógica pura de negócio
- **Apenas bibliotecas utilitárias** - lodash, uuid, etc.

Isso garante:
- Testes unitários rápidos e determinísticos
- Portabilidade para outros projetos
- Facilidade de manutenção