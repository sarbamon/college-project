import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'blue' | 'purple' | 'indigo' | 'amber' | 'emerald';
  badge?: string;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue',
  badge,
  className = '',
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  };

  const selectedColors = colorMap[accentColor] || colorMap.blue;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${selectedColors.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium border ${selectedColors.badge}`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-500 mt-1 font-normal">{subtitle}</p>}

      {trend && (
        <div className="flex items-center space-x-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-slate-600'
            }`}
          >
            {trend.value}
          </span>
          {trend.label && <span className="text-slate-500">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};

