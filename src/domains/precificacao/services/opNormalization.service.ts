import * as XLSX from "xlsx";
import type {
  OpNormalizationResult,
  OpNormalizationSummary,
  OpNormalizedItem,
} from "../types/opPricing";
import { classifyMaterial } from "./materialClassification.service";

export interface OpNormalizationOptions {
  sheetName?: string;
}

type OpRawRows = unknown[][] | Array<Record<string, unknown>>;

type HeaderKey =
  | "rowNumber"
  | "qty"
  | "qtyTotal"
  | "blankX"
  | "blankY"
  | "materialRaw"
  | "description"
  | "partCode"
  | "process";

type HeaderMap = Record<HeaderKey, number>;

const HEADER_SYNONYMS: Record<HeaderKey, string[]> = {
  rowNumber: ["n", "nº", "numero", "nro", "item"],
  qty: ["qtd", "qtde", "quantidade"],
  qtyTotal: ["qtd total", "qtd. total", "quantidade total", "qtde total"],
  blankX: ["x", "comprimento", "comp"],
  blankY: ["y", "largura", "altura"],
  materialRaw: ["material", "mat", "materia prima"],
  description: ["descricao", "descrição", "desc", "peça", "peca"],
  partCode: ["codigo", "código", "cod", "sku"],
  process: ["processo", "operacao", "operação", "setor"],
};

const CUT_PROCESS_KEYWORDS = [
  "LASER",
  "CNC",
  "CORTE",
  "PLASMA",
  "PUNCION",
  "PUNCH",
  "OXICORTE",
];

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

const normalizeToken = (value: unknown) =>
  normalizeText(value)
    .replace(/[._:/\\-]/g, "")
    .replace(/\s+/g, "");

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const toMatrixRows = (rows: OpRawRows): unknown[][] => {
  if (!rows.length) return [];
  if (Array.isArray(rows[0])) return rows as unknown[][];

  const objectRows = rows as Array<Record<string, unknown>>;
  const keys: string[] = [];
  const known = new Set<string>();

  for (const row of objectRows) {
    for (const key of Object.keys(row ?? {})) {
      if (known.has(key)) continue;
      known.add(key);
      keys.push(key);
    }
  }

  if (!keys.length) return [];

  const matrix: unknown[][] = [keys];
  for (const row of objectRows) {
    matrix.push(keys.map((key) => row?.[key] ?? ""));
  }
  return matrix;
};

const findHeader = (rows: unknown[][]): { headerRowIndex: number; map: HeaderMap } => {
  const fallback: HeaderMap = {
    rowNumber: 1,
    qty: 2,
    qtyTotal: 9,
    blankX: 3,
    blankY: 4,
    materialRaw: 5,
    description: 6,
    partCode: 7,
    process: 8,
  };

  let best = { score: -1, headerRowIndex: 0, map: fallback };
  const probe = Math.min(rows.length, 50);

  for (let rowIndex = 0; rowIndex < probe; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const normalizedCells = row.map((cell) => normalizeToken(cell));
    const map = { ...fallback };
    let score = 0;

    (Object.keys(HEADER_SYNONYMS) as HeaderKey[]).forEach((key) => {
      const synonyms = HEADER_SYNONYMS[key].map((syn) => normalizeToken(syn));
      let col = -1;

      for (let i = 0; i < normalizedCells.length; i += 1) {
        if (synonyms.includes(normalizedCells[i])) {
          col = i;
          break;
        }
      }
      if (col < 0) {
        for (let i = 0; i < normalizedCells.length; i += 1) {
          if (synonyms.some((syn) => syn.length >= 4 && normalizedCells[i].includes(syn))) {
            col = i;
            break;
          }
        }
      }

      if (col >= 0) {
        map[key] = col;
        score += 1;
      }
    });

    if (score > best.score) {
      best = { score, headerRowIndex: rowIndex, map };
    }
  }

  return {
    headerRowIndex: best.headerRowIndex,
    map: best.map,
  };
};

export const isCutProcess = (process: string): boolean => {
  const normalized = normalizeText(process);
  return CUT_PROCESS_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

export const isSheetItem = (item: OpNormalizedItem): boolean => {
  return Boolean(
    item.materialKind === "sheet_metal" &&
      item.blankX &&
      item.blankY &&
      item.blankX > 0 &&
      item.blankY > 0 &&
      isCutProcess(item.process)
  );
};

export function normalizeOpRows(
  rows: OpRawRows,
  options: OpNormalizationOptions = {}
): OpNormalizationResult {
  const matrixRows = toMatrixRows(rows);
  const { headerRowIndex, map } = findHeader(matrixRows);
  const items: OpNormalizedItem[] = [];

  let rowsWithXy = 0;
  let rowsWithMaterialThickness = 0;

  for (let rowIndex = headerRowIndex + 1; rowIndex < matrixRows.length; rowIndex += 1) {
    const row = matrixRows[rowIndex] ?? [];
    if (!Array.isArray(row)) continue;
    const get = (idx: number) => (idx >= 0 ? row[idx] : "");

    const partCode = String(get(map.partCode) ?? "").trim();
    const description = String(get(map.description) ?? "").trim();
    const materialRaw = String(get(map.materialRaw) ?? "").trim();
    const process = String(get(map.process) ?? "").trim();

    const qtyQtd = parseNumber(get(map.qty));
    const qtyTotal = parseNumber(get(map.qtyTotal));
    const qty = Math.max(0, qtyTotal ?? qtyQtd ?? 0);
    const blankX = parseNumber(get(map.blankX));
    const blankY = parseNumber(get(map.blankY));

    if (!partCode && !description && !materialRaw && !process && !qty && !blankX && !blankY) {
      continue;
    }

    const material = classifyMaterial(materialRaw, { description, partCode });
    const materialName = material.materialName;
    const thicknessMm = material.thicknessMm;

    const pending: OpNormalizedItem["pending"] = [];
    if (!(qty > 0)) pending.push("missing_qty");
    if (!(blankX && blankX > 0)) pending.push("missing_x");
    if (!(blankY && blankY > 0)) pending.push("missing_y");
    if (!materialRaw || material.kind === "unknown") pending.push("missing_material");
    if (!thicknessMm) pending.push("missing_thickness");

    if (blankX && blankY) rowsWithXy += 1;
    if (material.kind === "sheet_metal" && materialName && thicknessMm) rowsWithMaterialThickness += 1;

    items.push({
      rowIndex: rowIndex + 1,
      partCode,
      description,
      qty: qty > 0 ? qty : 0,
      qtyOriginal: qtyQtd,
      qtyTotalOriginal: qtyTotal,
      blankX,
      blankY,
      process,
      materialRaw,
      rawMaterialCode: material.rawMaterialCode,
      materialKind: material.kind,
      materialName,
      thicknessMm,
      pending,
    });
  }

  const summary: OpNormalizationSummary = {
    totalRows: matrixRows.length,
    parsedItems: items.length,
    pendingItems: items.filter((item) => item.pending.length > 0).length,
    rowsWithXy,
    rowsWithMaterialThickness,
  };

  return {
    sheetName: options.sheetName ?? "OP",
    headerRowIndex,
    items,
    summary,
  };
}

export async function normalizeOpFile(
  file: File,
  options: OpNormalizationOptions = {}
): Promise<OpNormalizationResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", raw: false });
  const sheetName = options.sheetName || workbook.SheetNames[0];
  if (!sheetName) throw new Error("Arquivo sem aba válida.");
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) throw new Error("Não foi possível ler a aba da OP.");

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  }) as unknown[][];

  return normalizeOpRows(rows, { sheetName });
}
