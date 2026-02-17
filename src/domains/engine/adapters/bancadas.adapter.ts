// Adapter: mapBancadasFormToQuoteInput
import type { QuoteInput } from '../quote.engine';

export function mapBancadasFormToQuoteInput(formData: any): QuoteInput {
  // Helper: parse number or throw
  function parseNum(val: any, field: string): number {
    const n = Number(val);
    if (isNaN(n)) throw new Error(`Campo obrigatório ausente ou inválido: ${field}`);
    return n;
  }
  // Tampo
  const tampo = formData.tampo ? {
    comprimento: parseNum(formData.tampo.comprimento, 'tampo.comprimento'),
    largura: parseNum(formData.tampo.largura, 'tampo.largura'),
    espessura: parseNum(formData.tampo.espessuraChapa, 'tampo.espessuraChapa'),
    materialId: formData.materialTampoId || `CHAPA_304_${parseNum(formData.tampo.espessuraChapa, 'tampo.espessuraChapa')}mm`,
  } : undefined;
  // Cuba
  const cuba = formData.cuba ? {
    L: parseNum(formData.cuba.L, 'cuba.L'),
    W: parseNum(formData.cuba.W, 'cuba.W'),
    H: parseNum(formData.cuba.H, 'cuba.H'),
    espessura: parseNum(formData.cuba.t, 'cuba.t'),
    materialId: formData.materialCubaId || `CHAPA_304_${parseNum(formData.cuba.t, 'cuba.t')}mm`,
  } : undefined;
  // Estrutura
  const estrutura = formData.estrutura ? {
    quantidadePes: parseNum(formData.estrutura.quantidadePes, 'estrutura.quantidadePes'),
    alturaPes: parseNum(formData.estrutura.alturaPes, 'estrutura.alturaPes'),
    tipoTubo: formData.estrutura.tipoTuboPes || '',
  } : undefined;
  // Tipo
  const tipo = formData.orcamentoTipo as QuoteInput['tipo'];
  // Pricing context
  const pricingContext = {
    markup: parseNum(formData.fatorVenda, 'fatorVenda'),
    scrapPercent: parseNum(formData.scrapMinPct, 'scrapMinPct') / 100,
    overheadPercent: formData.overheadPercent !== undefined ? Number(formData.overheadPercent) : 0.03,
    laborCostPerHour: formData.laborCostPerHour !== undefined ? Number(formData.laborCostPerHour) : 50,
    riskFactor: formData.riskFactor !== undefined ? Number(formData.riskFactor) : 0.05,
    priceBookVersionId: formData.priceBookVersionId || '',
  };
  return { tipo, tampo, cuba, estrutura, pricingContext };
}
