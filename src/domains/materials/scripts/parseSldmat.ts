import fs from 'fs';
import path from 'path';
import { MaterialCatalogItem } from '../types';

// Utilitário para extrair informações do nome/classificação
function extractKind(classification: string, swName: string): MaterialCatalogItem['kind'] {
  const c = classification.toUpperCase();
  if (c.includes('TUBO')) return 'tubo';
  if (c.includes('INOX')) return 'chapa';
  if (c.includes('BARRA')) return 'barra';
  if (c.includes('PERFIL')) return 'perfil';
  return 'diversos';
}

function extractGrade(swName: string): string | undefined {
  const match = swName.match(/(304|316|310|430|444)/);
  return match ? match[1] : undefined;
}

function extractThickness(swName: string): number | undefined {
  const match = swName.match(/(\d{1,2}(?:[.,]\d{1,2})?)\s*mm/i);
  return match ? parseFloat(match[1].replace(',', '.')) : undefined;
}

function extractDiameter(swName: string): number | undefined {
  const match = swName.match(/(\d{1,3}(?:[.,]\d{1,2})?)\s*mm.*diam/i);
  return match ? parseFloat(match[1].replace(',', '.')) : undefined;
}

// Parser principal do .sldmat
export function parseSldmatFile(sldmatPath: string): MaterialCatalogItem[] {
  const raw = fs.readFileSync(sldmatPath, 'utf-8');
  // Exemplo de parsing simplificado (ajustar conforme estrutura real do .sldmat)
  const lines = raw.split(/\r?\n/);
  const items: MaterialCatalogItem[] = [];
  let current: Partial<MaterialCatalogItem> = {};
  for (const line of lines) {
    if (line.startsWith('[') && line.endsWith(']')) {
      if (current.materialId && current.swName) {
        items.push({
          ...current,
          kind: extractKind(current.classification || '', current.swName || ''),
          grade: extractGrade(current.swName || ''),
          thicknessMm: extractThickness(current.swName || ''),
          diameterMm: extractDiameter(current.swName || ''),
          classifications: (current.classification || '').split(';').map(s => s.trim()).filter(Boolean),
          source: 'sldmat',
        } as MaterialCatalogItem);
      }
      current = { materialId: line.slice(1, -1) };
    } else if (line.includes('=')) {
      const [key, value] = line.split('=');
      const v = value.trim();
      if (key.includes('name')) current.swName = v;
      else if (key.includes('description')) current.description = v;
      else if (key.includes('classification')) current.classification = v;
      else if (key.includes('density')) current.densityKgM3 = parseFloat(v);
    }
  }
  // Último item
  if (current.materialId && current.swName) {
    items.push({
      ...current,
      kind: extractKind(current.classification || '', current.swName || ''),
      grade: extractGrade(current.swName || ''),
      thicknessMm: extractThickness(current.swName || ''),
      diameterMm: extractDiameter(current.swName || ''),
      classifications: (current.classification || '').split(';').map(s => s.trim()).filter(Boolean),
      source: 'sldmat',
    } as MaterialCatalogItem);
  }
  return items;
}

// Função para salvar JSON e CSV
type OutputFormat = 'json' | 'csv';
export function saveMaterialCatalog(items: MaterialCatalogItem[], outDir: string, formats: OutputFormat[] = ['json', 'csv']) {
  if (formats.includes('json')) {
    fs.writeFileSync(path.join(outDir, 'material_catalog.json'), JSON.stringify(items, null, 2));
  }
  if (formats.includes('csv')) {
    const header = [
      'materialId','swName','description','classification','classifications','kind','grade','thicknessMm','diameterMm','densityKgM3','source'
    ];
    const rows = items.map(i => [
      i.materialId,
      i.swName,
      i.description || '',
      i.classification,
      i.classifications.join('|'),
      i.kind,
      i.grade || '',
      i.thicknessMm?.toString() || '',
      i.diameterMm?.toString() || '',
      i.densityKgM3?.toString() || '',
      i.source
    ]);
    const csv = [header.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    fs.writeFileSync(path.join(outDir, 'material_catalog.csv'), csv);
  }
}

// CLI
if (require.main === module) {
  const sldmatPath = process.argv[2];
  const outDir = process.argv[3] || path.resolve(__dirname, '../../../../data');
  if (!sldmatPath) {
    console.error('Usage: node parseSldmat.js <LISTA DE MATERIAL.sldmat> [outputDir]');
    process.exit(1);
  }
  const items = parseSldmatFile(sldmatPath);
  saveMaterialCatalog(items, outDir);
  console.log(`Parsed ${items.length} materials. Output in ${outDir}`);
}
