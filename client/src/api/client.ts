import type {
  ReportDetailResponse,
  ReportsListResponse,
  UploadDocumentResponse,
  Persona,
} from '@lexguard/shared';
import { buildApiUrl } from './config';
import { apiFetch } from './fetchClient';

export interface HealthResponse {
  status: 'ok';
  service: string;
}

// ─── Analyze ──────────────────────────────────────────────────────────────────

export async function uploadDocumentForAnalysis(
  file: File,
  persona: Persona,
  onUploadProgress?: (pct: number) => void,
): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('persona', persona);

  onUploadProgress?.(10);

  const response = await apiFetch<UploadDocumentResponse>('/api/upload-document', {
    method: 'POST',
    body: formData,
  });

  onUploadProgress?.(100);
  return response;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function fetchReports(): Promise<ReportsListResponse> {
  return apiFetch<ReportsListResponse>('/api/reports');
}

export async function fetchReportById(id: string): Promise<ReportDetailResponse> {
  return apiFetch<ReportDetailResponse>(`/api/reports/${encodeURIComponent(id)}`);
}

export function getReportExportUrl(id: string): string {
  return buildApiUrl(`/api/reports/${encodeURIComponent(id)}/export`);
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health', { timeoutMs: 10_000 });
}
