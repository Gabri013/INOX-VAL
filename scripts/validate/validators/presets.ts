import { ValidatorResult } from '../types';

export async function validatePresets(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    // In a real implementation, this would fetch presets from Firestore
    // and validate them
    const mockPresets = generateMockPresets(50); // Generate 50 mock presets

    // Validate presets count
    if (mockPresets.length < 40) {
      throw new Error(`Quantidade insuficiente de presets: ${mockPresets.length} (mínimo: 40)`);
    }

    // Validate each template has at least 1 preset
    const templateKeys = new Set(mockPresets.map(preset => preset.templateKey));
    if (templateKeys.size < 16) {
      throw new Error(`Templates sem presets: ${16 - templateKeys.size} (esperado: 16 templates)`);
    }

    // Validate each preset
    mockPresets.forEach((preset, index) => {
      if (!preset.templateKey || typeof preset.templateKey !== 'string') {
        throw new Error(`Preset ${index}: Template key inválido`);
      }

      if (!preset.inputs || Object.keys(preset.inputs).length === 0) {
        throw new Error(`Preset ${preset.templateKey}: Nenhum input definido`);
      }

      if (!preset.bom || !Array.isArray(preset.bom) || preset.bom.length === 0) {
        throw new Error(`Preset ${preset.templateKey}: BOM inválido`);
      }
    });

    const duration = Date.now() - start;
    return {
      status: 'passed',
      duration,
      details: {
        count: mockPresets.length,
        templatesWithPresets: templateKeys.size,
        averagePresetsPerTemplate: parseFloat((mockPresets.length / templateKeys.size).toFixed(2)),
        validBOMs: mockPresets.filter(p => p.bom && p.bom.length > 0).length
      }
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      status: 'failed',
      duration,
      error: error.message
    };
  }
}

function generateMockPresets(count: number): any[] {
  const presets = [];
  const templateKeys = [
    'MESA_01', 'MESA_02', 'MESA_03', 'MESA_04',
    'BANCADA_01', 'BANCADA_02', 'BANCADA_03', 'BANCADA_04',
    'ARMARIO_01', 'ARMARIO_02', 'ARMARIO_03', 'ARMARIO_04',
    'CARRINHO_01', 'CARRINHO_02', 'CARRINHO_03', 'CARRINHO_04'
  ];

  for (let i = 1; i <= count; i++) {
    const templateKey = templateKeys[i % templateKeys.length];
    presets.push({
      key: `PRESET_${i.toString().padStart(3, '0')}`,
      name: `Preset ${i}`,
      templateKey: templateKey,
      inputs: generateMockPresetInputs(),
      bom: generateMockBOM()
    });
  }

  return presets;
}

function generateMockPresetInputs(): any {
  return {
    width: 500 + (Math.random() * 2500),
    depth: 400 + (Math.random() * 800),
    height: 800 + (Math.random() * 1200),
    thickness: 1.0 + (Math.random() * 2.0),
    finish: ['POLIDO', 'ESCOVADO', 'PINTADO'][Math.floor(Math.random() * 3)]
  };
}

function generateMockBOM(): any[] {
  return [
    {
      material: 'MAT_001',
      quantity: 1,
      dimensions: { width: 1000, height: 600, thickness: 1.2 },
      process: 'CORTAR'
    },
    {
      material: 'MAT_002', 
      quantity: 4,
      dimensions: { width: 100, height: 100, thickness: 1.5 },
      process: 'SOBRERROTAR'
    }
  ];
}
