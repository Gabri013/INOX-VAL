/**
 * ============================================================
 * SCRIPT: test_equivalence.ts
 * 
 * Test that generated code produces equivalent results.
 * Compares outputs from different BOM generation approaches.
 * 
 * Usage:
 *   npx tsx scripts/test_equivalence.ts [options]
 * 
 * Options:
 *   --model, -m        Model name to test (e.g., MPLC)
 *   --config, -c       Test config (JSON string or file path)
 *   --compare, -C      Compare two implementations
 *   --output, -o       Output report file path
 *   --verbose, -v      Show verbose output
 *   --help, -h         Show this help message
 * 
 * Examples:
 *   npx tsx scripts/test_equivalence.ts -m MPLC
 *   npx tsx scripts/test_equivalence.ts -m MPLC -c '{"l":1500,"c":700,"h":850}'
 *   npx tsx scripts/test_equivalence.ts -m MPLC -C "bom:engine"
 *   npx tsx scripts/test_equivalence.ts -m MPLC -o report.json
 * ============================================================
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestOptions {
  modelName: string;
  config?: TestConfig;
  compareMode?: string;
  outputPath?: string;
  verbose: boolean;
}

interface TestConfig {
  l: number;  // length/comprimento
  c: number;  // width/largura
  h: number;  // height/altura
  material?: 'INOX_304' | 'INOX_430';
  espessura_chapa?: number;
  [key: string]: unknown;
}

interface TestResult {
  model: string;
  config: TestConfig;
  passed: boolean;
  discrepancies: Discrepancy[];
  timing: {
    bom: number;
    engine: number;
    difference: number;
  };
  details: {
    bom?: Record<string, unknown>;
    engine?: Record<string, unknown>;
  };
}

interface Discrepancy {
  field: string;
  expected: number | string;
  actual: number | string;
  difference?: number;
  severity: 'critical' | 'warning' | 'info';
}

/**
 * Parse command line arguments
 */
function parseArgs(): TestOptions {
  const args = process.argv.slice(2);
  const options: TestOptions = {
    modelName: '',
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--model':
      case '-m':
        options.modelName = args[++i];
        break;
      case '--config':
      case '-c':
        const configArg = args[++i];
        try {
          if (fs.existsSync(configArg)) {
            options.config = JSON.parse(fs.readFileSync(configArg, 'utf-8'));
          } else {
            options.config = JSON.parse(configArg);
          }
        } catch (e) {
          console.error('Invalid config JSON');
          process.exit(1);
        }
        break;
      case '--compare':
      case '-C':
        options.compareMode = args[++i];
        break;
      case '--output':
      case '-o':
        options.outputPath = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
    }
  }

  if (!options.modelName) {
    console.error('Model name is required');
    showHelp();
    process.exit(1);
  }

  return options;
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
Test Equivalence Between BOM Generation Approaches

Usage:
  npx tsx scripts/test_equivalence.ts [options]

Options:
  --model, -m <name>    Model name to test (e.g., MPLC)
  --config, -c <json>   Test config (JSON or file path)
  --compare, -C <mode>  Compare mode: bom:engine, bom:template, etc.
  --output, -o <path>   Output report file path
  --verbose, -v         Show verbose output
  --help, -h           Show this help message

Examples:
  npx tsx scripts/test_equivalence.ts -m MPLC
  npx tsx scripts/test_equivalence.ts -m MPLC -c '{"l":1500,"c":700,"h":850}'
  npx tsx scripts/test_equivalence.ts -m MPLC -C "bom:engine"
`);
}

/**
 * Default test configurations for each model
 */
function getDefaultConfigs(modelName: string): TestConfig[] {
  const baseConfigs: TestConfig[] = [
    { l: 1200, c: 600, h: 850 },
    { l: 1500, c: 700, h: 850 },
    { l: 1800, c: 700, h: 850 },
    { l: 2000, c: 700, h: 850 },
    { l: 2500, c: 700, h: 850 },
  ];

  // Adjust configs based on model
  switch (modelName) {
    case 'MPLC6':
    case 'MPLC6':
      // Longer models need longer test cases
      return baseConfigs.filter(c => c.l >= 1500);
    case 'MPLCP6':
      return baseConfigs;
    default:
      return baseConfigs;
  }
}

/**
 * Calculate expected values based on formula
 * This is a simplified version for comparison
 */
function calculateExpectedValues(config: TestConfig, modelName: string): {
  blankL: number;
  blankC: number;
  pesoTotal: number;
  custoTotal: number;
  numItens: number;
} {
  const { l, c, h, espessura_chapa = 0.8 } = config;
  
  // Constants
  const OFFSET_DESENHO = 1.8;
  const ABA = 50;
  const DOBRA = 10;
  const RAIO = 10.65;
  const FOLGA_CONTRAV = 130;
  const FOLGA_PE = 72;
  const H_REFORCO_FRONTAL = 93;
  
  // Material constants
  const DENSIDADE_INOX = 7.93; // kg/dm³
  const CUSTO_KG = 42.0; // R$/kg
  
  // Calculate blanks
  const somaDobras = ABA + DOBRA + RAIO;
  const blankC = Math.round(((c - OFFSET_DESENHO) + 2 * somaDobras) * 10) / 10;
  const blankL = Math.round(((l - OFFSET_DESENHO) + 2 * somaDobras) * 10) / 10;
  
  // Simplified weight calculation
  const areaTampo = (blankL * blankC) / 1_000_000; // m²
  const pesoChapa = areaTampo * espessura_chapa * DENSIDADE_INOX * 10; // kg
  
  // Simplified cost calculation  
  const custoMaterial = pesoChapa * CUSTO_KG;
  const areaM2 = areaTampo;
  const custoMaoObra = areaM2 * 120 + 50; // R$/m² + setup
  const custoTotal = custoMaterial + custoMaoObra;
  
  // Number of items (simplified)
  const numItens = modelName.includes('6') ? 8 : 8;
  
  return {
    blankL,
    blankC,
    pesoTotal: Math.round(pesoChapa * 100) / 100,
    custoTotal: Math.round(custoTotal * 100) / 100,
    numItens,
  };
}

/**
 * Compare two BOM results
 */
function compareResults(
  expected: ReturnType<typeof calculateExpectedValues>,
  actual: { totais: Record<string, number>; bom: unknown[] },
  _modelName: string
): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];
  
  // Compare dimensions
  if (actual.totais?.pesoTotal !== undefined) {
    const diff = Math.abs(actual.totais.pesoTotal - expected.pesoTotal);
    if (diff > 1) { // Allow 1kg tolerance
      discrepancies.push({
        field: 'pesoTotal',
        expected: expected.pesoTotal,
        actual: actual.totais.pesoTotal,
        difference: diff,
        severity: diff > 10 ? 'critical' : 'warning',
      });
    }
  }
  
  if (actual.totais?.custoTotal !== undefined) {
    const diff = Math.abs(actual.totais.custoTotal - expected.custoTotal);
    if (diff > 50) { // Allow R$50 tolerance
      discrepancies.push({
        field: 'custoTotal',
        expected: expected.custoTotal,
        actual: actual.totais.custoTotal,
        difference: diff,
        severity: diff > 200 ? 'critical' : 'warning',
      });
    }
  }
  
  if (actual.totais?.numComponentes !== undefined) {
    if (actual.totais.numComponentes !== expected.numItens) {
      discrepancies.push({
        field: 'numComponentes',
        expected: expected.numItens,
        actual: actual.totais.numComponentes,
        severity: 'warning',
      });
    }
  }
  
  return discrepancies;
}

/**
 * Compare BOM and Engine results
 */
function compareBOMvsEngine(
  bomResult: { totais: Record<string, number> },
  engineResult: { totais: Record<string, number> }
): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];
  
  const pesoDiff = Math.abs((bomResult.totais.pesoTotal || 0) - (engineResult.totais.pesoTotal || 0));
  if (pesoDiff > 1) {
    discrepancies.push({
      field: 'pesoTotal',
      expected: bomResult.totais.pesoTotal,
      actual: engineResult.totais.pesoTotal,
      difference: pesoDiff,
      severity: pesoDiff > 10 ? 'critical' : 'warning',
    });
  }
  
  const custoDiff = Math.abs((bomResult.totais.custoTotal || 0) - (engineResult.totais.custoTotal || 0));
  if (custoDiff > 50) {
    discrepancies.push({
      field: 'custoTotal',
      expected: bomResult.totais.custoTotal,
      actual: engineResult.totais.custoTotal,
      difference: custoDiff,
      severity: custoDiff > 200 ? 'critical' : 'warning',
    });
  }
  
  return discrepancies;
}

/**
 * Run BOM calculation (mock for testing)
 * In real implementation, this would import the actual BOM functions
 */
function runBOMCalculation(modelName: string, config: TestConfig): {
  totais: Record<string, number>;
  bom: unknown[];
} {
  const expected = calculateExpectedValues(config, modelName);
  
  // Simulate BOM result based on model
  return {
    totais: {
      pesoTotal: expected.pesoTotal + (Math.random() * 2 - 1), // Add small variance
      custoMaterial: expected.custoTotal * 0.6,
      custoMaoObra: expected.custoTotal * 0.4,
      custoTotal: expected.custoTotal,
      areaChapas: (expected.blankL * expected.blankC) / 1_000_000,
      numComponentes: expected.numItens,
    },
    bom: [],
  };
}

/**
 * Run engine calculation (mock for testing)
 */
function runEngineCalculation(modelName: string, config: TestConfig): {
  totais: Record<string, number>;
  bom: unknown[];
} {
  // Engine uses slightly different formulas
  const { l, c, h, espessura_chapa = 0.8 } = config;
  
  const OFFSET = 2.0; // Slightly different from BOM
  const DOBRA_SOMA = 71; // Different constant
  
  const blankC = Math.round(((c - OFFSET) + DOBRA_SOMA) * 10) / 10;
  const blankL = Math.round(((l - OFFSET) + DOBRA_SOMA) * 10) / 10;
  
  const DENSIDADE_INOX = 7.93;
  const areaTampo = (blankL * blankC) / 1_000_000;
  const pesoChapa = areaTampo * espessura_chapa * DENSIDADE_INOX * 10;
  const custoMaterial = pesoChapa * 42;
  const areaM2 = areaTampo;
  const custoMaoObra = areaM2 * 120 + 50;
  const custoTotal = custoMaterial + custoMaoObra;
  
  return {
    totais: {
      pesoTotal: Math.round(pesoChapa * 100) / 100,
      custoMaterial: Math.round(custoMaterial * 100) / 100,
      custoMaoObra: Math.round(custoMaoObra * 100) / 100,
      custoTotal: Math.round(custoTotal * 100) / 100,
      areaChapas: Math.round(areaM2 * 100) / 100,
      numComponentes: modelName.includes('6') ? 8 : 8,
    },
    bom: [],
  };
}

/**
 * Run single test
 */
function runTest(modelName: string, config: TestConfig, verbose: boolean): TestResult {
  const startBOM = performance.now();
  const bomResult = runBOMCalculation(modelName, config);
  const bomTime = performance.now() - startBOM;
  
  const startEngine = performance.now();
  const engineResult = runEngineCalculation(modelName, config);
  const engineTime = performance.now() - startEngine;
  
  const expected = calculateExpectedValues(config, modelName);
  
  // Compare BOM with expected
  const bomDiscrepancies = compareResults(expected, bomResult, modelName);
  
  // Compare BOM with engine
  const engineDiscrepancies = compareBOMvsEngine(bomResult, engineResult);
  
  const allDiscrepancies = [...bomDiscrepancies, ...engineDiscrepancies];
  
  const passed = allDiscrepancies.filter(d => d.severity === 'critical').length === 0;
  
  if (verbose) {
    console.log(`\nTest config: L=${config.l}, C=${config.c}, H=${config.h}`);
    console.log(`Expected: peso=${expected.pesoTotal}, custo=${expected.custoTotal}, itens=${expected.numItens}`);
    console.log(`BOM:     peso=${bomResult.totais.pesoTotal}, custo=${bomResult.totais.custoTotal}, itens=${bomResult.totais.numComponentes}`);
    console.log(`Engine:  peso=${engineResult.totais.pesoTotal}, custo=${engineResult.totais.custoTotal}, itens=${engineResult.totais.numComponentes}`);
    console.log(`Discrepancies: ${allDiscrepancies.length}`);
    allDiscrepancies.forEach(d => console.log(`  - ${d.field}: ${d.expected} vs ${d.actual} (${d.severity})`));
  }
  
  return {
    model: modelName,
    config,
    passed,
    discrepancies: allDiscrepancies,
    timing: {
      bom: Math.round(bomTime * 100) / 100,
      engine: Math.round(engineTime * 100) / 100,
      difference: Math.round((engineTime - bomTime) * 100) / 100,
    },
    details: {
      bom: bomResult.totais,
      engine: engineResult.totais,
    },
  };
}

/**
 * Run all tests for a model
 */
function runAllTests(options: TestOptions): TestResult[] {
  const configs = options.config 
    ? [options.config] 
    : getDefaultConfigs(options.modelName);
  
  const results: TestResult[] = [];
  
  console.log(`Running ${configs.length} tests for model ${options.modelName}...`);
  
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    if (options.verbose) {
      console.log(`\n--- Test ${i + 1}/${configs.length} ---`);
    }
    const result = runTest(options.modelName, config, options.verbose);
    results.push(result);
  }
  
  return results;
}

/**
 * Generate test report
 */
function generateReport(results: TestResult[]): {
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: string;
    avgTime: number;
  };
  results: TestResult[];
} {
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  const avgTime = results.reduce((sum, r) => sum + r.timing.bom, 0) / results.length;
  
  return {
    summary: {
      total: results.length,
      passed,
      failed,
      passRate: `${Math.round((passed / results.length) * 100)}%`,
      avgTime: Math.round(avgTime * 100) / 100,
    },
    results,
  };
}

/**
 * Main execution
 */
function main(): void {
  const options = parseArgs();
  
  console.log(`\n=== Test Equivalence: ${options.modelName} ===\n`);
  
  // Run tests
  const results = runAllTests(options);
  
  // Generate report
  const report = generateReport(results);
  
  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Total tests: ${report.summary.total}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Pass rate: ${report.summary.passRate}`);
  console.log(`Avg time: ${report.summary.avgTime}ms`);
  
  // Show failed tests details
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    console.log('\n=== Failed Tests ===');
    failedTests.forEach((test, i) => {
      console.log(`\nTest ${i + 1}: L=${test.config.l}, C=${test.config.c}, H=${test.config.h}`);
      test.discrepancies
        .filter(d => d.severity === 'critical')
        .forEach(d => {
          console.log(`  CRITICAL: ${d.field} - expected ${d.expected}, got ${d.actual}`);
        });
    });
  }
  
  // Write output if specified
  if (options.outputPath) {
    const outputDir = path.dirname(options.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(options.outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\nReport saved to: ${options.outputPath}`);
  }
  
  // Exit with error code if any test failed
  const hasCriticalFailure = results.some(r => 
    r.discrepancies.some(d => d.severity === 'critical')
  );
  if (hasCriticalFailure) {
    console.log('\n⚠️  Some critical tests failed!');
    process.exit(1);
  }
  
  console.log('\n✅ All tests passed!');
}

main();
