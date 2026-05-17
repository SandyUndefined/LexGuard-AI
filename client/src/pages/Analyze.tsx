import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, Info, RotateCcw } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { uploadDocumentForAnalysis } from '../api/client';
import FileUpload from '../components/FileUpload';
import PersonaSelector from '../components/PersonaSelector';
import LoadingAnalysis from '../components/LoadingAnalysis';
import type { Persona } from '@lexguard/shared';

export default function Analyze() {
  const navigate = useNavigate();
  const {
    selectedFile, selectedPersona,
    status, error,
    setFile, setPersona,
    setStatus, setProgress,
    setResult, setError, reset,
  } = useAnalysisStore();

  const [uploadPct, setUploadPct] = useState(0);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    setProgress(0, 'Preparing upload…');

    try {
      const response = await uploadDocumentForAnalysis(
        selectedFile,
        selectedPersona,
        (pct) => {
          setUploadPct(pct);
          setProgress(pct, pct >= 100 ? 'Analyzing clauses…' : 'Uploading document…');
        },
      );

      if (!response.success) {
        throw new Error('Analysis failed');
      }

      setResult(response.report);
      navigate(`/results/${response.report.id}`, { state: { report: response.report } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    }
  }, [selectedFile, selectedPersona, navigate, setStatus, setProgress, setResult, setError]);

  const isLoading = status === 'uploading' || status === 'analyzing';
  const canAnalyze = !!selectedFile && !isLoading;

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="w-full max-w-xl glass-card">
          <LoadingAnalysis
            fileName={selectedFile?.name ?? ''}
            uploadProgress={uploadPct}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 sm:pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}
          >
            <Shield size={12} />
            AI Contract Analysis
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-3">
            Analyze Your Contract
          </h1>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Upload your document and select your role for a personalized risk assessment.
          </p>
        </div>

        {/* Main card */}
        <div className="glass-card p-5 sm:p-8 space-y-7 sm:space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>

          {/* Step 1: Upload */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
              >
                1
              </div>
              <h2 className="text-white font-semibold text-base">Upload your document</h2>
            </div>
            <FileUpload
              onFileSelect={setFile}
              selectedFile={selectedFile}
              onClear={() => { setFile(null); reset(); }}
            />
          </div>

          <div className="section-divider" />

          {/* Step 2: Persona */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
              >
                2
              </div>
              <h2 className="text-white font-semibold text-base">Choose your persona</h2>
            </div>
            <PersonaSelector
              selected={selectedPersona}
              onChange={(p: Persona) => setPersona(p)}
            />
          </div>

          <div className="section-divider" />

          {/* Error */}
          {error && status === 'error' && (
            <div
              className="flex flex-col sm:flex-row sm:items-start gap-3 px-4 py-3 rounded-xl animate-fade-in"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                <p className="text-red-400 text-sm font-medium">Analysis failed</p>
                <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setError('')}
                className="btn-secondary text-xs px-3 py-2 self-start sm:self-center"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
          )}

          {/* Analyze button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="btn-primary w-full justify-center text-base py-4"
            >
              <Shield size={18} />
              {canAnalyze ? 'Analyze Contract' : selectedFile ? 'Analyzing…' : 'Upload a file to continue'}
            </button>

            {/* Info note */}
            <div className="flex items-center gap-1.5 text-white/30 text-xs">
              <Info size={11} />
              TXT gives the best demo result today · PDF and image upload use placeholder extraction
            </div>
          </div>
        </div>

        {/* Tips */}
        <div
          className="mt-6 px-5 py-4 rounded-2xl animate-fade-in"
          style={{
            background: 'rgba(99,102,241,0.05)',
            border: '1px solid rgba(99,102,241,0.1)',
            animationDelay: '300ms',
          }}
        >
          <p className="text-xs font-semibold text-brand-400/70 uppercase tracking-wider mb-2">For best results</p>
          <ul className="space-y-1">
            {[
              'Use TXT for the most reliable live demo analysis',
              'PDF and image uploads are accepted and saved, with extraction ready for Document AI or Vision API',
              'Keep sample contracts under a few pages for faster hackathon demos',
              'After results load, use Export to open the printable report',
            ].map((tip) => (
              <li key={tip} className="text-xs text-white/35 flex items-start gap-2">
                <span className="text-brand-400/50 mt-0.5">·</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
