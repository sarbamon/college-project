'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  Bot,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Printer,
} from 'lucide-react';
import { SleepAnalysis } from '@/types';

interface AnalysisSummaryProps {
  analysis: SleepAnalysis;
  isDemo?: boolean;
}

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({
  analysis,
  isDemo = false,
}) => {
  const formatDuration = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hours}h ${mins}m`;
  };

  const handleDownloadReport = () => {
    const reportData = {
      project: 'EEG Sleep AI Healthcare Analytics',
      reportGeneratedAt: new Date().toISOString(),
      analysisDetails: analysis,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EEG_Sleep_Report_${analysis.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">
              Polysomnography Assessment
            </h2>
            {isDemo && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Demo Reference
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Session ID:{' '}
            <span className="font-mono text-slate-700 font-semibold">{analysis.id}</span>{' '}
            &bull; Source:{' '}
            <span className="text-slate-700 font-mono">{analysis.fileName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg transition-colors shadow-2xs"
            title="Print or export clinical PDF report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg transition-colors shadow-2xs"
            title="Download full analysis as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>JSON</span>
          </button>

          <Link
            href={`/assistant?analysisId=${analysis.id}`}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-lg transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>Consult AI</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Sleep Time</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatDuration(analysis.totalSleepMinutes ?? analysis.durationMinutes)}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Overnight Recording
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sleep Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{analysis.efficiency}%</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
            {analysis.efficiency >= 85 ? 'Clinically Optimal' : 'Sub-optimal continuity'}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>Model Confidence</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {analysis.modelConfidence}%
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Cross-epoch mean probability
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Awakenings (WASO)</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{analysis.awakenings}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {analysis.wakeMinutes} min total awake
          </span>
        </div>
      </div>

      {/* Comprehensive Stage Metrics */}
      <div className="border border-slate-200/60 rounded-xl p-4 bg-white">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Stage Distribution Breakdown</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
            <span className="text-xs font-medium text-slate-600">Deep (N3 SWS)</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-lg font-bold text-brand-primary">
                {analysis.stageDistribution.n3}%
              </span>
              <span className="text-xs text-slate-400">
                ({formatDuration(analysis.deepSleepMinutes)})
              </span>
            </div>
            <p className="text-[10px] text-blue-700 mt-1 font-medium">Physical restoration</p>
          </div>

          <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100">
            <span className="text-xs font-medium text-slate-600">REM Sleep</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-lg font-bold text-purple-700">
                {analysis.stageDistribution.rem}%
              </span>
              <span className="text-xs text-slate-400">
                ({formatDuration(analysis.remSleepMinutes)})
              </span>
            </div>
            <p className="text-[10px] text-purple-700 mt-1 font-medium">Memory & cognition</p>
          </div>

          <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100">
            <span className="text-xs font-medium text-slate-600">Light Stage N2</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-lg font-bold text-sky-700">
                {analysis.stageDistribution.n2}%
              </span>
              <span className="text-xs text-slate-400">Spindle rich</span>
            </div>
            <p className="text-[10px] text-sky-700 mt-1 font-medium">Motor memory consolidation</p>
          </div>

          <div className="p-3 rounded-lg bg-sky-50/30 border border-sky-100/70">
            <span className="text-xs font-medium text-slate-600">Light Stage N1</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-lg font-bold text-sky-600">
                {analysis.stageDistribution.n1}%
              </span>
              <span className="text-xs text-slate-400">Drowsiness</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Transition sleep</p>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
            <span className="text-xs font-medium text-slate-600">Wake (W)</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-lg font-bold text-amber-700">
                {analysis.stageDistribution.wake}%
              </span>
              <span className="text-xs text-slate-400">
                ({formatDuration(analysis.wakeMinutes)})
              </span>
            </div>
            <p className="text-[10px] text-amber-700 mt-1 font-medium">Latency & WASO</p>
          </div>
        </div>
      </div>

      {/* AI Explanation block */}
      {analysis.aiExplanation && (
        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80">
          <div className="flex items-center space-x-2 text-purple-900 font-semibold text-xs mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>LLM Synthesis (Gemini AI Polysomnography Summary)</span>
          </div>
          <p className="text-xs text-purple-950 leading-relaxed">
            {analysis.aiExplanation}
          </p>
        </div>
      )}
    </div>
  );
};

