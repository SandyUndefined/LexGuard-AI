import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { API_ORIGIN } from '../api/config';
import { checkHealth } from '../api/client';

type Status = 'checking' | 'connected' | 'error';

export default function BackendStatus() {
  const [status, setStatus] = useState<Status>('checking');
  const [message, setMessage] = useState('Checking backend');

  useEffect(() => {
    let cancelled = false;

    checkHealth()
      .then((response) => {
        if (cancelled) return;
        setStatus('connected');
        setMessage(response.service || 'Backend connected');
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Backend unavailable');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const config = {
    checking: {
      Icon: Loader2,
      label: 'Backend',
      color: '#a5b4fc',
      bg: 'rgba(99,102,241,0.12)',
      border: 'rgba(99,102,241,0.24)',
      iconClass: 'animate-spin',
    },
    connected: {
      Icon: CheckCircle2,
      label: 'Connected',
      color: '#10b981',
      bg: 'rgba(16,185,129,0.12)',
      border: 'rgba(16,185,129,0.24)',
      iconClass: '',
    },
    error: {
      Icon: AlertCircle,
      label: 'Offline',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.24)',
      iconClass: '',
    },
  }[status];

  const { Icon } = config;
  const target = API_ORIGIN || 'same-origin API';

  return (
    <div
      className="fixed bottom-3 right-3 z-50 max-w-[calc(100vw-1.5rem)] rounded-xl px-3 py-2 text-xs shadow-card backdrop-blur-md"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
      title={`${message} (${target})`}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className={config.iconClass} style={{ color: config.color }} />
        <span className="font-semibold" style={{ color: config.color }}>{config.label}</span>
        <span className="hidden sm:inline max-w-[260px] truncate text-white/50">{target}</span>
      </div>
    </div>
  );
}
