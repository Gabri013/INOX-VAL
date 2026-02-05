/**
 * Página de Calculadora Rápida - Nova Implementação
 * Focada em produtos parametrizados (bancadas) com cálculo completo:
 * - Blank (dimensões reais das peças)
 * - BOM (lista completa de materiais)
 * - Nesting (otimização de chapas)
 * - Precificação (custos detalhados)
 */

import { CalculadoraRapida as NovaCalculadoraRapida } from '@/domains/calculadora/pages/CalculadoraRapida';

export default function CalculadoraRapida() {
  return <NovaCalculadoraRapida />;
}
