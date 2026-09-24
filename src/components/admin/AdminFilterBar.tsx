import React from 'react';
import { Search, Filter, X, Download, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button.tsx';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id?: string;
  label: string;
  options: FilterOption[];
  currentValue?: string;
  value?: string;
  onChange: (val: string) => void;
}

export interface AdminFilterBarProps {
  searchQuery?: string;
  search?: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  totalResults?: number;
  onReset?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  isExporting?: boolean;
  extraActions?: React.ReactNode;
}

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
  searchQuery,
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  totalResults,
  onReset,
  onRefresh,
  onExport,
  isExporting,
  extraActions,
}) => {
  const query = searchQuery ?? search ?? '';
  const hasActiveFilters =
    query.trim().length > 0 ||
    filters.some((f) => {
      const val = f.currentValue ?? f.value ?? '';
      return val !== 'all' && val !== '';
    });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500 transition-all"
          />
          {query && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              title="Refresh ledger state"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync
            </Button>
          )}

          {onExport && (
            <Button
              size="sm"
              variant="outline"
              onClick={onExport}
              disabled={isExporting}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          )}

          {extraActions}
        </div>
      </div>

      {/* Filter Select Dropdowns Bar */}
      {(filters.length > 0 || totalResults !== undefined) && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </span>

            {filters.map((f, idx) => {
              const filterVal = f.currentValue ?? f.value ?? '';
              const filterId = f.id || `filter-${f.label}-${idx}`;
              return (
                <div key={filterId} className="flex items-center">
                  <select
                    value={filterVal}
                    onChange={(e) => f.onChange(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-royal-500"
                  >
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {f.label}: {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}

            {hasActiveFilters && onReset && (
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors font-medium cursor-pointer"
              >
                <X className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>

          {totalResults !== undefined && (
            <div className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-mono">
              Found <strong className="text-slate-800 dark:text-slate-200">{totalResults}</strong> records
            </div>
          )}
        </div>
      )}
    </div>
  );
};
