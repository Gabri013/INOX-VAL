# INOXFLOW — SUPER RAW ABSOLUTO 2026
# World-Class Product Design + Performance Architecture

Este documento consolida:

1. Brand System completo
2. Tokens reais (estrutura pronta)
3. AppShellMaster arquitetado
4. /orcamento-rapido Elite (estrutura técnica)
5. Performance Layer completa
6. Execução por etapas para Kilo Code

============================================================
SECTION 1 — BRAND SYSTEM (REAL STRUCTURE)
============================================================

/src/brand/brand.tokens.ts


```

============================================================
SECTION 2 — DESIGN TOKENS MASTER
============================================================

/src/ui/theme/tokens.ts

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999
};

export const shadow = {
  sm: "0 2px 6px rgba(0,0,0,0.2)",
  md: "0 6px 20px rgba(0,0,0,0.25)",
  lg: "0 10px 30px rgba(0,0,0,0.3)"
};

export const motion = {
  fast: "120ms cubic-bezier(.4,0,.2,1)",
  medium: "200ms cubic-bezier(.4,0,.2,1)",
  slow: "300ms cubic-bezier(.4,0,.2,1)"
};
```

============================================================
SECTION 3 — APPSHELL MASTER ARCHITECTURE
============================================================

/src/ui/master/AppShellMaster.tsx

```tsx
import React from "react";
import { SidebarMaster } from "./SidebarMaster";
import { TopbarMaster } from "./TopbarMaster";

export const AppShellMaster: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarMaster />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopbarMaster />
        <main style={{ padding: 24, maxWidth: 1440, margin: "0 auto", width: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
};
```

============================================================
SECTION 4 — ORCAMENTO-RAPIDO ELITE STRUCTURE
============================================================

/src/pages/orcamento-rapido.tsx

```tsx
import React from "react";
import { SectionCardMaster } from "@/ui/master/SectionCardMaster";
import { ButtonPrimaryMaster } from "@/ui/master/ButtonPrimaryMaster";

export default function OrcamentoRapido() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      
      <SectionCardMaster title="Configuração do Equipamento">
        {/* Template selector */}
        {/* Preset selector */}
        {/* Dynamic inputs */}
        <ButtonPrimaryMaster>Calcular</ButtonPrimaryMaster>
      </SectionCardMaster>

      <SectionCardMaster title="Resumo do Orçamento">
        {/* Preço final */}
        {/* Breakdown */}
        {/* Utilização chapa */}
        {/* Alertas */}
        <ButtonPrimaryMaster>Finalizar</ButtonPrimaryMaster>
      </SectionCardMaster>

    </div>
  );
}
```

============================================================
SECTION 5 — PERFORMANCE LAYER
============================================================

/src/ui/performance/useRenderTracker.ts

```ts
import { useRef, useEffect } from "react";

export function useRenderTracker(name: string) {
  const renderCount = useRef(0);
  renderCount.current++;

  useEffect(() => {
    console.log(`${name} render count:`, renderCount.current);
  });
}
```

/src/ui/performance/RouteLoadTracker.ts

```ts
export function trackRouteLoad(start: number) {
  const duration = performance.now() - start;
  console.log("Route load time:", duration.toFixed(2), "ms");
}
```

============================================================
SECTION 6 — EXECUÇÃO EM ETAPAS PARA KILO CODE
============================================================

ETAPA 1 — Brand + Tokens  
ETAPA 2 — Component Library Base  
ETAPA 3 — AppShellMaster  
ETAPA 4 — /orcamento-rapido Elite  
ETAPA 5 — /orcamentos/:id Elite  
ETAPA 6 — Admin Master  
ETAPA 7 — Dashboard Master  
ETAPA 8 — Performance Layer  
ETAPA 9 — Debug Mode  
ETAPA 10 — UI Validation + Performance Validation  

Nunca executar tudo de uma vez.

============================================================
FIM DO SUPER RAW ABSOLUTO INOXFLOW 2026
============================================================
