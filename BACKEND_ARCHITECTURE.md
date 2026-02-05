# 🏗️ **ARQUITETURA DO BACKEND - GUIA TÉCNICO**

## **TIME 1: Setup e Implementação do Backend**

---

## 📋 **STACK TÉCNICA**

### **Core:**
- **Runtime:** Node.js 20+
- **Framework:** NestJS 10+ (arquitetura modular, DI nativo, decorators)
- **Linguagem:** TypeScript 5+
- **ORM:** Prisma 5+ (type-safe, migrations automáticas)
- **Banco:** PostgreSQL 15+

### **Autenticação:**
- **JWT:** `@nestjs/jwt` + `passport-jwt`
- **Hash:** `bcrypt`
- **Refresh Token:** armazenado no banco

### **Validação:**
- **class-validator** + **class-transformer** (decorators nos DTOs)

### **Documentação:**
- **Swagger:** `@nestjs/swagger` (OpenAPI 3.0)

### **Deploy:**
- **Containerização:** Docker + docker-compose
- **Process Manager:** PM2 (ou Kubernetes para escala)

---

## 🗂️ **ESTRUTURA DE PASTAS**

```
backend/
├── src/
│   ├── auth/                    # Módulo de autenticação
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── users/                   # Gestão de usuários
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── clientes/                # CRUD de Clientes
│   │   ├── clientes.controller.ts
│   │   ├── clientes.service.ts
│   │   ├── clientes.module.ts
│   │   └── dto/
│   │
│   ├── produtos/                # CRUD de Produtos/Modelos
│   │   ├── produtos.controller.ts
│   │   ├── produtos.service.ts
│   │   ├── produtos.module.ts
│   │   └── dto/
│   │
│   ├── materiais/               # Whitelist de materiais
│   │   ├── materiais.controller.ts
│   │   ├── materiais.service.ts
│   │   ├── materiais.module.ts
│   │   └── dto/
│   │
│   ├── orcamentos/              # Orçamentos
│   │   ├── orcamentos.controller.ts
│   │   ├── orcamentos.service.ts
│   │   ├── orcamentos.module.ts
│   │   └── dto/
│   │
│   ├── ordens-producao/         # Ordens de Produção
│   │   ├── ordens-producao.controller.ts
│   │   ├── ordens-producao.service.ts
│   │   ├── ordens-producao.module.ts
│   │   └── dto/
│   │
│   ├── estoque/                 # Estoque de materiais
│   │   ├── estoque.controller.ts
│   │   ├── estoque.service.ts
│   │   ├── estoque.module.ts
│   │   └── dto/
│   │
│   ├── compras/                 # Solicitações de compra
│   │   ├── compras.controller.ts
│   │   ├── compras.service.ts
│   │   ├── compras.module.ts
│   │   └── dto/
│   │
│   ├── auditoria/               # Logs de ações
│   │   ├── auditoria.controller.ts
│   │   ├── auditoria.service.ts
│   │   ├── auditoria.module.ts
│   │   └── dto/
│   │
│   ├── common/                  # Utilitários compartilhados
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   │
│   ├── prisma/                  # Prisma Client Service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── app.module.ts            # Módulo raiz
│   └── main.ts                  # Entry point
│
├── prisma/
│   ├── schema.prisma            # Schema do banco
│   ├── migrations/              # Migrations versionadas
│   └── seed.ts                  # Dados iniciais
│
├── test/                        # Testes E2E
├── .env.example                 # Variáveis de ambiente (exemplo)
├── .env                         # Variáveis de ambiente (local - gitignored)
├── docker-compose.yml           # PostgreSQL + App
├── Dockerfile                   # Build da aplicação
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ **SCHEMA DO BANCO (Prisma)**

### **prisma/schema.prisma:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// AUTENTICAÇÃO E USUÁRIOS
// ============================================================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  senha     String   // hash bcrypt
  nome      String
  role      Role     @default(Comercial)
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Permissões (se não usar RBAC complexo, pode ser um JSON)
  permissoes Json?

  // Refresh tokens
  refreshTokens RefreshToken[]

  // Auditoria
  acoesAuditoria AuditoriaLog[]

  @@map("users")
}

enum Role {
  Admin
  Comercial
  Engenharia
  Producao
  Compras
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}

// ============================================================================
// CLIENTES
// ============================================================================

model Cliente {
  id             String   @id @default(uuid())
  nome           String
  cpfCnpj        String?  @unique
  email          String?
  telefone       String?
  endereco       String?
  observacoes    String?
  ativo          Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relações
  orcamentos     Orcamento[]

  @@map("clientes")
}

// ============================================================================
// PRODUTOS (Modelos parametrizados)
// ============================================================================

model Produto {
  id          String   @id @default(uuid())
  codigo      String   @unique
  nome        String
  descricao   String?
  categoria   String   // Ex: "BANCADA_SIMPLES", "BANCADA_COM_CUBA"
  
  // Parâmetros do modelo (JSON com schema do modelo)
  parametros  Json     // Ex: { largura: 2000, profundidade: 600, ... }
  
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relações
  itensOrcamento ItemOrcamento[]

  @@map("produtos")
}

// ============================================================================
// MATERIAIS (Whitelist)
// ============================================================================

model Material {
  id          String   @id @default(uuid())
  codigo      String   @unique
  nome        String
  tipo        TipoMaterial
  unidade     String   // "m²", "m", "kg", "un"
  
  // Atributos específicos (JSON flexível)
  // Chapa: { largura, altura, espessura }
  // Tubo: { perfil, espessura, secao }
  atributos   Json
  
  // Custos
  precoUnitario Float  @default(0)
  
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relações
  estoque     EstoqueMaterial[]
  itemBOM     ItemBOM[]

  @@map("materiais")
}

enum TipoMaterial {
  CHAPA
  TUBO_QUADRADO
  TUBO_REDONDO
  CANTONEIRA
  PERFIL_U
  OUTRO
}

// ============================================================================
// ORÇAMENTOS
// ============================================================================

model Orcamento {
  id           String          @id @default(uuid())
  numero       String          @unique
  clienteId    String
  cliente      Cliente         @relation(fields: [clienteId], references: [id])
  
  status       StatusOrcamento @default(Rascunho)
  
  total        Float           @default(0)
  observacoes  String?
  
  dataEmissao  DateTime        @default(now())
  dataValidade DateTime?
  
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  // Relações
  itens        ItemOrcamento[]
  ordemProducao OrdemProducao?

  @@map("orcamentos")
}

enum StatusOrcamento {
  Rascunho
  Enviado
  Aprovado
  Rejeitado
  Convertido
}

model ItemOrcamento {
  id              String    @id @default(uuid())
  orcamentoId     String
  orcamento       Orcamento @relation(fields: [orcamentoId], references: [id], onDelete: Cascade)
  
  produtoId       String
  produto         Produto   @relation(fields: [produtoId], references: [id])
  
  descricao       String
  quantidade      Int
  unidade         String    @default("un")
  precoUnitario   Float
  subtotal        Float
  
  // Configuração específica (parametrização do modelo)
  configuracao    Json      // Ex: { largura: 2000, profundidade: 600, ... }
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("itens_orcamento")
}

// ============================================================================
// ORDENS DE PRODUÇÃO
// ============================================================================

model OrdemProducao {
  id              String        @id @default(uuid())
  numero          String        @unique
  orcamentoId     String        @unique
  orcamento       Orcamento     @relation(fields: [orcamentoId], references: [id])
  
  status          StatusOP      @default(Criada)
  
  dataInicio      DateTime?
  dataPrevisao    DateTime?
  dataConclusao   DateTime?
  
  observacoes     String?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relações
  bom             ItemBOM[]
  apontamentos    Apontamento[]
  solicitacoesCompra SolicitacaoCompra[]

  @@map("ordens_producao")
}

enum StatusOP {
  Criada
  Materiais_Separados
  Em_Producao
  Finalizada
  Cancelada
}

// ============================================================================
// BOM (Bill of Materials)
// ============================================================================

model ItemBOM {
  id              String         @id @default(uuid())
  ordemProducaoId String
  ordemProducao   OrdemProducao  @relation(fields: [ordemProducaoId], references: [id], onDelete: Cascade)
  
  materialId      String
  material        Material       @relation(fields: [materialId], references: [id])
  
  quantidade      Float
  unidade         String
  
  // Detalhes específicos (blank dimensions, etc)
  detalhes        Json?
  
  createdAt       DateTime       @default(now())

  @@map("bom")
}

// ============================================================================
// ESTOQUE
// ============================================================================

model EstoqueMaterial {
  id          String   @id @default(uuid())
  materialId  String
  material    Material @relation(fields: [materialId], references: [id])
  
  quantidade  Float    @default(0)
  unidade     String
  
  localidade  String?  @default("Fábrica Principal")
  
  estoqueMinimo Float  @default(0)
  estoqueMaximo Float? 
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relações
  movimentacoes MovimentacaoEstoque[]

  @@unique([materialId, localidade])
  @@map("estoque_materiais")
}

model MovimentacaoEstoque {
  id          String          @id @default(uuid())
  estoqueId   String
  estoque     EstoqueMaterial @relation(fields: [estoqueId], references: [id])
  
  tipo        TipoMovimentacao
  quantidade  Float
  
  origem      String?         // Ex: "Compra", "Produção", "Ajuste"
  referencia  String?         // Ex: ID da compra ou OP
  
  observacoes String?
  
  createdAt   DateTime        @default(now())

  @@map("movimentacoes_estoque")
}

enum TipoMovimentacao {
  ENTRADA
  SAIDA
  AJUSTE
}

// ============================================================================
// COMPRAS
// ============================================================================

model SolicitacaoCompra {
  id              String         @id @default(uuid())
  numero          String         @unique
  ordemProducaoId String?
  ordemProducao   OrdemProducao? @relation(fields: [ordemProducaoId], references: [id])
  
  status          StatusCompra   @default(Solicitada)
  
  dataSolicitacao DateTime       @default(now())
  dataAprovacao   DateTime?
  dataRecebimento DateTime?
  
  observacoes     String?
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  // Relações
  itens           ItemCompra[]

  @@map("solicitacoes_compra")
}

enum StatusCompra {
  Solicitada
  Aprovada
  Pedido_Enviado
  Recebida_Parcial
  Recebida_Total
  Cancelada
}

model ItemCompra {
  id                  String            @id @default(uuid())
  solicitacaoCompraId String
  solicitacaoCompra   SolicitacaoCompra @relation(fields: [solicitacaoCompraId], references: [id], onDelete: Cascade)
  
  materialDescricao   String            // Descrição do material
  quantidade          Float
  unidade             String
  
  createdAt           DateTime          @default(now())

  @@map("itens_compra")
}

// ============================================================================
// APONTAMENTO DE PRODUÇÃO
// ============================================================================

model Apontamento {
  id              String        @id @default(uuid())
  ordemProducaoId String
  ordemProducao   OrdemProducao @relation(fields: [ordemProducaoId], references: [id], onDelete: Cascade)
  
  etapa           String        // "Corte", "Dobra", "Solda", etc.
  operador        String
  
  dataInicio      DateTime
  dataFim         DateTime?
  
  observacoes     String?
  
  createdAt       DateTime      @default(now())

  @@map("apontamentos")
}

// ============================================================================
// AUDITORIA
// ============================================================================

model AuditoriaLog {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  
  acao       String   // "CREATE", "UPDATE", "DELETE"
  entidade   String   // "Orcamento", "OrdemProducao", etc.
  entidadeId String
  
  // Dados antes/depois (JSON)
  dadosAntes Json?
  dadosDepois Json?
  
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([entidade, entidadeId])
  @@map("auditoria_logs")
}
```

---

## 🔐 **AUTENTICAÇÃO JWT**

### **Fluxo:**

1. **Login:**
   - POST `/auth/login` com `{ email, senha }`
   - Backend valida credenciais
   - Retorna `{ accessToken, refreshToken, user }`

2. **Refresh Token:**
   - POST `/auth/refresh` com `{ refreshToken }`
   - Backend valida e gera novo `accessToken`

3. **Rotas Protegidas:**
   - Header: `Authorization: Bearer <accessToken>`
   - Guard `JwtAuthGuard` valida token

### **Exemplo de Controller:**

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }
}
```

---

## 🛡️ **RBAC (Role-Based Access Control)**

### **Decorator de Roles:**

```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### **Guard de Roles:**

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### **Uso:**

```typescript
@Post()
@Roles(Role.Admin, Role.Engenharia)
@UseGuards(JwtAuthGuard, RolesGuard)
async createMaterial(@Body() dto: CreateMaterialDto) {
  return this.materiaisService.create(dto);
}
```

---

## 📝 **AUDITORIA AUTOMÁTICA**

### **Interceptor de Auditoria:**

```typescript
// src/common/interceptors/audit.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditoriaService } from '../../auditoria/auditoria.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditoriaService: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, body } = request;

    return next.handle().pipe(
      tap((data) => {
        // Logar apenas operações de escrita
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          this.auditoriaService.log({
            userId: user?.id,
            acao: method,
            entidade: this.extractEntity(url),
            entidadeId: data?.id,
            dadosDepois: data,
          });
        }
      }),
    );
  }

  private extractEntity(url: string): string {
    // Extrair nome da entidade da URL
    // Ex: "/api/orcamentos/123" -> "Orcamento"
    const match = url.match(/\/api\/([^/]+)/);
    return match ? match[1] : 'Unknown';
  }
}
```

---

## 🚀 **ENDPOINTS PRINCIPAIS**

### **Autenticação:**
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Logout

### **Usuários:**
- `GET /users` - Listar usuários
- `GET /users/:id` - Detalhes de usuário
- `POST /users` - Criar usuário (Admin only)
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Desativar usuário

### **Clientes:**
- `GET /clientes` - Listar clientes
- `GET /clientes/:id` - Detalhes
- `POST /clientes` - Criar
- `PATCH /clientes/:id` - Atualizar
- `DELETE /clientes/:id` - Deletar

### **Produtos:**
- `GET /produtos` - Listar produtos
- `GET /produtos/:id` - Detalhes
- `POST /produtos` - Criar (Engenharia only)
- `PATCH /produtos/:id` - Atualizar (Engenharia only)
- `DELETE /produtos/:id` - Deletar (Admin only)

### **Materiais:**
- `GET /materiais` - Listar materiais
- `GET /materiais/:id` - Detalhes
- `POST /materiais` - Criar (Engenharia only)
- `PATCH /materiais/:id` - Atualizar (Engenharia only)

### **Orçamentos:**
- `GET /orcamentos` - Listar orçamentos
- `GET /orcamentos/:id` - Detalhes
- `POST /orcamentos` - Criar
- `PATCH /orcamentos/:id` - Atualizar
- `POST /orcamentos/:id/converter` - Converter em OP
- `PATCH /orcamentos/:id/status` - Atualizar status

### **Ordens de Produção:**
- `GET /ordens-producao` - Listar OPs
- `GET /ordens-producao/:id` - Detalhes
- `GET /ordens-producao/:id/bom` - BOM da OP
- `POST /ordens-producao/:id/apontamento` - Registrar apontamento
- `PATCH /ordens-producao/:id/status` - Atualizar status

### **Estoque:**
- `GET /estoque` - Listar estoque
- `GET /estoque/:materialId` - Detalhes de material
- `POST /estoque/verificar-disponibilidade` - Verificar se tem material
- `POST /estoque/movimentacao` - Registrar entrada/saída
- `GET /estoque/movimentacoes/:materialId` - Histórico

### **Compras:**
- `GET /compras` - Listar solicitações
- `GET /compras/:id` - Detalhes
- `POST /compras` - Criar solicitação
- `PATCH /compras/:id/status` - Atualizar status
- `POST /compras/:id/receber` - Receber compra (atualiza estoque)

### **Auditoria:**
- `GET /auditoria` - Listar logs
- `GET /auditoria/user/:userId` - Logs de um usuário
- `GET /auditoria/entidade/:entidade/:id` - Histórico de uma entidade

---

## 🐳 **DOCKER SETUP**

### **docker-compose.yml:**

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: erp_user
      POSTGRES_PASSWORD: erp_password
      POSTGRES_DB: erp_inox
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://erp_user:erp_password@db:5432/erp_inox
      JWT_SECRET: your-super-secret-jwt-key
      JWT_EXPIRATION: 15m
      JWT_REFRESH_EXPIRATION: 7d
    depends_on:
      - db
    volumes:
      - ./src:/app/src
    command: npm run start:dev

volumes:
  postgres_data:
```

### **Dockerfile:**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

---

## 📦 **VARIÁVEIS DE AMBIENTE**

### **.env.example:**

```env
# Database
DATABASE_URL="postgresql://erp_user:erp_password@localhost:5432/erp_inox"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"
```

---

## 🧪 **SEEDS (Dados Iniciais)**

### **prisma/seed.ts:**

```typescript
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: {
      email: 'admin@erp.com',
      senha: adminPassword,
      nome: 'Administrador',
      role: Role.Admin,
    },
  });

  console.log('✅ Usuário admin criado:', admin.email);

  // Criar materiais padrão (chapas)
  await prisma.material.createMany({
    data: [
      {
        codigo: 'CHAPA-2000-1250-0.8',
        nome: 'Chapa Inox 304 2000×1250 0.8mm',
        tipo: 'CHAPA',
        unidade: 'm²',
        atributos: { largura: 2000, altura: 1250, espessura: 0.8 },
        precoUnitario: 150.0,
      },
      {
        codigo: 'CHAPA-3000-1250-0.8',
        nome: 'Chapa Inox 304 3000×1250 0.8mm',
        tipo: 'CHAPA',
        unidade: 'm²',
        atributos: { largura: 3000, altura: 1250, espessura: 0.8 },
        precoUnitario: 220.0,
      },
    ],
  });

  console.log('✅ Materiais criados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Rodar seed:**
```bash
npx prisma db seed
```

---

## 🔥 **COMANDOS ÚTEIS**

### **Setup inicial:**
```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Rodar migrations
npx prisma migrate dev --name init

# Seed (dados iniciais)
npx prisma db seed

# Rodar em dev
npm run start:dev
```

### **Migrations:**
```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy
```

### **Prisma Studio (UI do banco):**
```bash
npx prisma studio
# Abre em http://localhost:5555
```

---

## 📊 **PRÓXIMOS PASSOS - TIME 1**

### **Semana 1:**
1. ✅ Setup do projeto NestJS
2. ✅ Configurar Prisma + PostgreSQL
3. ✅ Criar schema inicial
4. ✅ Implementar módulo de Auth (login/refresh)
5. ✅ Testar com Postman/Insomnia

### **Semana 2:**
1. ✅ CRUD de Clientes
2. ✅ CRUD de Produtos
3. ✅ CRUD de Materiais
4. ✅ Documentação Swagger

### **Semana 3:**
1. ✅ CRUD de Orçamentos
2. ✅ CRUD de Ordens de Produção
3. ✅ Implementar RBAC
4. ✅ Interceptor de Auditoria

### **Semana 4:**
1. ✅ CRUD de Estoque
2. ✅ CRUD de Compras
3. ✅ Testes E2E
4. ✅ Deploy em staging

---

## 🎯 **MÉTRICAS DE SUCESSO**

- ✅ Swagger documentado (100% dos endpoints)
- ✅ Testes E2E > 80% de cobertura
- ✅ Tempo de resposta < 200ms (p95)
- ✅ Zero erros não tratados
- ✅ Logs estruturados

---

**Bora construir esse backend! 🚀**
