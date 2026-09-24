import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, Inbox } from 'lucide-react';

export interface ReportColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export type { ReportColumn as Column };

export interface ReportTableProps<T> {
  columns: ReportColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onRowClick?: (item: T) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function ReportTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No report entries match the selected parameters.',
  totalItems,
  page,
  pageSize,
  onPageChange,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
}: ReportTableProps<T>) {
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIdx = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, totalItems);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      {/* Table Content */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
              {columns.map((col) => {
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    onClick={() => onSort?.(col.key)}
                    className={`py-3 px-4 ${alignClass} ${
                      onSort ? 'cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 select-none' : ''
                    } ${col.className || ''}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {onSort && (
                        <ArrowUpDown
                          className={`w-3 h-3 ${
                            sortBy === col.key ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              // Loading Skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-sm w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      No matching records found
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Populated Rows
              data.map((item, rowIdx) => (
                <tr
                  key={item.id || rowIdx}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';

                    return (
                      <td
                        key={col.key}
                        className={`py-3 px-4 text-slate-700 dark:text-slate-300 ${alignClass} ${
                          col.className || ''
                        }`}
                      >
                        {col.render ? col.render(item, rowIdx) : item[col.key]}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="tabular-nums">
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{startIdx}</span> to{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{endIdx}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{totalItems}</span> results
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-xs px-2 tabular-nums">
            Page <strong className="text-slate-900 dark:text-slate-100">{page}</strong> of{' '}
            <strong className="text-slate-900 dark:text-slate-100">{totalPages}</strong>
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
