# ⚡ SETUP FIREBASE - GUIA RÁPIDO

**Tempo estimado:** 5-10 minutos

---

## 🎯 PASSO 1: Criar Projeto Firebase (2 minutos)

1. Acesse: https://console.firebase.google.com
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `erp-industrial-[sua-empresa]`
4. **Desabilite** Google Analytics (não é necessário)
5. Clique em **"Criar projeto"**
6. Aguarde a criação e clique em **"Continuar"**

---

## 🔐 PASSO 2: Ativar Authentication (1 minuto)

1. No menu lateral, clique em **Authentication**
2. Clique em **"Começar"**
3. Clique em **"Email/senha"**
4. **Ative** a primeira opção (Email/senha)
5. Clique em **"Salvar"**

✅ Pronto! Autenticação configurada.

---

## 💾 PASSO 3: Ativar Firestore (1 minuto)

1. No menu lateral, clique em **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Selecione **"Iniciar no modo de produção"**
4. Escolha o local: **southamerica-east1 (São Paulo)**
5. Clique em **"Ativar"**

✅ Pronto! Firestore configurado.

---

## 🔑 PASSO 4: Copiar Credenciais (2 minutos)

### 4.1 Obter credenciais do Firebase

1. No menu lateral, clique no **ícone de engrenagem ⚙️**
2. Clique em **"Configurações do projeto"**
3. Role até **"Seus apps"**
4. Clique no ícone **</> (Web)**
5. Nome do app: `ERP Industrial Web`
6. **NÃO** marque Firebase Hosting
7. Clique em **"Registrar app"**
8. Copie o objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "erp-industrial-123.firebaseapp.com",
  projectId: "erp-industrial-123",
  storageBucket: "erp-industrial-123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 4.2 Configurar arquivo .env

```bash
# 1. Copiar template
cp .env.example .env

# 2. Editar arquivo .env
nano .env  # ou code .env no VSCode
```

Preencha com as credenciais copiadas:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=erp-industrial-123.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=erp-industrial-123
VITE_FIREBASE_STORAGE_BUCKET=erp-industrial-123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

✅ Salve o arquivo!

---

## 🛡️ PASSO 5: Deploy das Security Rules (2 minutos)

```bash
# 1. Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# 2. Login no Firebase
firebase login

# 3. Inicializar projeto (apenas na primeira vez)
firebase init

# Selecione com ESPAÇO:
# [x] Firestore

# Use an existing project: erp-industrial-123

# Firestore Rules: firestore.rules (ENTER - usar padrão)
# Firestore Indexes: firestore.indexes.json (ENTER - usar padrão)

# 4. Deploy das Rules e Índices
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

**Saída esperada:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/erp-industrial-123/overview
```

✅ Pronto! Security Rules deployadas.

---

## 🧪 PASSO 6: Testar Localmente (2 minutos)

```bash
# 1. Rodar o projeto
npm run dev

# 2. Abrir navegador
# http://localhost:5173
```

### 6.1 Verificar inicialização

1. Abra o **Console do navegador** (F12)
2. Procure pela mensagem:

```
✅ Firebase inicializado com sucesso
```

✅ Se viu essa mensagem, Firebase está OK!

### 6.2 Testar autenticação

1. Acesse: http://localhost:5173/signup
2. Preencha:
   - Nome: **Teste Admin**
   - Email: **admin@teste.com**
   - Senha: **teste123**
   - Confirmar: **teste123**
3. Clique em **"Criar Conta"**

✅ Se viu "Conta criada com sucesso!" → Tudo funcionando!

### 6.3 Verificar no Firebase Console

1. Volte no Firebase Console
2. Vá em **Authentication** → **Users**
3. Você deve ver o usuário criado:

```
Email: admin@teste.com
User UID: abc123...
Created: há poucos segundos
```

✅ Perfeito! Tudo integrado.

---

## 🚀 PASSO 7: Deploy em Produção (Vercel)

### 7.1 Push para GitHub

```bash
git add .
git commit -m "feat: Firebase integration complete"
git push
```

### 7.2 Deploy na Vercel

1. Acesse: https://vercel.com
2. Clique em **"New Project"**
3. Importe seu repositório do GitHub
4. **Environment Variables:**
   - Adicione todas as variáveis do `.env`:

```
VITE_FIREBASE_API_KEY = AIza...
VITE_FIREBASE_AUTH_DOMAIN = erp-industrial-123.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = erp-industrial-123
VITE_FIREBASE_STORAGE_BUCKET = erp-industrial-123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789
VITE_FIREBASE_APP_ID = 1:123456789:web:abc123
```

5. Clique em **"Deploy"**

### 7.3 Autorizar domínio no Firebase

1. Após deploy na Vercel, copie a URL: `seu-erp.vercel.app`
2. Volte no **Firebase Console**
3. Vá em **Authentication** → **Settings** → **Authorized domains**
4. Clique em **"Add domain"**
5. Cole: `seu-erp.vercel.app`
6. Clique em **"Add"**

✅ Pronto! Sistema em produção.

---

## ✅ CHECKLIST FINAL

- [ ] Projeto Firebase criado
- [ ] Authentication ativado (Email/Senha)
- [ ] Firestore ativado
- [ ] Credenciais copiadas para `.env`
- [ ] Firebase CLI instalado
- [ ] Security Rules deployadas
- [ ] Índices deployados
- [ ] Teste local funcionando
- [ ] Usuário de teste criado
- [ ] Push para GitHub
- [ ] Deploy na Vercel
- [ ] Domínio autorizado no Firebase

---

## 🆘 PROBLEMAS COMUNS

### ❌ Erro: "Firebase não configurado"

**Solução:**
```bash
# Verificar se .env existe
cat .env

# Se não existir, copiar do example
cp .env.example .env
```

### ❌ Erro: "Permission denied"

**Solução:**
```bash
# Deploy das Rules novamente
firebase deploy --only firestore:rules
```

### ❌ Erro: "Missing index"

**Solução:**
```bash
# Deploy dos índices
firebase deploy --only firestore:indexes
```

### ❌ Erro: "Failed to get document"

**Solução:**
- Verificar se o usuário está autenticado
- Verificar no Firebase Console → Firestore se os dados existem

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **Revisão completa:** `/REVISAO_FIREBASE_COMPLETA.md`
- **Setup detalhado:** `/FIREBASE_SETUP.md`
- **Guia de integração:** `/FIREBASE_INTEGRATION_GUIDE.md`
- **Status do projeto:** `/FIREBASE_COMPLETE.md`

---

## 🎉 SUCESSO!

Se chegou até aqui sem erros, seu ERP Industrial está:

✅ Integrado com Firebase  
✅ Autenticação funcionando  
✅ Firestore configurado  
✅ Security Rules deployadas  
✅ Em produção na Vercel  

**Agora é só começar a usar! 🚀**

---

**Última Atualização:** 05/02/2026  
**Tempo Total:** 10 minutos  
**Dificuldade:** ⭐⭐ Fácil
