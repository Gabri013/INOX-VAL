import { useEffect, useMemo, useState } from 'react';
import { buildEngine, formatCellValue, formatRawCellValue, normalizeOutputCell } from '../lib/buildEngine';

export default function PriceFromExcelPage() {
  const engineHandle = useMemo(() => buildEngine(), []);
  const sheets = useMemo(() => engineHandle.listSheets(), [engineHandle]);
  const [sheetName, setSheetName] = useState(sheets[0] ?? '');
  const [outputCell, setOutputCell] = useState('');
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!sheetName && sheets.length) {
      setSheetName(sheets[0]);
    }
  }, [sheetName, sheets]);

  const formulaCells = useMemo(() => {
    if (!sheetName) return [];
    return engineHandle.listFormulaCells(sheetName);
  }, [engineHandle, sheetName]);

  const inputs = useMemo(() => {
    if (!sheetName) return [];
    return engineHandle.listInputs(sheetName);
  }, [engineHandle, sheetName]);

  useEffect(() => {
    if (!sheetName) return;
    setOutputCell(normalizeOutputCell(formulaCells, 'A1'));
  }, [formulaCells, sheetName]);

  useEffect(() => {
    if (!sheetName) return;
    const nextValues: Record<string, string> = {};
    inputs.forEach((cell) => {
      nextValues[cell] = formatRawCellValue(engineHandle.getValue(sheetName, cell));
    });
    setInputValues(nextValues);
  }, [engineHandle, inputs, sheetName]);

  const handleInputChange = (cell: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [cell]: value }));
    engineHandle.setInput(sheetName, cell, value);
    setVersion((prev) => prev + 1);
  };

  const outputValue = useMemo(() => {
    if (!sheetName || !outputCell) return null;
    return engineHandle.getValue(sheetName, outputCell);
  }, [engineHandle, outputCell, sheetName, version]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Precificação</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados do produto e veja o resultado em tempo real.
        </p>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="text-sm font-semibold">1) Produto</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Produto</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={sheetName}
              onChange={(event) => setSheetName(event.target.value)}
            >
              {sheets.map((sheet) => (
                <option key={sheet} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="text-sm font-semibold">2) Entradas</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Informe as medidas e opções necessárias para o cálculo.
        </p>
        {inputs.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhuma entrada detectada para esta aba.</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {inputs.map((cell, index) => (
              <div key={cell} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Entrada {index + 1}</label>
                <input
                  type="text"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={inputValues[cell] ?? ''}
                  onChange={(event) => handleInputChange(cell, event.target.value)}
                  placeholder="Digite um valor"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border p-4">
        <h2 className="text-sm font-semibold">3) Resultado</h2>
        <div className="mt-3 rounded-md border bg-muted/40 p-3">
          <p className="text-xs font-medium text-muted-foreground">Resumo</p>
          <p className="text-lg font-semibold text-foreground">{formatCellValue(outputValue)}</p>
        </div>
      </div>
    </div>
  );
}
