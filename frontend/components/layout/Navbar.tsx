'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, UploadCloud, Bell, Wifi, WifiOff } from 'lucide-react';
import { checkBackendHealth } from '@/lib/api';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const verifyHealth = async () => {
      const res = await checkBackendHealth();
      if (mounted) {
        setBackendOnline(res.online);
      }
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800">
              Polysomnography Laboratory
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Backend status badge */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            backendOnline === null
              ? 'bg-slate-50 text-slate-500 border-slate-200'
              : backendOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title={
            backendOnline
              ? 'Connected to FastAPI backend (http://localhost:8000)'
              : 'FastAPI EEG engine standby'
          }
        >
          {backendOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Engine: Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="hidden sm:inline">Engine: Standby</span>
            </>
          )}
        </div>

        {/* Upload EEG Button */}
        <Link
          href="/upload"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-brand-primary hover:bg-blue-900 text-white px-3.5 py-2 rounded-lg shadow-sm transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">Upload EEG</span>
        </Link>

        {/* User profile avatar */}
        <div className="flex items-center pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-purple text-white flex items-center justify-center text-xs font-bold">
            RS
          </div>
        </div>
      </div>
    </header>
  );
};

