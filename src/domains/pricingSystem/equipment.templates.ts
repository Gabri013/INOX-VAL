// ============================================================
// EQUIPMENT TEMPLATES - Define equipment types and BOM generation
// ============================================================

import {
  EquipmentTemplate,
  EquipmentInputs,
  BOM,
  SheetPart,
  TubePart,
  AccessoryPart,
  ProcessRequirement,
  InputField,
  StructuralRule,
  ProcessRule,
} from './pricing.types';

// ============================================================
// MESA LISA (Simple Table)
// ============================================================

const MESA_LISA_INPUTS: InputField[] = [
  { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 300, max: 3000, default: 1000 },
  { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 1500, default: 600 },
  { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 500, max: 1200, default: 900 },
  { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 3.0, default: 1.2 },
  { 
    key: 'finish', 
    label: 'Acabamento', 
    type: 'select', 
    default: 'POLIDO',
    options: [
      { value: 'POLIDO', label: 'Polido' },
      { value: 'ESCOVADO', label: 'Escovado' },
      { value: '2B', label: '2B (Natural)' }
    ]
  },
  { key: 'hasCasters', label: 'Com rodízios', type: 'boolean', default: false },
];

const MESA_LISA_STRUCTURAL_RULES: StructuralRule[] = [
  {
    id: 'DEPTH_REINFORCEMENT',
    condition: 'depth > 700',
    action: 'ADD_TUBE',
    params: { type: 'MID_REINF', lengthExpr: 'width - 80' },
    message: 'Profundidade > 700mm requer reforço central'
  },
  {
    id: 'WIDTH_THICKNESS',
    condition: 'width > 2000',
    action: 'REQUIRE_MIN_THICKNESS',
    params: { minThickness: 1.5 },
    message: 'Largura > 2000mm requer espessura mínima 1.5mm'
  },
  {
    id: 'MAX_WIDTH',
    condition: 'width > 3000',
    action: 'BLOCK',
    params: { reason: 'TOO_WIDE' },
    message: 'Largura máxima permitida: 3000mm'
  }
];

const MESA_LISA_PROCESS_RULES: ProcessRule[] = [
  { processKey: 'CORTE_LASER', params: {} },
  { processKey: 'DOBRA', params: {} },
  { processKey: 'SOLDA_TIG', params: {} },
  { processKey: 'POLIMENTO', condition: 'finish === "POLIDO"', params: {} },
  { processKey: 'ESCOVADO', condition: 'finish === "ESCOVADO"', params: {} },
  { processKey: 'MONTAGEM', params: {} },
  { processKey: 'EMBALAGEM', params: {} }
];

function generateMesaLisaBOM(inputs: EquipmentInputs): BOM {
  const { width, depth, height, thickness, finish, hasCasters } = inputs;
  
  const sheetParts: SheetPart[] = [];
  const tubes: TubePart[] = [];
  const accessories: AccessoryPart[] = [];
  const processes: ProcessRequirement[] = [];
  
  // Tampo (topo) - chapa principal
  sheetParts.push({
    id: 'TAMPO',
    label: 'Tampo',
    materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
    quantity: 1,
    blank: { width, height: depth },
    thickness,
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: []
  });
  
  // Saia (frontal e traseira)
  const skirtHeight = 50; // mm
  sheetParts.push({
    id: 'SAIA_FRONT',
    label: 'Saia Frontal',
    materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
    quantity: 1,
    blank: { width, height: skirtHeight },
    thickness,
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: [
      { angle: 90, position: skirtHeight, direction: 'up', kFactor: 0.33 }
    ]
  });
  
  sheetParts.push({
    id: 'SAIA_BACK',
    label: 'Saia Traseira',
    materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
    quantity: 1,
    blank: { width, height: skirtHeight },
    thickness,
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: [
      { angle: 90, position: skirtHeight, direction: 'up', kFactor: 0.33 }
    ]
  });
  
  // Laterais (esquerda e direita)
  sheetParts.push({
    id: 'LATERAL_LEFT',
    label: 'Lateral Esquerda',
    materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
    quantity: 1,
    blank: { width: depth, height: height - thickness },
    thickness,
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: []
  });
  
  sheetParts.push({
    id: 'LATERAL_RIGHT',
    label: 'Lateral Direita',
    materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
    quantity: 1,
    blank: { width: depth, height: height - thickness },
    thickness,
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: []
  });
  
  // Reforço central (se profundidade > 700)
  if (depth > 700) {
    tubes.push({
      id: 'REINF_CENTER',
      label: 'Reforço Central',
      materialKey: 'TUBE#SS304#40x40x1.2#6000#DEFAULT',
      quantity: 1,
      length: width - 80,
      profile: '40x40x1.2'
    });
  }
  
  // Rodízios (se selecionado)
  if (hasCasters) {
    accessories.push({
      id: 'CASTER',
      label: 'Rodízio',
      sku: 'ROD-50-POLI',
      quantity: 4,
      unitCost: 25 // R$ cada
    });
  }
  
  // Processos
  processes.push({
    processKey: 'CORTE_LASER',
    partId: 'ALL',
    metrics: { cutLength: 0 } // Calculado depois
  });
  
  processes.push({
    processKey: 'SOLDA_TIG',
    partId: 'ALL',
    metrics: { weldLength: 0 } // Calculado depois
  });
  
  if (finish === 'POLIDO') {
    processes.push({
      processKey: 'POLIMENTO',
      partId: 'TAMPO',
      metrics: { finishArea: 0 } // Calculado depois
    });
  } else if (finish === 'ESCOVADO') {
    processes.push({
      processKey: 'ESCOVADO',
      partId: 'TAMPO',
      metrics: { finishArea: 0 } // Calculado depois
    });
  }
  
  processes.push({
    processKey: 'MONTAGEM',
    partId: 'ALL',
    metrics: {}
  });
  
  processes.push({
    processKey: 'EMBALAGEM',
    partId: 'ALL',
    metrics: {}
  });
  
  return {
    sheetParts,
    tubes,
    accessories,
    processes
  };
}

export const MESA_LISA: EquipmentTemplate = {
  key: 'MESA_LISA',
  label: 'Mesa Lisa',
  category: 'MESA',
  description: 'Mesa simples em aço inox com tampo e saia',
  requiredInputs: MESA_LISA_INPUTS,
  generateBOM: generateMesaLisaBOM,
  structuralRules: MESA_LISA_STRUCTURAL_RULES,
  processRules: MESA_LISA_PROCESS_RULES
};

// ============================================================
// MESA COM PRATELEIRA (Table with Shelf)
// ============================================================

const MESA_COM_PRATELEIRA_INPUTS: InputField[] = [
  { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 300, max: 3000, default: 1000 },
  { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 1500, default: 600 },
  { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 500, max: 1200, default: 900 },
  { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 3.0, default: 1.2 },
  { 
    key: 'finish', 
    label: 'Acabamento', 
    type: 'select', 
    default: 'POLIDO',
    options: [
      { value: 'POLIDO', label: 'Polido' },
      { value: 'ESCOVADO', label: 'Escovado' },
      { value: '2B', label: '2B (Natural)' }
    ]
  },
  { key: 'hasShelf', label: 'Com prateleira', type: 'boolean', default: true },
  { key: 'hasCasters', label: 'Com rodízios', type: 'boolean', default: false },
];

const MESA_COM_PRATELEIRA_STRUCTURAL_RULES: StructuralRule[] = [
  ...MESA_LISA_STRUCTURAL_RULES,
  {
    id: 'SHELF_CLEARANCE',
    condition: 'hasShelf && height < 700',
    action: 'BLOCK',
    params: { reason: 'INSUFFICIENT_HEIGHT' },
    message: 'Altura mínima para prateleira: 700mm'
  }
];

const MESA_COM_PRATELEIRA_PROCESS_RULES: ProcessRule[] = [
  ...MESA_LISA_PROCESS_RULES
];

function generateMesaComPrateleiraBOM(inputs: EquipmentInputs): BOM {
  // Começar com BOM da mesa lisa
  const baseBOM = generateMesaLisaBOM(inputs);
  
  const { width, depth, thickness, finish, hasShelf } = inputs;
  
  // Adicionar prateleira se selecionado
  if (hasShelf) {
    const shelfHeight = inputs.height || 900;
    const shelfPosition = Math.floor(shelfHeight * 0.4); // 40% da altura
    
    baseBOM.sheetParts.push({
      id: 'PRATELEIRA',
      label: 'Prateleira',
      materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
      quantity: 1,
      blank: { width: width - 40, height: depth - 20 }, // Menor que o tampo
      thickness,
      allowRotate: true,
      grainDirection: null,
      features: [],
      bends: []
    });
    
    // Reforços para prateleira
    baseBOM.tubes.push({
      id: 'SHELF_SUPPORT_LEFT',
      label: 'Suporte Prateleira Esq',
      materialKey: 'TUBE#SS304#30x30x1.0#6000#DEFAULT',
      quantity: 1,
      length: shelfPosition - 20,
      profile: '30x30x1.0'
    });
    
    baseBOM.tubes.push({
      id: 'SHELF_SUPPORT_RIGHT',
      label: 'Suporte Prateleira Dir',
      materialKey: 'TUBE#SS304#30x30x1.0#6000#DEFAULT',
      quantity: 1,
      length: shelfPosition - 20,
      profile: '30x30x1.0'
    });
  }
  
  return baseBOM;
}

export const MESA_COM_PRATELEIRA: EquipmentTemplate = {
  key: 'MESA_COM_PRATELEIRA',
  label: 'Mesa com Prateleira',
  category: 'MESA',
  description: 'Mesa em aço inox com tampo, saia e prateleira inferior',
  requiredInputs: MESA_COM_PRATELEIRA_INPUTS,
  generateBOM: generateMesaComPrateleiraBOM,
  structuralRules: MESA_COM_PRATELEIRA_STRUCTURAL_RULES,
  processRules: MESA_COM_PRATELEIRA_PROCESS_RULES
};

// ============================================================
// BANCADA COM ESPELHO (Countertop with Backsplash)
// ============================================================

const BANCADA_COM_ESPELHO_INPUTS: InputField[] = [
  { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 500, max: 3000, default: 1500 },
  { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 400, max: 900, default: 600 },
  { key: 'height', label: 'Altura de trabalho', type: 'number', unit: 'mm', min: 800, max: 950, default: 850 },
  { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 1.0, max: 3.0, default: 1.5 },
  { 
    key: 'finish', 
    label: 'Acabamento', 
    type: 'select', 
    default: 'POLIDO',
    options: [
      { value: 'POLIDO', label: 'Polido' },
      { value: 'ESCOVADO', label: 'Escovado' },
      { value: '2B', label: '2B (Natural)' }
    ]
  },
  { key: 'hasBacksplash', label: 'Com espelho', type: 'boolean', default: true },
  { key: 'backsplashHeight', label: 'Altura do espelho', type: 'number', unit: 'mm', min: 100, max: 600, default: 300 },
  { key: 'hasShelf', label: 'Com prateleira inferior', type: 'boolean', default: false },
];

const BANCADA_COM_ESPELHO_STRUCTURAL_RULES: StructuralRule[] = [
  {
    id: 'DEPTH_REINFORCEMENT',
    condition: 'depth > 700',
    action: 'ADD_TUBE',
    params: { type: 'MID_REINF', lengthExpr: 'width - 80' },
    message: 'Profundidade > 700mm requer reforço central'
  },
  {
    id: 'WIDTH_THICKNESS',
    condition: 'width > 2500',
    action: 'REQUIRE_MIN_THICKNESS',
    params: { minThickness: 2.0 },
    message: 'Largura > 2500mm requer espessura mínima 2.0mm'
  },
  {
    id: 'MAX_WIDTH',
    condition: 'width > 3000',
    action: 'BLOCK',
    params: { reason: 'TOO_WIDE' },
    message: 'Largura máxima permitida: 3000mm'
  },
  {
    id: 'BACKSPLASH_HEIGHT',
    condition: 'backsplashHeight > 500',
    action: 'ADD_TUBE',
    params: { type: 'BACKSPLASH_SUPPORT', lengthExpr: 'backsplashHeight' },
    message: 'Espelho > 500mm requer reforço estrutural'
  }
];

const BANCADA_COM_ESPELHO_PROCESS_RULES: ProcessRule[] = [
  { processKey: 'CORTE_LASER', params: {} },
  { processKey: 'DOBRA', params: {} },
  { processKey: 'SOLDA_TIG', params: {} },
  { processKey: 'POLIMENTO', condition: 'finish === "POLIDO"', params: {} },
  { processKey: 'ESCOVADO', condition: 'finish === "ESCOVADO"', params: {} },
  { processKey: 'PASSIVACAO', params: {} },
  { processKey: 'MONTAGEM', params: {} },
  { processKey: 'EMBALAGEM', params: {} }
];

function generateBancadaComEspelhoBOM(inputs: EquipmentInputs): BOM {
  const { width, depth, height, thickness, finish, hasBacksplash, backsplashHeight, hasShelf } = inputs;
  
  const sheetParts: SheetPart[] = [];
  const tubes: TubePart[] = [];
  const accessories: AccessoryPart[] = [];
  const processes: ProcessRequirement[] = [];
  
  const actualBacksplashHeight = backsplashHeight || 300;
  
  // Tampo (área de trabalho)
  sheetParts.push({
    id: 'TAMPO',
    label: 'Tampo',
    materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
    quantity: 1,
    blank: { width, height: depth },
    thickness,
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: []
  });
  
  // Saia frontal
  const skirtHeight = 50;
  sheetParts.push({
    id: 'SAIA_FRONT',
    label: 'Saia Frontal',
    materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
    quantity: 1,
    blank: { width, height: skirtHeight },
    thickness,
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: [
      { angle: 90, position: skirtHeight, direction: 'up', kFactor: 0.33 }
    ]
  });
  
  // Espelho (backsplash)
  if (hasBacksplash) {
    sheetParts.push({
      id: 'BACKSPLASH',
      label: 'Espelho',
      materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
      quantity: 1,
      blank: { width, height: actualBacksplashHeight },
      thickness,
      allowRotate: true,
      grainDirection: null,
      features: [],
      bends: [
        { angle: 90, position: actualBacksplashHeight, direction: 'down', kFactor: 0.33 }
      ]
    });
    
    // Reforço do espelho se muito alto
    if (actualBacksplashHeight > 500) {
      tubes.push({
        id: 'BACKSPLASH_SUPPORT',
        label: 'Suporte Espelho',
        materialKey: 'TUBE#SS304#30x30x1.0#6000#DEFAULT',
        quantity: Math.ceil(width / 600), // Um a cada 600mm
        length: actualBacksplashHeight - 50,
        profile: '30x30x1.0'
      });
    }
  }
  
  // Laterais
  sheetParts.push({
    id: 'LATERAL_LEFT',
    label: 'Lateral Esquerda',
    materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
    quantity: 1,
    blank: { width: depth, height: height - thickness },
    thickness,
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: []
  });
  
  sheetParts.push({
    id: 'LATERAL_RIGHT',
    label: 'Lateral Direita',
    materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
    quantity: 1,
    blank: { width: depth, height: height - thickness },
    thickness,
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: []
  });
  
  // Reforço central (se profundidade > 700)
  if (depth > 700) {
    tubes.push({
      id: 'REINF_CENTER',
      label: 'Reforço Central',
      materialKey: 'TUBE#SS304#40x40x1.2#6000#DEFAULT',
      quantity: 1,
      length: width - 80,
      profile: '40x40x1.2'
    });
  }
  
  // Prateleira inferior (se selecionado)
  if (hasShelf) {
    sheetParts.push({
      id: 'PRATELEIRA',
      label: 'Prateleira Inferior',
      materialKey: `SHEET#SS304#${thickness}#${finish}#3000x1250#DEFAULT`,
      quantity: 1,
      blank: { width: width - 40, height: depth - 20 },
      thickness,
      allowRotate: true,
      grainDirection: null,
      features: [],
      bends: []
    });
  }
  
  // Pés reguláveis
  accessories.push({
    id: 'LEVELING_FOOT',
    label: 'Pé Regulável',
    sku: 'PE-REG-INOX-50',
    quantity: 4,
    unitCost: 35
  });
  
  // Processos
  processes.push({
    processKey: 'CORTE_LASER',
    partId: 'ALL',
    metrics: { cutLength: 0 }
  });
  
  processes.push({
    processKey: 'DOBRA',
    partId: 'BACKSPLASH',
    metrics: { bendCount: 1 }
  });
  
  processes.push({
    processKey: 'SOLDA_TIG',
    partId: 'ALL',
    metrics: { weldLength: 0 }
  });
  
  if (finish === 'POLIDO') {
    processes.push({
      processKey: 'POLIMENTO',
      partId: 'TAMPO',
      metrics: { finishArea: 0 }
    });
  } else if (finish === 'ESCOVADO') {
    processes.push({
      processKey: 'ESCOVADO',
      partId: 'TAMPO',
      metrics: { finishArea: 0 }
    });
  }
  
  processes.push({
    processKey: 'PASSIVACAO',
    partId: 'ALL',
    metrics: { finishArea: 0 }
  });
  
  processes.push({
    processKey: 'MONTAGEM',
    partId: 'ALL',
    metrics: {}
  });
  
  processes.push({
    processKey: 'EMBALAGEM',
    partId: 'ALL',
    metrics: {}
  });
  
  return {
    sheetParts,
    tubes,
    accessories,
    processes
  };
}

export const BANCADA_COM_ESPELHO: EquipmentTemplate = {
  key: 'BANCADA_COM_ESPELHO',
  label: 'Bancada com Espelho',
  category: 'BANCADA',
  description: 'Bancada em aço inox com tampo e espelho (backsplash)',
  requiredInputs: BANCADA_COM_ESPELHO_INPUTS,
  generateBOM: generateBancadaComEspelhoBOM,
  structuralRules: BANCADA_COM_ESPELHO_STRUCTURAL_RULES,
  processRules: BANCADA_COM_ESPELHO_PROCESS_RULES
};

// ============================================================
// Template Registry
// ============================================================

export const EQUIPMENT_TEMPLATES: Record<string, EquipmentTemplate> = {
  MESA_LISA,
  MESA_COM_PRATELEIRA,
  BANCADA_COM_ESPELHO
};

export function getTemplate(key: string): EquipmentTemplate | undefined {
  return EQUIPMENT_TEMPLATES[key];
}

export function getAllTemplates(): EquipmentTemplate[] {
  return Object.values(EQUIPMENT_TEMPLATES);
}

export function getTemplatesByCategory(category: string): EquipmentTemplate[] {
  return Object.values(EQUIPMENT_TEMPLATES).filter(t => t.category === category);
}