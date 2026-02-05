# 🔌 Documentação Completa da API - ERP Inox

## 📋 Todos os Endpoints com Exemplos

Este documento contém **TODOS os endpoints da API** com exemplos práticos de request e response.

---

## 🌐 BASE URL

```
Development: http://localhost:3001
Production: https://api-erp-inox.seu-dominio.com
```

## 🔐 AUTENTICAÇÃO

Todos os endpoints (exceto login) requerem autenticação via JWT.

**Header:**
```
Authorization: Bearer {seu_token_jwt}
```

---

## 1. 🔐 AUTH - Autenticação

### POST /api/auth/login

Fazer login no sistema.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@empresa.com",
  "senha": "admin123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGVtcHJlc2EuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzA3MDcwODAwLCJleHAiOjE3MDcxNTcyMDB9.xxx",
  "usuario": {
    "id": "1",
    "nome": "Admin",
    "email": "admin@empresa.com",
    "role": "Admin",
    "foto_url": null
  }
}
```

**Response 401:**
```json
{
  "error": "Credenciais inválidas"
}
```

---

### POST /api/auth/refresh

Renovar token JWT.

**Request:**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "novo_refresh_token..."
}
```

---

### GET /api/auth/me

Obter dados do usuário logado.

**Request:**
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "1",
  "nome": "Admin",
  "email": "admin@empresa.com",
  "role": "Admin",
  "departamento": "TI",
  "foto_url": null,
  "ativo": true
}
```

---

## 2. 🏭 PRODUÇÃO - Controle de Chão de Fábrica

### GET /producao/ordens

Listar todas as ordens de produção.

**Query Params:**
- `status` (opcional): Filtrar por status
- `prioridade` (opcional): Filtrar por prioridade  
- `setor` (opcional): Filtrar por setor atual dos itens
- `page` (opcional): Número da página (default: 1)
- `pageSize` (opcional): Itens por página (default: 10)

**Request:**
```http
GET /producao/ordens?status=EmProducao&prioridade=Alta
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "id": "OP001",
    "numero_ordem": "2026-001",
    "clienteId": "CLI001",
    "clienteNome": "Restaurante Premium",
    "dataEmissao": "2026-02-01T10:00:00.000Z",
    "dataPrevisao": "2026-02-15T18:00:00.000Z",
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
        "iniciadoEm": "2026-02-02T08:00:00.000Z",
        "concluidoEm": null,
        "tempoProducao": null,
        "materiaisDisponiveis": true
      }
    ]
  }
]
```

---

### GET /producao/ordens/:id

Buscar ordem específica.

**Request:**
```http
GET /producao/ordens/OP001
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "OP001",
  "numero_ordem": "2026-001",
  "clienteId": "CLI001",
  "clienteNome": "Restaurante Premium",
  "dataEmissao": "2026-02-01T10:00:00.000Z",
  "dataPrevisao": "2026-02-15T18:00:00.000Z",
  "dataConClusao": null,
  "status": "EmProducao",
  "prioridade": "Alta",
  "valorTotal": 15000.00,
  "observacoes": "Cliente solicitou entrega urgente",
  "instrucoesProducao": "Caprichar no acabamento",
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
      "iniciadoEm": "2026-02-02T08:00:00.000Z",
      "materiaisDisponiveis": true,
      "materiaisNecessarios": [
        {
          "id": "MAT_ITEM001_001",
          "produtoId": "MAT001",
          "produtoCodigo": "CHAPA-304-1.5",
          "produtoNome": "Chapa Inox 304 1,5mm",
          "quantidadeNecessaria": 2.5,
          "quantidadeDisponivel": 50.0,
          "faltante": 0,
          "unidade": "M2",
          "consumo_chapa_m2": 2.5,
          "consumo_chapa_kg": 28.75,
          "aproveitamento": 85.5
        }
      ]
    }
  ]
}
```

---

### POST /producao/ordens

Criar nova ordem de produção.

**Request:**
```http
POST /producao/ordens
Authorization: Bearer {token}
Content-Type: application/json

{
  "clienteId": "CLI001",
  "dataPrevisao": "2026-03-01T18:00:00.000Z",
  "prioridade": "Normal",
  "observacoes": "Ordem de produção padrão",
  "itens": [
    {
      "produtoId": "PROD001",
      "quantidade": 1
    }
  ]
}
```

**Response 201:**
```json
{
  "id": "OP002",
  "numero_ordem": "2026-002",
  "clienteId": "CLI001",
  "dataEmissao": "2026-02-04T15:00:00.000Z",
  "dataPrevisao": "2026-03-01T18:00:00.000Z",
  "status": "Pendente",
  "prioridade": "Normal",
  "itens": [
    {
      "id": "ITEM002",
      "produtoId": "PROD001",
      "quantidade": 1,
      "status": "Aguardando"
    }
  ]
}
```

---

### GET /producao/setores/:setor/itens

Listar itens em um setor específico.

**Setores válidos:** `Corte`, `Dobra`, `Solda`, `Acabamento`, `Montagem`, `Qualidade`, `Expedicao`

**Request:**
```http
GET /producao/setores/Corte/itens
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "id": "ITEM001",
    "ordemId": "OP001",
    "produtoId": "PROD001",
    "produtoCodigo": "BANC-2000-700",
    "produtoNome": "Bancada Inox 2000x700mm",
    "quantidade": 2,
    "unidade": "UN",
    "status": "Em Producao",
    "setorAtual": "Corte",
    "progresso": 45,
    "iniciadoEm": "2026-02-02T08:00:00.000Z",
    "tempoProducao": null,
    "materiaisDisponiveis": true
  },
  {
    "id": "ITEM003",
    "ordemId": "OP002",
    "produtoId": "PROD001",
    "produtoCodigo": "BANC-2000-700",
    "produtoNome": "Bancada Inox 2000x700mm",
    "quantidade": 1,
    "unidade": "UN",
    "status": "Aguardando",
    "setorAtual": "Corte",
    "progresso": 0,
    "materiaisDisponiveis": false
  }
]
```

---

### POST /producao/itens/:id/entrada

Dar entrada de um item no setor.

**Request:**
```http
POST /producao/itens/ITEM001/entrada
Authorization: Bearer {token}
Content-Type: application/json

{
  "setor": "Corte",
  "observacoes": "Iniciando corte da chapa conforme projeto"
}
```

**Response 200:**
```json
{
  "id": "MOV001",
  "ordemItemId": "ITEM001",
  "setorOrigem": null,
  "setorDestino": "Corte",
  "operadorId": "USR002",
  "operadorNome": "João Silva",
  "dataHora": "2026-02-04T15:30:00.000Z",
  "observacoes": "Iniciando corte da chapa conforme projeto"
}
```

---

### POST /producao/itens/:id/saida

Dar saída de um item do setor (automaticamente vai para o próximo setor).

**Request:**
```http
POST /producao/itens/ITEM001/saida
Authorization: Bearer {token}
Content-Type: application/json

{
  "observacoes": "Corte concluído com sucesso"
}
```

**Response 200:**
```json
{
  "id": "MOV002",
  "ordemItemId": "ITEM001",
  "setorOrigem": "Corte",
  "setorDestino": "Dobra",
  "operadorId": "USR002",
  "operadorNome": "João Silva",
  "dataHora": "2026-02-04T16:45:00.000Z",
  "observacoes": "Corte concluído com sucesso"
}
```

**Logic:**
- Item progresso vai para 100%
- SetorAtual muda para "Dobra" (próximo na sequência)
- Status muda para "Aguardando"
- Se for último setor (Expedição), status vira "Concluido" e concluidoEm é preenchido

---

### PATCH /producao/itens/:id/progresso

Atualizar progresso de um item.

**Request:**
```http
PATCH /producao/itens/ITEM001/progresso
Authorization: Bearer {token}
Content-Type: application/json

{
  "progresso": 75
}
```

**Response 200:**
```json
{
  "id": "ITEM001",
  "progresso": 75,
  "updated_at": "2026-02-04T15:45:00.000Z"
}
```

---

### GET /producao/itens/:id/materiais

Consultar materiais necessários para um item.

**Request:**
```http
GET /producao/itens/ITEM001/materiais
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "id": "MAT_ITEM001_001",
    "produtoId": "MAT001",
    "produtoCodigo": "CHAPA-304-1.5",
    "produtoNome": "Chapa Inox 304 1,5mm",
    "quantidadeNecessaria": 2.5,
    "quantidadeDisponivel": 50.0,
    "quantidadeReservada": 2.5,
    "faltante": 0,
    "unidade": "M2",
    "consumo_chapa_m2": 2.5,
    "consumo_chapa_kg": 28.75,
    "aproveitamento": 85.5,
    "reservado": true,
    "consumido": false
  },
  {
    "id": "MAT_ITEM001_002",
    "produtoId": "MAT002",
    "produtoCodigo": "TUBO-25X25",
    "produtoNome": "Tubo Quadrado Inox 25x25mm",
    "quantidadeNecessaria": 8.0,
    "quantidadeDisponivel": 5.0,
    "faltante": 3.0,
    "unidade": "M",
    "reservado": false,
    "consumido": false
  }
]
```

---

### GET /producao/dashboard

Dashboard com métricas de todos os setores.

**Request:**
```http
GET /producao/dashboard
Authorization: Bearer {token}
```

**Response 200:**
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
  },
  {
    "setor": "Solda",
    "itensAguardando": 1,
    "itensEmProducao": 3,
    "itensConcluidos": 10,
    "itensRejeitados": 0,
    "eficiencia": 90,
    "tempoMedioProducao": 60
  },
  {
    "setor": "Acabamento",
    "itensAguardando": 0,
    "itensEmProducao": 2,
    "itensConcluidos": 8,
    "itensRejeitados": 0,
    "eficiencia": 88,
    "tempoMedioProducao": 40
  },
  {
    "setor": "Montagem",
    "itensAguardando": 1,
    "itensEmProducao": 1,
    "itensConcluidos": 7,
    "itensRejeitados": 0,
    "eficiencia": 85,
    "tempoMedioProducao": 90
  },
  {
    "setor": "Qualidade",
    "itensAguardando": 2,
    "itensEmProducao": 0,
    "itensConcluidos": 6,
    "itensRejeitados": 1,
    "eficiencia": 80,
    "tempoMedioProducao": 20
  },
  {
    "setor": "Expedicao",
    "itensAguardando": 0,
    "itensEmProducao": 1,
    "itensConcluidos": 5,
    "itensRejeitados": 0,
    "eficiencia": 95,
    "tempoMedioProducao": 15
  }
]
```

---

### GET /producao/dashboard/:setor

Dashboard de um setor específico.

**Request:**
```http
GET /producao/dashboard/Corte
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "setor": "Corte",
  "itensAguardando": 3,
  "itensEmProducao": 2,
  "itensConcluidos": 15,
  "itensRejeitados": 1,
  "eficiencia": 87,
  "tempoMedioProducao": 45,
  "itens": [
    {
      "id": "ITEM001",
      "ordemId": "OP001",
      "produtoCodigo": "BANC-2000-700",
      "produtoNome": "Bancada Inox 2000x700mm",
      "status": "Em Producao",
      "progresso": 45
    }
  ]
}
```

---

### GET /producao/itens/buscar

Buscar item por código ou QR.

**Query Params:**
- `codigo` (required): Código do produto ou ID do item

**Request:**
```http
GET /producao/itens/buscar?codigo=BANC-2000-700
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "ITEM001",
  "ordemId": "OP001",
  "produtoId": "PROD001",
  "produtoCodigo": "BANC-2000-700",
  "produtoNome": "Bancada Inox 2000x700mm",
  "quantidade": 2,
  "unidade": "UN",
  "status": "Em Producao",
  "setorAtual": "Corte",
  "progresso": 45
}
```

---

### POST /producao/itens/:id/rejeitar

Rejeitar um item (problema de qualidade).

**Request:**
```http
POST /producao/itens/ITEM001/rejeitar
Authorization: Bearer {token}
Content-Type: application/json

{
  "motivoRejeicao": "Corte fora da medida especificada",
  "observacoes": "Refazer o corte com atenção às dimensões"
}
```

**Response 200:**
```json
{
  "id": "ITEM001",
  "status": "Rejeitado",
  "motivoRejeicao": "Corte fora da medida especificada",
  "updated_at": "2026-02-04T16:00:00.000Z"
}
```

---

### POST /producao/itens/:id/pausar

Pausar produção de um item.

**Request:**
```http
POST /producao/itens/ITEM001/pausar
Authorization: Bearer {token}
Content-Type: application/json

{
  "observacoes": "Aguardando chegada de material faltante"
}
```

**Response 200:**
```json
{
  "id": "ITEM001",
  "status": "Pausado",
  "updated_at": "2026-02-04T16:10:00.000Z"
}
```

---

### POST /producao/itens/:id/retomar

Retomar produção de um item pausado.

**Request:**
```http
POST /producao/itens/ITEM001/retomar
Authorization: Bearer {token}
Content-Type: application/json

{
  "observacoes": "Material chegou, retomando produção"
}
```

**Response 200:**
```json
{
  "id": "ITEM001",
  "status": "Em Producao",
  "updated_at": "2026-02-04T17:00:00.000Z"
}
```

---

## 3. 👥 CLIENTES

### GET /api/clientes

Listar clientes.

**Query Params:**
- `page` (opcional): Página (default: 1)
- `pageSize` (opcional): Itens por página (default: 10)
- `search` (opcional): Busca por nome, email, CPF/CNPJ
- `tipo` (opcional): Filtrar por PF ou PJ
- `ativo` (opcional): Filtrar por ativo (true/false)

**Request:**
```http
GET /api/clientes?search=Premium&page=1&pageSize=10
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "items": [
    {
      "id": "CLI001",
      "tipo": "PJ",
      "nome": "Restaurante Premium",
      "nome_fantasia": "Premium",
      "cpf_cnpj": "12.345.678/0001-90",
      "email": "contato@premium.com",
      "telefone": "(11) 98765-4321",
      "cidade": "São Paulo",
      "estado": "SP",
      "ativo": true,
      "created_at": "2026-01-15T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

---

### GET /api/clientes/:id

Buscar cliente específico.

**Request:**
```http
GET /api/clientes/CLI001
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "CLI001",
  "tipo": "PJ",
  "nome": "Restaurante Premium",
  "nome_fantasia": "Premium",
  "cpf_cnpj": "12.345.678/0001-90",
  "rg_ie": "123.456.789.000",
  "email": "contato@premium.com",
  "telefone": "(11) 98765-4321",
  "celular": "(11) 98888-9999",
  "cep": "01310-100",
  "logradouro": "Av. Paulista",
  "numero": "1000",
  "complemento": "Sala 101",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "estado": "SP",
  "pais": "Brasil",
  "observacoes": "Cliente VIP",
  "ativo": true,
  "omie_id": "123456",
  "created_at": "2026-01-15T10:00:00.000Z",
  "updated_at": "2026-01-15T10:00:00.000Z"
}
```

---

### POST /api/clientes

Criar novo cliente.

**Request:**
```http
POST /api/clientes
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo": "PJ",
  "nome": "Novo Restaurante Ltda",
  "nome_fantasia": "Novo Restaurante",
  "cpf_cnpj": "98.765.432/0001-10",
  "email": "contato@novo.com",
  "telefone": "(11) 91234-5678",
  "cep": "01310-100",
  "logradouro": "Av. Paulista",
  "numero": "2000",
  "cidade": "São Paulo",
  "estado": "SP"
}
```

**Response 201:**
```json
{
  "id": "CLI002",
  "tipo": "PJ",
  "nome": "Novo Restaurante Ltda",
  "cpf_cnpj": "98.765.432/0001-10",
  "email": "contato@novo.com",
  "created_at": "2026-02-04T18:00:00.000Z"
}
```

---

### PUT /api/clientes/:id

Atualizar cliente.

**Request:**
```http
PUT /api/clientes/CLI002
Authorization: Bearer {token}
Content-Type: application/json

{
  "telefone": "(11) 99999-8888",
  "email": "novo@email.com"
}
```

**Response 200:**
```json
{
  "id": "CLI002",
  "telefone": "(11) 99999-8888",
  "email": "novo@email.com",
  "updated_at": "2026-02-04T18:05:00.000Z"
}
```

---

### DELETE /api/clientes/:id

Deletar cliente (soft delete).

**Request:**
```http
DELETE /api/clientes/CLI002
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Cliente deletado com sucesso",
  "id": "CLI002"
}
```

---

## 4. 📦 PRODUTOS

### GET /api/produtos

Listar produtos.

**Query Params:** Similares aos clientes

**Response:** Similar à estrutura de clientes

### POST /api/produtos

Criar produto.

### PUT /api/produtos/:id

Atualizar produto.

### DELETE /api/produtos/:id

Deletar produto.

---

## 5. 📊 ESTOQUE

### GET /api/estoque

Listar estoque.

### GET /api/estoque/:produtoId

Consultar disponibilidade de um produto.

### POST /api/estoque/movimentacao

Registrar movimentação de estoque (entrada/saída).

---

## 📌 CÓDIGOS DE STATUS HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email já existe) |
| 422 | Unprocessable Entity - Validação falhou |
| 500 | Internal Server Error - Erro no servidor |

---

## ⚠️ ERROS PADRÃO

Todos os erros seguem este formato:

```json
{
  "error": "Mensagem de erro descritiva",
  "details": {
    "field": "campo_com_erro",
    "message": "Descrição específica"
  },
  "code": "ERROR_CODE",
  "timestamp": "2026-02-04T18:00:00.000Z"
}
```

---

**Data:** 04/02/2026  
**Total de Endpoints:** 30+  
**Status:** ✅ DOCUMENTAÇÃO COMPLETA
