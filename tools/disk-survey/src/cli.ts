import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

type Mode = "scan" | "sample" | "deep";

interface CliOptions {
  mode: Mode;
  path: string;
  out: string;
  maxDepth: number;
  maxFiles: number;
  maxSizeMB: number;
  includeExt: string[];
  excludeDirs: string[];
  keywords: string[];
}

interface ColumnSynonyms {
  rowNumber: string[];
  qty: string[];
  qtyTotal: string[];
  blankX: string[];
  blankY: string[];
  material: string[];
  description: string[];
  partCode: string[];
  process: string[];
}

interface MaterialPatternRule {
  materialName: string;
  regex: string;
}

interface MaterialParserRules {
  materialPatterns: MaterialPatternRule[];
  metalKeywords: string[];
  cutProcessKeywords: string[];
  thicknessRegexes: string[];
  thicknessMinMm: number;
  thicknessMaxMm: number;
}

interface DomainRule {
  name: string;
  keywords: string[];
}

interface DomainRules {
  defaultDomain: string;
  domains: DomainRule[];
}

interface InventoryFile {
  filePath: string;
  dirPath: string;
  fileName: string;
  ext: string;
  sizeBytes: number;
  depth: number;
  mtimeMs: number;
  keywordHits: string[];
  relevanceScore: number;
  domain: string;
}

interface FolderStat {
  folderPath: string;
  fileCount: number;
  totalBytes: number;
  relevanceScore: number;
}

interface HeaderDetection {
  headerRowIndex: number;
  score: number;
  columns: Record<keyof ColumnSynonyms, number>;
  matchedColumns: Array<keyof ColumnSynonyms>;
}

interface ParsedMaterial {
  materialName: string | null;
  thicknessMm: number | null;
}

interface OrderItem {
  filePath: string;
  sheetName: string;
  rowIndex: number;
  partCode: string;
  description: string;
  qty: number | null;
  qtyQtd: number | null;
  qtyTotal: number | null;
  process: string;
  blankX: number | null;
  blankY: number | null;
  materialRaw: string;
  materialName: string | null;
  thicknessMm: number | null;
  isCutProcess: boolean;
  isMetalMaterial: boolean;
  isSheetItem: boolean;
}

interface OpFileReport {
  type: "ordem_producao_op";
  filePath: string;
  domain: string;
  sheetName: string;
  headerRow: number;
  detectedColumns: Record<string, number>;
  matchedColumns: string[];
  schemaSignature: string;
  totalItems: number;
  sheetItems: number;
  completeness: {
    pctWithXY: number;
    pctWithMaterialThickness: number;
    pctCutLikeProcess: number;
  };
  topMaterials: Array<{ material: string; count: number }>;
  topThicknesses: Array<{ thicknessMm: number; count: number }>;
  failures: {
    missingX: number;
    missingY: number;
    missingMaterial: number;
    missingThickness: number;
  };
}

interface ScanResult {
  files: InventoryFile[];
  folderStats: FolderStat[];
  extensionDistribution: Record<string, { count: number; totalBytes: number }>;
}

interface MaterialBreakdownRow {
  materialName: string;
  thicknessMm: string;
  totalItems: number;
  totalQty: number;
  totalAreaMm2: number;
  totalAreaM2: number;
  completeItemsPct: number;
  sampleMaterialRaw: string;
}

interface DataQualitySummary {
  totalOrderItems: number;
  itemsWithoutX: number;
  itemsWithoutY: number;
  itemsWithoutMaterial: number;
  itemsWithoutThickness: number;
  itemsWithCommaDecimal: number;
  itemsWithProcessUnknown: number;
}

const DEFAULT_OPTIONS: Omit<CliOptions, "mode"> = {
  path: "D:\\",
  out: "./relatorios",
  maxDepth: 8,
  maxFiles: 30000,
  maxSizeMB: 60,
  includeExt: [".xlsx", ".xlsm", ".xls", ".csv", ".pdf"],
  excludeDirs: [
    "Windows",
    "Program Files",
    "Program Files (x86)",
    "ProgramData",
    "$RECYCLE.BIN",
    "System Volume Information",
    "node_modules",
    ".git"
  ],
  keywords: [
    "ordem",
    "producao",
    "processo",
    "material",
    "chapa",
    "blank",
    "plano de corte",
    "laser",
    "dobra",
    "corte",
    "espessura",
    "orcamento",
    "custo",
    "preco"
  ]
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_DIR = path.resolve(__dirname, "../config");

const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const normalizeToken = (value: string): string =>
  normalizeText(value)
    .replace(/[._:/\\\-]/g, "")
    .replace(/\s+/g, "");

const percent = (num: number, den: number): number => {
  if (den <= 0) return 0;
  return Number(((num / den) * 100).toFixed(2));
};

const round = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/[^\d,.\-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const hasAnyKeyword = (value: string, keywords: string[]): string[] => {
  const normalizedValue = normalizeText(value);
  return keywords.filter((keyword) => normalizedValue.includes(normalizeText(keyword)));
};

const usage = `
Uso:
  node tools/disk-survey/dist/cli.js <scan|sample|deep> [opcoes]

Opcoes:
  --path "D:\\"
  --out "./relatorios"
  --maxDepth 8
  --maxFiles 30000
  --maxSizeMB 60
  --includeExt ".xlsx,.xlsm,.xls,.csv,.pdf"
  --excludeDirs "Windows,Program Files,ProgramData,$RECYCLE.BIN,System Volume Information,node_modules,.git"
  --keywords "ordem,producao,processo,material,chapa,blank,plano de corte,laser,dobra,corte,espessura,orcamento,custo,preco"
`;

function parseArgs(argv: string[]): CliOptions {
  const argCopy = [...argv];
  let mode: Mode = "scan";

  if (argCopy[0] && !argCopy[0].startsWith("--")) {
    const modeArg = argCopy.shift()!.toLowerCase();
    if (modeArg === "scan" || modeArg === "sample" || modeArg === "deep") {
      mode = modeArg;
    } else {
      throw new Error(`Modo invalido: ${modeArg}\n${usage}`);
    }
  }

  const options: CliOptions = {
    mode,
    ...DEFAULT_OPTIONS
  };

  for (let i = 0; i < argCopy.length; i += 1) {
    const token = argCopy[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argCopy[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Flag sem valor: --${key}`);
    }
    i += 1;

    switch (key) {
      case "path":
        options.path = value;
        break;
      case "out":
        options.out = value;
        break;
      case "maxDepth":
        options.maxDepth = Number(value);
        break;
      case "maxFiles":
        options.maxFiles = Number(value);
        break;
      case "maxSizeMB":
        options.maxSizeMB = Number(value);
        break;
      case "includeExt":
        options.includeExt = toList(value).map((ext) => ext.toLowerCase());
        break;
      case "excludeDirs":
        options.excludeDirs = toList(value);
        break;
      case "keywords":
        options.keywords = toList(value);
        break;
      default:
        throw new Error(`Flag desconhecida: --${key}`);
    }
  }

  return options;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function classifyDomain(filePath: string, rules: DomainRules): string {
  const normalizedPath = normalizeText(filePath);
  let bestDomain = rules.defaultDomain;
  let bestScore = 0;

  for (const domain of rules.domains) {
    const score = domain.keywords.reduce((acc, keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return normalizedPath.includes(normalizedKeyword) ? acc + 1 : acc;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain.name;
    }
  }

  return bestDomain;
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const escapeValue = (value: unknown): string => {
    const raw = value === null || typeof value === "undefined" ? "" : String(value);
    const escaped = raw.replace(/"/g, "\"\"");
    if (/[",\n]/.test(escaped)) return `"${escaped}"`;
    return escaped;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeValue(row[header])).join(","));
  }
  return lines.join("\n");
}

async function writeJson(filePath: string, payload: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
}

async function writeCsv(filePath: string, rows: Array<Record<string, unknown>>): Promise<void> {
  await fs.writeFile(filePath, toCsv(rows), "utf-8");
}

async function copyConfigToOutput(outDir: string): Promise<void> {
  const files = ["column_synonyms.json", "material_parser_rules.json", "domain_rules.json"];
  for (const file of files) {
    await fs.copyFile(path.join(CONFIG_DIR, file), path.join(outDir, file));
  }
}

async function scanFilesystem(options: CliOptions, domainRules: DomainRules): Promise<ScanResult> {
  const includeExtSet = new Set(options.includeExt.map((ext) => ext.toLowerCase()));
  const excludeDirSet = new Set(options.excludeDirs.map((dir) => normalizeToken(dir)));
  const maxBytes = options.maxSizeMB * 1024 * 1024;

  const files: InventoryFile[] = [];
  const folderMap = new Map<string, FolderStat>();
  const extMap: Record<string, { count: number; totalBytes: number }> = {};

  const stack: Array<{ dirPath: string; depth: number }> = [{ dirPath: options.path, depth: 0 }];

  while (stack.length > 0 && files.length < options.maxFiles) {
    const current = stack.pop()!;
    let entries;
    try {
      entries = await fs.readdir(current.dirPath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (files.length >= options.maxFiles) break;
      const entryName = String(entry.name);
      const entryPath = path.join(current.dirPath, entryName);
      if (entry.isDirectory()) {
        if (current.depth >= options.maxDepth) continue;
        const normalizedName = normalizeToken(entryName);
        if (excludeDirSet.has(normalizedName)) continue;
        stack.push({ dirPath: entryPath, depth: current.depth + 1 });
        continue;
      }
      if (!entry.isFile()) continue;

      const ext = path.extname(entryName).toLowerCase();
      if (!includeExtSet.has(ext)) continue;

      let stats;
      try {
        stats = await fs.stat(entryPath);
      } catch {
        continue;
      }
      if (stats.size > maxBytes) continue;

      const keywordHits = hasAnyKeyword(entryPath, options.keywords);
      const domain = classifyDomain(entryPath, domainRules);

      let relevanceScore = keywordHits.length;
      const normalizedName = normalizeText(entryName);
      if (normalizedName.includes("ordem") && normalizedName.includes("produc")) relevanceScore += 5;
      if ([".xlsx", ".xlsm", ".xls", ".csv"].includes(ext)) relevanceScore += 1;

      const fileRecord: InventoryFile = {
        filePath: entryPath,
        dirPath: path.dirname(entryPath),
        fileName: entryName,
        ext,
        sizeBytes: stats.size,
        depth: current.depth,
        mtimeMs: stats.mtimeMs,
        keywordHits,
        relevanceScore,
        domain
      };

      files.push(fileRecord);

      const folderStat = folderMap.get(fileRecord.dirPath) ?? {
        folderPath: fileRecord.dirPath,
        fileCount: 0,
        totalBytes: 0,
        relevanceScore: 0
      };
      folderStat.fileCount += 1;
      folderStat.totalBytes += fileRecord.sizeBytes;
      folderStat.relevanceScore += fileRecord.relevanceScore;
      folderMap.set(fileRecord.dirPath, folderStat);

      const extStat = extMap[ext] ?? { count: 0, totalBytes: 0 };
      extStat.count += 1;
      extStat.totalBytes += fileRecord.sizeBytes;
      extMap[ext] = extStat;
    }
  }

  return {
    files,
    folderStats: Array.from(folderMap.values()),
    extensionDistribution: extMap
  };
}

function pickTargets(mode: Mode, files: InventoryFile[], folderStats: FolderStat[]): InventoryFile[] {
  if (mode === "scan") return [];

  const spreadsheetFiles = files.filter((file) =>
    [".xlsx", ".xlsm", ".xls", ".csv", ".pdf"].includes(file.ext)
  );

  const isOrderHint = (file: InventoryFile) => {
    const name = normalizeText(file.fileName);
    return name.includes("ordem") && name.includes("produc");
  };

  const byRelevance = [...spreadsheetFiles].sort((a, b) => b.relevanceScore - a.relevanceScore);
  if (mode === "sample") {
    const firstWave = byRelevance.slice(0, 700);
    const orderWave = byRelevance.filter((file) => isOrderHint(file)).slice(0, 1400);
    const merged = new Map<string, InventoryFile>();
    for (const file of [...orderWave, ...firstWave]) {
      merged.set(file.filePath, file);
    }
    return Array.from(merged.values());
  }

  const candidateFolders = [...folderStats]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 60)
    .map((item) => normalizeText(item.folderPath));
  const candidateSet = new Set(candidateFolders);

  const deepCandidates = byRelevance.filter((file) => {
    const normalizedFolder = normalizeText(file.dirPath);
    const inCandidate = Array.from(candidateSet).some((folder) => normalizedFolder.startsWith(folder));
    const hasOrderHint = isOrderHint(file);
    return inCandidate || hasOrderHint || file.relevanceScore >= 3;
  });

  const merged = new Map<string, InventoryFile>();
  for (const file of deepCandidates) {
    merged.set(file.filePath, file);
  }
  for (const file of byRelevance.filter((item) => isOrderHint(item)).slice(0, 2500)) {
    merged.set(file.filePath, file);
  }

  return Array.from(merged.values()).slice(0, 3000);
}

function compileColumnSynonyms(config: ColumnSynonyms): Record<keyof ColumnSynonyms, string[]> {
  const output = {} as Record<keyof ColumnSynonyms, string[]>;
  const keys = Object.keys(config) as Array<keyof ColumnSynonyms>;
  for (const key of keys) {
    output[key] = config[key].map((value) => normalizeToken(value));
  }
  return output;
}

function detectHeader(
  rows: unknown[][],
  synonyms: Record<keyof ColumnSynonyms, string[]>
): HeaderDetection | null {
  const keys = Object.keys(synonyms) as Array<keyof ColumnSynonyms>;
  let best: HeaderDetection | null = null;

  const maxProbeRows = Math.min(rows.length, 90);
  for (let rowIndex = 0; rowIndex < maxProbeRows; rowIndex += 1) {
    const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [];
    const normalizedCells = row.map((cell) => normalizeToken(String(cell ?? "")));

    const columns = {} as Record<keyof ColumnSynonyms, number>;
    const matchedColumns: Array<keyof ColumnSynonyms> = [];

    for (const key of keys) {
      const candidates = synonyms[key];
      let idx = -1;
      for (let i = 0; i < normalizedCells.length; i += 1) {
        const cell = normalizedCells[i];
        if (!cell) continue;
        const exactMatch = candidates.some((candidate) => candidate === cell);
        if (exactMatch) {
          idx = i;
          break;
        }
      }
      if (idx < 0) {
        for (let i = 0; i < normalizedCells.length; i += 1) {
          const cell = normalizedCells[i];
          if (!cell) continue;
          const partialMatch = candidates.some(
            (candidate) => candidate.length >= 4 && cell.includes(candidate)
          );
          if (partialMatch) {
            idx = i;
            break;
          }
        }
      }
      columns[key] = idx;
      if (idx >= 0) matchedColumns.push(key);
    }

    const score = [
      columns.qty,
      columns.blankX,
      columns.blankY,
      columns.material,
      columns.description,
      columns.process
    ].filter((idx) => idx >= 0).length;

    if (!best || score > best.score) {
      best = {
        headerRowIndex: rowIndex,
        score,
        columns,
        matchedColumns
      };
    }
  }

  return best;
}

function buildMaterialParsers(rules: MaterialParserRules) {
  const materialRegexes = rules.materialPatterns.map((rule) => ({
    materialName: rule.materialName,
    regex: new RegExp(rule.regex, "i")
  }));
  const thicknessRegexes = rules.thicknessRegexes.map((pattern) => new RegExp(pattern, "gi"));
  const metalKeywords = rules.metalKeywords.map((keyword) => normalizeText(keyword));
  const cutKeywords = rules.cutProcessKeywords.map((keyword) => normalizeText(keyword));

  const inferMaterial = (materialRaw: string): ParsedMaterial => {
    let materialName: string | null = null;
    for (const rule of materialRegexes) {
      if (rule.regex.test(materialRaw)) {
        materialName = rule.materialName;
        break;
      }
    }

    const thicknessCandidates: Array<{ value: number; hasDecimal: boolean }> = [];
    for (const regex of thicknessRegexes) {
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(materialRaw)) !== null) {
        const candidateRaw = match[1] ?? match[0];
        const parsed = parseNumber(candidateRaw);
        if (!parsed) continue;
        if (parsed < rules.thicknessMinMm || parsed > rules.thicknessMaxMm) continue;
        thicknessCandidates.push({
          value: parsed,
          hasDecimal: candidateRaw.includes(",") || candidateRaw.includes(".")
        });
      }
    }

    let thicknessMm: number | null = null;
    if (thicknessCandidates.length > 0) {
      const preferred =
        thicknessCandidates.find((candidate) => candidate.hasDecimal) ?? thicknessCandidates[0];
      thicknessMm = preferred.value;
    }

    return { materialName, thicknessMm };
  };

  const isMetalMaterial = (raw: string): boolean => {
    const normalized = normalizeText(raw);
    return metalKeywords.some((keyword) => normalized.includes(keyword));
  };

  const isCutLikeProcess = (raw: string): boolean => {
    const normalized = normalizeText(raw);
    return cutKeywords.some((keyword) => normalized.includes(keyword));
  };

  return { inferMaterial, isMetalMaterial, isCutLikeProcess };
}

function schemaSignature(columns: Record<string, number>): string {
  return Object.entries(columns)
    .filter(([, idx]) => idx >= 0)
    .map(([key, idx]) => `${key}:${idx + 1}`)
    .sort()
    .join(" | ");
}

function extractOpFromSheet(params: {
  file: InventoryFile;
  sheetName: string;
  rows: unknown[][];
  header: HeaderDetection;
  materialRules: MaterialParserRules;
}): { report: OpFileReport; items: OrderItem[]; quality: DataQualitySummary } {
  const { file, sheetName, rows, header, materialRules } = params;
  const parsers = buildMaterialParsers(materialRules);
  const items: OrderItem[] = [];

  let missingX = 0;
  let missingY = 0;
  let missingMaterial = 0;
  let missingThickness = 0;
  let itemsWithCommaDecimal = 0;
  let processUnknown = 0;

  let blankStreak = 0;
  for (let rowIndex = header.headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [];
    const rawValues = row.map((cell) => String(cell ?? "").trim());
    const isEmpty = rawValues.every((value) => value === "");
    if (isEmpty) {
      blankStreak += 1;
      if (blankStreak >= 25) break;
      continue;
    }
    blankStreak = 0;

    const getCell = (index: number): string => (index >= 0 ? String(row[index] ?? "").trim() : "");
    const partCode = getCell(header.columns.partCode);
    const description = getCell(header.columns.description);
    const process = getCell(header.columns.process);
    const materialRaw = getCell(header.columns.material);
    const xRaw = getCell(header.columns.blankX);
    const yRaw = getCell(header.columns.blankY);
    const qtyQtdRaw = getCell(header.columns.qty);
    const qtyTotalRaw = getCell(header.columns.qtyTotal);

    const qtyQtd = parseNumber(qtyQtdRaw);
    const qtyTotal = parseNumber(qtyTotalRaw);
    const qty = qtyTotal ?? qtyQtd;
    const blankX = parseNumber(xRaw);
    const blankY = parseNumber(yRaw);

    if (xRaw.includes(",") || yRaw.includes(",") || materialRaw.includes(",")) {
      itemsWithCommaDecimal += 1;
    }

    const inferred = parsers.inferMaterial(materialRaw);
    const isMetalMaterial = parsers.isMetalMaterial(materialRaw);
    const isCutProcess = parsers.isCutLikeProcess(process);
    const isSheetItem = Boolean(blankX && blankY && isMetalMaterial);

    if (!blankX) missingX += 1;
    if (!blankY) missingY += 1;
    if (!materialRaw) missingMaterial += 1;
    if (!inferred.thicknessMm) missingThickness += 1;
    if (!process) processUnknown += 1;

    if (!partCode && !description && !materialRaw && !process && !blankX && !blankY) {
      continue;
    }

    items.push({
      filePath: file.filePath,
      sheetName,
      rowIndex: rowIndex + 1,
      partCode,
      description,
      qty: qty ?? null,
      qtyQtd: qtyQtd ?? null,
      qtyTotal: qtyTotal ?? null,
      process,
      blankX: blankX ?? null,
      blankY: blankY ?? null,
      materialRaw,
      materialName: inferred.materialName,
      thicknessMm: inferred.thicknessMm,
      isCutProcess,
      isMetalMaterial,
      isSheetItem
    });
  }

  const topMaterials = new Map<string, number>();
  const topThicknesses = new Map<number, number>();
  let withXY = 0;
  let withMaterialAndThickness = 0;
  let cutLike = 0;
  let sheetItems = 0;

  for (const item of items) {
    if (item.blankX && item.blankY) withXY += 1;
    if (item.materialName && item.thicknessMm) withMaterialAndThickness += 1;
    if (item.isCutProcess) cutLike += 1;
    if (item.isSheetItem) sheetItems += 1;

    const materialKey = item.materialName ?? item.materialRaw ?? "MATERIAL_DESCONHECIDO";
    topMaterials.set(materialKey, (topMaterials.get(materialKey) ?? 0) + 1);
    if (item.thicknessMm) {
      topThicknesses.set(item.thicknessMm, (topThicknesses.get(item.thicknessMm) ?? 0) + 1);
    }
  }

  const report: OpFileReport = {
    type: "ordem_producao_op",
    filePath: file.filePath,
    domain: file.domain,
    sheetName,
    headerRow: header.headerRowIndex + 1,
    detectedColumns: Object.fromEntries(
      Object.entries(header.columns).map(([key, value]) => [key, value >= 0 ? value + 1 : 0])
    ),
    matchedColumns: header.matchedColumns,
    schemaSignature: schemaSignature(header.columns as Record<string, number>),
    totalItems: items.length,
    sheetItems,
    completeness: {
      pctWithXY: percent(withXY, items.length),
      pctWithMaterialThickness: percent(withMaterialAndThickness, items.length),
      pctCutLikeProcess: percent(cutLike, items.length)
    },
    topMaterials: [...topMaterials.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([material, count]) => ({ material, count })),
    topThicknesses: [...topThicknesses.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([thicknessMm, count]) => ({ thicknessMm, count })),
    failures: {
      missingX,
      missingY,
      missingMaterial,
      missingThickness
    }
  };

  const quality: DataQualitySummary = {
    totalOrderItems: items.length,
    itemsWithoutX: missingX,
    itemsWithoutY: missingY,
    itemsWithoutMaterial: missingMaterial,
    itemsWithoutThickness: missingThickness,
    itemsWithCommaDecimal,
    itemsWithProcessUnknown: processUnknown
  };

  return { report, items, quality };
}

async function analyzeSpreadsheet(
  file: InventoryFile,
  mode: Mode,
  synonyms: Record<keyof ColumnSynonyms, string[]>,
  materialRules: MaterialParserRules
): Promise<{ report?: OpFileReport; items: OrderItem[]; quality: DataQualitySummary }> {
  const emptyQuality: DataQualitySummary = {
    totalOrderItems: 0,
    itemsWithoutX: 0,
    itemsWithoutY: 0,
    itemsWithoutMaterial: 0,
    itemsWithoutThickness: 0,
    itemsWithCommaDecimal: 0,
    itemsWithProcessUnknown: 0
  };

  const fileHasOrderHint =
    normalizeText(file.fileName).includes("ordem") && normalizeText(file.fileName).includes("produc");
  const debugEnabled = process.env.DISK_SURVEY_DEBUG === "1";

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.readFile(file.filePath, {
      raw: false,
      dense: false,
      cellDates: false
    });
  } catch (error) {
    if (debugEnabled && fileHasOrderHint) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`[debug] erro readFile: ${file.filePath} -> ${msg}`);
    }
    return { items: [], quality: emptyQuality };
  }

  const hasProcessSheet = workbook.SheetNames.some(
    (sheetName) => normalizeToken(sheetName) === normalizeToken("PROCESSO")
  );

  let bestDetection:
    | { sheetName: string; rows: unknown[][]; header: HeaderDetection; signalScore: number }
    | undefined;

  const sheetRowLimit = mode === "sample" ? 2500 : 80000;

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: ""
    }) as unknown[][];
    const boundedRows = rows.slice(0, sheetRowLimit);

    const header = detectHeader(boundedRows, synonyms);
    if (!header) continue;

    let signalScore = header.score;
    if (normalizeToken(sheetName) === normalizeToken("PROCESSO")) signalScore += 2;
    if (hasProcessSheet) signalScore += 1;
    if (fileHasOrderHint) signalScore += 1;

    if (!bestDetection || signalScore > bestDetection.signalScore) {
      bestDetection = { sheetName, rows: boundedRows, header, signalScore };
    }
  }

  if (!bestDetection) {
    if (debugEnabled && fileHasOrderHint) {
      console.log(`[debug] sem header OP: ${file.filePath}`);
    }
    return { items: [], quality: emptyQuality };
  }

  const isOp =
    bestDetection.header.score >= 6 ||
    (bestDetection.header.score >= 5 && (hasProcessSheet || fileHasOrderHint));

  if (debugEnabled && fileHasOrderHint) {
    console.log(
      `[debug] ${file.filePath} score=${bestDetection.header.score} hasProcessSheet=${hasProcessSheet} isOp=${isOp}`
    );
  }

  if (!isOp) {
    return { items: [], quality: emptyQuality };
  }

  return extractOpFromSheet({
    file,
    sheetName: bestDetection.sheetName,
    rows: bestDetection.rows,
    header: bestDetection.header,
    materialRules
  });
}

function buildMaterialBreakdown(items: OrderItem[]): MaterialBreakdownRow[] {
  const map = new Map<string, MaterialBreakdownRow & { completeItems: number }>();

  for (const item of items) {
    const materialName = item.materialName ?? "MATERIAL_RAW";
    const thicknessKey = item.thicknessMm ? String(item.thicknessMm) : "NA";
    const key = `${materialName}|${thicknessKey}`;
    const qty = item.qty ?? item.qtyTotal ?? item.qtyQtd ?? 1;
    const areaMm2 = item.blankX && item.blankY ? item.blankX * item.blankY * qty : 0;

    const current = map.get(key) ?? {
      materialName,
      thicknessMm: thicknessKey,
      totalItems: 0,
      totalQty: 0,
      totalAreaMm2: 0,
      totalAreaM2: 0,
      completeItemsPct: 0,
      sampleMaterialRaw: item.materialRaw,
      completeItems: 0
    };

    current.totalItems += 1;
    current.totalQty += qty;
    current.totalAreaMm2 += areaMm2;
    current.totalAreaM2 = current.totalAreaMm2 / 1_000_000;
    if (item.blankX && item.blankY && item.materialName && item.thicknessMm) {
      current.completeItems += 1;
    }
    map.set(key, current);
  }

  return Array.from(map.values())
    .map((row) => ({
      materialName: row.materialName,
      thicknessMm: row.thicknessMm,
      totalItems: row.totalItems,
      totalQty: row.totalQty,
      totalAreaMm2: round(row.totalAreaMm2, 2),
      totalAreaM2: round(row.totalAreaM2, 4),
      completeItemsPct: percent(row.completeItems, row.totalItems),
      sampleMaterialRaw: row.sampleMaterialRaw
    }))
    .sort((a, b) => b.totalAreaMm2 - a.totalAreaMm2);
}

function aggregateDataQuality(items: OrderItem[], qualityRows: DataQualitySummary[]): DataQualitySummary {
  const base: DataQualitySummary = {
    totalOrderItems: items.length,
    itemsWithoutX: 0,
    itemsWithoutY: 0,
    itemsWithoutMaterial: 0,
    itemsWithoutThickness: 0,
    itemsWithCommaDecimal: 0,
    itemsWithProcessUnknown: 0
  };

  for (const row of qualityRows) {
    base.itemsWithoutX += row.itemsWithoutX;
    base.itemsWithoutY += row.itemsWithoutY;
    base.itemsWithoutMaterial += row.itemsWithoutMaterial;
    base.itemsWithoutThickness += row.itemsWithoutThickness;
    base.itemsWithCommaDecimal += row.itemsWithCommaDecimal;
    base.itemsWithProcessUnknown += row.itemsWithProcessUnknown;
  }

  return base;
}

function buildDomainsSummaryMarkdown(files: InventoryFile[], opReports: OpFileReport[]): string {
  const domainFileCount = new Map<string, number>();
  const domainBytes = new Map<string, number>();
  const domainOps = new Map<string, number>();

  for (const file of files) {
    domainFileCount.set(file.domain, (domainFileCount.get(file.domain) ?? 0) + 1);
    domainBytes.set(file.domain, (domainBytes.get(file.domain) ?? 0) + file.sizeBytes);
  }
  for (const report of opReports) {
    domainOps.set(report.domain, (domainOps.get(report.domain) ?? 0) + 1);
  }

  const rows = Array.from(domainFileCount.keys())
    .sort()
    .map((domain) => {
      const filesCount = domainFileCount.get(domain) ?? 0;
      const totalMB = (domainBytes.get(domain) ?? 0) / (1024 * 1024);
      const opCount = domainOps.get(domain) ?? 0;
      return `| ${domain} | ${filesCount} | ${totalMB.toFixed(2)} | ${opCount} |`;
    });

  return [
    "# Domains Summary",
    "",
    "| Dominio | Arquivos | Volume MB | OP detectadas |",
    "|---|---:|---:|---:|",
    ...rows,
    "",
    "Regras de dominio usadas no processamento: `domain_rules.json`."
  ].join("\n");
}

function buildOpCatalogMarkdown(opReports: OpFileReport[]): string {
  const header = [
    "# OP Catalog",
    "",
    "| Arquivo | Dominio | Aba | Header | Itens | Itens de chapa | XY% | Material+Espessura% | Schema |",
    "|---|---|---|---:|---:|---:|---:|---:|---|"
  ];

  const rows = opReports.map((report) => {
    return `| ${report.filePath.replace(/\|/g, "\\|")} | ${report.domain} | ${report.sheetName} | ${
      report.headerRow
    } | ${report.totalItems} | ${report.sheetItems} | ${report.completeness.pctWithXY}% | ${
      report.completeness.pctWithMaterialThickness
    }% | ${report.schemaSignature.replace(/\|/g, "\\|")} |`;
  });

  return [...header, ...rows].join("\n");
}

function buildDataQualityMarkdown(summary: DataQualitySummary, opReports: OpFileReport[]): string {
  const recurrentFailures = [
    `Itens sem X: ${summary.itemsWithoutX}`,
    `Itens sem Y: ${summary.itemsWithoutY}`,
    `Itens sem material: ${summary.itemsWithoutMaterial}`,
    `Itens sem espessura inferida: ${summary.itemsWithoutThickness}`,
    `Itens com decimal por virgula: ${summary.itemsWithCommaDecimal}`,
    `Itens sem processo: ${summary.itemsWithProcessUnknown}`
  ];

  const schemaVariations = new Map<string, number>();
  for (const report of opReports) {
    schemaVariations.set(report.schemaSignature, (schemaVariations.get(report.schemaSignature) ?? 0) + 1);
  }

  const variations = [...schemaVariations.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([schema, count]) => `- ${count} arquivo(s): ${schema}`);

  return [
    "# Data Quality",
    "",
    `Total de itens de OP analisados: ${summary.totalOrderItems}`,
    "",
    "## Problemas recorrentes",
    ...recurrentFailures.map((line) => `- ${line}`),
    "",
    "## Variacoes de schema",
    ...(variations.length > 0 ? variations : ["- Nenhuma variacao registrada."]),
    "",
    "Observacoes:",
    "- Priorizar normalizacao de separador decimal (virgula/ponto).",
    "- Converter X/Y em numero com unidade mm padrao.",
    "- Tratar material sem espessura como pendencia para precificacao."
  ].join("\n");
}

function buildPricingPlanMarkdown(materialBreakdown: MaterialBreakdownRow[]): string {
  const topRows = materialBreakdown.slice(0, 12);
  const tableRows = topRows.map(
    (row) =>
      `| ${row.materialName} | ${row.thicknessMm} | ${row.totalQty} | ${row.totalAreaM2.toFixed(
        3
      )} | ${row.completeItemsPct}% |`
  );

  return [
    "# Pricing Integration Plan",
    "",
    "## Modelo normalizado recomendado (TypeScript)",
    "```ts",
    "export interface OrderItemNormalized {",
    "  sourceFile: string;",
    "  domain: string;",
    "  sheetName: string;",
    "  rowIndex: number;",
    "  partCode?: string;",
    "  description: string;",
    "  qty: number;",
    "  qtyQtd?: number | null;",
    "  qtyTotal?: number | null;",
    "  process?: string;",
    "  blankX?: number | null;",
    "  blankY?: number | null;",
    "  materialRaw: string;",
    "  materialName?: string | null;",
    "  thicknessMm?: number | null;",
    "}",
    "",
    "export interface SheetDemandGroup {",
    "  materialKey: string; // materialName+thickness, fallback materialRaw",
    "  totalQty: number;",
    "  totalAreaMm2: number;",
    "  completePct: number;",
    "}",
    "```",
    "",
    "## Regra de estimativa de consumo de chapa",
    "```txt",
    "area_total = sum(qty * X * Y)",
    "chapas = ceil( area_total * (1 + sucata) / (area_chapa * eficiencia) )",
    "```",
    "",
    "## Regras de fallback",
    "- Se espessura ausente: agrupar por `materialRaw` e marcar pendencia de cadastro.",
    "- Se X/Y ausente: item nao entra na area; registrar em pendencias para engenharia.",
    "- Se processo nao for corte/laser/plasma/CNC: manter item para custo indireto, mas nao para area de chapa.",
    "",
    "## Material x Espessura (top amostra)",
    "| Material | Espessura | Total Pecas | Area Total m2 | Itens Completos % |",
    "|---|---:|---:|---:|---:|",
    ...tableRows
  ].join("\n");
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  await ensureDir(options.out);

  const columnSynonyms = await readJsonFile<ColumnSynonyms>(path.join(CONFIG_DIR, "column_synonyms.json"));
  const materialRules = await readJsonFile<MaterialParserRules>(
    path.join(CONFIG_DIR, "material_parser_rules.json")
  );
  const domainRules = await readJsonFile<DomainRules>(path.join(CONFIG_DIR, "domain_rules.json"));
  const compiledSynonyms = compileColumnSynonyms(columnSynonyms);

  console.log(`[disk-survey] Modo: ${options.mode}`);
  console.log(`[disk-survey] Escaneando: ${options.path}`);

  const scan = await scanFilesystem(options, domainRules);
  const targets = pickTargets(options.mode, scan.files, scan.folderStats);

  const opReports: OpFileReport[] = [];
  const opItems: OrderItem[] = [];
  const qualityRows: DataQualitySummary[] = [];

  if (options.mode !== "scan") {
    console.log(`[disk-survey] Arquivos para analise ${options.mode}: ${targets.length}`);
    let processed = 0;
    for (const file of targets) {
      processed += 1;
      if (processed % 100 === 0) {
        console.log(`[disk-survey] Progresso analise: ${processed}/${targets.length}`);
      }
      if (![".xlsx", ".xlsm", ".xls", ".csv"].includes(file.ext)) {
        continue;
      }

      const analyzed = await analyzeSpreadsheet(file, options.mode, compiledSynonyms, materialRules);
      if (analyzed.report) opReports.push(analyzed.report);
      if (analyzed.items.length > 0) opItems.push(...analyzed.items);
      if (analyzed.quality.totalOrderItems > 0) qualityRows.push(analyzed.quality);
    }
  }

  const qualitySummary = aggregateDataQuality(opItems, qualityRows);
  const materialBreakdown = buildMaterialBreakdown(opItems);

  const inventoryRows = scan.files.map((file) => ({
    filePath: file.filePath,
    ext: file.ext,
    sizeBytes: file.sizeBytes,
    sizeMB: round(file.sizeBytes / (1024 * 1024), 3),
    domain: file.domain,
    relevanceScore: file.relevanceScore,
    keywordHits: file.keywordHits.join("; ")
  }));

  const folderRows = [...scan.folderStats]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 300)
    .map((folder) => ({
      folderPath: folder.folderPath,
      fileCount: folder.fileCount,
      totalMB: round(folder.totalBytes / (1024 * 1024), 2),
      relevanceScore: folder.relevanceScore
    }));

  const inventorySummary = {
    generatedAt: new Date().toISOString(),
    mode: options.mode,
    options,
    totals: {
      filesIndexed: scan.files.length,
      foldersRanked: scan.folderStats.length,
      opDetected: opReports.length,
      opItems: opItems.length
    },
    extensionDistribution: scan.extensionDistribution
  };

  await writeJson(path.join(options.out, "inventory.json"), inventorySummary);
  await writeCsv(path.join(options.out, "inventory.csv"), inventoryRows);
  await writeCsv(path.join(options.out, "folders_ranking.csv"), folderRows);

  await writeJson(path.join(options.out, "op_orders.json"), opReports);
  await writeCsv(
    path.join(options.out, "op_items_normalized.csv"),
    opItems.map((item) => ({
      filePath: item.filePath,
      sheetName: item.sheetName,
      rowIndex: item.rowIndex,
      partCode: item.partCode,
      description: item.description,
      qty: item.qty,
      qtyQtd: item.qtyQtd,
      qtyTotal: item.qtyTotal,
      process: item.process,
      blankX: item.blankX,
      blankY: item.blankY,
      materialRaw: item.materialRaw,
      materialName: item.materialName,
      thicknessMm: item.thicknessMm,
      isCutProcess: item.isCutProcess,
      isSheetItem: item.isSheetItem
    }))
  );
  await writeCsv(
    path.join(options.out, "material_thickness_breakdown.csv"),
    materialBreakdown.map((row) => ({ ...row }))
  );

  await fs.writeFile(path.join(options.out, "domains_summary.md"), buildDomainsSummaryMarkdown(scan.files, opReports));
  await fs.writeFile(path.join(options.out, "op_catalog.md"), buildOpCatalogMarkdown(opReports));
  await fs.writeFile(path.join(options.out, "data_quality.md"), buildDataQualityMarkdown(qualitySummary, opReports));
  await fs.writeFile(
    path.join(options.out, "pricing_integration_plan.md"),
    buildPricingPlanMarkdown(materialBreakdown)
  );

  await copyConfigToOutput(options.out);

  console.log(`[disk-survey] Concluido. Relatorios em: ${path.resolve(options.out)}`);
  console.log(
    `[disk-survey] OP detectadas: ${opReports.length} | Itens normalizados: ${opItems.length}`
  );
}

main().catch((error) => {
  console.error("[disk-survey] Falha:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
