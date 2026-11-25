'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Bot,
  Sparkles,
  ArrowLeft,
  Activity,
  Layers,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AIChat } from '@/components/assistant/AIChat';
import { RecommendationCard } from '@/components/assistant/RecommendationCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { getRecommendations, getAnalysis, getSleepHistory } from '@/lib/api';
import {
  DEMO_RECOMMENDATION,
  DEMO_ANALYSIS,
  DEMO_HISTORY,
} from '@/lib/mockData';
import { AIRecommendation, SleepAnalysis, HistorySessionItem } from '@/types';

function AssistantContent() {
  const searchParams = useSearchParams();
  const paramSessionId = searchParams.get('analysisId');

  const [activeSessionId, setActiveSessionId] = useState<string>(paramSessionId || '');
  const [sessions, setSessions] = useState<HistorySessionItem[]>(DEMO_HISTORY);
  const [recommendation, setRecommendation] = useState<AIRecommendation>(DEMO_RECOMMENDATION);
  const [analysis, setAnalysis] = useState<SleepAnalysis>(DEMO_ANALYSIS);

  useEffect(() => {
    let mounted = true;

    const loadSessionData = async () => {
      let targetId = activeSessionId;

      try {
        const hist = await getSleepHistory();
        if (mounted && hist && hist.length > 0) {
          setSessions(hist);
          if (!targetId) {
            targetId = hist[0].id;
            setActiveSessionId(targetId);
          }
        }
      } catch {
        // use default reference history if backend is offline
      }

      if (!targetId) {
        targetId = 'psg-rec-8821';
        if (mounted) setActiveSessionId(targetId);
      }

      if (targetId === 'psg-rec-8821' || targetId === 'demo-session-001') {
        if (mounted) {
          setRecommendation(DEMO_RECOMMENDATION);
          setAnalysis(DEMO_ANALYSIS);
        }
        return;
      }

      try {
        const [rec, ana] = await Promise.all([
          getRecommendations(targetId),
          getAnalysis(targetId),
        ]);
        if (mounted) {
          if (rec) setRecommendation(rec);
          if (ana) setAnalysis(ana);
        }
      } catch {
        if (mounted) {
          setRecommendation(DEMO_RECOMMENDATION);
          setAnalysis(DEMO_ANALYSIS);
        }
      }
    };

    loadSessionData();

    return () => {
      mounted = false;
    };
  }, [activeSessionId]);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
              Gemini LLM Sleep Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            AI Sleep Assistant & Recommendations
          </h1>
        </div>

        {/* Session selector */}
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
          <span className="text-xs text-slate-400 pl-2 font-medium">Session:</span>
          <select
            value={activeSessionId}
            onChange={(e) => setActiveSessionId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent outline-none pr-3 cursor-pointer"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fileName} ({s.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two Column Layout: Recommendations on Left, Interactive Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personalized Next Sleep Recommendations */}
        <div className="lg:col-span-6 space-y-6">
          <RecommendationCard recommendation={recommendation} />
        </div>

        {/* Right Column: Interactive Gemini Chat Interface */}
        <div className="lg:col-span-6">
          <AIChat
            key={activeSessionId}
            analysisId={activeSessionId}
            initialExplanation={analysis?.aiExplanation}
          />
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12">
          <LoadingState
            message="Initializing AI Assistant..."
            subtext="Connecting to polysomnography session context and recommendations."
          />
        </div>
      }
    >
      <AssistantContent />
    </Suspense>
  );
}
