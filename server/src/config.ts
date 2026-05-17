import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
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
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
