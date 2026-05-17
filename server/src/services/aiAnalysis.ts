import { VertexAI } from '@google-cloud/vertexai';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { ApiError } from '../errors';
import { normaliseSeverity, scoreClauses } from './riskScoring';
import { toVertexApiError } from './vertexErrors';
import type { ClauseSeverity, EnhancedClause, EnhancedReport, Persona } from '../../../shared/src/types';

interface AnalysisAgent {
  name: string;
  role: string;
  instructions: string;
}

interface AnalyzeTextInput {
  documentText: string;
  documentName: string;
  persona: Persona;
  userId?: string;
  documentUrl?: string;
}

interface RawAgentClause {
  title?: unknown;
  originalText?: unknown;
  category?: unknown;
  severity?: unknown;
  riskExplanation?: unknown;
  realWorldImpact?: unknown;
  saferRewrite?: unknown;
  agentFlags?: {
    legalRisk?: unknown;
    financialRisk?: unknown;
    adversarialTrap?: unknown;
  };
}

interface RawAgentResponse {
  summary?: unknown;
  clauses?: unknown;
}

const ANALYSIS_AGENTS: AnalysisAgent[] = [
  {
    name: 'Clause Extractor Agent',
    role: 'Find and isolate clauses that materially affect the persona.',
    instructions:
      'Extract exact source language for each risky or important clause. Prefer complete clauses over fragments.',
  },
  {
    name: 'Legal Risk Agent',
    role: 'Evaluate legal exposure, rights given up, enforceability, and one-sided obligations.',
    instructions:
      'Flag liability, indemnity, termination, dispute resolution, IP ownership, non-compete, privacy, and waiver issues.',
  },
  {
    name: 'Financial Risk Agent',
    role: 'Evaluate financial downside and hidden economic burden.',
    instructions:
      'Flag payment delays, penalties, fees, automatic renewals, uncapped liability, refunds, deposits, and cost shifting.',
  },
  {
    name: 'Adversarial Trap Agent',
    role: 'Look for vague, asymmetric, buried, or strategically exploitable terms.',
    instructions:
      'Flag undefined discretion, unilateral changes, broad consent, silence-as-acceptance, and terms that look harmless but create leverage.',
  },
  {
    name: 'Rewrite Agent',
    role: 'Produce safer replacement wording.',
    instructions:
      'Rewrite each risky clause so it is balanced, specific, and realistic while preserving the commercial intent where possible.',
  },
];

const PERSONA_DESCRIPTIONS: Record<Persona, string> = {
  employee: 'an employee reviewing employment contracts, NDAs, non-competes, or workplace agreements',
  freelancer: 'a freelancer or independent contractor reviewing service agreements or project contracts',
  customer: 'a customer reviewing terms of service, purchase agreements, warranties, or consumer contracts',
  tenant: 'a tenant reviewing lease agreements, rental contracts, or housing agreements',
  vendor: 'a vendor or supplier reviewing supplier contracts, SLAs, or procurement agreements',
};

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

function buildAgentPrompt(documentText: string, persona: Persona): string {
  const agentInstructions = ANALYSIS_AGENTS.map(
    (agent, index) => `${index + 1}. ${agent.name}
Role: ${agent.role}
Instructions: ${agent.instructions}`,
  ).join('\n\n');

  return `You are LexGuard AI, a multi-agent legal risk analysis system.

Analyze the document from the perspective of ${PERSONA_DESCRIPTIONS[persona]}.

Run these agents in order:

${agentInstructions}

Return only valid JSON using this exact shape:
{
  "summary": "2-4 sentence plain-English summary of the main issues and negotiation posture",
  "clauses": [
    {
      "title": "Short clause title",
      "originalText": "Exact clause text from the document",
      "category": "Category such as Payment, Liability, Termination, IP Rights, Privacy, Renewal, Dispute Resolution",
      "severity": "low | medium | high | critical",
      "riskExplanation": "Plain-English explanation of why this clause is risky for the persona",
      "realWorldImpact": "Concrete scenario describing what could happen in practice",
      "saferRewrite": "Specific safer replacement wording",
      "agentFlags": {
        "legalRisk": true,
        "financialRisk": false,
        "adversarialTrap": true
      }
    }
  ]
}

Rules:
- Include only clauses that create meaningful legal, financial, operational, or bargaining risk.
- Severity must be exactly one of: low, medium, high, critical.
- If the document is mostly safe, return fewer clauses and explain that in the summary.
- Do not invent source text. If source wording is unclear, quote the closest relevant passage and explain the uncertainty.
- Keep explanations concise and useful to a non-lawyer.
- Return JSON only. Do not wrap it in markdown.

DOCUMENT:
---
${documentText}
---`;
}

function extractJson(responseText: string): string {
  const trimmed = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return trimmed;
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeClause(rawClause: RawAgentClause): EnhancedClause | null {
  const originalText = asString(rawClause.originalText);
  if (!originalText) return null;

  const severity: ClauseSeverity = normaliseSeverity(asString(rawClause.severity, 'medium'));
  const agentFlags = rawClause.agentFlags ?? {};

  return {
    id: uuidv4(),
    title: asString(rawClause.title, 'Risky Clause'),
    originalText,
    category: asString(rawClause.category, 'General'),
    severity,
    riskExplanation: asString(rawClause.riskExplanation, 'This clause may create avoidable risk.'),
    realWorldImpact: asString(
      rawClause.realWorldImpact,
      'This could create practical problems if the other party relies on this wording.',
    ),
    saferRewrite: asString(rawClause.saferRewrite, 'Request narrower, clearer, and more balanced wording.'),
    agentFlags: {
      legalRisk: asBoolean(agentFlags.legalRisk),
      financialRisk: asBoolean(agentFlags.financialRisk),
      adversarialTrap: asBoolean(agentFlags.adversarialTrap),
    },
  };
}

function parseAgentResponse(responseText: string): RawAgentResponse {
  const jsonText = extractJson(responseText);

  try {
    return JSON.parse(jsonText) as RawAgentResponse;
  } catch {
    throw new ApiError(502, `Vertex AI returned malformed JSON: ${jsonText.slice(0, 200)}`);
  }
}

export async function analyzeTextWithVertexGemini({
  documentText,
  documentName,
  persona,
  userId,
  documentUrl,
}: AnalyzeTextInput): Promise<EnhancedReport> {
  const startedAt = Date.now();
  const vertex = getVertexAI();
  const model = vertex.getGenerativeModel({
    model: config.vertexAI.model,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  const result = await model
    .generateContent({
      contents: [{ role: 'user', parts: [{ text: buildAgentPrompt(documentText, persona) }] }],
    })
    .catch((error: unknown) => {
      console.error('Vertex AI enhanced analysis failed:', error);
      throw toVertexApiError(error);
    });

  const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!responseText.trim()) {
    throw new ApiError(502, 'Vertex AI returned an empty analysis response.');
  }

  const parsed = parseAgentResponse(responseText);
  const rawClauses = Array.isArray(parsed.clauses) ? parsed.clauses : [];
  const clauses = rawClauses
    .map((rawClause) => normalizeClause(rawClause as RawAgentClause))
    .filter((clause): clause is EnhancedClause => clause !== null);

  const scoring = scoreClauses(clauses);

  return {
    id: uuidv4(),
    userId,
    documentName,
    documentUrl,
    persona,
    ...scoring,
    summary: asString(
      parsed.summary,
      clauses.length > 0
        ? 'This document contains clauses that should be reviewed before signing.'
        : 'No significant risky clauses were identified in the provided text.',
    ),
    clauses,
    agentMetadata: {
      clausesExtracted: clauses.length,
      processingTimeMs: Date.now() - startedAt,
      agentsRun: ANALYSIS_AGENTS.map((agent) => agent.name),
    },
    createdAt: new Date().toISOString(),
  };
}

export const ENHANCED_ANALYSIS_AGENT_NAMES = ANALYSIS_AGENTS.map((agent) => agent.name);
