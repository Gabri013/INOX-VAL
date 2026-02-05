/**
 * Modelo MPLC
 * Centro Contraventada (4 pés)
 * REGRA: Pés = Ø38mm, Contraventamento = Ø25mm (1")
 */

import { BOMResult, MesaConfig, BOMItem, CUSTOS_MAO_OBRA } from '../../types';
import {
  r2,
  calcularPesoChapa,
  calcularCustoChapa,
  calcularPesoTubo,
  calcularCustoTubo,
  validarConfig,
  MAT_CHAPA_12,
  MAT_TUBO_25,
  MAT_TUBO_38,
} from '../utils';
import { PRECOS_COMPONENTES } from '../../types';

export function gerarBOM_MPLC(config: MesaConfig): BOMResult {
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
    codigo: `TAMPO-CENTRO-${l}X${c}`,
    peso: pesoTampo,
    pesoTotal: pesoTampo,
    custo: calcularCustoChapa(pesoTampo, material),
    custoTotal: calcularCustoChapa(pesoTampo, material),
    unidade: 'pç',
  });

  // 2. ESTRUTURA CONTRAVENTADA (4 pés)
  const alturaPerna = h - 50;
  const numPes = 4;

  bom.push({
    desc: `PERNA ESTRUTURAL Ø38MM`,
    qtd: numPes,
    h: r2(alturaPerna),
    material: MAT_TUBO_38,
    processo: 'CORTE + SOLDA',
    codigo: `PERNA-${alturaPerna}`,
    peso: calcularPesoTubo(alturaPerna),
    pesoTotal: calcularPesoTubo(alturaPerna) * numPes,
    custo: calcularCustoTubo(alturaPerna),
    custoTotal: calcularCustoTubo(alturaPerna) * numPes,
    unidade: 'pç',
  });

  const comprimentoTravessa = l - 100;
  bom.push({
    desc: `TRAVESSA LONGITUDINAL Ø38MM`,
    qtd: 4,
    h: r2(comprimentoTravessa),
    material: MAT_TUBO_38,
    processo: 'CORTE + SOLDA',
    codigo: `TRAV-LONG-${comprimentoTravessa}`,
    peso: calcularPesoTubo(comprimentoTravessa),
    pesoTotal: calcularPesoTubo(comprimentoTravessa) * 4,
    custo: calcularCustoTubo(comprimentoTravessa),
    custoTotal: calcularCustoTubo(comprimentoTravessa) * 4,
    unidade: 'pç',
  });

  const comprimentoTravessaTransv = c - 100;
  bom.push({
    desc: `TRAVESSA TRANSVERSAL Ø38MM`,
    qtd: 4,
    h: r2(comprimentoTravessaTransv),
    material: MAT_TUBO_38,
    processo: 'CORTE + SOLDA',
    codigo: `TRAV-TRANSV-${comprimentoTravessaTransv}`,
    peso: calcularPesoTubo(comprimentoTravessaTransv),
    pesoTotal: calcularPesoTubo(comprimentoTravessaTransv) * 4,
    custo: calcularCustoTubo(comprimentoTravessaTransv),
    custoTotal: calcularCustoTubo(comprimentoTravessaTransv) * 4,
    unidade: 'pç',
  });

  const comprimentoDiagonal = Math.sqrt(alturaPerna ** 2 + comprimentoTravessaTransv ** 2);
  bom.push({
    desc: `CONTRAVENTAMENTO DIAGONAL Ø25MM`,
    qtd: 4,
    h: r2(comprimentoDiagonal),
    material: MAT_TUBO_25,
    processo: 'CORTE + SOLDA',
    codigo: `CONTRAV-${Math.round(comprimentoDiagonal)}`,
    peso: calcularPesoTubo(comprimentoDiagonal, 'TUBO_25x1_2'),
    pesoTotal: calcularPesoTubo(comprimentoDiagonal, 'TUBO_25x1_2') * 4,
    custo: calcularCustoTubo(comprimentoDiagonal, 'TUBO_25x1_2'),
    custoTotal: calcularCustoTubo(comprimentoDiagonal, 'TUBO_25x1_2') * 4,
    unidade: 'pç',
  });

  // 3. COMPONENTES
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
    qtd: numPes * 4 + 20,
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.PARAFUSO_M8,
    custoTotal: PRECOS_COMPONENTES.PARAFUSO_M8 * (numPes * 4 + 20),
    unidade: 'un',
  });

  // TOTAIS
  const pesoTotal = bom.reduce((acc, item) => acc + (item.pesoTotal || 0), 0);
  const custoMaterial = bom.reduce((acc, item) => acc + (item.custoTotal || 0), 0);
  const areaM2 = (l / 1000) * (c / 1000);
  const custoMaoObra = areaM2 * CUSTOS_MAO_OBRA.BANCADA_SIMPLES + CUSTOS_MAO_OBRA.SETUP;
  const custoTotal = custoMaterial + custoMaoObra;

  return {
    modelo: 'MPLC',
    descricao: 'Centro Contraventada (4 pés)',
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
    recomendacoes: l > 1900 ? ['Considere MPLC6 (6 pés) para comprimentos acima de 1900mm'] : undefined,
  };
}