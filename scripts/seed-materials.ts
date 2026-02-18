import { materialRepository } from '../src/infra/repositories/MaterialRepositoryFirestore';
import { Material } from '../src/domains/engine/types';

const SEED_MATERIALS: Array<Omit<Material, 'key'>> = [
  // Chapas 304
  {
    kind: 'sheet',
    alloy: '304',
    thicknessMm: 1.0,
    finish: 'POLIDO',
    format: { widthMm: 3000, heightMm: 1250, supplierFormatName: 'Padrão 3m' },
    supplierId: 'FORN_A',
    densityKgM3: 7930,
    active: true,
    priceHistory: [
      {
        currency: 'BRL',
        pricePerKg: 45.00,
        supplierId: 'FORN_A',
        validFrom: '2024-01-01',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    kind: 'sheet',
    alloy: '304',
    thicknessMm: 1.2,
    finish: 'POLIDO',
    format: { widthMm: 3000, heightMm: 1250, supplierFormatName: 'Padrão 3m' },
    supplierId: 'FORN_A',
    densityKgM3: 7930,
    active: true,
    priceHistory: [
      {
        currency: 'BRL',
        pricePerKg: 48.00,
        supplierId: 'FORN_A',
        validFrom: '2024-01-01',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    kind: 'sheet',
    alloy: '304',
    thicknessMm: 1.5,
    finish: 'POLIDO',
    format: { widthMm: 3000, heightMm: 1250, supplierFormatName: 'Padrão 3m' },
    supplierId: 'FORN_A',
    densityKgM3: 7930,
    active: true,
    priceHistory: [
      {
        currency: 'BRL',
        pricePerKg: 52.00,
        supplierId: 'FORN_A',
        validFrom: '2024-01-01',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    kind: 'sheet',
    alloy: '304',
    thicknessMm: 1.2,
    finish: 'ESCOVADO',
    format: { widthMm: 3000, heightMm: 1250, supplierFormatName: 'Padrão 3m', grainDirection: 'x' },
    supplierId: 'FORN_A',
    densityKgM3: 7930,
    active: true,
    priceHistory: [
      {
        currency: 'BRL',
        pricePerKg: 55.00,
        supplierId: 'FORN_A',
        validFrom: '2024-01-01',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  },
  // Chapas 316L
  {
    kind: 'sheet',
    alloy: '316L',
    thicknessMm: 1.5,
    finish: 'POLIDO',
    format: { widthMm: 3000, heightMm: 1250, supplierFormatName: 'Padrão 3m' },
    supplierId: 'FORN_B',
    densityKgM3: 8000,
    active: true,
    priceHistory: [
      {
        currency: 'BRL',
        pricePerKg: 85.00,
        supplierId: 'FORN_B',
        validFrom: '2024-01-01',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  },
  // Tubos
  {
    kind: 'tube',
    alloy: '304',
    finish: 'POLIDO',
    tubeProfile: { widthMm: 40, heightMm: 40, thicknessMm: 1.2, lengthMm: 6000 },
    supplierId: 'FORN_C',
    densityKgM3: 7930,
    active: true,
    priceHistory: [
      {
        currency: 'BRL',
        pricePerMeter: 35.00,
        supplierId: 'FORN_C',
        validFrom: '2024-01-01',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    kind: 'tube',
    alloy: '304',
    finish: 'POLIDO',
    tubeProfile: { widthMm: 30, heightMm: 30, thicknessMm: 1.0, lengthMm: 6000 },
    supplierId: 'FORN_C',
    densityKgM3: 7930,
    active: true,
    priceHistory: [
      {
        currency: 'BRL',
        pricePerMeter: 28.00,
        supplierId: 'FORN_C',
        validFrom: '2024-01-01',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  }
];

async function seed() {
  console.log('Seeding materials...');
  
  for (const material of SEED_MATERIALS) {
    try {
      const created = await materialRepository.createMaterial(material);
      console.log(`Created: ${created.key}`);
    } catch (error) {
      console.error(`Error creating material:`, error);
    }
  }
  
  console.log('Done!');
}

seed();
