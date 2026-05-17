import { v4 as uuidv4 } from 'uuid';
import {
  AnalysisResult,
  EnhancedReport,
  HistoryItem,
  Persona,
} from '../../../shared/src/types';

const inMemoryAnalyses: AnalysisResult[] = [];
const inMemoryReports: EnhancedReport[] = [];

export const MOCK_ANALYSES = inMemoryAnalyses;
export const MOCK_HISTORY: HistoryItem[] = [];
export const MOCK_ENHANCED_REPORTS = inMemoryReports;

export function getMockAnalysis(id: string): AnalysisResult | undefined {
  return inMemoryAnalyses.find((analysis) => analysis.id === id);
}

export function generateMockAnalysis(
  documentName: string,
  persona: string,
): AnalysisResult {
  const result: AnalysisResult = {
    id: `mock-${uuidv4()}`,
    documentName,
    persona: persona as AnalysisResult['persona'],
    riskScore: 0,
    recommendation: 'safe',
    summary:
      'Mock mode is enabled, so no preloaded analysis was generated. Disable mock mode to run Vertex AI Gemini.',
    keyFindings: [],
    riskyClauses: [],
    createdAt: new Date().toISOString(),
  };

  inMemoryAnalyses.unshift(result);
  return result;
}

export function generateMockEnhancedReport(
  documentName: string,
  persona: Persona,
  _documentText: string,
  userId?: string,
): EnhancedReport {
  return {
    id: `mock-report-${uuidv4()}`,
    userId,
    documentName,
    persona,
    overallRiskScore: 0,
    riskLevel: 'safe',
    recommendation:
      'Mock mode is enabled, so no preloaded clauses were generated. Disable mock mode to run Vertex AI Gemini analysis.',
    summary:
      'This report was created in mock mode without seeded data. The uploaded document was accepted and the report record was created in memory.',
    clauses: [],
    agentMetadata: {
      clausesExtracted: 0,
      processingTimeMs: 0,
      agentsRun: [],
    },
    createdAt: new Date().toISOString(),
  };
}

export function saveMockEnhancedReport(report: EnhancedReport): void {
  const existingIndex = inMemoryReports.findIndex((item) => item.id === report.id);
  if (existingIndex >= 0) {
    inMemoryReports[existingIndex] = report;
    return;
  }

  inMemoryReports.unshift(report);
}

export function getMockEnhancedReport(id: string): EnhancedReport | undefined {
  return inMemoryReports.find((report) => report.id === id);
}

export function listMockEnhancedReports(userId?: string): Array<
  Pick<EnhancedReport, 'id' | 'userId' | 'documentName' | 'persona' | 'overallRiskScore' | 'riskLevel' | 'recommendation' | 'createdAt'>
> {
  return inMemoryReports
    .filter((report) => !userId || report.userId === userId)
    .map((report) => ({
      id: report.id,
      userId: report.userId,
      documentName: report.documentName,
      persona: report.persona,
      overallRiskScore: report.overallRiskScore,
      riskLevel: report.riskLevel,
      recommendation: report.recommendation,
      createdAt: report.createdAt,
    }));
}
