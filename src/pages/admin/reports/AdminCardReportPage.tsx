import React, { useState, useEffect } from 'react';
import { AdminReportNav } from '../../../components/admin/AdminReportNav.tsx';
import { ReportFilter } from '../../../components/admin/ReportFilter.tsx';
import { ReportTable, Column } from '../../../components/admin/ReportTable.tsx';
import { ReportSummaryCard } from '../../../components/admin/ReportSummaryCard.tsx';
import { ReportChart } from '../../../components/admin/ReportChart.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminReportService, PaginatedReportResult } from '../../../backend/services/adminReportService.ts';
import { CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';

export const AdminCardReportPage: React.FC = () => {
  const [report, setReport] = useState<PaginatedReportResult<any> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountId, setAccountId] = useState('all');
  const [customerId, setCustomerId] = useState('all');
  const [branchId, setBranchId] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('limit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await adminReportService.getCardReport({
          search,
          startDate,
          endDate,
          accountId,
          customerId,
          branchId,
          status,
          sortBy,
          sortOrder,
          page,
          pageSize,
        });
        setReport(res);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [search, startDate, endDate, accountId, customerId, branchId, status, sortBy, sortOrder, page]);

  const handleResetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setAccountId('all');
    setCustomerId('all');
    setBranchId('all');
    setStatus('all');
    setSortBy('limit');
    setSortOrder('desc');
    setPage(1);
  };

  const columns: Column<any>[] = [
    {
      key: 'card',
      header: 'Card Instrument',
      render: (c) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-5 rounded bg-slate-900 dark:bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[9px] shrink-0 border border-slate-700">
            EMV
          </div>
          <div>
            <div className="font-bold font-mono text-slate-900 dark:text-white">{c.cardNumberMasked}</div>
            <div className="text-[10px] text-slate-400">{c.network} · Exp {c.expiry}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Cardholder',
      render: (c) => (
        <div className="font-semibold text-slate-900 dark:text-white">{c.customer}</div>
      ),
    },
    {
      key: 'cardType',
      header: 'Card Type',
      render: (c) => (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
          {c.cardType}
        </span>
      ),
    },
    {
      key: 'limit',
      header: 'Limit & Velocity',
      align: 'right',
      render: (c) => (
        <div className="font-mono tabular-nums text-right">
          <div className="font-bold text-slate-900 dark:text-white">
            ${c.limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400">
            Spent: ${c.spendingCurrent.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: 'transactions',
      header: 'Settled Transactions',
      align: 'center',
      render: (c) => (
        <span className="font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-300">
          {c.transactions}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (c) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
          <CheckCircle2 className="w-3.5 h-3.5" /> {c.status}
        </span>
      ),
    },
  ];

  const exportHeaders = ['Card Number', 'Network', 'Cardholder', 'Type', 'Limit', 'Current Spend', 'Transactions', 'Status'];
  const exportRows = (report?.data || []).map((c) => [
    c.cardNumberMasked,
    c.network,
    c.customer,
    c.cardType,
    c.limit,
    c.spendingCurrent,
    c.transactions,
    c.status,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Card Issuance & Velocity Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Credit, debit, and prepaid card usage, spending limits, interchange yield, and security locks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu
            reportTitle="Card Report"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-cards-report"
          />
        </div>
      </div>

      <AdminReportNav />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(report?.summaryMetrics || []).map((metric, idx) => (
          <ReportSummaryCard key={idx} metric={metric} />
        ))}
      </div>

      {/* Chart */}
      {report?.chartData && (
        <ReportChart
          title="Card Issuance Spend Allocation"
          subtitle="Aggregate transaction volume filtered by card product class"
          labels={report.chartData.labels}
          datasets={report.chartData.datasets}
        />
      )}

      {/* Filters */}
      <ReportFilter
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        startDate={startDate}
        onStartDateChange={(v) => {
          setStartDate(v);
          setPage(1);
        }}
        endDate={endDate}
        onEndDateChange={(v) => {
          setEndDate(v);
          setPage(1);
        }}
        accountId={accountId}
        onAccountIdChange={(v) => {
          setAccountId(v);
          setPage(1);
        }}
        customerId={customerId}
        onCustomerIdChange={(v) => {
          setCustomerId(v);
          setPage(1);
        }}
        branchId={branchId}
        onBranchIdChange={(v) => {
          setBranchId(v);
          setPage(1);
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        statusOptions={[
          { label: 'All Statuses', value: 'all' },
          { label: 'Active Cards', value: 'active' },
          { label: 'Frozen / Locked', value: 'frozen' },
          { label: 'Blocked', value: 'blocked' },
        ]}
        sortBy={sortBy}
        onSortByChange={(v) => {
          setSortBy(v);
          setPage(1);
        }}
        sortOrder={sortOrder}
        onSortOrderChange={(v) => {
          setSortOrder(v);
          setPage(1);
        }}
        sortOptions={[
          { label: 'Credit / Spend Limit', value: 'limit' },
          { label: 'Cardholder Name', value: 'customer' },
          { label: 'Transactions Count', value: 'transactions' },
        ]}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <ReportTable
        columns={columns}
        data={report?.data || []}
        loading={loading}
        totalItems={report?.total || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key) => {
          if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(key);
            setSortOrder('desc');
          }
        }}
      />
    </div>
  );
};
