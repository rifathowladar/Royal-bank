import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { ReportSummaryMetric } from '../../backend/types/index.ts';

export interface ReportSummaryCardProps {
  metric: ReportSummaryMetric;
}

export const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({ metric }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight truncate">
          {metric.title}
        </span>
        {metric.variant === 'warning' && (
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        )}
        {metric.variant === 'danger' && (
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
        )}
        {metric.variant === 'success' && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        )}
      </div>

      <div className="mt-2.5">
        <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
          {metric.value}
        </div>

        {(metric.change || metric.subtitle) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {metric.change && (
              <span
                className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${
                  metric.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {metric.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {metric.change}
              </span>
            )}
            {metric.change && metric.subtitle && (
              <span className="text-slate-300 dark:text-slate-700">·</span>
            )}
            {metric.subtitle && (
              <span className="text-slate-500 dark:text-slate-400 truncate">
                {metric.subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
