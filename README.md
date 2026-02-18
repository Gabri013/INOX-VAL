# INOX-VAL ERP

Sistema ERP industrial para fabricantes de equipamentos em aço inoxidável.

## Visão Geral

O INOX-VAL é um sistema completo para gestão de orçamentos, materiais, processos industriais e produção, com foco em fabricantes de equipamentos em aço inoxidável.

### Funcionalidades Principais

- **Motor de Orçamento**: Cálculo automático de custos de materiais e processos
- **Nesting Guillotine**: Otimização de corte de chapas
- **Gestão de Materiais**: Catálogo com histórico de preços
- **Gestão de Processos**: Custos por tempo, área ou linear
- **Multi-tenant**: Isolamento por empresa com RBAC
- **Rastreabilidade**: Snapshots imutáveis com hash SHA256

## Arquitetura

```
src/
  domains/           # Lógica de negócio isolada
    engine/          # Motor de cálculo puro
    materials/       # Domínio de materiais
    processes/       # Domínio de processos
    quotes/          # Domínio de orçamentos
    purchasing/      # Domínio de compras
    production/      # Domínio de produção
    exports/         # Utilitários de exportação
    auth/            # Autenticação e autorização
  infra/             # Infraestrutura
    repositories/    # Persistência (Firestore)
  app/               # Interface do usuário
    components/      # Componentes React
    pages/           # Páginas da aplicação
    hooks/           # Hooks React
    contexts/        # Contextos React
```

## Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Firebase (para produção)

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Executar testes
npm test

# Build de produção
npm run build
```

### Seed de Dados

```bash
# Popular materiais de exemplo
npm run seed:materials

# Popular processos de exemplo
npm run seed:processes
```

## Motor de Cálculo (Engine)

### Tipos Principais

```typescript
// Material
interface Material {
  key: MaterialKey;           // Identificador único
  category: MaterialCategory; // CHAPA | TUBO | BARRA | ACESSORIO
  attributes: MaterialAttributes;
  pricing: MaterialPricing;
}

// Processo
interface Process {
  key: ProcessKey;
  category: ProcessCategory; // CORTE | DOBRA | SOLDA | ACABAMENTO
  costModel: CostModel;
}

// BOM (Bill of Materials)
interface BOMItem {
  partId: string;
  description: string;
  quantity: number;
  geometry: Geometry2D;
  materialKey: MaterialKey;
  processes: ProcessKey[];
}
```

### Cálculo de Custos

```typescript
import { calculateMaterialCost } from '@/domains/engine/materialCost';
import { calculateProcessCost } from '@/domains/engine/processCost';
import { calculatePricing } from '@/domains/engine/pricing';

// Custo de material
const materialCost = calculateMaterialCost(bomItem, material, ruleset);

// Custo de processo
const processCost = calculateProcessCost(bomItem, process, ruleset);

// Precificação (4 métodos)
const pricing = calculatePricing(quote, {
  method: 'MIXED_MARGIN', // FIXED_MARGIN | COST_PLUS | MARKET_PRICE | MIXED_MARGIN
  fixedMargin: 0.25,
  minMargin: 0.15
});
```

### Nesting Guillotine

```typescript
import { nestGuillotine } from '@/domains/engine/nesting';

const result = nestGuillotine(parts, sheets, ruleset.nesting);
// result.layouts[] - Layouts otimizados
// result.utilization - Taxa de aproveitamento
// result.waste - Área de desperdício
```

## Segurança e RBAC

### Roles

| Role | Permissões |
|------|------------|
| admin | Acesso total |
| gerente | Gestão completa, auditoria |
| engenheiro | Materiais, processos, orçamentos |
| vendedor | Orçamentos, clientes |
| producao | Ordens de produção |
| compras | Planos de compra |

### Regras Firestore

Ver [`config/firestore.rules`](config/firestore.rules) para detalhes.

## Testes

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm run test:coverage

# Executar testes específicos
npm test -- --grep "nesting"
```

## Deploy

### Vercel (Recomendado)

```bash
npm run build
vercel --prod
```

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## Contribuição

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Proprietária - Uso interno