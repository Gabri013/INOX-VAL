export type Money = number;

export type MaterialKind = 'sheet' | 'tube' | 'angle' | 'round';
export type ProcessKind = 'cut' | 'bend' | 'weld' | 'finish' | 'assembly';

export interface MaterialItem {
  kind: MaterialKind;
  description: string;
  qty: number;
  unit: 'm2' | 'm' | 'kg' | 'un';
  unitCost: Money;
  total: Money;
  meta?: Record<string, unknown>;
}

export interface AccessoryItem {
  description: string;
  qty: number;
  unit: 'un';
  unitCost: Money;
  total: Money;
}

export interface ProcessItem {
  kind: ProcessKind;
  description: string;
  minutes: number;
  costPerHour: Money;
  total: Money;
  meta?: Record<string, unknown>;
}

export interface PricingTables {
  inoxKgPrice: Money;                     // R$/kg
  densityKgPerM3?: number;                // default 7900
  tubeKgPerMeter: Record<string, number>; // ex "tuboQuadrado_40x40x1.2": 1.42
  processCostPerHour: Record<ProcessKind, Money>;
  accessories: Record<string, Money>;     // ex "peNivelador": 12.0
  overheadPercent?: number;               // ex 0.1
}

export interface GlobalParamsNormalized {
  desperdicioPct: number;   // 0..1
  maoDeObraPct?: number;    // 0..1 (opcional)
  vendaFactor?: number;     // ex 2.5
  margemPct?: number;       // 0..1 (alternativa ao vendaFactor)
}

export interface PricingResult {
  material: Money;
  accessories: Money;
  processes: Money;
  overhead: Money;
  costBase: Money;
  sellingPrice: Money;
  breakdown: {
    materials: MaterialItem[];
    accessories: AccessoryItem[];
    processes: ProcessItem[];
  };
  warnings: string[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function price(
  tables: PricingTables,
  globals: GlobalParamsNormalized,
  input: {
    materials: Omit<MaterialItem, 'unitCost' | 'total'>[];
    accessories?: Omit<AccessoryItem, 'unitCost' | 'total'>[];
    processes?: Omit<ProcessItem, 'costPerHour' | 'total'>[];
  }
): PricingResult {
  const warnings: string[] = [];
  const density = tables.densityKgPerM3 ?? 7900;
  const desperdicioPct = clamp01(globals.desperdicioPct);

  const materials: MaterialItem[] = input.materials.map((m) => {
    let unitCost = 0;

    if (m.kind === 'sheet') {
      // sheet: qty = m2, meta: { thicknessMm }
      const thicknessMm = Number(m.meta?.thicknessMm ?? 0);
      if (thicknessMm <= 0) warnings.push(`Espessura inválida em "${m.description}".`);
      const kg = m.qty * (thicknessMm / 1000) * density; // m2 * m * kg/m3 = kg
      unitCost = tables.inoxKgPrice * (kg / Math.max(m.qty, 1e-9)); // R$/m2 equivalente
    } else if (m.kind === 'tube') {
      // tube: qty = m, meta: { tubeKey }
      const tubeKey = String(m.meta?.tubeKey ?? '');
      const kgpm = tables.tubeKgPerMeter[tubeKey];
      if (!kgpm) warnings.push(`Sem kg/m para tubo "${tubeKey}".`);
      const kg = m.qty * (kgpm ?? 0);
      unitCost = tables.inoxKgPrice * (kg / Math.max(m.qty, 1e-9)); // R$/m equivalente
    } else if (m.kind === 'angle') {
      // angle: qty = m, meta { kgPerMeter } ou { angleKey }
      const kgpm = Number(m.meta?.kgPerMeter ?? 0);
      if (kgpm <= 0) warnings.push(`Sem kg/m em cantoneira "${m.description}".`);
      const kg = m.qty * kgpm;
      unitCost = tables.inoxKgPrice * (kg / Math.max(m.qty, 1e-9));
    } else if (m.kind === 'round') {
      // round: qty = kg direto
      unitCost = tables.inoxKgPrice;
    }

    const base = m.qty * unitCost;
    const total = base * (1 + desperdicioPct);
    return {
      ...m,
      unitCost: round2(unitCost),
      total: round2(total),
    };
  });

  const accessories: AccessoryItem[] = (input.accessories ?? []).map((a) => {
    const unitCost = tables.accessories[a.description] ?? 0;
    if (!unitCost) warnings.push(`Sem preço cadastrado para acessório "${a.description}".`);
    return {
      ...a,
      unitCost: round2(unitCost),
      total: round2(a.qty * unitCost),
    };
  });

  const processes: ProcessItem[] = (input.processes ?? []).map((p) => {
    const cph = tables.processCostPerHour[p.kind] ?? 0;
    if (!cph) warnings.push(`Sem custo/h para processo "${p.kind}".`);
    const total = (p.minutes / 60) * cph;
    return { ...p, costPerHour: round2(cph), total: round2(total) };
  });

  const materialSum = sum(materials.map((m) => m.total));
  const accessoriesSum = sum(accessories.map((a) => a.total));
  const processSum = sum(processes.map((p) => p.total));

  const baseCost = materialSum + accessoriesSum + processSum;

  // maoDeObraPct (antigo) opcional: se você quiser ainda aplicar em cima do base
  const maoDeObraExtra = globals.maoDeObraPct ? baseCost * clamp01(globals.maoDeObraPct) : 0;

  const overheadPct = clamp01(tables.overheadPercent ?? 0);
  const overhead = (baseCost + maoDeObraExtra) * overheadPct;

  const costBase = baseCost + maoDeObraExtra + overhead;

  // venda: OU fator OU margem
  let sellingPrice = costBase;
  if (globals.vendaFactor && globals.vendaFactor > 0) {
    sellingPrice = costBase * globals.vendaFactor;
  } else if (globals.margemPct !== undefined) {
    const m = clamp01(globals.margemPct);
    sellingPrice = costBase / Math.max(1 - m, 1e-9);
  }

  return {
    material: round2(materialSum),
    accessories: round2(accessoriesSum),
    processes: round2(processSum),
    overhead: round2(overhead),
    costBase: round2(costBase),
    sellingPrice: round2(sellingPrice),
    breakdown: { materials, accessories, processes },
    warnings,
  };
}

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0); }
function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }
