import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { compute } from '../src/domains/precificacao/engine/engine.ts';

type CellEntry = { value: any; formula?: string };
type SheetData = Record<string, CellEntry>;
type ModelFile = { sheets: { name: string; cells: SheetData }[] };

type SheetReport = {
  name: string;
  comparedCells: number;
  divergences: string[];
  notes: string[];
};

const require = createRequire(import.meta.url);

function loadWorkbook(xlsxPath: string) {
  const XLSX = require('xlsx');
  return XLSX.readFile(xlsxPath, { cellFormula: true, cellNF: false, cellText: false });
}

function loadModel(modelPath: string) {
  return JSON.parse(fs.readFileSync(modelPath, 'utf8')) as ModelFile;
}

function flattenSheet(sheet: any): Record<string, any> {
  const out: Record<string, any> = {};
  Object.keys(sheet).forEach((cell) => {
    if (cell.startsWith('!')) return;
    out[cell] = sheet[cell].v ?? null;
  });
  return out;
}

function compareCells(model: SheetData, actual: Record<string, any>, computed: Record<string, any>) {
  const divergences: string[] = [];
  let compared = 0;

  Object.keys(model).forEach((cell) => {
    const expected = actual[cell] ?? null;
    const got = computed[cell] ?? null;
    compared += 1;

    if (expected === null && got === null) return;
    if (typeof expected === 'number' || typeof got === 'number') {
      const e = Number(expected ?? 0);
      const g = Number(got ?? 0);
      const delta = Math.abs(e - g);
      if (delta > 0.0001) {
        divergences.push(`${cell}: esperado ${expected} obtido ${got}`);
      }
      return;
    }
    if (expected !== got) {
      divergences.push(`${cell}: esperado ${expected} obtido ${got}`);
    }
  });

  return { divergences, compared };
}

function writePendencias(pendenciasPath: string, entries: string[]) {
  if (!entries.length) return;
  const header = '# Pendências – Módulo de Precificação';
  let existing = '';
  if (fs.existsSync(pendenciasPath)) {
    existing = fs.readFileSync(pendenciasPath, 'utf8');
  }

  const existingLines = new Set(
    existing
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  );

  const newLines = entries
    .map((entry) => `- ${entry}`)
    .filter((line) => !existingLines.has(line));

  if (!existing.trim()) {
    fs.writeFileSync(pendenciasPath, `${header}\n\n${newLines.join('\n')}\n`);
    return;
  }

  if (newLines.length) {
    fs.appendFileSync(pendenciasPath, `\n${newLines.join('\n')}\n`);
  }
}

function writeReport(
  reportPath: string,
  xlsxPath: string,
  modelPath: string,
  sheets: SheetReport[],
  pendencias: string[]
) {
  const totalCompared = sheets.reduce((acc, sheet) => acc + sheet.comparedCells, 0);
  const totalDivergences = sheets.reduce((acc, sheet) => acc + sheet.divergences.length, 0);
  const lines: string[] = [];

  lines.push('# Relatório de Equivalência da Precificação');
  lines.push('');
  lines.push(`- Gerado em: ${new Date().toISOString()}`);
  lines.push(`- Planilha (XLSX): ${xlsxPath}`);
  lines.push(`- Modelo: ${modelPath}`);
  lines.push(`- Engine: src/domains/precificacao/engine`);
  lines.push('');
  lines.push('## Resumo');
  lines.push(`- Planilhas avaliadas: ${sheets.length}`);
  lines.push(`- Células comparadas: ${totalCompared}`);
  lines.push(`- Divergências: ${totalDivergences}`);
  lines.push(`- Pendências registradas: ${pendencias.length}`);
  lines.push('');

  lines.push('## Detalhes por planilha');
  if (!sheets.length) {
    lines.push('- Nenhuma planilha avaliada.');
  }
  sheets.forEach((sheet) => {
    lines.push('');
    lines.push(`### ${sheet.name}`);
    lines.push(`- Células comparadas: ${sheet.comparedCells}`);
    lines.push(`- Divergências: ${sheet.divergences.length}`);
    if (sheet.notes.length) {
      lines.push('- Observações:');
      sheet.notes.forEach((note) => lines.push(`  - ${note}`));
    }
  });

  lines.push('');
  lines.push('## Divergências');
  if (!totalDivergences) {
    lines.push('- Nenhuma divergência encontrada.');
  } else {
    sheets.forEach((sheet) => {
      if (!sheet.divergences.length) return;
      lines.push('');
      lines.push(`### ${sheet.name}`);
      sheet.divergences.forEach((line) => lines.push(`- ${line}`));
    });
  }

  lines.push('');
  lines.push('## Pendências');
  if (!pendencias.length) {
    lines.push('- Nenhuma pendência registrada.');
  } else {
    pendencias.forEach((entry) => lines.push(`- ${entry}`));
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'));
}

function main() {
  const xlsxPath = process.argv[2] || 'data/planilha_preco.xlsx';
  const modelPath = process.argv[3] || 'src/domains/precificacao/embedded/planilha.model.json';
  const reportPath = process.argv[4] || 'docs/PRECIFICACAO_EQUIVALENCIA.md';
  const pendenciasPath = 'docs/PENDENCIAS_PRECIFICACAO.md';

  const pendencias: string[] = [];
  const sheetsReport: SheetReport[] = [];

  if (!fs.existsSync(modelPath)) {
    pendencias.push(`Modelo não encontrado em ${modelPath}. Execute \"npm run sheet:extract\" e \"npm run sheet:generate\".`);
  }
  if (!fs.existsSync(xlsxPath)) {
    pendencias.push(
      `Planilha XLSX não encontrada em ${xlsxPath}. Converta a planilha base usando scripts/convert_xls_to_xlsx.ps1.`
    );
  }

  if (fs.existsSync(modelPath) && fs.existsSync(xlsxPath)) {
    const workbook = loadWorkbook(xlsxPath);
    const model = loadModel(modelPath);

    model.sheets.forEach((sheetModel) => {
      const notes: string[] = [];
      const sheet = workbook.Sheets[sheetModel.name];
      const modelCellCount = Object.keys(sheetModel.cells || {}).length;
      if (!sheet) {
        notes.push('Planilha ausente no XLSX.');
        pendencias.push(`Planilha ausente no XLSX: ${sheetModel.name}.`);
        sheetsReport.push({ name: sheetModel.name, comparedCells: 0, divergences: [], notes });
        return;
      }

      if (!modelCellCount) {
        notes.push('Planilha vazia no modelo; validação ignorada.');
        sheetsReport.push({ name: sheetModel.name, comparedCells: 0, divergences: [], notes });
        return;
      }

      const actual = flattenSheet(sheet);
      const computed = compute(sheetModel.name, {});

      if (!Object.keys(computed.cells || {}).length) {
        notes.push('Engine não contém esta planilha (workbook vazio).');
        pendencias.push(`Engine sem planilha ${sheetModel.name}. Regere o engine com \"npm run sheet:generate\".`);
      }

      const { divergences, compared } = compareCells(sheetModel.cells, actual, computed.cells || {});
      sheetsReport.push({ name: sheetModel.name, comparedCells: compared, divergences, notes });
    });
  }

  writePendencias(pendenciasPath, pendencias);
  writeReport(reportPath, xlsxPath, modelPath, sheetsReport, pendencias);

  const totalDivergences = sheetsReport.reduce((acc, sheet) => acc + sheet.divergences.length, 0);
  if (pendencias.length || totalDivergences) {
    console.error('Equivalência incompleta. Verifique docs/PRECIFICACAO_EQUIVALENCIA.md e pendências.');
    process.exit(1);
  }

  console.log('Equivalência OK.');
}

main();
