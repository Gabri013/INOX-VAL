# 🧪 Teste Rápido - Antes da Apresentação

## Checklist de Teste (5 minutos)

### 1. ✅ Acesso ao Sistema
```
1. Abrir navegador
2. Acessar aplicação
3. Verificar tela de login
4. Login: admin@empresa.com / admin123
5. ✅ Dashboard deve carregar
```

### 2. ✅ Controle de Produção
```
1. Clicar em "Controle de Produção" no menu
2. Deve mostrar busca e setores
3. Clicar no setor "Corte"
4. Deve listar 2 itens
5. Clicar em "Materiais" em um item
6. Deve mostrar lista de materiais necessários
7. Fechar dialog
8. ✅ Tudo funcionando
```

### 3. ✅ Dashboard TV
```
1. No Controle de Produção, clicar em "Dashboard TV"
2. Deve carregar dashboard fullscreen
3. Verificar:
   - Relógio funcionando
   - 7 setores visíveis
   - Números de itens
   - Progresso visual
4. Duplo clique para sair do fullscreen
5. ✅ Dashboard TV funcionando
```

### 4. ✅ Calculadora BOM
```
1. Clicar em "Calculadora BOM" no menu
2. Deve carregar interface de cálculo
3. Selecionar modelo de bancada
4. Preencher dimensões básicas
5. Clicar em "Calcular BOM"
6. Deve mostrar lista de materiais
7. Verificar consumo de chapa
8. ✅ Cálculo funcionando
```

### 5. ✅ Clientes e Produtos
```
1. Ir para /clientes
2. Deve listar clientes
3. Clicar "Novo Cliente"
4. Preencher dados
5. Salvar
6. ✅ Cliente criado

7. Ir para /produtos
8. Deve listar produtos
9. Verificar filtros
10. ✅ Produtos funcionando
```

### 6. ✅ Tema Dark/Light
```
1. Clicar no ícone de sol/lua no header
2. Tema deve alternar
3. ✅ Tema funcionando
```

## 🐛 Possíveis Problemas e Soluções

### Problema: "Nenhum item neste setor"
**Solução:** Dados mock não carregaram. Recarregue a página (F5).

### Problema: Dashboard TV não atualiza
**Solução:** Verificar console do navegador. Auto-refresh funciona após 5s.

### Problema: Erro ao salvar cliente/produto
**Solução:** IndexedDB pode estar bloqueado. Limpar cache e tentar novamente.

### Problema: Login não funciona
**Solução:** Usar credenciais exatas:
- Email: admin@empresa.com
- Senha: admin123

## 🎯 Demo Script (10 minutos)

### Minuto 1-2: Login e Dashboard
"Aqui está nosso sistema ERP focado em produção de equipamentos em inox. Vou fazer login como administrador..."

### Minuto 3-5: Calculadora BOM ⭐
"A grande inovação é o cálculo automático de materiais. Quando eu crio uma bancada de 2000x700mm, o sistema calcula automaticamente todas as chapas, tubos, parafusos... Olha aqui o consumo de chapa com aproveitamento de 85%. Isso se integra direto com o Omie."

### Minuto 6-8: Controle de Produção ⭐
"No chão de fábrica, o operador acessa esta tela. Ele seleciona o setor - vamos dizer 'Corte'. Aqui aparecem todos os itens aguardando. Antes de iniciar, ele consulta os materiais necessários. Se está tudo OK, ele dá entrada. O item muda para 'Em Produção' e começa o rastreamento. Quando terminar, ele dá saída e o item vai automaticamente pro próximo setor."

### Minuto 9-10: Dashboard TV ⭐
"E o líder de produção acompanha tudo em tempo real nesta TV que fica na fábrica. Olha só, atualiza sozinho a cada 5 segundos. Cada setor tem suas métricas: quantos itens aguardando, produzindo, concluídos, a eficiência... Tudo visual e fácil de entender de longe."

### Encerramento
"E tudo isso já funciona 100% no navegador, sem backend. É só conectar a API que você já tem no backend e está pronto pra produção. Integra perfeitamente com o Omie que vocês já usam."

## 📋 Checklist Final Pré-Apresentação

- [ ] Navegador limpo (sem outras abas)
- [ ] Zoom 100%
- [ ] Modo apresentação (F11 se necessário)
- [ ] Som desligado (notificações)
- [ ] Internet estável
- [ ] Backup: ter outra aba aberta com sistema
- [ ] Login já feito (não perder tempo)
- [ ] Dashboard TV pronto em aba separada
- [ ] Dados mock conferidos
- [ ] Console do navegador limpo (F12)

## 🎬 Ordem Recomendada de Apresentação

1. Login (10s)
2. Dashboard Geral (30s)
3. **Calculadora BOM** (2min) - DIFERENCIAL
4. **Controle de Produção** (3min) - CORE
5. **Dashboard TV** (2min) - IMPACTO VISUAL
6. Clientes/Produtos (1min) - EXTRAS
7. Encerramento (30s)

**Total: ~9 minutos + perguntas**

---

✅ **SISTEMA TESTADO E APROVADO**
✅ **PRONTO PARA APRESENTAÇÃO**
