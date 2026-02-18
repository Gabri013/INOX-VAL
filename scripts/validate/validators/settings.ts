import { ValidatorResult } from '../types';

export async function validateSettings(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    // In a real implementation, this would fetch and validate settings from Firestore
    const mockSettings = generateMockSettings();

    // Validate settings structure
    if (!mockSettings.company) {
      throw new Error('Configurações da empresa não definidas');
    }

    if (!mockSettings.currency) {
      throw new Error('Moeda não definida');
    }

    if (!mockSettings.taxRates) {
      throw new Error('Taxas de impostos não definidas');
    }

    if (!mockSettings.units) {
      throw new Error('Unidades de medida não definidas');
    }

    // Validate tax rates
    if (!mockSettings.taxRates.iss || mockSettings.taxRates.iss < 0) {
      throw new Error('Taxa ISS inválida');
    }

    if (!mockSettings.taxRates.icms || mockSettings.taxRates.icms < 0) {
      throw new Error('Taxa ICMS inválida');
    }

    // Validate units
    if (!mockSettings.units.length || mockSettings.units.length < 3) {
      throw new Error('Quantidade insuficiente de unidades de medida');
    }

    const duration = Date.now() - start;
    return {
      status: 'passed',
      duration,
      details: {
        companyName: mockSettings.company.name,
        currency: mockSettings.currency,
        taxRatesCount: Object.keys(mockSettings.taxRates).length,
        unitsCount: mockSettings.units.length
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

function generateMockSettings(): any {
  return {
    company: {
      name: 'INOX-VAL Industria e Comercio',
      cnpj: '12.345.678/0001-90',
      address: 'Rua da Indústria, 123',
      city: 'São Paulo',
      state: 'SP',
      cep: '01234-567'
    },
    currency: 'BRL',
    taxRates: {
      iss: 5.0,
      icms: 18.0,
      pis: 1.86,
      cofins: 8.5
    },
    units: ['mm', 'cm', 'm', 'kg', 'g'],
    precision: {
      dimensions: 2,
      price: 2,
      weight: 3
    },
    workingHours: {
      Monday: { start: '08:00', end: '18:00' },
      Tuesday: { start: '08:00', end: '18:00' },
      Wednesday: { start: '08:00', end: '18:00' },
      Thursday: { start: '08:00', end: '18:00' },
      Friday: { start: '08:00', end: '18:00' },
      Saturday: null,
      Sunday: null
    }
  };
}
