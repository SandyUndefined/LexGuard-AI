import { describe, expect, it } from 'vitest';
import { calculateRiskScore, getRiskLevel, scoreClauses } from './riskScoring';
import type { EnhancedClause } from '../../../shared/src/types';

function clause(severity: EnhancedClause['severity']): EnhancedClause {
  return {
    id: severity,
    title: `${severity} clause`,
    originalText: 'Original contract text',
    category: 'General',
    severity,
    riskExplanation: 'Risk explanation',
    realWorldImpact: 'Real-world impact',
    saferRewrite: 'Safer rewrite',
    agentFlags: {
      legalRisk: false,
      financialRisk: false,
      adversarialTrap: false,
    },
  };
}

describe('riskScoring', () => {
  it('calculates deterministic average severity score', () => {
    expect(calculateRiskScore([])).toBe(0);
    expect(calculateRiskScore([clause('low')])).toBe(10);
    expect(calculateRiskScore([clause('medium'), clause('high')])).toBe(53);
    expect(calculateRiskScore([clause('low'), clause('medium'), clause('high'), clause('critical')])).toBe(53);
  });

  it('maps score bands to risk levels', () => {
    expect(getRiskLevel(0)).toBe('safe');
    expect(getRiskLevel(30)).toBe('safe');
    expect(getRiskLevel(31)).toBe('negotiate');
    expect(getRiskLevel(70)).toBe('negotiate');
    expect(getRiskLevel(71)).toBe('avoid');
    expect(getRiskLevel(100)).toBe('avoid');
  });

  it('builds recommendation from score and clause counts', () => {
    const result = scoreClauses([clause('high'), clause('critical')]);

    expect(result.overallRiskScore).toBe(83);
    expect(result.riskLevel).toBe('avoid');
    expect(result.recommendation).toContain('score: 83/100');
  });
});
