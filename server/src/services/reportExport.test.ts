import { describe, expect, it } from 'vitest';
import { buildPrintableReportHtml, buildReportExportFilename } from './reportExport';
import type { EnhancedReport } from '../../../shared/src/types';

const report: EnhancedReport = {
  id: 'report-1',
  documentName: 'Risky <Contract>.txt',
  persona: 'freelancer',
  overallRiskScore: 70,
  riskLevel: 'negotiate',
  recommendation: 'Request edits before signing.',
  summary: 'Summary with <unsafe> content.',
  clauses: [
    {
      id: 'clause-1',
      title: 'Payment <Delay>',
      originalText: 'Client pays after "approval" & acceptance.',
      category: 'Payment',
      severity: 'high',
      riskExplanation: 'Payment can be delayed.',
      realWorldImpact: 'Cash flow may suffer.',
      saferRewrite: 'Pay within 15 days.',
      agentFlags: {
        legalRisk: true,
        financialRisk: true,
        adversarialTrap: false,
      },
    },
  ],
  agentMetadata: {
    clausesExtracted: 1,
    processingTimeMs: 50,
    agentsRun: [],
  },
  createdAt: '2026-05-17T00:00:00.000Z',
};

describe('reportExport', () => {
  it('escapes report content in printable HTML', () => {
    const html = buildPrintableReportHtml(report);

    expect(html).toContain('Risky &lt;Contract&gt;.txt');
    expect(html).toContain('Payment &lt;Delay&gt;');
    expect(html).toContain('Client pays after &quot;approval&quot; &amp; acceptance.');
    expect(html).not.toContain('Summary with <unsafe> content.');
  });

  it('creates a safe export filename', () => {
    expect(buildReportExportFilename(report)).toBe('lexguard-report-risky-contract.html');
  });
});
