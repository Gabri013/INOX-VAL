// Usecase: calculateBancadasQuoteFromForm
import { mapBancadasFormToQuoteInput } from '../adapters/bancadas.adapter';
import { calculateQuote } from '../quote.engine';

export interface BancadasDiagnostics {
  errors: string[];
  missingPrices: string[];
  warnings: string[];
}

export async function calculateBancadasQuoteFromForm(formData: any, priceBook: any): Promise<{ quote: any; diagnostics: BancadasDiagnostics }> {
  const diagnostics: BancadasDiagnostics = { errors: [], missingPrices: [], warnings: [] };
  let quoteInput;
  try {
    quoteInput = mapBancadasFormToQuoteInput(formData);
  } catch (e: any) {
    diagnostics.errors.push(e.message);
    return { quote: null, diagnostics };
  }
  // PriceBook lookup helper
  function getPrice(materialId: string): { price?: number; unit?: string; validUntil?: string } {
    const entry = priceBook?.materials?.find((m: any) => m.id === materialId);
    return entry ? { price: entry.price, unit: entry.unit, validUntil: entry.validUntil } : {};
  }
  // Check prices
  const materialIds = [quoteInput.tampo?.materialId, quoteInput.cuba?.materialId].filter(Boolean);
  for (const matId of materialIds) {
    const { price, unit, validUntil } = getPrice(matId!);
    if (price === undefined) diagnostics.missingPrices.push(matId!);
    if (unit && !['kg', 'm2', 'm', 'un'].includes(unit)) diagnostics.warnings.push(`Unidade divergente: ${unit} (${matId})`);
    if (validUntil && new Date(validUntil) < new Date()) diagnostics.warnings.push(`Preço expirado: ${matId}`);
  }
  // Markup e scrap
  if (quoteInput.pricingContext.markup < 1.0) diagnostics.warnings.push('Markup < 1.0');
  if (quoteInput.pricingContext.scrapPercent > 0.5) diagnostics.warnings.push('Scrap > 50%');
  // Se erro ou preço ausente, não calcula
  if (diagnostics.errors.length > 0 || diagnostics.missingPrices.length > 0) return { quote: null, diagnostics };
  // Chama engine
  const quote = await calculateQuote(quoteInput);
  return { quote, diagnostics };
}
