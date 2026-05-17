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
  port: parseInt(process.env.PORT || '8080', 10),
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
    model: process.env.VERTEX_AI_MODEL || 'gemini-2.5-flash',
  },
  firestore: {
    collection: process.env.FIRESTORE_COLLECTION || 'analyses',
    reportsCollection: process.env.FIRESTORE_REPORTS_COLLECTION || 'reports',
  },
  security: {
    trustProxy: process.env.TRUST_PROXY === 'true' || process.env.K_SERVICE !== undefined,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
  },
  googleServicesReady:
    process.env.MOCK_MODE === 'true' ||
    Boolean(process.env.GOOGLE_CLOUD_PROJECT && process.env.GCS_BUCKET_NAME),
  corsOrigins: Array.from(
    new Set([
      ...DEFAULT_CORS_ORIGINS,
      ...parseCsv(process.env.CLIENT_URL),
      ...parseCsv(process.env.CORS_ORIGINS),
    ]),
  ),
};
