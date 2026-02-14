import type {
  OpItemClassificationResult,
  OpNormalizedItem,
  ProcessRule,
  RouteDecision,
  SheetEstimationGroup,
  SheetEstimationOverride,
  SheetEstimationPending,
  SheetEstimationResult,
  SheetExcludedItem,
  SheetSpec,
} from "../types/opPricing";
import { classifyMaterial } from "./materialClassification.service";
import { DEFAULT_PROCESS_RULES, resolveCategoryByProcess } from "./processRouting.service";

const round = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const normalizeMaterial = (value: string | null | undefined) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

const findSheetSpec = (
  specs: SheetSpec[],
  materialName: string,
  thicknessMm: number
): SheetSpec | undefined => {
  const normalizedMaterial = normalizeMaterial(materialName);
  return specs.find((spec) => {
    const sameMaterial = normalizeMaterial(spec.materialName) === normalizedMaterial;
    const closeThickness = Math.abs(spec.thicknessMm - thicknessMm) <= 0.05;
    return sameMaterial && closeThickness;
  });
};

const toRatio = (value: number, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed > 1) return Math.min(max, Math.max(min, parsed / 100));
  return Math.min(max, Math.max(min, parsed));
};

const addPending = (
  pending: SheetEstimationPending[],
  issue: SheetEstimationPending,
  uniqueKey: string,
  dedupe: Set<string>
) => {
  if (dedupe.has(uniqueKey)) return;
  dedupe.add(uniqueKey);
  pending.push(issue);
};

export function estimateSheetCostByOp(params: {
  items: OpNormalizedItem[];
  sheetSpecs: SheetSpec[];
  processRules?: ProcessRule[];
  override?: SheetEstimationOverride;
}): SheetEstimationResult {
  const { items, sheetSpecs, processRules = DEFAULT_PROCESS_RULES, override } = params;
  const includedItems: OpNormalizedItem[] = [];
  const excludedItems: SheetExcludedItem[] = [];
  const classificationResults: OpItemClassificationResult[] = [];
  const pending: SheetEstimationPending[] = [];
  const pendingDedupe = new Set<string>();

  const groups = new Map<string, { items: OpNormalizedItem[]; spec?: SheetSpec }>();

  for (const item of items) {
    const material = classifyMaterial(item.materialRaw, {
      description: item.description,
      partCode: item.partCode,
    });
    const processResolution = resolveCategoryByProcess(item.process, processRules);

    const resolvedItem: OpNormalizedItem = {
      ...item,
      materialName: material.materialName ?? item.materialName,
      thicknessMm: material.thicknessMm ?? item.thicknessMm,
      rawMaterialCode: material.rawMaterialCode ?? item.rawMaterialCode,
      materialKind: material.kind !== "unknown" ? material.kind : item.materialKind,
    };

    const qty = resolvedItem.qty > 0 ? resolvedItem.qty : 0;
    const hasXy = Boolean(
      resolvedItem.blankX &&
        resolvedItem.blankY &&
        resolvedItem.blankX > 0 &&
        resolvedItem.blankY > 0
    );

    let finalCategory = processResolution.category;
    let decision: RouteDecision = "other_excluded";
    let conflict: string | undefined;

    if (processResolution.category === "sheet" && resolvedItem.materialKind === "tube_profile") {
      finalCategory = "tube";
      decision = "tube_pending";
      conflict = "process_sheet_material_tube_profile";
      addPending(
        pending,
        {
          code: "process_material_conflict",
          message: `Linha ${resolvedItem.rowIndex}: processo indica chapa, mas material parece tubo/perfil.`,
          rowIndex: resolvedItem.rowIndex,
          critical: true,
        },
        `process_material_conflict-${resolvedItem.rowIndex}`,
        pendingDedupe
      );
    }

    if (processResolution.category === "sheet" && resolvedItem.materialKind === "non_metal") {
      finalCategory = "other";
      decision = "other_excluded";
      conflict = "process_sheet_material_non_metal";
      addPending(
        pending,
        {
          code: "process_material_conflict",
          message: `Linha ${resolvedItem.rowIndex}: processo de chapa com material não metálico.`,
          rowIndex: resolvedItem.rowIndex,
          critical: true,
        },
        `process_material_conflict-${resolvedItem.rowIndex}`,
        pendingDedupe
      );
    }

    if (processResolution.category === "sheet" && resolvedItem.materialKind === "unknown") {
      finalCategory = "sheet";
      decision = "sheet_missing_data";
    }

    if (finalCategory === "purchase") {
      decision = "purchase_excluded";
      excludedItems.push({ rowIndex: resolvedItem.rowIndex, reason: "item_compra", item: resolvedItem });
      addPending(
        pending,
        {
          code: "purchase_item_no_cost",
          message: `Linha ${resolvedItem.rowIndex}: item de compra excluído do custo de chapa (trate em custo fixo).`,
          rowIndex: resolvedItem.rowIndex,
          critical: false,
        },
        `purchase-${resolvedItem.rowIndex}`,
        pendingDedupe
      );
    } else if (finalCategory === "tube") {
      decision = "tube_pending";
      excludedItems.push({ rowIndex: resolvedItem.rowIndex, reason: "item_tubo_sem_motor", item: resolvedItem });
      addPending(
        pending,
        {
          code: "tube_not_implemented",
          message: `Linha ${resolvedItem.rowIndex}: item de tubo/perfil sem motor de cálculo implementado.`,
          rowIndex: resolvedItem.rowIndex,
          critical: true,
        },
        `tube_not_implemented-${resolvedItem.rowIndex}`,
        pendingDedupe
      );
    } else if (finalCategory !== "sheet") {
      decision = "other_excluded";
      excludedItems.push({ rowIndex: resolvedItem.rowIndex, reason: "categoria_fora_chapa", item: resolvedItem });
    } else if (resolvedItem.materialKind !== "sheet_metal") {
      decision = "sheet_missing_data";
      excludedItems.push({
        rowIndex: resolvedItem.rowIndex,
        reason: "material_nao_classificado_como_chapa",
        item: resolvedItem,
      });
      addPending(
        pending,
        {
          code: "missing_material",
          message: `Linha ${resolvedItem.rowIndex}: material não classificado como chapa metálica.`,
          rowIndex: resolvedItem.rowIndex,
          critical: true,
        },
        `missing_material-${resolvedItem.rowIndex}`,
        pendingDedupe
      );
    } else if (!hasXy) {
      decision = "sheet_missing_data";
      excludedItems.push({ rowIndex: resolvedItem.rowIndex, reason: "sem_XY", item: resolvedItem });
      addPending(
        pending,
        {
          code: "missing_xy",
          message: `Linha ${resolvedItem.rowIndex}: item sem X/Y não entrou no cálculo de chapa.`,
          rowIndex: resolvedItem.rowIndex,
          critical: true,
        },
        `missing_xy-${resolvedItem.rowIndex}`,
        pendingDedupe
      );
    } else if (!resolvedItem.materialName || resolvedItem.materialName === "OUTRO") {
      decision = "sheet_missing_data";
      excludedItems.push({ rowIndex: resolvedItem.rowIndex, reason: "sem_material_normalizado", item: resolvedItem });
      addPending(
        pending,
        {
          code: "missing_material",
          message: `Linha ${resolvedItem.rowIndex}: material não identificado (${resolvedItem.materialRaw || "vazio"}).`,
          rowIndex: resolvedItem.rowIndex,
          critical: true,
        },
        `missing_material-${resolvedItem.rowIndex}`,
        pendingDedupe
      );
    } else if (!resolvedItem.thicknessMm) {
      decision = "sheet_missing_data";
      excludedItems.push({ rowIndex: resolvedItem.rowIndex, reason: "sem_espessura", item: resolvedItem });
      addPending(
        pending,
        {
          code: "missing_thickness",
          message: `Linha ${resolvedItem.rowIndex}: espessura não identificada (nem por código de matéria-prima).`,
          rowIndex: resolvedItem.rowIndex,
          critical: true,
        },
        `missing_thickness-${resolvedItem.rowIndex}`,
        pendingDedupe
      );
    } else if (!(qty > 0)) {
      decision = "sheet_missing_data";
      excludedItems.push({ rowIndex: resolvedItem.rowIndex, reason: "quantidade_invalida", item: resolvedItem });
    } else {
      decision = "sheet_area";
      includedItems.push(resolvedItem);
      const groupKey = `${resolvedItem.materialName}|${resolvedItem.thicknessMm}`;
      const existing = groups.get(groupKey);
      if (existing) {
        existing.items.push(resolvedItem);
      } else {
        const spec = findSheetSpec(sheetSpecs, resolvedItem.materialName, resolvedItem.thicknessMm);
        groups.set(groupKey, {
          items: [resolvedItem],
          spec,
        });
      }
    }

    classificationResults.push({
      rowIndex: resolvedItem.rowIndex,
      processCategory: processResolution.category,
      processConfidence: round(processResolution.confidence, 3),
      materialKind: resolvedItem.materialKind,
      materialConfidence: round(material.confidence, 3),
      finalCategory,
      decision,
      conflict,
    });
  }

  const breakdown: SheetEstimationGroup[] = [];

  for (const [groupKey, entry] of groups.entries()) {
    const [materialNameRaw, thicknessRaw] = groupKey.split("|");
    const thicknessMm = Number(thicknessRaw);
    const materialName = materialNameRaw as SheetEstimationGroup["materialName"];

    const areaTotalMm2 = entry.items.reduce((sum, item) => {
      const qty = item.qty > 0 ? item.qty : 0;
      const x = item.blankX ?? 0;
      const y = item.blankY ?? 0;
      return sum + qty * x * y;
    }, 0);
    const totalQty = entry.items.reduce((sum, item) => sum + (item.qty > 0 ? item.qty : 0), 0);

    const spec = entry.spec;
    if (!spec) {
      addPending(
        pending,
        {
          code: "missing_sheet_spec",
          message: `Sem sheetSpec para ${materialName} ${thicknessMm}mm.`,
          groupKey,
          critical: true,
        },
        `missing_sheet_spec-${groupKey}`,
        pendingDedupe
      );
      continue;
    }

    const scrapPct = toRatio(
      override?.scrapPct ?? spec.defaultScrapPct,
      spec.defaultScrapPct || 0,
      0,
      0.95
    );
    const efficiency = toRatio(
      override?.efficiency ?? spec.defaultEfficiency,
      spec.defaultEfficiency || 0.8,
      0.05,
      1
    );

    const sheetAreaMm2 = spec.widthMm * spec.heightMm;
    const estimatedSheets = Math.ceil((areaTotalMm2 * (1 + scrapPct)) / Math.max(sheetAreaMm2 * efficiency, 1));
    const materialCost = estimatedSheets * spec.costPerSheet;

    breakdown.push({
      groupKey,
      materialName,
      thicknessMm,
      itemCount: entry.items.length,
      totalQty: round(totalQty, 3),
      areaTotalMm2: round(areaTotalMm2, 2),
      areaTotalM2: round(areaTotalMm2 / 1_000_000, 4),
      sheetWidthMm: spec.widthMm,
      sheetHeightMm: spec.heightMm,
      sheetAreaMm2: round(sheetAreaMm2, 2),
      costPerSheet: round(spec.costPerSheet, 2),
      scrapPct: round(scrapPct, 4),
      efficiency: round(efficiency, 4),
      estimatedSheets,
      materialCost: round(materialCost, 2),
    });
  }

  const totals = breakdown.reduce(
    (acc, group) => {
      acc.areaTotalMm2 += group.areaTotalMm2;
      acc.areaTotalM2 += group.areaTotalM2;
      acc.estimatedSheets += group.estimatedSheets;
      acc.materialCost += group.materialCost;
      return acc;
    },
    { areaTotalMm2: 0, areaTotalM2: 0, estimatedSheets: 0, materialCost: 0 }
  );

  const canFinalize = pending.every((issue) => issue.critical === false);

  return {
    includedItems,
    excludedItems,
    classificationResults,
    pending,
    groups: breakdown,
    totals: {
      areaTotalMm2: round(totals.areaTotalMm2, 2),
      areaTotalM2: round(totals.areaTotalM2, 4),
      estimatedSheets: totals.estimatedSheets,
      materialCost: round(totals.materialCost, 2),
    },
    canFinalize,
  };
}
