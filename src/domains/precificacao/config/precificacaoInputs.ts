export type PrecificacaoField = {
  label: string;
  cell: string;
  unit?: string;
  type?: 'number' | 'text';
  options?: { label: string; value: string | number }[];
};

export type PrecificacaoSheetConfig = {
  name: string;
  label: string;
  fields: PrecificacaoField[];
  outputs: { label: string; cell: string }[];
};

export const PRECIFICACAO_SHEETS: PrecificacaoSheetConfig[] = [
  {
    name: 'Banc',
    label: 'Bancadas e Cubas',
    fields: [
      { label: 'Comprimento (mm)', cell: 'A7', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'B7', unit: 'mm' },
      { label: 'Frontal (mm)', cell: 'D7', unit: 'mm' },
      {
        label: 'Espessura do Tampo (mm)',
        cell: 'D3',
        options: [
          { label: '1,0', value: 1 },
          { label: '1,2', value: 1.2 },
          { label: '1,5', value: 1.5 },
        ],
      },
      {
        label: 'Espessura da Cuba (mm)',
        cell: 'E3',
        options: [
          { label: '1,0', value: 1 },
          { label: '1,2', value: 1.2 },
          { label: '1,5', value: 1.5 },
        ],
      },
      {
        label: 'Preço da Chapa (R$)',
        cell: 'F3',
        options: [
          { label: 'R$ 37,00', value: 37 },
        ],
      },
      {
        label: 'Fator Tampo',
        cell: 'G5',
        options: [
          { label: '3,0', value: 3 },
          { label: '3,5', value: 3.5 },
        ],
      },
      {
        label: 'Fator Cuba',
        cell: 'H5',
        options: [
          { label: '3,0', value: 3 },
          { label: '3,5', value: 3.5 },
        ],
      },
      {
        label: 'Altura (mm)',
        cell: 'G14',
        options: [
          { label: '920', value: 920 },
        ],
      },
      {
        label: 'Mão Francesa (faixa)',
        cell: 'AD11',
        options: [
          { label: 'ATÉ 300mm (R$ 80,00)', value: 80 },
          { label: '300/400mm (R$ 90,00)', value: 90 },
          { label: '450/500mm (R$ 120,00)', value: 120 },
          { label: '650/700mm (R$ 140,00)', value: 140 },
          { label: '750/800mm (R$ 150,00)', value: 150 },
          { label: '850/900mm (R$ 160,00)', value: 160 },
        ],
      },
      {
        label: 'Imposto (%)',
        cell: 'G19',
        options: [
          { label: '14%', value: 0.14 },
        ],
      },
    ],
    outputs: [
      { label: 'Sem Cuba (1 cuba)', cell: 'M7' },
      { label: 'Com Cuba (1 cuba)', cell: 'N7' },
      { label: 'Com Expurgo (1 cuba)', cell: 'O7' },
      { label: 'Sem Cuba (2 cubas)', cell: 'M9' },
      { label: 'Com Cuba (2 cubas)', cell: 'N9' },
      { label: 'Com Expurgo (2 cubas)', cell: 'O9' },
      { label: 'Sem Cuba (5 pés)', cell: 'M13' },
      { label: 'Com Cuba (5 pés)', cell: 'N13' },
      { label: 'Com Expurgo (5 pés)', cell: 'O13' },
      { label: 'Sem Cuba (6 pés)', cell: 'M19' },
      { label: 'Com Cuba (6 pés)', cell: 'N19' },
      { label: 'Com Expurgo (6 pés)', cell: 'O19' },
    ],
  },
  {
    name: 'LAVATORIO ATUAL',
    label: 'Lavatório',
    fields: [
      { label: 'Comprimento (mm)', cell: 'B17', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'A16', unit: 'mm' },
      { label: 'Altura (mm)', cell: 'G16', unit: 'mm' },
      {
        label: 'Espessura Chapa (mm)',
        cell: 'B9',
        options: [
          { label: '0,8', value: 0.8 },
          { label: '1,0', value: 1 },
          { label: '1,2', value: 1.2 },
        ],
      },
      {
        label: 'Valor Chapa (R$)',
        cell: 'C9',
        options: [
          { label: 'R$ 32,00', value: 32 },
          { label: 'R$ 35,00', value: 35 },
        ],
      },
      {
        label: 'Fator',
        cell: 'D9',
        options: [
          { label: '3,0', value: 3 },
          { label: '2,8', value: 2.8 },
        ],
      },
      {
        label: 'Espessura Chapa (Cirúrgico)',
        cell: 'B48',
        options: [
          { label: '1,2', value: 1.2 },
          { label: '1,5', value: 1.5 },
        ],
      },
      {
        label: 'Valor Chapa (Cirúrgico)',
        cell: 'C48',
        options: [
          { label: 'R$ 35,00', value: 35 },
          { label: 'R$ 37,00', value: 37 },
        ],
      },
      {
        label: 'Fator (Cirúrgico)',
        cell: 'D48',
        options: [
          { label: '2,8', value: 2.8 },
          { label: '3,0', value: 3 },
        ],
      },
    ],
    outputs: [
      { label: 'Valor', cell: 'D17' },
      { label: 'Valor Padrão 850', cell: 'D25' },
      { label: 'Valor Padrão 1000', cell: 'D33' },
    ],
  },
  {
    name: 'MicLav',
    label: 'Lavatório/Mictório',
    fields: [
      { label: 'Comprimento (mm)', cell: 'B7', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'C7', unit: 'mm' },
      { label: 'Espessura (mm)', cell: 'D7', unit: 'mm' },
      {
        label: 'Espessura Chapa (mm)',
        cell: 'E3',
        options: [
          { label: '1,0', value: 1 },
          { label: '1,2', value: 1.2 },
        ],
      },
      {
        label: 'Fator',
        cell: 'H3',
        options: [
          { label: '3,0', value: 3 },
          { label: '3,5', value: 3.5 },
        ],
      },
      {
        label: 'Valor Chapa (R$)',
        cell: 'H5',
        options: [
          { label: 'R$ 33,00', value: 33 },
          { label: 'R$ 37,00', value: 37 },
        ],
      },
    ],
    outputs: [
      { label: 'Preço/m (Lavatório Padrão)', cell: 'I7' },
      { label: 'Preço/m (Lavatório FDE)', cell: 'I9' },
      { label: 'Preço/m (Mictório Padrão)', cell: 'I11' },
      { label: 'Preço/m (Mictório FDE)', cell: 'I13' },
    ],
  },
  {
    name: ' Grelha',
    label: 'Grelha Perfurada',
    fields: [
      { label: 'Comprimento (mm)', cell: 'A3', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'B3', unit: 'mm' },
      { label: 'Espessura (mm)', cell: 'C3', unit: 'mm' },
      {
        label: 'Preço da Chapa (R$)',
        cell: 'G3',
        options: [
          { label: 'R$ 37,00', value: 37 },
          { label: 'R$ 39,00', value: 39 },
        ],
      },
      {
        label: 'Espessura Caixilho (mm)',
        cell: 'L2',
        options: [
          { label: '0,8', value: 0.8 },
          { label: '1,0', value: 1 },
        ],
      },
      {
        label: 'Preço Chapa Caixilho (R$)',
        cell: 'L3',
        options: [
          { label: 'R$ 37,00', value: 37 },
          { label: 'R$ 39,00', value: 39 },
        ],
      },
      {
        label: 'Espessura Cesto (mm)',
        cell: 'R2',
        options: [
          { label: '0,8', value: 0.8 },
          { label: '1,0', value: 1 },
        ],
      },
      {
        label: 'Preço Chapa Cesto (R$)',
        cell: 'R3',
        options: [
          { label: 'R$ 37,00', value: 37 },
          { label: 'R$ 39,00', value: 39 },
        ],
      },
    ],
    outputs: [
      { label: 'Valor com Requadro', cell: 'G5' },
      { label: 'Grelha com Caixilho', cell: 'I15' },
      { label: 'Grelha com Caixilho + Cesto', cell: 'L15' },
    ],
  },
  {
    name: 'Prat',
    label: 'Prateleira',
    fields: [
      { label: 'Comprimento (mm)', cell: 'C2', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'E2', unit: 'mm' },
      { label: 'Espessura (mm)', cell: 'G4', unit: 'mm' },
      {
        label: 'Valor Chapa (R$)',
        cell: 'H4',
        options: [
          { label: 'R$ 37,00', value: 37 },
          { label: 'R$ 45,00', value: 45 },
        ],
      },
      {
        label: 'Mão Francesa Inox 600x300 (R$)',
        cell: 'M2',
        options: [
          { label: 'R$ 89,00', value: 89 },
        ],
      },
      {
        label: 'Mão Francesa Inox 300x300 (R$)',
        cell: 'M3',
        options: [
          { label: 'R$ 56,00', value: 56 },
        ],
      },
      {
        label: 'Mão Francesa Ferro 600x300 (R$)',
        cell: 'M4',
        options: [
          { label: 'R$ 45,00', value: 45 },
        ],
      },
    ],
    outputs: [
      { label: 'Valor', cell: 'C6' },
      { label: 'Prateleira Gradeada', cell: 'C17' },
      { label: 'Mão Francesa Inox 600x300', cell: 'M2' },
      { label: 'Mão Francesa Inox 300x300', cell: 'M3' },
      { label: 'Mão Francesa Ferro 600x300', cell: 'M4' },
    ],
  },
  {
    name: 'Mesas',
    label: 'Mesas',
    fields: [
      { label: 'Comprimento (mm)', cell: 'A3', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'C3', unit: 'mm' },
      { label: 'Altura (mm)', cell: 'G2', unit: 'mm' },
      {
        label: 'Espessura (mm)',
        cell: 'D5',
        options: [
          { label: '1,0', value: 1 },
          { label: '0,8', value: 0.8 },
        ],
      },
      {
        label: 'Valor Chapa (R$)',
        cell: 'E5',
        options: [
          { label: 'R$ 37,00', value: 37 },
          { label: 'R$ 36,00', value: 36 },
          { label: 'R$ 35,00', value: 35 },
        ],
      },
      {
        label: 'Fator',
        cell: 'E7',
        options: [
          { label: '3,0', value: 3 },
          { label: '2,5', value: 2.5 },
        ],
      },
    ],
    outputs: [
      { label: 'Total 4 Pés (Base)', cell: 'B20' },
      { label: 'Total 4 Pés (Prateleira)', cell: 'E20' },
      { label: 'Total 4 Pés (Gradeada)', cell: 'H20' },
      { label: 'Total 4 Pés (Perfurada)', cell: 'K20' },
      { label: 'Total 5 Pés (Base)', cell: 'B21' },
      { label: 'Total 5 Pés (Prateleira)', cell: 'E21' },
      { label: 'Total 5 Pés (Gradeada)', cell: 'H21' },
      { label: 'Total 5 Pés (Perfurada)', cell: 'K21' },
      { label: 'Total 6 Pés (Base)', cell: 'B22' },
      { label: 'Total 6 Pés (Prateleira)', cell: 'E22' },
      { label: 'Total 6 Pés (Gradeada)', cell: 'H22' },
      { label: 'Total 6 Pés (Perfurada)', cell: 'K22' },
    ],
  },
  {
    name: 'Coifa',
    label: 'Coifa',
    fields: [
      { label: 'Comprimento (mm)', cell: 'A3', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'B3', unit: 'mm' },
      { label: 'Altura (mm)', cell: 'C3', unit: 'mm' },
      { label: 'Espessura (mm)', cell: 'E3', unit: 'mm' },
    ],
    outputs: [
      { label: 'Quatro Águas', cell: 'E7' },
      { label: 'Três Águas', cell: 'E13' },
      { label: 'Duto Ø', cell: 'D20' },
      { label: 'Curva Ø', cell: 'D23' },
    ],
  },
  {
    name: 'Chapa-Mat Ø',
    label: 'Chapa Material',
    fields: [
      { label: 'Comprimento (mm)', cell: 'A3', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'C3', unit: 'mm' },
      { label: 'Espessura (mm)', cell: 'D3', unit: 'mm' },
    ],
    outputs: [
      { label: 'Valor Chapa', cell: 'D5' },
      { label: 'Fundo', cell: 'F12' },
    ],
  },
  {
    name: 'EstCarroCantoeira',
    label: 'Estante/Carro (Cantoneira)',
    fields: [
      { label: 'Comprimento (mm)', cell: 'B3', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'C3', unit: 'mm' },
      { label: 'Altura (mm)', cell: 'D3', unit: 'mm' },
      { label: 'Espessura (mm)', cell: 'F3', unit: 'mm' },
    ],
    outputs: [
      { label: 'Lisa', cell: 'E9' },
      { label: 'Perfurada', cell: 'E12' },
      { label: 'Gradeada', cell: 'E15' },
    ],
  },
  {
    name: 'EstCarroTubo',
    label: 'Estante/Carro (Tubo)',
    fields: [
      { label: 'Comprimento (mm)', cell: 'B4', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'D4', unit: 'mm' },
      { label: 'Altura (mm)', cell: 'F4', unit: 'mm' },
      { label: 'Espessura (mm)', cell: 'H6', unit: 'mm' },
    ],
    outputs: [
      { label: 'Total Lisa com Pés', cell: 'E10' },
      { label: 'Total Gradeada com Pés', cell: 'G15' },
    ],
  },
  {
    name: 'G Corpo',
    label: 'Guarda Corpo',
    fields: [
      { label: 'Base de cálculo (mm)', cell: 'E2', unit: 'mm' },
      { label: 'Altura (mm)', cell: 'G2', unit: 'mm' },
      { label: 'Base corrimão (mm)', cell: 'N2', unit: 'mm' },
    ],
    outputs: [
      { label: 'Custo Corrimão', cell: 'S6' },
      { label: 'R$ por ML', cell: 'R8' },
      { label: 'R$ por ML (Guarda Simples)', cell: 'I11' },
    ],
  },
  {
    name: 'Gab-Arm',
    label: 'Gabinete/Armário',
    fields: [
      { label: 'Comprimento (mm)', cell: 'B3', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'D3', unit: 'mm' },
      { label: 'Altura (mm)', cell: 'F3', unit: 'mm' },
      { label: 'Espessura (mm)', cell: 'H5', unit: 'mm' },
    ],
    outputs: [
      { label: 'Total Sem Tampo', cell: 'C19' },
      { label: 'Total Com Tampo', cell: 'H19' },
    ],
  },
  {
    name: 'Cant',
    label: 'Cantoneira',
    fields: [
      { label: 'Comprimento (mm)', cell: 'B3', unit: 'mm' },
      { label: 'Perfil (mm)', cell: 'D3', unit: 'mm' },
    ],
    outputs: [
      { label: 'Valor', cell: 'B7' },
    ],
  },
  {
    name: 'Batente',
    label: 'Batente',
    fields: [
      { label: 'Altura (mm)', cell: 'B3', unit: 'mm' },
      { label: 'Largura (mm)', cell: 'D3', unit: 'mm' },
      { label: 'Espessura (mm)', cell: 'H5', unit: 'mm' },
    ],
    outputs: [
      { label: 'Batente', cell: 'G4' },
      { label: 'Porta', cell: 'B15' },
    ],
  },
];
