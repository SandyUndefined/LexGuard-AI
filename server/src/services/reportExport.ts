import type { ClauseSeverity, EnhancedClause, EnhancedReport } from '../../../shared/src/types';

const SEVERITY_RANK: Record<ClauseSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getTopRiskyClauses(clauses: EnhancedClause[], limit = 5): EnhancedClause[] {
  return [...clauses]
    .sort((a, b) => {
      const severityDelta = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
      if (severityDelta !== 0) return severityDelta;
      return a.title.localeCompare(b.title);
    })
    .slice(0, limit);
}

function renderClause(clause: EnhancedClause, index: number): string {
  return `
    <article class="clause">
      <div class="clause-header">
        <h3>${index + 1}. ${escapeHtml(clause.title)}</h3>
        <span class="severity severity-${escapeHtml(clause.severity)}">${escapeHtml(formatLabel(clause.severity))}</span>
      </div>
      <p class="category">${escapeHtml(clause.category)}</p>
      <section>
        <h4>Original clause</h4>
        <p>${escapeHtml(clause.originalText)}</p>
      </section>
      <section>
        <h4>Why it matters</h4>
        <p>${escapeHtml(clause.riskExplanation)}</p>
      </section>
      <section>
        <h4>Real-world impact</h4>
        <p>${escapeHtml(clause.realWorldImpact)}</p>
      </section>
      <section>
        <h4>Safer rewrite</h4>
        <p>${escapeHtml(clause.saferRewrite)}</p>
      </section>
    </article>
  `;
}

export function buildPrintableReportHtml(report: EnhancedReport): string {
  const topClauses = getTopRiskyClauses(report.clauses);
  const clausesHtml =
    topClauses.length > 0
      ? topClauses.map((clause, index) => renderClause(clause, index)).join('\n')
      : '<p class="empty">No risky clauses were identified for this report.</p>';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LexGuard Report - ${escapeHtml(report.documentName)}</title>
  <style>
    :root {
      color: #172033;
      background: #f5f7fb;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.5;
    }

    body {
      margin: 0;
      background: #f5f7fb;
    }

    main {
      max-width: 920px;
      margin: 0 auto;
      padding: 32px 24px 48px;
    }

    header {
      border-bottom: 3px solid #172033;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    h1, h2, h3, h4, p {
      margin-top: 0;
    }

    h1 {
      font-size: 32px;
      margin-bottom: 8px;
    }

    h2 {
      font-size: 22px;
      margin: 32px 0 16px;
    }

    h3 {
      font-size: 18px;
      margin-bottom: 0;
    }

    h4 {
      font-size: 13px;
      letter-spacing: 0;
      margin-bottom: 4px;
      text-transform: uppercase;
      color: #526070;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin: 24px 0;
    }

    .meta-item,
    .summary,
    .clause {
      background: #ffffff;
      border: 1px solid #d9e0ea;
      border-radius: 8px;
      padding: 16px;
    }

    .label {
      color: #526070;
      display: block;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .value {
      font-size: 18px;
      font-weight: 700;
    }

    .risk-score {
      font-size: 28px;
    }

    .risk-level {
      color: #ffffff;
      display: inline-block;
      border-radius: 999px;
      padding: 4px 10px;
      background: #526070;
    }

    .risk-level-safe {
      background: #047857;
    }

    .risk-level-negotiate {
      background: #b45309;
    }

    .risk-level-avoid {
      background: #b91c1c;
    }

    .clause {
      break-inside: avoid;
      margin-bottom: 16px;
    }

    .clause-header {
      align-items: center;
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .category {
      color: #526070;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .severity {
      border-radius: 999px;
      color: #ffffff;
      flex: 0 0 auto;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 8px;
    }

    .severity-low {
      background: #0284c7;
    }

    .severity-medium {
      background: #b45309;
    }

    .severity-high {
      background: #b91c1c;
    }

    .severity-critical {
      background: #581c87;
    }

    .empty {
      color: #526070;
      font-style: italic;
    }

    @media print {
      body,
      main {
        background: #ffffff;
      }

      main {
        max-width: none;
        padding: 0;
      }

      .meta-item,
      .summary,
      .clause {
        border-color: #aab4c0;
      }
    }

    @media (max-width: 640px) {
      main {
        padding: 20px 14px 32px;
      }

      .meta-grid {
        grid-template-columns: 1fr;
      }

      .clause-header {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>LexGuard Report</h1>
      <p>Generated ${escapeHtml(formatDate(new Date().toISOString()))}</p>
    </header>

    <section class="meta-grid" aria-label="Report details">
      <div class="meta-item">
        <span class="label">Document</span>
        <span class="value">${escapeHtml(report.documentName)}</span>
      </div>
      <div class="meta-item">
        <span class="label">Persona</span>
        <span class="value">${escapeHtml(formatLabel(report.persona))}</span>
      </div>
      <div class="meta-item">
        <span class="label">Risk score</span>
        <span class="value risk-score">${report.overallRiskScore}/100</span>
      </div>
      <div class="meta-item">
        <span class="label">Risk level</span>
        <span class="value risk-level risk-level-${escapeHtml(report.riskLevel)}">${escapeHtml(formatLabel(report.riskLevel))}</span>
      </div>
    </section>

    <section class="summary">
      <h2>Recommendation</h2>
      <p>${escapeHtml(report.recommendation)}</p>
      <h2>Summary</h2>
      <p>${escapeHtml(report.summary)}</p>
    </section>

    <section>
      <h2>Top Risky Clauses</h2>
      ${clausesHtml}
    </section>
  </main>
</body>
</html>`;
}

export function buildReportExportFilename(report: EnhancedReport): string {
  const baseName = report.documentName
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return `lexguard-report-${baseName || report.id}.html`;
}
