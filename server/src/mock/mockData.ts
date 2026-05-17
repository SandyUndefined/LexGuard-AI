import { AnalysisResult, HistoryItem } from '../../../shared/src/types';

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
