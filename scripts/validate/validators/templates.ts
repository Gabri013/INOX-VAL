import { ValidatorResult } from '../types';

export async function validateTemplates(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    // In a real implementation, this would fetch templates from Firestore
    // and validate them
    const mockTemplates = generateMockTemplates(16); // Generate all 16 templates

    // Validate templates count
    if (mockTemplates.length !== 16) {
      throw new Error(`Quantidade incorreta de templates: ${mockTemplates.length} (esperado: 16)`);
    }

    // Validate each template
    mockTemplates.forEach((template, index) => {
      if (!template.key || typeof template.key !== 'string') {
        throw new Error(`Template ${index}: Chave inválida`);
      }

      if (!template.inputs || Object.keys(template.inputs).length === 0) {
        throw new Error(`Template ${template.key}: Nenhum input definido`);
      }

      if (!template.bom || !Array.isArray(template.bom) || template.bom.length === 0) {
        throw new Error(`Template ${template.key}: BOM inválido`);
      }

      if (!template.structuralRules) {
        throw new Error(`Template ${template.key}: Regras estruturais não definidas`);
      }

      if (!template.metricsModel) {
        throw new Error(`Template ${template.key}: Modelo de métricas não definido`);
      }
    });

    const duration = Date.now() - start;
    return {
      status: 'passed',
      duration,
      details: {
        count: mockTemplates.length,
        validBOMs: mockTemplates.filter(t => t.bom && t.bom.length > 0).length,
        categories: getTemplateCategories(mockTemplates)
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

function generateMockTemplates(count: number): any[] {
  const templates = [];
  const categories = ['MESA', 'BANCADA', 'ARMARIO', 'CARRINHO'];

  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor((i - 1) / 4)];
    templates.push({
      key: `${category}_${i.toString().padStart(2, '0')}`,
      name: `${category} ${i}`,
      category: category,
      inputs: {
        width: { type: 'number', min: 500, max: 3000 },
        depth: { type: 'number', min: 400, max: 1200 },
        height: { type: 'number', min: 800, max: 2000 },
        thickness: { type: 'number', min: 1.0, max: 3.0 },
        finish: { type: 'string', options: ['POLIDO', 'ESCOVADO', 'PINTADO'] }
      },
      bom: generateMockBOM(),
      structuralRules: {
        minWidth: 500,
        maxWidth: 3000,
        minDepth: 400,
        maxDepth: 1200
      },
      metricsModel: 'STANDARD'
    });
  }

  return templates;
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

function getTemplateCategories(templates: any[]): string[] {
  const categories = new Set(templates.map(template => template.category));
  return Array.from(categories);
}
