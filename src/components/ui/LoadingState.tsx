import React from 'react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
  type?: 'card' | 'table' | 'spinner';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Retrieving secure records...',
  rows = 4,
  type = 'table',
  className = '',
}) => {
  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-royal-600 dark:border-slate-700 dark:border-t-royal-400 animate-spin" />
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">{message}</p>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 divide-y divide-slate-100 dark:divide-slate-800 animate-pulse ${className}`}>
      <div className="pb-4 flex justify-between items-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
      </div>
      <div className="py-2 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-36" />
                <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
              </div>
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
          </div>
        ))}
      </div>
      <div className="pt-3 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">{message}</p>
      </div>
    </div>
  );
};
