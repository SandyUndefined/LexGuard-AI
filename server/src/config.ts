import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'https://lex-guard-ai-eight.vercel.app',
];

function parseCsv(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mockMode: process.env.MOCK_MODE === 'true',
  gcp: {
    project: process.env.GOOGLE_CLOUD_PROJECT || '',
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  },
  gcs: {
    bucketName: process.env.GCS_BUCKET_NAME || 'lexguard-documents',
  },
  vertexAI: {
    location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    model: process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro',
  },
  firestore: {
    collection: process.env.FIRESTORE_COLLECTION || 'analyses',
    reportsCollection: process.env.FIRESTORE_REPORTS_COLLECTION || 'reports',
  },
  corsOrigins: Array.from(
    new Set([
      ...DEFAULT_CORS_ORIGINS,
      ...parseCsv(process.env.CLIENT_URL),
      ...parseCsv(process.env.CORS_ORIGINS),
    ]),
  ),
};
