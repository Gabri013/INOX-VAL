# ⚡ QUICK START - Firebase em 10 Minutos

**Data:** 05/02/2026

---

## 🚀 PASSO 1: Criar Projeto Firebase (3 min)

1. Acesse: https://console.firebase.google.com
2. Clique em "Adicionar projeto"
3. Nome: `erp-industrial-[sua-empresa]`
4. Desabilite Google Analytics
5. Clique em "Criar projeto"

---

## 🔐 PASSO 2: Ativar Authentication (1 min)

1. Menu lateral → **Authentication**
2. Clique em "Começar"
3. Aba "Sign-in method"
4. Clique em "Email/Senha"
5. **Ative** a opção
6. Clique em "Salvar"

---

## 🗄️ PASSO 3: Ativar Firestore (1 min)

1. Menu lateral → **Firestore Database**
2. Clique em "Criar banco de dados"
3. Modo: **Produção**
4. Location: **southamerica-east1** (São Paulo)
5. Clique em "Ativar"

---

## 🔑 PASSO 4: Copiar Credenciais (2 min)

1. Ícone ⚙️ → "Configurações do projeto"
2. Role até "Seus apps"
3. Clique em ícone Web `</>`
4. Nome: `ERP Industrial Web`
5. **NÃO** marque "Firebase Hosting"
6. Clique em "Registrar app"
7. **Copie o firebaseConfig:**

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123..."
};
```

---

## 📄 PASSO 5: Configurar .env (1 min)

```bash
# Copiar template
cp .env.example .env

# Editar .env e colar as credenciais
nano .env
```

**Exemplo de .env:**

```bash
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_ENABLE_PERSISTENCE=true
```

---

## 🛡️ PASSO 6: Deploy das Rules (2 min)

```bash
# Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Login
firebase login

# Inicializar (apenas selecione Firestore)
firebase init

# Deploy
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## ✅ PASSO 7: Testar (1 min)

```bash
# Rodar projeto
npm run dev

# Acessar http://localhost:5173
# Será redirecionado para /login

# Clicar em "Criar conta"
# Preencher dados e criar conta

# Fazer login
# Pronto! Sistema funcionando com Firebase! 🎉
```

---

## 🎯 VERIFICAÇÃO

Abra o console do navegador (F12). Deve ver:

```
✅ Firebase inicializado com sucesso
```

No Firebase Console:

1. **Authentication** → Users → Deve ter 1 usuário
2. **Firestore** → Data → (ainda vazio - normal)

---

## 📚 PRÓXIMOS PASSOS

### Opção A: Migração Gradual

Migrar páginas uma por uma para usar hooks Firebase:

```typescript
// Em qualquer página
import { useClientes } from '@/hooks/useClientes';

function MinhaPage() {
  const { clientes, loading, createCliente } = useClientes();
  
  if (loading) return <div>Carregando...</div>;
  
  return <div>{clientes.length} clientes</div>;
}
```

### Opção B: Migração Instantânea

Trocar WorkflowContext pelo V2:

```typescript
// Em /src/app/providers/AppProviders.tsx
// Linha 11:
import { WorkflowProvider } from '../contexts/WorkflowContext.v2';
```

Salvar e recarregar. **Pronto!** 🚀

---

## 🆘 PROBLEMAS?

### Não vejo "✅ Firebase inicializado"

**Solução:**
1. Verificar arquivo `.env`
2. Verificar se variáveis começam com `VITE_`
3. Reiniciar servidor (`Ctrl+C` e `npm run dev`)

### "Permission denied" ao criar cliente

**Solução:**
```bash
firebase deploy --only firestore:rules
```

### "Email já cadastrado"

**Solução:** Normal! Use outro email ou faça login com o existente.

---

## 📖 DOCUMENTAÇÃO COMPLETA

- **Setup Detalhado:** `FIREBASE_SETUP.md`
- **Guia de Integração:** `FIREBASE_INTEGRATION_GUIDE.md`
- **Uso dos Services:** `src/services/firebase/README.md`
- **Exemplos de Código:** `src/services/firebase/INTEGRATION_EXAMPLE.tsx`

---

## ✅ CHECKLIST

- [ ] Projeto Firebase criado
- [ ] Authentication ativado
- [ ] Firestore ativado
- [ ] Credenciais copiadas
- [ ] Arquivo .env configurado
- [ ] Rules deployadas
- [ ] Teste local funcionando
- [ ] Conta criada
- [ ] Login funcionando
- [ ] Console mostra "Firebase inicializado"

**Tudo OK? Parabéns! 🎉**

Seu ERP está rodando com Firebase!

---

**Tempo Total:** ~10 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)  
**Próximo Passo:** Começar a usar os hooks nas páginas
