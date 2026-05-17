import { VertexAI } from '@google-cloud/vertexai';
import { config } from '../config';
import { AnalysisResult, Persona, RiskyClause, RiskLevel } from '../../../shared/src/types';
import { v4 as uuidv4 } from 'uuid';

let vertexAI: VertexAI | null = null;

function getVertexAI(): VertexAI {
  if (!vertexAI) {
    vertexAI = new VertexAI({
      project: config.gcp.project,
      location: config.vertexAI.location,
    });
  }
  return vertexAI;
}

function buildSystemPrompt(persona: Persona): string {
  const personaDescriptions: Record<Persona, string> = {
    employee:
      'an employee reviewing an employment contract, NDA, or workplace agreement',
    freelancer:
      'a freelancer or independent contractor reviewing a service agreement or project contract',
    customer:
      'a customer or consumer reviewing terms of service, purchase agreements, or warranties',
    tenant:
      'a tenant reviewing a lease agreement, rental contract, or housing agreement',
    vendor:
      'a vendor or supplier reviewing a supplier contract, SLA, or procurement agreement',
  };

  return `You are LexGuard AI, an expert legal document analyzer. You are analyzing a contract from the perspective of ${personaDescriptions[persona]}.

Your role is to:
1. Identify clauses that could be disadvantageous, unfair, or risky for the ${persona}
2. Explain risks in plain English (no legal jargon)
3. Suggest specific, safer alternative wording
4. Provide an overall risk assessment

Be thorough but practical. Focus on real risks, not theoretical ones.`;
}

function buildAnalysisPrompt(documentText: string, persona: Persona): string {
  return `${buildSystemPrompt(persona)}

Please analyze the following contract document and return a JSON response in exactly this format:

{
  "summary": "2-3 sentence plain English summary of the overall document and main concerns",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "riskScore": 65,
  "recommendation": "negotiate",
  "riskyClauses": [
    {
      "clause": "exact problematic text from the document",
      "risk": "plain English explanation of why this is risky",
      "suggestion": "specific safer alternative wording",
      "severity": "high",
      "category": "category name like IP Rights, Termination, Payment, etc"
    }
  ]
}

Rules:
- riskScore: 0-100 (0=perfectly safe, 100=extremely dangerous)
- recommendation: must be exactly "safe" (score 0-35), "negotiate" (score 36-65), or "avoid" (score 66-100)
- severity: must be "low", "medium", or "high"
- Include 3-8 risky clauses. If genuinely safe, include fewer
- Return ONLY valid JSON, no markdown, no explanation outside JSON

CONTRACT TO ANALYZE:
---
${documentText}
---`;
}

interface GeminiAnalysisResponse {
  summary: string;
  keyFindings: string[];
  riskScore: number;
  recommendation: RiskLevel;
  riskyClauses: Array<{
    clause: string;
    risk: string;
    suggestion: string;
    severity: 'low' | 'medium' | 'high';
    category: string;
  }>;
}

export async function analyzeDocumentWithGemini(
  documentText: string,
  documentName: string,
  persona: Persona,
  documentUrl?: string,
): Promise<AnalysisResult> {
  const vertex = getVertexAI();
  const model = vertex.preview.getGenerativeModel({
    model: config.vertexAI.model,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  const prompt = buildAnalysisPrompt(documentText, persona);

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const responseText =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Clean up potential markdown code fences
  const jsonText = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed: GeminiAnalysisResponse;
  try {
    parsed = JSON.parse(jsonText) as GeminiAnalysisResponse;
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON: ${jsonText.slice(0, 200)}`);
  }

  const riskyClauses: RiskyClause[] = parsed.riskyClauses.map((c) => ({
    id: uuidv4(),
    clause: c.clause,
    risk: c.risk,
    suggestion: c.suggestion,
    severity: c.severity,
    category: c.category,
  }));

  const analysisResult: AnalysisResult = {
    id: uuidv4(),
    documentName,
    documentUrl,
    persona,
    riskScore: Math.max(0, Math.min(100, parsed.riskScore)),
    recommendation: parsed.recommendation,
    riskyClauses,
    summary: parsed.summary,
    keyFindings: parsed.keyFindings || [],
    createdAt: new Date().toISOString(),
  };

  return analysisResult;
}
