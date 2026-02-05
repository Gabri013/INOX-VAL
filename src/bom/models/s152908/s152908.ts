/**
 * Modelo S152908
 * Encosto + 1 Cuba Central + Contraventada (4 pés)
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
  MAT_CHAPA_08,
  MAT_CHAPA_10,
  MAT_CHAPA_12,
  MAT_TUBO_25, // ✅ Contraventamento = Ø25mm (1")
  MAT_TUBO_38, // ✅ Pés e travessas = Ø38mm
} from '../utils';
import { PRECOS_COMPONENTES } from '../../types';

export function gerarBOM_S152908(config: MesaConfig): BOMResult {
  const { l, c, h, material = 'INOX_304' } = config;
  const espessura_chapa = config.espessura_chapa || 1.2;
  const espessura_espelho = config.espessura_espelho || 1.0;

  const bom: BOMItem[] = [];
  const { avisos } = validarConfig(config);

  // 1. TAMPO
  const pesoTampo = calcularPesoChapa(l, c, espessura_chapa, material);
  const tampo: BOMItem = {
    desc: 'TAMPO PRINCIPAL',
    qtd: 1,
    w: r2(c),
    h: r2(l),
    espessura: espessura_chapa,
    material: MAT_CHAPA_12,
    processo: 'LASER + DOBRA',
    codigo: `TAMPO-${l}X${c}`,
    peso: pesoTampo,
    pesoTotal: pesoTampo,
    custo: calcularCustoChapa(pesoTampo, material),
    custoTotal: calcularCustoChapa(pesoTampo, material),
    unidade: 'pç',
  };
  bom.push(tampo);

  // 2. ESPELHO TRASEIRO
  const pesoEspelho = calcularPesoChapa(l, ESPELHO_ALTURA, espessura_espelho, material);
  const espelho: BOMItem = {
    desc: 'ESPELHO TRASEIRO',
    qtd: 1,
    w: r2(ESPELHO_ALTURA),
    h: r2(l),
    espessura: espessura_espelho,
    material: MAT_CHAPA_10,
    processo: 'LASER',
    codigo: `ESP-TRAS-${l}X${ESPELHO_ALTURA}`,
    peso: pesoEspelho,
    pesoTotal: pesoEspelho,
    custo: calcularCustoChapa(pesoEspelho, material),
    custoTotal: calcularCustoChapa(pesoEspelho, material),
    unidade: 'pç',
  };
  bom.push(espelho);

  // 3. CUBA CENTRAL
  const larguraCuba = config.larguraCuba || 400;
  const comprimentoCuba = config.comprimentoCuba || 500;
  const profundidadeCuba = config.profundidadeCuba || 300;
  const custoCuba = calcularCustoCuba(larguraCuba, comprimentoCuba);

  const cuba: BOMItem = {
    desc: `CUBA CENTRAL ${larguraCuba}X${comprimentoCuba}X${profundidadeCuba}MM`,
    qtd: 1,
    w: larguraCuba,
    h: comprimentoCuba,
    espessura: profundidadeCuba,
    material: 'INOX_304',
    processo: 'COMPRADO',
    codigo: `CUBA-${larguraCuba}X${comprimentoCuba}`,
    pesoTotal: 0,
    custo: custoCuba,
    custoTotal: custoCuba,
    unidade: 'un',
  };
  bom.push(cuba);

  // 4. ESTRUTURA CONTRAVENTADA (4 pés)
  const alturaPerna = h - 50; // desconta tampo e ajustes
  const numPes = 4;

  // Pernas
  const pesoPerna = calcularPesoTubo(alturaPerna);
  const pernas: BOMItem = {
    desc: `PERNA ESTRUTURAL Ø38MM`,
    qtd: numPes,
    h: r2(alturaPerna),
    material: MAT_TUBO_38,
    processo: 'CORTE + SOLDA',
    codigo: `PERNA-${alturaPerna}`,
    peso: pesoPerna,
    pesoTotal: pesoPerna * numPes,
    custo: calcularCustoTubo(alturaPerna),
    custoTotal: calcularCustoTubo(alturaPerna) * numPes,
    unidade: 'pç',
  };
  bom.push(pernas);

  // Travessas longitudinais
  const comprimentoTravessa = l - 100;
  const pesoTravessa = calcularPesoTubo(comprimentoTravessa);
  const travessasLong: BOMItem = {
    desc: `TRAVESSA LONGITUDINAL Ø38MM`,
    qtd: 4,
    h: r2(comprimentoTravessa),
    material: MAT_TUBO_38,
    processo: 'CORTE + SOLDA',
    codigo: `TRAV-LONG-${comprimentoTravessa}`,
    peso: pesoTravessa,
    pesoTotal: pesoTravessa * 4,
    custo: calcularCustoTubo(comprimentoTravessa),
    custoTotal: calcularCustoTubo(comprimentoTravessa) * 4,
    unidade: 'pç',
  };
  bom.push(travessasLong);

  // Travessas transversais
  const comprimentoTravessaTransv = c - 100;
  const pesoTravessaTransv = calcularPesoTubo(comprimentoTravessaTransv);
  const travessasTransv: BOMItem = {
    desc: `TRAVESSA TRANSVERSAL Ø38MM`,
    qtd: 4,
    h: r2(comprimentoTravessaTransv),
    material: MAT_TUBO_38,
    processo: 'CORTE + SOLDA',
    codigo: `TRAV-TRANSV-${comprimentoTravessaTransv}`,
    peso: pesoTravessaTransv,
    pesoTotal: pesoTravessaTransv * 4,
    custo: calcularCustoTubo(comprimentoTravessaTransv),
    custoTotal: calcularCustoTubo(comprimentoTravessaTransv) * 4,
    unidade: 'pç',
  };
  bom.push(travessasTransv);

  // Contraventamentos
  const comprimentoDiagonal = Math.sqrt(alturaPerna ** 2 + comprimentoTravessaTransv ** 2);
  const pesoDiagonal = calcularPesoTubo(comprimentoDiagonal);
  const diagonais: BOMItem = {
    desc: `CONTRAVENTAMENTO DIAGONAL Ø25MM`,
    qtd: 4,
    h: r2(comprimentoDiagonal),
    material: MAT_TUBO_25,
    processo: 'CORTE + SOLDA',
    codigo: `CONTRAV-${Math.round(comprimentoDiagonal)}`,
    peso: pesoDiagonal,
    pesoTotal: pesoDiagonal * 4,
    custo: calcularCustoTubo(comprimentoDiagonal),
    custoTotal: calcularCustoTubo(comprimentoDiagonal) * 4,
    unidade: 'pç',
  };
  bom.push(diagonais);

  // 5. PÉS REGULÁVEIS
  const pesRegulaveis: BOMItem = {
    desc: 'PÉ REGULÁVEL INOX',
    qtd: numPes,
    material: 'INOX_304',
    processo: 'COMPRADO',
    codigo: 'PE-REG-38',
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.PE_REGULAVEL,
    custoTotal: PRECOS_COMPONENTES.PE_REGULAVEL * numPes,
    unidade: 'un',
  };
  bom.push(pesRegulaveis);

  // 6. FIXAÇÕES
  const parafusos: BOMItem = {
    desc: 'PARAFUSO M8X20 INOX',
    qtd: numPes * 4 + 30,
    material: 'INOX_304',
    processo: 'COMPRADO',
    codigo: 'PAR-M8X20',
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.PARAFUSO_M8,
    custoTotal: PRECOS_COMPONENTES.PARAFUSO_M8 * (numPes * 4 + 30),
    unidade: 'un',
  };
  bom.push(parafusos);

  const rebites: BOMItem = {
    desc: 'REBITE 4.8MM INOX',
    qtd: 80,
    material: 'INOX_304',
    processo: 'COMPRADO',
    codigo: 'REB-4.8',
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.REBITE,
    custoTotal: PRECOS_COMPONENTES.REBITE * 80,
    unidade: 'un',
  };
  bom.push(rebites);

  // 7. SILICONE
  const silicone: BOMItem = {
    desc: 'SILICONE NEUTRO',
    qtd: 2,
    material: 'SILICONE',
    processo: 'COMPRADO',
    codigo: 'SIL-NEUTRO',
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.SILICONE,
    custoTotal: PRECOS_COMPONENTES.SILICONE * 2,
    unidade: 'tubo',
  };
  bom.push(silicone);

  // CÁLCULO DE TOTAIS
  const pesoTotal = bom.reduce((acc, item) => acc + (item.pesoTotal || 0), 0);
  const custoMaterial = bom.reduce((acc, item) => acc + (item.custoTotal || 0), 0);
  const areaM2 = (l / 1000) * (c / 1000);
  const custoMaoObra = areaM2 * CUSTOS_MAO_OBRA.BANCADA_CUBA + CUSTOS_MAO_OBRA.SETUP;
  const custoTotal = custoMaterial + custoMaoObra;

  return {
    modelo: 'S152908',
    descricao: 'Encosto + 1 Cuba Central + Contraventada (4 pés)',
    dimensoes: {
      comprimento: l,
      largura: c,
      altura: h,
    },
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
    recomendacoes: l > 2000 ? ['Considere 6 pés para comprimentos acima de 2000mm'] : undefined,
  };
}