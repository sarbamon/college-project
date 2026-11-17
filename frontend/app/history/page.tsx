'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, UploadCloud, RefreshCw, AlertCircle } from 'lucide-react';
import { HistoryTable } from '@/components/history/HistoryTable';
import { getSleepHistory } from '@/lib/api';
import { DEMO_HISTORY } from '@/lib/mockData';
import { HistorySessionItem } from '@/types';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<HistorySessionItem[]>(DEMO_HISTORY);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getSleepHistory();
      if (data && data.length > 0) {
        setSessions(data);
        setIsDemo(false);
      } else {
        setSessions(DEMO_HISTORY);
        setIsDemo(true);
      }
    } catch {
      setSessions(DEMO_HISTORY);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Audit & Longitudinal Archive
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Sleep Analysis History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review past polysomnography sessions, architecture distributions, and model logs.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchHistory}
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:border-slate-400 px-3 py-2 rounded-lg transition-colors shadow-2xs"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/upload"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-brand-primary hover:bg-blue-900 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Recording</span>
          </Link>
        </div>
      </div>

      {/* Main Table */}
      <HistoryTable sessions={sessions} />
    </div>
  );
}

