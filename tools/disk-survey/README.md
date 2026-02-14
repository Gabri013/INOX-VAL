# Disk Survey CLI (offline/local)

CLI para levantamento local no disco (Windows), com foco em detectar fontes que alimentam o calculo de precificacao, especialmente consumo de chapa.

## O que faz

- `scan`: inventario rapido (metadados, sem leitura profunda de conteudo).
- `sample`: amostragem inteligente (abre parte das planilhas e detecta schema OP).
- `deep`: leitura mais detalhada apenas em candidatos relevantes.

## Build

```bash
npm run disk-survey:build
```

## Uso

```bash
node tools/disk-survey/dist/cli.js scan --path "D:\" --out "./relatorios"
```

```bash
node tools/disk-survey/dist/cli.js sample \
  --path "D:\" \
  --out "./relatorios" \
  --maxDepth 9 \
  --maxFiles 20000 \
  --maxSizeMB 80 \
  --includeExt ".xlsx,.xlsm,.xls,.csv,.pdf" \
  --excludeDirs "Windows,Program Files,ProgramData,$RECYCLE.BIN,System Volume Information,node_modules,.git" \
  --keywords "ordem,producao,processo,material,chapa,blank,plano de corte,laser,dobra,corte,espessura,orcamento,custo,preco"
```

```bash
node tools/disk-survey/dist/cli.js deep --path "D:\" --out "./relatorios"
```

## Arquivos gerados

- `inventory.json` / `inventory.csv`
- `folders_ranking.csv`
- `domains_summary.md`
- `op_orders.json`
- `op_items_normalized.csv`
- `op_catalog.md`
- `material_thickness_breakdown.csv`
- `data_quality.md`
- `pricing_integration_plan.md`
- `column_synonyms.json`
- `material_parser_rules.json`
- `domain_rules.json`

## Heuristica de OP

Classifica como `ordem_producao_op` quando encontra:

- aba `PROCESSO` (forte sinal),
- e schema com varias colunas entre:
  `Nº`, `QTD`, `X`, `Y`, `MATERIAL`, `DESCRICAO`, `CODIGO`, `PROCESSO`, `QTD TOTAL`.

Cabecalho e detectado automaticamente (linha nao fixa, inclusive linha 5).

## Dicionarios editaveis

- `tools/disk-survey/config/column_synonyms.json`
- `tools/disk-survey/config/material_parser_rules.json`
- `tools/disk-survey/config/domain_rules.json`

Edite esses arquivos para ajustar mapeamentos sem alterar codigo.
