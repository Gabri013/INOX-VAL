import type { MaterialClassification, MaterialKind, MaterialNameNormalized } from "../types/opPricing";

export interface ClassifyMaterialOptions {
  description?: string;
  partCode?: string;
}

const NON_METAL_PATTERN = /\b(MDF|VIDRO|PLAST|NYLON|GRANITO)\b/;
const TUBE_PROFILE_PATTERN = /\b(TUBO|PERF|PERFIL)\b|Ø|\b\d{1,4}\s*[Xx]\s*\d{1,4}\s*[Xx]\s*\d{1,3}(?:[.,]\d+)?\b/;
const SHEET_COMPOSED_PATTERN =
  /(#?\s*304|#?\s*430|#?\s*316|GALV|ALUZINC|GALVALUME|ALUMINIO|ALUMINIO)\s*[-_/ ]+\s*(\d+(?:[.,]\d+)?)\s*(?:MM)?\s*[-_/ ]+\s*([A-Z0-9._-]{2,})/i;

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw.replace(/\s/g, "").replace(/[^\d,.-]/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeMaterialName = (source: string): MaterialNameNormalized | null => {
  const normalized = normalize(source);
  if (!normalized) return null;

  if (/\b304\b|#304/.test(normalized)) return "#304";
  if (/\b430\b|#430/.test(normalized)) return "#430";
  if (/\b316\b|#316/.test(normalized)) return "#316";
  if (/ALUZINC|GALVALUME/.test(normalized)) return "ALUZINC";
  if (/GALV|GALVAN/.test(normalized)) return "GALV";
  if (/ALUM|ALUMIN/.test(normalized)) return "ALUMINIO";
  if (/AISI|1020|ACO|AÇO|CARBONO/.test(normalized)) return "ACO";
  if (/INOX/.test(normalized)) return "INOX";
  return "OUTRO";
};

const inferThicknessFromText = (source: string): number | null => {
  if (!source.trim()) return null;

  const decimalMatches = source.match(/\d+[.,]\d+/g) ?? [];
  for (const match of decimalMatches) {
    const value = parseNumber(match);
    if (value && value >= 0.2 && value <= 20) return value;
  }

  const mmMatches = source.match(/(\d{1,2})\s*MM/gi) ?? [];
  for (const match of mmMatches) {
    const value = parseNumber(match);
    if (value && value >= 0.2 && value <= 20) return value;
  }

  return null;
};

const extractRawMaterialCode = (source: string): string | null => {
  if (!source.trim()) return null;
  const match =
    source.match(/\b(MP[-_/ ]?\d{2,}|MAT[-_/ ]?\d{2,}|COD[-_/ ]?[A-Z0-9]{2,}|[A-Z]{2,}\d{3,})\b/i) ??
    source.match(/\b[A-Z0-9]{4,}\b/i);
  return match ? match[0].trim() : null;
};

const inferThicknessFromRawMaterialCode = (rawMaterialCode: string | null): number | null => {
  const normalized = normalize(rawMaterialCode);
  if (!normalized) return null;

  const decimal = inferThicknessFromText(normalized);
  if (decimal) return decimal;

  const directMm = normalized.match(/(\d{1,2})(?=MM)/);
  if (directMm) {
    const value = parseNumber(directMm[1]);
    if (value && value >= 0.2 && value <= 20) return value;
  }

  const compact = normalized.match(/\b(\d{2})\b/);
  if (compact) {
    const value = parseNumber(compact[1]);
    if (value && value >= 3 && value <= 60) return value / 10;
  }

  return null;
};

const isKnownSheetMaterial = (materialName: MaterialNameNormalized | null) =>
  materialName === "#304" ||
  materialName === "#430" ||
  materialName === "#316" ||
  materialName === "GALV" ||
  materialName === "ALUZINC" ||
  materialName === "ALUMINIO";

export function classifyMaterial(
  materialRaw: string,
  options: ClassifyMaterialOptions = {}
): MaterialClassification {
  const materialText = String(materialRaw ?? "").trim();
  const description = String(options.description ?? "").trim();
  const partCode = String(options.partCode ?? "").trim();
  const joined = `${materialText} ${description} ${partCode}`.trim();
  const normalizedJoined = normalize(joined);

  const materialName = normalizeMaterialName(joined);
  const rawMaterialCode =
    extractRawMaterialCode(materialText) || extractRawMaterialCode(partCode) || extractRawMaterialCode(description);

  let thicknessMm =
    inferThicknessFromText(materialText) ||
    inferThicknessFromText(description) ||
    inferThicknessFromText(partCode) ||
    inferThicknessFromRawMaterialCode(rawMaterialCode);

  if (thicknessMm && thicknessMm > 20) {
    thicknessMm = null;
  }

  let kind: MaterialKind = "unknown";
  let confidence = 0.2;

  if (NON_METAL_PATTERN.test(normalizedJoined)) {
    kind = "non_metal";
    confidence = 0.95;
  } else if (TUBE_PROFILE_PATTERN.test(normalizedJoined)) {
    kind = "tube_profile";
    confidence = 0.92;
  } else if (isKnownSheetMaterial(materialName)) {
    const hasStructuredPattern = SHEET_COMPOSED_PATTERN.test(normalizedJoined);
    if (thicknessMm) {
      kind = "sheet_metal";
      confidence = hasStructuredPattern ? 0.95 : 0.78;
    } else {
      kind = "sheet_metal";
      confidence = 0.6;
    }
  } else if ((materialName === "INOX" || materialName === "ACO") && thicknessMm) {
    kind = "sheet_metal";
    confidence = 0.65;
  }

  return {
    kind,
    materialName,
    thicknessMm,
    rawMaterialCode,
    confidence,
  };
}

