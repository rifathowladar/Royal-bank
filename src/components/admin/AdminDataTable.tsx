import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';
import { LoadingState } from '../ui/LoadingState.tsx';

export interface ColumnDef<T> {
  key?: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export type Column<T> = ColumnDef<T>;

export interface AdminDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyDescription?: string;
  page?: number;
  totalPages?: number;
  totalRecords?: number;
  pageSize?: number;
  onPageChange?: (newPage: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (key: string) => void;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string;
  keyExtractor?: (row: T) => string;
}

export function AdminDataTable<T>({
  columns,
  data,
  loading,
  isLoading,
  emptyMessage,
  emptyTitle,
  emptySubtitle,
  emptyDescription,
  page = 1,
  totalPages = 1,
  totalRecords,
  pageSize = 10,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  onRowClick,
  rowKey,
  keyExtractor,
}: AdminDataTableProps<T>) {
  const isDataLoading = isLoading ?? loading ?? false;
  const resolvedEmptyMsg = emptyTitle ?? emptyMessage ?? 'No records found';
  const resolvedEmptySub = emptyDescription ?? emptySubtitle ?? 'Try modifying your search queries or resetting active filters.';
  const resolvedRowKey = keyExtractor ?? rowKey ?? ((row: any) => row.id || JSON.stringify(row));

  if (isDataLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs">
        <LoadingState type="table" message="Querying distributed banking ledger records..." />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {columns.map((col, idx) => {
                const colKey = col.key || `col-${idx}`;
                const isSorted = sortBy === colKey;
                return (
                  <th
                    key={colKey}
                    scope="col"
                    className={`py-3.5 px-4 ${col.className || ''} ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {col.sortable && onSortChange && col.key ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(col.key!)}
                        className="group inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300 hover:text-royal-600 dark:hover:text-amber-400 focus:outline-hidden transition-colors cursor-pointer uppercase tracking-wider"
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortOrder === 'desc' ? (
                            <ArrowDown className="w-3.5 h-3.5 text-royal-600 dark:text-amber-400" />
                          ) : (
                            <ArrowUp className="w-3.5 h-3.5 text-royal-600 dark:text-amber-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 opacity-60" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                      <Layers className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {resolvedEmptyMsg}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {resolvedEmptySub}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const id = resolvedRowKey(row);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      onRowClick
                        ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    {columns.map((col, idx) => {
                      const colKey = col.key || `col-${idx}`;
                      const cellContent = col.accessor
                        ? col.accessor(row)
                        : col.render
                        ? col.render(row)
                        : (row as any)[colKey];
                      return (
                        <td
                          key={`${id}-${colKey}`}
                          className={`py-3.5 px-4 text-slate-700 dark:text-slate-300 ${
                            col.className || ''
                          } ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && onPageChange && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span>
              Showing{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                {data.length > 0 ? (page - 1) * pageSize + 1 : 0}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                {Math.min(page * pageSize, totalRecords ?? data.length)}
              </strong>{' '}
              of{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                {totalRecords ?? data.length}
              </strong>{' '}
              entries
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono font-medium text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
