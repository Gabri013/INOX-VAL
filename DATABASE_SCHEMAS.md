# 🗄️ Schemas do Banco de Dados - ERP Inox

## 📋 Tabelas do Sistema

Este documento contém **TODOS os schemas** necessários para criar o banco de dados.  
Copie e cole no seu gerenciador de banco (DBeaver, pgAdmin, etc.)

---

## 🔐 1. USUÁRIOS E AUTENTICAÇÃO

### Tabela: `usuarios`

```sql
CREATE TABLE usuarios (
  id VARCHAR(50) PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Engenharia', 'Producao', 'Comercial')),
  ativo BOOLEAN DEFAULT true,
  foto_url VARCHAR(500),
  telefone VARCHAR(20),
  departamento VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role ON usuarios(role);

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO usuarios (id, nome, email, senha_hash, role) VALUES
('1', 'Admin', 'admin@empresa.com', '$2b$10$xxxxxxxxxxx', 'Admin');
-- NOTA: Gerar senha_hash com bcrypt no backend
```

---

## 👥 2. CLIENTES

### Tabela: `clientes`

```sql
CREATE TABLE clientes (
  id VARCHAR(50) PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PF', 'PJ')),
  
  -- Dados básicos
  nome VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  cpf_cnpj VARCHAR(20) UNIQUE,
  rg_ie VARCHAR(30),
  
  -- Contato
  email VARCHAR(200),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  
  -- Endereço
  cep VARCHAR(10),
  logradouro VARCHAR(200),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  pais VARCHAR(100) DEFAULT 'Brasil',
  
  -- Outros
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  -- Integração Omie
  omie_id VARCHAR(50),
  omie_codigo VARCHAR(50),
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) REFERENCES usuarios(id),
  updated_by VARCHAR(50) REFERENCES usuarios(id)
);

CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);
CREATE INDEX idx_clientes_omie_id ON clientes(omie_id);
```

---

## 📦 3. PRODUTOS

### Tabela: `produtos`

```sql
CREATE TABLE produtos (
  id VARCHAR(50) PRIMARY KEY,
  codigo VARCHAR(100) UNIQUE NOT NULL,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  
  -- Classificação
  categoria VARCHAR(100) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  unidade VARCHAR(10) NOT NULL DEFAULT 'UN',
  
  -- Dimensões
  comprimento DECIMAL(10,2),
  largura DECIMAL(10,2),
  altura DECIMAL(10,2),
  peso DECIMAL(10,3),
  
  -- Valores
  preco_custo DECIMAL(10,2),
  preco_venda DECIMAL(10,2),
  margem_lucro DECIMAL(5,2),
  
  -- Estoque
  estoque_minimo DECIMAL(10,2) DEFAULT 0,
  estoque_maximo DECIMAL(10,2),
  controla_estoque BOOLEAN DEFAULT true,
  
  -- Produção
  tempo_producao_estimado INTEGER, -- em minutos
  eh_materia_prima BOOLEAN DEFAULT false,
  eh_produto_acabado BOOLEAN DEFAULT true,
  
  -- Outros
  ativo BOOLEAN DEFAULT true,
  imagem_url VARCHAR(500),
  ncm VARCHAR(20),
  
  -- Integração Omie
  omie_id VARCHAR(50),
  omie_codigo VARCHAR(50),
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) REFERENCES usuarios(id),
  updated_by VARCHAR(50) REFERENCES usuarios(id)
);

CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_tipo ON produtos(tipo);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);
CREATE INDEX idx_produtos_materia_prima ON produtos(eh_materia_prima);
CREATE INDEX idx_produtos_omie_id ON produtos(omie_id);
```

---

## 📊 4. ESTOQUE

### Tabela: `estoque`

```sql
CREATE TABLE estoque (
  id VARCHAR(50) PRIMARY KEY,
  produto_id VARCHAR(50) NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  
  quantidade_atual DECIMAL(10,3) NOT NULL DEFAULT 0,
  quantidade_reservada DECIMAL(10,3) DEFAULT 0,
  quantidade_disponivel DECIMAL(10,3) GENERATED ALWAYS AS (quantidade_atual - quantidade_reservada) STORED,
  
  localizacao VARCHAR(100),
  lote VARCHAR(50),
  validade DATE,
  
  ultima_entrada TIMESTAMP,
  ultima_saida TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_estoque_produto ON estoque(produto_id);
CREATE INDEX idx_estoque_disponivel ON estoque(quantidade_disponivel);
```

### Tabela: `movimentos_estoque`

```sql
CREATE TABLE movimentos_estoque (
  id VARCHAR(50) PRIMARY KEY,
  produto_id VARCHAR(50) NOT NULL REFERENCES produtos(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Entrada', 'Saida', 'Ajuste', 'Reserva', 'Cancelamento')),
  
  quantidade DECIMAL(10,3) NOT NULL,
  quantidade_anterior DECIMAL(10,3),
  quantidade_posterior DECIMAL(10,3),
  
  motivo VARCHAR(100),
  observacoes TEXT,
  documento_referencia VARCHAR(100), -- NF, OP, etc
  
  data_movimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id VARCHAR(50) REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movimentos_produto ON movimentos_estoque(produto_id);
CREATE INDEX idx_movimentos_tipo ON movimentos_estoque(tipo);
CREATE INDEX idx_movimentos_data ON movimentos_estoque(data_movimento);
```

---

## 🏭 5. ORDENS DE PRODUÇÃO (PRINCIPAL)

### Tabela: `ordens_producao`

```sql
CREATE TABLE ordens_producao (
  id VARCHAR(50) PRIMARY KEY,
  numero_ordem VARCHAR(50) UNIQUE NOT NULL,
  
  cliente_id VARCHAR(50) REFERENCES clientes(id),
  cliente_nome VARCHAR(200),
  
  data_emissao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_previsao TIMESTAMP NOT NULL,
  data_conclusao TIMESTAMP,
  
  status VARCHAR(50) NOT NULL DEFAULT 'Pendente' CHECK (
    status IN ('Pendente', 'Aprovada', 'EmProducao', 'Pausada', 'Concluida', 'Cancelada')
  ),
  prioridade VARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (
    prioridade IN ('Baixa', 'Normal', 'Alta', 'Urgente')
  ),
  
  valor_total DECIMAL(10,2),
  
  observacoes TEXT,
  instrucoes_producao TEXT,
  
  -- Integração Omie
  omie_id VARCHAR(50),
  omie_numero VARCHAR(50),
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) REFERENCES usuarios(id),
  updated_by VARCHAR(50) REFERENCES usuarios(id)
);

CREATE INDEX idx_ordens_numero ON ordens_producao(numero_ordem);
CREATE INDEX idx_ordens_cliente ON ordens_producao(cliente_id);
CREATE INDEX idx_ordens_status ON ordens_producao(status);
CREATE INDEX idx_ordens_prioridade ON ordens_producao(prioridade);
CREATE INDEX idx_ordens_data_emissao ON ordens_producao(data_emissao);
CREATE INDEX idx_ordens_data_previsao ON ordens_producao(data_previsao);
```

### Tabela: `ordens_producao_itens`

```sql
CREATE TABLE ordens_producao_itens (
  id VARCHAR(50) PRIMARY KEY,
  ordem_id VARCHAR(50) NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
  
  produto_id VARCHAR(50) NOT NULL REFERENCES produtos(id),
  produto_codigo VARCHAR(100),
  produto_nome VARCHAR(200),
  
  quantidade DECIMAL(10,3) NOT NULL,
  unidade VARCHAR(10) DEFAULT 'UN',
  
  -- Status de produção
  status VARCHAR(50) NOT NULL DEFAULT 'Aguardando' CHECK (
    status IN ('Aguardando', 'Em Producao', 'Pausado', 'Concluido', 'Rejeitado')
  ),
  setor_atual VARCHAR(50) CHECK (
    setor_atual IN ('Corte', 'Dobra', 'Solda', 'Acabamento', 'Montagem', 'Qualidade', 'Expedicao') OR setor_atual IS NULL
  ),
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  
  -- Datas
  iniciado_em TIMESTAMP,
  concluido_em TIMESTAMP,
  tempo_producao INTEGER, -- minutos calculados
  
  -- Materiais
  materiais_disponiveis BOOLEAN DEFAULT true,
  materiais_calculados BOOLEAN DEFAULT false,
  
  -- Observações
  observacoes TEXT,
  motivo_rejeicao TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_itens_ordem ON ordens_producao_itens(ordem_id);
CREATE INDEX idx_itens_produto ON ordens_producao_itens(produto_id);
CREATE INDEX idx_itens_status ON ordens_producao_itens(status);
CREATE INDEX idx_itens_setor ON ordens_producao_itens(setor_atual);
```

---

## 📦 6. MATERIAIS NECESSÁRIOS (BOM)

### Tabela: `materiais_necessarios`

```sql
CREATE TABLE materiais_necessarios (
  id VARCHAR(50) PRIMARY KEY,
  ordem_item_id VARCHAR(50) NOT NULL REFERENCES ordens_producao_itens(id) ON DELETE CASCADE,
  
  produto_id VARCHAR(50) NOT NULL REFERENCES produtos(id),
  produto_codigo VARCHAR(100),
  produto_nome VARCHAR(200),
  
  quantidade_necessaria DECIMAL(10,3) NOT NULL,
  quantidade_disponivel DECIMAL(10,3),
  quantidade_reservada DECIMAL(10,3) DEFAULT 0,
  faltante DECIMAL(10,3) GENERATED ALWAYS AS (
    GREATEST(quantidade_necessaria - COALESCE(quantidade_disponivel, 0), 0)
  ) STORED,
  
  unidade VARCHAR(10) DEFAULT 'UN',
  
  -- Consumo de chapa (se aplicável)
  consumo_chapa_m2 DECIMAL(10,4),
  consumo_chapa_kg DECIMAL(10,3),
  aproveitamento DECIMAL(5,2), -- percentual
  
  -- Status
  reservado BOOLEAN DEFAULT false,
  consumido BOOLEAN DEFAULT false,
  data_consumo TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materiais_ordem_item ON materiais_necessarios(ordem_item_id);
CREATE INDEX idx_materiais_produto ON materiais_necessarios(produto_id);
CREATE INDEX idx_materiais_faltante ON materiais_necessarios(faltante);
CREATE INDEX idx_materiais_reservado ON materiais_necessarios(reservado);
```

---

## 🚚 7. MOVIMENTAÇÕES DE SETOR

### Tabela: `movimentacoes_setor`

```sql
CREATE TABLE movimentacoes_setor (
  id VARCHAR(50) PRIMARY KEY,
  ordem_item_id VARCHAR(50) NOT NULL REFERENCES ordens_producao_itens(id) ON DELETE CASCADE,
  
  setor_origem VARCHAR(50) CHECK (
    setor_origem IN ('Corte', 'Dobra', 'Solda', 'Acabamento', 'Montagem', 'Qualidade', 'Expedicao') OR setor_origem IS NULL
  ),
  setor_destino VARCHAR(50) CHECK (
    setor_destino IN ('Corte', 'Dobra', 'Solda', 'Acabamento', 'Montagem', 'Qualidade', 'Expedicao') OR setor_destino IS NULL
  ),
  
  operador_id VARCHAR(50) REFERENCES usuarios(id),
  operador_nome VARCHAR(200),
  
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT,
  
  -- Dados capturados
  foto_url VARCHAR(500),
  codigo_qr VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movimentacoes_item ON movimentacoes_setor(ordem_item_id);
CREATE INDEX idx_movimentacoes_operador ON movimentacoes_setor(operador_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_setor(data_hora);
CREATE INDEX idx_movimentacoes_setor_origem ON movimentacoes_setor(setor_origem);
CREATE INDEX idx_movimentacoes_setor_destino ON movimentacoes_setor(setor_destino);
```

---

## 🧮 8. BILL OF MATERIALS (BOM)

### Tabela: `boms`

```sql
CREATE TABLE boms (
  id VARCHAR(50) PRIMARY KEY,
  produto_id VARCHAR(50) NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  produto_codigo VARCHAR(100),
  produto_nome VARCHAR(200),
  
  versao VARCHAR(20) DEFAULT '1.0',
  ativa BOOLEAN DEFAULT true,
  
  -- Informações gerais
  descricao TEXT,
  tipo_bancada VARCHAR(100),
  
  -- Parâmetros da bancada
  comprimento DECIMAL(10,2),
  largura DECIMAL(10,2),
  altura DECIMAL(10,2),
  espessura_chapa DECIMAL(5,2),
  
  -- Totais calculados
  peso_total DECIMAL(10,3),
  area_total DECIMAL(10,4),
  custo_material DECIMAL(10,2),
  custo_mao_obra DECIMAL(10,2),
  custo_total DECIMAL(10,2),
  
  -- Aproveitamento
  aproveitamento_chapa DECIMAL(5,2),
  perda_estimada DECIMAL(5,2),
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) REFERENCES usuarios(id)
);

CREATE INDEX idx_boms_produto ON boms(produto_id);
CREATE INDEX idx_boms_ativa ON boms(ativa);
```

### Tabela: `boms_componentes`

```sql
CREATE TABLE boms_componentes (
  id VARCHAR(50) PRIMARY KEY,
  bom_id VARCHAR(50) NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
  
  produto_id VARCHAR(50) NOT NULL REFERENCES produtos(id),
  produto_codigo VARCHAR(100),
  produto_nome VARCHAR(200),
  
  quantidade DECIMAL(10,3) NOT NULL,
  unidade VARCHAR(10) DEFAULT 'UN',
  
  categoria VARCHAR(100), -- 'Chapa', 'Tubo', 'Componente', 'Fixacao'
  
  -- Detalhes específicos
  dimensoes VARCHAR(200),
  peso_unitario DECIMAL(10,3),
  peso_total DECIMAL(10,3),
  area_m2 DECIMAL(10,4),
  
  custo_unitario DECIMAL(10,2),
  custo_total DECIMAL(10,2),
  
  observacoes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_boms_componentes_bom ON boms_componentes(bom_id);
CREATE INDEX idx_boms_componentes_produto ON boms_componentes(produto_id);
CREATE INDEX idx_boms_componentes_categoria ON boms_componentes(categoria);
```

---

## 📋 9. ORÇAMENTOS

### Tabela: `orcamentos`

```sql
CREATE TABLE orcamentos (
  id VARCHAR(50) PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  
  cliente_id VARCHAR(50) REFERENCES clientes(id),
  cliente_nome VARCHAR(200),
  
  data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_validade TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'Pendente' CHECK (
    status IN ('Pendente', 'Enviado', 'Aprovado', 'Rejeitado', 'Expirado')
  ),
  
  valor_subtotal DECIMAL(10,2),
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  percentual_desconto DECIMAL(5,2),
  valor_total DECIMAL(10,2),
  
  forma_pagamento VARCHAR(100),
  prazo_entrega VARCHAR(100),
  
  observacoes TEXT,
  termos_condicoes TEXT,
  
  -- Conversão
  convertido_ordem BOOLEAN DEFAULT false,
  ordem_id VARCHAR(50) REFERENCES ordens_producao(id),
  
  -- Integração Omie
  omie_id VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) REFERENCES usuarios(id),
  updated_by VARCHAR(50) REFERENCES usuarios(id)
);

CREATE INDEX idx_orcamentos_numero ON orcamentos(numero);
CREATE INDEX idx_orcamentos_cliente ON orcamentos(cliente_id);
CREATE INDEX idx_orcamentos_status ON orcamentos(status);
CREATE INDEX idx_orcamentos_data_emissao ON orcamentos(data_emissao);
```

---

## 🛒 10. PEDIDOS DE COMPRA

### Tabela: `pedidos_compra`

```sql
CREATE TABLE pedidos_compra (
  id VARCHAR(50) PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  
  fornecedor_id VARCHAR(50), -- Pode ser um cliente tipo fornecedor
  fornecedor_nome VARCHAR(200),
  
  data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_previsao_entrega TIMESTAMP,
  data_entrega TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'Pendente' CHECK (
    status IN ('Pendente', 'Aprovado', 'Enviado', 'Recebido', 'Cancelado')
  ),
  
  valor_total DECIMAL(10,2),
  
  observacoes TEXT,
  
  -- Integração Omie
  omie_id VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) REFERENCES usuarios(id),
  updated_by VARCHAR(50) REFERENCES usuarios(id)
);

CREATE INDEX idx_pedidos_compra_numero ON pedidos_compra(numero);
CREATE INDEX idx_pedidos_compra_fornecedor ON pedidos_compra(fornecedor_id);
CREATE INDEX idx_pedidos_compra_status ON pedidos_compra(status);
```

---

## 📝 11. AUDITORIA

### Tabela: `auditoria`

```sql
CREATE TABLE auditoria (
  id VARCHAR(50) PRIMARY KEY,
  
  modulo VARCHAR(100) NOT NULL,
  acao VARCHAR(50) NOT NULL CHECK (
    acao IN ('Criar', 'Editar', 'Deletar', 'Visualizar', 'Login', 'Logout', 'Exportar')
  ),
  
  usuario_id VARCHAR(50) REFERENCES usuarios(id),
  usuario_nome VARCHAR(200),
  usuario_email VARCHAR(200),
  
  entidade_tipo VARCHAR(100), -- 'Cliente', 'Produto', 'OrdemProducao', etc
  entidade_id VARCHAR(50),
  entidade_descricao TEXT,
  
  dados_anteriores JSONB,
  dados_novos JSONB,
  
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditoria_modulo ON auditoria(modulo);
CREATE INDEX idx_auditoria_acao ON auditoria(acao);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_entidade ON auditoria(entidade_tipo, entidade_id);
CREATE INDEX idx_auditoria_data ON auditoria(created_at);
```

---

## 🔧 12. CONFIGURAÇÕES E HELPERS

### View: Dashboard de Produção

```sql
CREATE OR REPLACE VIEW vw_dashboard_producao AS
SELECT 
  i.setor_atual AS setor,
  COUNT(*) FILTER (WHERE i.status = 'Aguardando') AS itens_aguardando,
  COUNT(*) FILTER (WHERE i.status = 'Em Producao') AS itens_em_producao,
  COUNT(*) FILTER (WHERE i.status = 'Concluido' AND DATE(i.concluido_em) = CURRENT_DATE) AS itens_concluidos,
  COUNT(*) FILTER (WHERE i.status = 'Rejeitado') AS itens_rejeitados,
  ROUND(AVG(i.tempo_producao)) AS tempo_medio_producao,
  ROUND(
    (COUNT(*) FILTER (WHERE i.status = 'Concluido' AND DATE(i.concluido_em) = CURRENT_DATE)::DECIMAL / 
    NULLIF(COUNT(*), 0)) * 100
  ) AS eficiencia
FROM ordens_producao_itens i
WHERE i.setor_atual IS NOT NULL
GROUP BY i.setor_atual;
```

### View: Estoque com Alertas

```sql
CREATE OR REPLACE VIEW vw_estoque_alertas AS
SELECT 
  e.id,
  e.produto_id,
  p.codigo AS produto_codigo,
  p.nome AS produto_nome,
  e.quantidade_atual,
  e.quantidade_disponivel,
  p.estoque_minimo,
  p.estoque_maximo,
  CASE 
    WHEN e.quantidade_disponivel <= 0 THEN 'Sem Estoque'
    WHEN e.quantidade_disponivel < p.estoque_minimo THEN 'Estoque Baixo'
    WHEN e.quantidade_disponivel > p.estoque_maximo THEN 'Estoque Alto'
    ELSE 'Normal'
  END AS status_estoque
FROM estoque e
JOIN produtos p ON e.produto_id = p.id
WHERE p.controla_estoque = true;
```

### Function: Calcular Tempo de Produção

```sql
CREATE OR REPLACE FUNCTION calcular_tempo_producao(item_id VARCHAR)
RETURNS INTEGER AS $$
DECLARE
  tempo_minutos INTEGER;
BEGIN
  SELECT EXTRACT(EPOCH FROM (concluido_em - iniciado_em)) / 60
  INTO tempo_minutos
  FROM ordens_producao_itens
  WHERE id = item_id AND concluido_em IS NOT NULL AND iniciado_em IS NOT NULL;
  
  RETURN COALESCE(tempo_minutos, 0);
END;
$$ LANGUAGE plpgsql;
```

### Trigger: Atualizar Updated At

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas principais
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordens_updated_at BEFORE UPDATE ON ordens_producao
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordens_itens_updated_at BEFORE UPDATE ON ordens_producao_itens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ CHECKLIST DE CRIAÇÃO

### Ordem de Execução:

1. [ ] Criar database `erp_inox`
2. [ ] Executar criação de tabelas na ordem:
   - [ ] usuarios
   - [ ] clientes
   - [ ] produtos
   - [ ] estoque
   - [ ] movimentos_estoque
   - [ ] ordens_producao
   - [ ] ordens_producao_itens
   - [ ] materiais_necessarios
   - [ ] movimentacoes_setor
   - [ ] boms
   - [ ] boms_componentes
   - [ ] orcamentos
   - [ ] pedidos_compra
   - [ ] auditoria
3. [ ] Criar views (vw_dashboard_producao, vw_estoque_alertas)
4. [ ] Criar functions (calcular_tempo_producao)
5. [ ] Criar triggers (update_updated_at_column)
6. [ ] Inserir usuário admin padrão
7. [ ] Testar conexão do backend

---

## 🎯 DADOS DE TESTE (SEED)

### Script para popular banco com dados de teste

```sql
-- Produtos de teste
INSERT INTO produtos (id, codigo, nome, categoria, tipo, unidade, preco_custo, preco_venda, eh_materia_prima) VALUES
('PROD001', 'BANC-2000-700', 'Bancada Inox 2000x700mm', 'Bancadas', 'Produto Acabado', 'UN', 1200.00, 1800.00, false),
('MAT001', 'CHAPA-304-1.5', 'Chapa Inox 304 1,5mm', 'Matéria Prima', 'Chapa', 'M2', 80.00, 120.00, true),
('MAT002', 'TUBO-25X25', 'Tubo Quadrado Inox 25x25mm', 'Matéria Prima', 'Estrutura', 'M', 25.00, 40.00, true);

-- Estoque
INSERT INTO estoque (id, produto_id, quantidade_atual) VALUES
('EST001', 'MAT001', 50.0),
('EST002', 'MAT002', 100.0);

-- Cliente de teste
INSERT INTO clientes (id, tipo, nome, cpf_cnpj, email, telefone, cidade, estado) VALUES
('CLI001', 'PJ', 'Restaurante Premium', '12.345.678/0001-90', 'contato@premium.com', '(11) 98765-4321', 'São Paulo', 'SP');
```

---

**Data:** 04/02/2026  
**Status:** ✅ SCHEMAS COMPLETOS E PRONTOS  
**Total de Tabelas:** 14  
**Total de Views:** 2  
**Total de Functions:** 1  
**Total de Triggers:** 4
