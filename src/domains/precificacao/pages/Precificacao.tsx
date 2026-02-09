import { useEffect, useMemo, useState } from 'react';
import { GLOBAL_FIELDS, getProductConfig, PRODUCT_CONFIGS, type FieldConfig } from '../system/formConfig';
import type { GlobalParams, ProdutoTipo } from '../system/types';
import {
  calcularBancadas,
  calcularChapaPlana,
  calcularCantoneira,
  calcularCoifas,
  calcularEstanteCantoneira,
  calcularEstanteTubo,
  calcularLavatorios,
  calcularMaterialRedondo,
  calcularMesas,
  calcularPortasBatentes,
  calcularPrateleiras,
  calcularCubaAvulsa,
} from '../system/calculations';

type FieldValue = string | boolean;

const DEFAULT_GLOBAL_VALUES: Record<string, string> = {
  precoKgInox: '37',
  fatorTampo: '3',
  fatorCuba: '3',
  fatorVenda: '3',
  percentualDesperdicio: '5',
  percentualMaoDeObra: '20',
};

const RESULT_LABELS: Record<string, string> = {
  custoChapa: 'Custo da chapa',
  custoEstrutura: 'Custo da estrutura',
  custoCubas: 'Custo das cubas',
  custoAcessorios: 'Custo dos acessórios',
  custoMaterial: 'Custo material',
  custoProducao: 'Custo produção',
  precoFinal: 'Preço final',
};

// Validação forte de número
const parsePtNumber = (raw: unknown): { ok: true; value: number } | { ok: false; error: string } => {
  if (typeof raw === 'boolean') return { ok: true, value: raw ? 1 : 0 };
  const s = String(raw ?? '').trim();
  if (!s) return { ok: false, error: 'Obrigatório' };
  const norm = s.replace(/\s/g, '');
  const cleaned = norm.includes(',') ? norm.replace(/\./g, '').replace(',', '.') : norm;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return { ok: false, error: 'Número inválido' };
  return { ok: true, value: n };
};

// Validação de campos obrigatórios e tipos
function validateBancadas(values: Record<string, FieldValue>, orcamentoTipo: string): { errors: Record<string, string>, parsed: any } {
  let required: string[] = [];
  if (orcamentoTipo === 'somenteCuba') {
    required = ['comprimento', 'largura', 'alturaFrontal', 'espessuraChapa', 'quantidadeCubas'];
  } else {
    required = [
      'comprimento', 'largura', 'alturaFrontal', 'espessuraChapa',
      'quantidadePes', 'tipoTuboPes', 'alturaPes', 'tipoPrateleiraInferior',
    ];
  }
  const errors: Record<string, string> = {};
  const parsed: any = {};
  for (const key of required) {
    const res = parsePtNumber(values[key]);
    if (!res.ok) errors[key] = res.error;
    else parsed[key] = res.value;
  }
  // Campos booleanos
  parsed.temContraventamento = Boolean(values.temContraventamento);
  parsed.usarMaoFrancesa = Boolean(values.usarMaoFrancesa);
  // Campos select
  parsed.tipoTuboPes = String(values.tipoTuboPes || 'tuboRedondo');
  parsed.tipoPrateleiraInferior = String(values.tipoPrateleiraInferior || 'nenhuma');
  // Cuba
  parsed.quantidadeCubas = parsePtNumber(values.quantidadeCubas).ok ? parsePtNumber(values.quantidadeCubas).value : 0;
  parsed.tipoCuba = String(values.tipoCuba || 'sem');
  return { errors, parsed };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

const buildDefaultValues = (fields: FieldConfig[]) => {
  const values: Record<string, FieldValue> = {};
  fields.forEach((field) => {
    if (field.type === 'boolean') {
      values[field.name] = false;
      return;
    }
    if (field.type === 'select' && field.options?.length) {
      values[field.name] = String(field.options[0].value);
      return;
    }
    values[field.name] = '';
  });
  return values;
};

const getNestedValue = (values: Record<string, FieldValue>, path: string) => values[path];

const setNestedValue = (values: Record<string, FieldValue>, path: string, value: FieldValue) => ({
  ...values,
  [path]: value,
});

const buildGlobalParams = (values: Record<string, string>): GlobalParams => ({
  precoKgInox: parsePtNumber(values.precoKgInox).ok ? parsePtNumber(values.precoKgInox).value : 0,
  fatorTampo: parsePtNumber(values.fatorTampo).ok ? parsePtNumber(values.fatorTampo).value : 0,
  fatorCuba: parsePtNumber(values.fatorCuba).ok ? parsePtNumber(values.fatorCuba).value : 0,
  fatorVenda: parsePtNumber(values.fatorVenda).ok ? parsePtNumber(values.fatorVenda).value : 0,
  percentualDesperdicio: parsePtNumber(values.percentualDesperdicio).ok ? parsePtNumber(values.percentualDesperdicio).value / 100 : 0,
  percentualMaoDeObra: parsePtNumber(values.percentualMaoDeObra).ok ? parsePtNumber(values.percentualMaoDeObra).value / 100 : 0,
});

export default function PrecificacaoPage() {
  const [produtoTipo, setProdutoTipo] = useState<ProdutoTipo>('bancadas');
  const [globalValues, setGlobalValues] = useState<Record<string, string>>(DEFAULT_GLOBAL_VALUES);
  const [productValues, setProductValues] = useState<Record<string, FieldValue>>({});
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Opção de orçamento: 'somenteCuba', 'bancadaSemCuba', 'bancadaComCuba'
  const [orcamentoTipo, setOrcamentoTipo] = useState<'somenteCuba' | 'bancadaSemCuba' | 'bancadaComCuba'>('bancadaComCuba');

  const productConfig = useMemo(() => getProductConfig(produtoTipo), [produtoTipo]);

  useEffect(() => {
    if (!productConfig) return;
    setProductValues(buildDefaultValues(productConfig.fields));
    setResult(null);
  }, [productConfig, produtoTipo]);

  // Exibe campos conforme a opção de orçamento
  const isFieldVisible = (field: FieldConfig) => {
    if (produtoTipo !== 'bancadas') {
      if (!field.dependsOn) return true;
      const currentValue = getNestedValue(productValues, field.dependsOn.field);
      return String(currentValue) === String(field.dependsOn.value);
    }
    // Para bancadas/cubas:
    if (orcamentoTipo === 'somenteCuba') {
      // Mostra apenas campos de cuba e dimensões/espessura, mas NÃO tipoCuba
      return [
        'quantidadeCubas',
        'comprimento',
        'largura',
        'espessuraChapa',
        'alturaFrontal', // se altura da cuba for relevante
      ].includes(field.name);
    }
    // Só mostra tipoCuba se não for "somenteCuba"
    if (field.name === 'tipoCuba' && orcamentoTipo !== 'bancadaComCuba') return false;
    if (orcamentoTipo === 'bancadaSemCuba') {
      // Não mostra campos de cuba
      if (['quantidadeCubas', 'tipoCuba'].includes(field.name)) return false;
      return true;
    }
    // Padrão: mostra tudo
    if (!field.dependsOn) return true;
    const currentValue = getNestedValue(productValues, field.dependsOn.field);
    return String(currentValue) === String(field.dependsOn.value);
  };

  const handleGlobalChange = (field: string, value: string) => {
    setGlobalValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (field: FieldConfig, value: FieldValue) => {
    setProductValues((prev) => setNestedValue(prev, field.name, value));
  };

  const toResultMap = (input: object) => {
    const map: Record<string, number> = {};
    Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        map[key] = value;
      }
    });
    return map;
  };

  const handleCalculate = () => {
    const params = buildGlobalParams(globalValues);
    switch (produtoTipo) {
      case 'bancadas': {
        const { errors: valErrors, parsed } = validateBancadas(productValues, orcamentoTipo);
        setErrors(valErrors);
        if (Object.keys(valErrors).length > 0) {
          setResult(null);
          return;
        }
        if (orcamentoTipo === 'somenteCuba') {
          setResult(calcularCubaAvulsa(parsed, params));
        } else {
          setResult(calcularBancadas(parsed, params));
        }
        return;
      }
      case 'lavatorios':
        setResult(toResultMap(
          calcularLavatorios(
            {
              tipo: String(productValues.tipo || 'lavatorioPadrao') as any,
              modeloPadrao: String(productValues.modeloPadrao || '750') as any,
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              profundidade: parseNumber(productValues.profundidade),
              alturaFrontal: parseNumber(productValues.alturaFrontal),
              bicaAlta: Boolean(productValues.bicaAlta),
              bicaBaixa: Boolean(productValues.bicaBaixa),
              pedal: Boolean(productValues.pedal),
              mangueiras: Boolean(productValues.mangueiras),
              joelho: Boolean(productValues.joelho),
              valvula: Boolean(productValues.valvula),
            },
            params
          )
        ));
        return;
      case 'prateleiras':
        setResult(toResultMap(
          calcularPrateleiras(
            {
              tipo: String(productValues.tipo || 'lisa') as any,
              comprimento: parseNumber(productValues.comprimento),
              profundidade: parseNumber(productValues.profundidade),
              bordaDobrada: Boolean(productValues.bordaDobrada),
              espessuraChapa: parseNumber(productValues.espessuraChapa),
              usarMaoFrancesa: Boolean(productValues.usarMaoFrancesa),
            },
            params
          )
        ));
        return;
      case 'mesas':
        setResult(toResultMap(
          calcularMesas(
            {
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              espessuraTampo: parseNumber(productValues.espessuraTampo),
              bordaTampo: parseNumber(productValues.bordaTampo),
              quantidadePes: parseNumber(productValues.quantidadePes) as 4 | 5 | 6 | 7,
              tipoTuboPes: String(productValues.tipoTuboPes || 'tuboRedondo') as any,
              alturaPes: parseNumber(productValues.alturaPes),
              tipoPrateleiraInferior: String(productValues.tipoPrateleiraInferior || 'nenhuma') as any,
              temContraventamento: Boolean(productValues.temContraventamento),
            },
            params
          )
        ));
        return;
      case 'estanteCantoneira':
        setResult(toResultMap(
          calcularEstanteCantoneira(
            {
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              altura: parseNumber(productValues.altura),
              quantidadePlanos: parseNumber(productValues.quantidadePlanos),
              tipoPrateleira: String(productValues.tipoPrateleira || 'lisa') as any,
              quantidadePes: parseNumber(productValues.quantidadePes),
              espessuraChapa: parseNumber(productValues.espessuraChapa),
              incluirRodizios: Boolean(productValues.incluirRodizios),
            },
            params
          )
        ));
        return;
      case 'estanteTubo':
        setResult(toResultMap(
          calcularEstanteTubo(
            {
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              altura: parseNumber(productValues.altura),
              quantidadePlanos: parseNumber(productValues.quantidadePlanos),
              quantidadePes: parseNumber(productValues.quantidadePes),
              tipoPrateleira: String(productValues.tipoPrateleira || 'lisa') as any,
              valorMetroTubo: parseNumber(productValues.valorMetroTubo),
            },
            params
          )
        ));
        return;
      case 'coifas':
        setResult(toResultMap(
          calcularCoifas(
            {
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              altura: parseNumber(productValues.altura),
              tipoCoifa: String(productValues.tipoCoifa || '3-aguas') as any,
              incluirDuto: Boolean(productValues.incluirDuto),
              incluirCurva: Boolean(productValues.incluirCurva),
              incluirChapeu: Boolean(productValues.incluirChapeu),
              incluirInstalacao: Boolean(productValues.incluirInstalacao),
            },
            params
          )
        ));
        return;
      case 'chapaPlana':
        setResult(toResultMap(
          calcularChapaPlana(
            {
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              espessura: parseNumber(productValues.espessura),
              precoKg: parseNumber(productValues.precoKg),
            },
            params
          )
        ));
        return;
      case 'materialRedondo':
        setResult(toResultMap(
          calcularMaterialRedondo(
            {
              diametro: parseNumber(productValues.diametro),
              altura: parseNumber(productValues.altura),
              espessura: parseNumber(productValues.espessura),
              percentualRepuxo: parseNumber(productValues.percentualRepuxo),
            },
            params
          )
        ));
        return;
      case 'cantoneira':
        setResult(toResultMap(
          calcularCantoneira(
            {
              comprimento: parseNumber(productValues.comprimento),
              ladoA: parseNumber(productValues.ladoA),
              ladoB: parseNumber(productValues.ladoB),
              espessura: parseNumber(productValues.espessura),
            },
            params
          )
        ));
        return;
      case 'portasBatentes':
        setResult(toResultMap(
          calcularPortasBatentes(
            {
              porta: {
                altura: parseNumber(productValues['porta.altura']),
                largura: parseNumber(productValues['porta.largura']),
                espessuraFrente: parseNumber(productValues['porta.espessuraFrente']),
                espessuraVerso: parseNumber(productValues['porta.espessuraVerso']),
                preenchimentoMDF: Boolean(productValues['porta.preenchimentoMDF']),
              },
              batente: {
                altura: parseNumber(productValues['batente.altura']),
                largura: parseNumber(productValues['batente.largura']),
                perfil: parseNumber(productValues['batente.perfil']),
                espessura: parseNumber(productValues['batente.espessura']),
              },
            },
            params
          )
        ));
        return;
      default:
        setResult(null);
    }
  };

  const resultEntries = useMemo(() => {
    if (!result) return [] as Array<{ key: string; label: string; value: number }>;
    const priority = ['custoChapa', 'custoEstrutura', 'custoCubas', 'custoAcessorios', 'custoMaterial', 'custoProducao', 'precoFinal'];
    return Object.entries(result)
      .filter(([, value]) => typeof value === 'number')
      .map(([key, value]) => ({ key, label: RESULT_LABELS[key] ?? key, value }))
      .sort((a, b) => {
        const aIndex = priority.indexOf(a.key);
        const bIndex = priority.indexOf(b.key);
        const aOrder = aIndex === -1 ? priority.length : aIndex;
        const bOrder = bIndex === -1 ? priority.length : bIndex;
        return aOrder - bOrder;
      });
  }, [result]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Precificação</h1>
        <p className="text-sm text-muted-foreground">
          Selecione o produto, preencha os parâmetros e obtenha o orçamento automaticamente.
        </p>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="text-sm font-semibold">1) Parâmetros globais</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {GLOBAL_FIELDS.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
              <input
                type="number"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={globalValues[field.name] ?? ''}
                onChange={(event) => handleGlobalChange(field.name, event.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="text-sm font-semibold">2) Tipo de produto</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={produtoTipo}
            onChange={(event) => setProdutoTipo(event.target.value as ProdutoTipo)}
          >
            {PRODUCT_CONFIGS.map((config) => (
              <option key={config.type} value={config.type}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
        {productConfig && (
          <p className="mt-2 text-xs text-muted-foreground">{productConfig.description}</p>
        )}
      </div>

      {productConfig && (
        <div className="rounded-md border p-4">
          <h2 className="text-sm font-semibold">3) Medidas e opções</h2>
          {produtoTipo === 'bancadas' && (
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground">O que deseja orçar?</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm mt-1"
                value={orcamentoTipo}
                onChange={e => setOrcamentoTipo(e.target.value as any)}
              >
                <option value="somenteCuba">Somente a cuba</option>
                <option value="bancadaSemCuba">Bancada sem cuba</option>
                <option value="bancadaComCuba">Bancada com cuba</option>
              </select>
            </div>
          )}
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {productConfig.fields.filter(isFieldVisible).map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                {field.type === 'boolean' ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(productValues[field.name])}
                      onChange={(event) => handleProductChange(field, event.target.checked)}
                    />
                    <span>Sim</span>
                  </label>
                ) : field.type === 'select' ? (
                  <select
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={String(productValues[field.name] ?? '')}
                    onChange={(event) => handleProductChange(field, event.target.value)}
                  >
                    {field.options?.map((option) => (
                      <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={String(productValues[field.name] ?? '')}
                    onChange={(event) => handleProductChange(field, event.target.value)}
                  />
                )}
                {errors[field.name] && (
                  <p className="text-xs text-red-500">{errors[field.name]}</p>
                )}
                {field.unit && (
                  <p className="text-[11px] text-muted-foreground">Unidade: {field.unit}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={handleCalculate}
            >
              Calcular orçamento
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-md border p-4">
          <h2 className="text-sm font-semibold">4) Resultado</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {resultEntries.map((item) => (
              <div key={item.key} className="rounded-md border bg-muted/40 p-3">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
          {/* Breakdown detalhado para bancadas */}
          {produtoTipo === 'bancadas' && result.breakdown && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Detalhamento do cálculo</h3>
              <div className="mb-2">
                <strong>Materiais:</strong>
                <ul className="ml-4 list-disc">
                  {result.breakdown.materials.map((m: any, i: number) => (
                    <li key={i}>{m.description}: {m.qty} {m.unit} x R$ {m.unitCost} = <strong>R$ {m.total}</strong></li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <strong>Acessórios:</strong>
                <ul className="ml-4 list-disc">
                  {result.breakdown.accessories.map((a: any, i: number) => (
                    <li key={i}>{a.description}: {a.qty} un x R$ {a.unitCost} = <strong>R$ {a.total}</strong></li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <strong>Processos:</strong>
                <ul className="ml-4 list-disc">
                  {result.breakdown.processes.map((p: any, i: number) => (
                    <li key={i}>{p.description}: {p.minutes} min x R$ {p.costPerHour}/h = <strong>R$ {p.total}</strong></li>
                  ))}
                </ul>
              </div>
              {result.warnings && result.warnings.length > 0 && (
                <div className="mt-2 text-yellow-700">
                  <strong>Avisos:</strong>
                  <ul className="ml-4 list-disc">
                    {result.warnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {/* Bloco explicativo da lógica do cálculo */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="text-sm font-semibold mb-1">Como este orçamento é calculado?</h3>
            <p className="text-xs text-blue-900">
              O sistema soma o custo dos materiais (chapa, tubos, acessórios), calcula o custo dos processos de fabricação (corte, dobra, solda, acabamento, montagem) e aplica os percentuais de desperdício, mão de obra e o fator de venda. O resultado é um orçamento detalhado, transparente e auditável.<br />
              <br />
              <strong>Materiais:</strong> calculados pela área e espessura das chapas, comprimento dos tubos e quantidade de acessórios, multiplicados pelo preço do kg ou unidade.<br />
              <strong>Processos:</strong> estimados em minutos para cada etapa (corte, dobra, solda, acabamento, montagem), multiplicados pelo custo/hora de cada processo.<br />
              <strong>Desperdício:</strong> aplica um acréscimo sobre o custo dos materiais para cobrir perdas de fabricação.<br />
              <strong>Mão de obra:</strong> aplica um percentual sobre o subtotal para cobrir custos de produção.<br />
              <strong>Fator de venda:</strong> multiplica o custo total para formar o preço final de venda.<br />
              <br />
              Todos os valores e regras podem ser ajustados conforme a realidade da fábrica e do produto.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
