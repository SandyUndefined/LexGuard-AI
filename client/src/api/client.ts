import axios from 'axios';
import type {
  AnalyzeResponse,
  HistoryResponse,
  HistoryDetailResponse,
  Persona,
} from '@lexguard/shared';

const BASE_URL = '/api';

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2 min for AI analysis
});

// ─── Analyze ──────────────────────────────────────────────────────────────────

export async function analyzeDocument(
  file: File,
  persona: Persona,
  onUploadProgress?: (pct: number) => void,
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('persona', persona);

  const response = await http.post<AnalyzeResponse>('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (evt.total && onUploadProgress) {
        onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    },
  });

  return response.data;
}

// ─── History ─────────────────────────────────────────────────────────────────

export async function fetchHistory(): Promise<HistoryResponse> {
  const response = await http.get<HistoryResponse>('/history');
  return response.data;
}

export async function fetchAnalysisById(id: string): Promise<HistoryDetailResponse> {
  const response = await http.get<HistoryDetailResponse>(`/history/${id}`);
  return response.data;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string; mockMode: boolean }> {
  const response = await http.get('/health'.replace('/api', ''));
  return response.data;
}
