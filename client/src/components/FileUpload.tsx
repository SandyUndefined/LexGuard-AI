import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, FileText, Image, File, X, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'text/plain': ['.txt'],
};

function getFileIcon(file: File) {
  if (file.type === 'application/pdf') return <FileText size={32} className="text-red-400" />;
  if (file.type.startsWith('image/')) return <Image size={32} className="text-blue-400" />;
  return <File size={32} className="text-slate-400" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ onFileSelect, selectedFile, onClear }: FileUploadProps) {
  const [rejected, setRejected] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      setRejected(null);
      if (rejections.length > 0) {
        const err = rejections[0].errors[0];
        if (err.code === 'file-too-large') {
          setRejected('File is too large. Maximum size is 20MB.');
        } else if (err.code === 'file-invalid-type') {
          setRejected('Invalid file type. Please upload a PDF, PNG, JPG, JPEG, or TXT file.');
        } else {
          setRejected(err.message);
        }
        return;
      }
      if (accepted[0]) onFileSelect(accepted[0]);
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  if (selectedFile) {
    return (
      <div className="glass-card p-5 flex items-start gap-4 animate-fade-in">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          {getFileIcon(selectedFile)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{selectedFile.name}</p>
          <p className="text-white/40 text-xs mt-0.5">{formatBytes(selectedFile.size)}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle size={13} className="text-safe flex-shrink-0" />
            <span className="text-safe text-xs font-medium">Ready for analysis</span>
          </div>
        </div>
        <button
          onClick={onClear}
          className="flex-shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={clsx(
          'relative rounded-xl border-2 border-dashed p-6 sm:p-10 text-center cursor-pointer',
          'transition-all duration-300 group',
          isDragActive && !isDragReject && 'border-brand-400 bg-brand-500/5',
          isDragReject && 'border-red-400 bg-red-500/5',
          !isDragActive && !isDragReject && 'border-white/10 hover:border-brand-400/50 hover:bg-brand-500/5',
        )}
      >
        <input {...getInputProps()} />

        {/* Animated upload icon */}
        <div className="flex justify-center mb-4">
          <div
            className={clsx(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
              isDragActive
                ? 'scale-110 bg-brand-500/20 border border-brand-400/40'
                : 'bg-white/5 border border-white/10 group-hover:bg-brand-500/10 group-hover:border-brand-400/30 group-hover:scale-105',
            )}
          >
            <Upload
              size={28}
              className={clsx(
                'transition-colors duration-300',
                isDragActive ? 'text-brand-400' : 'text-white/40 group-hover:text-brand-400',
              )}
            />
          </div>
        </div>

        <p className="text-white/80 font-semibold text-base">
          {isDragActive ? 'Drop your file here' : 'Drag & drop your contract here'}
        </p>
        <p className="text-white/40 text-sm mt-1">or click to browse</p>

        <div className="flex items-center justify-center gap-3 mt-5">
          {['PDF', 'PNG', 'JPG', 'TXT'].map((type) => (
            <span
              key={type}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-white/50 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {type}
            </span>
          ))}
        </div>
        <p className="text-white/25 text-xs mt-3">Max file size: 20MB</p>
      </div>

      {rejected && (
        <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <X size={14} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{rejected}</p>
        </div>
      )}
    </div>
  );
}
