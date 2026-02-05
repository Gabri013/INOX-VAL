/**
 * Modelo MPVE
 * Encosto + Borda d'água + Cuba Dir + Contraventada (4 pés)
 * REGRA: Pés = Ø38mm, Contraventamento = Ø25mm (1")
 */

import { BOMResult, MesaConfig, BOMItem, CUSTOS_MAO_OBRA } from '../../types';
import {
  r2,
  calcularPesoChapa,
  calcularCustoChapa,
  calcularPesoTubo,
  calcularCustoTubo,
  calcularCustoCuba,
  validarConfig,
  ESPELHO_ALTURA,
  BORDA_AGUA_ALTURA_PADRAO,
  MAT_CHAPA_10,
  MAT_CHAPA_12,
  MAT_TUBO_25, // ✅ Contraventamento = Ø25mm (1")
  MAT_TUBO_38, // ✅ Pés e travessas = Ø38mm
} from '../utils';
import { PRECOS_COMPONENTES } from '../../types';

export function gerarBOM_MPVE(config: MesaConfig): BOMResult {
  const { l, c, h, material = 'INOX_304' } = config;
  const espessura_chapa = config.espessura_chapa || 1.2;
  const espessura_espelho = config.espessura_espelho || 1.0;
  const alturaBorda = config.alturaBordaAgua || BORDA_AGUA_ALTURA_PADRAO;

  const bom: BOMItem[] = [];
  const { avisos } = validarConfig(config);

  // 1. TAMPO COM BORDA D'ÁGUA
  const pesoTampo = calcularPesoChapa(l, c, espessura_chapa, material);
  bom.push({
    desc: 'TAMPO COM BORDA D\'ÁGUA',
    qtd: 1,
    w: r2(c),
    h: r2(l),
    espessura: espessura_chapa,
    material: MAT_CHAPA_12,
    processo: 'LASER + DOBRA',
    codigo: `TAMPO-BORDA-${l}X${c}`,
    peso: pesoTampo,
    pesoTotal: pesoTampo,
    custo: calcularCustoChapa(pesoTampo, material),
    custoTotal: calcularCustoChapa(pesoTampo, material),
    unidade: 'pç',
  });

  // 2. ESPELHO TRASEIRO
  const pesoEspelho = calcularPesoChapa(l, ESPELHO_ALTURA, espessura_espelho, material);
  bom.push({
    desc: 'ESPELHO TRASEIRO',
    qtd: 1,
    w: r2(ESPELHO_ALTURA),
    h: r2(l),
    espessura: espessura_espelho,
    material: MAT_CHAPA_10,
    processo: 'LASER',
    codigo: `ESP-TRAS-${l}`,
    peso: pesoEspelho,
    pesoTotal: pesoEspelho,
    custo: calcularCustoChapa(pesoEspelho, material),
    custoTotal: calcularCustoChapa(pesoEspelho, material),
    unidade: 'pç',
  });

  // 3. BORDAS D'ÁGUA
  const pesoBordaFrontal = calcularPesoChapa(l, alturaBorda, espessura_chapa, material);
  bom.push({
    desc: `BORDA D'ÁGUA FRONTAL ${alturaBorda}MM`,
    qtd: 1,
    w: r2(alturaBorda),
    h: r2(l),
    espessura: espessura_chapa,
    material: MAT_CHAPA_12,
    processo: 'LASER + DOBRA',
    codigo: `BORDA-FRONT-${l}X${alturaBorda}`,
    peso: pesoBordaFrontal,
    pesoTotal: pesoBordaFrontal,
    custo: calcularCustoChapa(pesoBordaFrontal, material),
    custoTotal: calcularCustoChapa(pesoBordaFrontal, material),
    unidade: 'pç',
  });

  const pesoBordaLateral = calcularPesoChapa(c, alturaBorda, espessura_chapa, material);
  bom.push({
    desc: `BORDA D'ÁGUA LATERAL ${alturaBorda}MM`,
    qtd: 2,
    w: r2(alturaBorda),
    h: r2(c),
    espessura: espessura_chapa,
    material: MAT_CHAPA_12,
    processo: 'LASER + DOBRA',
    codigo: `BORDA-LAT-${c}X${alturaBorda}`,
    peso: pesoBordaLateral,
    pesoTotal: pesoBordaLateral * 2,
    custo: calcularCustoChapa(pesoBordaLateral, material),
    custoTotal: calcularCustoChapa(pesoBordaLateral, material) * 2,
    unidade: 'pç',
  });

  // 4. CUBA DIREITA
  const larguraCuba = config.larguraCuba || 400;
  const comprimentoCuba = config.comprimentoCuba || 500;
  const profundidadeCuba = config.profundidadeCuba || 300;
  const custoCuba = calcularCustoCuba(larguraCuba, comprimentoCuba);

  bom.push({
    desc: `CUBA DIREITA ${larguraCuba}X${comprimentoCuba}X${profundidadeCuba}MM`,
    qtd: 1,
    w: larguraCuba,
    h: comprimentoCuba,
    espessura: profundidadeCuba,
    material: 'INOX_304',
    processo: 'COMPRADO',
    codigo: `CUBA-DIR-${larguraCuba}X${comprimentoCuba}`,
    pesoTotal: 0,
    custo: custoCuba,
    custoTotal: custoCuba,
    unidade: 'un',
  });

  // 5. ESTRUTURA CONTRAVENTADA (4 pés)
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
    peso: calcularPesoTubo(comprimentoDiagonal),
    pesoTotal: calcularPesoTubo(comprimentoDiagonal) * 4,
    custo: calcularCustoTubo(comprimentoDiagonal),
    custoTotal: calcularCustoTubo(comprimentoDiagonal) * 4,
    unidade: 'pç',
  });

  // 6. COMPONENTES
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

  bom.push({
    desc: 'SILICONE NEUTRO',
    qtd: 3,
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.SILICONE,
    custoTotal: PRECOS_COMPONENTES.SILICONE * 3,
    unidade: 'tubo',
  });

  // TOTAIS
  const pesoTotal = bom.reduce((acc, item) => acc + (item.pesoTotal || 0), 0);
  const custoMaterial = bom.reduce((acc, item) => acc + (item.custoTotal || 0), 0);
  const areaM2 = (l / 1000) * (c / 1000);
  const custoMaoObra = areaM2 * CUSTOS_MAO_OBRA.BANCADA_BORDA_AGUA + CUSTOS_MAO_OBRA.SETUP;
  const custoTotal = custoMaterial + custoMaoObra;

  return {
    modelo: 'MPVE',
    descricao: 'Encosto + Borda d\'água + Cuba Dir + Contraventada (4 pés)',
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