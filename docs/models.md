# Modelos Parametrizados - Documentação Técnica

Este documento define os modelos de bancadas disponíveis no sistema, suas entradas, regras de geração e materiais padrão.

---

## Índice de Modelos

| ID | Nome | Categoria | Status |
|-----|------|-----------|--------|
| `MV_ENCOSTO_LISO` | Bancada com Encosto Liso | Parede | ✅ Ativo |
| `MV_ENCOSTO_BORDA_AGUA` | Bancada com Borda d'Água | Parede | ✅ Ativo |
| `MV_ENCOSTO_CUBA_LD` | Bancada Encosto + Cuba Direita | Parede | ✅ Ativo |
| `MV_ENCOSTO_CUBA_LE` | Bancada Encosto + Cuba Esquerda | Parede | ✅ Ativo |
| `MV_CENTRO_LISO` | Bancada Central Simples | Central | ✅ Ativo |
| `MV_INDUSTRIAL_PESADA` | Bancada Industrial Pesada | Industrial | ✅ Ativo |
| `MV_CUBA_DUPLA` | Bancada com 2 Cubas | Parede | 🚧 Beta |
| `MV_ARMARIO_INFERIOR` | Bancada com Armário | Parede | 🚧 Beta |

---

## 1. MV_ENCOSTO_LISO

### Descrição
Bancada básica com encosto liso. Ideal para áreas de preparo, refeitórios e cozinhas comerciais.

### Características
- Tampo horizontal
- Encosto vertical (altura padrão: 300mm)
- Estrutura em tubos quadrados
- Pés reguladores

### Entradas

#### Dimensões
| Campo | Min | Max | Padrão | Unidade |
|-------|-----|-----|--------|---------|
| Comprimento (C) | 600 | 3000 | 1200 | mm |
| Largura (L) | 400 | 1000 | 600 | mm |
| Altura (A) | 800 | 950 | 850 | mm |

#### Opções
```typescript
{
  estrutura: "simples" | "contraventada",
  prateleira: boolean,
  espelhos: "nenhum" | "ambos" | "esquerdo" | "direito"
}
```

### Peças Geradas

#### Chapas
1. **Tampo**: C × L
2. **Encosto**: C × 300mm
3. **Prateleira** (se opcao.prateleira = true): (C-100) × (L-50)
4. **Espelho Esquerdo** (se opção): (L-50) × (A-100)
5. **Espelho Direito** (se opção): (L-50) × (A-100)

#### Tubos
1. **Pernas** (4×): Altura = A - 50mm
2. **Travessas Longitudinais** (2×): Comprimento = C - 80mm
3. **Travessas Transversais** (2×): Comprimento = L - 80mm
4. **Contraventamento** (se estrutura = "contraventada"):
   - Diagonais (4×): √((C-80)² + (L-80)²)

#### Acessórios
- Pés reguladores: 4 unidades
- Parafusos M8×20: 16 unidades
- Cantoneiras de reforço: 4 unidades

### Materiais Padrão
```typescript
{
  chapa: {
    tipo: "Inox 304",
    espessura: "1.2mm",
    acabamento: "2B"
  },
  tubo: {
    perfil: "40×40mm",
    espessura: "1.2mm"
  }
}
```

### Regras Especiais
- Se C > 2000mm: adicionar reforço central no tampo
- Se L > 800mm: aumentar tubo para 50×50mm
- Prateleira sempre 100mm abaixo do tampo

---

## 2. MV_ENCOSTO_BORDA_AGUA

### Descrição
Bancada com borda d'água frontal. Evita escorrimento de líquidos para frente. Comum em áreas de higienização.

### Diferenças em relação ao MV_ENCOSTO_LISO
- Tampo com dobra frontal de 50mm (borda d'água)
- Encosto com dobra superior de 30mm (pingadeira)
- Blank do tampo: (C × L) + (C × 50mm)
- Blank do encosto: (C × 300mm) + (C × 30mm)

### Entradas
_Idênticas ao MV_ENCOSTO_LISO_

### Peças Geradas
_Similar ao MV_ENCOSTO_LISO, com ajustes:_
- Tampo: blank maior para dobra
- Encosto: blank maior para pingadeira

### Materiais Padrão
_Idênticos ao MV_ENCOSTO_LISO_

---

## 3. MV_ENCOSTO_CUBA_LD / MV_ENCOSTO_CUBA_LE

### Descrição
Bancada com encosto e cuba integrada (embutida ou sobreposta). 
- **LD**: Cuba posicionada à direita
- **LE**: Cuba posicionada à esquerda

### Características
- Cuba soldada ou embutida no tampo
- Área de escorrimento ao lado da cuba
- Reforço adicional na área da cuba

### Entradas

#### Dimensões
_Base igual ao MV_ENCOSTO_LISO_

#### Opções Adicionais
```typescript
{
  estrutura: "simples" | "contraventada",
  prateleira: boolean,
  espelhos: "nenhum" | "ambos" | "esquerdo" | "direito",
  cuba: {
    tipo: "embutida" | "sobreposta",
    tamanho: "300×300" | "400×400" | "500×400",
    posicao: "direita" | "esquerda",  // define LD ou LE
    profundidade: 200 | 250 | 300     // mm
  }
}
```

### Peças Geradas

#### Chapas
1. **Tampo**: C × L (com recorte para cuba se embutida)
2. **Encosto**: C × 300mm
3. **Cuba** (se tipo = "sobreposta"):
   - Fundo: dimensões da cuba
   - Laterais: 4 peças (frente, trás, esquerda, direita)
4. **Prateleira** (se opção): (C-100) × (L-50)
5. **Espelhos** (se opção): similar ao MV_ENCOSTO_LISO

#### Tubos
_Similar ao MV_ENCOSTO_LISO, com:_
- Reforço adicional abaixo da cuba (travessa extra)

#### Acessórios
- Pés reguladores: 4 unidades
- Parafusos: 20 unidades (cuba requer mais fixações)
- Cantoneiras: 6 unidades (reforço cuba)
- **Válvula de escoamento**: 1 unidade
- **Sifão**: 1 unidade

### Materiais Padrão
```typescript
{
  chapa: {
    tipo: "Inox 304",
    espessura: "1.5mm",  // Mais espesso por causa da cuba
    acabamento: "2B"
  },
  tubo: {
    perfil: "40×40mm",
    espessura: "1.2mm"
  }
}
```

### Regras Especiais
- Cuba não pode ocupar mais de 70% do comprimento
- Distância mínima da cuba até a borda: 100mm
- Se cuba embutida: adicionar reforço no perímetro
- Área de escorrimento: mínimo 300mm

---

## 4. MV_CENTRO_LISO

### Descrição
Bancada central (ilha). Sem encosto. Acesso por ambos os lados. Ideal para áreas de trabalho compartilhado.

### Características
- Tampo horizontal dupla face
- Sem encosto
- Estrutura reforçada (central)
- Opção de prateleira dupla face

### Entradas

#### Dimensões
| Campo | Min | Max | Padrão | Unidade |
|-------|-----|-----|--------|---------|
| Comprimento (C) | 1000 | 3000 | 1800 | mm |
| Largura (L) | 600 | 1200 | 800 | mm |
| Altura (A) | 850 | 950 | 900 | mm |

#### Opções
```typescript
{
  estrutura: "simples" | "reforçada",
  prateleira: boolean,
  prateleiraInferior: boolean,  // Adicional
  rodizio: boolean              // Bancada móvel
}
```

### Peças Geradas

#### Chapas
1. **Tampo**: C × L
2. **Prateleira Central** (se opção): (C-100) × (L-100)
3. **Prateleira Inferior** (se opção): (C-100) × (L-100)

#### Tubos
1. **Pernas** (4×): Altura = A - 50mm
2. **Travessas** (4×): 2× C-80mm + 2× L-80mm
3. **Estrutura Central** (se estrutura = "reforçada"):
   - Grade de reforço 300×300mm

#### Acessórios
- Pés reguladores (se rodizio = false): 4 unidades
- Rodízios (se rodizio = true): 4 unidades (2 com freio)
- Parafusos: 20 unidades
- Cantoneiras: 8 unidades

### Materiais Padrão
_Similar ao MV_ENCOSTO_LISO_

### Regras Especiais
- Largura mínima: 600mm (acesso ambos lados)
- Se rodízio: adicionar trava de segurança
- Estrutura reforçada obrigatória se C > 2000mm

---

## 5. MV_INDUSTRIAL_PESADA

### Descrição
Bancada industrial para trabalho pesado. Reforços extras, tubos maiores, espessuras aumentadas.

### Características
- Estrutura robusta (tubo 50×50mm)
- Chapa mais espessa (2.0mm)
- Múltiplos reforços
- Capacidade de carga: 300kg/m

### Entradas

#### Dimensões
_Similar ao MV_ENCOSTO_LISO_

#### Opções
```typescript
{
  estrutura: "reforçada",  // Sempre
  prateleira: boolean,
  espelhos: "nenhum" | "ambos",
  travessasCentralizadas: boolean,  // Reforço extra
  apoioFerramentas: boolean         // Furos para ganchos
}
```

### Peças Geradas
_Similar ao MV_ENCOSTO_LISO, com ajustes:_

#### Diferenças
- Tubos: 50×50mm (em vez de 40×40mm)
- Chapa: 2.0mm (em vez de 1.2mm)
- Travessas adicionais a cada 600mm
- Cantoneiras maiores (L100×100)

### Materiais Padrão
```typescript
{
  chapa: {
    tipo: "Inox 304",
    espessura: "2.0mm",
    acabamento: "2B"
  },
  tubo: {
    perfil: "50×50mm",
    espessura: "2.0mm"
  }
}
```

### Regras Especiais
- Sempre estrutura contraventada
- Pés reforçados (chumbamento opcional)
- Se C > 1500mm: travessa central obrigatória

---

## 6. MV_CUBA_DUPLA (Beta)

### Descrição
Bancada com duas cubas integradas. Para áreas de lavagem com separação (lavagem/enxágue).

### Características
- 2 cubas (esquerda e direita)
- Área central de escorrimento
- Sistema de válvulas duplo

### Entradas

#### Dimensões
| Campo | Min | Max | Padrão |
|-------|-----|-----|--------|
| Comprimento (C) | 1600 | 3000 | 2000 |
| Largura (L) | 600 | 800 | 700 |
| Altura (A) | 850 | 900 | 850 |

#### Opções
```typescript
{
  estrutura: "contraventada",  // Obrigatório
  cubas: {
    tamanho: "400×400" | "500×400",
    profundidade: 250 | 300,
    espaçamento: number  // Entre cubas (min: 400mm)
  }
}
```

### Status
🚧 **Beta** - Modelo em fase de testes. Use com atenção aos limites.

---

## 7. MV_ARMARIO_INFERIOR (Beta)

### Descrição
Bancada com armário fechado na parte inferior. Portas de correr ou batentes.

### Características
- Tampo + encosto
- Armário fechado (em vez de prateleira aberta)
- Portas em inox ou outro material
- Prateleiras internas ajustáveis

### Entradas
_Similar ao MV_ENCOSTO_LISO + opções de armário_

#### Opções Adicionais
```typescript
{
  armario: {
    tipo: "portas_correr" | "portas_batente",
    divisoes: 1 | 2 | 3,  // Compartimentos
    prateleiras: number   // Quantidade (0-3)
  }
}
```

### Status
🚧 **Beta** - Requer validação de dobradiças e trilhos.

---

## Mapeamento de Códigos Legados

O sistema possui modelos legados (códigos antigos). Mapeamento:

| Código Legado | Modelo Atual | Observação |
|---------------|--------------|------------|
| `MPLC` | `MV_ENCOSTO_LISO` | Migrado |
| `MPLCP` | `MV_ENCOSTO_BORDA_AGUA` | Migrado |
| `MPLE4_INV_LD` | `MV_ENCOSTO_CUBA_LD` | Migrado |
| `MPLE4_INV_LE` | `MV_ENCOSTO_CUBA_LE` | Migrado |
| `MPVE` | `MV_CENTRO_LISO` | Migrado |
| `S152908` | `MV_INDUSTRIAL_PESADA` | Em migração |

---

## Estrutura de Dados (TypeScript)

### Definição de Modelo

```typescript
interface ModeloParametrizado {
  id: string;
  nome: string;
  descricao: string;
  categoria: "parede" | "central" | "industrial";
  status: "ativo" | "beta" | "deprecated";
  
  // Entradas permitidas
  dimensoes: {
    C: { min: number; max: number; padrao: number };
    L: { min: number; max: number; padrao: number };
    A: { min: number; max: number; padrao: number };
  };
  
  opcoes: {
    estrutura: string[];
    prateleira: boolean;
    espelhos: string[];
    // ... outras opções específicas
  };
  
  // Materiais padrão
  materiaisPadrao: {
    chapa: { tipo: string; espessura: string; acabamento: string };
    tubo: { perfil: string; espessura: string };
  };
  
  // Função geradora
  gerar: (config: ConfiguracaoProduto) => BOMResult;
}
```

### Configuração de Produto

```typescript
interface ConfiguracaoProduto {
  modeloId: string;
  dimensoes: { C: number; L: number; A: number };
  opcoes: Record<string, any>;
  material?: {
    chapa?: { tipo: string; espessura: string };
    tubo?: { perfil: string; espessura: string };
  };
}
```

---

## Como Adicionar um Novo Modelo

### 1. Definir Especificação
Crie documento em `docs/models/NOVO_MODELO.md` com:
- Descrição e caso de uso
- Entradas e validações
- Peças geradas
- Materiais padrão
- Regras especiais

### 2. Implementar Motor BOM
Crie arquivo em `src/bom/models/novo_modelo/novo_modelo.ts`:
```typescript
import { BOMResult, ConfiguracaoProduto } from '../../types';

export function gerarBOM_NovoModelo(config: ConfiguracaoProduto): BOMResult {
  // 1. Validar entradas
  // 2. Calcular blanks
  // 3. Gerar BOM
  // 4. Retornar resultado
}
```

### 3. Registrar Modelo
Adicionar em `src/bom/models/index.ts`:
```typescript
import { gerarBOM_NovoModelo } from './novo_modelo/novo_modelo';

export const MODELOS_DISPONIVEIS = {
  // ... existentes
  NOVO_MODELO: {
    id: 'NOVO_MODELO',
    nome: 'Nome do Modelo',
    gerar: gerarBOM_NovoModelo
  }
};
```

### 4. Adicionar Testes
Criar casos de teste em `src/bom/models/novo_modelo/novo_modelo.test.ts`

### 5. Documentar
- Atualizar este arquivo (`docs/models.md`)
- Adicionar exemplos de uso
- Screenshots da interface

---

## Prompt para IA ao Trabalhar com Modelos

> "Os modelos parametrizados existem para gerar automaticamente BOM + nesting de bancadas baseados apenas em C/L/A + opções. Cada modelo deve:
> 
> 1. Validar entradas (dimensões, opções)
> 2. Calcular blank de cada peça (geometria real)
> 3. Gerar BOM detalhada (chapa, tubos, acessórios)
> 4. Incluir observações sobre reforços e regras especiais
> 
> Não simplifique nem estime. O vendedor precisa de precisão total para orçar corretamente. Qualquer alteração deve explicar: qual melhoria traz e como aumenta a precisão do cálculo."

---

**Versão**: 1.0  
**Última Atualização**: Fevereiro 2026  
**Responsável**: Engenharia de Produto
