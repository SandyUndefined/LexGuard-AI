import { useEffect, useRef, useState } from 'react';
import type { RiskLevel } from '@lexguard/shared';

interface RiskScoreCardProps {
  score: number;
  recommendation: RiskLevel;
  documentName: string;
}

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; glow: string; trackColor: string; bg: string }> = {
  safe: {
    label: 'Low Risk',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    trackColor: 'rgba(16,185,129,0.15)',
    bg: 'rgba(16,185,129,0.08)',
  },
  negotiate: {
    label: 'Moderate Risk',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
    trackColor: 'rgba(245,158,11,0.15)',
    bg: 'rgba(245,158,11,0.08)',
  },
  avoid: {
    label: 'High Risk',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.4)',
    trackColor: 'rgba(239,68,68,0.15)',
    bg: 'rgba(239,68,68,0.08)',
  },
};

// SVG gauge dimensions
const SIZE = 180;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
// Semi-circle arc from 225° to -45° (270° sweep)
const ANGLE_START = 225;
const SWEEP = 270;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

const CIRCUMFERENCE = (SWEEP / 360) * 2 * Math.PI * RADIUS;

export default function RiskScoreCard({ score, recommendation, documentName }: RiskScoreCardProps) {
  const cfg = RISK_CONFIG[recommendation];
  const [animatedScore, setAnimatedScore] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1400;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * score));
      if (t < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [score]);

  const fillRatio = animatedScore / 100;
  const dashOffset = CIRCUMFERENCE * (1 - fillRatio);

  const trackPath = describeArc(CENTER, CENTER, RADIUS, ANGLE_START, ANGLE_START + SWEEP);
  const fillPath = trackPath; // same path, masked by dashoffset

  return (
    <div
      className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6"
      style={{ borderColor: `${cfg.color}22` }}
    >
      {/* Gauge */}
      <div className="relative flex-shrink-0">
        <svg width={SIZE} height={SIZE * 0.75} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
          <defs>
            <filter id="gaugeglow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke={cfg.trackColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Fill */}
          <path
            d={fillPath}
            fill="none"
            stroke={cfg.color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
              filter: `drop-shadow(0 0 6px ${cfg.glow})`,
            }}
          />

          {/* Score text */}
          <text x={CENTER} y={CENTER + 10} textAnchor="middle" fill="white" fontSize="36" fontWeight="700" fontFamily="Inter, sans-serif">
            {animatedScore}
          </text>
          <text x={CENTER} y={CENTER + 30} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="Inter, sans-serif">
            / 100
          </text>
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <p className="section-label mb-1">Risk Score</p>
        <h2 className="text-2xl font-bold text-white mb-1" style={{ color: cfg.color }}>
          {cfg.label}
        </h2>
        <p className="text-white/50 text-sm truncate mb-4">{documentName}</p>

        {/* Risk bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-white/40">
            <span>Safe</span>
            <span>Moderate</span>
            <span>Dangerous</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${animatedScore}%`,
                background: `linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/30">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
