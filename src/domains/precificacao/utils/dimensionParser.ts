export interface ParsedDimension {
  larguraMm: number;
  profundidadeMm: number;
  alturaMm?: number;
}

export function parseDimension(input?: string): ParsedDimension | null {
  if (!input) return null;
  const normalized = input
    .replace(/,/g, ".")
    .replace(/\s+/g, "")
    .replace(/[×x]/gi, "X");

  const match = normalized.match(/(\d{2,4}(?:\.\d+)?)X(\d{2,4}(?:\.\d+)?)(?:X(\d{2,4}(?:\.\d+)?))?/i);
  if (!match) return null;

  const larguraMm = Number(match[1]);
  const profundidadeMm = Number(match[2]);
  const alturaMm = match[3] ? Number(match[3]) : undefined;

  if (!Number.isFinite(larguraMm) || !Number.isFinite(profundidadeMm)) return null;

  return {
    larguraMm,
    profundidadeMm,
    alturaMm: Number.isFinite(alturaMm as number) ? alturaMm : undefined,
  };
}
