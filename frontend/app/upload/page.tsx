'use client';

import React from 'react';
import Link from 'next/link';
import { UploadCloud, FileSpreadsheet, ShieldAlert, ArrowLeft, Info } from 'lucide-react';
import { FileUploader } from '@/components/upload/FileUploader';

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
          <span className="font-mono text-slate-400">Endpoint:</span>
          <span className="bg-slate-100 font-mono text-[11px] px-2 py-0.5 rounded text-slate-700">
            POST http://localhost:8000/analyze
          </span>
        </div>
      </div>

      {/* Main title & description card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-primary">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              EEG Sleep Recording Ingestion
            </h1>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <FileUploader />
        </div>
      </div>
    </div>
  );
}

