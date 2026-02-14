import { useMemo, useState } from "react";
import { CheckCircle2, FileSpreadsheet } from "lucide-react";
import { FormField } from "./FormField";
import { normalizeOpFile } from "../../services/opNormalization.service";
import type { OpNormalizationResult } from "../../types/opPricing";

interface OrdemProducaoExcelFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const parseInput = (value: string): number | "" => {
  if (value === "") return "";
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : "";
};

const toPercentRatio = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "";
  return parsed > 1 ? parsed / 100 : parsed;
};

export function OrdemProducaoExcelForm({ formData, setFormData }: OrdemProducaoExcelFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalization = formData.opNormalization as OpNormalizationResult | undefined;

  const defaults = useMemo(
    () => ({
      demaisCustos: formData.demaisCustos ?? 0,
      margemPct: formData.margemPct ?? 30,
      impostosPct: formData.impostosPct ?? 0,
      overrideScrapPct: formData.overrideScrapPct ?? "",
      overrideEfficiency: formData.overrideEfficiency ?? "",
      clienteNome: formData.clienteNome ?? "",
      clienteId: formData.clienteId ?? "",
    }),
    [formData]
  );

  const update = (key: string, value: unknown) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleImport = async () => {
    if (!file) {
      setError("Selecione um arquivo de OP (.xlsx, .xlsm, .xls, .csv).");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await normalizeOpFile(file);
      setFormData({
        ...formData,
        importedFileName: file.name,
        opNormalization: result,
      });
    } catch (importError) {
      const message = importError instanceof Error ? importError.message : "Falha ao importar a OP.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Precificação por OP (consumo de chapa)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Arquivo de Ordem de Produção" required>
            <input
              type="file"
              accept=".xlsx,.xlsm,.xls,.csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <div className="flex items-end">
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-60"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {loading ? "Importando..." : "Importar e normalizar OP"}
            </button>
          </div>
        </div>

        {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>}

        {normalization && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <div className="flex items-center gap-2 text-emerald-800 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <strong>{formData.importedFileName}</strong> (aba {normalization.sheetName})
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-emerald-900">
              <span>Itens: {normalization.summary.parsedItems}</span>
              <span>Pendências: {normalization.summary.pendingItems}</span>
              <span>Com X/Y: {normalization.summary.rowsWithXy}</span>
              <span>Mat+Esp: {normalization.summary.rowsWithMaterialThickness}</span>
            </div>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Parâmetros de Cálculo</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label="Demais Custos (R$)">
            <input
              type="text"
              inputMode="decimal"
              value={defaults.demaisCustos === 0 ? "" : defaults.demaisCustos}
              onChange={(event) => update("demaisCustos", parseInput(event.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Margem (%)" required>
            <input
              type="text"
              inputMode="decimal"
              value={defaults.margemPct === 0 ? "" : defaults.margemPct}
              onChange={(event) => update("margemPct", parseInput(event.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Impostos (%)">
            <input
              type="text"
              inputMode="decimal"
              value={defaults.impostosPct === 0 ? "" : defaults.impostosPct}
              onChange={(event) => update("impostosPct", parseInput(event.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Override Scrap (%)">
            <input
              type="text"
              inputMode="decimal"
              value={defaults.overrideScrapPct}
              onChange={(event) => update("overrideScrapPct", parseInput(event.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Override Eficiência (%)">
            <input
              type="text"
              inputMode="decimal"
              value={
                defaults.overrideEfficiency === ""
                  ? ""
                  : Number(defaults.overrideEfficiency) > 1
                  ? defaults.overrideEfficiency
                  : Number(defaults.overrideEfficiency) * 100
              }
              onChange={(event) => update("overrideEfficiency", toPercentRatio(parseInput(event.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Dados do Orçamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Cliente (nome)">
            <input
              type="text"
              value={defaults.clienteNome}
              onChange={(event) => update("clienteNome", event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
          <FormField label="Cliente ID (opcional)">
            <input
              type="text"
              value={defaults.clienteId}
              onChange={(event) => update("clienteId", event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
