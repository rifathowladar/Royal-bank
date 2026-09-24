import React from 'react';
import { Search, RotateCcw, Filter, Calendar, Building2, User, Wallet, Activity } from 'lucide-react';
import { db } from '../../backend/mockApi/storage.ts';

export interface ReportFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  accountId: string;
  onAccountIdChange: (value: string) => void;
  customerId: string;
  onCustomerIdChange: (value: string) => void;
  branchId: string;
  onBranchIdChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions?: Array<{ label: string; value: string }>;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  sortOptions?: Array<{ label: string; value: string }>;
  onReset: () => void;
  showAccountFilter?: boolean;
  showCustomerFilter?: boolean;
  showBranchFilter?: boolean;
  showStatusFilter?: boolean;
}

export const ReportFilter: React.FC<ReportFilterProps> = ({
  search,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  accountId,
  onAccountIdChange,
  customerId,
  onCustomerIdChange,
  branchId,
  onBranchIdChange,
  status,
  onStatusChange,
  statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Active / Completed', value: 'completed' },
    { label: 'Pending / Review', value: 'pending' },
    { label: 'Flagged / Blocked', value: 'flagged' },
  ],
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  sortOptions = [
    { label: 'Date (Recent First)', value: 'timestamp' },
    { label: 'Amount (High to Low)', value: 'amount' },
  ],
  onReset,
  showAccountFilter = true,
  showCustomerFilter = true,
  showBranchFilter = true,
  showStatusFilter = true,
}) => {
  const accounts = db.accounts;
  const customers = db.customers;
  const branches = db.branches;

  const hasActiveFilters =
    search ||
    startDate ||
    endDate ||
    (accountId && accountId !== 'all') ||
    (customerId && customerId !== 'all') ||
    (branchId && branchId !== 'all') ||
    (status && status !== 'all');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs mb-6 space-y-3">
      {/* Top Search & Primary Filters Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, customer name, reference, or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-royal-500"
          />
        </div>

        {/* Date Filter Range */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="date"
              aria-label="Start date filter"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-royal-500"
              title="From date"
            />
          </div>
          <span className="text-xs text-slate-400">to</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="date"
              aria-label="End date filter"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-royal-500"
              title="To date"
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-royal-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
            title="Toggle sort order"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {/* Secondary Row: Account, Customer, Branch, Status Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Account filter */}
        {showAccountFilter && (
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={accountId}
              onChange={(e) => onAccountIdChange(e.target.value)}
              className="px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountNumber} ({acc.name.slice(0, 18)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Customer filter */}
        {showCustomerFilter && (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={customerId}
              onChange={(e) => onCustomerIdChange(e.target.value)}
              className="px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.customerNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Branch filter */}
        {showBranchFilter && (
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={branchId}
              onChange={(e) => onBranchIdChange(e.target.value)}
              className="px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status filter */}
        {showStatusFilter && (
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Status: {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
