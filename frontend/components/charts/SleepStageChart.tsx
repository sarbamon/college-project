'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { StageDistribution } from '@/types';

interface SleepStageChartProps {
  distribution: StageDistribution;
  title?: string;
  isDemo?: boolean;
}

const STAGE_CONFIG = [
  { key: 'deep', name: 'Deep (N3)', color: '#1e3a8a', desc: 'Slow wave restorative' },
  { key: 'rem', name: 'REM Sleep', color: '#8b5cf6', desc: 'Dreaming & memory consolidation' },
  { key: 'light', name: 'Light (N1/N2)', color: '#0284c7', desc: 'Transition & spindle sleep' },
  { key: 'wake', name: 'Wakefulness', color: '#f59e0b', desc: 'Awakenings & latency' },
];

export const SleepStageChart: React.FC<SleepStageChartProps> = ({
  distribution,
  title = 'Sleep Stage Distribution',
  isDemo = false,
}) => {
  const lightTotal = Number(((distribution.n1 || 0) + (distribution.n2 || 0)).toFixed(1));

  const chartData = [
    { name: 'Deep (N3)', value: distribution.n3 || 0, color: '#1e3a8a' },
    { name: 'REM', value: distribution.rem || 0, color: '#8b5cf6' },
    { name: 'Light (N1/N2)', value: lightTotal, color: '#0284c7' },
    { name: 'Wake', value: distribution.wake || 0, color: '#f59e0b' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-700">
          <p className="font-semibold">{item.name}</p>
          <p className="text-slate-300">
            Proportion: <span className="font-bold text-white">{item.value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stage Breakdown Legend Grid */}
      <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-slate-100 text-xs">
        {STAGE_CONFIG.map((stage) => {
          let val = 0;
          if (stage.key === 'deep') val = distribution.n3;
          if (stage.key === 'rem') val = distribution.rem;
          if (stage.key === 'light') val = lightTotal;
          if (stage.key === 'wake') val = distribution.wake;

          return (
            <div key={stage.key} className="flex items-start space-x-2">
              <span
                className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                style={{ backgroundColor: stage.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-700 font-medium truncate">{stage.name}</span>
                  <span className="font-semibold text-slate-900 ml-1">{val}%</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

