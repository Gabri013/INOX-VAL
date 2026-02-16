import { getBestMarketData } from './marketProviders';

// Serviço para buscar valores de mercado e matéria-prima de fontes externas (mock/demo)

export async function fetchMarketDefaults() {
  // Busca dados reais dos provedores
  const best = await getBestMarketData();
  return {
    markup: 3.15,
    margemLucro: 0.28,
    overheadPercent: 0.03,
    benchmarkFonte: best.fontes,
    precoKgInox: best.precoKgInox,
    precoKgTuboPes: best.precoKgTuboPes,
    precoKgTuboContraventamento: best.precoKgTuboContraventamento,
    atualizadoEm: new Date().toISOString(),
    fonte: best.fontes
  };
}
