# Pricing Integration Plan

## Modelo normalizado recomendado (TypeScript)
```ts
export interface OrderItemNormalized {
  sourceFile: string;
  domain: string;
  sheetName: string;
  rowIndex: number;
  partCode?: string;
  description: string;
  qty: number;
  qtyQtd?: number | null;
  qtyTotal?: number | null;
  process?: string;
  blankX?: number | null;
  blankY?: number | null;
  materialRaw: string;
  materialName?: string | null;
  thicknessMm?: number | null;
}

export interface SheetDemandGroup {
  materialKey: string; // materialName+thickness, fallback materialRaw
  totalQty: number;
  totalAreaMm2: number;
  completePct: number;
}
```

## Regra de estimativa de consumo de chapa
```txt
area_total = sum(qty * X * Y)
chapas = ceil( area_total * (1 + sucata) / (area_chapa * eficiencia) )
```

## Regras de fallback
- Se espessura ausente: agrupar por `materialRaw` e marcar pendencia de cadastro.
- Se X/Y ausente: item nao entra na area; registrar em pendencias para engenharia.
- Se processo nao for corte/laser/plasma/CNC: manter item para custo indireto, mas nao para area de chapa.

## Material x Espessura (top amostra)
| Material | Espessura | Total Pecas | Area Total m2 | Itens Completos % |
|---|---:|---:|---:|---:|
| #304 | 0.8 | 8132.111028576997 | 173125394.363 | 95.48% |
| #430 | 0.8 | 4992.683971648 | 53256851.104 | 98.52% |
| #430 | 0.5 | 2440.1223088 | 24611321.177 | 99.11% |
| #304 | 1 | 3001.8942951060003 | 6374829.986 | 97.31% |
| GALV | 0.5 | 547.0592376440001 | 5994081.517 | 100% |
| #304 | 1.2 | 1826.895571915 | 3896803.214 | 97.24% |
| GALV | 0.9 | 6710.827775458 | 3780152.496 | 99.42% |
| #304 | NA | 9199 | 3567240.988 | 0% |
| #430 | 1 | 1446 | 3408029.213 | 94.27% |
| #430 | 1.2 | 1031 | 3182429.832 | 98.16% |
| ALUMINIO | NA | 27066 | 2264988.776 | 0% |
| #304 | 0.5 | 1374.9221656 | 1781285.772 | 99.15% |