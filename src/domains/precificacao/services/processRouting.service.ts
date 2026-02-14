import processRulesJson from "../config/process_rules.json";
import type { ProcessCategory, ProcessCategoryResolution, ProcessRule } from "../types/opPricing";

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isValidCategory = (value: unknown): value is ProcessCategory =>
  value === "sheet" || value === "tube" || value === "purchase" || value === "other";

const toProcessRule = (raw: Record<string, unknown>): ProcessRule | null => {
  const pattern = String(raw.processNamePattern ?? "").trim();
  const category = raw.category;
  if (!pattern || !isValidCategory(category)) return null;

  return {
    id: raw.id ? String(raw.id) : undefined,
    processNamePattern: pattern,
    category,
    confidence: clamp(toNumber(raw.confidence, 0.7), 0, 1),
    priority: toNumber(raw.priority, 50),
    active: raw.active !== false,
  };
};

export const DEFAULT_PROCESS_RULES: ProcessRule[] = (
  Array.isArray(processRulesJson) ? processRulesJson : []
)
  .map((raw) => (raw && typeof raw === "object" ? toProcessRule(raw as Record<string, unknown>) : null))
  .filter((rule): rule is ProcessRule => Boolean(rule));

const matchesProcess = (normalizedProcess: string, rawPattern: string) => {
  const normalizedPattern = normalize(rawPattern);
  if (!normalizedPattern) return false;

  try {
    const regex = new RegExp(normalizedPattern, "i");
    if (regex.test(normalizedProcess)) return true;
  } catch {
    // fallback para matching simples por tokens
  }

  return normalizedPattern
    .split("|")
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .some((token) => normalizedProcess.includes(token));
};

export function resolveCategoryByProcess(
  process: string,
  rules: ProcessRule[] = DEFAULT_PROCESS_RULES
): ProcessCategoryResolution {
  const normalizedProcess = normalize(process);
  const activeRules = rules.filter((rule) => rule.active !== false);

  let best:
    | {
        rule: ProcessRule;
        score: number;
      }
    | undefined;

  for (const rule of activeRules) {
    if (!matchesProcess(normalizedProcess, rule.processNamePattern)) continue;

    const priority = toNumber(rule.priority, 50);
    const confidence = clamp(toNumber(rule.confidence, 0.7), 0, 1);
    const score = priority * 1000 + confidence * 100;

    if (!best || score > best.score) {
      best = { rule, score };
    }
  }

  if (!best) {
    return {
      category: "other",
      confidence: normalizedProcess ? 0.2 : 0,
      matchedPattern: undefined,
    };
  }

  return {
    category: best.rule.category,
    confidence: clamp(toNumber(best.rule.confidence, 0.7), 0, 1),
    matchedPattern: best.rule.processNamePattern,
  };
}

