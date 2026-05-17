import axios from 'axios';
import type {
  ReportDetailResponse,
  ReportsListResponse,
  UploadDocumentResponse,
  Persona,
} from '@lexguard/shared';

const BASE_URL = '/api';

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2 min for AI analysis
});

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? error.message;
  }

  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
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

  try {
    const response = await http.post<UploadDocumentResponse>('/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (evt.total && onUploadProgress) {
          onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function fetchReports(): Promise<ReportsListResponse> {
  try {
    const response = await http.get<ReportsListResponse>('/reports');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchReportById(id: string): Promise<ReportDetailResponse> {
  try {
    const response = await http.get<ReportDetailResponse>(`/reports/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export function getReportExportUrl(id: string): string {
  return `${BASE_URL}/reports/${encodeURIComponent(id)}/export`;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string; mockMode: boolean }> {
  const response = await http.get('/health'.replace('/api', ''));
  return response.data;
}
