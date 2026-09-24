import React, { useState } from 'react';

export interface ReportChartProps {
  title?: string;
  subtitle?: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const ReportChart: React.FC<ReportChartProps> = ({
  title,
  subtitle,
  labels,
  datasets,
  valuePrefix = '$',
  valueSuffix = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const primaryDataset = datasets[0] || { label: 'Volume', data: [] };
  const data = primaryDataset.data;
  const maxValue = Math.max(...data, 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-2 mb-4">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs">
            {datasets.map((ds, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-royal-700 dark:bg-amber-500" />
                <span className="font-medium">{ds.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Bar Visualization */}
      <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2">
        {labels.map((label, idx) => {
          const val = data[idx] ?? 0;
          const heightPercent = Math.max((val / maxValue) * 100, 4);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[11px] font-mono px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in duration-150">
                  <span className="font-semibold text-amber-400">{label}:</span>{' '}
                  {valuePrefix}
                  {val.toLocaleString()}
                  {valueSuffix}
                </div>
              )}

              <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-sm flex items-end overflow-hidden h-full">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isHovered
                      ? 'bg-amber-500 dark:bg-amber-400 shadow-sm'
                      : 'bg-slate-800 dark:bg-royal-600 hover:bg-slate-700'
                  }`}
                />
              </div>

              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-full text-center font-medium">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
