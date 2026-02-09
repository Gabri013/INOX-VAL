export interface CellCoordinates {
  row: number;
  col: number;
}

const CELL_REGEX = /^\$?([A-Za-z]+)\$?(\d+)$/;
const RANGE_REGEX = /^(\$?[A-Za-z]+\$?\d+):(\$?[A-Za-z]+\$?\d+)$/;

export function normalizeCellAddress(address: string): string {
  return address.replace(/\$/g, '').toUpperCase();
}

export function columnLabelToIndex(label: string): number {
  const normalized = label.toUpperCase();
  let index = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i) - 64;
    if (code < 1 || code > 26) {
      throw new Error(`Invalid column label: ${label}`);
    }
    index = index * 26 + code;
  }
  return index - 1;
}

export function columnIndexToLabel(index: number): string {
  if (index < 0) throw new Error(`Invalid column index: ${index}`);
  let result = '';
  let current = index + 1;
  while (current > 0) {
    const mod = (current - 1) % 26;
    result = String.fromCharCode(65 + mod) + result;
    current = Math.floor((current - 1) / 26);
  }
  return result;
}

export function toRowCol(address: string): CellCoordinates {
  const normalized = normalizeCellAddress(address);
  const match = CELL_REGEX.exec(normalized);
  if (!match) {
    throw new Error(`Invalid cell address: ${address}`);
  }
  const [, colLabel, rowLabel] = match;
  const row = Number(rowLabel) - 1;
  const col = columnLabelToIndex(colLabel);
  return { row, col };
}

export function toA1(row: number, col: number): string {
  if (row < 0 || col < 0) {
    throw new Error(`Invalid coordinates: row=${row} col=${col}`);
  }
  return `${columnIndexToLabel(col)}${row + 1}`;
}

export function parseRange(range: string): { start: CellCoordinates; end: CellCoordinates } | null {
  const normalized = normalizeCellAddress(range);
  const match = RANGE_REGEX.exec(normalized);
  if (!match) return null;
  const [, startAddress, endAddress] = match;
  return {
    start: toRowCol(startAddress),
    end: toRowCol(endAddress),
  };
}

export function expandRange(range: string): string[] {
  const parsed = parseRange(range);
  if (!parsed) return [];
  const { start, end } = parsed;
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const cells: string[] = [];
  for (let row = minRow; row <= maxRow; row += 1) {
    for (let col = minCol; col <= maxCol; col += 1) {
      cells.push(toA1(row, col));
    }
  }
  return cells;
}
