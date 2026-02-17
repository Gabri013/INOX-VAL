import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse/sync';
import { PriceEntry } from '../types/priceBook.types';
import { listMaterials, getMaterial } from '../../materials/services/materialCatalog.service';

interface ImportResult {
  entries: PriceEntry[];
  invalidRows: any[];
  notFoundMaterials: string[];
}

export function importPriceCsv(filePath: string): ImportResult {
  const csvRaw = fs.readFileSync(filePath, 'utf-8');
  const records = csvParse.parse(csvRaw, { columns: true, skip_empty_lines: true });
  const catalog = listMaterials();
  const entries: PriceEntry[] = [];
  const invalidRows: any[] = [];
  const notFoundMaterials: string[] = [];

  for (const row of records) {
    // Mapear materialName para materialId
    const materialName = (row.materialName || '').trim();
    const material = catalog.find(m => m.swName.toLowerCase() === materialName.toLowerCase());
    if (!material) {
      notFoundMaterials.push(materialName);
      continue;
    }
    const entry: PriceEntry = {
      materialId: material.materialId,
      supplierId: (row.supplier || '').trim(),
      price: parseFloat(row.price),
      unit: (row.unit || 'kg') as any,
      currency: 'BRL',
      quotedAt: row.quotedAt || new Date().toISOString(),
      validUntil: row.validUntil || undefined,
      source: 'csv',
      confidence: 1,
    };
    if (!entry.materialId || !entry.supplierId || !entry.price || isNaN(entry.price)) {
      invalidRows.push(row);
      continue;
    }
    entries.push(entry);
  }
  return { entries, invalidRows, notFoundMaterials };
}

// CLI
if (require.main === module) {
  const csvPath = process.argv[2];
  const outPath = process.argv[3] || path.resolve(__dirname, '../../../../data/pricebook.json');
  if (!csvPath) {
    console.error('Usage: node importPriceCsv.js <pricebook.csv> [outputPath]');
    process.exit(1);
  }
  const result = importPriceCsv(csvPath);
  fs.writeFileSync(outPath, JSON.stringify(result.entries, null, 2));
  console.log(`Imported ${result.entries.length} prices. Invalid: ${result.invalidRows.length}, Not found: ${result.notFoundMaterials.length}`);
  if (result.invalidRows.length) console.log('Invalid rows:', result.invalidRows);
  if (result.notFoundMaterials.length) console.log('Materials not found:', result.notFoundMaterials);
}
