/**
 * ============================================================================
 * TIPOS PARA SISTEMA BOM INDUSTRIAL
 * ============================================================================
 * 
 * Por que este arquivo existe:
 * 
 * O motor BOM (Bill of Materials) é o coração do sistema de orçamentação.
 * Ele transforma entradas simples (C×L×A + opções) em lista detalhada de
 * materiais com quantidades exatas, permitindo:
 * 
 * 1. Cálculo preciso de custos (por m², kg, unidade)
 * 2. Geração automática de pedidos de compra
 * 3. Preparação de ordens de produção
 * 4. Nesting otimizado (aproveitamento de chapas)
 * 
 * Sem BOM detalhada, o orçamento vira "chute" e a empresa perde dinheiro.
 * 
 * Fluxo: Modelo + Dimensões + Opções → BOM → Nesting → Precificação → Venda
 * ============================================================================
 */

/**
 * Modelos parametrizados de bancadas em inox da linha Mesa Vinda
 */

/**
 * Configuração da mesa
 */
export interface MesaConfig {
  // Dimensões principais
  l: number; // Comprimento (mm)
  c: number; // Largura (mm)
  h: number; // Altura (mm)

  // Material
  material: 'INOX_304' | 'INOX_430';

  // Estrutura
  contraventada?: boolean;
  numPes?: number; // 4 ou 6 pés

  // Opcionais
  temPrateleira?: boolean;
  prateleiraLisa?: boolean; // true = lisa, false = perfurada
  
  // Espelhos
  espelhoTraseiro?: boolean;
  espelhoEsquerdo?: boolean;
  espelhoDireito?: boolean;

  // Cuba
  temCuba?: boolean;
  posicaoCuba?: 'ESQUERDA' | 'CENTRO' | 'DIREITA'; // posição da cuba
  larguraCuba?: number;
  comprimentoCuba?: number;
  profundidadeCuba?: number;

  // Borda d'água
  temBordaAgua?: boolean;
  alturaBordaAgua?: number;

  // Tipo de bancada
  tipoBancada?: 'ENCOSTO' | 'CENTRO';

  // Espessuras personalizadas
  espessura_chapa?: number; // espessura da chapa principal (mm)
  espessura_espelho?: number; // espessura do espelho (mm)
}

/**
 * Item da lista de materiais (BOM)
 */
export interface BOMItem {
  desc: string; // descrição
  qtd: number; // quantidade
  w?: number; // largura (mm)
  h?: number; // altura/comprimento (mm)
  espessura?: number; // espessura (mm)
  material?: string; // material (ex: INOX_304, TUBO_38x1.2)
  processo?: string; // processo (ex: LASER, DOBRA, SOLDA)
  codigo?: string; // código do produto
  peso?: number; // peso unitário (kg)
  pesoTotal?: number; // peso total (kg)
  custo?: number; // custo unitário (R$)
  custoTotal?: number; // custo total (R$)
  unidade?: string; // unidade (pç, un, m, kg)
  obs?: string; // observações
}

/**
 * Resultado do cálculo BOM
 */
export interface BOMResult {
  modelo: string; // nome do modelo
  descricao: string; // descrição do modelo
  dimensoes: {
    comprimento: number;
    largura: number;
    altura: number;
  };
  bom: BOMItem[]; // lista de materiais
  totais: {
    pesoTotal: number; // kg
    custoMaterial: number; // R$
    custoMaoObra: number; // R$
    custoTotal: number; // R$
    areaChapas: number; // m²
    numComponentes: number;
  };
  avisos?: string[]; // avisos de validação
  recomendacoes?: string[]; // recomendações
}

/**
 * Constantes de materiais
 */
export const MATERIAIS = {
  INOX_304: {
    nome: 'Aço Inox 304',
    densidade: 7.93, // kg/dm³
    custoKg: 42.0, // R$/kg
  },
  INOX_430: {
    nome: 'Aço Inox 430',
    densidade: 7.75, // kg/dm³
    custoKg: 35.0, // R$/kg
  },
} as const;

/**
 * Constantes de tubos
 * REGRA: Pés = Ø38mm, Contraventamento = Ø25mm (1")
 */
export const TUBOS = {
  TUBO_25x1_2: {
    diametro: 25, // mm (1" - para contraventamento)
    espessura: 1.2, // mm
    descricao: 'Tubo Ø25mm x 1.2mm (1")',
    pesoMetro: 0.7, // kg/m (aprox)
    custoMetro: 32.0, // R$/m
  },
  TUBO_38x1_2: {
    diametro: 38, // mm (para pés e travessas)
    espessura: 1.2, // mm
    descricao: 'Tubo Ø38mm x 1.2mm',
    pesoMetro: 1.05, // kg/m (aprox)
    custoMetro: 44.1, // R$/m
  },
  // ❌ REMOVIDO: TUBO_50x1_5 (não é usado em nenhum modelo)
} as const;

/**
 * Constantes de chapas
 */
export const ESPESSURAS_CHAPA = {
  CHAPA_08: 0.8, // mm
  CHAPA_10: 1.0, // mm
  CHAPA_12: 1.2, // mm
  CHAPA_15: 1.5, // mm
  CHAPA_20: 2.0, // mm
} as const;

/**
 * Preços de componentes
 */
export const PRECOS_COMPONENTES = {
  PE_REGULAVEL: 15.0, // R$/un
  CASQUILHO: 3.5, // R$/un
  PARAFUSO_M8: 0.8, // R$/un
  REBITE: 0.4, // R$/un
  SILICONE: 18.0, // R$/tubo
  CUBA_PEQUENA: 250.0, // R$/un
  CUBA_MEDIA: 350.0, // R$/un
  CUBA_GRANDE: 450.0, // R$/un
} as const;

/**
 * Custos de mão de obra
 */
export const CUSTOS_MAO_OBRA = {
  BANCADA_SIMPLES: 120.0, // R$/m²
  BANCADA_CUBA: 180.0, // R$/m²
  BANCADA_BORDA_AGUA: 144.0, // R$/m²
  SETUP: 50.0, // R$ (custo fixo)
} as const;