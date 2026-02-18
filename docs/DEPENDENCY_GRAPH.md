# INOX-VAL Dependency Graph

> **Version:** 1.0.0  
> **Last Updated:** 2026-02-18  
> **Status:** Living Document

---

## Overview

This document visualizes the dependencies between modules in the INOX-VAL system. Understanding these dependencies is critical for:
- Planning implementation order
- Impact analysis for changes
- Identifying coupling risks
- Refactoring decisions

---

## High-Level Architecture Dependencies

```mermaid
graph TB
    subgraph Frontend[Frontend Layer]
        Pages[Pages]
        Components[Components]
        Hooks[Hooks]
        Contexts[Contexts]
    end
    
    subgraph Domains[Domain Layer]
        Engine[Engine]
        Materials[Materials]
        Processes[Processes]
        Quotes[Quotes]
        Production[Production]
        Purchasing[Purchasing]
        Auth[Auth]
        Industrial[Industrial]
        Nesting[Nesting]
        Estoque[Estoque]
        Clientes[Clientes]
        Custos[Custos]
    end
    
    subgraph Infra[Infrastructure Layer]
        Firebase[Firebase]
        Repositories[Repositories]
        Logging[Logging]
    end
    
    Pages --> Components
    Pages --> Hooks
    Pages --> Contexts
    Components --> Hooks
    Hooks --> Domains
    Contexts --> Domains
    Domains --> Infra
    Repositories --> Firebase
```

---

## Engine Module Dependencies

The engine is the core calculation module with zero external dependencies.

```mermaid
graph LR
    subgraph EngineCore[Engine Core]
        Types[types.ts]
        Ruleset[ruleset.ts]
    end
    
    subgraph EngineModules[Engine Modules]
        Validations[validations/]
        Geometry[geometry/]
        Mass[mass/]
        Nesting[nesting/]
        MaterialCost[materialCost/]
        ProcessCost[processCost/]
        Pricing[pricing/]
        Quote[quote/]
        Audit[audit/]
    end
    
    Types --> Validations
    Types --> Geometry
    Types --> Mass
    Types --> Nesting
    Types --> MaterialCost
    Types --> ProcessCost
    Types --> Pricing
    Types --> Quote
    Types --> Audit
    
    Ruleset --> MaterialCost
    Ruleset --> ProcessCost
    Ruleset --> Pricing
    
    Geometry --> Mass
    Mass --> MaterialCost
    Nesting --> MaterialCost
    MaterialCost --> Pricing
    ProcessCost --> Pricing
    Pricing --> Quote
    Quote --> Audit
```

### Engine Dependency Table

| Module | Depends On | Used By |
|--------|------------|---------|
| `types.ts` | None | All engine modules |
| `ruleset.ts` | `types.ts` | materialCost, processCost, pricing |
| `validations/` | `types.ts` | quote, external services |
| `geometry/` | `types.ts` | mass, nesting |
| `mass/` | `types.ts`, `geometry/` | materialCost |
| `nesting/` | `types.ts`, `geometry/` | materialCost |
| `materialCost/` | `types.ts`, `ruleset.ts`, `mass/`, `nesting/` | pricing, quote |
| `processCost/` | `types.ts`, `ruleset.ts` | pricing, quote |
| `pricing/` | `types.ts`, `ruleset.ts`, `materialCost/`, `processCost/` | quote |
| `quote/` | `types.ts`, `validations/`, `materialCost/`, `processCost/`, `pricing/` | external services |
| `audit/` | `types.ts` | quote |

---

## Domain Layer Dependencies

```mermaid
graph TB
    subgraph CoreDomains[Core Domains]
        Engine[Engine]
        Materials[Materials]
        Processes[Processes]
    end
    
    subgraph BusinessDomains[Business Domains]
        Quotes[Quotes]
        Production[Production]
        Purchasing[Purchasing]
        Industrial[Industrial]
        Nesting[Nesting]
    end
    
    subgraph SupportDomains[Support Domains]
        Auth[Auth]
        Clientes[Clientes]
        Estoque[Estoque]
        Custos[Custos]
    end
    
    Quotes --> Engine
    Quotes --> Materials
    Quotes --> Processes
    
    Production --> Quotes
    Production --> Materials
    Production --> Processes
    
    Purchasing --> Quotes
    Purchasing --> Materials
    Purchasing --> Estoque
    
    Industrial --> Engine
    Industrial --> Materials
    Industrial --> Nesting
    
    Nesting --> Engine
    
    Estoque --> Materials
    Custos --> Processes
    Custos --> Materials
    
    Clientes --> Quotes
```

### Domain Dependency Matrix

| Domain | Engine | Materials | Processes | Quotes | Auth | Estoque |
|--------|--------|-----------|-----------|--------|------|---------|
| Materials | - | - | - | - | - | - |
| Processes | - | - | - | - | - | - |
| Quotes | **X** | **X** | **X** | - | - | - |
| Production | - | **X** | **X** | **X** | - | - |
| Purchasing | - | **X** | - | **X** | - | **X** |
| Industrial | **X** | **X** | - | - | - | - |
| Nesting | **X** | - | - | - | - | - |
| Estoque | - | **X** | - | - | - | - |
| Custos | - | **X** | **X** | - | - | - |
| Clientes | - | - | - | **X** | - | - |
| Auth | - | - | - | - | - | - |

---

## Infrastructure Dependencies

```mermaid
graph TB
    subgraph Firebase[Firebase Services]
        AuthFirebase[Firebase Auth]
        Firestore[Firestore]
        Storage[Storage]
    end
    
    subgraph Repositories[Repositories]
        MaterialRepo[MaterialRepositoryFirestore]
        ProcessRepo[ProcessRepositoryFirestore]
        QuoteRepo[QuoteRepository]
    end
    
    subgraph Services[Domain Services]
        MaterialService[MaterialService]
        ProcessService[ProcessService]
        QuoteService[QuoteService]
    end
    
    MaterialRepo --> Firestore
    ProcessRepo --> Firestore
    QuoteRepo --> Firestore
    
    MaterialService --> MaterialRepo
    ProcessService --> ProcessRepo
    QuoteService --> QuoteRepo
    
    AuthFirebase --> Services
```

---

## UI Component Dependencies

```mermaid
graph TB
    subgraph Pages[Pages]
        Dashboard[Dashboard]
        QuoteWizard[QuoteWizardPage]
        Quotes[Orcamentos]
        Orders[Ordens]
        MaterialsPage[GestaoMateriaisPage]
        Costs[ConfiguracaoCustos]
        Audit[Auditoria]
    end
    
    subgraph WizardComponents[Wizard Components]
        CustomerStep[CustomerStep]
        ProductStep[ProductStep]
        DimensionsStep[DimensionsStep]
        BOMStep[BOMStep]
        NestingStep[NestingStep]
        CostsStep[CostsStep]
        PricingStep[PricingStep]
        ReviewStep[ReviewStep]
    end
    
    subgraph SharedComponents[Shared Components]
        NestingVisualizer[NestingVisualizer]
        PainelOrcamento[PainelOrcamento]
        MenuExportacao[MenuExportacao]
        BibliotecaProjetos[BibliotecaProjetos]
    end
    
    subgraph UIComponents[UI Components]
        ShadcnUI[shadcn/ui components]
    end
    
    QuoteWizard --> WizardComponents
    QuoteWizard --> SharedComponents
    
    WizardComponents --> UIComponents
    SharedComponents --> UIComponents
    
    Quotes --> PainelOrcamento
    Orders --> NestingVisualizer
    MaterialsPage --> MenuExportacao
```

---

## Feature Dependencies by Phase

### ESSENCIAL Phase Dependencies

```mermaid
graph LR
    subgraph Phase1[ESSENCIAL - Completed]
        E1[Types] --> E2[Validations]
        E2 --> E3[Geometry]
        E3 --> E4[Mass]
        E4 --> E5[Nesting]
        E5 --> E6[MaterialCost]
        E3 --> E7[ProcessCost]
        E6 --> E8[Pricing]
        E7 --> E8
        E8 --> E9[Quote]
        E9 --> E10[Audit]
        E10 --> E11[Repositories]
        E11 --> E12[UI Wizard]
    end
```

### PRODUTIVO Phase Dependencies

```mermaid
graph LR
    subgraph Phase2[PRODUTIVO - In Progress]
        P1[Engine Core] --> P2[Equipment Templates]
        P1 --> P3[Calibration System]
        P1 --> P4[Validation Suite]
        P2 --> P5[PDF Export]
        P3 --> P5
        P1 --> P6[Inventory]
        P1 --> P7[Production Orders]
        P6 --> P8[Purchase Planning]
        P7 --> P8
    end
```

### DIFERENCIAL Phase Dependencies

```mermaid
graph LR
    subgraph Phase3[DIFERENCIAL - Planned]
        D1[Nesting Engine] --> D2[Advanced Nesting]
        D2 --> D3[Real-time Collab]
        D4[Analytics] --> D3
        D5[Mobile App] --> D6[Field Operations]
        D7[Dashboard] --> D4
    end
```

### NASA Phase Dependencies

```mermaid
graph LR
    subgraph Phase4[NASA - Future]
        N1[Historical Data] --> N2[AI Optimization]
        N3[IoT Sensors] --> N4[Real-time Tracking]
        N5[Forecasting] --> N2
        N6[Accounting] --> N7[Financial Reports]
    end
```

---

## Circular Dependency Detection

No circular dependencies detected in the current architecture. The layered architecture prevents cycles:

1. **Frontend** depends on **Domains**
2. **Domains** depend on **Infrastructure**
3. **Infrastructure** has no dependencies on upper layers

### Dependency Rules

| Layer | Can Depend On | Cannot Depend On |
|-------|---------------|------------------|
| Frontend | Domains, Infrastructure | - |
| Domains | Infrastructure | Frontend |
| Infrastructure | External libraries | Frontend, Domains |
| Engine | Nothing (pure) | Everything external |

---

## Coupling Analysis

### High Coupling Modules

| Module | Coupling Score | Risk |
|--------|---------------|------|
| `engine/quote/` | High | Medium - Many dependencies but stable |
| `domains/quotes/` | High | Medium - Core business logic |
| `app/pages/QuoteWizardPage` | High | Low - UI composition only |

### Low Coupling Modules

| Module | Coupling Score | Benefit |
|--------|---------------|---------|
| `engine/types.ts` | Very Low | Reusable, stable |
| `engine/geometry/` | Low | Pure functions, testable |
| `engine/mass/` | Low | Pure functions, testable |
| `domains/auth/` | Low | Isolated, replaceable |

---

## Dependency Injection Points

The system uses dependency injection at these boundaries:

```mermaid
graph TB
    subgraph DI[Dependency Injection]
        QuoteRepo[QuoteRepository Interface]
        MaterialRepo[MaterialRepository Interface]
        ProcessRepo[ProcessRepository Interface]
    end
    
    subgraph Implementations[Implementations]
        QuoteFirestore[QuoteRepositoryFirestore]
        MaterialFirestore[MaterialRepositoryFirestore]
        ProcessFirestore[ProcessRepositoryFirestore]
        QuoteMock[MockQuoteRepository]
        MaterialMock[MockMaterialRepository]
    end
    
    QuoteRepo -.-> QuoteFirestore
    QuoteRepo -.-> QuoteMock
    MaterialRepo -.-> MaterialFirestore
    MaterialRepo -.-> MaterialMock
```

### Injectable Dependencies

| Interface | Implementations | Used By |
|-----------|-----------------|---------|
| `QuoteRepository` | Firestore, Mock | QuoteService |
| `MaterialRepository` | Firestore, Mock | MaterialService |
| `ProcessRepository` | Firestore, Mock | ProcessService |
| `AuthService` | Firebase, Mock | AuthContext |

---

## Import Graph

### Engine Import Structure

```
engine/
  index.ts              # Public API
  types.ts              # No imports (foundation)
  ruleset.ts            # imports types
  validations/index.ts  # imports types
  geometry/index.ts     # imports types
  mass/index.ts         # imports types, geometry
  nesting/index.ts      # imports types, geometry
  materialCost/index.ts # imports types, ruleset, mass, nesting
  processCost/index.ts  # imports types, ruleset
  pricing/index.ts      # imports types, ruleset, materialCost, processCost
  quote/index.ts        # imports types, validations, materialCost, processCost, pricing, audit
  audit/index.ts        # imports types
```

### Domain Import Structure

```
domains/
  materials/
    service.ts          # imports types, repository
    repository.ts       # imports infra/firebase
  processes/
    service.ts          # imports types, repository
    repository.ts       # imports infra/firebase
  quotes/
    types.ts            # imports engine/types
    index.ts            # imports types, engine/quote
  production/
    service.ts          # imports quotes, materials, processes
    types.ts            # imports engine/types
  purchasing/
    service.ts          # imports quotes, materials, estoque
    types.ts            # imports engine/types
```

---

## Refactoring Recommendations

### Recommended Decoupling

1. **Extract QuoteService Interface**
   - Create interface for QuoteService
   - Enable mock implementations for testing
   - Reduce coupling between UI and service

2. **Abstract Nesting Algorithm**
   - Create NestingStrategy interface
   - Allow algorithm swapping
   - Enable A/B testing of algorithms

3. **Event-Driven Communication**
   - Use event bus for cross-domain communication
   - Reduce direct dependencies
   - Enable loose coupling for future features

### Dependency Violations to Fix

| Violation | Location | Fix |
|-----------|----------|-----|
| None detected | - | - |

---

## Testing Dependencies

```mermaid
graph TB
    subgraph Tests[Test Structure]
        UnitTests[Unit Tests]
        IntegrationTests[Integration Tests]
        E2ETests[E2E Tests]
    end
    
    subgraph TestDoubles[Test Doubles]
        Mocks[Mocks]
        Stubs[Stubs]
        Fakes[Fakes]
    end
    
    subgraph System[System Under Test]
        Engine[Engine]
        Domains[Domains]
        UI[UI Components]
    end
    
    UnitTests --> Engine
    UnitTests --> Mocks
    IntegrationTests --> Domains
    IntegrationTests --> Fakes
    E2ETests --> UI
    E2ETests --> Stubs
```

---

## References

- [MASTER_BLUEPRINT.md](./MASTER_BLUEPRINT.md) - System architecture
- [ROADMAP.md](./ROADMAP.md) - Feature roadmap
- [BACKLOG.md](./BACKLOG.md) - Task backlog