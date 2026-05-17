import { create } from 'zustand';
import type { AnalysisResult, AnalysisStatus, Persona } from '@lexguard/shared';

interface AnalysisStore {
  // Current analysis state
  status: AnalysisStatus;
  progress: number;
  progressLabel: string;
  result: AnalysisResult | null;
  error: string | null;

  // Form state
  selectedFile: File | null;
  selectedPersona: Persona;

  // Actions
  setFile: (file: File | null) => void;
  setPersona: (persona: Persona) => void;
  setStatus: (status: AnalysisStatus) => void;
  setProgress: (progress: number, label: string) => void;
  setResult: (result: AnalysisResult) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as AnalysisStatus,
  progress: 0,
  progressLabel: '',
  result: null,
  error: null,
  selectedFile: null,
  selectedPersona: 'employee' as Persona,
};

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  ...initialState,

  setFile: (file) => set({ selectedFile: file }),
  setPersona: (persona) => set({ selectedPersona: persona }),
  setStatus: (status) => set({ status }),
  setProgress: (progress, progressLabel) => set({ progress, progressLabel }),
  setResult: (result) => set({ result, status: 'complete', progress: 100 }),
  setError: (error) => set({ error, status: 'error' }),
  reset: () => set(initialState),
}));
