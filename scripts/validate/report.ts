import fs from 'fs';
import path from 'path';
import { ValidationResult } from './types';

export function writeValidationReport(result: ValidationResult): void {
  const reportPath = path.join(process.cwd(), 'VALIDATION_REPORT.md');
  
  const summary = `# Relatório de Validação - INOX-VAL
**Data/Hora:** ${new Date(result.timestamp).toLocaleString('pt-BR')}
**Resultado Geral:** ${result.allPass ? '✅ PASS' : '❌ FAIL'}
**Total de Validadores:** ${result.results.length}
**Passados:** ${result.results.filter(r => r.status === 'passed').length}
**Falhos:** ${result.results.filter(r => r.status === 'failed').length}
**Avisos:** ${result.results.filter(r => r.status === 'warning').length}
`;

  const detailedResults = `## Resultados Detalhados

${result.results.map(r => `### ${r.name}
- Status: ${r.status === 'passed' ? '✅ Passou' : r.status === 'failed' ? '❌ Falhou' : '⚠️ Aviso'}
- Duração: ${r.duration}ms
${r.error ? `\n- Erro: ${r.error}` : ''}
${r.details ? `\n- Detalhes: ${JSON.stringify(r.details, null, 2)}` : ''}
`).join('\n')}
`;

  const errors = result.results.filter(r => r.status === 'failed');
  const errorsSection = errors.length > 0 ? `## Erros Críticos

${errors.map(r => `### ${r.name}
${r.error}
`).join('\n')}
` : '';

  const reportContent = `${summary}\n${detailedResults}\n${errorsSection}`;
  
  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`Relatório gerado com sucesso em: ${reportPath}`);
}
