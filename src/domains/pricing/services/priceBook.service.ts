
import { PriceEntry, PriceBookVersion } from '../types/priceBook.types';
import type { EffectivePricingContext } from '../context/effectivePricingContext';

let cache: PriceEntry[] | null = null;
let inflight: Promise<PriceEntry[]> | null = null;

export async function loadPriceBook(): Promise<PriceEntry[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch('/pricebook.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`PriceBook fetch failed: ${res.status} ${res.statusText}`);
      const data = await res.json();
      const entries = Array.isArray(data) ? data : (Array.isArray(data?.prices) ? data.prices : (Array.isArray(data?.entries) ? data.entries : []));
      const valid = entries.filter(validatePrice);
      cache = valid;
      return valid;
    } catch (err) {
      console.error('[PriceBook]', err);
      cache = [];
      return [];
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function invalidatePriceBookCache() { cache = null; inflight = null; }

export function validatePrice(entry: PriceEntry): boolean {
  if (entry.price <= 0) return false;
  if (!entry.materialId || !entry.supplierId) return false;
  if (!entry.currency || entry.currency !== 'BRL') return false;
  if (!entry.quotedAt) return false;
  const q = Date.parse(entry.quotedAt);
  if (!Number.isFinite(q)) return false;
  if (entry.validUntil) {
    const v = Date.parse(entry.validUntil);
    if (!Number.isFinite(v)) return false;
  }
  return true;
}

export async function getBestPrice(materialId: string, _context?: EffectivePricingContext): Promise<PriceEntry | undefined> {
  const entries = (await loadPriceBook()).filter((e: PriceEntry) => e.materialId === materialId);
  if (!entries.length) return undefined;
  const now = Date.now();
  return entries
    .filter(validatePrice)
    .map((e) => {
      let confidence = typeof e.confidence === 'number' ? e.confidence : 0;
      if (e.validUntil && Date.parse(e.validUntil) < now) confidence -= 0.2;
      return { ...e, _effectiveConfidence: confidence };
    })
    .sort((a: any, b: any) =>
      (b._effectiveConfidence - a._effectiveConfidence) ||
      (a.price - b.price) ||
      (new Date(b.quotedAt).getTime() - new Date(a.quotedAt).getTime())
    )[0];
}

export async function getPrice(materialId: string, supplierId: string): Promise<PriceEntry | undefined> {
  return (await loadPriceBook()).find((e: PriceEntry) => e.materialId === materialId && e.supplierId === supplierId);
}

export async function resolveEffectiveCost(materialId: string, context?: EffectivePricingContext): Promise<number | undefined> {
  const best = await getBestPrice(materialId, context);
  return best?.price;
}

export async function getAllPrices(materialId: string): Promise<PriceEntry[]> {
  return (await loadPriceBook()).filter((e: PriceEntry) => e.materialId === materialId);
}

export async function getLatestPriceBook(): Promise<PriceBookVersion> {
  const entries = await loadPriceBook();
  let versionId = '';
  let createdAt = '';
  let maxQuotedAt = 0;
  if (entries.length > 0) {
    maxQuotedAt = Math.max(...entries.map(e => Date.parse(e.quotedAt) || 0));
    createdAt = new Date(maxQuotedAt).toISOString();
  } else {
    createdAt = new Date(0).toISOString();
  }
  // Tenta buscar versionId do JSON bruto
  try {
    const res = await fetch('/pricebook.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.versionId === 'string') {
        versionId = data.versionId;
      }
    }
  } catch {}
  if (!versionId) {
    versionId = `public-json:${entries.length}:${maxQuotedAt || 0}`;
  }
  return {
    versionId,
    createdAt,
    source: 'csv', // Mantém compatibilidade de tipo, pois 'public-json' não é aceito
    entriesCount: entries.length,
  };
}
