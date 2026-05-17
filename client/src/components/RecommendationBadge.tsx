import type { RiskLevel } from '@lexguard/shared';
import { CheckCircle, AlertCircle, XCircle, ChevronRight } from 'lucide-react';

interface RecommendationBadgeProps {
  recommendation: RiskLevel;
  large?: boolean;
}

const CONFIG: Record<RiskLevel, {
  label: string;
  sublabel: string;
  Icon: typeof CheckCircle;
  color: string;
  bg: string;
  border: string;
  glow: string;
  gradientFrom: string;
  gradientTo: string;
  bullets: string[];
}> = {
  safe: {
    label: '✅ Safe to Sign',
    sublabel: 'This contract appears fair and reasonable.',
    Icon: CheckCircle,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    glow: 'rgba(16,185,129,0.2)',
    gradientFrom: '#10b981',
    gradientTo: '#059669',
    bullets: [
      'No significant red flags found',
      'Terms appear balanced and fair',
      'Standard industry language used',
    ],
  },
  negotiate: {
    label: '⚖️ Negotiate Before Signing',
    sublabel: 'Some clauses need adjustment — don\'t sign as-is.',
    Icon: AlertCircle,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    glow: 'rgba(245,158,11,0.2)',
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
    bullets: [
      'Review the highlighted clauses carefully',
      'Request modifications before signing',
      'Consult a lawyer for key terms',
    ],
  },
  avoid: {
    label: '🚨 Avoid — High Risk',
    sublabel: 'This contract contains seriously unfair terms.',
    Icon: XCircle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    glow: 'rgba(239,68,68,0.2)',
    gradientFrom: '#ef4444',
    gradientTo: '#dc2626',
    bullets: [
      'Multiple high-risk clauses identified',
      'Seek legal advice immediately',
      'Do not sign without major revisions',
    ],
  },
};

export default function RecommendationBadge({ recommendation, large = false }: RecommendationBadgeProps) {
  const cfg = CONFIG[recommendation];
  const { Icon } = cfg;

  if (!large) {
    return (
      <span
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border"
        style={{
          color: cfg.color,
          background: cfg.bg,
          borderColor: cfg.border,
          boxShadow: `0 0 12px ${cfg.glow}`,
        }}
      >
        <Icon size={15} />
        {cfg.label}
      </span>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 border"
      style={{
        background: cfg.bg,
        borderColor: cfg.border,
        boxShadow: `0 0 40px ${cfg.glow}`,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})` }}
        >
          <Icon size={22} className="text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className="text-xl font-bold mb-1"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </h3>
          <p className="text-white/60 text-sm mb-4">{cfg.sublabel}</p>

          {/* Action bullets */}
          <ul className="space-y-2">
            {cfg.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5 text-sm text-white/70">
                <ChevronRight size={14} style={{ color: cfg.color }} className="flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
