'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  FileSpreadsheet,
  Bot,
} from 'lucide-react';
import { HistorySessionItem } from '@/types';

interface HistoryTableProps {
  sessions: HistorySessionItem[];
  isDemo?: boolean;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  sessions,
  isDemo = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [efficiencyFilter, setEfficiencyFilter] = useState<'all' | 'high' | 'moderate'>(
    'all'
  );

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.date.includes(searchTerm) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (efficiencyFilter === 'high') return session.efficiency >= 85;
    if (efficiencyFilter === 'moderate') return session.efficiency < 85;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header with Search and Filtering */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">
              EEG Sleep Recording Archive
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {sessions.length} polysomnography sessions analyzed
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file, date, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary w-48 sm:w-60"
            />
          </div>

          {/* Efficiency Filter */}
          <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 text-xs">
            <button
              onClick={() => setEfficiencyFilter('all')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                efficiencyFilter === 'all'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setEfficiencyFilter('high')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                efficiencyFilter === 'high'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              &gt;85% Eff
            </button>
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              <th className="py-3.5 px-4">Session & File</th>
              <th className="py-3.5 px-4">Recording Date</th>
              <th className="py-3.5 px-4">Total Sleep</th>
              <th className="py-3.5 px-4">Efficiency</th>
              <th className="py-3.5 px-4">Stage Architecture</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No polysomnography sessions matching criteria.
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* File info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-blue-50 text-brand-primary">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 max-w-[200px] truncate">
                          {session.fileName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {session.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{session.date}</span>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDuration(session.durationMinutes)}</span>
                    </div>
                  </td>

                  {/* Efficiency */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        session.efficiency >= 85
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{session.efficiency}%</span>
                    </span>
                  </td>

                  {/* Mini architecture bar */}
                  <td className="py-3.5 px-4">
                    <div className="w-36">
                      <div className="h-2 w-full rounded-full flex overflow-hidden bg-slate-100">
                        <div
                          style={{ width: `${session.deepPercent}%` }}
                          className="bg-brand-primary"
                          title={`Deep: ${session.deepPercent}%`}
                        />
                        <div
                          style={{ width: `${session.remPercent}%` }}
                          className="bg-purple-500"
                          title={`REM: ${session.remPercent}%`}
                        />
                        <div
                          style={{ width: `${session.lightPercent}%` }}
                          className="bg-sky-400"
                          title={`Light: ${session.lightPercent}%`}
                        />
                        <div
                          style={{ width: `${session.wakePercent}%` }}
                          className="bg-amber-400"
                          title={`Wake: ${session.wakePercent}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>{session.deepPercent}% Deep</span>
                        <span>{session.remPercent}% REM</span>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/assistant?analysisId=${session.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Consult AI Assistant"
                      >
                        <Bot className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/analysis/${session.id}`}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-primary hover:text-blue-900 bg-blue-50/70 hover:bg-blue-100/70 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

