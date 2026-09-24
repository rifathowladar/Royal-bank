import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  period?: string;
  change?: {
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
  };
  icon: React.ElementType;
  badge?: string | { text: string; variant?: string };
  variant?: 'default' | 'amber' | 'emerald' | 'rose' | 'indigo';
  onClick?: () => void;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  subtitle,
  period,
  change,
  icon: Icon,
  badge,
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    default: {
      border: 'border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      accentGlow: 'hover:border-slate-300 dark:hover:border-slate-700',
    },
    amber: {
      border: 'border-amber-200/60 dark:border-amber-900/40',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      accentGlow: 'hover:border-amber-400 dark:hover:border-amber-700',
    },
    emerald: {
      border: 'border-emerald-200/60 dark:border-emerald-900/40',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      accentGlow: 'hover:border-emerald-400 dark:hover:border-emerald-700',
    },
    rose: {
      border: 'border-rose-200/60 dark:border-rose-900/40',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      accentGlow: 'hover:border-rose-400 dark:hover:border-rose-700',
    },
    indigo: {
      border: 'border-indigo-200/60 dark:border-indigo-900/40',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      accentGlow: 'hover:border-indigo-400 dark:hover:border-indigo-700',
    },
  }[variant];

  const badgeText = typeof badge === 'object' ? badge?.text : badge;
  const badgeVariant = typeof badge === 'object' ? badge?.variant : 'default';

  const resolvedSubtitle = subtitle || (period ? `vs ${period}` : undefined);

  let changeTrend: 'up' | 'down' | 'neutral' = 'neutral';
  let changeDisplay = '';
  if (change) {
    if (change.trend) {
      changeTrend = change.trend;
    } else if (change.isPositive !== undefined) {
      changeTrend = change.isPositive ? 'up' : 'down';
    }
    const rawVal = change.value;
    changeDisplay = typeof rawVal === 'number' ? `${rawVal > 0 ? '+' : ''}${rawVal}%` : String(rawVal);
  }

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white dark:bg-slate-900/90 rounded-2xl p-5 border ${
        variantStyles.border
      } ${variantStyles.accentGlow} shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase truncate">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {value}
            </h3>
            {badgeText && (
              <span
                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  badgeVariant === 'success'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : badgeVariant === 'warning'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : badgeVariant === 'danger'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>
        </div>

        <div className={`p-3 rounded-xl shrink-0 ${variantStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(resolvedSubtitle || change) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">{resolvedSubtitle}</span>
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 font-mono font-medium ${
                changeTrend === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : changeTrend === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500'
              }`}
            >
              {changeTrend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
              {changeTrend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
              {changeTrend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              {changeDisplay}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
