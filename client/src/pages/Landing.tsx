import { useNavigate } from 'react-router-dom';
import { Shield, Upload, Zap, Lock, ChevronRight, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'AI-Powered Clause Detection',
    description: 'Gemini scans every clause for hidden risks, one-sided terms, and unfair conditions.',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
  },
  {
    icon: Zap,
    title: 'Instant Risk Scoring',
    description: 'Get a 0–100 risk score with a clear recommendation: Safe, Negotiate, or Avoid.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    icon: Upload,
    title: 'Demo-Ready Uploads',
    description: 'Upload TXT for live analysis, or PDF/PNG/JPG to exercise the document pipeline.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    icon: Lock,
    title: 'Persona-Aware Analysis',
    description: 'Analysis tailored to your role — Employee, Freelancer, Customer, Tenant, or Vendor.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-14">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in"
          style={{
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#a5b4fc',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Powered by Google Gemini AI
        </div>

        {/* Heading */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight mb-6 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          Understand Any
          <br />
          <span className="gradient-text">Contract in Minutes</span>
        </h1>

        <p
          className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          Upload any legal document and LexGuard AI instantly identifies risky clauses,
          explains risks in plain English, and tells you exactly what to do.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up"
          style={{ animationDelay: '300ms' }}
        >
          <button
            onClick={() => navigate('/analyze')}
            className="btn-primary text-base px-8 py-4"
          >
            <Upload size={18} />
            Analyze a Contract — Free
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => navigate('/history')}
            className="btn-secondary text-base px-8 py-4"
          >
            View Reports
          </button>
        </div>

        {/* Trust line */}
        <p
          className="text-white/25 text-xs mt-6 animate-fade-in px-4"
          style={{ animationDelay: '500ms' }}
        >
          No account required · Secure upload flow · Export-ready reports
        </p>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why LexGuard</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Legal intelligence at your fingertips
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, description, color, bg }, i) => (
              <div
                key={title}
                className="glass-card-hover p-6 animate-slide-up opacity-initial"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: bg, border: `1px solid ${color}33` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              From upload to insight in 3 steps
            </h2>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div
              className="absolute left-[22px] top-12 bottom-12 w-px hidden md:block"
              style={{ background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.3), transparent)' }}
            />

            <div className="space-y-8">
              {[
                { step: '01', title: 'Upload your contract', desc: 'Drag and drop your PDF, image, or text file. We accept all common formats up to 20MB.' },
                { step: '02', title: 'Select your persona', desc: 'Tell us your role — Employee, Freelancer, Customer, Tenant, or Vendor — for tailored analysis.' },
                { step: '03', title: 'Get your risk report', desc: 'Receive a detailed breakdown of risky clauses, plain-English explanations, and safer alternatives.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-6 md:gap-8 items-start">
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                      color: 'white',
                    }}
                  >
                    {step}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="glass-card p-12"
            style={{ boxShadow: '0 0 80px rgba(99,102,241,0.15)' }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Don't sign another contract blind.
            </h2>
            <p className="text-white/50 text-lg mb-8">
              Upload a contract and finish with a printable report.
            </p>
            <button
              onClick={() => navigate('/analyze')}
              className="btn-primary text-lg px-10 py-4"
            >
              Start Free Analysis
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-white/5">
        <p className="text-white/25 text-sm">
          © 2026 LexGuard AI · Built with Gemini · Not a substitute for legal advice
        </p>
      </footer>
    </div>
  );
}
