import {
  AnalysisResult,
  EnhancedReport,
  HistoryItem,
  Persona,
} from '../../../shared/src/types';
import { ENHANCED_ANALYSIS_AGENT_NAMES } from '../services/aiAnalysis';
import { scoreClauses } from '../services/riskScoring';

// ─── Realistic mock data for development without GCP credentials ──────────────

export const MOCK_ANALYSES: AnalysisResult[] = [
  {
    id: 'mock-001',
    documentName: 'Employment_Contract_TechCorp.pdf',
    documentUrl: undefined,
    persona: 'employee',
    riskScore: 74,
    recommendation: 'negotiate',
    summary:
      'This employment contract contains several clauses that heavily favor the employer, particularly around intellectual property assignment, non-compete scope, and termination provisions. While not immediately dangerous, negotiation on key points is strongly advised before signing.',
    keyFindings: [
      'Broad IP assignment covers work done on personal time',
      'Non-compete clause is geographically and temporally excessive (3 years, global)',
      'At-will termination with only 2-week severance',
      'Mandatory arbitration waives your right to jury trial',
      'Garden leave clause may delay your next job',
    ],
    riskyClauses: [
      {
        id: 'clause-001',
        clause:
          'Employee hereby assigns to Company all right, title, and interest in any inventions, works, discoveries, or improvements made during the period of employment, including work done outside normal working hours.',
        risk: 'This clause claims ownership of everything you create — even personal projects done at home on weekends — as long as they are even tangentially related to the company\'s business.',
        suggestion:
          'Employee assigns to Company all inventions made during normal working hours using Company resources that directly relate to Company\'s current business. Work created entirely on personal time without Company resources is excluded.',
        severity: 'high',
        category: 'Intellectual Property',
      },
      {
        id: 'clause-002',
        clause:
          'For a period of 36 months following termination of employment, Employee shall not engage in any business activity that competes with Company in any geographic region where Company conducts or plans to conduct business.',
        risk: 'A 3-year global non-compete is likely unenforceable but can still cost you money in legal fees. The phrase "plans to conduct business" is especially dangerous — it has no geographical limit.',
        suggestion:
          'For a period of 12 months following termination, Employee shall not directly compete with Company\'s current core products in regions where Employee actively worked. This clause does not restrict general employment in the industry.',
        severity: 'high',
        category: 'Non-Compete',
      },
      {
        id: 'clause-003',
        clause:
          'Any disputes arising out of this agreement shall be resolved exclusively through binding arbitration. Employee waives the right to participate in any class action lawsuit.',
        risk: 'Mandatory arbitration means you cannot sue in court, cannot join class actions, and the process tends to favor employers who use the same arbitration service repeatedly.',
        suggestion:
          'Disputes shall first be attempted through mediation. If unresolved, either party may choose arbitration or litigation in the state courts of [State]. Class action rights are preserved.',
        severity: 'medium',
        category: 'Dispute Resolution',
      },
      {
        id: 'clause-004',
        clause:
          'Company may terminate this agreement at any time, for any reason, with or without cause, with 14 days notice.',
        risk: 'At-will termination with only 2-week notice provides minimal financial security. Most employees in this role receive 4–8 weeks.',
        suggestion:
          'After the first 90 days, Company shall provide minimum 30 days written notice (or equivalent pay in lieu) unless termination is for gross misconduct.',
        severity: 'medium',
        category: 'Termination',
      },
      {
        id: 'clause-005',
        clause:
          'Employee consents to Company monitoring all communications sent or received on Company equipment or networks, including personal email accessed on Company devices.',
        risk: 'This is very broad monitoring consent. "Personal email on Company devices" extends beyond typical employer monitoring rights.',
        suggestion:
          'Company may monitor communications sent or received using Company email accounts and systems for legitimate business purposes. Personal accounts accessed on Company devices are not subject to monitoring.',
        severity: 'low',
        category: 'Privacy',
      },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-002',
    documentName: 'Freelance_Service_Agreement.pdf',
    documentUrl: undefined,
    persona: 'freelancer',
    riskScore: 55,
    recommendation: 'negotiate',
    summary:
      'This freelance service agreement has mixed terms. Payment protections are reasonable, but the IP assignment is all-encompassing and the indemnification clause is one-sided. Negotiate IP scope and indemnification before proceeding.',
    keyFindings: [
      'Net-60 payment terms are above industry standard',
      'All IP rights transfer even for pre-existing tools and frameworks',
      'Unlimited indemnification clause for client IP claims',
      'Revision policy is unclear and could lead to scope creep',
    ],
    riskyClauses: [
      {
        id: 'clause-f-001',
        clause:
          'Freelancer assigns all intellectual property, including any pre-existing tools, code libraries, or methodologies used in the project.',
        risk: 'Assigning pre-existing IP means your reusable code and tools become theirs. You cannot use your own work on future projects.',
        suggestion:
          'Freelancer assigns IP specifically created for this project. Pre-existing tools, libraries, and methodologies remain Freelancer\'s property; Client receives a perpetual license to use them as incorporated.',
        severity: 'high',
        category: 'Intellectual Property',
      },
      {
        id: 'clause-f-002',
        clause:
          'Payment shall be due Net-60 from invoice receipt.',
        risk: 'Net-60 means you wait 2 months to be paid. Industry standard for freelancers is Net-15 to Net-30. This creates significant cash flow risk.',
        suggestion:
          'Payment shall be due Net-30 from invoice receipt, with a 2% monthly late fee applied after the due date.',
        severity: 'medium',
        category: 'Payment',
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-003',
    documentName: 'Apartment_Lease_Agreement.pdf',
    documentUrl: undefined,
    persona: 'tenant',
    riskScore: 28,
    recommendation: 'safe',
    summary:
      'This lease agreement is largely standard and tenant-friendly. The deposit terms are within legal limits, maintenance responsibilities are clearly defined, and the termination notice period is fair. Proceed with confidence.',
    keyFindings: [
      'Security deposit is within statutory limits',
      'Landlord maintenance obligations are clearly defined',
      'Proper 30-day notice required for entry',
      '60-day notice required for lease termination',
    ],
    riskyClauses: [
      {
        id: 'clause-t-001',
        clause:
          'Tenant shall be responsible for all repairs under $150.',
        risk: 'Minor repairs being tenant\'s responsibility is common, but the $150 threshold is slightly above average. Ensure this is documented clearly.',
        suggestion:
          'Tenant shall be responsible for minor repairs under $75. All other repairs are Landlord\'s responsibility. Tenant must report needed repairs within 7 days of discovery.',
        severity: 'low',
        category: 'Maintenance',
      },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_HISTORY: HistoryItem[] = MOCK_ANALYSES.map((a) => ({
  id: a.id,
  documentName: a.documentName,
  persona: a.persona,
  riskScore: a.riskScore,
  recommendation: a.recommendation,
  createdAt: a.createdAt,
}));

export function getMockAnalysis(id: string): AnalysisResult | undefined {
  return MOCK_ANALYSES.find((a) => a.id === id);
}

export function generateMockAnalysis(
  documentName: string,
  persona: string,
): AnalysisResult {
  const template = MOCK_ANALYSES[0];
  return {
    ...template,
    id: `mock-${Date.now()}`,
    documentName,
    persona: persona as AnalysisResult['persona'],
    createdAt: new Date().toISOString(),
  };
}

export const MOCK_ENHANCED_REPORTS: EnhancedReport[] = [
  {
    id: 'mock-report-001',
    userId: 'mock-user',
    documentName: 'Employment_Contract_TechCorp.pdf',
    persona: 'employee',
    overallRiskScore: 83,
    riskLevel: 'avoid',
    recommendation:
      'This contract poses serious risk (score: 83/100) with 1 critical clause(s). Do not sign without major revisions and legal counsel.',
    summary:
      'This agreement contains several employer-favorable clauses that could restrict future work and transfer broad rights away from the employee. The IP assignment and non-compete language should be narrowed before signing.',
    clauses: [
      {
        id: 'enhanced-clause-001',
        title: 'Broad IP Assignment',
        originalText:
          'Employee assigns all right, title, and interest in any inventions, works, discoveries, or improvements made during employment, including work done outside normal working hours.',
        category: 'Intellectual Property',
        severity: 'critical',
        riskExplanation:
          'The company could claim ownership over personal projects created outside work, even if they were not built with company resources.',
        realWorldImpact:
          'A weekend app, open-source contribution, or side project could become disputed company property.',
        saferRewrite:
          'Employee assigns only work created within the scope of employment using Company resources and directly related to Company products. Independent work created on personal time without Company resources remains Employee property.',
        agentFlags: {
          legalRisk: true,
          financialRisk: true,
          adversarialTrap: true,
        },
      },
      {
        id: 'enhanced-clause-002',
        title: 'Overbroad Non-Compete',
        originalText:
          'For 36 months after termination, Employee shall not engage in any business activity that competes with Company in any region where Company conducts or plans to conduct business.',
        category: 'Non-Compete',
        severity: 'high',
        riskExplanation:
          'The restriction is long, geographically broad, and extends to planned markets that may not be known to the employee.',
        realWorldImpact:
          'The employee could be blocked from taking a normal industry job or forced to spend money fighting the restriction.',
        saferRewrite:
          'For 6 months after termination, Employee will not solicit Company clients they directly served in the prior 12 months. This does not restrict general employment in the industry.',
        agentFlags: {
          legalRisk: true,
          financialRisk: true,
          adversarialTrap: true,
        },
      },
    ],
    agentMetadata: {
      clausesExtracted: 2,
      processingTimeMs: 1200,
      agentsRun: ENHANCED_ANALYSIS_AGENT_NAMES,
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-report-002',
    userId: 'mock-user',
    documentName: 'Freelance_Service_Agreement.txt',
    persona: 'freelancer',
    overallRiskScore: 53,
    riskLevel: 'negotiate',
    recommendation:
      'This contract has 1 clause(s) that need attention (score: 53/100). Request modifications on the flagged items before signing.',
    summary:
      'This service agreement is workable but creates payment and ownership pressure for the freelancer. The payment timeline and pre-existing IP language should be clarified before work begins.',
    clauses: [
      {
        id: 'enhanced-clause-f-001',
        title: 'Slow Payment Terms',
        originalText:
          'Client shall pay all undisputed invoices within sixty (60) days after receipt, provided Client accepts the deliverables in its sole discretion.',
        category: 'Payment',
        severity: 'medium',
        riskExplanation:
          'Payment can be delayed for two months and tied to a subjective acceptance standard controlled by the client.',
        realWorldImpact:
          'The freelancer may finish the work but wait months for cash flow, with little leverage if the client keeps requesting changes.',
        saferRewrite:
          'Client shall pay undisputed invoices within fifteen (15) days. Deliverables are deemed accepted unless Client provides specific written objections within five (5) business days.',
        agentFlags: {
          legalRisk: true,
          financialRisk: true,
          adversarialTrap: true,
        },
      },
      {
        id: 'enhanced-clause-f-002',
        title: 'Pre-Existing Tools Assignment',
        originalText:
          'Contractor assigns all intellectual property used in or related to the project, including templates, libraries, methods, and tools developed before the effective date.',
        category: 'Intellectual Property',
        severity: 'high',
        riskExplanation:
          'The clause transfers ownership of reusable materials the freelancer already had before the project.',
        realWorldImpact:
          'A freelancer could lose the right to reuse their own templates or code libraries with future clients.',
        saferRewrite:
          'Contractor assigns only project-specific deliverables created for Client. Contractor retains all pre-existing tools and grants Client a non-exclusive license to use them as embedded in the deliverables.',
        agentFlags: {
          legalRisk: true,
          financialRisk: true,
          adversarialTrap: false,
        },
      },
    ],
    agentMetadata: {
      clausesExtracted: 2,
      processingTimeMs: 980,
      agentsRun: ENHANCED_ANALYSIS_AGENT_NAMES,
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-report-003',
    userId: 'mock-user',
    documentName: 'Apartment_Lease_Sample.txt',
    persona: 'tenant',
    overallRiskScore: 23,
    riskLevel: 'safe',
    recommendation:
      'This contract appears fair and reasonable (score: 23/100). You can sign with confidence, but always read it fully yourself.',
    summary:
      'This lease is mostly balanced, with clear notice requirements and reasonable maintenance obligations. The tenant should still confirm the repair threshold and move-out inspection process.',
    clauses: [
      {
        id: 'enhanced-clause-t-001',
        title: 'Minor Repair Threshold',
        originalText:
          'Tenant is responsible for minor repairs under seventy-five dollars ($75) caused by ordinary use of the premises.',
        category: 'Maintenance',
        severity: 'low',
        riskExplanation:
          'A small repair threshold is common, but it should not include repairs caused by normal building wear or landlord-controlled systems.',
        realWorldImpact:
          'The tenant might be asked to pay for repeated small fixes that should be handled by the landlord.',
        saferRewrite:
          'Tenant is responsible only for minor repairs under $75 caused by Tenant misuse. Landlord remains responsible for ordinary wear, building systems, and code compliance.',
        agentFlags: {
          legalRisk: false,
          financialRisk: true,
          adversarialTrap: false,
        },
      },
      {
        id: 'enhanced-clause-t-002',
        title: 'Move-Out Inspection Timing',
        originalText:
          'Landlord will inspect the premises after Tenant vacates and may deduct reasonable cleaning or repair costs from the security deposit.',
        category: 'Security Deposit',
        severity: 'medium',
        riskExplanation:
          'The inspection happens after move-out, which can make it harder for the tenant to fix issues or dispute deductions.',
        realWorldImpact:
          'The tenant may lose part of the deposit for issues they could have addressed if told earlier.',
        saferRewrite:
          'Tenant may request a pre-move-out inspection at least seven (7) days before surrender. Landlord will provide an itemized list of potential deductions and a reasonable chance to cure.',
        agentFlags: {
          legalRisk: true,
          financialRisk: true,
          adversarialTrap: false,
        },
      },
    ],
    agentMetadata: {
      clausesExtracted: 2,
      processingTimeMs: 760,
      agentsRun: ENHANCED_ANALYSIS_AGENT_NAMES,
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function generateMockEnhancedReport(
  documentName: string,
  persona: Persona,
  documentText: string,
  userId?: string,
): EnhancedReport {
  const template =
    MOCK_ENHANCED_REPORTS.find((report) => report.persona === persona) ??
    MOCK_ENHANCED_REPORTS.find((report) => report.id === 'mock-report-001') ??
    MOCK_ENHANCED_REPORTS[0];
  const clauses = template.clauses.map((clause) => ({
    ...clause,
    id: `${clause.id}-${Date.now()}`,
  }));
  const scoring = scoreClauses(clauses);

  return {
    ...template,
    id: `mock-report-${Date.now()}`,
    userId,
    documentName,
    persona,
    ...scoring,
    summary:
      documentText.length > 120
        ? template.summary
        : 'The provided text is short, so this mock report uses representative contract risks. Disable mock mode to run Vertex AI Gemini on the full text.',
    clauses,
    agentMetadata: {
      ...template.agentMetadata,
      clausesExtracted: clauses.length,
      agentsRun: ENHANCED_ANALYSIS_AGENT_NAMES,
    },
    createdAt: new Date().toISOString(),
  };
}

export function saveMockEnhancedReport(report: EnhancedReport): void {
  const existingIndex = MOCK_ENHANCED_REPORTS.findIndex((item) => item.id === report.id);
  if (existingIndex >= 0) {
    MOCK_ENHANCED_REPORTS[existingIndex] = report;
    return;
  }

  MOCK_ENHANCED_REPORTS.unshift(report);
}

export function getMockEnhancedReport(id: string): EnhancedReport | undefined {
  return MOCK_ENHANCED_REPORTS.find((report) => report.id === id);
}

export function listMockEnhancedReports(userId?: string): Array<
  Pick<EnhancedReport, 'id' | 'userId' | 'documentName' | 'persona' | 'overallRiskScore' | 'riskLevel' | 'recommendation' | 'createdAt'>
> {
  return MOCK_ENHANCED_REPORTS.filter((report) => !userId || report.userId === userId).map((report) => ({
    id: report.id,
    userId: report.userId,
    documentName: report.documentName,
    persona: report.persona,
    overallRiskScore: report.overallRiskScore,
    riskLevel: report.riskLevel,
    recommendation: report.recommendation,
    createdAt: report.createdAt,
  }));
}
