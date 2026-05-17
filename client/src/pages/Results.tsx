import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, ChevronRight, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { fetchAnalysisById } from '../api/client';
import { PERSONA_META } from '@lexguard/shared';
import type { AnalysisResult } from '@lexguard/shared';
import RiskScoreCard from '../components/RiskScoreCard';
import ClauseCard from '../components/ClauseCard';
import RecommendationBadge from '../components/RecommendationBadge';

type LoadState = 'loading' | 'loaded' | 'error';

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState<AnalysisResult | null>(
    (location.state as { result?: AnalysisResult })?.result ?? null,
  );
  const [loadState, setLoadState] = useState<LoadState>(result ? 'loaded' : 'loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (result || !id) return;
    fetchAnalysisById(id)
      .then((r) => {
        setResult(r.result);
        setLoadState('loaded');
      })
      .catch((e) => {
        setError(e.message || 'Failed to load analysis.');
        setLoadState('error');
      });
  }, [id, result]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-xl px-4">
          {[80, 60, 100, 70].map((w, i) => (
            <div
              key={i}
              className="h-16 rounded-2xl shimmer"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (loadState === 'error' || !result) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Results not found</h2>
          <p className="text-white/50 text-sm mb-6">{error || 'This analysis may have expired or been removed.'}</p>
          <button onClick={() => navigate('/history')} className="btn-primary">
            View History
          </button>
        </div>
      </div>
    );
  }

  const persona = PERSONA_META.find((p) => p.id === result.persona);
  const highClauses = result.riskyClauses.filter((c) => c.severity === 'high').length;
  const mediumClauses = result.riskyClauses.filter((c) => c.severity === 'medium').length;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back + actions */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button className="btn-secondary text-xs px-4 py-2 gap-1.5">
              <Share2 size={13} />
              Share
            </button>
            <button className="btn-secondary text-xs px-4 py-2 gap-1.5">
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Document header */}
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

          {/* Risk score */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <RiskScoreCard
              score={result.riskScore}
              recommendation={result.recommendation}
              documentName={result.documentName}
            />
          </div>

          {/* Recommendation */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <RecommendationBadge recommendation={result.recommendation} large />
          </div>

          {/* Summary */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <span>📋</span> Plain-English Summary
            </h2>
            <p className="text-white/65 text-sm leading-relaxed mb-5">{result.summary}</p>

            {result.keyFindings.length > 0 && (
              <div>
                <p className="section-label mb-3">Key Findings</p>
                <ul className="space-y-2">
                  {result.keyFindings.map((finding) => (
                    <li key={finding} className="flex items-start gap-2.5 text-sm text-white/65">
                      <ChevronRight size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-4 animate-slide-up"
            style={{ animationDelay: '300ms' }}
          >
            {[
              { label: 'Total Clauses', value: result.riskyClauses.length, icon: AlertTriangle, color: '#6366f1' },
              { label: 'High Risk', value: highClauses, icon: AlertTriangle, color: '#ef4444' },
              { label: 'Needs Review', value: mediumClauses, icon: CheckCircle, color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <p className="text-2xl font-black mb-0.5" style={{ color }}>{value}</p>
                <p className="text-white/40 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* Risky clauses */}
          <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                <span>⚠️</span>
                Risky Clauses
                <span
                  className="text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {result.riskyClauses.length} found
                </span>
              </h2>
            </div>

            {result.riskyClauses.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <CheckCircle size={32} className="text-safe mx-auto mb-3" />
                <p className="text-white font-semibold">No significant risks found</p>
                <p className="text-white/40 text-sm mt-1">This contract appears to have standard, fair terms.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.riskyClauses.map((clause, i) => (
                  <ClauseCard key={clause.id} clause={clause} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
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
