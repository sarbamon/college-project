import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
  compact?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing EEG data...',
  subtext = 'Neural model running feature extraction & epoch classification',
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-slate-500 py-3">
        <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
        <span className="text-xs font-medium">{message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200/80 shadow-sm text-center">
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-brand-primary animate-spin" />
        </div>
      </div>
      <h4 className="text-base font-semibold text-slate-900 mb-1">{message}</h4>
      <p className="text-xs text-slate-500 max-w-sm">{subtext}</p>
    </div>
  );
};

