import type { PricingTables } from './pricingEngine';

export const DEFAULT_TABLES: PricingTables = {
  inoxKgPrice: 37, // vai ser sobrescrito pelo global
  densityKgPerM3: 7900,

  // EXEMPLO: preencha com o que vocês realmente usam.
  // chave livre: "tuboQuadrado_40x40x1.2"
  tubeKgPerMeter: {
    "tuboQuadrado_40x40x1.2": 1.42,
    "tuboRedondo_38.1x1.2": 1.10,
  },

  processCostPerHour: {
    cut: 60,
    bend: 80,
    weld: 90,
    finish: 110,
    assembly: 70,
  },

  accessories: {
    peNivelador: 12,
    rodizio: 45,
    valvula: 35,
  },

  overheadPercent: 0.08,
};
