/**
 * Domain: Vendedores e Configurações
 * Gerenciamento de configurações personalizadas por vendedor
 */

export type TipoMaterialInox = '201' | '304' | '316' | '430';
export type TipoAcabamento = 'escovado' | 'polido' | 'jateado';
export type TipoEmbalagem = 'plastico-bolha' | 'papelao' | 'madeira' | 'isopor' | 'stretch' | 'sem-embalagem';

/**
 * Tabela de preços por tipo de material
 */
export interface TabelaPrecosMaterial {
  /**
   * Preço por kg do material
   */
  precoPorKg: number;
  /**
   * Preço por m² da chapa (opcional)
   */
  precoPorM2?: number;
  /** Unidade padrão do material (kg, m, m2, un) */
  unidade?: 'kg' | 'm' | 'm2' | 'un';
  /** Scrap/desperdício mínimo (%) */
  scrapPct?: number;
  /** Markup individual (%) */
  markupPct?: number;
  /** Última atualização do preço */
  dataAtualizacao: number;
}

/**
 * Configuração de embalagem
 */
export interface ConfiguracaoEmbalagem {
  tipo: TipoEmbalagem;
  custoBase: number;
  descricao: string;
  ativo: boolean;
}

/**
 * Configurações personalizadas do vendedor/orçamentista
 */
export interface ConfiguracaoVendedor {
  id: string;
  
  /**
   * ID do usuário (vendedor)
   */
  usuarioId: string;
  
  /**
   * Nome do vendedor
   */
  nomeVendedor: string;
  
  /**
   * Tabela de preços por tipo de material
   */
  precosMateriais: Record<TipoMaterialInox, TabelaPrecosMaterial>;
  
  /**
   * Margem de lucro padrão (%)
   */
  margemLucroPadrao: number;
  
  /**
   * Custo de mão de obra (R$/hora)
   */
  custoMaoDeObraPorHora: number;
  
  /**
   * Tempo médio de produção por bancada (horas)
   */
  tempoMedioBancada: number;
  
  /**
   * Material preferido padrão
   */
  materialPadrao: TipoMaterialInox;
  
  /**
   * Acabamento padrão
   */
  acabamentoPadrao: TipoAcabamento;
  
  /**
   * Espessura padrão da chapa (mm)
   */
  espessuraPadrao: number;
  
  /**
   * Espessuras disponíveis (mm)
   */
  espessurasDisponiveis: number[];
  
  /**
   * Configurações de embalagem
   */
  embalagens: ConfiguracaoEmbalagem[];
  
  /**
   * Embalagem padrão
   */
  embalagemPadrao: TipoEmbalagem;
  
  /**
   * Custos adicionais fixos (transporte, impostos, etc)
   */
  custosAdicionais: {
    transporte?: number;
    impostos?: number;
    outros?: number;
  };
  
  /**
   * Observações/notas do vendedor
   */
  observacoes?: string;
  
  /**
   * Metadata
   */
  criadoEm: number;
  atualizadoEm: number;
}

/**
 * DTO para criação de configuração
 */
export interface CreateConfiguracaoVendedorDTO {
  usuarioId: string;
  nomeVendedor: string;
  precosMateriais: Record<TipoMaterialInox, TabelaPrecosMaterial>;
  margemLucroPadrao: number;
  custoMaoDeObraPorHora: number;
  tempoMedioBancada: number;
  materialPadrao: TipoMaterialInox;
  acabamentoPadrao: TipoAcabamento;
  espessuraPadrao: number;
  espessurasDisponiveis: number[];
  embalagens: ConfiguracaoEmbalagem[];
  embalagemPadrao: TipoEmbalagem;
  custosAdicionais?: {
    transporte?: number;
    impostos?: number;
    outros?: number;
  };
  observacoes?: string;
}

/**
 * DTO para atualização de configuração
 */
export interface UpdateConfiguracaoVendedorDTO extends Partial<CreateConfiguracaoVendedorDTO> {}

/**
 * Labels para exibição
 */
export const MATERIAL_LABELS: Record<TipoMaterialInox, string> = {
  '201': 'Inox 201 (Econômico)',
  '304': 'Inox 304 (Padrão)',
  '316': 'Inox 316 (Premium)',
  '430': 'Inox 430 (Magnético)',
};

export const ACABAMENTO_LABELS: Record<TipoAcabamento, string> = {
  'escovado': 'Escovado (Fosco)',
  'polido': 'Polido (Brilhante)',
  'jateado': 'Jateado (Texturizado)',
};

export const EMBALAGEM_LABELS: Record<TipoEmbalagem, string> = {
  'plastico-bolha': 'Plástico Bolha',
  'papelao': 'Papelão Reforçado',
  'madeira': 'Caixa de Madeira',
  'isopor': 'Isopor',
  'stretch': 'Filme Stretch',
  'sem-embalagem': 'Sem Embalagem (Retirada)',
};
