// Auto-generated. Do not edit by hand.
import { computeSheet } from './runtime.ts';
import type { ComputeOverrides, ComputeResult, WorkbookData } from './types.ts';
import * as sheet0 from './sheets/sheet_1.ts';
import * as sheet1 from './sheets/sheet_2.ts';
import * as sheet2 from './sheets/sheet_3.ts';
import * as sheet3 from './sheets/sheet_4.ts';
import * as sheet4 from './sheets/sheet_5.ts';
import * as sheet5 from './sheets/sheet_6.ts';
import * as sheet6 from './sheets/sheet_7.ts';
import * as sheet7 from './sheets/sheet_8.ts';
import * as sheet8 from './sheets/sheet_9.ts';
import * as sheet9 from './sheets/sheet_10.ts';
import * as sheet10 from './sheets/sheet_11.ts';
import * as sheet11 from './sheets/sheet_12.ts';
import * as sheet12 from './sheets/sheet_13.ts';
import * as sheet13 from './sheets/sheet_14.ts';
import * as sheet14 from './sheets/sheet_15.ts';

const workbook: WorkbookData = {
  "Banc": sheet0.cells,
  "LAVATORIO ATUAL": sheet1.cells,
  "MicLav": sheet2.cells,
  " Grelha": sheet3.cells,
  "Prat": sheet4.cells,
  "Mesas": sheet5.cells,
  "Coifa": sheet6.cells,
  "Chapa-Mat Ø": sheet7.cells,
  "EstCarroCantoeira": sheet8.cells,
  "EstCarroTubo": sheet9.cells,
  "G Corpo": sheet10.cells,
  "Gab-Arm": sheet11.cells,
  "Cant": sheet12.cells,
  "Batente": sheet13.cells,
  "Planilha1": sheet14.cells,
};

export function compute(sheetName: string, overrides: ComputeOverrides = {}): ComputeResult {
  return computeSheet(workbook, sheetName, overrides);
}
