import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Clock, Search, Filter, AlertTriangle } from 'lucide-react';
import { fetchReports } from '../api/client';
import type { ReportsListResponse, RiskLevel } from '@lexguard/shared';
import HistoryCard from '../components/HistoryCard';

type FilterType = 'all' | RiskLevel;
type ReportSummary = ReportsListResponse['reports'][number];

const FILTER_OPTIONS: { value: FilterType; label: string; color?: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'safe',      label: '✅ Safe',      color: '#10b981' },
  { value: 'negotiate', label: '⚖️ Negotiate', color: '#f59e0b' },
  { value: 'avoid',     label: '🚨 Avoid',     color: '#ef4444' },
];

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ReportSummary[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchReports()
      .then((r) => {
        setItems(r.reports);
        setLoadState('loaded');
      })
      .catch(() => setLoadState('error'));
  }, []);

  const filtered = items.filter((item) => {
    const matchesSearch = item.documentName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.riskLevel === filter;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const safeCount      = items.filter((i) => i.riskLevel === 'safe').length;
  const negotiateCount = items.filter((i) => i.riskLevel === 'negotiate').length;
  const avoidCount     = items.filter((i) => i.riskLevel === 'avoid').length;
  const avgScore       = items.length > 0 ? Math.round(items.reduce((s, i) => s + i.overallRiskScore, 0) / items.length) : 0;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <p className="section-label mb-2">Your analyses</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Sample Reports</h1>
          </div>
          <button onClick={() => navigate('/analyze')} className="btn-primary text-sm self-start sm:self-auto">
            <Upload size={15} />
            New Analysis
          </button>
        </div>

        {/* Stats row */}
        {loadState === 'loaded' && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-slide-up">
            {[
              { label: 'Total Analyzed', value: items.length, color: '#6366f1' },
              { label: 'Safe',           value: safeCount,    color: '#10b981' },
              { label: 'Negotiate',      value: negotiateCount, color: '#f59e0b' },
              { label: 'Avoid',          value: avoidCount,   color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <p className="text-2xl font-black" style={{ color }}>{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Average risk */}
        {loadState === 'loaded' && items.length > 0 && (
          <div
            className="flex items-center gap-4 px-5 py-4 rounded-2xl mb-8 animate-fade-in"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Clock size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Average risk score across all analyses</p>
              <p className="text-white/40 text-xs">{avgScore}/100 · {items.length} documents analyzed</p>
            </div>
            <div className="ml-auto">
              <span
                className="text-3xl font-black"
                style={{
                  color: avgScore <= 35 ? '#10b981' : avgScore <= 65 ? '#f59e0b' : '#ef4444',
                }}
              >
                {avgScore}
              </span>
            </div>
          </div>
        )}

        {/* Search + Filter */}
        {loadState === 'loaded' && items.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="text"
                placeholder="Search documents…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 text-sm"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-white/30 flex-shrink-0" />
              {FILTER_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: filter === value
                      ? color ? `${color}20` : 'rgba(99,102,241,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    border: filter === value
                      ? `1px solid ${color ?? 'rgba(99,102,241,0.4)'}55`
                      : '1px solid rgba(255,255,255,0.08)',
                    color: filter === value ? (color ?? '#818cf8') : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loadState === 'loading' && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl shimmer" />
            ))}
          </div>
        )}

        {loadState === 'error' && (
          <div className="glass-card p-10 text-center">
            <AlertTriangle size={34} className="text-red-400 mx-auto mb-3" />
            <h2 className="text-white font-bold text-xl mb-2">Could not load reports</h2>
            <p className="text-white/50 text-sm">Check that the API server is running, then retry.</p>
            <button onClick={() => window.location.reload()} className="btn-secondary mt-4 text-sm">
              Retry
            </button>
          </div>
        )}

        {loadState === 'loaded' && items.length === 0 && (
          <div className="glass-card p-16 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <Clock size={28} className="text-brand-400" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">No analyses yet</h2>
            <p className="text-white/40 text-sm mb-6">
              Upload your first contract to get started.
            </p>
            <button onClick={() => navigate('/analyze')} className="btn-primary">
              <Upload size={16} />
              Analyze a Contract
            </button>
          </div>
        )}

        {loadState === 'loaded' && items.length > 0 && filtered.length === 0 && (
          <div className="glass-card p-10 text-center">
            <p className="text-white/50 text-sm">No results match your search or filter.</p>
            <button onClick={() => { setSearch(''); setFilter('all'); }} className="btn-secondary mt-4 text-sm">
              Clear filters
            </button>
          </div>
        )}

        {loadState === 'loaded' && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <HistoryCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
