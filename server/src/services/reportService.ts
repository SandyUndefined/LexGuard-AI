import { config } from '../config';
import { ApiError } from '../errors';
import {
  getMockEnhancedReport,
  listMockEnhancedReports,
  saveMockEnhancedReport,
  generateMockEnhancedReport,
} from '../mock/mockData';
import { analyzeTextWithVertexGemini } from './aiAnalysis';
import { getReport, listReports, saveReport } from './firestore';
import type { EnhancedReport, Persona } from '../../../shared/src/types';

interface CreateReportInput {
  documentText: string;
  persona: Persona;
  userId?: string;
  documentName?: string;
  documentUrl?: string;
}

export async function createReportFromText({
  documentText,
  persona,
  userId,
  documentName,
  documentUrl,
}: CreateReportInput): Promise<EnhancedReport> {
  const cleanText = documentText.trim();
  if (!cleanText) {
    throw new ApiError(400, 'Document text cannot be empty.');
  }

  const cleanDocumentName = documentName?.trim() || 'Pasted contract text';

  if (config.mockMode) {
    const report = generateMockEnhancedReport(cleanDocumentName, persona, cleanText, userId);
    saveMockEnhancedReport(report);
    return report;
  }

  const report = await analyzeTextWithVertexGemini({
    documentText: cleanText,
    documentName: cleanDocumentName,
    persona,
    userId,
    documentUrl,
  });

  await saveReport(report);
  return report;
}

export async function getReportById(id: string): Promise<EnhancedReport | null> {
  if (config.mockMode) {
    return getMockEnhancedReport(id) ?? null;
  }

  return getReport(id);
}

export async function listReportSummaries(userId?: string): Promise<
  Array<Pick<EnhancedReport, 'id' | 'userId' | 'documentName' | 'persona' | 'overallRiskScore' | 'riskLevel' | 'recommendation' | 'createdAt'>>
> {
  if (config.mockMode) {
    return listMockEnhancedReports(userId);
  }

  return listReports(50, userId);
}
