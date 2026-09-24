import React, { useState, useEffect } from 'react';
import { AdminReportNav } from '../../../components/admin/AdminReportNav.tsx';
import { ReportFilter } from '../../../components/admin/ReportFilter.tsx';
import { ReportTable, Column } from '../../../components/admin/ReportTable.tsx';
import { ReportSummaryCard } from '../../../components/admin/ReportSummaryCard.tsx';
import { ReportChart } from '../../../components/admin/ReportChart.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminReportService, PaginatedReportResult } from '../../../backend/services/adminReportService.ts';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, User } from 'lucide-react';

export const AdminCustomerReportPage: React.FC = () => {
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
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await adminReportService.getCustomerReport({
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
    setSortBy('registrationDate');
    setSortOrder('desc');
    setPage(1);
  };

  const columns: Column<any>[] = [
    {
      key: 'customerId',
      header: 'Customer ID',
      render: (c) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {c.customerId}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name & Tier',
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
          <div className="text-[10px] text-slate-400">{c.tier} · {c.email}</div>
        </div>
      ),
    },
    {
      key: 'account',
      header: 'Account & Branch',
      render: (c) => (
        <div>
          <div className="font-mono text-xs text-slate-700 dark:text-slate-300">{c.account}</div>
          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{c.branch}</div>
        </div>
      ),
    },
    {
      key: 'kycStatus',
      header: 'KYC Status',
      render: (c) => {
        if (c.kycStatus === 'verified') {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          );
        }
        if (c.kycStatus === 'rejected') {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              Rejected
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" /> Pending Tier 2
          </span>
        );
      },
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      align: 'center',
      render: (c) => (
        <span
          className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-md ${
            c.riskLevel === 'High'
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : c.riskLevel === 'Medium'
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {c.riskLevel}
        </span>
      ),
    },
    {
      key: 'accountStatus',
      header: 'Account Status',
      align: 'center',
      render: (c) => (
        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 capitalize">
          {c.accountStatus}
        </span>
      ),
    },
    {
      key: 'totalBalanceUSD',
      header: 'Total AUM',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
          ${c.totalBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'registrationDate',
      header: 'Registration Date',
      align: 'right',
      render: (c) => (
        <span className="text-[11px] font-mono text-slate-500 tabular-nums">
          {new Date(c.registrationDate).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const exportHeaders = [
    'Customer ID',
    'Name',
    'Email',
    'Account',
    'Branch',
    'KYC Status',
    'Risk Level',
    'Account Status',
    'Registration Date',
    'Total AUM USD',
  ];

  const exportRows = (report?.data || []).map((c) => [
    c.customerId,
    c.name,
    c.email,
    c.account,
    c.branch,
    c.kycStatus,
    c.riskLevel,
    c.accountStatus,
    new Date(c.registrationDate).toISOString(),
    c.totalBalanceUSD,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Demographics & Risk Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Client census, KYC identification tiering, compliance risk assessments, and total assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu
            reportTitle="Customer Report"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-customers-report"
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
          title="Customer Tier Distribution"
          subtitle="Portfolio segmentation across Private Client, Sovereign, and Premier memberships"
          labels={report.chartData.labels}
          datasets={report.chartData.datasets}
          valuePrefix=""
          valueSuffix=" Clients"
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
          { label: 'Active Status', value: 'active' },
          { label: 'Pending Verification', value: 'pending_verification' },
          { label: 'Verified KYC', value: 'verified' },
          { label: 'Suspended', value: 'suspended' },
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
          { label: 'Registration Date', value: 'registrationDate' },
          { label: 'Total AUM Balance', value: 'totalBalanceUSD' },
          { label: 'Customer Name', value: 'name' },
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
