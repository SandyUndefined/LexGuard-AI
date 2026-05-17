import { PERSONA_META } from '@lexguard/shared';
import type { Persona } from '@lexguard/shared';
import clsx from 'clsx';

interface PersonaSelectorProps {
  selected: Persona;
  onChange: (persona: Persona) => void;
}

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  indigo:  { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.4)',  text: '#818cf8', glow: 'rgba(99,102,241,0.25)' },
  violet:  { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.4)', text: '#a78bfa', glow: 'rgba(139,92,246,0.25)' },
  cyan:    { bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.4)',  text: '#22d3ee', glow: 'rgba(6,182,212,0.25)'  },
  emerald: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', text: '#34d399', glow: 'rgba(16,185,129,0.25)' },
  amber:   { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24', glow: 'rgba(245,158,11,0.25)' },
};

export default function PersonaSelector({ selected, onChange }: PersonaSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="section-label">I am reviewing this as a…</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PERSONA_META.map((persona) => {
          const isSelected = selected === persona.id;
          const colors = colorMap[persona.color];
          return (
            <button
              key={persona.id}
              onClick={() => onChange(persona.id)}
              className={clsx(
                'relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center',
                'transition-all duration-300 cursor-pointer group',
                isSelected
                  ? 'border-opacity-100 scale-[1.02]'
                  : 'border-white/8 hover:border-white/20 hover:scale-[1.01]',
              )}
              style={{
                background: isSelected ? colors.bg : 'rgba(22,27,34,0.6)',
                borderColor: isSelected ? colors.border : undefined,
                boxShadow: isSelected ? `0 0 20px ${colors.glow}` : undefined,
              }}
            >
              {/* Selection indicator dot */}
              {isSelected && (
                <div
                  className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
                  style={{ background: colors.text }}
                />
              )}

              {/* Emoji icon */}
              <span
                className={clsx(
                  'text-2xl transition-transform duration-300',
                  isSelected ? 'scale-110' : 'group-hover:scale-105',
                )}
              >
                {persona.icon}
              </span>

              {/* Label */}
              <span
                className={clsx(
                  'text-sm font-semibold transition-colors duration-200',
                  isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/80',
                )}
                style={{ color: isSelected ? colors.text : undefined }}
              >
                {persona.label}
              </span>

              {/* Description */}
              <span className="text-xs text-white/35 leading-tight hidden sm:block">
                {persona.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
