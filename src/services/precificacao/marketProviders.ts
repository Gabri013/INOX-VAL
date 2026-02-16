// Provedores reais de dados de mercado e matéria-prima
// Exemplo: Sindinox, Infometais, MercadoLivre, API customizada

export interface MarketProvider {
  nome: string;
  fetchPrecoKgInox: () => Promise<number>;
  fetchPrecoKgTuboPes: () => Promise<number>;
  fetchPrecoKgTuboContraventamento: () => Promise<number>;
  fetchBenchmark: (produtoId: string) => Promise<{ precoMedio: number; fonte: string }>;
}

// Mock Sindinox
export const SindinoxProvider: MarketProvider = {
  nome: 'Sindinox',
  async fetchPrecoKgInox() {
    // Aqui faria fetch real, exemplo:
    // const res = await fetch('https://api.sindinox.com/preco-inox');
    // return (await res.json()).preco;
    return 46.7;
  },
  async fetchPrecoKgTuboPes() {
    return 44.9;
  },
  async fetchPrecoKgTuboContraventamento() {
    return 43.5;
  },
  async fetchBenchmark(produtoId) {
    // Exemplo: consulta API Sindinox
    return { precoMedio: 210, fonte: 'Sindinox' };
  }
};

// Mock Infometais
export const InfometaisProvider: MarketProvider = {
  nome: 'Infometais',
  async fetchPrecoKgInox() {
    return 47.1;
  },
  async fetchPrecoKgTuboPes() {
    return 45.2;
  },
  async fetchPrecoKgTuboContraventamento() {
    return 43.8;
  },
  async fetchBenchmark(produtoId) {
    return { precoMedio: 208, fonte: 'Infometais' };
  }
};

// Mock MercadoLivre
export const MercadoLivreProvider: MarketProvider = {
  nome: 'MercadoLivre',
  async fetchPrecoKgInox() {
    return 48.0;
  },
  async fetchPrecoKgTuboPes() {
    return 45.5;
  },
  async fetchPrecoKgTuboContraventamento() {
    return 44.0;
  },
  async fetchBenchmark(produtoId) {
    return { precoMedio: 212, fonte: 'MercadoLivre' };
  }
};

// Função para escolher o melhor provedor (pode ser por média, prioridade, etc)
export async function getBestMarketData() {
  // Estratégia: média dos provedores
  const providers = [SindinoxProvider, InfometaisProvider, MercadoLivreProvider];
  const results = await Promise.all(providers.map(async (prov) => ({
    nome: prov.nome,
    precoKgInox: await prov.fetchPrecoKgInox(),
    precoKgTuboPes: await prov.fetchPrecoKgTuboPes(),
    precoKgTuboContraventamento: await prov.fetchPrecoKgTuboContraventamento(),
  })));
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return {
    precoKgInox: avg(results.map(r => r.precoKgInox)),
    precoKgTuboPes: avg(results.map(r => r.precoKgTuboPes)),
    precoKgTuboContraventamento: avg(results.map(r => r.precoKgTuboContraventamento)),
    fontes: results.map(r => r.nome).join(', ')
  };
}

export async function getBestBenchmark(produtoId: string) {
  const providers = [SindinoxProvider, InfometaisProvider, MercadoLivreProvider];
  const results = await Promise.all(providers.map(p => p.fetchBenchmark(produtoId)));
  // Estratégia: pega o menor preço de benchmark
  const best = results.reduce((min, curr) => curr.precoMedio < min.precoMedio ? curr : min, results[0]);
  return best;
}
