import { HyperFormula, type SimpleCellAddress, CellError } from 'hyperformula';
import formulas from '../data/formulas_precificacao_inox.json';
import { expandRange, normalizeCellAddress, toRowCol, toA1 } from './excelAddress';

export type FormulaEntry = {
  sheet: string;
  cell: string;
  formula: string;
};

export type EngineHandle = {
  engine: HyperFormula;
  listSheets: () => string[];
  listInputs: (sheetName: string) => string[];
  listFormulaCells: (sheetName: string) => string[];
  setInput: (sheetName: string, cell: string, value: string) => void;
  getValue: (sheetName: string, cell: string) => unknown;
  getCellError: (sheetName: string, cell: string) => CellError | null;
};

const referenceRegex = /\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?/g;

const formulaEntries = formulas as FormulaEntry[];

const buildReferenceList = (formula: string): string[] => {
  const matches = formula.match(referenceRegex) ?? [];
  const refs: string[] = [];
  matches.forEach((match) => {
    if (match.includes(':')) {
      refs.push(...expandRange(match));
    } else {
      refs.push(normalizeCellAddress(match));
    }
  });
  return refs;
};

const parseInputValue = (raw: string): string | number | boolean | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\s/g, '');
  const hasComma = normalized.includes(',');
  const cleaned = hasComma
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized;
  const numeric = Number(cleaned);
  if (Number.isFinite(numeric)) return numeric;
  if (cleaned.toLowerCase() === 'true') return true;
  if (cleaned.toLowerCase() === 'false') return false;
  return trimmed;
};

const sortByAddress = (a: string, b: string): number => {
  const aPos = toRowCol(a);
  const bPos = toRowCol(b);
  if (aPos.row !== bPos.row) return aPos.row - bPos.row;
  return aPos.col - bPos.col;
};

export function buildEngine(): EngineHandle {
  const formulaCellsBySheet = new Map<string, Set<string>>();
  const formulasBySheet = new Map<string, FormulaEntry[]>();
  const sizeBySheet = new Map<string, { maxRow: number; maxCol: number }>();
  const inputsBySheet = new Map<string, Set<string>>();

  const updateSize = (sheet: string, address: string) => {
    const { row, col } = toRowCol(address);
    const current = sizeBySheet.get(sheet) ?? { maxRow: 0, maxCol: 0 };
    sizeBySheet.set(sheet, {
      maxRow: Math.max(current.maxRow, row),
      maxCol: Math.max(current.maxCol, col),
    });
  };

  formulaEntries.forEach((entry) => {
    const sheet = entry.sheet;
    const cell = normalizeCellAddress(entry.cell);
    const formula = entry.formula.startsWith('=') ? entry.formula : `=${entry.formula}`;

    const list = formulasBySheet.get(sheet) ?? [];
    list.push({ sheet, cell, formula });
    formulasBySheet.set(sheet, list);

    const formulaCells = formulaCellsBySheet.get(sheet) ?? new Set<string>();
    formulaCells.add(cell);
    formulaCellsBySheet.set(sheet, formulaCells);

    updateSize(sheet, cell);

    const refs = buildReferenceList(formula);
    refs.forEach((ref) => {
      updateSize(sheet, ref);
      const inputs = inputsBySheet.get(sheet) ?? new Set<string>();
      inputs.add(ref);
      inputsBySheet.set(sheet, inputs);
    });
  });

  const sheetsData: Record<string, (string | number | boolean | null)[][]> = {};
  sizeBySheet.forEach((size, sheetName) => {
    const rows = Array.from({ length: size.maxRow + 1 }, () =>
      Array.from({ length: size.maxCol + 1 }, () => null)
    );
    sheetsData[sheetName] = rows;
  });

  formulasBySheet.forEach((entries, sheetName) => {
    const sheetRows = sheetsData[sheetName];
    entries.forEach((entry) => {
      const { row, col } = toRowCol(entry.cell);
      sheetRows[row][col] = entry.formula;
    });
  });

  const engine = HyperFormula.buildFromSheets(sheetsData, {
    licenseKey: 'gpl-v3',
  });

  const listSheets = () => engine.getSheetNames();

  const listFormulaCells = (sheetName: string) => {
    const set = formulaCellsBySheet.get(sheetName);
    if (!set) return [];
    return Array.from(set).sort(sortByAddress);
  };

  const listInputs = (sheetName: string) => {
    const formulaCells = formulaCellsBySheet.get(sheetName) ?? new Set<string>();
    const refs = inputsBySheet.get(sheetName) ?? new Set<string>();
    const output = Array.from(refs).filter((cell) => !formulaCells.has(cell));
    return output.sort(sortByAddress);
  };

  const getSheetId = (sheetName: string) => {
    const sheetId = engine.getSheetId(sheetName);
    if (sheetId === undefined) {
      throw new Error(`Planilha não encontrada: ${sheetName}`);
    }
    return sheetId;
  };

  const toAddress = (sheetName: string, cell: string): SimpleCellAddress => {
    const { row, col } = toRowCol(cell);
    return { sheet: getSheetId(sheetName), row, col };
  };

  const setInput = (sheetName: string, cell: string, value: string) => {
    const parsed = parseInputValue(value);
    engine.setCellContents(toAddress(sheetName, cell), parsed);
  };

  const getValue = (sheetName: string, cell: string) => {
    return engine.getCellValue(toAddress(sheetName, cell));
  };

  const getCellError = (sheetName: string, cell: string) => {
    const value = engine.getCellValue(toAddress(sheetName, cell));
    if (value instanceof CellError) {
      return value;
    }
    return null;
  };

  return {
    engine,
    listSheets,
    listInputs,
    listFormulaCells,
    setInput,
    getValue,
    getCellError,
  };
}

export const formatCellValue = (value: unknown): string => {
  if (value instanceof CellError) {
    return value.message ?? 'Erro';
  }
  if (value === null || typeof value === 'undefined') {
    return '—';
  }
  if (typeof value === 'number') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'Verdadeiro' : 'Falso';
  }
  return String(value);
};

export const formatRawCellValue = (value: unknown): string => {
  if (value instanceof CellError) {
    return value.message ?? 'Erro';
  }
  if (value === null || typeof value === 'undefined') {
    return '';
  }
  return String(value);
};

export const normalizeOutputCell = (cells: string[], fallback = 'A1') => {
  if (!cells.length) return fallback;
  return cells[cells.length - 1];
};

export const cellLabel = (sheet: string, cell: string) => `${sheet}!${toA1(toRowCol(cell).row, toRowCol(cell).col)}`;
