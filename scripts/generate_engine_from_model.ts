/**
 * ============================================================
 * SCRIPT: generate_engine_from_model.ts
 * 
 * Generate TypeScript BOM engine code from a model definition.
 * 
 * Usage:
 *   npx tsx scripts/generate_engine_from_model.ts [options]
 * 
 * Options:
 *   --input, -i       Input model definition file (JSON or TS)
 *   --output, -o      Output directory (default: src/bom/models/)
 *   --model, -m       Model name (e.g., MPLC, MPLCP6)
 *   --template, -t    Template type (bom | engine | template)
 *   --watch, -w       Watch for file changes
 *   --help, -h        Show this help message
 * 
 * Examples:
 *   npx tsx scripts/generate_engine_from_model.ts -m MPLC
 *   npx tsx scripts/generate_engine_from_model.ts -i ./models/my_model.json -o ./output/
 *   npx tsx scripts/generate_engine_from_model.ts -m MPLC -t engine
 * ============================================================
 */

import * as fs from 'fs';
import * as path from 'path';

interface GenerateOptions {
  inputPath?: string;
  outputDir: string;
  modelName?: string;
  templateType: 'bom' | 'engine' | 'template';
  watch: boolean;
}

interface BOMItemDefinition {
  desc: string;
  codigo: string;
  processo: 'LASER' | 'GUILHOTINA' | 'CORTE' | 'DOBRA' | 'SOLDA' | 'ALMOXARIFADO';
  material: string;
  unidade: 'pç' | 'un' | 'm' | 'kg';
  formula?: {
    type: 'blank' | 'tube' | 'component';
    param?: string;
  };
}

interface ModelDefinition {
  name: string;
  description: string;
  category: string;
  dimensions: {
    length: { min: number; max: number; default: number };
    width: { min: number; max: number; default: number };
    height: { min: number; max: number; default: number };
  };
  items: BOMItemDefinition[];
  options?: {
    hasPrateleira?: boolean;
    hasEspelho?: boolean;
    hasCuba?: boolean;
    hasBordaAgua?: boolean;
    numPes?: 4 | 6;
  };
  constants?: Record<string, number | string>;
}

/**
 * Parse command line arguments
 */
function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);
  const options: GenerateOptions = {
    outputDir: 'src/bom/models/',
    templateType: 'bom',
    watch: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--input':
      case '-i':
        options.inputPath = args[++i];
        break;
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--model':
      case '-m':
        options.modelName = args[++i];
        break;
      case '--template':
      case '-t':
        const type = args[++i].toLowerCase();
        if (['bom', 'engine', 'template'].includes(type)) {
          options.templateType = type as GenerateOptions['templateType'];
        } else {
          console.warn(`Invalid template type: ${type}, using 'bom'`);
        }
        break;
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
Generate TypeScript BOM Engine from Model Definition

Usage:
  npx tsx scripts/generate_engine_from_model.ts [options]

Options:
  --input, -i <path>     Input model definition file (JSON or TS)
  --output, -o <path>   Output directory (default: src/bom/models/)
  --model, -m <name>    Model name (e.g., MPLC, MPLCP6)
  --template, -t <type>  Template type: bom | engine | template (default: bom)
  --watch, -w           Watch for file changes
  --help, -h            Show this help message

Examples:
  npx tsx scripts/generate_engine_from_model.ts -m MPLC
  npx tsx scripts/generate_engine_from_model.ts -i ./models/my_model.json
  npx tsx scripts/generate_engine_from_model.ts -m MPLC -t engine
`);
}

/**
 * Get default model definition
 */
function getDefaultModelDefinition(modelName: string): ModelDefinition {
  const modelConfigs: Record<string, ModelDefinition> = {
    'MPLC': {
      name: 'MPLC',
      description: 'Centro Contraventada (4 pés)',
      category: 'Centro',
      dimensions: {
        length: { min: 800, max: 3000, default: 1500 },
        width: { min: 500, max: 1000, default: 700 },
        height: { min: 700, max: 1000, default: 850 },
      },
      items: [
        { desc: 'TAMPO LISO CENTRO', codigo: 'MPLC-PC01', processo: 'LASER', material: 'MAT_CHAPA_08', unidade: 'pç' },
        { desc: 'REF. PADRÃO MESA LISA CENTRO', codigo: 'PPB-30', processo: 'GUILHOTINA', material: 'MAT_CHAPA_08', unidade: 'pç' },
        { desc: 'PÉ NIVELADOR 1 1/2" - NYLON', codigo: '1006036', processo: 'ALMOXARIFADO', material: '1006036', unidade: 'un' },
        { desc: 'REFORÇO FRONTAL', codigo: 'MPLC-PC03', processo: 'GUILHOTINA', material: 'MAT_CHAPA_08', unidade: 'pç' },
        { desc: 'CASQUILHO', codigo: 'PPB-01B', processo: 'LASER', material: 'MAT_CHAPA_20', unidade: 'pç' },
        { desc: 'PÉ (TUBO)', codigo: 'PPB-02', processo: 'CORTE', material: 'MAT_TUBO_38', unidade: 'pç' },
        { desc: 'CONTRAV. LATERAL', codigo: 'MPLC-PT01', processo: 'CORTE', material: 'MAT_TUBO_25', unidade: 'pç' },
        { desc: 'CONTRAV. TRASEIRO', codigo: 'MPLC-PT02', processo: 'CORTE', material: 'MAT_TUBO_25', unidade: 'pç' },
      ],
      options: {
        numPes: 4,
      },
      constants: {
        'OFFSET_DESENHO': 1.8,
        'FOLGA_CONTRAV': 130,
        'FOLGA_PE': 72,
        'H_REFORCO_FRONTAL': 93,
        'CASQUILHO_DIM': 61,
        'CASQUILHO_ESP': 2.0,
      },
    },
    'MPLC6': {
      name: 'MPLC6',
      description: 'Centro Contraventada (6 pés)',
      category: 'Centro',
      dimensions: {
        length: { min: 2000, max: 5000, default: 2500 },
        width: { min: 500, max: 1000, default: 700 },
        height: { min: 700, max: 1000, default: 850 },
      },
      items: [
        { desc: 'TAMPO LISO CENTRO', codigo: 'MPLC6-PC01', processo: 'LASER', material: 'MAT_CHAPA_08', unidade: 'pç' },
        { desc: 'REF. PADRÃO MESA LISA CENTRO', codigo: 'PPB-30', processo: 'GUILHOTINA', material: 'MAT_CHAPA_08', unidade: 'pç' },
        { desc: 'PÉ NIVELADOR 1 1/2" - NYLON', codigo: '1006036', processo: 'ALMOXARIFADO', material: '1006036', unidade: 'un' },
        { desc: 'REFORÇO FRONTAL', codigo: 'MPLC6-PC03', processo: 'GUILHOTINA', material: 'MAT_CHAPA_08', unidade: 'pç' },
        { desc: 'CASQUILHO', codigo: 'PPB-01B', processo: 'LASER', material: 'MAT_CHAPA_20', unidade: 'pç' },
        { desc: 'PÉ (TUBO)', codigo: 'PPB-02', processo: 'CORTE', material: 'MAT_TUBO_38', unidade: 'pç' },
        { desc: 'TRAVESSA', codigo: 'MPLC6-PT01', processo: 'CORTE', material: 'MAT_TUBO_38', unidade: 'pç' },
        { desc: 'CONTRAV. LATERAL', codigo: 'MPLC6-PT02', processo: 'CORTE', material: 'MAT_TUBO_25', unidade: 'pç' },
      ],
      options: {
        numPes: 6,
      },
      constants: {
        'OFFSET_DESENHO': 1.8,
        'FOLGA_CONTRAV': 130,
        'FOLGA_PE': 72,
        'H_REFORCO_FRONTAL': 93,
      },
    },
  };

  return modelConfigs[modelName] || {
    name: modelName,
    description: `${modelName} - Generated Model`,
    category: 'Custom',
    dimensions: {
      length: { min: 500, max: 5000, default: 1500 },
      width: { min: 400, max: 1500, default: 700 },
      height: { min: 700, max: 1200, default: 850 },
    },
    items: [],
  };
}

/**
 * Generate BOM TypeScript code
 */
function generateBOMCode(model: ModelDefinition): string {
  const constants = model.constants || {};
  const constantsEntries = Object.entries(constants)
    .map(([key, value]) => `const ${key} = ${typeof value === 'string' ? `'${value}'` : value};`)
    .join('\n');

  const itemsCode = model.items.map((item, idx) => {
    const formula = item.formula ? `formula: { type: '${item.formula.type}'${item.formula.param ? `, param: '${item.formula.param}'` : ''} }` : '';
    return `  {
    desc: '${item.desc}',
    codigo: '${item.codigo}',
    processo: '${item.processo}',
    material: ${item.material},
    unidade: '${item.unidade}',
    ${formula}
  }`;
  }).join(',\n');

  return `/**
 * Modelo ${model.name}
 * ${model.description}
 * Generated from model definition
 */

import { BOMResult, MesaConfig, BOMItem, CUSTOS_MAO_OBRA, PRECOS_COMPONENTES } from '../../types';
import {
  r1,
  r2,
  ABA,
  DOBRA,
  RAIO,
  calcularPesoChapa,
  calcularCustoChapa,
  calcularPesoTubo,
  calcularCustoTubo,
  validarConfig,
  MAT_CHAPA_08,
  MAT_CHAPA_10,
  MAT_CHAPA_20,
  MAT_TUBO_25,
  MAT_TUBO_38,
} from '../utils';

${constantsEntries || '// Constants to be defined based on model requirements'}

export function gerarBOM_${model.name}(config: MesaConfig): BOMResult {
  const { l, c, h, material = 'INOX_304' } = config;
  const espessura_chapa = config.espessura_chapa || 0.8;

  const bom: BOMItem[] = [];
  const { avisos } = validarConfig(config);

  // Calculate blanks
  const somaDobras = ABA + DOBRA + RAIO;
  const blankC = r1((c - 1.8) + 2 * somaDobras);
  const blankL = r1((l - 1.8) + 2 * somaDobras);

  const addChapaItem = (
    item: Omit<BOMItem, 'peso' | 'pesoTotal' | 'custo' | 'custoTotal'>
  ) => {
    if (!item.w || !item.h || !item.espessura) {
      bom.push({ ...item });
      return;
    }
    const peso = calcularPesoChapa(item.h, item.w, item.espessura, material);
    const custo = calcularCustoChapa(peso, material);
    bom.push({
      ...item,
      peso,
      pesoTotal: peso * item.qtd,
      custo,
      custoTotal: custo * item.qtd,
    });
  };

  // Items - TODO: Add dimension calculations based on model specification
${itemsCode || '  // Add items here based on model specification'}

  // Calculate totals
  const pesoTotal = bom.reduce((acc, item) => acc + (item.pesoTotal || 0), 0);
  const custoMaterial = bom.reduce((acc, item) => acc + (item.custoTotal || 0), 0);
  const areaM2 = bom.reduce((acc, item) => {
    if (!item.w || !item.h || item.w <= 0 || item.h <= 0) return acc;
    return acc + (item.w * item.h * item.qtd) / 1_000_000;
  }, 0);
  const custoMaoObra = areaM2 * CUSTOS_MAO_OBRA.BANCADA_SIMPLES + CUSTOS_MAO_OBRA.SETUP;
  const custoTotal = custoMaterial + custoMaoObra;

  return {
    modelo: '${model.name}',
    descricao: '${model.description}',
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
`;
}

/**
 * Generate engine template TypeScript code
 */
function generateEngineCode(model: ModelDefinition): string {
  return `/**
 * Engine Template for ${model.name}
 * ${model.description}
 * Generated from model definition
 */

import { WizardInput, Resultado, FormulaCtx, BOMItem } from "../../app/domain/mesas/types";

export interface ${model.name}Template {
  id: string;
  validate?: (ctx: FormulaCtx) => string[];
  blankTampo: (ctx: FormulaCtx) => { blankC: number; blankL: number };
  items: Array<{
    desc: string;
    codigo: string;
    processo: string;
    material: string;
    unidade: string;
    qtd: (ctx: FormulaCtx) => number;
    w?: (ctx: FormulaCtx) => number | undefined;
    h?: (ctx: FormulaCtx) => number | undefined;
    esp?: (ctx: FormulaCtx) => number | undefined;
    enabled?: (ctx: FormulaCtx) => boolean;
  }>;
}

export const ${model.name.toLowerCase()}: ${model.name}Template = {
  id: '${model.name.toLowerCase()}',
  
  validate: (ctx: FormulaCtx) => {
    const erros: string[] = [];
    const { C, L, H } = ctx;
    
    if (C < ${model.dimensions.width.min} || C > ${model.dimensions.width.max}) {
      erros.push(\`Largura deve estar entre ${model.dimensions.width.min}mm e ${model.dimensions.width.max}mm\`);
    }
    if (L < ${model.dimensions.length.min} || L > ${model.dimensions.length.max}) {
      erros.push(\`Comprimento deve estar entre ${model.dimensions.length.min}mm e ${model.dimensions.length.max}mm\`);
    }
    if (H < ${model.dimensions.height.min} || H > ${model.dimensions.height.max}) {
      erros.push(\`Altura deve estar entre ${model.dimensions.height.min}mm e ${model.dimensions.height.max}mm\`);
    }
    
    return erros;
  },
  
  blankTampo: (ctx: FormulaCtx) => {
    const { C, L } = ctx;
    const OFFSET = 1.8;
    const DOBRA_SOMA = 70.65;
    return {
      blankC: r1((C - OFFSET) + DOBRA_SOMA),
      blankL: r1((L - OFFSET) + DOBRA_SOMA),
    };
  },
  
  items: [
    // TODO: Define items based on model specification
  ],
};
`;
}

/**
 * Generate template TypeScript code for wizard
 */
function generateTemplateCode(model: ModelDefinition): string {
  return `/**
 * Template: ${model.name}
 * ${model.description}
 * Generated from model definition
 */

export const TEMPLATE_${model.name} = {
  // Template configuration
  name: '${model.name}',
  description: '${model.description}',
  category: '${model.category}',
  
  // Dimension constraints
  dimensions: {
    length: { min: ${model.dimensions.length.min}, max: ${model.dimensions.length.max} },
    width: { min: ${model.dimensions.width.min}, max: ${model.dimensions.width.max} },
    height: { min: ${model.dimensions.height.min}, max: ${model.dimensions.height.max} },
  },
  
  // Features
  features: {
    hasPrateleira: ${model.options?.hasPrateleira || false},
    hasEspelho: ${model.options?.hasEspelho || false},
    hasCuba: ${model.options?.hasCuba || false},
    hasBordaAgua: ${model.options?.hasBordaAgua || false},
    numPes: ${model.options?.numPes || 4},
  },
  
  // BOM Items (to be calculated)
  items: ${JSON.stringify(model.items, null, 2)},
};
`;
}

/**
 * Generate index file for model
 */
function generateIndexFile(modelNames: string[]): string {
  const imports = modelNames.map(name => 
    `import { gerarBOM_${name} } from "./${name.toLowerCase()}/${name.toLowerCase()}";`
  ).join('\n');

  const exports = modelNames.map(name => 
    `import { gerarBOM_${name} } from "./${name.toLowerCase()}/${name.toLowerCase()}";`
  ).join('\n  ');

  return `// Auto-generated index file for BOM models
// Do not edit manually

${imports}

export {
  ${modelNames.map(name => `gerarBOM_${name}`).join(',\n  ')}
};
`;
}

/**
 * Main generation function
 */
function generateCode(options: GenerateOptions): void {
  let model: ModelDefinition;
  let modelName: string;

  // Load model from file or use default
  if (options.inputPath) {
    if (!fs.existsSync(options.inputPath)) {
      console.error(`Input file not found: ${options.inputPath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(options.inputPath, 'utf-8');
    try {
      model = JSON.parse(fileContent);
      modelName = model.name;
    } catch (e) {
      console.error('Failed to parse input file as JSON');
      process.exit(1);
    }
  } else if (options.modelName) {
    modelName = options.modelName;
    model = getDefaultModelDefinition(modelName);
  } else {
    console.error('Either --input or --model must be specified');
    showHelp();
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }

  let generatedCode: string;
  let outputFileName: string;
  let outputPath: string;

  switch (options.templateType) {
    case 'engine':
      generatedCode = generateEngineCode(model);
      outputFileName = `${modelName.toLowerCase()}_engine.ts`;
      outputPath = path.join(options.outputDir, outputFileName);
      break;
    case 'template':
      generatedCode = generateTemplateCode(model);
      outputFileName = `${modelName.toLowerCase()}_template.ts`;
      outputPath = path.join(options.outputDir, outputFileName);
      break;
    default: // 'bom'
      generatedCode = generateBOMCode(model);
      // For BOM, create a subdirectory
      const modelDir = path.join(options.outputDir, modelName.toLowerCase());
      if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
      }
      outputFileName = `${modelName.toLowerCase()}.ts`;
      outputPath = path.join(modelDir, outputFileName);
  }

  // Write generated code
  fs.writeFileSync(outputPath, generatedCode, 'utf-8');

  console.log(`Generated ${options.templateType} code for ${modelName}`);
  console.log(`Output: ${outputPath}`);
}

/**
 * Main execution
 */
function main(): void {
  const options = parseArgs();
  generateCode(options);
}

main();
