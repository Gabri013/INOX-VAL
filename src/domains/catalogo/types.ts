/**
 * Sistema de Codificação de Insumos
 * 
 * Padrão de códigos:
 * - MP-XXX: Matéria Prima (chapas, tubos, perfis)
 * - PN-XXX: Pés Niveladores
 * - PF-XXX: Parafusos e Fixações
 * - AC-XXX: Acessórios (puxadores, dobradiças, etc)
 * - CB-XXX: Componentes Base (estrutura)
 */

export type TipoInsumo = 
  | 'materia-prima'
  | 'pes-niveladores'
  | 'parafusos'
  | 'acessorios'
  | 'componentes';

export type UnidadeMedida = 
  | 'un' // unidade
  | 'kg' // quilograma
  | 'mt' // metro
  | 'mt2' // metro quadrado
  | 'pc' // peça
  | 'cx' // caixa
  | 'jg'; // jogo

export interface Insumo {
  id: string;
  codigo: string; // Ex: MP-001, PN-010, PF-025
  nome: string;
  descricao: string;
  tipo: TipoInsumo;
  unidade: UnidadeMedida;
  custoUnitario: number;
  estoque?: number;
  fornecedor?: string;
  especificacoes?: Record<string, any>;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Matéria Prima específica (chapas de inox)
export interface MateriaPrima extends Insumo {
  tipo: 'materia-prima';
  material: 'inox-304' | 'inox-430' | 'inox-316' | 'aco-carbono';
  espessura: number; // em mm
  largura?: number; // em mm (para chapas)
  comprimento?: number; // em mm (para chapas)
  diametro?: number; // em mm (para tubos)
  peso?: number; // kg/m2 ou kg/m
}

// Pés Niveladores
export interface PeNivelador extends Insumo {
  tipo: 'pes-niveladores';
  altura: number; // em mm
  cargaMaxima: number; // em kg
  rosca: string; // Ex: M10, M12
  material: string;
}

// Parafusos e Fixações
export interface Parafuso extends Insumo {
  tipo: 'parafusos';
  tipoProduto: 'parafuso' | 'porca' | 'arruela' | 'rebite';
  dimensao: string; // Ex: M6x20, M8x30
  material: string;
  quantidade_embalagem?: number;
}

// Produtos Padronizados (Mesas/Bancadas)
export type TipoProdutoPadrao = 
  | 'bancada-simples'
  | 'bancada-com-prateleira'
  | 'bancada-com-gavetas'
  | 'mesa-lisa'
  | 'mesa-com-rebaixo'
  | 'mesa-industrial';

export interface DimensoesProduto {
  largura: number; // em mm
  profundidade: number; // em mm
  altura: number; // em mm
}

export interface ProdutoPadrao {
  id: string;
  codigo: string; // Ex: BC-001, MS-010
  nome: string;
  tipo: TipoProdutoPadrao;
  descricao: string;
  dimensoes: DimensoesProduto;
  imagem?: string;
  
  // Componentes e quantidades
  componentes: {
    insumoId: string;
    insumo?: Insumo;
    quantidade: number;
    observacao?: string;
  }[];
  
  // Parâmetros de fabricação
  tempoFabricacao: number; // em minutos
  complexidade: 'baixa' | 'media' | 'alta';
  
  // Precificação base
  custoMaterial: number;
  custoMaoObra: number;
  custoTotal: number;
  margemSugerida: number; // percentual
  precoVenda: number;
  
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Calculadora Rápida
export interface ItemCalculadora {
  id: string;
  produtoPadraoId: string;
  produtoPadrao?: ProdutoPadrao;
  quantidade: number;
  dimensoesCustomizadas?: DimensoesProduto; // se for diferente do padrão
  observacoes?: string;
}

export interface CalculadoraOrcamento {
  id: string;
  codigo: string; // gerado automaticamente
  data: string;
  vendedorId?: string;
  clienteId?: string;
  
  itens: ItemCalculadora[];
  
  // Totalizadores
  custoMaterialTotal: number;
  custoMaoObraTotal: number;
  custoTotal: number;
  margemLucro: number; // percentual aplicado
  valorVenda: number;
  
  // BOM e Nesting consolidados
  bomConsolidado?: ConsumoMaterial[];
  nestingResultado?: any; // resultado do cálculo de nesting
  
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
  observacoes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ConsumoMaterial {
  insumoId: string;
  insumo?: Insumo;
  quantidadeTotal: number;
  unidade: UnidadeMedida;
  custoUnitario: number;
  custoTotal: number;
  origem: string[]; // quais produtos usam esse material
}

// Resultado do cálculo da calculadora
export interface ResultadoCalculadora {
  orcamento: CalculadoraOrcamento;
  consumoMateriais: ConsumoMaterial[];
  nestingPorChapa: {
    materialId: string;
    material?: MateriaPrima;
    chapasNecessarias: number;
    aproveitamento: number; // percentual
    perdaMaterial: number; // percentual
  }[];
  resumo: {
    totalItens: number;
    custoMaterial: number;
    custoMaoObra: number;
    custoTotal: number;
    valorVenda: number;
    margemLucro: number;
    lucroEstimado: number;
  };
}
