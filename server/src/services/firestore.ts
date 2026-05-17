import * as admin from 'firebase-admin';
import { config } from '../config';
import { AnalysisResult, EnhancedReport, HistoryItem } from '../../../shared/src/types';

/**
 * Recursively removes all undefined values from an object or array.
 */
function sanitize<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(sanitize).filter((v) => v !== undefined) as unknown as T;
  } else if (obj && typeof obj === 'object') {
    return Object.entries(obj)
      .reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = sanitize(value);
        }
        return acc;
      }, {} as any);
  }
  return obj;
}

let db: admin.firestore.Firestore | null = null;

function getDb(): admin.firestore.Firestore {
  if (!db) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: config.gcp.project,
      });
    }
    db = admin.firestore();
  }
  return db;
}

export async function saveAnalysis(result: AnalysisResult): Promise<void> {
  const firestore = getDb();
  // Only add userId fallback if userId exists on result
  let safeResult: AnalysisResult | (AnalysisResult & { userId: string });
  if ('userId' in result) {
    safeResult = {
      ...result,
      userId: (result as any).userId || "anonymous",
    };
  } else {
    safeResult = result;
  }
  await firestore
    .collection(config.firestore.collection)
    .doc(safeResult.id)
    .set(sanitize(safeResult));
}

export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  const firestore = getDb();
  const doc = await firestore
    .collection(config.firestore.collection)
    .doc(id)
    .get();
  if (!doc.exists) return null;
  return doc.data() as AnalysisResult;
}

export async function listAnalyses(limit = 20): Promise<HistoryItem[]> {
  const firestore = getDb();
  const snapshot = await firestore
    .collection(config.firestore.collection)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as AnalysisResult;
    return {
      id: data.id,
      documentName: data.documentName,
      persona: data.persona,
      riskScore: data.riskScore,
      recommendation: data.recommendation,
      createdAt: data.createdAt,
    };
  });
}

export async function deleteAnalysis(id: string): Promise<void> {
  const firestore = getDb();
  await firestore.collection(config.firestore.collection).doc(id).delete();
}

export async function saveReport(report: EnhancedReport): Promise<void> {
  const firestore = getDb();
  // Ensure userId fallback and sanitize before writing
  const safeReport = {
    ...report,
    userId: report.userId || "anonymous",
  };
  await firestore
    .collection(config.firestore.reportsCollection)
    .doc(safeReport.id)
    .set(sanitize(safeReport));
}

export async function getReport(id: string): Promise<EnhancedReport | null> {
  const firestore = getDb();
  const doc = await firestore
    .collection(config.firestore.reportsCollection)
    .doc(id)
    .get();

  if (!doc.exists) return null;
  return doc.data() as EnhancedReport;
}

export async function listReports(
  limit = 20,
  userId?: string,
): Promise<
  Array<Pick<EnhancedReport, 'id' | 'userId' | 'documentName' | 'persona' | 'overallRiskScore' | 'riskLevel' | 'recommendation' | 'createdAt'>>
> {
  const firestore = getDb();
  let query: admin.firestore.Query = firestore.collection(config.firestore.reportsCollection);

  if (userId) {
    query = query.where('userId', '==', userId);
  }

  const snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as EnhancedReport;
    return {
      id: data.id,
      userId: data.userId,
      documentName: data.documentName,
      persona: data.persona,
      overallRiskScore: data.overallRiskScore,
      riskLevel: data.riskLevel,
      recommendation: data.recommendation,
      createdAt: data.createdAt,
    };
  });
}
