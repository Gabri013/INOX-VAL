# Visão do Sistema - ERP Industrial

## 1. Objetivo do Sistema

O aplicativo existe para **o vendedor gerar um orçamento técnico em poucos minutos**, com precisão de consumo de material e custo, baseado em modelos parametrizados de bancadas.

### O que o sistema calcula automaticamente:

✅ **Geometria/blank das peças** - Dimensões exatas de cada componente  
✅ **BOM completa** - Lista detalhada: chapa, tubo, reforços, acessórios  
✅ **Nesting** - Aproveitamento de chapa e quantidade necessária  
✅ **Custo de cada item** - Inox por m²/kg, tubos por metro/kg, acessórios por unidade  
✅ **Total final** - Com perdas, mão de obra e margem

**Sem BOM + nesting + custos por item, o aplicativo não cumpre sua função.**

---

## 2. "Contrato" da Calculadora Rápida

### ENTRADA (o vendedor preenche)

| Campo | Descrição | Exemplos |
|-------|-----------|----------|
| **Modelo** | Tipo de bancada | Encosto liso / Borda d'água / Encosto + cuba / Central |
| **Comprimento (C)** | Medida principal | 1200mm, 1800mm, 2400mm |
| **Largura (L)** | Profundidade | 600mm, 700mm, 800mm |
| **Altura (A)** | Altura total | 850mm, 900mm |
| **Opções** | Configurações extras | • Estrutura: simples/contraventada<br>• Prateleira: sim/não<br>• Espelhos: sim/não<br>• Cuba: posição/tamanho |
| **Material** | Tipo de inox | 304/430/316 + espessura |
| **Tabela de Preços** | Valores atuais | • Chapa: R$/kg ou R$/m²<br>• Tubo: R$/m<br>• Acessórios: R$/unidade |

### SAÍDA (o vendedor recebe imediatamente)

#### A) BOM Detalhada
```
┌────────────────────────────────────────────────────────┐
│ LISTA DE MATERIAIS (BOM)                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│ CHAPAS                                                 │
│ • Tampo: Inox 304 1.2mm - 1,44 m² (1200×1200mm)      │
│ • Encosto: Inox 304 1.2mm - 0,96 m² (1200×800mm)     │
│ • Prateleira: Inox 304 1.2mm - 1,32 m² (1100×1200mm) │
│                                                        │
│ TUBOS                                                  │
│ • Tubo 40×40×1.2mm: 4,80 m (estrutura principal)     │
│ • Tubo 30×30×1.2mm: 2,40 m (contraventamento)        │
│                                                        │
│ ACESSÓRIOS                                            │
│ • Pés reguladores: 4 unidades                         │
│ • Parafusos M8: 16 unidades                           │
│ • Cantoneiras reforço: 4 unidades                     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### B) Nesting
```
┌────────────────────────────────────────────────────────┐
│ OTIMIZAÇÃO DE CHAPAS                                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Chapa Selecionada: 2,5 × 1,25 m                      │
│ Quantidade Necessária: 2 chapas                       │
│ Aproveitamento: 87%                                   │
│ Sobra Total: 0,45 m²                                  │
│                                                        │
│ ┌─────────────────────────────────────┐               │
│ │ [PREVIEW VISUAL DO LAYOUT]          │               │
│ │                                     │               │
│ │  ┌────────┐  ┌────────┐            │               │
│ │  │ Tampo  │  │Encosto │   [Sobra]  │               │
│ │  │1200×   │  │1200×   │            │               │
│ │  │1200    │  │ 800    │            │               │
│ │  └────────┘  └────────┘            │               │
│ │                                     │               │
│ │  ┌──────────────┐                  │               │
│ │  │ Prateleira   │      [Sobra]     │               │
│ │  │1100×1200     │                  │               │
│ │  └──────────────┘                  │               │
│ │                                     │               │
│ └─────────────────────────────────────┘               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### C) Precificação
```
┌────────────────────────────────────────────────────────┐
│ DETALHAMENTO DE CUSTOS                                │
├────────────────────────────────────────────────────────┤
│                                                        │
│ MATERIAIS                                             │
│ • Chapa Inox 304 (3,72 m² × R$ 180/m²) .. R$ 1.850,00│
│ • Tubo 40×40 (4,8m × R$ 45/m) ............ R$ 216,00 │
│ • Tubo 30×30 (2,4m × R$ 38/m) ............ R$ 91,20  │
│ • Acessórios ............................... R$ 280,00 │
│                                        ──────────────  │
│ Subtotal Material ........................ R$ 2.437,20│
│                                                        │
│ CUSTOS ADICIONAIS                                     │
│ • Perdas/Aparas (5%) ....................... R$ 121,86│
│ • Mão de Obra (estimada) ................... R$ 600,00│
│                                        ──────────────  │
│ Custo Total ............................... R$ 3.159,06│
│                                                        │
│ PRECIFICAÇÃO                                          │
│ • Markup (40%) ........................... R$ 1.263,62│
│                                        ══════════════  │
│ PREÇO FINAL ............................... R$ 4.422,68│
│                                        ══════════════  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### D) Melhor Opção
```
┌────────────────────────────────────────────────────────┐
│ COMPARAÇÃO DE ALTERNATIVAS                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ✓ RECOMENDADO                                         │
│   Chapa 2,5 × 1,25 m (2 unidades)                    │
│   Aproveitamento: 87%                                 │
│   Preço Final: R$ 4.422,68                            │
│                                                        │
│ ○ Alternativa 1                                       │
│   Chapa 2,0 × 1,0 m (3 unidades)                     │
│   Aproveitamento: 82%                                 │
│   Preço Final: R$ 4.680,00  (+R$ 257,32)             │
│                                                        │
│ ○ Alternativa 2                                       │
│   Chapa 3,0 × 1,25 m (2 unidades)                    │
│   Aproveitamento: 85%                                 │
│   Preço Final: R$ 4.890,00  (+R$ 467,32)             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 3. O Motivo de Cada Parte

### Por que "Modelos parametrizados" existem
**Problema**: Desenhar cada bancada do zero consome horas.  
**Solução**: Vendedor só informa medidas e opções. Motor gera as peças automaticamente.  
**Resultado**: 2 minutos em vez de 2 horas.

### Por que "Blank" existe
**Problema**: Sem dimensões exatas das peças, o custo vira chute.  
**Solução**: Blank calcula geometria real de cada componente.  
**Resultado**: Custo real, não estimado.

### Por que "BOM" existe
**Problema**: Lista genérica não permite auditoria nem rastreamento.  
**Solução**: BOM detalha consumo e custo por item (chapa, tubo, acessórios).  
**Resultado**: Orçamento auditável e repetível.

### Por que "Nesting" existe
**Problema**: Custo de chapa não é só área da peça; depende de desperdício.  
**Solução**: Nesting calcula quantas chapas reais serão usadas e o aproveitamento.  
**Resultado**: Precisão no custo de material.

### Por que "Custo por item" existe
**Problema**: Cada material tem preço diferente (inox 304/430, tubo 40×40, etc.).  
**Solução**: Sistema calcula custo separado de cada categoria.  
**Resultado**: Vendedor vê detalhamento e total realista.

---

## 4. Entidades do Sistema

### ProdutoParametrizado (Modelo)
```typescript
{
  id: string;              // "MV_ENCOSTO_LISO"
  nome: string;            // "Bancada com Encosto Liso"
  categoria: string;       // "bancada"
  inputs: {                // Inputs permitidos
    dimensoes: ["C", "L", "A"],
    opcoes: ["estrutura", "prateleira", "espelhos", "cuba"]
  },
  regrasGeracao: {         // Como gerar peças
    pecas: ["tampo", "encosto", "prateleira?", "estrutura"],
    reforcos: "auto",
    acessorios: "auto"
  },
  materiaisPadrao: {       // Materiais default
    chapa: { tipo: "304", espessura: "1.2mm" },
    tubo: { perfil: "40x40", espessura: "1.2mm" }
  }
}
```

### ConfiguracaoProduto (instância)
```typescript
{
  modeloId: "MV_ENCOSTO_LISO",
  dimensoes: { C: 1200, L: 600, A: 850 },
  opcoes: {
    estrutura: "contraventada",
    prateleira: true,
    espelhos: false,
    cuba: null
  },
  material: {
    chapa: { tipo: "304", espessura: "1.2mm" },
    tubo: { perfil: "40x40", espessura: "1.2mm" }
  }
}
```

### BOMResult
```typescript
{
  itens: [
    {
      categoria: "chapa",
      material: "Inox 304 1.2mm",
      unidade: "m²",
      quantidade: 3.72,
      dimensoes: "várias",
      observacao: "Tampo + Encosto + Prateleira"
    },
    {
      categoria: "tubo",
      material: "Tubo 40×40×1.2mm",
      unidade: "m",
      quantidade: 4.8,
      observacao: "Estrutura principal"
    }
  ],
  pecasDeChapa: [...],   // Para nesting
  peçasDeTubo: [...],    // Para corte
  acessorios: [...]      // Lista de itens
}
```

### NestingResult
```typescript
{
  chapaSelecionada: { largura: 2.5, comprimento: 1.25 },
  quantidadeChapas: 2,
  aproveitamento: 0.87,  // 87%
  sobra: 0.45,           // m²
  layout: {
    chapas: [
      {
        pecas: [...],    // Peças alocadas
        posicoes: [...]  // Coordenadas X,Y
      }
    ]
  }
}
```

### PrecificacaoResult
```typescript
{
  custoChapa: 1850.00,
  custoTubos: [
    { tipo: "40×40", valor: 216.00 },
    { tipo: "30×30", valor: 91.20 }
  ],
  custoAcessorios: 280.00,
  subtotalMaterial: 2437.20,
  perdas: 121.86,        // 5%
  maoDeObra: 600.00,
  custoTotal: 3159.06,
  markup: 1263.62,       // 40%
  precoFinal: 4422.68
}
```

---

## 5. Fluxo do Usuário (Detalhado)

### Tela: Calculadora Rápida

#### Passo 1: Seleção do Modelo
```
┌────────────────────────────────────────────────────────┐
│ Selecione o Modelo                                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ○ Bancada com Encosto Liso                           │
│  ○ Bancada com Borda d'Água                           │
│  ● Bancada com Encosto + Cuba                         │
│  ○ Bancada Central (sem encosto)                      │
│  ○ Bancada Industrial Pesada                          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### Passo 2: Entrada de Dimensões
```
┌────────────────────────────────────────────────────────┐
│ Dimensões                                             │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Comprimento (C):  [1200] mm                          │
│  Largura (L):      [ 600] mm                          │
│  Altura (A):       [ 850] mm                          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### Passo 3: Opções
```
┌────────────────────────────────────────────────────────┐
│ Opções                                                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Estrutura:     ● Simples  ○ Contraventada            │
│  Prateleira:    ☑ Incluir prateleira inferior         │
│  Espelhos:      ☐ Incluir espelhos laterais           │
│  Cuba:          [Esquerda ▼]  [400×400 ▼]            │
│                                                        │
│  Material:                                            │
│  • Chapa: [Inox 304 ▼]  [1.2mm ▼]                    │
│  • Tubo:  [40×40 ▼]     [1.2mm ▼]                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### Passo 4: Cálculo
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│              [ CALCULAR ORÇAMENTO ]                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### Resultado: 3 Blocos na Mesma Tela

**Bloco A - BOM**  
_Veja seção 2 acima_

**Bloco B - Nesting**  
_Veja seção 2 acima_

**Bloco C - Precificação**  
_Veja seção 2 acima_

#### Ações Finais
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  [ Ajustar Preços ]  [ Gerar PDF ]  [ Salvar Pedido ] │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 6. Regras de Negócio

### Validações de Entrada
- **Comprimento (C)**: 600mm a 3000mm
- **Largura (L)**: 400mm a 1000mm
- **Altura (A)**: 800mm a 950mm
- **Cuba**: Não pode ser maior que 70% do comprimento

### Cálculo de Perdas
- **Corte de chapa**: 5% (aparas + recortes)
- **Corte de tubo**: 3% (pontas + ajustes)
- **Furação/solda**: incluído na mão de obra

### Markup Sugerido
- **Bancada simples**: 35-40%
- **Bancada com cuba**: 40-45%
- **Projeto especial**: 50%+

---

## 7. Métricas de Sucesso

### Para o Vendedor
- ⏱️ **Tempo de orçamento**: < 5 minutos (antes: 2-3 horas)
- 🎯 **Precisão de custo**: 95%+ (antes: ~70%)
- 📈 **Taxa de fechamento**: +30% (orçamento profissional)

### Para a Empresa
- 💰 **Margem preservada**: Markup correto em 100% dos casos
- 📊 **Dados estruturados**: BOM → Compras → Produção (fluxo direto)
- 🚀 **Escala**: 1 vendedor pode orçar 10× mais

---

## 8. Roadmap Futuro

### Fase 1: Core (Concluído ✅)
- Modelos parametrizados
- Motor BOM
- Nesting básico
- Precificação

### Fase 2: Otimizações (Próxima)
- Nesting inteligente (algoritmo genético)
- Comparação de fornecedores
- Histórico de preços

### Fase 3: Integração (Backend)
- API REST real
- Banco de dados PostgreSQL
- Autenticação JWT

### Fase 4: Produção (Futuro)
- Geração de desenhos CAD
- Integração com máquinas CNC
- QR codes para rastreamento

---

## 9. Glossário

| Termo | Definição |
|-------|-----------|
| **BOM** | Bill of Materials - Lista detalhada de materiais |
| **Blank** | Geometria base da peça antes de cortes/dobragens |
| **Nesting** | Otimização de layout de peças em chapas |
| **Markup** | Percentual de margem sobre o custo |
| **Aproveitamento** | Percentual de área útil vs. área total da chapa |
| **Contraventamento** | Reforço diagonal na estrutura |
| **Espelho** | Tampa lateral da bancada |

---

## Prompt Definitivo para IA

**Use sempre que trabalhar neste projeto:**

> "Este ERP existe para o vendedor gerar orçamento preciso em minutos. O fluxo obrigatório é: selecionar modelo parametrizado de bancada + informar C/L/A + opções → gerar blank → gerar BOM → rodar nesting → calcular custo por item (inox, tubos por tipo, acessórios) → retornar preço final e melhor opção de chapa.
>
> Não adicione telas ou funcionalidades que não reforcem esse fluxo. Qualquer alteração deve explicar: qual etapa do fluxo melhora e como aumenta a precisão ou reduz o tempo do vendedor."

---

**Versão**: 1.0  
**Data**: Fevereiro 2026  
**Autor**: Time de Produto
