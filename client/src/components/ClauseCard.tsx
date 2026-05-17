import { useState } from 'react';
import type { EnhancedClause } from '@lexguard/shared';
import { ChevronDown, ChevronUp, AlertTriangle, ArrowRight, Tag, Lightbulb } from 'lucide-react';
import clsx from 'clsx';

interface ClauseCardProps {
  clause: EnhancedClause;
  index: number;
}

const SEVERITY_CONFIG = {
  low: {
    label: 'Low Risk',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.2)',
  },
  medium: {
    label: 'Medium Risk',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
  },
  high: {
    label: 'High Risk',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
  },
  critical: {
    label: 'Critical Risk',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    border: 'rgba(168,85,247,0.24)',
  },
};

export default function ClauseCard({ clause, index }: ClauseCardProps) {
  const [expanded, setExpanded] = useState(index === 0);
  const cfg = SEVERITY_CONFIG[clause.severity];

  return (
    <div
      className={clsx(
        'rounded-xl border transition-all duration-300 overflow-hidden',
        expanded ? 'border-opacity-60' : 'border-white/8 hover:border-white/15',
      )}
      style={{
        background: expanded ? cfg.bg : 'rgba(22,27,34,0.6)',
        borderColor: expanded ? cfg.border : undefined,
      }}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start gap-3 sm:gap-4 p-4 sm:p-5 text-left group"
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <AlertTriangle size={15} style={{ color: cfg.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="badge text-xs"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              {cfg.label}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Tag size={10} />
              {clause.category}
            </span>
          </div>

          <p className="text-white font-semibold text-sm mb-1">{clause.title}</p>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
            {clause.originalText}
          </p>
        </div>

        <div className="flex-shrink-0 p-1.5 rounded-lg text-white/40 group-hover:text-white/70 group-hover:bg-white/5 transition-all duration-200 mt-0.5">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <div
        className={clsx(
          'overflow-hidden transition-all duration-400',
          expanded ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="px-4 sm:px-5 pb-5 space-y-4">
          <div className="section-divider" />

          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Original Clause</p>
            <blockquote
              className="text-white/70 text-sm leading-relaxed pl-3 italic"
              style={{ borderLeft: `2px solid ${cfg.color}` }}
            >
              {clause.originalText}
            </blockquote>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}
          >
            <p className="text-xs font-semibold text-red-400/80 uppercase tracking-wider mb-1.5">Why this is risky</p>
            <p className="text-white/75 text-sm leading-relaxed">{clause.riskExplanation}</p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Lightbulb size={12} className="text-amber-400 flex-shrink-0" />
              <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">Real-world impact</p>
            </div>
            <p className="text-white/75 text-sm leading-relaxed">{clause.realWorldImpact}</p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <ArrowRight size={12} className="text-safe flex-shrink-0" />
              <p className="text-xs font-semibold text-safe/80 uppercase tracking-wider">Safer Rewrite</p>
            </div>
            <p className="text-white/75 text-sm leading-relaxed">{clause.saferRewrite}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
