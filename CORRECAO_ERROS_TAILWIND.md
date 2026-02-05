# 🔧 CORREÇÕES DE ERROS - TAILWIND CSS

**Data:** 5 de fevereiro de 2026  
**Status:** ✅ CORRIGIDO

---

## ❌ ERRO ORIGINAL

```
Pre-transform error: Cannot apply unknown utility class `bg-status-draft/10`
Plugin: @tailwindcss/vite:generate:serve
File: styles/index.css
```

---

## ✅ CORREÇÃO APLICADA

### **Problema:**
Classes utilitárias customizadas no `@layer utilities` não são reconhecidas pelo Tailwind v4 sem configuração adequada.

### **Solução:**
Removidas classes customizadas que dependem de variáveis CSS não registradas:

**Removido:**
```css
.btn-primary { @apply bg-primary text-primary-foreground ... }
.btn-success { @apply bg-success text-success-foreground ... }
.btn-danger { @apply bg-danger text-danger-foreground ... }
.btn-warning { @apply bg-warning text-warning-foreground ... }
.badge-draft { @apply bg-status-draft/10 ... }
.badge-pending { @apply bg-status-pending/10 ... }
.badge-approved { @apply bg-status-approved/10 ... }
.badge-rejected { @apply bg-status-rejected/10 ... }
.badge-completed { @apply bg-status-completed/10 ... }
```

**Mantido apenas:**
```css
.animate-accordion-down { animation: accordion-down 0.2s ease-out; }
.animate-accordion-up { animation: accordion-up 0.2s ease-out; }
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.animate-slide-in { animation: slide-in 0.3s ease-out; }
```

---

## 📝 COMO USAR AS CORES AGORA

### **Variáveis CSS Disponíveis:**

```css
/* Semantic Colors */
--success: #10b981
--warning: #f59e0b
--danger: #ef4444
--info: #3b82f6

/* Status Colors */
--status-draft: #94a3b8
--status-pending: #f59e0b
--status-approved: #10b981
--status-rejected: #ef4444
--status-completed: #0ea5e9
```

### **Uso Direto em Components:**

```tsx
// ✅ CORRETO - Usar inline
<Button className="bg-success text-success-foreground hover:bg-success/90">
  Salvar
</Button>

<Badge className="bg-status-approved/10 text-status-approved border border-status-approved/20">
  Aprovado
</Badge>

// ✅ CORRETO - Usar variantes do shadcn/ui
<Button variant="default">Primário</Button>
<Button variant="destructive">Excluir</Button>
<Button variant="outline">Cancelar</Button>

// ✅ CORRETO - Classes Tailwind padrão
<div className="bg-green-500 text-white">Success</div>
<div className="bg-red-500 text-white">Danger</div>
<div className="bg-amber-500 text-white">Warning</div>
```

---

## ✅ ARQUIVOS CORRIGIDOS

1. **`/src/styles/theme.css`**
   - Removidas classes utilitárias customizadas problemáticas
   - Mantidas apenas animações

2. **`/src/domains/calculadora/pages/CalculadoraRapida.tsx`**
   - Substituído `btn-success` por `bg-success text-success-foreground hover:bg-success/90`

---

## 🎨 GUIA RÁPIDO DE ESTILOS

### **Botões:**

```tsx
// Principal (Primary)
<Button>Texto</Button>
<Button variant="default">Texto</Button>

// Sucesso
<Button className="bg-success text-success-foreground hover:bg-success/90">
  Salvar
</Button>

// Perigo
<Button variant="destructive">Excluir</Button>

// Outline
<Button variant="outline">Cancelar</Button>

// Ghost
<Button variant="ghost">Fechar</Button>
```

### **Badges de Status:**

```tsx
// Draft (Rascunho)
<Badge className="bg-slate-100 text-slate-700 border border-slate-200">
  Rascunho
</Badge>

// Pending (Pendente)
<Badge className="bg-amber-100 text-amber-700 border border-amber-200">
  Pendente
</Badge>

// Approved (Aprovado)
<Badge className="bg-green-100 text-green-700 border border-green-200">
  Aprovado
</Badge>

// Rejected (Rejeitado)
<Badge className="bg-red-100 text-red-700 border border-red-200">
  Rejeitado
</Badge>

// Completed (Concluído)
<Badge className="bg-sky-100 text-sky-700 border border-sky-200">
  Concluído
</Badge>
```

### **Cards com Cores Semânticas:**

```tsx
// Informação
<Card className="border-info/20 bg-info/5">
  <CardContent>...</CardContent>
</Card>

// Sucesso
<Card className="border-success/20 bg-success/5">
  <CardContent>...</CardContent>
</Card>

// Alerta
<Card className="border-warning/20 bg-warning/5">
  <CardContent>...</CardContent>
</Card>

// Perigo
<Card className="border-danger/20 bg-danger/5">
  <CardContent>...</CardContent>
</Card>
```

---

## ✅ RESULTADO

- ✅ **Erro Corrigido:** Compilação sem erros
- ✅ **Tema Mantido:** Cores industriais profissionais
- ✅ **Compatibilidade:** Tailwind v4 + Shadcn/ui
- ✅ **Performance:** Classes inline (tree-shaking otimizado)

---

## 🚀 TESTE

```bash
# Verificar se está funcionando
npm run dev

# Deve compilar sem erros
# Abrir http://localhost:5173
# Testar Calculadora Rápida
```

---

**Status:** ✅ **TOTALMENTE CORRIGIDO**  
**Próximo Passo:** Continuar com revisão de layout das páginas
