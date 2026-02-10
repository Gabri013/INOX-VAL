// Catálogo único de insumos (SKUs) para o sistema industrial

export type AccessorySKU =
  | "peNivelador"
  | "rodizioLeve"
  | "rodizioPesado"
  | "maoFrancesa"
  | "valvula1_1_2"
  | "valvula1_1_4"
  | "sifao"
  | "torneira"
  | "grelhaCoifa"
  | "filtroCoifa"
  | "luminariaCoifa"
  | "parafusoInox"
  | "rebiteInox"
  | "solda"
  | "abrasivo"
  | "mdf"
  | "dobradica"
  | "puxador"
  | "fecho"
  | "borrachaVedacao"
  | "ponteiraPlastica"
  | "kitFixacao"
  | "kitParafusos"
  | "ladrao"
  | "acabamentoBorda"
  | "mantaAntiRuido"
  | "exaustor"
  | "instalacao";

export interface AccessoryInfo {
  sku: AccessorySKU;
  label: string;
  unidade: string;
  descricao?: string;
}

export const ACCESSORY_CATALOG: AccessoryInfo[] = [
  { sku: "peNivelador", label: "Pé Nivelador", unidade: "un" },
  { sku: "rodizioLeve", label: "Rodízio Leve", unidade: "un" },
  { sku: "rodizioPesado", label: "Rodízio Pesado", unidade: "un" },
  { sku: "maoFrancesa", label: "Mão Francesa", unidade: "un" },
  { sku: "valvula1_1_2", label: "Válvula 1.1/2", unidade: "un" },
  { sku: "valvula1_1_4", label: "Válvula 1.1/4", unidade: "un" },
  { sku: "sifao", label: "Sifão", unidade: "un" },
  { sku: "torneira", label: "Torneira", unidade: "un" },
  { sku: "grelhaCoifa", label: "Grelha Coifa", unidade: "un" },
  { sku: "filtroCoifa", label: "Filtro Coifa", unidade: "un" },
  { sku: "luminariaCoifa", label: "Luminária Coifa", unidade: "un" },
  { sku: "parafusoInox", label: "Parafuso Inox", unidade: "kit" },
  { sku: "rebiteInox", label: "Rebite Inox", unidade: "kit" },
  { sku: "solda", label: "Solda", unidade: "kg" },
  { sku: "abrasivo", label: "Abrasivo", unidade: "un" },
  { sku: "mdf", label: "MDF", unidade: "m²" },
  { sku: "dobradica", label: "Dobradiça", unidade: "un" },
  { sku: "puxador", label: "Puxador", unidade: "un" },
  { sku: "fecho", label: "Fecho/Magneto", unidade: "un" },
  { sku: "borrachaVedacao", label: "Borracha/Vedação", unidade: "m" },
  { sku: "ponteiraPlastica", label: "Ponteira Plástica", unidade: "un" },
  { sku: "kitFixacao", label: "Kit Fixação", unidade: "kit" },
  { sku: "kitParafusos", label: "Kit Parafusos", unidade: "kit" },
  { sku: "ladrao", label: "Ladrão", unidade: "un" },
  { sku: "acabamentoBorda", label: "Acabamento de Borda", unidade: "un" },
  { sku: "mantaAntiRuido", label: "Manta Anti-Ruído", unidade: "un" },
  { sku: "exaustor", label: "Exaustor", unidade: "un" },
  { sku: "instalacao", label: "Instalação", unidade: "serviço" },
];

// Mapeamento de SKUs por produto (para UI e validação)
export type ProdutoTipo =
  | "bancadas"
  | "lavatorios"
  | "prateleiras"
  | "mesas"
  | "estanteCantoneira"
  | "estanteTubo"
  | "coifas"
  | "chapaPlana"
  | "materialRedondo"
  | "cantoneira"
  | "portasBatentes";

export const ACCESSORIES_BY_PRODUCT: Record<ProdutoTipo, AccessorySKU[]> = {
  bancadas: ["peNivelador","maoFrancesa","valvula1_1_2","sifao","torneira","rodizioLeve","rodizioPesado"],
  lavatorios: ["valvula1_1_2","sifao","torneira"],
  prateleiras: ["maoFrancesa","kitFixacao"],
  mesas: ["peNivelador","rodizioLeve","rodizioPesado"],
  estanteCantoneira: ["rodizioLeve","rodizioPesado","peNivelador","kitParafusos"],
  estanteTubo: ["rodizioLeve","rodizioPesado","peNivelador","ponteiraPlastica"],
  coifas: ["filtroCoifa","grelhaCoifa","luminariaCoifa","exaustor","kitFixacao","instalacao"],
  chapaPlana: [],
  materialRedondo: [],
  cantoneira: [],
  portasBatentes: ["dobradica","puxador","fecho","mdf","borrachaVedacao","kitParafusos"],
};
