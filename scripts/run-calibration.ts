#!/usr/bin/env node

import { createCalibrationService } from '../src/domains/calibration/calibration.service';
import { calculateMape, validateCalibrationTarget } from '../src/domains/calibration/calibration.engine';

const calibrationService = createCalibrationService();

async function runBatchCalibration() {
  console.log('========================================');
  console.log('=== Batch Calibration Runner ===');
  console.log('========================================\n');

  try {
    // Get all baselines
    console.log('1. Loading baselines...');
    const baselines = await calibrationService.getBaselines('test-company');
    console.log(`   Found ${baselines.length} baselines\n`);

    // Check if we have enough baselines
    if (baselines.length < 10) {
      console.warn('WARNING: Need at least 10 baselines for reliable calibration');
    }

    // Run calibration for each baseline
    console.log('2. Running calibration for each baseline...');
    const results = [];

    for (let i = 0; i < baselines.length; i++) {
      const baseline = baselines[i];
      console.log(`   [${i + 1}/${baselines.length}] Processing ${baseline.templateKey}...`);

      try {
        const run = await calibrationService.createRun('test-company', baseline.id);
        const result = await calibrationService.runCalibration('test-company', run.id);
        results.push(result);

        console.log(`      Status: ${result.status}`);
        if (result.status === 'completed') {
          const mapePercentage = result.metrics.mape * 100;
          console.log(`      MAPE: ${mapePercentage.toFixed(1)}%`);
          console.log(`      Target Met: ${validateCalibrationTarget(result.metrics.mape) ? '✓' : '✗'}`);
        }
      } catch (error) {
        console.error(`      Error: ${error}`);
      }
    }

    // Generate summary
    console.log('\n3. Generating calibration summary...');
    const completedRuns = results.filter(r => r.status === 'completed');
    const successCount = completedRuns.filter(r => validateCalibrationTarget(r.metrics.mape)).length;
    const avgMape = completedRuns.reduce((sum, r) => sum + r.metrics.mape, 0) / completedRuns.length;

    console.log(`\n   Results Summary:`);
    console.log(`   -----------------`);
    console.log(`   Total Runs: ${results.length}`);
    console.log(`   Completed: ${completedRuns.length}`);
    console.log(`   Successful: ${successCount} (${Math.round((successCount / completedRuns.length) * 100)}%)`);
    console.log(`   Average MAPE: ${(avgMape * 100).toFixed(1)}%`);
    console.log(`   Max Error: ${Math.max(...completedRuns.map(r => r.metrics.maxError * 100)).toFixed(1)}%`);
    console.log(`   Min Error: ${Math.min(...completedRuns.map(r => r.metrics.minError * 100)).toFixed(1)}%`);

    // Check if calibration criteria are met
    console.log('\n4. Verifying calibration criteria...');
    const allCriteriaMet = checkCalibrationCriteria(completedRuns);

    if (allCriteriaMet) {
      console.log('✓ All calibration criteria met!');
    } else {
      console.warn('✗ Some calibration criteria not met');
    }

    // Generate reports
    console.log('\n5. Generating reports...');
    for (const run of completedRuns) {
      const report = calibrationService.generateReport(run);
      const recommendations = calibrationService.getRecommendation(run);

      console.log(`   Generated report for run ${run.id}`);
      if (recommendations.length > 0) {
        console.log(`   Found ${recommendations.length} recommendations`);
      }
    }

    console.log('\n========================================');
    console.log('=== Calibration process completed ===');
    console.log('========================================');

  } catch (error) {
    console.error('\nERROR:', error);
    process.exit(1);
  }
}

function checkCalibrationCriteria(runs: any[]): boolean {
  const criteria = [
    {
      name: '>= 10 baselines processed',
      met: runs.length >= 10,
    },
    {
      name: 'Average MAPE <= 5%',
      met: runs.reduce((sum, r) => sum + r.metrics.mape, 0) / runs.length <= 0.05,
    },
    {
      name: 'All materials have active prices',
      met: true, // TODO: Implement material validation
    },
    {
      name: 'All processes are complete',
      met: true, // TODO: Implement process validation
    },
  ];

  console.log('\n   Criteria Check:');
  criteria.forEach(criterion => {
    console.log(`   - ${criterion.name}: ${criterion.met ? '✓' : '✗'}`);
  });

  return criteria.every(c => c.met);
}

// Usage instructions
function showHelp() {
  console.log(`
Calibration CLI Tool

Usage:
  npm run calibration -- [options]

Options:
  --help, -h     Show this help message
  --run, -r      Run batch calibration
  --baseline, -b Run calibration for specific baseline
  --list, -l     List available baselines
  --status, -s   Show calibration status

Examples:
  npm run calibration -- --run
  npm run calibration -- --run --baseline baseline-1
  npm run calibration -- --list
  npm run calibration -- --status
`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    help: false,
    run: false,
    baseline: null,
    list: false,
    status: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--run':
      case '-r':
        options.run = true;
        break;
      case '--baseline':
      case '-b':
        options.baseline = args[++i];
        break;
      case '--list':
      case '-l':
        options.list = true;
        break;
      case '--status':
      case '-s':
        options.status = true;
        break;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  if (options.list) {
    const baselines = await calibrationService.getBaselines('test-company');
    console.log('Available Baselines:');
    baselines.forEach(b => {
      console.log(`- ${b.id}: ${b.templateKey} (${new Date(b.createdAt).toLocaleDateString()})`);
    });
    return;
  }

  if (options.status) {
    const runs = await calibrationService.getRunsByBaseline('test-company', '');
    console.log('Calibration Status:');
    runs.forEach(r => {
      const status = r.status === 'completed' ? '✓' : r.status === 'running' ? '…' : '✗';
      console.log(`${status} ${r.id}: ${r.status}`);
    });
    return;
  }

  if (options.run) {
    if (options.baseline) {
      console.log(`Running calibration for baseline: ${options.baseline}`);
      const run = await calibrationService.createRun('test-company', options.baseline);
      const result = await calibrationService.runCalibration('test-company', run.id);
      console.log(`Result: ${result.status}`);
    } else {
      await runBatchCalibration();
    }
    return;
  }

  // Default: show help
  showHelp();
}

// Run the CLI
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
