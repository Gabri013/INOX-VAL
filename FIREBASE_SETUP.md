# 🔥 GUIA COMPLETO DE SETUP FIREBASE - ERP INDUSTRIAL

Este guia detalha todos os passos para configurar o Firebase no projeto ERP Industrial, desde a criação do projeto até o deploy das regras de segurança.

---

## 📋 PRÉ-REQUISITOS

- [ ] Node.js 18+ instalado
- [ ] Conta Google
- [ ] Firebase CLI instalado (`npm install -g firebase-tools`)
- [ ] Acesso ao projeto (você será o owner)

---

## 🚀 PASSO 1: CRIAR PROJETO FIREBASE

### 1.1 Acessar Firebase Console

1. Acesse https://console.firebase.google.com
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `erp-industrial-[sua-empresa]`
4. Aceite os termos
5. **Desabilite Google Analytics** (opcional para ERP interno)
6. Clique em **"Criar projeto"**

### 1.2 Aguarde a Criação

O Firebase levará alguns segundos para provisionar os recursos.

---

## 🔐 PASSO 2: CONFIGURAR AUTHENTICATION

### 2.1 Ativar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Na aba **"Sign-in method"**, clique em **"Email/Senha"**
4. **Ative** a opção "Email/Senha"
5. **NÃO** ative "Link de email (login sem senha)" por enquanto
6. Clique em **"Salvar"**

### 2.2 Criar Primeiro Usuário (Opcional)

1. Vá para aba **"Users"**
2. Clique em **"Adicionar usuário"**
3. Email: `admin@suaempresa.com`
4. Senha: `SenhaSegura123!`
5. Clique em **"Adicionar usuário"**

---

## 🗄️ PASSO 3: CONFIGURAR FIRESTORE DATABASE

### 3.1 Criar Banco Firestore

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha o modo:
   - **Produção**: Para deploy real (recomendado)
   - **Teste**: Para desenvolvimento (NÃO recomendado para produção)
4. Escolha o **location**:
   - `southamerica-east1` (São Paulo) - Recomendado para Brasil
   - `us-central1` (Iowa) - Alternativa mais barata
5. Clique em **"Ativar"**

### 3.2 Aguarde a Criação

O Firestore levará alguns segundos para ser provisionado.

---

## 🔑 PASSO 4: OBTER CREDENCIAIS

### 4.1 Adicionar App Web

1. No **Visão Geral do Projeto** (ícone ⚙️ ao lado de "Visão geral do projeto")
2. Clique em **"Adicionar app"**
3. Selecione **Web** (ícone `</>`)
4. Nome do app: `ERP Industrial Web`
5. **NÃO** marque "Firebase Hosting"
6. Clique em **"Registrar app"**

### 4.2 Copiar Configuração

Você verá um código assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**COPIE ESSES VALORES!** Você precisará deles no próximo passo.

---

## 📄 PASSO 5: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 5.1 Criar Arquivo `.env`

Na raiz do projeto, crie o arquivo `.env`:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Opcional: Emuladores (desenvolvimento)
VITE_USE_FIREBASE_EMULATORS=false
VITE_FIREBASE_ENABLE_PERSISTENCE=true
```

### 5.2 Adicionar `.env` ao `.gitignore`

**IMPORTANTE:** Nunca faça commit do arquivo `.env`!

Adicione ao `.gitignore`:

```
# Environment variables
.env
.env.local
.env.production
```

---

## 🛡️ PASSO 6: CONFIGURAR FIRESTORE SECURITY RULES

### 6.1 Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 6.2 Login no Firebase

```bash
firebase login
```

Siga as instruções para autenticar.

### 6.3 Inicializar Firebase no Projeto

```bash
firebase init
```

Selecione:
- [x] Firestore
- [ ] Functions (não necessário por enquanto)
- [ ] Hosting (não necessário por enquanto)

Quando perguntar:
- **Project Setup:** Use an existing project → Selecione seu projeto
- **Firestore Rules:** Use `firestore.rules` (arquivo já existe)
- **Firestore Indexes:** Use `firestore.indexes.json` (aceite o padrão)

### 6.4 Deploy das Rules

```bash
firebase deploy --only firestore:rules
```

Você verá:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/seu-projeto/overview
```

---

## 🔍 PASSO 7: CRIAR ÍNDICES FIRESTORE

Alguns queries complexos precisam de índices. Crie o arquivo `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "orcamentos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tenantId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "data", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "ordens_producao",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tenantId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dataAbertura", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "clientes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tenantId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "nome", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy dos índices:

```bash
firebase deploy --only firestore:indexes
```

---

## ✅ PASSO 8: TESTAR CONEXÃO

### 8.1 Rodar o Projeto

```bash
npm run dev
```

### 8.2 Verificar Logs

Abra o console do navegador (F12). Você deve ver:

```
✅ Firebase inicializado com sucesso
```

Se ver erro:

```
❌ Firebase: Variável apiKey não configurada
```

Verifique o arquivo `.env`.

### 8.3 Testar CRUD Básico

Crie um cliente de teste via UI ou via console:

```javascript
import { clientesService } from '@/services/firebase/clientes.service';

const result = await clientesService.create({
  nome: 'Cliente Teste',
  cnpj: '12345678901234',
  email: 'teste@exemplo.com',
  telefone: '11987654321',
  cidade: 'São Paulo',
  estado: 'SP',
  status: 'Ativo',
  totalCompras: 0,
  criadoEm: new Date().toISOString(),
  atualizadoEm: new Date().toISOString(),
});

console.log('Cliente criado:', result);
```

---

## 🚀 PASSO 9: DEPLOY NA VERCEL

### 9.1 Conectar Repositório

1. Acesse https://vercel.com
2. Clique em **"New Project"**
3. Importe seu repositório GitHub
4. Vercel detectará automaticamente Vite

### 9.2 Configurar Variáveis de Ambiente

Na aba **"Environment Variables"**, adicione:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 9.3 Deploy

Clique em **"Deploy"**.

### 9.4 Autorizar Domínio no Firebase

1. Volte ao Firebase Console
2. **Authentication** → **Settings** → **Authorized domains**
3. Adicione o domínio da Vercel (ex: `seu-app.vercel.app`)

---

## 🔒 PASSO 10: CONFIGURAR MULTI-TENANT (OPCIONAL)

Para isolar dados por empresa:

### 10.1 Criar Custom Claims

No Firebase Console, vá em **Authentication** → **Users** → Selecione um usuário → **Edit user**.

Adicione custom claim (via Firebase Admin SDK ou console):

```javascript
admin.auth().setCustomUserClaims(uid, { tenantId: 'empresa-abc-001' });
```

### 10.2 Atualizar Security Rules

As rules já estão preparadas para multi-tenant. Descomente a linha no `firestore.rules`:

```javascript
function getTenantId() {
  // return request.auth.uid; // REMOVA ESTA LINHA
  return request.auth.token.tenantId; // USE CUSTOM CLAIM
}
```

---

## 📊 PASSO 11: MONITORAMENTO (RECOMENDADO)

### 11.1 Ativar Performance Monitoring

```bash
npm install firebase/performance
```

### 11.2 Configurar Alerts

No Firebase Console:
- **Performance** → Configure alerts para latência
- **Firestore** → Configure quotas e alerts

---

## 🐛 TROUBLESHOOTING

### Erro: "Firebase não configurado"

- Verifique se o arquivo `.env` existe
- Verifique se as variáveis começam com `VITE_`
- Reinicie o servidor Vite

### Erro: "Permission denied"

- Verifique se fez login (`firebase login`)
- Verifique se deployou as rules (`firebase deploy --only firestore:rules`)
- Verifique se o usuário está autenticado no app

### Erro: "Missing or insufficient permissions"

- Verifique as Firestore Security Rules
- Verifique se o `tenantId` está correto
- Verifique os logs no Firebase Console → Firestore → Rules

---

## 📚 PRÓXIMOS PASSOS

Após completar o setup:

- [ ] Criar usuários no Authentication
- [ ] Testar CRUD de clientes
- [ ] Testar criação de orçamentos
- [ ] Testar conversão de orçamento → OP
- [ ] Configurar backup automático do Firestore
- [ ] Configurar monitoramento de custos
- [ ] Implementar auditoria completa

---

## 🆘 SUPORTE

- **Firebase Docs:** https://firebase.google.com/docs
- **Firestore Rules:** https://firebase.google.com/docs/firestore/security/get-started
- **Vercel Docs:** https://vercel.com/docs

---

**Última Atualização:** 05/02/2026  
**Versão:** 1.0
