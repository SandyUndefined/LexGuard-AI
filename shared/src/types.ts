// ─── Enums & Literals ──────────────────────────────────────────────────────────

export type Persona = 'employee' | 'freelancer' | 'customer' | 'tenant' | 'vendor';

export type RiskLevel = 'safe' | 'negotiate' | 'avoid';

/** Original 3-tier severity (legacy routes) */
export type Severity = 'low' | 'medium' | 'high';

/** Extended 4-tier severity used by the enhanced agent pipeline */
export type ClauseSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FileType = 'pdf' | 'image' | 'text';

// ─── Severity Scoring Weights ───────────────────────────────────────────────────
export const SEVERITY_WEIGHTS: Record<ClauseSeverity, number> = {
  low: 10,
  medium: 35,
  high: 70,
  critical: 95,
};

// ─── Core Domain Types ──────────────────────────────────────────────────────────

export interface RiskyClause {
  id: string;
  clause: string;           // The original clause text
  risk: string;             // Why this is risky
  suggestion: string;       // Safer alternative wording
  severity: Severity;
  category: string;         // e.g. "Termination", "Liability", "IP Rights"
}

export interface AnalysisResult {
  id: string;
  documentName: string;
  documentUrl?: string;     // GCS URL
  persona: Persona;
  riskScore: number;        // 0–100
  recommendation: RiskLevel;
  riskyClauses: RiskyClause[];
  summary: string;          // 2–3 sentence plain-English summary
  keyFindings: string[];    // Bullet point findings
  createdAt: string;        // ISO 8601
}

export interface HistoryItem {
  id: string;
  documentName: string;
  persona: Persona;
  riskScore: number;
  recommendation: RiskLevel;
  createdAt: string;
}

// ─── API Request/Response Types ─────────────────────────────────────────────────

export interface AnalyzeRequest {
  persona: Persona;
  // file is multipart — not typed here
}

export interface AnalyzeResponse {
  success: boolean;
  result: AnalysisResult;
}

export interface HistoryResponse {
  success: boolean;
  items: HistoryItem[];
}

export interface HistoryDetailResponse {
  success: boolean;
  result: AnalysisResult;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

// ─── Enhanced Clause (5-Agent Pipeline) ────────────────────────────────────────

export interface EnhancedClause {
  id: string;
  title: string;            // Short human-readable name, e.g. "Broad IP Assignment"
  originalText: string;     // Verbatim clause text
  category: string;         // e.g. "Intellectual Property", "Termination"
  severity: ClauseSeverity;
  riskExplanation: string;  // Plain English: why it's risky
  realWorldImpact: string;  // Concrete scenario: what could actually happen
  saferRewrite: string;     // Specific safer alternative wording
  agentFlags: {
    legalRisk: boolean;       // Flagged by Legal Risk Agent
    financialRisk: boolean;   // Flagged by Financial Risk Agent
    adversarialTrap: boolean; // Flagged by Adversarial Trap Agent
  };
}

export interface EnhancedReport {
  id: string;
  userId?: string;
  documentName: string;
  documentUrl?: string;
  persona: Persona;
  overallRiskScore: number;   // 0–100
  riskLevel: RiskLevel;       // 'safe' | 'negotiate' | 'avoid'
  recommendation: string;     // Human-readable recommendation sentence
  summary: string;
  clauses: EnhancedClause[];
  agentMetadata: {
    clausesExtracted: number;
    processingTimeMs: number;
    agentsRun: string[];
  };
  createdAt: string;
}

// ─── Enhanced API Request/Response ─────────────────────────────────────────────

export interface AnalyzeTextRequest {
  text: string;    // Raw document text
  persona: Persona;
  documentName?: string;
  userId?: string;
}

export interface AnalyzeTextResponse {
  success: true;
  report: EnhancedReport;
}

export interface UploadDocumentResponse {
  success: true;
  report: EnhancedReport;
}

export interface ReportsListResponse {
  success: true;
  reports: Array<Pick<EnhancedReport, 'id' | 'userId' | 'documentName' | 'persona' | 'overallRiskScore' | 'riskLevel' | 'recommendation' | 'createdAt'>>;
}

export interface ReportDetailResponse {
  success: true;
  report: EnhancedReport;
}

// ─── UI State Types ──────────────────────────────────────────────────────────────

export type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

export interface AnalysisState {
  status: AnalysisStatus;
  progress: number;          // 0–100 for loading bar
  progressLabel: string;
  result: AnalysisResult | null;
  error: string | null;
}

// ─── Persona Metadata ────────────────────────────────────────────────────────────

export interface PersonaMeta {
  id: Persona;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export const PERSONA_META: PersonaMeta[] = [
  {
    id: 'employee',
    label: 'Employee',
    icon: '👔',
    description: 'Employment contracts, NDAs, non-competes',
    color: 'indigo',
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    icon: '💻',
    description: 'Service agreements, IP ownership, payment terms',
    color: 'violet',
  },
  {
    id: 'customer',
    label: 'Customer',
    icon: '🛍️',
    description: 'Terms of service, purchase agreements, warranties',
    color: 'cyan',
  },
  {
    id: 'tenant',
    label: 'Tenant',
    icon: '🏠',
    description: 'Lease agreements, rental terms, deposits',
    color: 'emerald',
  },
  {
    id: 'vendor',
    label: 'Vendor',
    icon: '📦',
    description: 'Supplier contracts, SLAs, delivery terms',
    color: 'amber',
  },
];

export const RISK_COLORS: Record<RiskLevel, string> = {
  safe: '#10b981',
  negotiate: '#f59e0b',
  avoid: '#ef4444',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: '#06b6d4',
  medium: '#f59e0b',
  high: '#ef4444',
};
