'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Moon,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  ArrowRight,
  UploadCloud,
  FileCheck2,
} from 'lucide-react';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { SleepStageChart } from '@/components/charts/SleepStageChart';
import { SleepHypnogram } from '@/components/charts/SleepHypnogram';
import { RecommendationCard } from '@/components/assistant/RecommendationCard';
import { HistoryTable } from '@/components/history/HistoryTable';
import { getSleepHistory, getAnalysis, getRecommendations } from '@/lib/api';
import {
  DEMO_ANALYSIS,
  DEMO_RECOMMENDATION,
  DEMO_HISTORY,
} from '@/lib/mockData';
import { SleepAnalysis, AIRecommendation, HistorySessionItem } from '@/types';

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<SleepAnalysis>(DEMO_ANALYSIS);
  const [recommendation, setRecommendation] = useState<AIRecommendation>(
    DEMO_RECOMMENDATION
  );
  const [history, setHistory] = useState<HistorySessionItem[]>(DEMO_HISTORY);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);

  useEffect(() => {
    // Attempt to load live data from FastAPI backend if available
    let mounted = true;
    const loadLiveData = async () => {
      try {
        const liveHistory = await getSleepHistory();
        if (mounted && liveHistory && liveHistory.length > 0) {
          setHistory(liveHistory);
          const latestId = liveHistory[0].id;
          const liveAnalysis = await getAnalysis(latestId);
          if (mounted && liveAnalysis) {
            setAnalysis(liveAnalysis);
          }
          const liveRec = await getRecommendations(latestId);
          if (mounted && liveRec) {
            setRecommendation(liveRec);
          }
          setIsDemoData(false);
        }
      } catch (err) {
        // Backend not yet reachable; gracefully falls back to clear demo dataset
        if (mounted) {
          setIsDemoData(true);
        }
      }
    };

    loadLiveData();
    return () => {
      mounted = false;
    };
  }, []);

  const formatHoursMins = (minutes: number = 0) => {
    const safeMins = Math.max(0, Math.round(minutes || 0));
    const h = Math.floor(safeMins / 60);
    const m = safeMins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Heading */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
              Polysomnography Laboratory
            </span>
            {isDemoData && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center space-x-1">
                <span>Demo Data Mode</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Welcome to EEG Sleep AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Automated electroencephalogram epoch analysis for sleep stage classification
            paired with Gemini LLM personalised sleep recommendations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/upload"
            className="inline-flex items-center space-x-2 text-xs font-semibold bg-brand-primary hover:bg-blue-900 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New EEG</span>
          </Link>
          <Link
            href={`/analysis/${analysis.id}`}
            className="inline-flex items-center space-x-2 text-xs font-semibold bg-white border border-slate-300 hover:border-slate-400 text-slate-700 px-4 py-2.5 rounded-xl shadow-2xs transition-colors"
          >
            <span>View Full Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Demo Notice Banner if in demo mode */}
      {isDemoData && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl px-4 py-3 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Sample Demo Polysomnography:</strong> Currently showing baseline demo
              metrics. Connect FastAPI at <code>http://localhost:8000</code> to ingest live patient
              recordings.
            </span>
          </div>
          <Link
            href="/upload"
            className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline whitespace-nowrap"
          >
            Upload EDF/CSV &rarr;
          </Link>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Sleep Time"
          value={formatHoursMins(analysis.totalSleepMinutes ?? analysis.durationMinutes)}
          subtitle={`Efficiency: ${analysis.efficiency}%`}
          icon={Clock}
          accentColor="blue"
          trend={{ value: '+24m', isPositive: true, label: 'vs baseline' }}
        />
        <DashboardCard
          title="Deep Sleep (N3)"
          value={formatHoursMins(analysis.deepSleepMinutes)}
          subtitle={`${analysis.stageDistribution.n3}% of total sleep`}
          icon={Moon}
          accentColor="indigo"
          badge="Optimal"
        />
        <DashboardCard
          title="REM Sleep"
          value={formatHoursMins(analysis.remSleepMinutes)}
          subtitle={`${analysis.stageDistribution.rem}% of total sleep`}
          icon={Sparkles}
          accentColor="purple"
          badge="Normal"
        />
        <DashboardCard
          title="Light Sleep (N1/N2)"
          value={formatHoursMins(analysis.lightSleepMinutes)}
          subtitle={`${Number(((analysis.stageDistribution.n1 || 0) + (analysis.stageDistribution.n2 || 0)).toFixed(1))}% total`}
          icon={Activity}
          accentColor="blue"
        />
        <DashboardCard
          title="Awakenings"
          value={`${analysis.awakenings} events`}
          subtitle={`${analysis.wakeMinutes}m awake overnight`}
          icon={AlertTriangle}
          accentColor="amber"
          trend={{ value: '-1', isPositive: true, label: 'vs last week' }}
        />
      </div>

      {/* Visual Analytics Row: Hypnogram & Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SleepHypnogram data={analysis.hypnogram} isDemo={isDemoData} />
        </div>
        <div className="lg:col-span-1">
          <SleepStageChart
            distribution={analysis.stageDistribution}
            isDemo={isDemoData}
          />
        </div>
      </div>

      {/* Latest AI Recommendations Card */}
      <div>
        <RecommendationCard recommendation={recommendation} isDemo={isDemoData} />
      </div>

      {/* Recent Sleep Analysis History */}
      <div>
        <HistoryTable sessions={history} isDemo={isDemoData} />
      </div>
    </div>
  );
}

