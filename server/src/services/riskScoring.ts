import type { EnhancedClause, RiskLevel, ClauseSeverity } from '../../../shared/src/types';
import { SEVERITY_WEIGHTS } from '../../../shared/src/types';

// ─── Scoring Rules ─────────────────────────────────────────────────────────────
//
//   Severity Weights:  Low=10  Medium=35  High=70  Critical=95
//   Score = 60% weighted average + 40% max clause score
//   Risk Bands: 0–30 → Safe  |  31–70 → Negotiate  |  71–100 → Avoid

export function calculateRiskScore(clauses: EnhancedClause[]): number {
  if (clauses.length === 0) return 0;

  const scores = clauses.map((c) => SEVERITY_WEIGHTS[c.severity]);
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const max = Math.max(...scores);

  // Blend: average gives overall document health; max penalises for critical outliers
  const raw = avg * 0.6 + max * 0.4;

  // Bonus penalty: multiple critical clauses push the score up
  const criticalCount = clauses.filter((c) => c.severity === 'critical').length;
  const criticalPenalty = Math.min(criticalCount * 5, 20);

  return Math.min(100, Math.round(raw + criticalPenalty));
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return 'safe';
  if (score <= 70) return 'negotiate';
  return 'avoid';
}

export function buildRecommendation(
  riskLevel: RiskLevel,
  score: number,
  highCount: number,
  criticalCount: number,
): string {
  switch (riskLevel) {
    case 'safe':
      return `This contract appears fair and reasonable (score: ${score}/100). You can sign with confidence, but always read it fully yourself.`;
    case 'negotiate':
      return `This contract has ${highCount + criticalCount} clause(s) that need attention (score: ${score}/100). Request modifications on the flagged items before signing.`;
    case 'avoid':
      return `This contract poses serious risk (score: ${score}/100) with ${criticalCount} critical clause(s). Do not sign without major revisions and legal counsel.`;
  }
}

export interface ScoringResult {
  overallRiskScore: number;
  riskLevel: RiskLevel;
  recommendation: string;
}

export function scoreClauses(clauses: EnhancedClause[]): ScoringResult {
  const overallRiskScore = calculateRiskScore(clauses);
  const riskLevel = getRiskLevel(overallRiskScore);
  const highCount = clauses.filter((c) => c.severity === 'high').length;
  const criticalCount = clauses.filter((c) => c.severity === 'critical').length;
  const recommendation = buildRecommendation(riskLevel, overallRiskScore, highCount, criticalCount);

  return { overallRiskScore, riskLevel, recommendation };
}

// ─── Severity mapping helper (for normalising Gemini output) ──────────────────
const VALID_SEVERITIES: ClauseSeverity[] = ['low', 'medium', 'high', 'critical'];

export function normaliseSeverity(raw: string): ClauseSeverity {
  const lower = raw.toLowerCase().trim() as ClauseSeverity;
  return VALID_SEVERITIES.includes(lower) ? lower : 'medium';
}
