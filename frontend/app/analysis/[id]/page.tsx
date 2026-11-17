'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Activity,
  Bot,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { getAnalysis } from '@/lib/api';
import { DEMO_ANALYSIS } from '@/lib/mockData';
import { SleepAnalysis } from '@/types';
import { AnalysisSummary } from '@/components/analysis/AnalysisSummary';
import { SleepStageChart } from '@/components/charts/SleepStageChart';
import { SleepHypnogram } from '@/components/charts/SleepHypnogram';
import { EEGSignalChart } from '@/components/charts/EEGSignalChart';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'psg-rec-8821';

  const [analysis, setAnalysis] = useState<SleepAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAnalysisData = async () => {
      setLoading(true);
      setError(null);

      // If id is baseline reference session, use baseline clinical record
      if (id === 'psg-rec-8821' || id === 'demo-session-001' || id === 'demo') {
        if (mounted) {
          setAnalysis(DEMO_ANALYSIS);
          setLoading(false);
        }
        return;
      }

      try {
        const liveAnalysis = await getAnalysis(id);
        if (mounted) {
          setAnalysis(liveAnalysis);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(
            err.message ||
              `Could not retrieve analysis for session ${id}. Ensure the FastAPI server is running.`
          );
          setAnalysis(DEMO_ANALYSIS);
          setLoading(false);
        }
      }
    };

    fetchAnalysisData();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-12">
        <LoadingState
          message="Loading Polysomnography Analysis..."
          subtext="Fetching scored epochs, confidence metrics, and EEG wave reconstructions."
        />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Analysis Session Not Found"
          message={`Session identifier "${id}" could not be located on the backend.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            href={`/assistant?analysisId=${analysis.id}`}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-lg transition-colors shadow-2xs"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI About This Session</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI component */}
      <AnalysisSummary analysis={analysis} />

      {/* Charts Row: Hypnogram & Stage Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SleepHypnogram
            data={analysis.hypnogram}
            title="Overnight Sleep Architecture Hypnogram"
          />
        </div>
        <div className="lg:col-span-1">
          <SleepStageChart
            distribution={analysis.stageDistribution}
          />
        </div>
      </div>

      {/* Raw EEG Signal Visualisation */}
      <div>
        <EEGSignalChart
          signals={analysis.eegSignals}
          epochNumber={14}
          stageName="Stage N3 (Deep Sleep Slow Waves)"
        />
      </div>
    </div>
  );
}

