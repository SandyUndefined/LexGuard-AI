import { useNavigate } from 'react-router-dom';
import type { ReportsListResponse } from '@lexguard/shared';
import { PERSONA_META } from '@lexguard/shared';
import { FileText, ChevronRight, Clock } from 'lucide-react';
import RecommendationBadge from './RecommendationBadge';
import clsx from 'clsx';

type ReportSummary = ReportsListResponse['reports'][number];

interface HistoryCardProps {
  item: ReportSummary;
  index: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const SCORE_COLOR = (score: number) =>
  score <= 35 ? '#10b981' : score <= 65 ? '#f59e0b' : '#ef4444';

export default function HistoryCard({ item, index }: HistoryCardProps) {
  const navigate = useNavigate();
  const persona = PERSONA_META.find((p) => p.id === item.persona);
  const color = SCORE_COLOR(item.overallRiskScore);

  return (
    <button
      onClick={() => navigate(`/results/${item.id}`)}
      className={clsx(
        'glass-card-hover w-full text-left p-5 flex items-center gap-5',
        'animate-slide-up opacity-initial',
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      {/* Score circle */}
      <div className="flex-shrink-0 relative">
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            cx="28"
            cy="28"
            r="22"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 22}
            strokeDashoffset={2 * Math.PI * 22 * (1 - item.overallRiskScore / 100)}
            transform="rotate(-90 28 28)"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
          <text x="28" y="33" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="Inter">
            {item.overallRiskScore}
          </text>
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-white font-semibold text-sm truncate">{item.documentName}</p>
          <ChevronRight size={16} className="text-white/30 flex-shrink-0 mt-0.5" />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          {/* Persona */}
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            <span>{persona?.icon}</span>
            <span>{persona?.label}</span>
          </span>

          {/* Date */}
          <span className="flex items-center gap-1 text-xs text-white/35">
            <Clock size={10} />
            {formatDate(item.createdAt)}
          </span>

          {/* Recommendation badge */}
          <RecommendationBadge recommendation={item.riskLevel} />
        </div>
      </div>

      {/* File icon */}
      <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-xl items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <FileText size={18} className="text-white/30" />
      </div>
    </button>
  );
}
