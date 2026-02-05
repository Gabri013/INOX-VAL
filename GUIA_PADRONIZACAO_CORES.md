# 🎨 GUIA DE PADRONIZAÇÃO DE CORES - CALCULADORA RÁPIDA

## ✅ ALTERAÇÕES JÁ REALIZADAS:

### 1. **CalculadoraRapida.tsx** - Página Principal
- ✅ Info box: `bg-blue-50 dark:bg-blue-950` com bordas e textos ajustados

---

## 🔧 ALTERAÇÕES PENDENTES:

### 2. **FormularioEntrada.tsx** - Substituições Globais

Substitua **TODAS as ocorrências** das seguintes classes:

#### **Modelos/Botões Selecionáveis:**
```
❌ ANTES: border-blue-500 bg-blue-50
✅ DEPOIS: border-primary bg-primary/10
```

#### **Cards Brancos:**
```
❌ ANTES: bg-white rounded-lg border border-neutral-200
✅ DEPOIS: bg-card rounded-lg border
```

#### **Inputs Focus:**
```
❌ ANTES: focus:ring-2 focus:ring-blue-500
✅ DEPOIS: focus:ring-2 focus:ring-primary
```

#### **Botão Calcular:**
```
❌ ANTES: bg-blue-600 text-white hover:bg-blue-700
✅ DEPOIS: bg-primary text-primary-foreground hover:bg-primary/90
```

#### **Textos Muted:**
```
❌ ANTES: text-neutral-600, text-neutral-500
✅ DEPOIS: text-muted-foreground
```

#### **Bordas:**
```
❌ ANTES: border-neutral-200, border-neutral-300
✅ DEPOIS: border-border
```

#### **Hover States:**
```
❌ ANTES: hover:bg-neutral-50
✅ DEPOIS: hover:bg-accent
```

#### **Backgrounds de Info:**
```
❌ ANTES: bg-neutral-50
✅ DEPOIS: bg-accent
```

---

###  3. **ResultadoCalculadora.tsx** - Substituições

#### **Header Verde:**
```
❌ ANTES: bg-gradient-to-r from-green-600 to-green-700 text-white
✅ DEPOIS: bg-gradient-to-r from-primary to-primary/90 text-primary-foreground
```

#### **Textos Verdes:**
```
❌ ANTES: text-green-100, text-green-600, text-green-700
✅ DEPOIS: text-primary-foreground, text-primary, text-primary
```

#### **Botões Brancos em Header Verde:**
```
❌ ANTES: bg-white text-green-600 hover:bg-green-50
✅ DEPOIS: bg-background text-primary hover:bg-accent
```

#### **Botões Verdes:**
```
❌ ANTES: bg-green-700 text-white hover:bg-green-800
✅ DEPOIS: bg-primary text-primary-foreground hover:bg-primary/90
```

#### **Cards de Ícones:**
```
❌ ANTES: bg-blue-100 ... text-blue-600
✅ DEPOIS: bg-primary/10 ... text-primary
```

---

## 📝 REGEX ÚTEIS PARA SUBSTITUIÇÃO EM MASSA:

Se você estiver usando VS Code, use Find & Replace (Ctrl+H) com regex ativado:

### 1. Substituir azuis:
```regex
Procurar: (bg|text|border)-blue-(50|100|500|600|700|800)
Substituir: (avaliar caso a caso - veja guia acima)
```

### 2. Substituir verdes:
```regex
Procurar: (bg|text|border)-green-(50|100|600|700|800)
Substituir: (avaliar caso a caso - veja guia acima)
```

### 3. Substituir neutrals:
```regex
Procurar: text-neutral-(500|600)
Substituir: text-muted-foreground
```

---

## 🎯 CHECKLIST FINAL:

- [ ] FormularioEntrada.tsx - Todos os cards usam `bg-card`
- [ ] FormularioEntrada.tsx - Todos os botões selecionáveis usam `border-primary bg-primary/10`
- [ ] FormularioEntrada.tsx - Todos os inputs usam `focus:ring-primary`
- [ ] FormularioEntrada.tsx - Botão calcular usa `bg-primary`
- [ ] ResultadoCalculadora.tsx - Header usa `from-primary to-primary/90`
- [ ] ResultadoCalculadora.tsx - Todos os botões verdes viram `bg-primary`
- [ ] ResultadoCalculadora.tsx - Cards de ícone usam `bg-primary/10 text-primary`

---

## ✅ RESULTADO ESPERADO:

Após todas as alterações, a Calculadora Rápida deve:
1. ✅ Usar cores do tema (suporte a dark mode completo)
2. ✅ Ser consistente com o resto do app
3. ✅ Não ter mais cores hardcoded (blue, green, neutral)
4. ✅ Usar variáveis CSS do tema (`primary`, `background`, `foreground`, etc.)

---

**Quer que eu aplique essas mudanças automaticamente nos arquivos?**
