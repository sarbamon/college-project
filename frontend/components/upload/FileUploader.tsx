'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  FileSpreadsheet,
  Activity,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { uploadEEG } from '@/lib/api';
import { LoadingState } from '@/components/ui/LoadingState';

export const FileUploader: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allowedExtensions = ['.edf', '.csv'];

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      setErrorMessage(
        'Invalid file type. Please upload a standard European Data Format (.edf) or tabular epoch file (.csv).'
      );
      return false;
    }

    // Limit to 100MB for safety
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 100 MB limit for single session processing.');
      return false;
    }

    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleLoadSampleFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rows = ['timestamp_sec,fp1_f3_uv,c3_a2_uv,o1_a2_uv'];
    for (let i = 0; i < 3000; i++) {
      const t = (i * 0.01).toFixed(2);
      const c3 = (25 * Math.sin(2 * Math.PI * 1.5 * (i * 0.01)) + (Math.random() * 6 - 3)).toFixed(2);
      const fp1 = (30 * Math.sin(2 * Math.PI * 1.2 * (i * 0.01)) + (Math.random() * 8 - 4)).toFixed(2);
      const o1 = (18 * Math.sin(2 * Math.PI * 10.0 * (i * 0.01)) + (Math.random() * 4 - 2)).toFixed(2);
      rows.push(`${t},${fp1},${c3},${o1}`);
    }
    const sampleFile = new File([rows.join('\n')], 'sample_patient_eeg_recording.csv', {
      type: 'text/csv',
    });
    setSelectedFile(sampleFile);
    setErrorMessage(null);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(10);
    setErrorMessage(null);

    try {
      // POST http://localhost:8000/analyze
      const result = await uploadEEG(selectedFile, (p) => setProgress(p));
      // Upon successful analysis by FastAPI backend, redirect to analysis report page
      router.push(`/analysis/${result.id || 'latest'}`);
    } catch (err: any) {
      setUploading(false);
      setProgress(0);
      setErrorMessage(
        err.message ||
          'Failed to connect to FastAPI server (http://localhost:8000). Ensure Python backend is running.'
      );
    }
  };

  if (uploading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
        <LoadingState
          message="Uploading & Scoring EEG Recording..."
          subtext="The FastAPI backend is executing preprocessing, Fourier/wavelet transformation, and deep learning stage classification."
        />
        <div className="max-w-md mx-auto mt-6">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Pipeline Execution</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-3">
            Please keep this tab open while epochs are scored by the model.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-brand-primary bg-blue-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-slate-400 bg-white/60 hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".edf,.csv"
          onChange={handleFileInputChange}
          className="hidden"
          id="eeg-file-input"
        />

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-primary">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-slate-800 mb-1">
          Drag & drop your EEG recording file
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Upload raw polysomnography recordings in <strong>.EDF</strong> (European Data Format)
          or tabular <strong>.CSV</strong> montage formats.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center space-x-2 text-xs font-semibold bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Browse File from Computer</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSampleFile}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-brand-primary border border-blue-200 px-3.5 py-2 rounded-lg transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span>Load Sample Recording</span>
          </button>
        </div>

        <div className="flex items-center justify-center space-x-4 mt-6 text-[11px] text-slate-400 font-medium">
          <span>Supported: .EDF, .CSV</span>
          <span>&bull;</span>
          <span>Max size: 100 MB</span>
          <span>&bull;</span>
          <span>Standard 10-20 Montage</span>
        </div>
      </div>

      {/* Selected File Details Banner */}
      {selectedFile && (
        <div className="bg-white rounded-xl border border-blue-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-primary flex-shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {selectedFile.name}
                </span>
                <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {selectedFile.name.split('.').pop()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Size: {formatFileSize(selectedFile.size)} &bull; Ready for inference
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleStartAnalysis}
              className="inline-flex items-center space-x-2 text-xs font-semibold bg-brand-primary hover:bg-blue-900 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Analyse EEG</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Error / Offline Guidance */}
      {errorMessage && (
        <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 text-red-900 shadow-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h5 className="font-semibold text-red-800">Backend Communication Error</h5>
            <p className="mt-1 text-red-700 leading-relaxed">{errorMessage}</p>
            <div className="mt-2 text-[11px] text-red-600 bg-red-100/60 p-2 rounded-lg font-mono">
              FastAPI Endpoint: POST http://localhost:8000/analyze
            </div>
          </div>
        </div>
      )}

      {/* Clinical Integrity Notice */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-600">
        <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700">Strict Clinical ML Policy:</span> The
          EEG Sleep AI frontend strictly requires valid predictions from the Python backend. No
          fabricated or mocked predictions are substituted when the neural backend is
          unreachable.
        </div>
      </div>
    </div>
  );
};

