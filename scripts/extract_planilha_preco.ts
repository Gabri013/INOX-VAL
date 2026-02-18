/**
 * ============================================================
 * SCRIPT: extract_planilha_preco.ts
 * 
 * Extract pricing data from Excel spreadsheets and output as JSON.
 * 
 * Usage:
 *   npx tsx scripts/extract_planilha_preco.ts [options]
 * 
 * Options:
 *   --input, -i     Input Excel file path (default: data/planilha_preco.xlsx)
 *   --output, -o    Output JSON file path (default: data/precos_extraidos.json)
 *   --sheet, -s     Sheet name to extract (default: all sheets)
 *   --help, -h      Show this help message
 * 
 * Examples:
 *   npx tsx scripts/extract_planilha_preco.ts
 *   npx tsx scripts/extract_planilha_preco.ts -i ./precos.xlsx -o ./output.json
 *   npx tsx scripts/extract_planilha_preco.ts -s "Materiais"
 * ============================================================
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface ExtractOptions {
  inputPath: string;
  outputPath: string;
  sheetName?: string;
  verbose?: boolean;
}

interface PricingData {
  materialName: string;
  materialCode: string;
  unit: string;
  unitPrice: number;
  category?: string;
  supplier?: string;
  lastUpdated?: string;
  notes?: string;
}

interface ExtractionResult {
  success: boolean;
  timestamp: string;
  sourceFile: string;
  sheets: {
    name: string;
    rows: number;
    columns: number;
    data: PricingData[];
  }[];
  errors: string[];
}

/**
 * Parse command line arguments
 */
function parseArgs(): ExtractOptions {
  const args = process.argv.slice(2);
  const options: ExtractOptions = {
    inputPath: 'data/planilha_preco.xlsx',
    outputPath: 'data/precos_extraidos.json',
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--input':
      case '-i':
        options.inputPath = args[++i];
        break;
      case '--output':
      case '-o':
        options.outputPath = args[++i];
        break;
      case '--sheet':
      case '-s':
        options.sheetName = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
      default:
        if (!arg.startsWith('--')) {
          console.warn(`Unknown argument: ${arg}`);
        }
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
Extract Pricing Data from Excel Spreadsheets

Usage:
  npx tsx scripts/extract_planilha_preco.ts [options]

Options:
  --input, -i <path>    Input Excel file path (default: data/planilha_preco.xlsx)
  --output, -o <path>   Output JSON file path (default: data/precos_extraidos.json)
  --sheet, -s <name>     Sheet name to extract (default: all sheets)
  --verbose, -v         Show verbose output
  --help, -h            Show this help message

Examples:
  npx tsx scripts/extract_planilha_preco.ts
  npx tsx scripts/extract_planilha_preco.ts -i ./precos.xlsx -o ./output.json
  npx tsx scripts/extract_planilha_preco.ts -s "Materiais"
`);
}

/**
 * Detect and parse pricing data from a worksheet
 */
function parsePricingSheet(worksheet: XLSX.WorkSheet): PricingData[] {
  const data: PricingData[] = [];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { 
    defval: '',
    raw: false 
  });

  for (const row of jsonData) {
    // Try to extract material name from common column names
    const materialName = row['material'] || row['nome'] || row['descricao'] || 
                         row['Produto'] || row['Item'] || row['Descrição'] || '';
    
    // Skip empty rows
    if (!materialName || typeof materialName !== 'string' || materialName.trim() === '') {
      continue;
    }

    // Try to extract material code
    const materialCode = row['codigo'] || row['código'] || row['code'] || 
                        row['Código'] || row['Código do Material'] || '';

    // Try to extract unit price - handle various formats
    let unitPrice = 0;
    const priceFields = ['preco', 'preço', 'price', 'valor', 'Valor', 'custo', 'unitário'];
    for (const field of priceFields) {
      const value = row[field];
      if (value !== undefined && value !== '') {
        const parsed = typeof value === 'number' ? value : 
                      parseFloat(String(value).replace(/[R$\s.,]/g, '').replace(',', '.'));
        if (!isNaN(parsed)) {
          unitPrice = parsed;
          break;
        }
      }
    }

    // Try to extract unit
    const unit = row['unidade'] || row['un'] || row['und'] || 'un';

    // Try to extract category
    const category = row['categoria'] || row['category'] || row['tipo'] || '';

    // Try to extract supplier
    const supplier = row['fornecedor'] || row['supplier'] || row['fabricante'] || '';

    // Try to extract last updated date
    const lastUpdated = row['atualizado'] || row['data'] || row['updated'] || '';

    // Try to extract notes
    const notes = row['obs'] || row['observação'] || row['observacoes'] || '';

    if (unitPrice > 0) {
      data.push({
        materialName: String(materialName).trim(),
        materialCode: String(materialCode).trim(),
        unit: String(unit).trim(),
        unitPrice,
        category: category ? String(category).trim() : undefined,
        supplier: supplier ? String(supplier).trim() : undefined,
        lastUpdated: lastUpdated ? String(lastUpdated).trim() : undefined,
        notes: notes ? String(notes).trim() : undefined,
      });
    }
  }

  return data;
}

/**
 * Extract formulas from a worksheet
 */
function extractFormulas(worksheet: XLSX.WorkSheet): { cell: string; formula: string }[] {
  const formulas: { cell: string; formula: string }[] = [];
  
  if (!worksheet['!ref']) return formulas;

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.f) {
        formulas.push({
          cell: cellAddress,
          formula: cell.f,
        });
      }
    }
  }

  return formulas;
}

/**
 * Main extraction function
 */
function extractPricingData(options: ExtractOptions): ExtractionResult {
  const errors: string[] = [];
  const sheets: ExtractionResult['sheets'] = [];

  // Check if input file exists
  if (!fs.existsSync(options.inputPath)) {
    errors.push(`Input file not found: ${options.inputPath}`);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      sourceFile: options.inputPath,
      sheets: [],
      errors,
    };
  }

  if (options.verbose) {
    console.log(`Reading Excel file: ${options.inputPath}`);
  }

  // Read the workbook
  const workbook = XLSX.readFile(options.inputPath);

  // Determine which sheets to process
  const sheetsToProcess = options.sheetName 
    ? [options.sheetName]
    : workbook.SheetNames;

  if (options.verbose) {
    console.log(`Found sheets: ${workbook.SheetNames.join(', ')}`);
    console.log(`Processing: ${sheetsToProcess.join(', ')}`);
  }

  for (const sheetName of sheetsToProcess) {
    if (!workbook.Sheets[sheetName]) {
      errors.push(`Sheet not found: ${sheetName}`);
      continue;
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };

    const pricingData = parsePricingSheet(worksheet);
    const formulas = extractFormulas(worksheet);

    if (options.verbose) {
      console.log(`Sheet "${sheetName}": ${jsonData.length} rows, ${pricingData.length} pricing items, ${formulas.length} formulas`);
    }

    sheets.push({
      name: sheetName,
      rows: range.e.r - range.s.r + 1,
      columns: range.e.c - range.s.c + 1,
      data: pricingData,
    });
  }

  return {
    success: errors.length === 0,
    timestamp: new Date().toISOString(),
    sourceFile: options.inputPath,
    sheets,
    errors,
  };
}

/**
 * Main execution
 */
function main(): void {
  const options = parseArgs();

  // Ensure output directory exists
  const outputDir = path.dirname(options.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Run extraction
  const result = extractPricingData(options);

  // Write output
  fs.writeFileSync(options.outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`\nExtraction complete!`);
  console.log(`Output written to: ${options.outputPath}`);
  
  if (result.errors.length > 0) {
    console.log(`\nWarnings/Errors:`);
    result.errors.forEach(e => console.log(`  - ${e}`));
  }

  const totalItems = result.sheets.reduce((sum, s) => sum + s.data.length, 0);
  console.log(`\nSummary:`);
  console.log(`  Sheets processed: ${result.sheets.length}`);
  console.log(`  Total pricing items: ${totalItems}`);

  // Exit with error code if extraction failed
  if (!result.success) {
    process.exit(1);
  }
}

main();
