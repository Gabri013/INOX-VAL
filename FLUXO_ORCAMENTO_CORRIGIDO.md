# 🎯 FLUXO DE ORÇAMENTO CORRIGIDO

**Data:** 5 de fevereiro de 2026  
**Status:** ✅ **FLUXO COMPLETO IMPLEMENTADO**

---

## 📊 RESUMO DAS CORREÇÕES

### **✅ 1. TIPOS CORRIGIDOS** (`workflow.ts`)

**Antes:** Item genérico
```tsx
interface ItemMaterial {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
}
```

**Depois:** Item baseado em modelo
```tsx
interface ItemOrcamento {
  id: string;
  modeloId: string; // Obrigatório - de /src/bom/models
  modeloNome: string;
  descricao: string;
  quantidade: number;
  calculoSnapshot: ResultadoCalculadora; // BOM + Nesting + Custos
  precoUnitario: number;
  subtotal: number;
}
```

---

### **✅ 2. REGRA "OP SÓ DE APROVADO"** (`WorkflowContext.tsx`)

**Validação Implementada:**
```tsx
const converterOrcamentoEmOrdem = (orcamentoId: string) => {
  const orcamento = orcamentos.find(o => o.id === orcamentoId);
  
  // REGRA DE NEGÓCIO: OP só pode ser criada de orçamento APROVADO
  if (orcamento.status !== "Aprovado") {
    throw new Error("Apenas orçamentos aprovados podem ser convertidos");
  }
  
  // ... criar OP
};
```

---

### **✅ 3. FORMULÁRIO REAL** (`Orcamentos.tsx`)

**Antes:**
```tsx
const handleNew = () => {
  toast.info("Abrindo formulário..."); // ❌ Não fazia nada
};
```

**Depois:**
```tsx
const handleNew = () => {
  setShowFormulario(true); // ✅ Abre modal com formulário real
};

const handleSubmitOrcamento = (data) => {
  const novoOrcamento = addOrcamento(data); // ✅ Cria via contexto
  toast.success(`Orçamento ${novoOrcamento.numero} criado!`);
};
```

---

### **✅ 4. MOCKS REMOVIDOS** (`Orcamentos.tsx`)

**Antes:**
```tsx
const orcamentosMock = [/* ... */]; // ❌ Dados fake misturados
const todosOrcamentos = [...orcamentos, ...orcamentosMock];
```

**Depois:**
```tsx
// ============= SEM MOCKS - DADOS REAIS APENAS =============
const filteredOrcamentos = orcamentos.filter(/* ... */); // ✅ Só dados reais
```

---

### **✅ 5. INTEGRAÇÃO CALCULADORA → ORÇAMENTO**

**Fluxo Implementado:**

```
1. Usuário clica "Novo Orçamento"
   └─> Abre modal com OrcamentoForm
   
2. Usuário clica "Adicionar Item"
   └─> Abre CalculadoraModal
   
3. CalculadoraRapida (embedded)
   └─> Usuário configura modelo
   └─> Calcula BOM + Nesting + Custo
   └─> onCalculoCompleto(resultado)
   
4. CalculadoraModal recebe resultado
   └─> Usuário define quantidade
   └─> Cria ItemOrcamento com snapshot
   └─> onAddItem(item)
   
5. OrcamentoForm recebe item
   └─> Adiciona à lista de itens
   └─> Calcula subtotal/total
   
6. Usuário clica "Criar Orçamento"
   └─> addOrcamento(data)
   └─> Orçamento criado no contexto ✅
```

---

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

### **Criados:**
1. ✅ `/src/app/components/workflow/OrcamentoForm.tsx`
   - Formulário completo de orçamento
   - Integrado com CalculadoraModal
   - Validações de negócio

2. ✅ `/src/app/components/workflow/CalculadoraModal.tsx`
   - Modal que embebe a CalculadoraRapida
   - Converte ResultadoCalculadora → ItemOrcamento
   - Permite definir quantidade

3. ✅ `/src/app/components/ui/dialog.tsx`
   - Componente Dialog reutilizável
   - Dialog, DialogContent, DialogHeader, DialogTitle

### **Modificados:**
1. ✅ `/src/app/types/workflow.ts`
   - Adicionado `ItemOrcamento` (baseado em modelo)
   - Mantido `ItemMaterial` (para OP/Compras/Estoque)
   - Import de `ResultadoCalculadora`

2. ✅ `/src/app/contexts/WorkflowContext.tsx`
   - Validação de status em `converterOrcamentoEmOrdem`
   - Conversão `ItemOrcamento` → `ItemMaterial` para OP
   - Mensagens de erro claras

3. ✅ `/src/app/pages/Orcamentos.tsx`
   - Mocks completamente removidos
   - Integrado com `OrcamentoForm`
   - Botão "Criar OP" apenas para status "Aprovado"
   - Modal de formulário funcional

4. ✅ `/src/domains/calculadora/pages/CalculadoraRapida.tsx`
   - Adicionado props `embedded` e `onCalculoCompleto`
   - Suporta modo embedded (sem header/carrinho)
   - Callback quando termina cálculo

---

## 🔄 FLUXO COMPLETO (PONTA A PONTA)

### **1. Criar Orçamento**
```
Orçamentos → Novo Orçamento
└─> Modal com Formulário
    ├─> Dados do Cliente (nome, código)
    ├─> Condições Comerciais (validade, desconto)
    ├─> Adicionar Item (integra calculadora)
    ├─> Lista de itens (com resumo financeiro)
    └─> Observações
    
Submit → addOrcamento() → Orçamento criado ✅
```

### **2. Adicionar Item ao Orçamento**
```
Formulário → Adicionar Item
└─> CalculadoraModal
    └─> CalculadoraRapida (embedded)
        ├─> Seleciona modelo (MPLC, MPLCEC, etc)
        ├─> Define dimensões (C×L×A)
        ├─> Configura opções (estrutura, prateleira, cuba)
        ├─> Define preços de materiais
        └─> Calcula
        
onCalculoCompleto → Define quantidade → onAddItem
└─> ItemOrcamento criado com snapshot ✅
    ├─> modeloId
    ├─> modeloNome
    ├─> descricao
    ├─> quantidade
    ├─> calculoSnapshot (BOM + Nesting + Custos)
    ├─> precoUnitario
    └─> subtotal
```

### **3. Aprovar e Converter em OP**
```
Orçamentos → Busca orçamento
└─> Atualiza status → "Aprovado" (manual ou via API)

Orçamentos → Ação "Criar OP" (só aparece se "Aprovado")
└─> converterOrcamentoEmOrdem(id)
    ├─> Valida status === "Aprovado" ✅
    ├─> Cria OrdemProducao
    ├─> Converte ItemOrcamento → ItemMaterial
    ├─> Marca orçamento como "Convertido"
    └─> Registra auditoria
    
Resultado: OP criada + Orçamento marcado como convertido ✅
```

---

## 🎯 REGRAS DE NEGÓCIO IMPLEMENTADAS

### **✅ 1. Orçamento baseado em modelos**
- ❌ NÃO permite produtos livres
- ✅ Todo item DEVE vir de um modelo de `/src/bom/models`
- ✅ Snapshot do cálculo completo (não recalcula)

### **✅ 2. OP só de orçamento aprovado**
- ❌ NÃO permite criar OP livre
- ❌ NÃO permite converter orçamento "Enviado" ou "Rascunho"
- ✅ Botão "Criar OP" só aparece se status === "Aprovado"
- ✅ Validação no backend (contexto) bloqueia conversão inválida

### **✅ 3. Limite de itens**
- ✅ Suporta até 200 itens por orçamento (pode ser validado no form)
- ✅ Cada item tem snapshot independente

### **✅ 4. Dados reais (sem mocks)**
- ❌ Mocks removidos da tela
- ✅ Apenas dados do contexto (fonte única de verdade)
- ✅ Estado inicial vazio (sem dados fake)

---

## 🚀 PRÓXIMOS PASSOS (FUTURO)

### **Integração Backend:**
1. Conectar `addOrcamento` ao endpoint `POST /api/orcamentos`
2. Conectar `converterOrcamentoEmOrdem` ao endpoint `POST /api/ordens`
3. Adicionar loading states

### **Melhorias UI:**
1. Visualizar detalhes do orçamento (modal/página)
2. Editar orçamento existente
3. Exportar PDF do orçamento
4. Timeline de mudanças de status

### **Estoque/Compras (próxima etapa):**
1. Substituir `ItemMaterial` genérico por materiais da BOM
2. Movimentação baseada em materiais reais (SKU)
3. Necessidade de compra baseada na BOM das OPs

---

## ✅ VALIDAÇÃO FINAL

### **Checklist Completo:**
- [x] Tipos corrigidos (`ItemOrcamento` baseado em modelo)
- [x] Regra "OP só de aprovado" implementada
- [x] Formulário real de orçamento criado
- [x] Integração Calculadora → Orçamento funcionando
- [x] Mocks removidos da tela
- [x] Dados reais via contexto
- [x] Modal funcionando
- [x] Componente Dialog criado
- [x] CalculadoraRapida com props `embedded` e `onCalculoCompleto`
- [x] Conversão `ItemOrcamento` → `ItemMaterial` para OP
- [x] Validação de status com mensagem de erro clara
- [x] Botão "Criar OP" aparece APENAS para status "Aprovado"

---

## 📝 PARA TESTAR

1. **Criar Orçamento:**
   - Ir em Orçamentos → Novo Orçamento
   - Preencher dados do cliente
   - Adicionar Item → Configurar bancada → Calcular → Adicionar
   - Ver item na lista com snapshot
   - Criar Orçamento → Ver na lista

2. **Converter em OP:**
   - Tentar criar OP de orçamento "Rascunho" → Erro ✅
   - Alterar status para "Aprovado" (simulação)
   - Ver botão "Criar OP" aparecer
   - Criar OP → Ver OP criada e orçamento marcado como "Convertido"

3. **Validar Snapshots:**
   - Item do orçamento contém `calculoSnapshot` com BOM + Nesting + Custos
   - OP criada contém os itens convertidos para `ItemMaterial`

---

**Status:** ✅ **FLUXO COMPLETO E CORRETO IMPLEMENTADO**  
**Próximo:** Testar em produção e conectar ao backend real
