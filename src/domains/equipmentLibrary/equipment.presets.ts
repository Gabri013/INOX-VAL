// ============================================================
// EQUIPMENT PRESETS - 40 predefined presets for all templates
// ============================================================

import { EquipmentPreset } from './equipment.dsl.schema';

// ============================================================
// ALL PRESETS (40 total)
// ============================================================

/**
 * All equipment presets organized by template
 */
export const ALL_PRESETS: EquipmentPreset[] = [
  // ============================================================
  // MESAS (5 templates × 3 presets = 15 presets)
  // ============================================================

  // MESA_LISA - 5 presets
  {
    id: 'MESA_LISA_700x600',
    templateKey: 'MESA_LISA',
    label: 'Mesa 700×600',
    description: 'Mesa pequena para espaços compactos',
    values: { width: 700, depth: 600, height: 850, thickness: 1.2, finish: 'POLIDO', hasCasters: false },
    isDefault: false,
  },
  {
    id: 'MESA_LISA_1000x600',
    templateKey: 'MESA_LISA',
    label: 'Mesa 1000×600',
    description: 'Mesa padrão para uso geral',
    values: { width: 1000, depth: 600, height: 850, thickness: 1.2, finish: 'POLIDO', hasCasters: false },
    isDefault: true,
  },
  {
    id: 'MESA_LISA_1200x700',
    templateKey: 'MESA_LISA',
    label: 'Mesa 1200×700',
    description: 'Mesa média para trabalho',
    values: { width: 1200, depth: 700, height: 850, thickness: 1.2, finish: 'POLIDO', hasCasters: false },
    isDefault: false,
  },
  {
    id: 'MESA_LISA_1500x700',
    templateKey: 'MESA_LISA',
    label: 'Mesa 1500×700',
    description: 'Mesa grande para reuniões',
    values: { width: 1500, depth: 700, height: 850, thickness: 1.2, finish: 'POLIDO', hasCasters: false },
    isDefault: false,
  },
  {
    id: 'MESA_LISA_2000x700',
    templateKey: 'MESA_LISA',
    label: 'Mesa 2000×700',
    description: 'Mesa extra grande',
    values: { width: 2000, depth: 700, height: 850, thickness: 1.5, finish: 'POLIDO', hasCasters: false },
    isDefault: false,
  },

  // MESA_COM_PRATELEIRA - 3 presets
  {
    id: 'MESA_PRAT_1000x600',
    templateKey: 'MESA_COM_PRATELEIRA',
    label: 'Mesa c/Prat 1000×600',
    description: 'Mesa com prateleira padrão',
    values: { width: 1000, depth: 600, height: 850, thickness: 1.2, finish: 'POLIDO', hasShelf: true, hasCasters: false },
    isDefault: true,
  },
  {
    id: 'MESA_PRAT_1500x700',
    templateKey: 'MESA_COM_PRATELEIRA',
    label: 'Mesa c/Prat 1500×700',
    description: 'Mesa com prateleira grande',
    values: { width: 1500, depth: 700, height: 850, thickness: 1.2, finish: 'POLIDO', hasShelf: true, hasCasters: false },
    isDefault: false,
  },
  {
    id: 'MESA_PRAT_2000x700',
    templateKey: 'MESA_COM_PRATELEIRA',
    label: 'Mesa c/Prat 2000×700',
    description: 'Mesa com prateleira extra grande',
    values: { width: 2000, depth: 700, height: 850, thickness: 1.5, finish: 'POLIDO', hasShelf: true, hasCasters: false },
    isDefault: false,
  },

  // MESA_CONTRAVENTADA_U - 2 presets
  {
    id: 'MESA_CVU_1500x800',
    templateKey: 'MESA_CONTRAVENTADA_U',
    label: 'Mesa CVU 1500×800',
    description: 'Mesa contraventada para carga pesada',
    values: { width: 1500, depth: 800, height: 850, thickness: 1.5, finish: 'POLIDO' },
    isDefault: true,
  },
  {
    id: 'MESA_CVU_2000x800',
    templateKey: 'MESA_CONTRAVENTADA_U',
    label: 'Mesa CVU 2000×800',
    description: 'Mesa contraventada grande',
    values: { width: 2000, depth: 800, height: 850, thickness: 1.5, finish: 'POLIDO' },
    isDefault: false,
  },

  // MESA_PAREDE_COM_ESPELHO - 2 presets
  {
    id: 'MESA_PAREDE_1200x500',
    templateKey: 'MESA_PAREDE_COM_ESPELHO',
    label: 'Mesa Parede 1200×500',
    description: 'Mesa de parede com espelho',
    values: { width: 1200, depth: 500, height: 850, thickness: 1.2, finish: 'POLIDO', hasBacksplash: true, backsplashHeight: 300 },
    isDefault: true,
  },
  {
    id: 'MESA_PAREDE_1800x600',
    templateKey: 'MESA_PAREDE_COM_ESPELHO',
    label: 'Mesa Parede 1800×600',
    description: 'Mesa de parede grande com espelho',
    values: { width: 1800, depth: 600, height: 850, thickness: 1.2, finish: 'POLIDO', hasBacksplash: true, backsplashHeight: 400 },
    isDefault: false,
  },

  // MESA_COM_RODIZIOS - 3 presets
  {
    id: 'MESA_ROD_800x600',
    templateKey: 'MESA_COM_RODIZIOS',
    label: 'Mesa Rod. 800×600',
    description: 'Mesa móvel pequena',
    values: { width: 800, depth: 600, height: 850, thickness: 1.2, finish: 'POLIDO', hasCasters: true },
    isDefault: false,
  },
  {
    id: 'MESA_ROD_1200x700',
    templateKey: 'MESA_COM_RODIZIOS',
    label: 'Mesa Rod. 1200×700',
    description: 'Mesa móvel padrão',
    values: { width: 1200, depth: 700, height: 850, thickness: 1.2, finish: 'POLIDO', hasCasters: true },
    isDefault: true,
  },
  {
    id: 'MESA_ROD_1500x700',
    templateKey: 'MESA_COM_RODIZIOS',
    label: 'Mesa Rod. 1500×700',
    description: 'Mesa móvel grande',
    values: { width: 1500, depth: 700, height: 850, thickness: 1.2, finish: 'POLIDO', hasCasters: true },
    isDefault: false,
  },

  // ============================================================
  // BANCADAS (5 templates × 2 presets = 10 presets)
  // ============================================================

  // BANCADA_CENTRAL - 2 presets
  {
    id: 'BANCADA_CENTRAL_1500x700',
    templateKey: 'BANCADA_CENTRAL',
    label: 'Bancada Central 1500×700',
    description: 'Bancada central ilha padrão',
    values: { width: 1500, depth: 700, height: 850, thickness: 1.5, finish: 'POLIDO' },
    isDefault: true,
  },
  {
    id: 'BANCADA_CENTRAL_2000x800',
    templateKey: 'BANCADA_CENTRAL',
    label: 'Bancada Central 2000×800',
    description: 'Bancada central ilha grande',
    values: { width: 2000, depth: 800, height: 850, thickness: 1.5, finish: 'POLIDO' },
    isDefault: false,
  },

  // BANCADA_PAREDE_COM_ESPELHO - 2 presets
  {
    id: 'BANCADA_PAREDE_1800x600',
    templateKey: 'BANCADA_PAREDE_COM_ESPELHO',
    label: 'Bancada Parede 1800×600',
    description: 'Bancada de parede com espelho',
    values: { width: 1800, depth: 600, height: 850, thickness: 1.5, finish: 'POLIDO', hasBacksplash: true, backsplashHeight: 400 },
    isDefault: true,
  },
  {
    id: 'BANCADA_PAREDE_2400x650',
    templateKey: 'BANCADA_PAREDE_COM_ESPELHO',
    label: 'Bancada Parede 2400×650',
    description: 'Bancada de parede grande com espelho',
    values: { width: 2400, depth: 650, height: 850, thickness: 1.5, finish: 'POLIDO', hasBacksplash: true, backsplashHeight: 500 },
    isDefault: false,
  },

  // BANCADA_ESTREITA - 2 presets
  {
    id: 'BANCADA_ESTREITA_1200x500',
    templateKey: 'BANCADA_ESTREITA',
    label: 'Bancada Estreita 1200×500',
    description: 'Bancada estreita para corredores',
    values: { width: 1200, depth: 500, height: 850, thickness: 1.2, finish: 'POLIDO' },
    isDefault: true,
  },
  {
    id: 'BANCADA_ESTREITA_1800x500',
    templateKey: 'BANCADA_ESTREITA',
    label: 'Bancada Estreita 1800×500',
    description: 'Bancada estreita longa',
    values: { width: 1800, depth: 500, height: 850, thickness: 1.2, finish: 'POLIDO' },
    isDefault: false,
  },

  // BANCADA_COM_CUBA_1 - 2 presets
  {
    id: 'BANCADA_CUBA1_1200x600',
    templateKey: 'BANCADA_COM_CUBA_1',
    label: 'Bancada 1 Cuba 1200×600',
    description: 'Bancada com uma cuba',
    values: { width: 1200, depth: 600, height: 850, thickness: 1.5, finish: 'POLIDO', hasBacksplash: true, backsplashHeight: 400, cubaWidth: 500, cubaDepth: 400 },
    isDefault: true,
  },
  {
    id: 'BANCADA_CUBA1_1500x650',
    templateKey: 'BANCADA_COM_CUBA_1',
    label: 'Bancada 1 Cuba 1500×650',
    description: 'Bancada com uma cuba grande',
    values: { width: 1500, depth: 650, height: 850, thickness: 1.5, finish: 'POLIDO', hasBacksplash: true, backsplashHeight: 400, cubaWidth: 600, cubaDepth: 450 },
    isDefault: false,
  },

  // BANCADA_COM_CUBAS_2 - 2 presets
  {
    id: 'BANCADA_CUBA2_1800x600',
    templateKey: 'BANCADA_COM_CUBAS_2',
    label: 'Bancada 2 Cubas 1800×600',
    description: 'Bancada com duas cubas',
    values: { width: 1800, depth: 600, height: 850, thickness: 1.5, finish: 'POLIDO', hasBacksplash: true, backsplashHeight: 400, cubaWidth: 500, cubaDepth: 400 },
    isDefault: true,
  },
  {
    id: 'BANCADA_CUBA2_2400x700',
    templateKey: 'BANCADA_COM_CUBAS_2',
    label: 'Bancada 2 Cubas 2400×700',
    description: 'Bancada com duas cubas grande',
    values: { width: 2400, depth: 700, height: 850, thickness: 1.5, finish: 'POLIDO', hasBacksplash: true, backsplashHeight: 500, cubaWidth: 600, cubaDepth: 450 },
    isDefault: false,
  },

  // ============================================================
  // ARMÁRIOS (3 templates × 2 presets = 6 presets)
  // ============================================================

  // ARMARIO_ABERTO - 2 presets
  {
    id: 'ARMARIO_ABERTO_800x400',
    templateKey: 'ARMARIO_ABERTO',
    label: 'Armário Aberto 800×400',
    description: 'Armário sem portas padrão',
    values: { width: 800, depth: 400, height: 1200, thickness: 1.0, finish: 'POLIDO', shelfCount: 3 },
    isDefault: true,
  },
  {
    id: 'ARMARIO_ABERTO_1200x500',
    templateKey: 'ARMARIO_ABERTO',
    label: 'Armário Aberto 1200×500',
    description: 'Armário sem portas grande',
    values: { width: 1200, depth: 500, height: 1800, thickness: 1.2, finish: 'POLIDO', shelfCount: 4 },
    isDefault: false,
  },

  // ARMARIO_2_PORTAS - 2 presets
  {
    id: 'ARMARIO_2P_800x400',
    templateKey: 'ARMARIO_2_PORTAS',
    label: 'Armário 2P 800×400',
    description: 'Armário com 2 portas padrão',
    values: { width: 800, depth: 400, height: 1200, thickness: 1.0, finish: 'POLIDO', shelfCount: 2, hasHanging: false },
    isDefault: true,
  },
  {
    id: 'ARMARIO_2P_1000x500',
    templateKey: 'ARMARIO_2_PORTAS',
    label: 'Armário 2P 1000×500',
    description: 'Armário com 2 portas grande',
    values: { width: 1000, depth: 500, height: 1800, thickness: 1.2, finish: 'POLIDO', shelfCount: 3, hasHanging: true },
    isDefault: false,
  },

  // GABINETE_PIA_2_PORTAS - 2 presets
  {
    id: 'GABINETE_PIA_800x500',
    templateKey: 'GABINETE_PIA_2_PORTAS',
    label: 'Gabinete Pia 800×500',
    description: 'Gabinete para pia padrão',
    values: { width: 800, depth: 500, height: 850, thickness: 1.2, finish: 'POLIDO', hasShelf: true },
    isDefault: true,
  },
  {
    id: 'GABINETE_PIA_1000x550',
    templateKey: 'GABINETE_PIA_2_PORTAS',
    label: 'Gabinete Pia 1000×550',
    description: 'Gabinete para pia grande',
    values: { width: 1000, depth: 550, height: 850, thickness: 1.2, finish: 'POLIDO', hasShelf: true },
    isDefault: false,
  },

  // ============================================================
  // ESTANTES (2 templates × 2 presets = 4 presets)
  // ============================================================

  // ESTANTE_4_NIVEIS - 2 presets
  {
    id: 'ESTANTE_4N_1000x400',
    templateKey: 'ESTANTE_4_NIVEIS',
    label: 'Estante 4N 1000×400',
    description: 'Estante fixa com 4 níveis padrão',
    values: { width: 1000, depth: 400, height: 1800, thickness: 1.0, finish: 'POLIDO' },
    isDefault: true,
  },
  {
    id: 'ESTANTE_4N_1500x500',
    templateKey: 'ESTANTE_4_NIVEIS',
    label: 'Estante 4N 1500×500',
    description: 'Estante fixa com 4 níveis grande',
    values: { width: 1500, depth: 500, height: 1800, thickness: 1.2, finish: 'POLIDO' },
    isDefault: false,
  },

  // ESTANTE_N_NIVEIS - 2 presets
  {
    id: 'ESTANTE_NN_1200x400',
    templateKey: 'ESTANTE_N_NIVEIS',
    label: 'Estante NN 1200×400',
    description: 'Estante configurável padrão',
    values: { width: 1200, depth: 400, height: 2000, thickness: 1.0, finish: 'POLIDO', shelfCount: 5 },
    isDefault: true,
  },
  {
    id: 'ESTANTE_NN_1800x500',
    templateKey: 'ESTANTE_N_NIVEIS',
    label: 'Estante NN 1800×500',
    description: 'Estante configurável grande',
    values: { width: 1800, depth: 500, height: 2400, thickness: 1.2, finish: 'POLIDO', shelfCount: 6 },
    isDefault: false,
  },

  // ============================================================
  // CARRINHOS (1 template × 5 presets = 5 presets)
  // ============================================================

  // CARRINHO_N_BANDEJAS - 5 presets
  {
    id: 'CARRINHO_2B_600x400',
    templateKey: 'CARRINHO_N_BANDEJAS',
    label: 'Carrinho 2 Bandejas',
    description: 'Carrinho com 2 bandejas',
    values: { width: 600, depth: 400, height: 900, thickness: 1.0, finish: 'POLIDO', trayCount: 2, hasCasters: true },
    isDefault: false,
  },
  {
    id: 'CARRINHO_3B_600x400',
    templateKey: 'CARRINHO_N_BANDEJAS',
    label: 'Carrinho 3 Bandejas',
    description: 'Carrinho com 3 bandejas padrão',
    values: { width: 600, depth: 400, height: 1100, thickness: 1.0, finish: 'POLIDO', trayCount: 3, hasCasters: true },
    isDefault: true,
  },
  {
    id: 'CARRINHO_4B_700x450',
    templateKey: 'CARRINHO_N_BANDEJAS',
    label: 'Carrinho 4 Bandejas',
    description: 'Carrinho com 4 bandejas',
    values: { width: 700, depth: 450, height: 1300, thickness: 1.0, finish: 'POLIDO', trayCount: 4, hasCasters: true },
    isDefault: false,
  },
  {
    id: 'CARRINHO_5B_700x450',
    templateKey: 'CARRINHO_N_BANDEJAS',
    label: 'Carrinho 5 Bandejas',
    description: 'Carrinho com 5 bandejas',
    values: { width: 700, depth: 450, height: 1500, thickness: 1.0, finish: 'POLIDO', trayCount: 5, hasCasters: true },
    isDefault: false,
  },
  {
    id: 'CARRINHO_6B_800x500',
    templateKey: 'CARRINHO_N_BANDEJAS',
    label: 'Carrinho 6 Bandejas',
    description: 'Carrinho com 6 bandejas grande',
    values: { width: 800, depth: 500, height: 1700, thickness: 1.2, finish: 'POLIDO', trayCount: 6, hasCasters: true },
    isDefault: false,
  },
];

/**
 * Get presets for a specific template
 */
export function getPresetsForTemplate(templateKey: string): EquipmentPreset[] {
  return ALL_PRESETS.filter(p => p.templateKey === templateKey);
}

/**
 * Get default preset for a template
 */
export function getDefaultPreset(templateKey: string): EquipmentPreset | undefined {
  return ALL_PRESETS.find(p => p.templateKey === templateKey && p.isDefault);
}

/**
 * Get preset by ID
 */
export function getPresetById(id: string): EquipmentPreset | undefined {
  return ALL_PRESETS.find(p => p.id === id);
}

/**
 * Get all presets organized by template
 */
export function getPresetsByTemplate(): Record<string, EquipmentPreset[]> {
  const result: Record<string, EquipmentPreset[]> = {};
  
  for (const preset of ALL_PRESETS) {
    if (!result[preset.templateKey]) {
      result[preset.templateKey] = [];
    }
    result[preset.templateKey].push(preset);
  }
  
  return result;
}

/**
 * Get total preset count
 */
export function getPresetCount(): number {
  return ALL_PRESETS.length;
}

/**
 * Get preset count by template
 */
export function getPresetCountByTemplate(templateKey: string): number {
  return getPresetsForTemplate(templateKey).length;
}