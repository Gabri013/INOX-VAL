// ============================================================
// Vitest Configuration for INOX-VAL
// ============================================================

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '**/node_modules/**',
      'src/domains/clientes/tests/**',
      'src/domains/producao/tests/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domains': path.resolve(__dirname, './src/domains'),
      '@infra': path.resolve(__dirname, './src/infra'),
    },
  },
});
