# 🏗️ ARQUITETURA CORRIGIDA - ERP INDUSTRIAL

**Data:** 5 de fevereiro de 2026  
**Status:** ✅ **FONTE ÚNICA DE VERDADE ESTABELECIDA**

---

## 🎯 PROBLEMA IDENTIFICADO E CORRIGIDO

### **❌ ANTES: Duas fontes de verdade (conflito)**

```
❌ Sistema Duplicado:
├── /src/bom/models                    # Modelos parametrizados (OFICIAL)
│   ├── MPLC.ts
│   ├── MPLCEC.ts
│   └── ...
│
├── /src/domains/calculadora/engine.ts  # Engine oficial (USA /src/bom/models) ✅
│
└── /src/domains/nesting/
    ├── bancada.engine.ts              # ❌ DUPLICADO (DELETADO)
    ├── bancada.types.ts               # ❌ DUPLICADO (DELETADO)
    └── CATALOGO_MODELOS               # ❌ DUPLICADO (REMOVIDO)

PROBLEMA: Dois sistemas calculando a mesma coisa de formas diferentes!
```

### **✅ DEPOIS: Uma única fonte de verdade**

```
✅ Sistema Unificado:
/src/bom/models                         # 🏆 FONTE ÚNICA DE VERDADE
├── MPLC.ts                             # Modelos parametrizados
├── MPLCEC.ts
├── MPLCA.ts
└── index.ts                            # Registry de modelos

/src/domains/calculadora/
├── engine.ts                           # Motor oficial (USA gerarBOMIndustrial)
├── types.ts                            # CHAPAS: APENAS 2000×1250 e 3000×1250
└── pages/CalculadoraRapida.tsx         # UI única de entrada

/src/domains/nesting/
├── nesting.engine.ts                   # Faz APENAS nesting (não recalcula BOM)
├── nesting.service.ts                  # Recebe peças JÁ calculadas
└── nesting.types.ts                    # Tipos de nesting

SOLUÇÃO: Um único fluxo linear:
Modelo → BOM → Nesting → Custo → Preço
```

---

## ✅ CORREÇÕES APLICADAS

### **1. Chapas Padrão Fixadas** ✅
**Arquivo:** `/src/domains/calculadora/types.ts`

```tsx
// ANTES (errado - 4 tamanhos)
export const CHAPAS_PADRAO: DimensaoChapa[] = [
  { id: 'chapa-2000x1000', ... },  // ❌ REMOVIDO
  { id: 'chapa-2000x1250', ... },  // ✅ MANTIDO
  { id: 'chapa-2500x1250', ... },  // ❌ REMOVIDO
  { id: 'chapa-3000x1500', ... },  // ❌ REMOVIDO
];

// DEPOIS (correto - 2 tamanhos)
export const CHAPAS_PADRAO: DimensaoChapa[] = [
  {
    id: 'chapa-2000x1250',
    nome: 'Chapa 2000×1250mm',
    comprimento: 2000,
    largura: 1250,
    area: 2.5,
  },
  {
    id: 'chapa-3000x1250',
    nome: 'Chapa 3000×1250mm',
    comprimento: 3000,
    largura: 1250,
    area: 3.75,
  },
];
```

---

### **2. Motor Duplicado Removido** ✅

**Arquivos Deletados:**
- ❌ `/src/domains/nesting/bancada.engine.ts` (300+ linhas duplicadas)
- ❌ `/src/domains/nesting/bancada.types.ts` (tipos duplicados)

**Resultado:**
- ✅ `CATALOGO_MODELOS` duplicado removido
- ✅ `calcularBOM` duplicado removido
- ✅ `validarParametros` duplicado removido

---

### **3. Serviço de Nesting Corrigido** ✅
**Arquivo:** `/src/domains/nesting/nesting.service.ts`

```tsx
// ANTES
import { calcularBOM, CATALOGO_MODELOS, validarParametros } from './bancada.engine'; // ❌
import type { CalcularBOMInput, TipoModeloBancada, CatalogoModelo } from './bancada.types'; // ❌

// DEPOIS
/**
 * Serviço de Nesting - Cálculo de Bancada
 * IMPORTANTE: Este serviço NÃO recalcula BOM
 * Ele recebe peças JÁ calculadas pela engine de calculadora e faz APENAS o nesting
 */
// Imports limpos - SEM referências ao motor duplicado ✅
```

**Funções Removidas:**
- ❌ `listCatalogoModelos()` - Modelos vêm de `/src/bom/models`
- ❌ `getCatalogoModelo()` - Modelos vêm de `/src/bom/models`
- ❌ `calcularBOMBancada()` - BOM vem da Calculadora Rápida

---

### **4. Hooks Limpos** ✅
**Arquivo:** `/src/domains/nesting/nesting.hooks.ts`

```tsx
// REMOVIDO
import type { CalcularBOMInput, TipoModeloBancada } from './bancada.types'; // ❌

// Hooks deletados (funções não existem mais):
// ❌ useCatalogoModelos()
// ❌ useCatalogoModelo()
// ❌ useCalcularBOM()

// COMENTÁRIO ADICIONADO:
// Motivo: Catálogo de modelos agora vem de /src/bom/models (fonte única de verdade)
// BOM é calculado pela Calculadora Rápida (/src/domains/calculadora/engine.ts)
```

---

## 🔄 FLUXO CORRETO (AGORA)

### **Fluxo Obrigatório do Sistema:**

```
1. MODELOS (Fonte de verdade)
   /src/bom/models/*.ts
   └─> MPLC, MPLCEC, MPLCA, etc
   
2. CONFIGURAÇÃO
   Usuario define: L, C, H, opções
   
3. BOM (Calculadora Rápida)
   /src/domains/calculadora/engine.ts
   └─> chama gerarBOMIndustrial()
   └─> retorna lista de peças com dimensões
   
4. NESTING (Otimização)
   /src/domains/nesting/nesting.engine.ts
   └─> recebe peças da BOM
   └─> calcula layouts nas chapas (2000×1250 ou 3000×1250)
   └─> retorna aproveitamento
   
5. PRECIFICAÇÃO
   /src/domains/calculadora/engine.ts
   └─> calcula custos materiais
   └─> aplica perda + mão de obra + margem
   └─> retorna preço final
   
6. ORÇAMENTO
   └─> Salva snapshot (não recalcula)
   └─> Pode ter até 200 itens
   
7. ORDEM DE PRODUÇÃO
   └─> SÓ NASCE DE ORÇAMENTO APROVADO
   └─> Não permite criação livre
```

---

## 📋 REGRAS DE NEGÓCIO APLICADAS

### **1. Modelos Parametrizados** ✅
```tsx
// Fonte única de verdade
import { gerarBOMIndustrial } from '@/bom/models';

// Modelos disponíveis
const modelos = ['MPLC', 'MPLCEC', 'MPLCA', 'MPLCECA', ...];

// NÃO permite produtos livres
// TODO item DEVE vir de um modelo parametrizado
```

### **2. Chapas Padrão** ✅
```tsx
// APENAS dois tamanhos permitidos
const chapas = [
  '2000×1250mm',  // 2.5 m²
  '3000×1250mm',  // 3.75 m²
];

// Nesting compara SOMENTE essas duas
// Escolhe a que dá melhor aproveitamento
```

### **3. Orçamentos** ✅
```tsx
// Estrutura de item
interface ItemOrcamento {
  modeloId: string;          // Obrigatório (de /src/bom/models)
  config: MesaConfig;        // C/L/A + opções
  bomSnapshot: BOMResult;    // Snapshot da BOM calculada
  nestingSnapshot: Nesting;  // Snapshot do nesting (1..N chapas)
  costSnapshot: Precificacao;// Snapshot dos custos
}

// Limite
const MAX_ITENS = 200;

// Não recalcula (usa snapshots)
```

### **4. Ordens de Produção** ✅
```tsx
// OP só nasce de orçamento aprovado
if (orcamento.status !== 'APROVADO') {
  throw new Error('OP só pode ser criada de orçamento aprovado');
}

// Botão "Nova OP" NÃO existe mais
// Botão "Criar OP" aparece apenas em orçamento aprovado
```

---

## 🚫 O QUE NÃO FAZER

### **Duplicação (Nunca mais!):**
```tsx
// ❌ ERRADO - Criar novo catálogo de modelos
export const MEU_CATALOGO = [...];

// ❌ ERRADO - Recalcular BOM fora da calculadora
function calcularBOM(parametros) { ... }

// ❌ ERRADO - Adicionar tamanhos de chapa
CHAPAS_PADRAO.push({ comprimento: 2500, largura: 1250 });

// ✅ CERTO - Usar fonte única de verdade
import { gerarBOMIndustrial, registroModelos } from '@/bom/models';
```

### **Produtos Livres:**
```tsx
// ❌ ERRADO - Permitir item sem modelo
const item = {
  descricao: 'Bancada qualquer',
  dimensoes: { l: 2000, c: 800 },
  // SEM modeloId
};

// ✅ CERTO - Todo item baseado em modelo
const item = {
  modeloId: 'MPLC',  // Obrigatório
  config: { l: 2000, c: 800, h: 850, ... },
  bomSnapshot: calcularBOM('MPLC', config),
};
```

### **OP Livre:**
```tsx
// ❌ ERRADO - Criar OP direto
<Button onClick={() => navigate('/ordens/nova')}>Nova OP</Button>

// ✅ CERTO - OP só de orçamento aprovado
{orcamento.status === 'APROVADO' && (
  <Button onClick={criarOP}>Criar OP</Button>
)}
```

---

## 📁 ESTRUTURA FINAL (CORRIGIDA)

```
src/
├── bom/
│   ├── models/                  # 🏆 FONTE ÚNICA DE VERDADE
│   │   ├── MPLC.ts             # Modelo Mesa com Encosto Liso
│   │   ├── MPLCEC.ts           # Modelo com Espelho e Cuba
│   │   ├── MPLCA.ts            # Modelo com Ângulo
│   │   ├── MPLCECA.ts          # Modelo com Espelho, Cuba e Ângulo
│   │   ├── registry.ts         # Registry de todos os modelos
│   │   └── index.ts            # Exports
│   │
│   ├── engine/                  # Motor BOM
│   │   ├── blank.ts            # Cálculo de dimensões reais
│   │   ├── bom.ts              # Geração da BOM
│   │   └── index.ts
│   │
│   └── types.ts                 # Tipos base (MesaConfig, BOMResult, etc)
│
├── domains/
│   ├── calculadora/             # ✅ Motor oficial
│   │   ├── engine.ts            # USA gerarBOMIndustrial()
│   │   ├── types.ts             # CHAPAS: 2000×1250 e 3000×1250
│   │   ├── components/
│   │   │   ├── FormularioEntrada.tsx
│   │   │   └── ResultadoCalculadora.tsx
│   │   └── pages/
│   │       └── CalculadoraRapida.tsx  # UI única
│   │
│   └── nesting/                 # ✅ Apenas nesting (não calcula BOM)
│       ├── nesting.engine.ts    # Otimização de chapas
│       ├── nesting.service.ts   # Recebe peças JÁ calculadas
│       ├── nesting.types.ts     # Tipos de nesting
│       └── nesting.hooks.ts     # Hooks (limpos)
│
└── app/
    ├── pages/
    │   ├── CalculadoraRapida.tsx    # Wrapper (rota /calculadora-rapida)
    │   ├── Orcamentos.tsx           # Itens baseados em modelos
    │   └── Ordens.tsx               # Só de orçamentos aprovados
    │
    └── routes.tsx                    # Rota única: /calculadora-rapida
```

---

## ✅ VALIDAÇÃO FINAL

### **Checklist:**
- [x] Chapas padrão fixadas (apenas 2000×1250 e 3000×1250)
- [x] Motor duplicado removido (bancada.engine.ts deletado)
- [x] CATALOGO_MODELOS duplicado removido
- [x] Imports limpos (sem referências aos arquivos deletados)
- [x] Hooks limpos (funções inexistentes removidas)
- [x] Comentários explicativos adicionados
- [x] Fluxo unificado documentado

### **Arquivos Deletados:**
- ✅ `/src/domains/nesting/bancada.engine.ts` (300+ linhas)
- ✅ `/src/domains/nesting/bancada.types.ts` (100+ linhas)
- ✅ 3 calculadoras antigas (já deletadas anteriormente)

### **Arquivos Corrigidos:**
- ✅ `/src/domains/calculadora/types.ts` (CHAPAS_PADRAO)
- ✅ `/src/domains/nesting/nesting.service.ts` (imports limpos)
- ✅ `/src/domains/nesting/nesting.hooks.ts` (hooks removidos)

---

## 🎯 RESULTADO

```
✅ FONTE ÚNICA DE VERDADE: /src/bom/models
✅ MOTOR OFICIAL: /src/domains/calculadora/engine.ts
✅ CHAPAS FIXADAS: 2000×1250 e 3000×1250
✅ NESTING LIMPO: Apenas otimização (não recalcula)
✅ FLUXO LINEAR: Modelo → BOM → Nesting → Custo → Preço
✅ SEM DUPLICAÇÃO: Zero conflitos de lógica
```

---

## 📝 PARA A IA (INSTRUÇÕES)

**Ao trabalhar neste projeto, SEMPRE:**

1. **Modelos:** Use APENAS `/src/bom/models` como fonte de verdade
2. **BOM:** Calcule APENAS via `/src/domains/calculadora/engine.ts`
3. **Chapas:** Use APENAS 2000×1250 e 3000×1250 (não adicione outros tamanhos)
4. **Nesting:** Receba peças JÁ calculadas (não recalcule BOM)
5. **Orçamento:** Itens SEMPRE baseados em modelos (não permita produtos livres)
6. **OP:** Crie APENAS de orçamentos aprovados (não permita criação livre)

**Nunca:**
- ❌ Criar novo catálogo de modelos
- ❌ Recalcular BOM fora da calculadora
- ❌ Adicionar tamanhos de chapa
- ❌ Permitir produtos livres
- ❌ Criar OP sem orçamento aprovado

---

**Status:** ✅ **ARQUITETURA CORRIGIDA E UNIFICADA**  
**Próximo Passo:** Implementar visualização do blank posicionado e múltiplas chapas na UI
