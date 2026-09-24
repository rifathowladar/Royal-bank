import React, { useState, useEffect } from 'react';
import { AdminReportNav } from '../../../components/admin/AdminReportNav.tsx';
import { ReportFilter } from '../../../components/admin/ReportFilter.tsx';
import { ReportTable, Column } from '../../../components/admin/ReportTable.tsx';
import { ReportSummaryCard } from '../../../components/admin/ReportSummaryCard.tsx';
import { ReportChart } from '../../../components/admin/ReportChart.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminReportService, PaginatedReportResult } from '../../../backend/services/adminReportService.ts';
import { CheckCircle2, Clock } from 'lucide-react';

export const AdminDepositReportPage: React.FC = () => {
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
  const [sortBy, setSortBy] = useState('maturity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await adminReportService.getDepositReport({
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
    setSortBy('maturity');
    setSortOrder('asc');
    setPage(1);
  };

  const columns: Column<any>[] = [
    {
      key: 'certificateNumber',
      header: 'Certificate & Account',
      render: (d) => (
        <div>
          <div className="font-mono font-bold text-slate-900 dark:text-white">{d.certificateNumber}</div>
          <div className="text-[10px] text-slate-400 font-mono">Linked: {d.account}</div>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (d) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{d.customer}</div>
          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{d.branch}</div>
        </div>
      ),
    },
    {
      key: 'depositType',
      header: 'Deposit Type',
      render: (d) => (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-royal-50 dark:bg-royal-950/60 text-royal-700 dark:text-royal-300">
          {d.depositType}
        </span>
      ),
    },
    {
      key: 'principal',
      header: 'Principal',
      align: 'right',
      render: (d) => (
        <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
          ${d.principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'interestRate',
      header: 'Interest Yield',
      align: 'right',
      render: (d) => (
        <div className="font-mono tabular-nums text-right">
          <div className="font-bold text-emerald-600 dark:text-emerald-400">{d.interestRate}% APY</div>
          <div className="text-[10px] text-slate-400">
            +${Math.round(d.accruedInterest).toLocaleString()} at maturity
          </div>
        </div>
      ),
    },
    {
      key: 'maturity',
      header: 'Maturity Date',
      render: (d) => (
        <div className="font-mono text-[11px] tabular-nums text-slate-700 dark:text-slate-300">
          {new Date(d.maturity).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (d) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
          <CheckCircle2 className="w-3.5 h-3.5" /> {d.status}
        </span>
      ),
    },
  ];

  const exportHeaders = ['Certificate', 'Account', 'Customer', 'Deposit Type', 'Principal', 'Interest Rate', 'Maturity', 'Status'];
  const exportRows = (report?.data || []).map((d) => [
    d.certificateNumber,
    d.account,
    d.customer,
    d.depositType,
    d.principal,
    `${d.interestRate}%`,
    d.maturity,
    d.status,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Term Deposit & Certificate Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fixed deposit contracts, maturity schedules, accrued yields, and renewal retention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu
            reportTitle="Deposits Report"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-deposits-report"
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
          title="Deposit Book Asset Allocation"
          subtitle="Capital balance distributed across certificate categories"
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
          { label: 'Active Certificates', value: 'active' },
          { label: 'Matured', value: 'matured' },
          { label: 'Rolled Over', value: 'rolled_over' },
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
          { label: 'Maturity Date', value: 'maturity' },
          { label: 'Principal Amount', value: 'principal' },
          { label: 'Interest Rate', value: 'interestRate' },
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
