# Domínio: Catálogo e Calculadora Rápida

## Visão Geral

O domínio de **Catálogo** implementa um sistema completo de gestão de insumos, produtos padronizados e calculadora rápida de orçamentos para o ERP industrial de fabricação de bancadas e equipamentos em inox.

## Funcionalidades Principais

### 1. Sistema de Codificação de Insumos

Todos os insumos possuem códigos únicos seguindo o padrão:

- **MP-XXX**: Matéria Prima (chapas de inox, tubos, perfis)
- **PN-XXX**: Pés Niveladores
- **PF-XXX**: Parafusos e Fixações
- **AC-XXX**: Acessórios (puxadores, dobradiças, etc)
- **CB-XXX**: Componentes Base (estrutura)

### 2. Catálogo de Insumos

Gerenciamento completo de todos os insumos utilizados na fabricação:

- Matérias-primas (chapas de inox 304, 430, 316)
- Pés niveladores (diversos tamanhos e cargas)
- Parafusos, porcas, arruelas e rebites
- Acessórios diversos
- Especificações técnicas detalhadas
- Controle de estoque
- Custos unitários

### 3. Produtos Padronizados

Biblioteca de produtos pré-configurados:

- **Bancadas**:
  - Bancada Lisa Simples
  - Bancada com Prateleira
  - Bancada com Gavetas
  
- **Mesas**:
  - Mesa Lisa Industrial
  - Mesa com Rebaixo
  - Mesa Industrial Reforçada

Cada produto inclui:
- Dimensões padrão (largura x profundidade x altura)
- Lista de componentes (BOM)
- Tempo de fabricação
- Complexidade
- Custos (material + mão de obra)
- Margem de lucro sugerida
- Preço de venda

### 4. Calculadora Rápida de Orçamentos

Interface intuitiva para vendedores criarem orçamentos rapidamente:

#### Processo:
1. **Seleção de Produtos**: Escolha produtos padronizados do catálogo
2. **Configuração**: Defina quantidades e dimensões customizadas (se necessário)
3. **Margem de Lucro**: Configure a margem desejada
4. **Cálculo Automático**:
   - Consumo de materiais consolidado (BOM)
   - Análise de nesting (aproveitamento de chapas)
   - Totalizadores financeiros
   - Lucro estimado

#### Resultados Fornecidos:
- **Resumo Financeiro**:
  - Total de itens
  - Custo de material
  - Custo de mão de obra
  - Custo total
  - Valor de venda
  - Lucro estimado

- **BOM Consolidado**:
  - Lista completa de materiais necessários
  - Quantidades totais por insumo
  - Custos detalhados

- **Análise de Nesting**:
  - Número de chapas necessárias por material
  - Percentual de aproveitamento
  - Percentual de perda

- **Exportação**:
  - Arquivo CSV com todos os dados
  - Pronto para envio ao cliente ou produção

### 5. Gestão de Orçamentos

Orçamentos criados podem ser:
- Salvos como rascunho
- Enviados para aprovação
- Convertidos em pedidos de produção
- Histórico completo mantido

## Arquitetura Técnica

### Estrutura de Arquivos

```
/src/domains/catalogo/
├── types.ts              # Tipos TypeScript
├── services.ts           # Serviços de API
├── hooks.ts              # React Query hooks
├── seed-data.ts          # Dados mockados
└── README.md             # Esta documentação
```

### Types Principais

```typescript
// Insumo genérico
interface Insumo {
  id: string;
  codigo: string;
  nome: string;
  tipo: TipoInsumo;
  unidade: UnidadeMedida;
  custoUnitario: number;
  estoque?: number;
}

// Produto padronizado
interface ProdutoPadrao {
  id: string;
  codigo: string;
  nome: string;
  tipo: TipoProdutoPadrao;
  dimensoes: DimensoesProduto;
  componentes: Componente[];
  custoTotal: number;
  precoVenda: number;
}

// Orçamento da calculadora
interface CalculadoraOrcamento {
  id: string;
  codigo: string;
  itens: ItemCalculadora[];
  custoTotal: number;
  valorVenda: number;
  margemLucro: number;
  bomConsolidado: ConsumoMaterial[];
}
```

### React Query Hooks

```typescript
// Insumos
useInsumos()                    // Lista todos insumos
useInsumo(id)                   // Busca insumo por ID
useInsumosByTipo(tipo)          // Filtra por tipo

// Produtos Padronizados
useProdutosPadronizados()       // Lista todos produtos
useProdutoPadrao(id)            // Busca produto por ID

// Calculadora
useCalcularOrcamento()          // Calcula orçamento
useSalvarOrcamento()            // Salva orçamento
useOrcamentos()                 // Lista orçamentos
```

## Engine de Cálculo

### Cálculo de Consumo (BOM)

1. Para cada item do orçamento:
   - Busca o produto padronizado
   - Calcula fator de escala (se dimensões customizadas)
   - Soma quantidades de cada componente
2. Consolida materiais iguais
3. Calcula custos totais

### Cálculo de Nesting

1. Filtra apenas matérias-primas (chapas)
2. Para cada tipo de chapa:
   - Calcula área total necessária
   - Determina número de chapas padrão
   - Estima aproveitamento (85-95%)
   - Calcula perda de material

**Nota**: Em produção, este cálculo seria feito por um algoritmo real de nesting.

## Fluxo de Vendas

### Etapa 1: Atendimento e Levantamento
- Vendedor recebe cliente
- Identifica necessidades
- Usa **Calculadora Rápida** para criar orçamento
- Define margem de lucro

### Etapa 2: Aprovação do Cliente
- Orçamento é enviado
- Cliente analisa e aprova/rejeita

### Etapa 3: Engenharia (se aprovado)
- Engenharia faz desenho técnico
- Cliente aprova desenho
- Libera pedido de compra

### Etapa 4: Produção
- Engenharia gera plano de corte (nesting)
- Produção segue fluxo:
  1. Laser (corte)
  2. Dobra
  3. Solda
  4. Montagem
  5. Acabamento
  6. Embalagem

## Integrações

### Sistema Omie
- Número da O.S. vem do Omie
- Integração fiscal mantida no Omie
- ERP foca em produção e controle

### Módulo de Produção
- BOM alimenta ordens de produção
- Nesting gera planos de corte
- Controle de chão de fábrica

### Dashboard TV
- Visualização em tempo real
- Status de produção
- Métricas de desempenho

## Dados Seed Incluídos

### Matérias-Primas
- 5 tipos de chapas de inox (304, 430)
- Espessuras: 0,8mm, 1,0mm, 1,2mm, 1,5mm
- Dimensões padrão: 1000x2000mm

### Pés Niveladores
- 3 modelos (M10, M12)
- Materiais: aço zincado e inox
- Cargas: 150kg a 200kg

### Parafusos e Fixações
- 6 tipos (parafusos, porcas, arruelas, rebites)
- Dimensões: M6, M8
- Material: Inox 304

### Produtos Padronizados
- 6 produtos pré-configurados
- Dimensões variadas
- BOMs completas
- Custos e preços calculados

## Próximas Implementações

- [ ] Dimensões customizadas na calculadora
- [ ] Cálculo de nesting real (algoritmo)
- [ ] Integração com sistema de compras
- [ ] Histórico de preços
- [ ] Análise de rentabilidade por produto
- [ ] Sugestão automática de margem
- [ ] Templates de orçamento personalizados
- [ ] Envio de orçamento por e-mail
- [ ] Conversão de orçamento em pedido

## Observações Importantes

1. **Pronto para Backend**: Toda a camada de serviços está abstraída usando httpClient, facilitando migração para API real

2. **IndexedDB**: Atualmente usa IndexedDB para persistência local via mockClient

3. **Responsivo**: Interface 100% responsiva (mobile, tablet, desktop, TV)

4. **Extensível**: Fácil adicionar novos tipos de insumos e produtos

5. **Performance**: React Query garante cache e otimização de requisições
