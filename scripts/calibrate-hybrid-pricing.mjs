import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fileMain = path.join(root, 'levantamento_ordens_2022.csv');
const outConfig = path.join(root, 'src', 'domains', 'precificacao', 'config', 'hybridPricing.config.json');

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
    return out;
  };

  const headers = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || '').trim();
    });
    return row;
  });
}

function factorFromCount(count, maxCount, amplitude) {
  if (!count || !maxCount) return 1;
  const score = Math.log(count + 1) / Math.log(maxCount + 1);
  return Number((1 + score * amplitude).toFixed(3));
}

const csvRaw = fs.readFileSync(fileMain, 'utf8');
const rows = parseCsv(csvRaw);

const famCount = new Map();
const subCount = new Map();
for (const row of rows) {
  const fam = normalizeText(row.Familia);
  const sub = normalizeText(row.Subfamilia);
  if (fam) famCount.set(fam, (famCount.get(fam) || 0) + 1);
  if (sub) subCount.set(sub, (subCount.get(sub) || 0) + 1);
}

const maxFam = Math.max(...famCount.values(), 1);
const maxSub = Math.max(...subCount.values(), 1);

const familiaFactors = {};
for (const [key, count] of [...famCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  familiaFactors[key] = factorFromCount(count, maxFam, 0.12);
}

const subfamiliaFactors = {};
for (const [key, count] of [...subCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 35)) {
  subfamiliaFactors[key] = factorFromCount(count, maxSub, 0.08);
}

const baseConfig = JSON.parse(fs.readFileSync(outConfig, 'utf8'));
const calibrated = {
  ...baseConfig,
  familiaFactors,
  subfamiliaFactors,
};

fs.writeFileSync(outConfig, JSON.stringify(calibrated, null, 2) + '\n', 'utf8');
console.log(`Calibrated families: ${Object.keys(familiaFactors).length}`);
console.log(`Calibrated subfamilies: ${Object.keys(subfamiliaFactors).length}`);
