import { CalibrationFactor, Baseline } from '../src/domains/calibration/types';

// Mock data for calibration factors
const CALIBRATION_FACTORS: CalibrationFactor[] = [
  {
    id: 'factor-global-1',
    type: 'global',
    factors: { material: 1.02, process: 0.98 },
    description: 'Ajuste global de custos - Jan/2024',
    effectiveFrom: '2024-01-01',
    active: true,
  },
  {
    id: 'factor-template-1',
    type: 'template',
    targetKey: 'template-1',
    factors: { weld: 1.05, cut: 0.95 },
    description: 'Ajuste para template de mesa simples',
    effectiveFrom: '2024-01-15',
    active: true,
  },
  {
    id: 'factor-template-2',
    type: 'template',
    targetKey: 'template-2',
    factors: { assembly: 1.1, material: 0.98 },
    description: 'Ajuste para template de mesa com tampo',
    effectiveFrom: '2024-02-01',
    active: true,
  },
  {
    id: 'factor-process-1',
    type: 'process',
    targetKey: 'welding',
    factors: { weld: 1.03 },
    description: 'Ajuste para processo de solda - alta precisão',
    effectiveFrom: '2024-02-15',
    active: true,
  },
  {
    id: 'factor-process-2',
    type: 'process',
    targetKey: 'cutting',
    factors: { cut: 0.97 },
    description: 'Ajuste para processo de corte laser',
    effectiveFrom: '2024-03-01',
    active: true,
  },
];

// Mock data for baselines
const BASELINES: Baseline[] = [
  {
    id: 'baseline-1',
    templateKey: 'template-1',
    inputs: { size: '100x60', material: 'stainless-steel', thickness: 2 },
    expectedCost: {
      material: 1150,
      process: 600,
      overhead: 200,
      margin: 450,
      total: 2400,
    },
    expectedMetrics: {
      weldMeters: 12.0,
      cutMeters: 7.0,
      finishM2: 3.0,
      bendCount: 3.0,
    },
    notes: 'Baseline para mesa simples de inox - 100x60cm',
    createdAt: '2024-01-10T10:00:00Z',
    createdBy: 'admin@inoxval.com',
  },
  {
    id: 'baseline-2',
    templateKey: 'template-2',
    inputs: { size: '120x70', material: 'stainless-steel', thickness: 3 },
    expectedCost: {
      material: 1800,
      process: 900,
      overhead: 250,
      margin: 600,
      total: 3550,
    },
    expectedMetrics: {
      weldMeters: 15.5,
      cutMeters: 9.2,
      finishM2: 4.0,
      bendCount: 4.5,
    },
    notes: 'Baseline para mesa com tampo - 120x70cm',
    createdAt: '2024-01-15T14:30:00Z',
    createdBy: 'admin@inoxval.com',
  },
  {
    id: 'baseline-3',
    templateKey: 'template-3',
    inputs: { size: '150x80', material: 'aluminum', thickness: 2.5 },
    expectedCost: {
      material: 1450,
      process: 750,
      overhead: 220,
      margin: 550,
      total: 2970,
    },
    expectedMetrics: {
      weldMeters: 18.0,
      cutMeters: 10.5,
      finishM2: 4.8,
      bendCount: 5.0,
    },
    notes: 'Baseline para mesa complexa de alumínio - 150x80cm',
    createdAt: '2024-01-20T09:15:00Z',
    createdBy: 'admin@inoxval.com',
  },
  {
    id: 'baseline-4',
    templateKey: 'template-1',
    inputs: { size: '110x65', material: 'stainless-steel', thickness: 2 },
    expectedCost: {
      material: 1300,
      process: 680,
      overhead: 210,
      margin: 500,
      total: 2690,
    },
    expectedMetrics: {
      weldMeters: 13.2,
      cutMeters: 7.8,
      finishM2: 3.4,
      bendCount: 3.2,
    },
    notes: 'Baseline para mesa simples de inox - 110x65cm',
    createdAt: '2024-01-25T16:45:00Z',
    createdBy: 'admin@inoxval.com',
  },
  {
    id: 'baseline-5',
    templateKey: 'template-2',
    inputs: { size: '130x75', material: 'stainless-steel', thickness: 3 },
    expectedCost: {
      material: 2000,
      process: 1000,
      overhead: 280,
      margin: 650,
      total: 3930,
    },
    expectedMetrics: {
      weldMeters: 16.8,
      cutMeters: 10.0,
      finishM2: 4.3,
      bendCount: 4.8,
    },
    notes: 'Baseline para mesa com tampo - 130x75cm',
    createdAt: '2024-02-01T11:20:00Z',
    createdBy: 'admin@inoxval.com',
  },
  {
    id: 'baseline-6',
    templateKey: 'template-3',
    inputs: { size: '160x85', material: 'aluminum', thickness: 3 },
    expectedCost: {
      material: 1600,
      process: 850,
      overhead: 240,
      margin: 600,
      total: 3290,
    },
    expectedMetrics: {
      weldMeters: 19.5,
      cutMeters: 11.2,
      finishM2: 5.2,
      bendCount: 5.5,
    },
    notes: 'Baseline para mesa complexa de alumínio - 160x85cm',
    createdAt: '2024-02-05T13:10:00Z',
    createdBy: 'admin@inoxval.com',
  },
  {
    id: 'baseline-7',
    templateKey: 'template-1',
    inputs: { size: '120x60', material: 'stainless-steel', thickness: 2.5 },
    expectedCost: {
      material: 1450,
      process: 720,
      overhead: 220,
      margin: 520,
      total: 2910,
    },
    expectedMetrics: {
      weldMeters: 13.8,
      cutMeters: 8.0,
      finishM2: 3.6,
      bendCount: 3.5,
    },
    notes: 'Baseline para mesa simples de inox - 120x60cm, espessura 2.5mm',
    createdAt: '2024-02-10T08:30:00Z',
    createdBy: 'admin@inoxval.com',
  },
  {
    id: 'baseline-8',
    templateKey: 'template-2',
    inputs: { size: '140x80', material: 'stainless-steel', thickness: 3 },
    expectedCost: {
      material: 2200,
      process: 1080,
      overhead: 300,
      margin: 700,
      total: 4280,
    },
    expectedMetrics: {
      weldMeters: 18.0,
      cutMeters: 10.8,
      finishM2: 4.8,
      bendCount: 5.0,
    },
    notes: 'Baseline para mesa com tampo - 140x80cm',
    createdAt: '2024-02-15T15:00:00Z',
    createdBy: 'admin@inoxval.com',
  },
  {
    id: 'baseline-9',
    templateKey: 'template-3',
    inputs: { size: '170x90', material: 'aluminum', thickness: 3 },
    expectedCost: {
      material: 1800,
      process: 950,
      overhead: 260,
      margin: 650,
      total: 3660,
    },
    expectedMetrics: {
      weldMeters: 21.0,
      cutMeters: 12.0,
      finishM2: 5.7,
      bendCount: 6.0,
    },
    notes: 'Baseline para mesa complexa de alumínio - 170x90cm',
    createdAt: '2024-02-20T10:45:00Z',
    createdBy: 'admin@inoxval.com',
  },
  {
    id: 'baseline-10',
    templateKey: 'template-1',
    inputs: { size: '100x70', material: 'stainless-steel', thickness: 2 },
    expectedCost: {
      material: 1200,
      process: 650,
      overhead: 205,
      margin: 470,
      total: 2525,
    },
    expectedMetrics: {
      weldMeters: 12.5,
      cutMeters: 7.5,
      finishM2: 3.2,
      bendCount: 3.3,
    },
    notes: 'Baseline para mesa simples de inox - 100x70cm',
    createdAt: '2024-02-25T14:00:00Z',
    createdBy: 'admin@inoxval.com',
  },
];

export { CALIBRATION_FACTORS, BASELINES };

// Seed function to populate Firestore
export async function seedCalibrationData() {
  console.log('Starting calibration data seed...');
  
  // TODO: Implement Firestore seeding logic here
  
  console.log('Calibration data seed completed.');
  console.log(`Created ${CALIBRATION_FACTORS.length} calibration factors`);
  console.log(`Created ${BASELINES.length} baselines`);
}

// Run seed if called directly
if (require.main === module) {
  seedCalibrationData().catch(console.error);
}
