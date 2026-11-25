'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Clock,
  Bell,
  Sliders,
  Server,
  Save,
  CheckCircle2,
  RefreshCw,
  Shield,
  Moon,
} from 'lucide-react';
import { checkBackendHealth } from '@/lib/api';

export default function SettingsPage() {
  const [name, setName] = useState('Dr. R. Sharma (Researcher)');
  const [email, setEmail] = useState('researcher@medical.univ.edu');
  const [targetBedtime, setTargetBedtime] = useState('22:45');
  const [targetWakeTime, setTargetWakeTime] = useState('06:45');
  const [targetDuration, setTargetDuration] = useState(8);

  const [notifyAnalysis, setNotifyAnalysis] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(true);

  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const [backendStatus, setBackendStatus] = useState<string>('Testing...');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const testConnection = async () => {
    setBackendStatus('Pinging backend...');
    const result = await checkBackendHealth();
    setBackendOnline(result.online);
    setBackendStatus(result.online ? 'Online & Operational' : 'Offline / Standby');
  };

  useEffect(() => {
    testConnection();
    try {
      const saved = localStorage.getItem('eeg_sleep_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.targetBedtime) setTargetBedtime(parsed.targetBedtime);
        if (parsed.targetWakeTime) setTargetWakeTime(parsed.targetWakeTime);
        if (parsed.targetDuration) setTargetDuration(parsed.targetDuration);
        if (parsed.notifyAnalysis !== undefined) setNotifyAnalysis(parsed.notifyAnalysis);
        if (parsed.weeklyInsights !== undefined) setWeeklyInsights(parsed.weeklyInsights);
        if (parsed.backendUrl) setBackendUrl(parsed.backendUrl);
      }
    } catch {}
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem(
        'eeg_sleep_settings',
        JSON.stringify({
          name,
          email,
          targetBedtime,
          targetWakeTime,
          targetDuration,
          notifyAnalysis,
          weeklyInsights,
          backendUrl,
        })
      );
    } catch {}
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System & Profile Settings
        </h1>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Preferences successfully updated and stored in session cache.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: User Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold text-slate-900">User & Researcher Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Name / Clinical Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-primary text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-primary text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Target Sleep Schedule Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-brand-purple" />
            <h3 className="text-sm font-bold text-slate-900">Sleep Schedule Targets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Bedtime</label>
              <input
                type="time"
                value={targetBedtime}
                onChange={(e) => setTargetBedtime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-primary text-slate-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Wake-up Time</label>
              <input
                type="time"
                value={targetWakeTime}
                onChange={(e) => setTargetWakeTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-primary text-slate-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Duration (Hours)</label>
              <input
                type="number"
                min={5}
                max={12}
                step={0.5}
                value={targetDuration}
                onChange={(e) => setTargetDuration(parseFloat(e.target.value) || 8)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-primary text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 3: FastAPI Backend Connection */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Server className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">FastAPI ML Pipeline Integration</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Backend Base URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 font-mono text-slate-800 focus:outline-none focus:border-brand-primary"
                />
                <button
                  type="button"
                  onClick={testConnection}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test Health</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <span className="text-slate-600">Connection Status:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  backendOnline
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {backendStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Notifications & Theme */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Notifications & Alerts</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyAnalysis}
                onChange={(e) => setNotifyAnalysis(e.target.checked)}
                className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary w-4 h-4"
              />
              <span className="text-slate-700">
                Notify when polysomnography epoch classification completes
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={weeklyInsights}
                onChange={(e) => setWeeklyInsights(e.target.checked)}
                className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary w-4 h-4"
              />
              <span className="text-slate-700">
                Generate longitudinal sleep architecture synthesis
              </span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 text-xs font-semibold bg-brand-primary hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

