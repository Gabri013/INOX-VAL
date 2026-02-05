# 🔧 Checklist de Implementação do Backend - ERP Inox

## 📋 Guia Completo para Qualquer Pessoa Implementar

Este documento é um guia passo a passo para implementar o backend do sistema ERP. **Está tudo documentado e pronto** - basta seguir as instruções!

---

## 🎯 OVERVIEW GERAL

### O que você vai criar:

✅ **API REST** em Node.js (Express) ou Python (FastAPI) ou qualquer linguagem  
✅ **Banco de Dados** PostgreSQL ou MySQL  
✅ **12 Endpoints de Produção** já definidos  
✅ **Autenticação** JWT  
✅ **Integração** com Omie (opcional)  

### Tempo estimado:

- **Backend básico:** 2-3 dias
- **Com Omie:** +1-2 dias
- **Deploy:** +1 dia

---

## 📊 PARTE 1: BANCO DE DADOS

### 1.1 - Escolher Banco de Dados

**Recomendado:** PostgreSQL 14+ (suporta JSON, performance, escalável)

**Alternativas:**
- MySQL 8+
- MongoDB (se preferir NoSQL)

### 1.2 - Criar Database

```sql
CREATE DATABASE erp_inox;
```

### 1.3 - Criar Tabelas Principais

**IMPORTANTE:** Os schemas estão todos definidos no arquivo `/DATABASE_SCHEMAS.md` (será criado a seguir)

#### Ordem de criação:

1. ✅ **usuarios** (já existe no auth)
2. ✅ **clientes**
3. ✅ **produtos**
4. ✅ **estoque**
5. ✅ **ordens_producao**
6. ✅ **ordens_producao_itens**
7. ✅ **materiais_necessarios**
8. ✅ **movimentacoes_setor**
9. ✅ **boms**
10. ✅ **auditoria**

---

## ⚙️ PARTE 2: API REST

### 2.1 - Setup do Projeto

#### Option A: Node.js + Express

```bash
mkdir erp-inox-backend
cd erp-inox-backend
npm init -y
npm install express cors dotenv pg sequelize bcrypt jsonwebtoken
npm install --save-dev nodemon typescript @types/node @types/express
```

#### Option B: Python + FastAPI

```bash
mkdir erp-inox-backend
cd erp-inox-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib python-dotenv
```

### 2.2 - Estrutura de Pastas

```
erp-inox-backend/
├── src/
│   ├── config/
│   │   └── database.js        # Configuração do banco
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Cliente.js
│   │   ├── Produto.js
│   │   ├── OrdemProducao.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clientes.js
│   │   ├── produtos.js
│   │   ├── producao.js        # 🔥 FOCO PRINCIPAL
│   │   └── ...
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── producaoController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── index.js               # Entry point
├── .env
├── package.json
└── README.md
```

### 2.3 - Arquivo .env

```.env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_inox
DB_USER=postgres
DB_PASSWORD=sua_senha

# API
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=seu_secret_super_seguro_aqui
JWT_EXPIRATION=24h

# Omie (opcional)
OMIE_APP_KEY=sua_chave_omie
OMIE_APP_SECRET=seu_secret_omie
```

---

## 🔐 PARTE 3: AUTENTICAÇÃO

### 3.1 - Endpoints de Auth

#### POST /api/auth/login
```javascript
// Request
{
  "email": "admin@empresa.com",
  "senha": "admin123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "1",
    "nome": "Admin",
    "email": "admin@empresa.com",
    "role": "Admin"
  }
}
```

#### POST /api/auth/refresh
```javascript
// Request
{
  "refreshToken": "..."
}

// Response
{
  "token": "novo_token..."
}
```

#### Middleware de Autenticação

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = authMiddleware;
```

---

## 🏭 PARTE 4: ENDPOINTS DE PRODUÇÃO (PRINCIPAL)

### 4.1 - Lista Completa de Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /producao/ordens | Listar ordens de produção |
| GET | /producao/ordens/:id | Buscar ordem específica |
| POST | /producao/ordens | Criar ordem de produção |
| GET | /producao/setores/:setor/itens | Itens por setor |
| POST | /producao/itens/:id/entrada | Dar entrada em setor |
| POST | /producao/itens/:id/saida | Dar saída de setor |
| PATCH | /producao/itens/:id/progresso | Atualizar progresso |
| GET | /producao/itens/:id/materiais | Consultar materiais |
| GET | /producao/dashboard | Dashboard de setores |
| GET | /producao/dashboard/:setor | Dashboard de setor específico |
| GET | /producao/itens/buscar | Buscar item por código/QR |
| POST | /producao/itens/:id/rejeitar | Rejeitar item |
| POST | /producao/itens/:id/pausar | Pausar item |
| POST | /producao/itens/:id/retomar | Retomar item |

### 4.2 - Implementação Detalhada

#### GET /producao/ordens

**Query Params:**
- `status` (opcional): Filtrar por status
- `prioridade` (opcional): Filtrar por prioridade
- `setor` (opcional): Filtrar por setor

**Response:**
```json
[
  {
    "id": "OP001",
    "clienteId": "CLI001",
    "clienteNome": "Restaurante Premium",
    "dataEmissao": "2026-02-01T10:00:00Z",
    "dataPrevisao": "2026-02-15T18:00:00Z",
    "status": "EmProducao",
    "prioridade": "Alta",
    "valorTotal": 15000.00,
    "itens": [
      {
        "id": "ITEM001",
        "produtoId": "PROD001",
        "produtoCodigo": "BANC-2000-700",
        "produtoNome": "Bancada Inox 2000x700mm",
        "quantidade": 2,
        "unidade": "UN",
        "status": "Em Producao",
        "setorAtual": "Corte",
        "progresso": 45,
        "iniciadoEm": "2026-02-02T08:00:00Z",
        "materiaisDisponiveis": true,
        "materiaisNecessarios": [
          {
            "produtoId": "MAT001",
            "produtoCodigo": "CHAPA-304-1.5",
            "produtoNome": "Chapa Inox 304 1,5mm",
            "quantidadeNecessaria": 2.5,
            "quantidadeDisponivel": 5.0,
            "faltante": 0,
            "unidade": "M2"
          }
        ]
      }
    ]
  }
]
```

#### POST /producao/itens/:id/entrada

**Request Body:**
```json
{
  "setor": "Corte",
  "observacoes": "Iniciando corte da chapa"
}
```

**Response:**
```json
{
  "id": "MOV001",
  "ordemItemId": "ITEM001",
  "setorOrigem": null,
  "setorDestino": "Corte",
  "operadorId": "USR001",
  "operadorNome": "João Silva",
  "dataHora": "2026-02-04T14:30:00Z",
  "observacoes": "Iniciando corte da chapa"
}
```

#### POST /producao/itens/:id/saida

**Request Body:**
```json
{
  "observacoes": "Corte concluído"
}
```

**Logic:**
1. Atualizar progresso do item para 100%
2. Determinar próximo setor automaticamente
3. Atualizar setorAtual para próximo ou null (se concluído)
4. Criar registro de movimentação
5. Se concluído, atualizar concluidoEm

**Sequência de Setores:**
```
Corte → Dobra → Solda → Acabamento → Montagem → Qualidade → Expedição → Concluído
```

#### GET /producao/dashboard

**Response:**
```json
[
  {
    "setor": "Corte",
    "itensAguardando": 3,
    "itensEmProducao": 2,
    "itensConcluidos": 15,
    "itensRejeitados": 1,
    "eficiencia": 87,
    "tempoMedioProducao": 45
  },
  {
    "setor": "Dobra",
    "itensAguardando": 2,
    "itensEmProducao": 1,
    "itensConcluidos": 12,
    "itensRejeitados": 0,
    "eficiencia": 92,
    "tempoMedioProducao": 30
  }
  // ... outros setores
]
```

### 4.3 - Controller Example (Node.js)

```javascript
// src/controllers/producaoController.js
const { OrdemProducao, OrdemProducaoItem, MovimentacaoSetor } = require('../models');

// GET /producao/itens/:id/entrada
exports.darEntrada = async (req, res) => {
  try {
    const { id } = req.params;
    const { setor, observacoes } = req.body;
    const { id: operadorId, nome: operadorNome } = req.user;

    // Buscar item
    const item = await OrdemProducaoItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Atualizar item
    item.setorAtual = setor;
    item.status = 'Em Producao';
    if (!item.iniciadoEm) {
      item.iniciadoEm = new Date();
    }
    await item.save();

    // Criar movimentação
    const movimentacao = await MovimentacaoSetor.create({
      ordemItemId: id,
      setorOrigem: null,
      setorDestino: setor,
      operadorId,
      operadorNome,
      dataHora: new Date(),
      observacoes,
    });

    res.json(movimentacao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao dar entrada' });
  }
};

// POST /producao/itens/:id/saida
exports.darSaida = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;
    const { id: operadorId, nome: operadorNome } = req.user;

    // Buscar item
    const item = await OrdemProducaoItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    const setorAtual = item.setorAtual;

    // Sequência de setores
    const sequencia = ['Corte', 'Dobra', 'Solda', 'Acabamento', 'Montagem', 'Qualidade', 'Expedicao'];
    const indexAtual = sequencia.indexOf(setorAtual);
    const proximoSetor = indexAtual < sequencia.length - 1 ? sequencia[indexAtual + 1] : null;

    // Atualizar item
    item.progresso = 100;
    if (proximoSetor) {
      item.setorAtual = proximoSetor;
      item.status = 'Aguardando';
    } else {
      item.setorAtual = null;
      item.status = 'Concluido';
      item.concluidoEm = new Date();
    }
    await item.save();

    // Criar movimentação
    const movimentacao = await MovimentacaoSetor.create({
      ordemItemId: id,
      setorOrigem: setorAtual,
      setorDestino: proximoSetor,
      operadorId,
      operadorNome,
      dataHora: new Date(),
      observacoes,
    });

    res.json(movimentacao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao dar saída' });
  }
};

// GET /producao/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const setores = ['Corte', 'Dobra', 'Solda', 'Acabamento', 'Montagem', 'Qualidade', 'Expedicao'];
    
    const dashboard = await Promise.all(
      setores.map(async (setor) => {
        const itensAguardando = await OrdemProducaoItem.count({
          where: { setorAtual: setor, status: 'Aguardando' }
        });
        
        const itensEmProducao = await OrdemProducaoItem.count({
          where: { setorAtual: setor, status: 'Em Producao' }
        });
        
        const itensConcluidos = await OrdemProducaoItem.count({
          where: { setorAtual: setor, status: 'Concluido' }
        });
        
        const itensRejeitados = await OrdemProducaoItem.count({
          where: { setorAtual: setor, status: 'Rejeitado' }
        });
        
        // Calcular eficiência e tempo médio (lógica simplificada)
        const total = itensAguardando + itensEmProducao + itensConcluidos;
        const eficiencia = total > 0 ? Math.round((itensConcluidos / total) * 100) : 0;
        const tempoMedioProducao = 45; // Calcular baseado em movimentações

        return {
          setor,
          itensAguardando,
          itensEmProducao,
          itensConcluidos,
          itensRejeitados,
          eficiencia,
          tempoMedioProducao,
        };
      })
    );

    res.json(dashboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
};
```

---

## 📦 PARTE 5: OUTROS ENDPOINTS

### 5.1 - Clientes

- `GET /api/clientes` - Listar
- `POST /api/clientes` - Criar
- `GET /api/clientes/:id` - Buscar
- `PUT /api/clientes/:id` - Atualizar
- `DELETE /api/clientes/:id` - Deletar

### 5.2 - Produtos

- `GET /api/produtos` - Listar
- `POST /api/produtos` - Criar
- `GET /api/produtos/:id` - Buscar
- `PUT /api/produtos/:id` - Atualizar
- `DELETE /api/produtos/:id` - Deletar

### 5.3 - Estoque

- `GET /api/estoque` - Listar itens
- `POST /api/estoque/movimentacao` - Registrar movimentação
- `GET /api/estoque/:produtoId` - Consultar disponibilidade

---

## 🔌 PARTE 6: CONECTAR FRONT-END

### 6.1 - Atualizar httpClient

No front-end, trocar de `mockClient` para `apiClient`:

```typescript
// src/services/http/index.ts
import { apiClient } from './apiClient';  // Em vez de mockClient

export const httpClient = apiClient;
```

### 6.2 - Criar apiClient

```typescript
// src/services/http/apiClient.ts
import axios from 'axios';
import { HttpClient, RequestConfig, PaginatedResponse } from './client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class ApiHttpClient implements HttpClient {
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await axiosInstance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await axiosInstance.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await axiosInstance.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiHttpClient();
```

### 6.3 - Variáveis de Ambiente (.env)

```env
# Front-end .env
VITE_API_URL=http://localhost:3001
```

---

## 🌐 PARTE 7: INTEGRAÇÃO COM OMIE (OPCIONAL)

### 7.1 - Endpoints Omie

**URL Base:** `https://app.omie.com.br/api/v1/`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

### 7.2 - Principais Chamadas

#### Listar Clientes

```javascript
const axios = require('axios');

async function listarClientesOmie() {
  const response = await axios.post('https://app.omie.com.br/api/v1/geral/clientes/', {
    call: 'ListarClientes',
    app_key: process.env.OMIE_APP_KEY,
    app_secret: process.env.OMIE_APP_SECRET,
    param: [{
      pagina: 1,
      registros_por_pagina: 50,
      apenas_importado_api: 'N'
    }]
  });
  
  return response.data;
}
```

#### Incluir Ordem de Produção

```javascript
async function incluirOrdemProducaoOmie(ordem) {
  const response = await axios.post('https://app.omie.com.br/api/v1/produtos/ordem/', {
    call: 'IncluirOrdemProducao',
    app_key: process.env.OMIE_APP_KEY,
    app_secret: process.env.OMIE_APP_SECRET,
    param: [{
      cCodIntOP: ordem.id,
      cNumOP: ordem.numero,
      dDtPrevisao: ordem.dataPrevisao,
      nQtdeOP: ordem.quantidade,
      produtos: ordem.itens.map(item => ({
        cCodProd: item.produtoCodigo,
        nQtde: item.quantidade,
      }))
    }]
  });
  
  return response.data;
}
```

### 7.3 - Sincronizar Consumo de Material

Após concluir um item, enviar consumo real para o Omie:

```javascript
async function sincronizarConsumoOmie(ordemItem) {
  const consumo = {
    ordemId: ordemItem.ordemId,
    produtoId: ordemItem.produtoId,
    quantidadeConsumida: ordemItem.quantidade,
    materiais: ordemItem.materiaisNecessarios.map(m => ({
      codigo: m.produtoCodigo,
      quantidadeConsumida: m.quantidadeNecessaria,
    }))
  };
  
  // Enviar para Omie
  await axios.post('https://app.omie.com.br/api/v1/estoque/movimento/', {
    call: 'IncluirMovimento',
    app_key: process.env.OMIE_APP_KEY,
    app_secret: process.env.OMIE_APP_SECRET,
    param: [consumo]
  });
}
```

---

## 🚀 PARTE 8: DEPLOY

### 8.1 - Backend (Node.js no Heroku/Railway/Render)

```bash
# 1. Criar conta no Railway/Render/Heroku

# 2. Instalar CLI
npm install -g railway  # ou render/heroku

# 3. Login
railway login

# 4. Criar projeto
railway init

# 5. Adicionar PostgreSQL
railway add postgresql

# 6. Deploy
railway up
```

### 8.2 - Banco de Dados (Railway/Render)

O Railway/Render já cria o PostgreSQL automaticamente.

**Rodar migrations:**
```bash
railway run npm run migrate
```

### 8.3 - Front-end (Vercel/Netlify)

```bash
# 1. Build do front
npm run build

# 2. Deploy no Vercel
npm i -g vercel
vercel --prod
```

**Configurar variável:**
- `VITE_API_URL` = URL do backend no Railway

---

## ✅ CHECKLIST FINAL

### Antes de Colocar em Produção

- [ ] Todos os endpoints testados no Postman/Insomnia
- [ ] Autenticação JWT funcionando
- [ ] Front-end conectado com backend
- [ ] Banco de dados com dados de teste
- [ ] Variáveis de ambiente configuradas
- [ ] CORS habilitado para front-end
- [ ] Tratamento de erros implementado
- [ ] Logs configurados
- [ ] Backup do banco configurado
- [ ] SSL/HTTPS habilitado (Render/Railway já fazem)
- [ ] Documentação da API criada (Swagger opcional)

### Testes Essenciais

- [ ] Login/Logout
- [ ] Criar Ordem de Produção
- [ ] Dar Entrada em Setor
- [ ] Dar Saída de Setor
- [ ] Consultar Materiais
- [ ] Dashboard TV atualizando
- [ ] Filtros funcionando
- [ ] Paginação funcionando

---

## 📚 RECURSOS ADICIONAIS

### Documentação

- **Express.js:** https://expressjs.com/
- **Sequelize ORM:** https://sequelize.org/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **JWT:** https://jwt.io/
- **Omie API:** https://developer.omie.com.br/

### Ferramentas Úteis

- **Postman:** Testar API
- **DBeaver:** Gerenciar banco de dados
- **Insomnia:** Alternativa ao Postman
- **Swagger:** Documentar API automaticamente

---

## 💡 DICAS IMPORTANTES

### Segurança

✅ **NUNCA** commitar `.env` no Git  
✅ Usar HTTPS em produção  
✅ Validar todos os inputs  
✅ Sanitizar queries SQL  
✅ Rate limiting nos endpoints  
✅ Logs de auditoria  

### Performance

✅ Índices no banco (id, clienteId, produtoId, ordemId)  
✅ Cache com Redis (opcional)  
✅ Paginação em todas as listagens  
✅ Compressão gzip  
✅ CDN para assets (Cloudflare)  

### Manutenção

✅ Versionamento da API (/api/v1/)  
✅ Migrations para mudanças no banco  
✅ Testes automatizados (Jest/Mocha)  
✅ CI/CD com GitHub Actions  
✅ Monitoramento (Sentry, LogRocket)  

---

## 🆘 TROUBLESHOOTING

### "Cannot connect to database"
- Verificar credenciais no .env
- Verificar se PostgreSQL está rodando
- Verificar firewall/porta 5432

### "CORS error"
- Adicionar origem do front no backend:
```javascript
app.use(cors({
  origin: 'https://seu-front.vercel.app',
  credentials: true
}));
```

### "Token invalid"
- Verificar se JWT_SECRET é o mesmo
- Verificar expiração do token
- Limpar localStorage no front

### "Slow queries"
- Adicionar índices no banco
- Usar EXPLAIN ANALYZE
- Otimizar JOINs

---

**Data:** 04/02/2026  
**Status:** ✅ PRONTO PARA IMPLEMENTAÇÃO  
**Próximos arquivos:** DATABASE_SCHEMAS.md e API_ENDPOINTS.md
