import { processRepository } from '../src/infra/repositories/ProcessRepositoryFirestore';
import { Process, ProcessKey } from '../src/domains/engine/types';

const SEED_PROCESSES: Array<Omit<Process, 'key'> & { key: ProcessKey }> = [
  // Corte
  {
    key: 'CORTE_LASER',
    label: 'Corte a Laser',
    active: true,
    costModel: {
      setupMinutes: 15,
      costPerHour: 180,
      costPerMeter: 2.5
    },
    capacityModel: {
      unitsPerDay: 50,
      minutesPerDay: 480
    }
  },
  {
    key: 'CORTE_GUILHOTINA',
    label: 'Corte Guilhotina',
    active: true,
    costModel: {
      setupMinutes: 10,
      costPerHour: 120,
      costPerUnit: 5
    }
  },
  {
    key: 'CORTE_PLASMA',
    label: 'Corte Plasma',
    active: true,
    costModel: {
      setupMinutes: 15,
      costPerHour: 150,
      costPerMeter: 1.8
    }
  },
  // Dobra
  {
    key: 'DOBRA',
    label: 'Dobra',
    active: true,
    costModel: {
      setupMinutes: 20,
      costPerHour: 150,
      costPerBend: 8
    },
    capacityModel: {
      unitsPerDay: 30,
      minutesPerDay: 480
    }
  },
  // Solda
  {
    key: 'SOLDA_TIG',
    label: 'Solda TIG',
    active: true,
    costModel: {
      setupMinutes: 30,
      costPerHour: 200,
      costPerMeter: 25
    },
    capacityModel: {
      unitsPerDay: 20,
      minutesPerDay: 480
    }
  },
  {
    key: 'SOLDA_MIG',
    label: 'Solda MIG',
    active: true,
    costModel: {
      setupMinutes: 20,
      costPerHour: 180,
      costPerMeter: 20
    }
  },
  // Acabamento
  {
    key: 'POLIMENTO',
    label: 'Polimento',
    active: true,
    costModel: {
      setupMinutes: 15,
      costPerHour: 150,
      costPerM2: 80
    },
    capacityModel: {
      unitsPerDay: 15,
      minutesPerDay: 480
    }
  },
  {
    key: 'ESCOVADO',
    label: 'Escovado',
    active: true,
    costModel: {
      setupMinutes: 15,
      costPerHour: 140,
      costPerM2: 60
    }
  },
  {
    key: 'PASSIVACAO',
    label: 'Passivação',
    active: true,
    costModel: {
      setupMinutes: 30,
      costPerHour: 100,
      costPerM2: 30
    }
  },
  // Montagem
  {
    key: 'MONTAGEM',
    label: 'Montagem',
    active: true,
    costModel: {
      setupMinutes: 30,
      costPerHour: 120,
      costPerUnit: 15
    },
    capacityModel: {
      unitsPerDay: 25,
      minutesPerDay: 480
    }
  },
  // Embalagem
  {
    key: 'EMBALAGEM',
    label: 'Embalagem',
    active: true,
    costModel: {
      setupMinutes: 10,
      costPerHour: 80,
      costPerUnit: 10
    }
  },
  // Frete
  {
    key: 'FRETE',
    label: 'Frete',
    active: true,
    costModel: {
      setupMinutes: 0,
      costPerHour: 0,
      costPerUnit: 50 // por km ou valor fixo
    }
  },
  // Tubos
  {
    key: 'CORTE_TUBO',
    label: 'Corte de Tubo',
    active: true,
    costModel: {
      setupMinutes: 10,
      costPerHour: 100,
      costPerUnit: 5
    }
  },
  {
    key: 'DOBRA_TUBO',
    label: 'Dobra de Tubo',
    active: true,
    costModel: {
      setupMinutes: 30,
      costPerHour: 180,
      costPerBend: 25
    }
  }
];

async function seed() {
  console.log('Seeding processes...');
  
  for (const process of SEED_PROCESSES) {
    try {
      const created = await processRepository.createProcess(process);
      console.log(`Created: ${created.key}`);
    } catch (error) {
      console.error(`Error creating process:`, error);
    }
  }
  
  console.log('Done!');
}

seed();
