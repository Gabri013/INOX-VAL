import * as XLSX from "xlsx";
import type { BuiltBOM, SheetPartRect } from "../domains/precificacao/engine/bomBuilder";

type HeaderMap = {
  rowNumber: number;
  qty: number;
  x: number;
  y: number;
  material: number;
  description: number;
  process: number;
  qtyTotal: number;
};

export interface OrdemProducaoImportOptions {
  acceptedProcesses: string[];
  defaultThicknessMm: number;
}

export interface OrdemProducaoMaterialSummary {
  material: string;
  parts: number;
  qty: number;
  areaM2: number;
}

export interface OrdemProducaoImportSummary {
  sheetName: string;
  totalRows: number;
  rowsWithDimensions: number;
  includedRows: number;
  totalSheetParts: number;
  totalAreaM2: number;
  materialBreakdown: OrdemProducaoMaterialSummary[];
  warnings: string[];
}

export interface OrdemProducaoImportResult {
  bom: BuiltBOM;
  summary: OrdemProducaoImportSummary;
}

const DEFAULT_OPTIONS: OrdemProducaoImportOptions = {
  acceptedProcesses: ["LASER", "CORTE"],
  defaultThicknessMm: 1,
};

const DEFAULT_HEADER_MAP: HeaderMap = {
  rowNumber: 1,
  qty: 2,
  x: 3,
  y: 4,
  material: 5,
  description: 6,
  process: 8,
  qtyTotal: 9,
};

const normalizeText = (value: unknown): string => {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[._\-/:]/g, "")
    .toUpperCase();
};

const slugify = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const normalized = raw
    .replace(/\s/g, "")
    .replace(/[^\d,.\-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseThicknessMm = (materialRaw: string): number | null => {
  const material = materialRaw.trim();
  if (!material) return null;

  const decimalMatches = material.match(/\d+[.,]\d+/g) ?? [];
  for (const match of decimalMatches) {
    const value = parseNumber(match);
    if (value && value >= 0.3 && value <= 6) {
      return value;
    }
  }

  const integerMatches = material.match(/\d+/g) ?? [];
  for (const match of integerMatches) {
    const value = parseNumber(match);
    if (value && value >= 1 && value <= 6) {
      return value;
    }
  }

  return null;
};

const materialToFamily = (materialRaw: string): string => {
  const normalized = normalizeText(materialRaw);
  if (normalized.includes("304")) return "chapa_304";
  if (normalized.includes("430")) return "chapa_430";
  if (normalized.includes("316")) return "chapa_316";
  if (normalized.includes("GALV")) return "chapa_galvanizada";
  if (normalized.includes("INOX")) return "chapa_inox";
  return "chapa_outros";
};

const resolveHeaderMap = (rows: unknown[][]): HeaderMap => {
  let bestScore = -1;
  let bestHeader: HeaderMap | null = null;

  const headerProbeRows = Math.min(rows.length, 40);
  for (let rowIndex = 0; rowIndex < headerProbeRows; rowIndex += 1) {
    const normalizedCells = (rows[rowIndex] ?? []).map(normalizeText);

    const findExact = (token: string) => normalizedCells.findIndex((cell) => cell === token);
    const findIncludes = (token: string) => normalizedCells.findIndex((cell) => cell.includes(token));

    const rowNumber = findIncludes("N") >= 0 ? findIncludes("N") : DEFAULT_HEADER_MAP.rowNumber;
    const qty = findExact("QTD") >= 0 ? findExact("QTD") : DEFAULT_HEADER_MAP.qty;
    const x = findExact("X") >= 0 ? findExact("X") : DEFAULT_HEADER_MAP.x;
    const y = findExact("Y") >= 0 ? findExact("Y") : DEFAULT_HEADER_MAP.y;
    const material = findExact("MATERIAL") >= 0 ? findExact("MATERIAL") : DEFAULT_HEADER_MAP.material;
    const description =
      findIncludes("DESCRICAO") >= 0 ? findIncludes("DESCRICAO") : DEFAULT_HEADER_MAP.description;
    const process = findIncludes("PROCESSO") >= 0 ? findIncludes("PROCESSO") : DEFAULT_HEADER_MAP.process;
    const qtyTotal =
      findIncludes("QTDTOTAL") >= 0 ? findIncludes("QTDTOTAL") : DEFAULT_HEADER_MAP.qtyTotal;

    const score = [qty, x, y, material, description, process].filter((idx) => idx >= 0).length;
    if (score > bestScore) {
      bestScore = score;
      bestHeader = {
        rowNumber,
        qty,
        x,
        y,
        material,
        description,
        process,
        qtyTotal,
      };
    }
  }

  if (bestHeader && bestScore >= 5) {
    return bestHeader;
  }

  return DEFAULT_HEADER_MAP;
};

const buildPartId = (rowIndex: number, description: string, material: string): string => {
  const base = slugify(description || material || `item-${rowIndex + 1}`);
  return `op-${rowIndex + 1}-${base || `item-${rowIndex + 1}`}`;
};

const round = (value: number, decimals = 4): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export function parseOrdemProducaoRows(
  rows: unknown[][],
  sheetName: string,
  options: Partial<OrdemProducaoImportOptions> = {}
): OrdemProducaoImportResult {
  const resolvedOptions: OrdemProducaoImportOptions = {
    acceptedProcesses:
      options.acceptedProcesses && options.acceptedProcesses.length > 0
        ? options.acceptedProcesses
        : DEFAULT_OPTIONS.acceptedProcesses,
    defaultThicknessMm:
      options.defaultThicknessMm && options.defaultThicknessMm > 0
        ? options.defaultThicknessMm
        : DEFAULT_OPTIONS.defaultThicknessMm,
  };

  const acceptedProcesses = new Set(
    resolvedOptions.acceptedProcesses
      .map((item) => normalizeText(item))
      .filter((item) => item.length > 0)
  );

  const headerMap = resolveHeaderMap(rows);
  const parts: SheetPartRect[] = [];
  const materialStats = new Map<string, OrdemProducaoMaterialSummary>();

  let rowsWithDimensions = 0;
  let skippedByProcess = 0;
  let skippedByInvalidQty = 0;
  let fallbackThicknessCount = 0;

  for (let rowIndex = headerMap.rowNumber + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    if (!Array.isArray(row) || row.length === 0) continue;

    const x = parseNumber(row[headerMap.x]);
    const y = parseNumber(row[headerMap.y]);
    if (!(x && y && x > 0 && y > 0)) {
      continue;
    }

    rowsWithDimensions += 1;

    const processRaw = String(row[headerMap.process] ?? "").trim();
    const processNormalized = normalizeText(processRaw);
    if (acceptedProcesses.size > 0 && !acceptedProcesses.has(processNormalized)) {
      skippedByProcess += 1;
      continue;
    }

    const qtyRaw = row[headerMap.qtyTotal] ?? row[headerMap.qty];
    const qtyValue = parseNumber(qtyRaw);
    if (!(qtyValue && qtyValue > 0)) {
      skippedByInvalidQty += 1;
      continue;
    }
    const qty = Math.max(1, Math.round(qtyValue));

    const material = String(row[headerMap.material] ?? "").trim();
    const description = String(row[headerMap.description] ?? "").trim();

    const parsedThickness = parseThicknessMm(material);
    const thicknessMm = parsedThickness ?? resolvedOptions.defaultThicknessMm;
    if (!parsedThickness) {
      fallbackThicknessCount += 1;
    }

    const part: SheetPartRect = {
      id: buildPartId(rowIndex, description, material),
      w: x,
      h: y,
      qty,
      thicknessMm,
      family: materialToFamily(material),
      canRotate: true,
    };
    parts.push(part);

    const key = material || part.family;
    const current = materialStats.get(key) ?? {
      material: key,
      parts: 0,
      qty: 0,
      areaM2: 0,
    };
    current.parts += 1;
    current.qty += qty;
    current.areaM2 += (x * y * qty) / 1_000_000;
    materialStats.set(key, current);
  }

  const totalAreaM2 = parts.reduce((sum, item) => sum + (item.w * item.h * item.qty) / 1_000_000, 0);
  const totalSheetParts = parts.reduce((sum, item) => sum + item.qty, 0);

  const warnings: string[] = [];
  if (parts.length === 0) {
    warnings.push(
      "Nenhuma linha valida para chapa foi encontrada. Revise processos filtrados e colunas X/Y."
    );
  }
  if (skippedByProcess > 0) {
    warnings.push(`${skippedByProcess} linha(s) com dimensao foram ignoradas pelo filtro de processo.`);
  }
  if (skippedByInvalidQty > 0) {
    warnings.push(`${skippedByInvalidQty} linha(s) com dimensao foram ignoradas por quantidade invalida.`);
  }
  if (fallbackThicknessCount > 0) {
    warnings.push(
      `${fallbackThicknessCount} linha(s) usaram espessura padrao de ${resolvedOptions.defaultThicknessMm} mm.`
    );
  }

  const summary: OrdemProducaoImportSummary = {
    sheetName,
    totalRows: rows.length,
    rowsWithDimensions,
    includedRows: parts.length,
    totalSheetParts,
    totalAreaM2: round(totalAreaM2, 3),
    materialBreakdown: Array.from(materialStats.values())
      .sort((a, b) => b.areaM2 - a.areaM2)
      .map((item) => ({
        ...item,
        areaM2: round(item.areaM2, 3),
      })),
    warnings,
  };

  const bom: BuiltBOM = {
    sheetParts: parts,
    tubeParts: [],
    accessories: [],
    processes: [],
  };

  return { bom, summary };
}

export async function importOrdemProducaoExcel(
  file: File,
  options: Partial<OrdemProducaoImportOptions> = {}
): Promise<OrdemProducaoImportResult> {
  if (!file) {
    throw new Error("Arquivo nao informado.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", raw: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Arquivo sem abas validas.");
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error("Nao foi possivel ler a primeira aba.");
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  }) as unknown[][];

  return parseOrdemProducaoRows(rows, sheetName, options);
}
