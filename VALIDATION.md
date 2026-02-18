# Checklist de Validação

## Build e Testes

- [ ] `npm install` sem erros
- [ ] `npm run lint` sem erros
- [ ] `npm test` todos passando
- [ ] `npm run build` sucesso

## Engine

- [ ] `validateMaterial` rejeita material inválido
- [ ] `validateProcess` rejeita processo inválido
- [ ] `validateBOM` rejeita BOM sem itens
- [ ] `computeAreaMm2` calcula área corretamente
- [ ] `computeMassKg` calcula massa corretamente
- [ ] `nestGuillotine` otimiza chapas
- [ ] `calculateMaterialCost` usa preço correto
- [ ] `calculateProcessCost` calcula por modelo
- [ ] `calculatePricing` aplica margens
- [ ] `finalizeQuote` cria snapshot com hash

## Repositories

- [ ] `MaterialRepositoryFirestore` CRUD funciona
- [ ] `ProcessRepositoryFirestore` CRUD funciona
- [ ] Histórico de preços persiste

## UI

- [ ] Wizard navega entre etapas
- [ ] Materiais listados corretamente
- [ ] Processos listados corretamente
- [ ] Nesting visualizado
- [ ] Custos calculados
- [ ] Orçamento finalizado

## Segurança

- [ ] Firestore rules bloqueiam acesso não autorizado
- [ ] RBAC limita ações por role
- [ ] Snapshots são imutáveis

## Deploy

- [ ] Build de produção funciona
- [ ] Variáveis de ambiente configuradas
- [ ] Firebase conectado

---

## Instruções de Validação

### 1. Build e Testes

```bash
# Instalar dependências
npm install

# Verificar linting
npm run lint

# Executar testes
npm test

# Build de produção
npm run build
```

### 2. Engine

```bash
# Executar testes específicos da engine
npm test -- --grep "engine"

# Verificar coverage
npm run test:coverage -- --grep "engine"
```

### 3. Repositories

Para testar os repositories, é necessário um ambiente Firebase configurado:

1. Configure as credenciais Firebase em `.env.local`
2. Execute os testes de integração:
   ```bash
   npm run test:integration
   ```

### 4. UI

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Acesse `http://localhost:5173`
3. Navegue pelo wizard de orçamento
4. Verifique cada etapa

### 5. Segurança

1. Teste as regras Firestore localmente:
   ```bash
   firebase emulators:start
   npm run test:rules
   ```
2. Verifique se usuários sem permissão adequada são bloqueados

### 6. Deploy

#### Vercel

```bash
npm run build
vercel --prod
```

#### Firebase Hosting

```bash
npm run build
firebase deploy
```

---

## Critérios de Aceite

### Funcionalidades Core

| Funcionalidade | Critério | Status |
|----------------|----------|--------|
| Motor de Cálculo | Custo calculado corretamente | [ ] |
| Nesting | Aproveitamento > 80% | [ ] |
| Materiais | CRUD completo funcional | [ ] |
| Processos | CRUD completo funcional | [ ] |
| Orçamentos | Criação e finalização | [ ] |
| Auditoria | Rastreabilidade completa | [ ] |

### Performance

| Métrica | Meta | Status |
|---------|------|--------|
| Tempo de cálculo (BOM 50 itens) | < 500ms | [ ] |
| Tempo de nesting (20 peças) | < 2s | [ ] |
| Build de produção | < 60s | [ ] |
| Tempo de carregamento inicial | < 3s | [ ] |

### Qualidade

| Métrica | Meta | Status |
|---------|------|--------|
| Cobertura de testes | > 80% | [ ] |
| Linting | 0 erros | [ ] |
| TypeScript | 0 erros | [ ] |
| Acessibilidade | WCAG 2.1 AA | [ ] |

---

## Próximos Passos

Após validar todos os itens:

1. Documentar quaisquer desvios encontrados
2. Criar issues para correções necessárias
3. Atualizar versão no `package.json`
4. Criar tag de release
5. Fazer deploy em produção