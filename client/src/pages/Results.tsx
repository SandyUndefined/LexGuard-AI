import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { fetchReportById, getReportExportUrl } from '../api/client';
import { PERSONA_META } from '@lexguard/shared';
import type { EnhancedReport } from '@lexguard/shared';
import RiskScoreCard from '../components/RiskScoreCard';
import ClauseCard from '../components/ClauseCard';
import RecommendationBadge from '../components/RecommendationBadge';

type LoadState = 'loading' | 'loaded' | 'error';

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState<EnhancedReport | null>(
    (location.state as { report?: EnhancedReport })?.report ?? null,
  );
  const [loadState, setLoadState] = useState<LoadState>(result ? 'loaded' : 'loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (result || !id) return;

    fetchReportById(id)
      .then((response) => {
        setResult(response.report);
        setLoadState('loaded');
      })
      .catch((err) => {
        setError(err.message || 'Failed to load report.');
        setLoadState('error');
      });
  }, [id, result]);

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-xl px-4">
          {[100, 72, 88, 64].map((w, i) => (
            <div
              key={i}
              className="h-16 rounded-xl shimmer"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (loadState === 'error' || !result) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="glass-card p-8 sm:p-10 text-center max-w-md">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Report not found</h2>
          <p className="text-white/50 text-sm mb-6">
            {error || 'This report may have expired or been removed.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/analyze')} className="btn-primary justify-center">
              New Analysis
            </button>
            <button onClick={() => navigate('/history')} className="btn-secondary justify-center">
              View Samples
            </button>
          </div>
        </div>
      </div>
    );
  }

  const persona = PERSONA_META.find((p) => p.id === result.persona);
  const criticalClauses = result.clauses.filter((c) => c.severity === 'critical').length;
  const highClauses = result.clauses.filter((c) => c.severity === 'high').length;
  const mediumClauses = result.clauses.filter((c) => c.severity === 'medium').length;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'LexGuard Report', text: result.documentName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      await navigator.clipboard?.writeText(url).catch(() => undefined);
    }
  };

  const handleExport = () => {
    window.open(getReportExportUrl(result.id), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 sm:pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="btn-secondary text-xs px-4 py-2 gap-1.5">
              <Share2 size={13} />
              Share
            </button>
            <button onClick={handleExport} className="btn-primary text-xs px-4 py-2 gap-1.5">
              <Download size={13} />
              Export Report
            </button>
          </div>
        </div>

        <div className="mb-6 animate-slide-up">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <FileText size={12} className="text-white/40" />
              <span className="text-white/60">{result.documentName}</span>
            </div>
            {persona && (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span>{persona.icon}</span>
                <span className="text-white/60">{persona.label}</span>
              </div>
            )}
            <span className="text-white/25 text-xs">
              {new Date(result.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Contract Analysis</h1>
        </div>

        <div className="space-y-6">
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <RiskScoreCard
              score={result.overallRiskScore}
              recommendation={result.riskLevel}
              documentName={result.documentName}
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <RecommendationBadge recommendation={result.riskLevel} large />
            <div
              className="mt-3 rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-white/70 text-sm leading-relaxed">{result.recommendation}</p>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <span>📋</span> Plain-English Summary
            </h2>
            <p className="text-white/65 text-sm leading-relaxed mb-5">{result.summary}</p>

            {result.clauses.length > 0 && (
              <div>
                <p className="section-label mb-3">Key Findings</p>
                <ul className="space-y-2">
                  {result.clauses.slice(0, 3).map((clause) => (
                    <li key={clause.id} className="flex items-start gap-2.5 text-sm text-white/65">
                      <ChevronRight size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white/80">{clause.title}:</strong> {clause.riskExplanation}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-slide-up"
            style={{ animationDelay: '300ms' }}
          >
            {[
              { label: 'Total Clauses', value: result.clauses.length, color: '#6366f1' },
              { label: 'Critical', value: criticalClauses, color: '#a855f7' },
              { label: 'High Risk', value: highClauses, color: '#ef4444' },
              { label: 'Needs Review', value: mediumClauses, color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <p className="text-2xl font-black mb-0.5" style={{ color }}>{value}</p>
                <p className="text-white/40 text-xs">{label}</p>
              </div>
            ))}
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                <span>⚠️</span>
                Risky Clauses
                <span
                  className="text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {result.clauses.length} found
                </span>
              </h2>
            </div>

            {result.clauses.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <CheckCircle size={32} className="text-safe mx-auto mb-3" />
                <p className="text-white font-semibold">No significant risks found</p>
                <p className="text-white/40 text-sm mt-1">This contract appears to have standard, fair terms.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.clauses.map((clause, i) => (
                  <ClauseCard key={clause.id} clause={clause} index={i} />
                ))}
              </div>
            )}
          </div>

          <div
            className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between animate-slide-up"
            style={{ animationDelay: '400ms' }}
          >
            <div>
              <p className="text-white font-semibold">Ready to share this report?</p>
              <p className="text-white/40 text-sm mt-1">
                Export opens a printable HTML report that can be saved as PDF from the browser.
              </p>
            </div>
            <button onClick={handleExport} className="btn-primary justify-center text-sm">
              <Download size={15} />
              Export Report
            </button>
          </div>

          <div
            className="px-5 py-4 rounded-2xl animate-fade-in"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-white/25 text-xs leading-relaxed">
              ⚖️ <strong className="text-white/35">Disclaimer:</strong> LexGuard AI provides general information for educational
              purposes only. This is not legal advice. For important contracts, always consult a qualified attorney.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
