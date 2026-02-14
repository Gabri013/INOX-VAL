import { AlertTriangle, CheckCircle2, FileWarning, Layers, Save } from "lucide-react";
import type {
  OpNormalizationResult,
  OpPricingTotals,
  SheetEstimationResult,
} from "../types/opPricing";

interface OpQuoteResultsProps {
  normalization: OpNormalizationResult;
  estimation: SheetEstimationResult;
  totals: OpPricingTotals;
  onSave?: () => void;
  saving?: boolean;
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatPct = (value: number) => `${value.toFixed(2)}%`;

export function OpQuoteResults({
  normalization,
  estimation,
  totals,
  onSave,
  saving = false,
}: OpQuoteResultsProps) {
  const classificationSummary = estimation.classificationResults.reduce(
    (acc, item) => {
      acc.total += 1;
      if (item.decision === "sheet_area") acc.sheet += 1;
      if (item.finalCategory === "tube") acc.tube += 1;
      if (item.finalCategory === "purchase") acc.purchase += 1;
      if (item.conflict) acc.conflicts += 1;
      return acc;
    },
    { total: 0, sheet: 0, tube: 0, purchase: 0, conflicts: 0 }
  );

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Resultado da Precificação por OP</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aba: <strong>{normalization.sheetName}</strong> • Itens OP: {normalization.summary.parsedItems}
          </p>
        </div>

        {onSave && (
          <button
            onClick={onSave}
            disabled={saving || !estimation.canFinalize}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar orçamento"}
          </button>
        )}
      </div>

      {!estimation.canFinalize && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
          Não é possível finalizar: existem pendências críticas (conflito processo/material, tubo, X/Y,
          espessura ou tabela de chapa).
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <MetricCard label="Custo Material Chapa" value={formatMoney(totals.custoMaterialChapa)} />
        <MetricCard label="Demais Custos" value={formatMoney(totals.demaisCustos)} />
        <MetricCard label="Impostos" value={formatMoney(totals.impostosValor)} />
        <MetricCard label="Preço Final" value={formatMoney(totals.precoFinal)} highlight />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <MetricCard label="Itens Classificados" value={String(classificationSummary.total)} />
        <MetricCard label="Rota Chapa" value={String(classificationSummary.sheet)} />
        <MetricCard label="Rota Tubo" value={String(classificationSummary.tube)} />
        <MetricCard label="Rota Compra" value={String(classificationSummary.purchase)} />
        <MetricCard label="Conflitos Proc/Mat" value={String(classificationSummary.conflicts)} />
      </div>

      <div className="border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Composição do Preço</h3>
        <div className="space-y-1 text-sm">
          <Line label="Subtotal Base (Chapa + demais custos)" value={formatMoney(totals.subtotalBase)} />
          <Line label={`Margem (${formatPct(totals.margemPct)})`} value={formatMoney(totals.margemValor)} />
          <Line label={`Impostos (${formatPct(totals.impostosPct)})`} value={formatMoney(totals.impostosValor)} />
          <Line label="Preço Final" value={formatMoney(totals.precoFinal)} strong />
        </div>
      </div>

      <div className="border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Breakdown de Chapa por Material/Espessura
        </h3>
        {estimation.groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum grupo com sheetSpec válido.</p>
        ) : (
          <div className="space-y-2">
            {estimation.groups.map((group) => (
              <div key={group.groupKey} className="rounded border border-border p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">
                    {group.materialName} • {group.thicknessMm}mm
                  </span>
                  <span className="font-semibold">{formatMoney(group.materialCost)}</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  Área: {group.areaTotalM2.toFixed(3)} m² • Chapas: {group.estimatedSheets} •
                  Chapa {group.sheetWidthMm}x{group.sheetHeightMm} • Scrap{" "}
                  {formatPct(group.scrapPct * 100)} • Eficiência {formatPct(group.efficiency * 100)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <FileWarning className="w-4 h-4" />
            Pendências ({estimation.pending.length})
          </h3>
          {estimation.pending.length === 0 ? (
            <p className="text-sm text-amber-900">Sem pendências.</p>
          ) : (
            <ul className="text-xs text-amber-900 space-y-1 max-h-48 overflow-auto">
              {estimation.pending.slice(0, 120).map((issue, idx) => (
                <li key={`${issue.code}-${idx}`}>• {issue.message}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Itens Fora do Cálculo de Chapa ({estimation.excludedItems.length})
          </h3>
          {estimation.excludedItems.length === 0 ? (
            <p className="text-sm text-slate-700">Nenhum item excluído.</p>
          ) : (
            <ul className="text-xs text-slate-700 space-y-1 max-h-48 overflow-auto">
              {estimation.excludedItems.slice(0, 120).map((excluded) => (
                <li key={`${excluded.rowIndex}-${excluded.reason}`}>
                  • Linha {excluded.rowIndex}: {excluded.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {estimation.canFinalize && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Cálculo com rastreabilidade completo para finalização.
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded border p-3 ${highlight ? "border-emerald-300 bg-emerald-50" : "border-border"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? "text-emerald-700" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold text-foreground" : "text-foreground"}>{value}</span>
    </div>
  );
}
