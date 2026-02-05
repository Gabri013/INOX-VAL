/**
 * ============================================================================
 * CONFIGURAÇÃO DE CUSTOS E MARGENS EMPRESARIAIS
 * ============================================================================
 * 
 * Sistema de precificação profissional que considera:
 * - Custos diretos (material + mão de obra)
 * - Custos indiretos (overhead, administrativo, comercial)
 * - Impostos (regime tributário)
 * - Margem de lucro por categoria
 * - Descontos progressivos
 * ============================================================================
 */

export type RegimeTributario = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';

/**
 * Configuração de impostos baseada no regime tributário
 */
export interface ConfiguracaoImpostos {
  regime: RegimeTributario;
  
  // Simples Nacional (alíquota única)
  aliquotaSimples?: number; // Ex: 8.6% para indústria
  
  // Lucro Presumido / Real (impostos separados)
  aliquotaICMS?: number;    // Ex: 18%
  aliquotaIPI?: number;     // Ex: 5%
  aliquotaPIS?: number;     // Ex: 1.65%
  aliquotaCOFINS?: number;  // Ex: 7.6%
  aliquotaIR?: number;      // Ex: 15%
  aliquotaCSLL?: number;    // Ex: 9%
}

/**
 * Configuração de custos indiretos (overhead)
 */
export interface ConfiguracaoCustosIndiretos {
  // Percentual sobre custo direto
  percentualAdministrativo: number;  // Ex: 10% (salários, aluguel, contas)
  percentualComercial: number;       // Ex: 5% (marketing, comissões)
  percentualLogistica: number;       // Ex: 3% (frete, embalagem, armazenagem)
  
  // Custos fixos mensais (rateados)
  custoFixoMensal: number;          // Ex: R$ 50.000
  volumeMensalEstimado: number;     // Ex: R$ 500.000 → 10% de rateio
}

/**
 * Configuração de margem de lucro por categoria de produto
 */
export interface ConfiguracaoMargens {
  margemPadrao: number;              // Ex: 30%
  margensPorCategoria: {
    BANCADA_SIMPLES: number;         // Ex: 25%
    BANCADA_COM_CUBA: number;        // Ex: 30%
    BANCADA_ESPECIAL: number;        // Ex: 35%
    EQUIPAMENTO_CUSTOM: number;      // Ex: 40%
  };
}

/**
 * Configuração de descontos progressivos por volume
 */
export interface ConfiguracaoDescontos {
  descontoPorQuantidade: Array<{
    quantidadeMinima: number;
    percentualDesconto: number;
  }>;
  descontoPorValor: Array<{
    valorMinimo: number;
    percentualDesconto: number;
  }>;
}

/**
 * Configuração completa do sistema de custos
 */
export interface ConfiguracaoCustos {
  id: string;
  empresa: {
    razaoSocial: string;
    cnpj: string;
    inscricaoEstadual?: string;
    endereco: string;
    telefone: string;
    email: string;
    site?: string;
    logo?: string; // Base64 ou URL
  };
  impostos: ConfiguracaoImpostos;
  custosIndiretos: ConfiguracaoCustosIndiretos;
  margens: ConfiguracaoMargens;
  descontos: ConfiguracaoDescontos;
  observacoesPadrao: string; // Texto padrão para propostas
  prazoEntregaPadrao: number; // Dias
  validadeProposta: number; // Dias
  condicoesPagamento: string[]; // Ex: ["À vista", "30/60 dias", "Parcelado"]
  atualizadoEm: string;
  atualizadoPor: string;
}

/**
 * Resultado do cálculo de preço com breakdown detalhado
 */
export interface CalculoPrecoDetalhado {
  // Custos diretos (vem da BOM)
  custoMaterial: number;
  custoMaoObra: number;
  custoTotal: number;
  
  // Custos indiretos (percentuais)
  custoAdministrativo: number;
  custoComercial: number;
  custoLogistica: number;
  custoFixoRateado: number;
  totalCustosIndiretos: number;
  
  // Impostos
  valorImpostos: number;
  aliquotaImpostos: number;
  
  // Margem de lucro
  margemAplicada: number;
  valorMargem: number;
  
  // Descontos
  descontoAplicado: number;
  valorDesconto: number;
  
  // Totais
  precoBase: number;           // Custo total + indiretos
  precoVenda: number;          // Preço base + margem + impostos
  precoFinal: number;          // Preço venda - desconto
  
  // Breakdown em percentuais (para transparência)
  breakdown: {
    material: number;          // % do preço final
    maoObra: number;
    indiretos: number;
    impostos: number;
    lucro: number;
  };
}
