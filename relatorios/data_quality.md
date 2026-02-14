# Data Quality

Total de itens de OP analisados: 24814

## Problemas recorrentes
- Itens sem X: 10926
- Itens sem Y: 11732
- Itens sem material: 1896
- Itens sem espessura inferida: 11208
- Itens com decimal por virgula: 12928
- Itens sem processo: 655

## Variacoes de schema
- 584 arquivo(s): blankX:4 | blankY:5 | description:7 | material:6 | partCode:8 | process:9 | qty:3 | qtyTotal:10 | rowNumber:2
- 313 arquivo(s): blankX:5 | blankY:6 | description:3 | material:4 | partCode:2 | process:7 | qtyTotal:9
- 8 arquivo(s): blankX:4 | blankY:5 | description:8 | material:7 | partCode:9 | process:10 | qty:3 | qtyTotal:11 | rowNumber:2
- 6 arquivo(s): blankX:5 | blankY:6 | description:3 | material:4 | partCode:2 | process:8 | qtyTotal:10
- 6 arquivo(s): blankX:6 | blankY:5 | description:3 | material:4 | partCode:2 | process:7 | qty:8
- 6 arquivo(s): blankX:4 | blankY:5 | description:2 | material:3 | partCode:1 | process:6 | qtyTotal:8
- 3 arquivo(s): blankX:4 | blankY:5 | description:7 | material:6 | partCode:8 | process:9 | qty:3 | rowNumber:2
- 2 arquivo(s): blankX:4 | blankY:5 | description:8 | material:7 | partCode:9 | process:10 | qty:3 | rowNumber:2
- 2 arquivo(s): blankX:5 | blankY:4 | description:2 | material:3 | partCode:1 | process:6 | qty:7
- 1 arquivo(s): blankX:4 | blankY:5 | description:8 | material:7 | partCode:9 | process:10 | qty:3 | qtyTotal:13 | rowNumber:2

Observacoes:
- Priorizar normalizacao de separador decimal (virgula/ponto).
- Converter X/Y em numero com unidade mm padrao.
- Tratar material sem espessura como pendencia para precificacao.