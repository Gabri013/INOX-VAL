/**
 * ============================================================================
 * REGISTRY DE MATERIAIS AUTORIZADOS (WHITELIST)
 * ============================================================================
 * 
 * Este arquivo define a lista oficial de materiais que podem aparecer na BOM.
 * 
 * POR QUE EXISTE:
 * - Impede que a BOM gere materiais "inventados" fora do padrão da empresa
 * - Garante que todos os materiais têm fornecedor e preço controlado
 * - Facilita integração com estoque (cada material tem ID único)
 * 
 * REGRA: Se um material NÃO está nesta lista, a BOM NÃO pode usá-lo.
 * ============================================================================
 */

export type TipoMaterial = 
  | 'CHAPA'
  | 'TUBO'
  | 'COMPONENTE'
  | 'FIXACAO'
  | 'CONSUMIVEL';

export interface MaterialAutorizado {
  /** ID único do material (usado no estoque/compras) */
  id: string;
  
  /** Código do material (ex: MAT-CHAPA-304-1.2) */
  codigo: string;
  
  /** Nome do material */
  nome: string;
  
  /** Descrição técnica */
  descricao: string;
  
  /** Tipo de material */
  tipo: TipoMaterial;
  
  /** Unidade de medida */
  unidade: 'kg' | 'm' | 'm²' | 'un' | 'pç' | 'tubo';
  
  /** Custo unitário padrão (R$) */
  custoUnitario: number;
  
  /** Fornecedor padrão */
  fornecedorPadrao?: string;
  
  /** Observações */
  obs?: string;
}

/**
 * CHAPAS DE INOX
 */
const CHAPAS_INOX: MaterialAutorizado[] = [
  {
    id: 'INOX_304_0.8mm',
    codigo: 'INOX_304_0.8mm',
    nome: 'Chapa Inox 304 #22 (0,8mm)',
    descricao: 'Chapa de aço inoxidável AISI 304, espessura 0,8mm',
    tipo: 'CHAPA',
    unidade: 'kg',
    custoUnitario: 42.0, // R$/kg
    fornecedorPadrao: 'Distribuidora Inox SP',
  },
  {
    id: 'INOX_304_1.0mm',
    codigo: 'INOX_304_1.0mm',
    nome: 'Chapa Inox 304 #20 (1,0mm)',
    descricao: 'Chapa de aço inoxidável AISI 304, espessura 1,0mm',
    tipo: 'CHAPA',
    unidade: 'kg',
    custoUnitario: 42.0, // R$/kg
    fornecedorPadrao: 'Distribuidora Inox SP',
  },
  {
    id: 'INOX_304_1.2mm',
    codigo: 'INOX_304_1.2mm',
    nome: 'Chapa Inox 304 (1,2mm)',
    descricao: 'Chapa de aço inoxidável AISI 304, espessura 1,2mm',
    tipo: 'CHAPA',
    unidade: 'kg',
    custoUnitario: 42.0, // R$/kg
    fornecedorPadrao: 'Distribuidora Inox SP',
  },
  {
    id: 'INOX_304_1.5mm',
    codigo: 'INOX_304_1.5mm',
    nome: 'Chapa Inox 304 (1,5mm)',
    descricao: 'Chapa de aço inoxidável AISI 304, espessura 1,5mm',
    tipo: 'CHAPA',
    unidade: 'kg',
    custoUnitario: 42.0, // R$/kg
    fornecedorPadrao: 'Distribuidora Inox SP',
  },
  {
    id: 'INOX_304_2.0mm',
    codigo: 'INOX_304_2.0mm',
    nome: 'Chapa Inox 304 (2,0mm)',
    descricao: 'Chapa de aço inoxidável AISI 304, espessura 2,0mm',
    tipo: 'CHAPA',
    unidade: 'kg',
    custoUnitario: 42.0, // R$/kg
    fornecedorPadrao: 'Distribuidora Inox SP',
  },
  {
    id: 'INOX_430_0.8mm',
    codigo: 'INOX_430_0.8mm',
    nome: 'Chapa Inox 430 #22 (0,8mm)',
    descricao: 'Chapa de aço inoxidável AISI 430, espessura 0,8mm',
    tipo: 'CHAPA',
    unidade: 'kg',
    custoUnitario: 35.0, // R$/kg
    fornecedorPadrao: 'Distribuidora Inox SP',
  },
  {
    id: 'INOX_430_1.0mm',
    codigo: 'INOX_430_1.0mm',
    nome: 'Chapa Inox 430 #20 (1,0mm)',
    descricao: 'Chapa de aço inoxidável AISI 430, espessura 1,0mm',
    tipo: 'CHAPA',
    unidade: 'kg',
    custoUnitario: 35.0, // R$/kg
    fornecedorPadrao: 'Distribuidora Inox SP',
  },
  {
    id: 'INOX_430_1.2mm',
    codigo: 'INOX_430_1.2mm',
    nome: 'Chapa Inox 430 (1,2mm)',
    descricao: 'Chapa de aço inoxidável AISI 430, espessura 1,2mm',
    tipo: 'CHAPA',
    unidade: 'kg',
    custoUnitario: 35.0, // R$/kg
    fornecedorPadrao: 'Distribuidora Inox SP',
  },
];

/**
 * TUBOS
 * REGRA: Pés = Ø38mm, Contraventamento = Ø25mm (1")
 */
const TUBOS: MaterialAutorizado[] = [
  {
    id: 'TUBO_25x1.2mm',
    codigo: 'TUBO_25x1.2mm',
    nome: 'Tubo Ø25mm x 1.2mm (1")',
    descricao: 'Tubo redondo inox 304, Ø25mm x 1.2mm - para contraventamento',
    tipo: 'TUBO',
    unidade: 'm',
    custoUnitario: 32.0, // R$/m
    fornecedorPadrao: 'Tubos & Perfis Ltda',
    obs: 'Uso obrigatório para contraventamento (1")',
  },
  {
    id: 'TUBO_38x1.2mm',
    codigo: 'TUBO_38x1.2mm',
    nome: 'Tubo Ø38mm x 1.2mm',
    descricao: 'Tubo redondo inox 304, Ø38mm x 1.2mm - para pés e travessas',
    tipo: 'TUBO',
    unidade: 'm',
    custoUnitario: 44.1, // R$/m
    fornecedorPadrao: 'Tubos & Perfis Ltda',
    obs: 'Uso obrigatório para pés e travessas',
  },
];

/**
 * COMPONENTES
 */
const COMPONENTES: MaterialAutorizado[] = [
  {
    id: 'PE_REGULAVEL',
    codigo: 'PE-REG-38',
    nome: 'Pé Regulável Inox',
    descricao: 'Pé regulável em inox para bancadas (rosca M8)',
    tipo: 'COMPONENTE',
    unidade: 'un',
    custoUnitario: 15.0, // R$/un
    fornecedorPadrao: 'Componentes Inox Brasil',
  },
  {
    id: 'CASQUILHO',
    codigo: 'CASQ-INOX',
    nome: 'Casquilho Inox',
    descricao: 'Casquilho de união em inox',
    tipo: 'COMPONENTE',
    unidade: 'un',
    custoUnitario: 3.5, // R$/un
    fornecedorPadrao: 'Componentes Inox Brasil',
  },
  {
    id: 'CUBA_PEQUENA',
    codigo: 'CUBA-PEQU',
    nome: 'Cuba Pequena',
    descricao: 'Cuba de inox 304 - pequena (até 400x500mm)',
    tipo: 'COMPONENTE',
    unidade: 'un',
    custoUnitario: 250.0, // R$/un
    fornecedorPadrao: 'Cubas Inox Premium',
  },
  {
    id: 'CUBA_MEDIA',
    codigo: 'CUBA-MED',
    nome: 'Cuba Média',
    descricao: 'Cuba de inox 304 - média (até 500x600mm)',
    tipo: 'COMPONENTE',
    unidade: 'un',
    custoUnitario: 350.0, // R$/un
    fornecedorPadrao: 'Cubas Inox Premium',
  },
  {
    id: 'CUBA_GRANDE',
    codigo: 'CUBA-GRAN',
    nome: 'Cuba Grande',
    descricao: 'Cuba de inox 304 - grande (acima de 600mm)',
    tipo: 'COMPONENTE',
    unidade: 'un',
    custoUnitario: 450.0, // R$/un
    fornecedorPadrao: 'Cubas Inox Premium',
  },
];

/**
 * FIXAÇÕES
 */
const FIXACOES: MaterialAutorizado[] = [
  {
    id: 'PARAFUSO_M8',
    codigo: 'PAR-M8X20',
    nome: 'Parafuso M8x20 Inox',
    descricao: 'Parafuso sextavado M8x20mm em inox 304',
    tipo: 'FIXACAO',
    unidade: 'un',
    custoUnitario: 0.8, // R$/un
    fornecedorPadrao: 'Fixações Inox',
  },
  {
    id: 'REBITE',
    codigo: 'REB-4.8',
    nome: 'Rebite 4.8mm Inox',
    descricao: 'Rebite pop em inox 304, 4.8mm',
    tipo: 'FIXACAO',
    unidade: 'un',
    custoUnitario: 0.4, // R$/un
    fornecedorPadrao: 'Fixações Inox',
  },
];

/**
 * CONSUMÍVEIS
 */
const CONSUMIVEIS: MaterialAutorizado[] = [
  {
    id: 'SILICONE',
    codigo: 'SIL-NEUTRO',
    nome: 'Silicone Neutro',
    descricao: 'Silicone neutro para vedação de cubas',
    tipo: 'CONSUMIVEL',
    unidade: 'tubo',
    custoUnitario: 18.0, // R$/tubo
    fornecedorPadrao: 'Distribuidora Química',
  },
];

/**
 * REGISTRY COMPLETO (WHITELIST)
 */
export const MATERIAIS_AUTORIZADOS: MaterialAutorizado[] = [
  ...CHAPAS_INOX,
  ...TUBOS,
  ...COMPONENTES,
  ...FIXACOES,
  ...CONSUMIVEIS,
];

/**
 * MAP para lookup rápido por código
 */
export const MATERIAIS_MAP = new Map(
  MATERIAIS_AUTORIZADOS.map(m => [m.codigo, m])
);

/**
 * Valida se um material está autorizado
 */
export function validarMaterial(codigo: string): boolean {
  return MATERIAIS_MAP.has(codigo);
}

/**
 * Busca material por código
 */
export function buscarMaterial(codigo: string): MaterialAutorizado | undefined {
  return MATERIAIS_MAP.get(codigo);
}

/**
 * Valida lista de materiais da BOM
 * Retorna lista de materiais NÃO autorizados (se houver)
 */
export function validarBOM(materiais: string[]): string[] {
  const naoAutorizados: string[] = [];
  
  for (const codigo of materiais) {
    if (!validarMaterial(codigo)) {
      naoAutorizados.push(codigo);
    }
  }
  
  return naoAutorizados;
}

/**
 * Lista materiais por tipo
 */
export function listarMaterialPorTipo(tipo: TipoMaterial): MaterialAutorizado[] {
  return MATERIAIS_AUTORIZADOS.filter(m => m.tipo === tipo);
}
