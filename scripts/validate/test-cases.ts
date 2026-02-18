import { TestCase } from './types';

export const E2E_TEST_CASES: TestCase[] = [
  // MESAS
  {
    name: 'Mesa Lisa 700x600',
    templateKey: 'MESA_LISA',
    inputs: {
      width: 700,
      depth: 600,
      height: 850,
      thickness: 1.2,
      finish: 'POLIDO'
    }
  },
  {
    name: 'Mesa c/Prat 1200x700',
    templateKey: 'MESA_COM_PRATELEIRA',
    inputs: {
      width: 1200,
      depth: 700,
      height: 850,
      thickness: 1.2,
      finish: 'ESCOVADO',
      hasShelf: true
    }
  },
  {
    name: 'Mesa 2000x900 Contraventada',
    templateKey: 'MESA_CONTRAVENTADA',
    inputs: {
      width: 2000,
      depth: 900,
      height: 850,
      thickness: 1.5,
      finish: 'POLIDO',
      hasReinforcement: true
    }
  },
  
  // BANCADAS
  {
    name: 'Bancada Espelho 1500x600',
    templateKey: 'BANCADA_ESPELHO',
    inputs: {
      width: 1500,
      depth: 600,
      height: 850,
      thickness: 1.2,
      finish: 'ESCOVADO'
    }
  },
  {
    name: 'Bancada Estreita 1000x500',
    templateKey: 'BANCADA_ESTREITA',
    inputs: {
      width: 1000,
      depth: 500,
      height: 850,
      thickness: 1.0,
      finish: 'POLIDO'
    }
  },
  {
    name: 'Bancada com Cuba 1',
    templateKey: 'BANCADA_CUBA_1',
    inputs: {
      width: 1200,
      depth: 600,
      height: 850,
      thickness: 1.2,
      finish: 'ESCOVADO',
      sinkType: 'SINGLE'
    }
  },
  {
    name: 'Bancada com 2 Cubas',
    templateKey: 'BANCADA_CUBA_2',
    inputs: {
      width: 1800,
      depth: 600,
      height: 850,
      thickness: 1.2,
      finish: 'POLIDO',
      sinkType: 'DOUBLE'
    }
  },
  
  // ARMÁRIOS
  {
    name: 'Armário Aberto 1200x400',
    templateKey: 'ARMARIO_ABERTO',
    inputs: {
      width: 1200,
      depth: 400,
      height: 1800,
      thickness: 1.2,
      finish: 'ESCOVADO',
      shelfCount: 3
    }
  },
  {
    name: 'Armário 2 Portas 1000x500',
    templateKey: 'ARMARIO_2_PORTAS',
    inputs: {
      width: 1000,
      depth: 500,
      height: 1800,
      thickness: 1.2,
      finish: 'POLIDO',
      doorType: 'SWING'
    }
  },
  
  // CARRINHOS
  {
    name: 'Carrinho 2 Bandejas',
    templateKey: 'CARRINHO_2_BANDEJAS',
    inputs: {
      width: 800,
      depth: 600,
      height: 900,
      thickness: 1.0,
      finish: 'ESCOVADO',
      trayCount: 2,
      hasWheels: true
    }
  }
];
