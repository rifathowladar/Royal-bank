import React, { useState, useEffect } from 'react';
import { AdminReportNav } from '../../../components/admin/AdminReportNav.tsx';
import { ReportFilter } from '../../../components/admin/ReportFilter.tsx';
import { ReportTable, Column } from '../../../components/admin/ReportTable.tsx';
import { ReportSummaryCard } from '../../../components/admin/ReportSummaryCard.tsx';
import { ReportChart } from '../../../components/admin/ReportChart.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminReportService, RevenueReportItem, RevenueBreakdown } from '../../../backend/services/adminReportService.ts';
import { DollarSign, CheckCircle2, TrendingUp, Layers } from 'lucide-react';

export const AdminRevenueReportPage: React.FC = () => {
  const [items, setItems] = useState<RevenueReportItem[]>([]);
  const [breakdown, setBreakdown] = useState<RevenueBreakdown | null>(null);
  const [summaryMetrics, setSummaryMetrics] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountId, setAccountId] = useState('all');
  const [customerId, setCustomerId] = useState('all');
  const [branchId, setBranchId] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('feeOrInterestUSD');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await adminReportService.getRevenueReport({
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
        setItems(res.data);
        setBreakdown(res.breakdown);
        setSummaryMetrics(res.summaryMetrics);
        setChartData(res.chartData);
        setTotal(res.total);
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
    setSortBy('feeOrInterestUSD');
    setSortOrder('desc');
    setPage(1);
  };

  const columns: Column<RevenueReportItem>[] = [
    {
      key: 'category',
      header: 'Revenue Stream',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{r.category}</span>
          </div>
          <div className="text-[10px] text-slate-400">{r.source}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Operational Description',
      render: (r) => (
        <span className="text-slate-600 dark:text-slate-300 text-xs">
          {r.description}
        </span>
      ),
    },
    {
      key: 'volumeCount',
      header: 'Transaction Count',
      align: 'center',
      render: (r) => (
        <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
          {r.volumeCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'effectiveRate',
      header: 'Tariff / Margin Rate',
      render: (r) => (
        <span className="font-mono text-[11px] text-slate-500 font-semibold">
          {r.effectiveRate}
        </span>
      ),
    },
    {
      key: 'grossAmountUSD',
      header: 'Underlying Volume',
      align: 'right',
      render: (r) => (
        <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
          ${r.grossAmountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'feeOrInterestUSD',
      header: 'Net Revenue Earned',
      align: 'right',
      render: (r) => (
        <span className="font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          +${r.feeOrInterestUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Recognition Status',
      align: 'center',
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" /> {r.status}
        </span>
      ),
    },
  ];

  const exportHeaders = ['Stream', 'Source', 'Description', 'Volume Count', 'Gross Amount', 'Net Revenue', 'Rate', 'Status'];
  const exportRows = items.map((r) => [
    r.category,
    r.source,
    r.description,
    r.volumeCount,
    r.grossAmountUSD,
    r.feeOrInterestUSD,
    r.effectiveRate,
    r.status,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Consolidated Revenue & Net Interest Margin Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            P&L performance, non-interest fee earnings, credit portfolio yields, and treasury margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu
            reportTitle="Revenue Report"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-revenue-report"
          />
        </div>
      </div>

      <AdminReportNav />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((metric, idx) => (
          <ReportSummaryCard key={idx} metric={metric} />
        ))}
      </div>

      {/* Explicit Financial Breakdown Cards as requested in prompt */}
      {breakdown && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Transaction Fees</span>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
              ${breakdown.transactionFeesUSD.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">QR Fees</span>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
              ${breakdown.qrFeesUSD.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Card Fees</span>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
              ${breakdown.cardFeesUSD.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Loan Interest</span>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
              ${breakdown.loanInterestUSD.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Other Revenue</span>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
              ${breakdown.otherRevenueUSD.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Total Revenue</span>
            <div className="text-sm font-bold font-mono text-emerald-800 dark:text-emerald-200 mt-1 tabular-nums">
              ${breakdown.totalRevenueUSD.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData && (
        <ReportChart
          title="Consolidated Net Revenue by Operational Line"
          subtitle="Annualized earnings contributions across non-interest fees and credit underwriting"
          labels={chartData.labels}
          datasets={chartData.datasets}
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
          { label: 'All Recognition Statuses', value: 'all' },
          { label: 'Realized Income', value: 'realized' },
          { label: 'Accruing Interest', value: 'accruing' },
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
          { label: 'Net Revenue Earned', value: 'feeOrInterestUSD' },
          { label: 'Underlying Volume', value: 'grossAmountUSD' },
          { label: 'Transaction Count', value: 'volumeCount' },
        ]}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <ReportTable
        columns={columns}
        data={items}
        loading={loading}
        totalItems={total}
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
