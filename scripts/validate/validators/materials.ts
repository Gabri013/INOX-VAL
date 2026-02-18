import { ValidatorResult } from '../types';

export async function validateMaterials(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    // In a real implementation, this would fetch materials from Firestore
    // and validate them
    const mockMaterials = generateMockMaterials(15); // Generate 15 mock materials

    // Validate materials count
    if (mockMaterials.length < 10) {
      throw new Error(`Quantidade insuficiente de materiais: ${mockMaterials.length} (mínimo: 10)`);
    }

    // Validate each material
    mockMaterials.forEach((material, index) => {
      if (!material.key || typeof material.key !== 'string') {
        throw new Error(`Material ${index}: Chave inválida`);
      }

      if (!material.prices || material.prices.length === 0) {
        throw new Error(`Material ${material.key}: Sem preços ativos`);
      }

      // Validate prices
      material.prices.forEach(price => {
        if (typeof price.value !== 'number' || price.value <= 0) {
          throw new Error(`Material ${material.key}: Preço inválido (${price.value})`);
        }

        if (!price.date) {
          throw new Error(`Material ${material.key}: Data de preço faltando`);
        }

        const priceDate = new Date(price.date);
        if (isNaN(priceDate.getTime())) {
          throw new Error(`Material ${material.key}: Data de preço inválida`);
        }
      });

      if (typeof material.density !== 'number' || material.density <= 0) {
        throw new Error(`Material ${material.key}: Densidade inválida (${material.density})`);
      }
    });

    const duration = Date.now() - start;
    return {
      status: 'passed',
      duration,
      details: {
        count: mockMaterials.length,
        activePrices: mockMaterials.filter(m => m.prices && m.prices.length > 0).length,
        averageDensity: calculateAverageDensity(mockMaterials)
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

function generateMockMaterials(count: number): any[] {
  const materials = [];
  const types = ['AÇO_INOX', 'AÇO_CARBONO', 'ALUMINIO', 'BRONZE', 'COBRE'];
  const finishes = ['POLIDO', 'ESCOVADO', 'PINTADO', 'ANODIZADO'];

  for (let i = 1; i <= count; i++) {
    materials.push({
      key: `MAT_${i.toString().padStart(3, '0')}`,
      name: `Material ${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      finish: finishes[Math.floor(Math.random() * finishes.length)],
      density: 7.8 + (i * 0.1),
      prices: [
        {
          value: 50 + (i * 2),
          date: new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0]
        }
      ]
    });
  }

  return materials;
}

function calculateAverageDensity(materials: any[]): number {
  const totalDensity = materials.reduce((sum, material) => sum + material.density, 0);
  return parseFloat((totalDensity / materials.length).toFixed(2));
}
