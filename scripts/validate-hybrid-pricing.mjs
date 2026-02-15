import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mainCsvPath = path.join(root, 'levantamento_ordens_2022.csv');
const dimCsvPath = path.join(root, 'ordens_com_dimensoes.csv');
const configPath = path.join(root, 'src', 'domains', 'precificacao', 'config', 'hybridPricing.config.json');
const outJsonPath = path.join(root, 'relatorios', 'hybrid_pricing_validation.json');
const outMdPath = path.join(root, 'relatorios', 'hybrid_pricing_validation.md');

function normalizeText(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function parseCsv(raw) {
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const splitLine = (line) => {
    const out = [];
    let token = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          token += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        out.push(token);
        token = '';
      } else {
        token += ch;
      }
    }
    out.push(token);
    return out.map((x) => x.trim());
  };

  const headers = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] || '';
    });
    return row;
  });
}

function parseDimension(input) {
  if (!input) return null;
  const normalized = input.replace(/,/g, '.').replace(/\s+/g, '').replace(/[×x]/gi, 'X');
  const match = normalized.match(/(\d{2,4}(?:\.\d+)?)X(\d{2,4}(?:\.\d+)?)(?:X(\d{2,4}(?:\.\d+)?))?/i);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  const c = match[3] ? Number(match[3]) : 0;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return { maxSide: Math.max(a, b, c || 0) };
}

function round(value, dec = 4) {
  const p = 10 ** dec;
  return Math.round(value * p) / p;
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const mainRows = parseCsv(fs.readFileSync(mainCsvPath, 'utf8'));
const dimRows = parseCsv(fs.readFileSync(dimCsvPath, 'utf8'));

const dimByCode = new Map();
for (const row of dimRows) {
  const code = normalizeText(row.Codigo);
  if (code && row.Dimensao) dimByCode.set(code, row.Dimensao);
}

let withFamilyFactor = 0;
let withSubfamilyFactor = 0;
let withDimension = 0;
let withComplexity = 0;
let total = 0;

const factorSamples = [];

for (const row of mainRows) {
  total += 1;
  const codigo = normalizeText(row.Codigo);
  const familia = normalizeText(row.Familia);
  const subfamilia = normalizeText(row.Subfamilia);
  const dimensao = dimByCode.get(codigo) || '';

  const fatorFamilia = config.familiaFactors[familia] ?? config.defaultFactor ?? 1;
  const fatorSubfamilia = config.subfamiliaFactors[subfamilia] ?? config.defaultFactor ?? 1;

  const parsedDim = parseDimension(dimensao);
  let fatorDimensao = 1;
  if (parsedDim) {
    withDimension += 1;
    const band = (config.dimensaoBands || []).find((x) => parsedDim.maxSide <= x.maxMaiorLadoMm);
    fatorDimensao = band?.factor ?? 1;
  }

  const temProjeto = (row.TemProjeto || '').toLowerCase() === 'true';
  const temBloco = (row.TemBloco || '').toLowerCase() === 'true';
  const temRender = (row.TemRender || '').toLowerCase() === 'true';

  const bonus =
    (temProjeto ? config.complexityBonus.temProjeto : 0) +
    (temBloco ? config.complexityBonus.temBloco : 0) +
    (temRender ? config.complexityBonus.temRender : 0);

  const fatorComplexidade = 1 + bonus;

  if (fatorFamilia !== 1) withFamilyFactor += 1;
  if (fatorSubfamilia !== 1) withSubfamilyFactor += 1;
  if (fatorComplexidade !== 1) withComplexity += 1;

  const fatorHistorico = fatorFamilia * fatorSubfamilia * fatorDimensao * fatorComplexidade;

  if (factorSamples.length < 50) {
    factorSamples.push({
      codigo,
      familia,
      subfamilia,
      dimensao,
      fatorFamilia: round(fatorFamilia),
      fatorSubfamilia: round(fatorSubfamilia),
      fatorDimensao: round(fatorDimensao),
      fatorComplexidade: round(fatorComplexidade),
      fatorHistorico: round(fatorHistorico),
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  totalRegistros: total,
  cobertura: {
    familiaFactorAplicado: round(withFamilyFactor / Math.max(total, 1), 3),
    subfamiliaFactorAplicado: round(withSubfamilyFactor / Math.max(total, 1), 3),
    dimensaoDetectada: round(withDimension / Math.max(total, 1), 3),
    complexidadeAplicada: round(withComplexity / Math.max(total, 1), 3),
  },
  amostras: factorSamples,
};

fs.mkdirSync(path.dirname(outJsonPath), { recursive: true });
fs.writeFileSync(outJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

const md = `# Validação da Precificação Híbrida\n\n` +
`Gerado em: ${report.generatedAt}\n\n` +
`## Cobertura\n` +
`- Registros avaliados: **${report.totalRegistros}**\n` +
`- Fator de família aplicado: **${Math.round(report.cobertura.familiaFactorAplicado * 100)}%**\n` +
`- Fator de subfamília aplicado: **${Math.round(report.cobertura.subfamiliaFactorAplicado * 100)}%**\n` +
`- Dimensão detectada: **${Math.round(report.cobertura.dimensaoDetectada * 100)}%**\n` +
`- Complexidade aplicada: **${Math.round(report.cobertura.complexidadeAplicada * 100)}%**\n\n` +
`## Arquivo detalhado\n` +
`- relatorios/hybrid_pricing_validation.json\n`;

fs.writeFileSync(outMdPath, md, 'utf8');

console.log(`Validation report saved: ${outJsonPath}`);
console.log(`Validation summary saved: ${outMdPath}`);
