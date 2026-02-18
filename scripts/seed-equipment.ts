// ============================================================
// EQUIPMENT SEED SCRIPT - Executable script to seed equipment templates
// ============================================================
// Usage: npx tsx scripts/seed-equipment.ts [companyId] [--overwrite]
// 
// Arguments:
//   companyId  - Company ID for multi-tenant isolation (default: 'default')
//   --overwrite - Overwrite existing templates and presets
// 
// Examples:
//   npx tsx scripts/seed-equipment.ts
//   npx tsx scripts/seed-equipment.ts company-123
//   npx tsx scripts/seed-equipment.ts company-123 --overwrite
// ============================================================

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { 
  seedEquipmentTemplates, 
  seedEquipmentTemplatesBatch,
  clearEquipmentTemplates,
  verifySeed,
  getSeedStats 
} from '../src/domains/equipmentLibrary/equipment.templates.seed';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'missing-api-key',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'missing-project-id',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'missing-storage-bucket',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'missing-messaging-sender',
  appId: process.env.VITE_FIREBASE_APP_ID || 'missing-app-id',
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let companyId = 'default';
  let overwrite = false;
  let useBatch = true;
  let verify = false;
  let clear = false;
  let stats = false;

  for (const arg of args) {
    if (arg === '--overwrite' || arg === '-o') {
      overwrite = true;
    } else if (arg === '--sequential' || arg === '-s') {
      useBatch = false;
    } else if (arg === '--verify' || arg === '-v') {
      verify = true;
    } else if (arg === '--clear' || arg === '-c') {
      clear = true;
    } else if (arg === '--stats') {
      stats = true;
    } else if (!arg.startsWith('-')) {
      companyId = arg;
    }
  }

  return { companyId, overwrite, useBatch, verify, clear, stats };
}

// Initialize Firebase
function initializeFirebase(): { app: FirebaseApp; db: Firestore } {
  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Connect to emulators if configured
  if (process.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    console.log('🔗 Connecting to Firebase emulators...');
    connectFirestoreEmulator(db, 'localhost', 8080);
  }

  return { app, db };
}

// Main execution
async function main() {
  const { companyId, overwrite, useBatch, verify, clear, stats } = parseArgs();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  EQUIPMENT TEMPLATES SEED SCRIPT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log();

  // Show stats only
  if (stats) {
    const seedStats = getSeedStats();
    console.log('📊 Seed Statistics:');
    console.log(`   Templates: ${seedStats.templateCount}`);
    console.log(`   Presets: ${seedStats.presetCount}`);
    console.log();
    console.log('   Templates by Category:');
    for (const [category, count] of Object.entries(seedStats.templatesByCategory)) {
      console.log(`     ${category}: ${count}`);
    }
    console.log();
    console.log('   Presets by Template:');
    for (const [template, count] of Object.entries(seedStats.presetsByTemplate)) {
      console.log(`     ${template}: ${count}`);
    }
    return;
  }

  console.log(`📋 Configuration:`);
  console.log(`   Company ID: ${companyId}`);
  console.log(`   Overwrite: ${overwrite}`);
  console.log(`   Mode: ${useBatch ? 'Batch' : 'Sequential'}`);
  console.log();

  // Initialize Firebase
  console.log('🔥 Initializing Firebase...');
  const { db } = initializeFirebase();
  console.log('   ✓ Firebase initialized');
  console.log();

  // Clear if requested
  if (clear) {
    console.log('🗑️  Clearing existing templates and presets...');
    const clearResult = await clearEquipmentTemplates(db, companyId);
    if (clearResult.success) {
      console.log(`   ✓ Deleted ${clearResult.templatesDeleted} templates`);
      console.log(`   ✓ Deleted ${clearResult.presetsDeleted} presets`);
    } else {
      console.log('   ✗ Clear failed:');
      for (const error of clearResult.errors) {
        console.log(`     - ${error}`);
      }
      process.exit(1);
    }
    console.log();
  }

  // Verify only
  if (verify) {
    console.log('🔍 Verifying seed...');
    const verifyResult = await verifySeed(db, companyId);
    if (verifyResult.valid) {
      console.log('   ✓ All templates and presets are present');
    } else {
      console.log('   ✗ Verification failed:');
      if (verifyResult.missingTemplates.length > 0) {
        console.log(`     Missing templates: ${verifyResult.missingTemplates.join(', ')}`);
      }
      if (verifyResult.missingPresets.length > 0) {
        console.log(`     Missing presets: ${verifyResult.missingPresets.length} presets`);
      }
      for (const error of verifyResult.errors) {
        console.log(`     - ${error}`);
      }
      process.exit(1);
    }
    return;
  }

  // Seed templates
  console.log('🌱 Seeding equipment templates...');
  const seedFunction = useBatch ? seedEquipmentTemplatesBatch : seedEquipmentTemplates;
  const result = await seedFunction(db, companyId, { overwrite, validateBeforeSeed: true });

  console.log();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SEED RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log();
  console.log(`   Status: ${result.success ? '✓ SUCCESS' : '✗ FAILED'}`);
  console.log(`   Templates Created: ${result.templatesCreated}`);
  console.log(`   Templates Skipped: ${result.templatesSkipped}`);
  console.log(`   Presets Created: ${result.presetsCreated}`);
  console.log(`   Presets Skipped: ${result.presetsSkipped}`);

  if (result.errors.length > 0) {
    console.log();
    console.log('   Errors:');
    for (const error of result.errors) {
      console.log(`     - ${error}`);
    }
  }

  console.log();
  console.log('═══════════════════════════════════════════════════════════');

  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
}

// Run main
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
