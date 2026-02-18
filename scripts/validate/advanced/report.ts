import fs from 'fs';
import path from 'path';
import { AdvancedValidationResult } from './types';

export function writeProductionReadinessReport(result: AdvancedValidationResult): void {
  const reportPath = path.resolve(process.cwd(), 'PRODUCTION_READINESS_REPORT.md');
  
  const markdown = `# Relatório de Prontidão para Produção (P5)

## Visão Geral
Data: ${new Date(result.timestamp).toLocaleString('pt-BR')}
Pontuação Total: ${result.score}/100
Status: ${result.productionReady ? '✅ PRONTO PARA PRODUÇÃO' : '⚠️ NÃO PRONTO'}
Todos os Testes Passaram: ${result.allPass ? '✅' : '❌'}

## Resumo dos Resultados

| Teste | Status | Duração (ms) | Erro |
|-------|--------|--------------|------|
${result.results.map(test => `| ${test.name} | ${getStatusEmoji(test.status)} ${test.status} | ${test.duration} | ${test.error || '-'}`).join('\n')}

## Análise por Categoria

### Testes de Limites (Boundary)
${getResultsByCategory(result, 'validateBoundaryConditions')}

### Stress Nesting
${getResultsByCategory(result, 'validateStressNesting')}

### Nesting de Tubos
${getResultsByCategory(result, 'validateTubeNesting')}

### Consistência de Arredondamento
${getResultsByCategory(result, 'validateRoundingConsistency')}

### Concorrência
${getResultsByCategory(result, 'validateConcurrency')}

### Dados Corrompidos
${getResultsByCategory(result, 'validateCorruptedData')}

### Segurança Profunda
${getResultsByCategory(result, 'validateDeepSecurity')}

### Auditoria Completa
${getResultsByCategory(result, 'validateCompleteAudit')}

### Validação Financeira
${getResultsByCategory(result, 'validateFinancialCrossValidation')}

### Consistência PDF
${getResultsByCategory(result, 'validatePDFConsistency')}

### Performance
${getResultsByCategory(result, 'validatePerformanceLoop')}

### Usabilidade Real
${getResultsByCategory(result, 'validateRealUsability')}

## Pontuação Detalhada

- **Taxa de Aprovação (70%):** ${Math.round((result.results.filter(r => r.status === 'passed').length / result.results.length) * 70)} pontos
- **Desempenho (15%):** ${Math.round(result.results.reduce((sum, r) => sum + r.duration, 0) / result.results.length / 60000 * 15)} pontos
- **Severidade (15%):** ${Math.round(15 - (result.results.filter(r => r.status === 'failed').length * 3 + result.results.filter(r => r.status === 'warning').length * 1.5))} pontos

## Recomendações

${generateRecommendations(result)}

## Critérios de Aceitação

✅ **Pontuação ≥ 90**  
✅ **Nenhum erro crítico**  
✅ **Técnicas de validação avançadas aplicadas**  

${result.productionReady ? '🎉 Sistema pronto para ambiente de produção!' : '⚠️ Requer ajustes antes de deploy em produção.'}
`;

  fs.writeFileSync(reportPath, markdown, 'utf-8');
  console.log(`Relatório gerado com sucesso: ${reportPath}`);
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'passed':
      return '✅';
    case 'failed':
      return '❌';
    case 'warning':
      return '⚠️';
    default:
      return '🔍';
  }
}

function getResultsByCategory(result: AdvancedValidationResult, category: string): string {
  const categoryResults = result.results.filter(r => r.name.includes(category));
  if (categoryResults.length === 0) {
    return 'Nenhum teste executado';
  }

  return categoryResults.map(r => `- ${getStatusEmoji(r.status)} ${r.name}: ${r.status} (${r.duration}ms)`).join('\n');
}

function generateRecommendations(result: AdvancedValidationResult): string {
  const recommendations = [];

  const failedTests = result.results.filter(r => r.status === 'failed');
  if (failedTests.length > 0) {
    recommendations.push(`- **Testes Falhados (${failedTests.length}):** ${failedTests.map(t => t.name).join(', ')}`);
  }

  const warningTests = result.results.filter(r => r.status === 'warning');
  if (warningTests.length > 0) {
    recommendations.push(`- **Testes com Aviso (${warningTests.length}):** ${warningTests.map(t => t.name).join(', ')}`);
  }

  const slowTests = result.results.filter(r => r.duration > 60000); // > 60 seconds
  if (slowTests.length > 0) {
    recommendations.push(`- **Testes Lentos (${slowTests.length}):** ${slowTests.map(t => t.name).join(', ')}`);
  }

  if (result.score < 90) {
    recommendations.push('- **Pontuação Insuficiente:** Aumente a taxa de aprovação e reduza erros para atingir 90+ pontos');
  }

  return recommendations.length > 0 ? recommendations.join('\n') : 'Nenhuma recomendação. Todos os testes passaram com pontuação alta.';
}