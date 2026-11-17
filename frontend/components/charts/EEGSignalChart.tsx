'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { EEGSignalPoint } from '@/types';
import { Activity, Sliders, Info } from 'lucide-react';

interface EEGSignalChartProps {
  signals?: EEGSignalPoint[];
  epochNumber?: number;
  stageName?: string;
}

export const EEGSignalChart: React.FC<EEGSignalChartProps> = ({
  signals = [],
  epochNumber = 1,
  stageName = 'Stage N3 (Deep Sleep Slow Waves)',
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'c3_a2' | 'fp1_f3' | 'o1_a2'>('c3_a2');

  const channelMeta = {
    c3_a2: {
      name: 'EEG C3-A2 (Central)',
      color: '#1e3a8a',
      desc: 'Optimal for sleep spindles & K-complexes',
    },
    fp1_f3: {
      name: 'EEG Fp1-F3 (Frontal)',
      color: '#7c3aed',
      desc: 'High sensitivity to slow-wave delta activity',
    },
    o1_a2: {
      name: 'EEG O1-A2 (Occipital)',
      color: '#0284c7',
      desc: 'Dominant for awake alpha rhythm (8-12 Hz)',
    },
  };

  const currentChannel = channelMeta[selectedChannel];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-primary" />
            <h4 className="text-sm font-semibold text-slate-900">
              EEG Biosignal Visualisation
            </h4>
            <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-medium">
              Epoch #{epochNumber} (30s)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard 10-20 montage polysomnography voltage signal (100 Hz sampling)
          </p>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
          {(['c3_a2', 'fp1_f3', 'o1_a2'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                selectedChannel === ch
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ch.toUpperCase().replace('_', '-')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg mb-3 border border-slate-200/60">
        <div>
          Active Lead:{' '}
          <span className="font-semibold text-slate-800">{currentChannel.name}</span>
          <span className="text-slate-400 mx-2">|</span>
          <span className="text-slate-500">{currentChannel.desc}</span>
        </div>
        <span className="text-[11px] font-mono font-medium text-slate-600">
          Scale: ±60 µV
        </span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={signals}
            margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
            <XAxis
              dataKey="timeOffset"
              tickFormatter={(v) => `${v.toFixed(1)}s`}
              tick={{ fontSize: 10, fill: '#64748b' }}
              stroke="#cbd5e1"
            />
            <YAxis
              domain={[-60, 60]}
              ticks={[-50, -25, 0, 25, 50]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              unit="µV"
              stroke="#cbd5e1"
            />
            <Tooltip
              formatter={(value: any) => [`${value} µV`, currentChannel.name]}
              labelFormatter={(label) => `Time Offset: ${label}s`}
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#fff',
                fontSize: '11px',
                borderRadius: '8px',
                border: 'none',
              }}
            />
            <Line
              type="monotone"
              dataKey={selectedChannel}
              stroke={currentChannel.color}
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
        <span className="flex items-center space-x-1">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Epoch Classification: <strong className="text-slate-700">{stageName}</strong></span>
        </span>
        <span className="font-mono text-slate-400">Bandpass Filter: 0.3 Hz - 35 Hz</span>
      </div>
    </div>
  );
};

