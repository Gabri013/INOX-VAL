# 🚀 COMO TESTAR CHAT E ANÚNCIOS AGORA

**Guia passo-a-passo para ver as funcionalidades funcionando**

---

## ⚠️ IMPORTANTE: DOIS PROJETOS DIFERENTES

Você está trabalhando em **dois ambientes**:

### 1️⃣ **Projeto LOCAL (Figma Make)** ✅
- **Tem**: Chat e Anúncios funcionando
- **Estrutura**: `src/app/` e `src/domains/`
- **Status**: Pronto para usar

### 2️⃣ **Repositório GITHUB** ⏳
- **NÃO tem**: Chat e Anúncios
- **Estrutura**: `src/components/` (antiga)
- **Status**: Precisa receber commit

---

## 🎯 OPÇÃO 1: TESTAR NO PROJETO LOCAL (Recomendado)

### **Passo 1: Garantir que está no projeto certo**

Abra o terminal e verifique:

```bash
# Verificar se está na pasta correta
pwd
# Deve mostrar algo como: /Users/seu-nome/projetos/figma-make

# Listar estrutura
ls -la src/
# Deve mostrar: app/ bom/ domains/ (entre outros)
```

Se aparecer `app` e `domains`, está no projeto certo! ✅

---

### **Passo 2: Iniciar o servidor de desenvolvimento**

```bash
# Se ainda não estiver rodando
npm run dev

# Ou se usar pnpm
pnpm dev

# Ou yarn
yarn dev
```

Aguarde aparecer:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### **Passo 3: Abrir no navegador**

1. Abra o navegador
2. Acesse: **http://localhost:5173**
3. Deve aparecer a tela de login

---

### **Passo 4: Fazer Login**

Use um dos usuários de teste:

#### **Opção A: Administrador**
```
Usuário: admin@exemplo.com
Senha: admin123
```

#### **Opção B: Vendedor**
```
Usuário: vendedor@exemplo.com
Senha: vendedor123
```

#### **Opção C: Gerente**
```
Usuário: gerente@exemplo.com
Senha: gerente123
```

---

### **Passo 5: Verificar Notificação de Anúncio**

**Após fazer login, deve aparecer automaticamente:**

```
┌────────────────────────────────────┐
│ 🔴 Sistema de Anúncios Ativo      │
│ O sistema de anúncios está...     │
│                [Marcar como Lido] │
└────────────────────────────────────┘
```

Se aparecer, o sistema de **anúncios está funcionando**! ✅

---

### **Passo 6: Acessar o Chat**

1. Olhe para o **menu lateral esquerdo**
2. Procure o item **"💬 Chat"** (deve estar entre "Calculadora BOM" e "Anúncios")
3. **Clique em "Chat"**

Deve aparecer:
```
┌──────────────────┬────────────────────┐
│ Conversas        │ Selecione conversa │
│                  │                    │
│ João Silva       │                    │
│ Oi, como...      │                    │
│ 🟢 Online        │                    │
│                  │                    │
│ Maria Souza      │                    │
│ Reunião...       │                    │
│ 🔴 Ausente       │                    │
└──────────────────┴────────────────────┘
```

Se aparecer, o **chat está funcionando**! ✅

---

### **Passo 7: Testar envio de mensagem**

1. Clique em **"João Silva"** (ou qualquer conversa)
2. Deve aparecer o histórico de mensagens à direita
3. No campo de texto embaixo, digite: **"Teste de mensagem"**
4. Clique em **"Enviar"**
5. A mensagem deve aparecer imediatamente no histórico

Se funcionou, o **envio de mensagens está OK**! ✅

---

### **Passo 8: Acessar Anúncios**

1. No menu lateral, clique em **"📢 Anúncios"**
2. Deve aparecer a lista de anúncios

```
┌────────────────────────────────────┐
│ 📢 Anúncios                        │
├────────────────────────────────────┤
│ 🔴 IMPORTANTE                      │
│ Sistema de Anúncios Ativo          │
│ 05/02/2026 • Admin                 │
│              [Marcar como Lido]    │
├────────────────────────────────────┤
│ ℹ️ INFO                            │
│ Chat Interno Disponível            │
│ 05/02/2026 • Admin                 │
│                     ✅ Lido        │
└────────────────────────────────────┘
```

Se aparecer, a **lista de anúncios está OK**! ✅

---

### **Passo 9: Criar novo anúncio (apenas se logou como admin)**

1. Na tela de anúncios, clique em **"+ Novo Anúncio"**
2. Preencha:
   - **Título**: "Teste de Anúncio"
   - **Conteúdo**: "Isso é um teste"
   - **Prioridade**: Selecione "Info"
   - **Ativo**: Deixe marcado
3. Clique em **"Criar Anúncio"**
4. Deve:
   - Voltar para a lista
   - Mostrar o novo anúncio
   - Exibir toast de confirmação

Se funcionou, a **criação de anúncios está OK**! ✅

---

## ✅ CHECKLIST DE TESTES

### **Chat**
- [ ] Item "Chat" aparece no menu
- [ ] Cliquei em "Chat"
- [ ] Lista de conversas aparece
- [ ] Cliquei em uma conversa
- [ ] Mensagens aparecem à direita
- [ ] Digitei uma mensagem
- [ ] Enviei a mensagem
- [ ] Mensagem apareceu no histórico

### **Anúncios**
- [ ] Toast de anúncio apareceu ao fazer login
- [ ] Item "Anúncios" aparece no menu
- [ ] Cliquei em "Anúncios"
- [ ] Lista de anúncios aparece
- [ ] Cliquei em "Marcar como Lido"
- [ ] Status mudou para "✅ Lido"
- [ ] (Admin) Cliquei em "+ Novo Anúncio"
- [ ] (Admin) Criei novo anúncio com sucesso

---

## 🔍 SE ALGO NÃO FUNCIONAR

### **Problema: Não vejo "Chat" no menu**

**Solução:**
1. Abra `/src/app/components/layout/Root.tsx`
2. Procure por `navigationItems`
3. Verifique se tem:
```typescript
{ name: "Chat", href: "/chat", icon: MessageCircle }
```
4. Se não tiver, adicione
5. Salve o arquivo
6. Recarregue a página (F5)

---

### **Problema: Não vejo "Anúncios" no menu**

**Solução:**
1. Abra `/src/app/components/layout/Root.tsx`
2. Procure por `navigationItems`
3. Verifique se tem:
```typescript
{ name: "Anúncios", href: "/anuncios", icon: Megaphone }
```
4. Se não tiver, adicione
5. Salve o arquivo
6. Recarregue a página (F5)

---

### **Problema: Erro ao clicar em Chat**

**Erro comum:**
```
Cannot find module '@/domains/chat/pages/ChatPage'
```

**Solução:**
1. Verifique se existe o arquivo:
```
/src/domains/chat/pages/ChatPage.tsx
```
2. Se não existir, você está no projeto errado (GitHub)
3. Mude para o projeto local (Figma Make)

---

### **Problema: Notificações não aparecem**

**Solução:**
1. Abra `/src/app/components/layout/Root.tsx`
2. Procure por `<AnunciosNotifier />`
3. Deve estar antes do `</div>` final
4. Se não estiver, adicione:
```typescript
{/* Notificador de Anúncios */}
<AnunciosNotifier />
```
5. Salve e recarregue

---

### **Problema: Console mostra erros**

**Abra o Console do Navegador:**
- **Chrome/Edge**: F12 → Console
- **Firefox**: F12 → Console
- **Safari**: Cmd+Opt+C

**Erros comuns:**

#### **Erro 1:**
```
Module not found: '@/domains/chat'
```
**Solução:** Você está no projeto GitHub (sem a nova estrutura). Mude para o projeto local.

#### **Erro 2:**
```
useAuth is not defined
```
**Solução:** Verifique se `/src/app/contexts/AuthContext.tsx` existe.

#### **Erro 3:**
```
Database error
```
**Solução:** Limpe o IndexedDB:
1. F12 → Application (Chrome) ou Storage (Firefox)
2. IndexedDB → Clique direito → Delete database
3. Recarregue a página (F5)

---

## 🎯 OPÇÃO 2: SINCRONIZAR COM GITHUB

Se você quer que o GitHub tenha os mesmos arquivos do projeto local:

### **Passo 1: Verificar alterações**

```bash
git status
```

Deve mostrar muitos arquivos modificados/novos.

### **Passo 2: Adicionar arquivos**

```bash
# Adicionar tudo
git add .

# Ou adicionar apenas os novos módulos
git add src/app/
git add src/domains/
git add src/shared/
git add src/services/
```

### **Passo 3: Fazer commit**

```bash
git commit -m "feat: adicionar chat interno e sistema de anúncios

- Implementar chat em tempo real entre colaboradores
- Criar sistema de anúncios administrativos com notificações
- Adicionar permissões RBAC
- Refatorar arquitetura para src/app e src/domains
- Integrar IndexedDB e React Query
- Adicionar componentes padrão ERP"
```

### **Passo 4: Enviar para GitHub**

```bash
git push origin main
```

Agora o GitHub terá os mesmos arquivos! ✅

---

## 📹 VÍDEO DE TESTE SUGERIDO

Grave um vídeo fazendo:

1. **Login** (5 seg)
2. **Toast de anúncio aparece** (3 seg)
3. **Clicar em Chat** (2 seg)
4. **Mostrar conversas e mensagens** (10 seg)
5. **Enviar uma mensagem** (5 seg)
6. **Clicar em Anúncios** (2 seg)
7. **Mostrar lista de anúncios** (5 seg)
8. **Marcar um como lido** (3 seg)
9. **(Admin) Criar novo anúncio** (15 seg)

**Total:** ~50 segundos

Isso prova que tudo está funcionando! ✅

---

## 🆘 SUPORTE RÁPIDO

### **Se estiver no Figma Make:**
- Tudo deve funcionar imediatamente
- Basta seguir os passos acima

### **Se estiver no projeto GitHub:**
- Os arquivos ainda não existem lá
- Você precisa fazer commit/push primeiro
- Ou trabalhar no projeto local

---

## ✅ RESUMO FINAL

**Para VER funcionando AGORA:**

1. ✅ Abrir projeto LOCAL (não GitHub)
2. ✅ Executar `npm run dev`
3. ✅ Acessar `http://localhost:5173`
4. ✅ Fazer login (admin@exemplo.com / admin123)
5. ✅ Clicar em "Chat" no menu
6. ✅ Clicar em "Anúncios" no menu
7. ✅ Interagir com as funcionalidades

**Tempo estimado:** 2-3 minutos

**Resultado:** Chat e Anúncios funcionando perfeitamente! 🎉

---

**Criado em:** 05/02/2026  
**Status:** ✅ Guia completo para teste imediato
