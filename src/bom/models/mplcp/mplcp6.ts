/**
 * Modelo MPLCP6
 * Centro com Prateleira (6 pés)
 */

import { BOMResult, MesaConfig, BOMItem, CUSTOS_MAO_OBRA } from '../../types';
import {
  r2,
  calcularPesoChapa,
  calcularCustoChapa,
  calcularPesoTubo,
  calcularCustoTubo,
  validarConfig,
  PRATELEIRA_OFFSET_L,
  PRATELEIRA_OFFSET_C,
  MAT_CHAPA_08,
  MAT_CHAPA_12,
  MAT_TUBO_38,
} from '../utils';
import { PRECOS_COMPONENTES } from '../../types';

export function gerarBOM_MPLCP6(config: MesaConfig): BOMResult {
  const { l, c, h, material = 'INOX_304' } = config;
  const espessura_chapa = config.espessura_chapa || 1.2;

  const bom: BOMItem[] = [];
  const { avisos } = validarConfig(config);

  // 1. TAMPO
  const pesoTampo = calcularPesoChapa(l, c, espessura_chapa, material);
  bom.push({
    desc: 'TAMPO CENTRAL',
    qtd: 1,
    w: r2(c),
    h: r2(l),
    espessura: espessura_chapa,
    material: MAT_CHAPA_12,
    processo: 'LASER',
    codigo: `TAMPO-${l}X${c}`,
    peso: pesoTampo,
    pesoTotal: pesoTampo,
    custo: calcularCustoChapa(pesoTampo, material),
    custoTotal: calcularCustoChapa(pesoTampo, material),
    unidade: 'pç',
  });

  // 2. PRATELEIRA PADRÃO - ✅ CORRIGIDO
  const prateleira: BOMItem = {
    desc: 'PRATELEIRA PADRÃO',
    qtd: 1,
    w: r2(c + PRATELEIRA_OFFSET_C), // ✅ corrigido
    h: r2(l + PRATELEIRA_OFFSET_L), // ✅ corrigido
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'LASER',
    codigo: `LISA-MC-${l}X${c}-PC01`,
    peso: calcularPesoChapa(l + PRATELEIRA_OFFSET_L, c + PRATELEIRA_OFFSET_C, 0.8, material),
    pesoTotal: calcularPesoChapa(l + PRATELEIRA_OFFSET_L, c + PRATELEIRA_OFFSET_C, 0.8, material),
    custo: calcularCustoChapa(calcularPesoChapa(l + PRATELEIRA_OFFSET_L, c + PRATELEIRA_OFFSET_C, 0.8, material), material),
    custoTotal: calcularCustoChapa(calcularPesoChapa(l + PRATELEIRA_OFFSET_L, c + PRATELEIRA_OFFSET_C, 0.8, material), material),
    unidade: 'pç',
  };
  bom.push(prateleira);

  // 3. ESTRUTURA (6 pés)
  const alturaPerna = h - 50;
  const numPes = 6;

  bom.push({
    desc: `PERNA ESTRUTURAL Ø38MM`,
    qtd: numPes,
    h: r2(alturaPerna),
    material: MAT_TUBO_38,
    processo: 'CORTE + SOLDA',
    peso: calcularPesoTubo(alturaPerna),
    pesoTotal: calcularPesoTubo(alturaPerna) * numPes,
    custo: calcularCustoTubo(alturaPerna),
    custoTotal: calcularCustoTubo(alturaPerna) * numPes,
    unidade: 'pç',
  });

  bom.push({
    desc: `TRAVESSA LONGITUDINAL Ø38MM`,
    qtd: 6,
    h: r2(l - 100),
    material: MAT_TUBO_38,
    processo: 'CORTE + SOLDA',
    peso: calcularPesoTubo(l - 100),
    pesoTotal: calcularPesoTubo(l - 100) * 6,
    custo: calcularCustoTubo(l - 100),
    custoTotal: calcularCustoTubo(l - 100) * 6,
    unidade: 'pç',
  });

  bom.push({
    desc: `TRAVESSA TRANSVERSAL Ø38MM`,
    qtd: 6,
    h: r2(c - 100),
    material: MAT_TUBO_38,
    processo: 'CORTE + SOLDA',
    peso: calcularPesoTubo(c - 100),
    pesoTotal: calcularPesoTubo(c - 100) * 6,
    custo: calcularCustoTubo(c - 100),
    custoTotal: calcularCustoTubo(c - 100) * 6,
    unidade: 'pç',
  });

  // 4. COMPONENTES
  bom.push({
    desc: 'PÉ REGULÁVEL INOX',
    qtd: numPes,
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.PE_REGULAVEL,
    custoTotal: PRECOS_COMPONENTES.PE_REGULAVEL * numPes,
    unidade: 'un',
  });

  bom.push({
    desc: 'PARAFUSO M8X20 INOX',
    qtd: numPes * 4 + 30,
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.PARAFUSO_M8,
    custoTotal: PRECOS_COMPONENTES.PARAFUSO_M8 * (numPes * 4 + 30),
    unidade: 'un',
  });

  // TOTAIS
  const pesoTotal = bom.reduce((acc, item) => acc + (item.pesoTotal || 0), 0);
  const custoMaterial = bom.reduce((acc, item) => acc + (item.custoTotal || 0), 0);
  const areaM2 = (l / 1000) * (c / 1000);
  const custoMaoObra = areaM2 * CUSTOS_MAO_OBRA.BANCADA_SIMPLES + CUSTOS_MAO_OBRA.SETUP;
  const custoTotal = custoMaterial + custoMaoObra;

  return {
    modelo: 'MPLCP6',
    descricao: 'Centro com Prateleira (6 pés)',
    dimensoes: { comprimento: l, largura: c, altura: h },
    bom,
    totais: {
      pesoTotal: r2(pesoTotal),
      custoMaterial: r2(custoMaterial),
      custoMaoObra: r2(custoMaoObra),
      custoTotal: r2(custoTotal),
      areaChapas: r2(areaM2),
      numComponentes: bom.length,
    },
    avisos: avisos.length > 0 ? avisos : undefined,
  };
}
