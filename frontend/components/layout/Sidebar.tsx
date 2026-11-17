'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  Activity,
  Bot,
  History,
  Settings,
  Brain,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'EEG Upload',
    href: '/upload',
    icon: UploadCloud,
  },
  {
    name: 'Sleep Analysis',
    href: '/analysis/psg-rec-8821',
    icon: Activity,
  },
  {
    name: 'AI Sleep Assistant',
    href: '/assistant',
    icon: Bot,
  },
  {
    name: 'Sleep History',
    href: '/history',
    icon: History,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/analysis')) return pathname.startsWith('/analysis');
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-purple flex items-center justify-center text-white shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">
                  EEG Sleep
                </span>
                <span className="font-bold text-brand-purple tracking-tight text-base">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase block -mt-0.5">
                Clinical Analytics
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Clinical Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-50/80 text-brand-primary font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Research & Compliance Badge */}
        <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center space-x-2 text-slate-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>FastAPI + Gemini AI</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Polysomnography epoch scoring with LLM-assisted sleep hygiene explanation.
          </p>
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            MCA Research Project v1.0
          </div>
        </div>
      </aside>
    </>
  );
};

