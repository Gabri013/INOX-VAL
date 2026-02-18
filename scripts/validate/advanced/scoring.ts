import { ValidatorResult } from '../types';

export function calculateProductionReadinessScore(
  results: Array<{
    name: string;
    status: 'passed' | 'failed' | 'warning';
    duration: number;
    error?: string;
    details?: any;
  }>
): number {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'passed').length;
  const warningTests = results.filter(r => r.status === 'warning').length;
  const failedTests = results.filter(r => r.status === 'failed').length;

  // Weight factors
  const passingWeight = 0.7;
  const durationWeight = 0.15;
  const severityWeight = 0.15;

  // Passing percentage score (70% of total)
  const passingScore = (passedTests / totalTests) * 100 * passingWeight;

  // Duration score (15% of total) - penalize slow tests
  const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
  const maxAcceptableDuration = 60000; // 60 seconds per test
  const durationScore = Math.max(0, 100 - (averageDuration / maxAcceptableDuration) * 100) * durationWeight;

  // Severity score (15% of total) - penalize failures and warnings
  const severityScore = (100 - (failedTests * 20 + warningTests * 10)) * severityWeight;

  // Total score
  let totalScore = passingScore + durationScore + severityScore;

  // Ensure score is between 0 and 100
  totalScore = Math.max(0, Math.min(100, totalScore));

  return Math.round(totalScore);
}