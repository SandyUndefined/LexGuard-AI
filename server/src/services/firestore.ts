import * as admin from 'firebase-admin';
import { config } from '../config';
import { AnalysisResult, EnhancedReport, HistoryItem } from '../../../shared/src/types';

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
  await firestore
    .collection(config.firestore.collection)
    .doc(result.id)
    .set(result);
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
  await firestore
    .collection(config.firestore.reportsCollection)
    .doc(report.id)
    .set(report);
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
