import React, { useState, useEffect } from 'react';
import { AdminReportNav } from '../../../components/admin/AdminReportNav.tsx';
import { ReportFilter } from '../../../components/admin/ReportFilter.tsx';
import { ReportTable, Column } from '../../../components/admin/ReportTable.tsx';
import { ReportSummaryCard } from '../../../components/admin/ReportSummaryCard.tsx';
import { ReportChart } from '../../../components/admin/ReportChart.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminReportService, PaginatedReportResult } from '../../../backend/services/adminReportService.ts';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const AdminLoanReportPage: React.FC = () => {
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
  const [sortBy, setSortBy] = useState('amount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await adminReportService.getLoanReport({
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
    setSortBy('amount');
    setSortOrder('desc');
    setPage(1);
  };

  const columns: Column<any>[] = [
    {
      key: 'loanId',
      header: 'Loan ID',
      render: (ln) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {ln.loanId}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (ln) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{ln.customer}</div>
          <div className="text-[10px] text-slate-400 font-mono">Disbursed: {new Date(ln.disbursedAt).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: 'loanType',
      header: 'Loan Type',
      render: (ln) => (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {ln.loanType}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Principal Disbursed',
      align: 'right',
      render: (ln) => (
        <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
          ${ln.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'outstanding',
      header: 'Outstanding Balance',
      align: 'right',
      render: (ln) => (
        <span className="font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
          ${ln.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'emi',
      header: 'Monthly EMI',
      align: 'right',
      render: (ln) => (
        <div className="font-mono tabular-nums text-right">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            ${ln.emi.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400">Due: {ln.nextDueDate}</div>
        </div>
      ),
    },
    {
      key: 'interestRate',
      header: 'Interest Rate',
      align: 'right',
      render: (ln) => (
        <span className="font-mono text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {ln.interestRate}% APR
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (ln) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
          <CheckCircle2 className="w-3.5 h-3.5" /> {ln.status}
        </span>
      ),
    },
  ];

  const exportHeaders = ['Loan ID', 'Customer', 'Loan Type', 'Amount Disbursed', 'Outstanding', 'EMI', 'Interest Rate', 'Status'];
  const exportRows = (report?.data || []).map((ln) => [
    ln.loanId,
    ln.customer,
    ln.loanType,
    ln.amount,
    ln.outstanding,
    ln.emi,
    `${ln.interestRate}%`,
    ln.status,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Loan & Credit Risk Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Credit facility underwriting performance, remaining amortization schedules, and risk exposure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu
            reportTitle="Loans Report"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-loans-report"
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
          title="Credit Exposure by Facility Class"
          subtitle="Portfolio allocation across mortgages, Lombard facilities, and commercial lines"
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
          { label: 'Active Facilities', value: 'active' },
          { label: 'Closed / Paid Off', value: 'closed' },
          { label: 'Under Review', value: 'under_review' },
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
          { label: 'Loan Principal', value: 'amount' },
          { label: 'Outstanding Balance', value: 'outstanding' },
          { label: 'EMI Amount', value: 'emi' },
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
