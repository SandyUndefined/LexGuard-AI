import { useEffect, useState } from 'react';
import { Shield, Upload, Brain, FileSearch, CheckCircle2 } from 'lucide-react';

interface LoadingAnalysisProps {
  fileName: string;
  uploadProgress: number;
}

const STEPS = [
  { icon: Upload,      label: 'Uploading document',      sublabel: 'Securely transferring your file…' },
  { icon: FileSearch,  label: 'Extracting text',         sublabel: 'Reading and parsing document content…' },
  { icon: Brain,       label: 'AI analysis in progress', sublabel: 'Gemini is reviewing every clause…' },
  { icon: Shield,      label: 'Generating insights',     sublabel: 'Crafting recommendations for you…' },
  { icon: CheckCircle2,label: 'Finalizing report',       sublabel: 'Almost done — preparing results…' },
];

export default function LoadingAnalysis({ fileName, uploadProgress }: LoadingAnalysisProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  // Animate through steps
  useEffect(() => {
    if (uploadProgress >= 100) {
      const interval = setInterval(() => {
        setCurrentStep((s) => {
          if (s < STEPS.length - 1) return s + 1;
          clearInterval(interval);
          return s;
        });
      }, 2200);
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [uploadProgress]);

  // Dot animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length < 3 ? d + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const stepProgress = uploadProgress < 100
    ? uploadProgress
    : Math.min(100, ((currentStep + 1) / STEPS.length) * 100);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {/* Animated shield */}
      <div className="relative mb-10">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)',
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute -inset-4 rounded-full opacity-10 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }}
        />
        {/* Icon container */}
        <div
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center animate-glow-pulse"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 40px rgba(99,102,241,0.5)',
          }}
        >
          <Shield size={36} className="text-white" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-2">
        Analyzing your contract{dots}
      </h2>
      <p className="text-white/40 text-sm mb-1 max-w-xs truncate">
        {fileName}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-sm mt-8 mb-6">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>{STEPS[currentStep]?.label}</span>
          <span>{Math.round(stepProgress)}%</span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${stepProgress}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
            }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="w-full max-w-sm space-y-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isComplete = i < currentStep;
          const isCurrent = i === currentStep;
          const isFuture = i > currentStep;

          return (
            <div
              key={step.label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500"
              style={{
                background: isCurrent
                  ? 'rgba(99,102,241,0.1)'
                  : isComplete
                  ? 'rgba(16,185,129,0.05)'
                  : 'transparent',
                border: isCurrent
                  ? '1px solid rgba(99,102,241,0.25)'
                  : isComplete
                  ? '1px solid rgba(16,185,129,0.15)'
                  : '1px solid transparent',
                opacity: isFuture ? 0.35 : 1,
              }}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300`}
                style={{
                  background: isComplete
                    ? 'rgba(16,185,129,0.2)'
                    : isCurrent
                    ? 'rgba(99,102,241,0.2)'
                    : 'rgba(255,255,255,0.05)',
                }}
              >
                {isComplete ? (
                  <CheckCircle2 size={14} className="text-safe" />
                ) : (
                  <Icon
                    size={14}
                    className={isCurrent ? 'text-brand-400' : 'text-white/30'}
                    style={isCurrent ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
                  />
                )}
              </div>

              <div className="flex-1 text-left">
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: isComplete ? '#10b981' : isCurrent ? '#818cf8' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-white/30 mt-0.5 animate-fade-in">{step.sublabel}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-white/25 text-xs mt-8">
        This usually takes 15–30 seconds depending on document length
      </p>
    </div>
  );
}
