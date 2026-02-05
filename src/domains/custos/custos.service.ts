/**
 * ============================================================================
 * SERVIÇO DE CÁLCULO DE CUSTOS E PRECIFICAÇÃO PROFISSIONAL
 * ============================================================================
 */

import type {
  ConfiguracaoCustos,
  CalculoPrecoDetalhado,
} from './custos-config.types';

/**
 * Configuração padrão de custos (exemplo para empresa de bancadas inox)
 */
const CONFIGURACAO_PADRAO: ConfiguracaoCustos = {
  id: 'config-001',
  empresa: {
    razaoSocial: 'Inox Indústria Ltda',
    cnpj: '12.345.678/0001-99',
    inscricaoEstadual: '123.456.789.012',
    endereco: 'Rua das Indústrias, 1000 - Distrito Industrial - São Paulo/SP',
    telefone: '(11) 3000-0000',
    email: 'contato@inoxindustria.com.br',
    site: 'www.inoxindustria.com.br',
  },
  impostos: {
    regime: 'SIMPLES_NACIONAL',
    aliquotaSimples: 8.6, // 8.6% para indústria no Simples
  },
  custosIndiretos: {
    percentualAdministrativo: 10, // 10% (salários, aluguel, contas)
    percentualComercial: 5,       // 5% (marketing, comissões)
    percentualLogistica: 3,       // 3% (frete, embalagem)
    custoFixoMensal: 50000,       // R$ 50.000/mês
    volumeMensalEstimado: 500000, // R$ 500.000/mês → 10% de rateio
  },
  margens: {
    margemPadrao: 30,
    margensPorCategoria: {
      BANCADA_SIMPLES: 25,
      BANCADA_COM_CUBA: 30,
      BANCADA_ESPECIAL: 35,
      EQUIPAMENTO_CUSTOM: 40,
    },
  },
  descontos: {
    descontoPorQuantidade: [
      { quantidadeMinima: 5, percentualDesconto: 5 },
      { quantidadeMinima: 10, percentualDesconto: 10 },
      { quantidadeMinima: 20, percentualDesconto: 15 },
    ],
    descontoPorValor: [
      { valorMinimo: 10000, percentualDesconto: 5 },
      { valorMinimo: 25000, percentualDesconto: 8 },
      { valorMinimo: 50000, percentualDesconto: 12 },
    ],
  },
  observacoesPadrao: `- Produtos fabricados em aço inox AISI 304
- Acabamento escovado padrão
- Garantia de 12 meses contra defeitos de fabricação
- Instalação não inclusa (consultar orçamento separado)`,
  prazoEntregaPadrao: 15,
  validadeProposta: 15,
  condicoesPagamento: [
    '50% na aprovação + 50% na entrega',
    '30/60 dias (consultar condições)',
    'À vista com 5% de desconto',
  ],
  atualizadoEm: new Date().toISOString(),
  atualizadoPor: 'Sistema',
};

/**
 * Estado em memória (simulando banco de dados)
 */
let configuracaoAtual: ConfiguracaoCustos = { ...CONFIGURACAO_PADRAO };

/**
 * Obter configuração atual
 */
export function obterConfiguracao(): ConfiguracaoCustos {
  return { ...configuracaoAtual };
}

/**
 * Atualizar configuração
 */
export function atualizarConfiguracao(
  parcial: Partial<ConfiguracaoCustos>,
  usuario: string
): ConfiguracaoCustos {
  configuracaoAtual = {
    ...configuracaoAtual,
    ...parcial,
    atualizadoEm: new Date().toISOString(),
    atualizadoPor: usuario,
  };
  return { ...configuracaoAtual };
}

/**
 * Calcular preço detalhado baseado nos custos da BOM
 */
export function calcularPrecoDetalhado(
  custoMaterial: number,
  custoMaoObra: number,
  categoria: string = 'BANCADA_SIMPLES',
  quantidade: number = 1,
  valorTotalPedido: number = 0
): CalculoPrecoDetalhado {
  const config = obterConfiguracao();
  
  // 1. Custos diretos
  const custoTotal = custoMaterial + custoMaoObra;
  
  // 2. Custos indiretos (percentuais sobre custo direto)
  const custoAdministrativo = custoTotal * (config.custosIndiretos.percentualAdministrativo / 100);
  const custoComercial = custoTotal * (config.custosIndiretos.percentualComercial / 100);
  const custoLogistica = custoTotal * (config.custosIndiretos.percentualLogistica / 100);
  
  // 3. Custo fixo rateado
  const percentualRateio = (config.custosIndiretos.custoFixoMensal / config.custosIndiretos.volumeMensalEstimado) * 100;
  const custoFixoRateado = custoTotal * (percentualRateio / 100);
  
  const totalCustosIndiretos = custoAdministrativo + custoComercial + custoLogistica + custoFixoRateado;
  
  // 4. Preço base (custo direto + indiretos)
  const precoBase = custoTotal + totalCustosIndiretos;
  
  // 5. Margem de lucro
  const margemAplicada = (config.margens.margensPorCategoria as any)[categoria] || config.margens.margemPadrao;
  const valorMargem = precoBase * (margemAplicada / 100);
  
  // 6. Impostos (sobre preço de venda)
  const precoVendaSemImposto = precoBase + valorMargem;
  let aliquotaImpostos = 0;
  
  if (config.impostos.regime === 'SIMPLES_NACIONAL') {
    aliquotaImpostos = config.impostos.aliquotaSimples || 0;
  } else {
    // Somar todos os impostos
    aliquotaImpostos = 
      (config.impostos.aliquotaICMS || 0) +
      (config.impostos.aliquotaIPI || 0) +
      (config.impostos.aliquotaPIS || 0) +
      (config.impostos.aliquotaCOFINS || 0) +
      (config.impostos.aliquotaIR || 0) +
      (config.impostos.aliquotaCSLL || 0);
  }
  
  const valorImpostos = precoVendaSemImposto * (aliquotaImpostos / 100);
  const precoVenda = precoVendaSemImposto + valorImpostos;
  
  // 7. Descontos (verificar quantidade e valor)
  let descontoAplicado = 0;
  
  // Desconto por quantidade
  const descontosQtd = [...config.descontos.descontoPorQuantidade]
    .sort((a, b) => b.quantidadeMinima - a.quantidadeMinima);
  
  for (const desc of descontosQtd) {
    if (quantidade >= desc.quantidadeMinima) {
      descontoAplicado = Math.max(descontoAplicado, desc.percentualDesconto);
      break;
    }
  }
  
  // Desconto por valor total do pedido
  if (valorTotalPedido > 0) {
    const descontosValor = [...config.descontos.descontoPorValor]
      .sort((a, b) => b.valorMinimo - a.valorMinimo);
    
    for (const desc of descontosValor) {
      if (valorTotalPedido >= desc.valorMinimo) {
        descontoAplicado = Math.max(descontoAplicado, desc.percentualDesconto);
        break;
      }
    }
  }
  
  const valorDesconto = precoVenda * (descontoAplicado / 100);
  const precoFinal = precoVenda - valorDesconto;
  
  // 8. Breakdown em percentuais
  const breakdown = {
    material: (custoMaterial / precoFinal) * 100,
    maoObra: (custoMaoObra / precoFinal) * 100,
    indiretos: (totalCustosIndiretos / precoFinal) * 100,
    impostos: (valorImpostos / precoFinal) * 100,
    lucro: ((valorMargem - valorDesconto) / precoFinal) * 100,
  };
  
  return {
    custoMaterial,
    custoMaoObra,
    custoTotal,
    custoAdministrativo,
    custoComercial,
    custoLogistica,
    custoFixoRateado,
    totalCustosIndiretos,
    valorImpostos,
    aliquotaImpostos,
    margemAplicada,
    valorMargem,
    descontoAplicado,
    valorDesconto,
    precoBase,
    precoVenda,
    precoFinal,
    breakdown,
  };
}

/**
 * Resetar para configuração padrão
 */
export function resetarConfiguracao(): ConfiguracaoCustos {
  configuracaoAtual = { ...CONFIGURACAO_PADRAO };
  return { ...configuracaoAtual };
}

export const custosService = {
  obterConfiguracao,
  atualizarConfiguracao,
  calcularPrecoDetalhado,
  resetarConfiguracao,
};
