import React, { useState, useEffect } from 'react';
import { AdminReportNav } from '../../../components/admin/AdminReportNav.tsx';
import { ReportFilter } from '../../../components/admin/ReportFilter.tsx';
import { ReportTable, Column } from '../../../components/admin/ReportTable.tsx';
import { ReportSummaryCard } from '../../../components/admin/ReportSummaryCard.tsx';
import { ReportChart } from '../../../components/admin/ReportChart.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminReportService, PaginatedReportResult } from '../../../backend/services/adminReportService.ts';
import { AlertOctagon, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';

export const AdminFraudReportPage: React.FC = () => {
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
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await adminReportService.getFraudReport({
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
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const columns: Column<any>[] = [
    {
      key: 'alertId',
      header: 'Alert ID',
      render: (f) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {f.alertId}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Target Customer',
      render: (f) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{f.customer}</div>
          <div className="text-[10px] text-slate-400 font-mono">{f.customerId}</div>
        </div>
      ),
    },
    {
      key: 'transaction',
      header: 'Transaction Ref',
      render: (f) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {f.transaction}
        </span>
      ),
    },
    {
      key: 'riskScore',
      header: 'Risk Score',
      align: 'center',
      render: (f) => {
        const isHigh = f.riskScore >= 75;
        const isMed = f.riskScore >= 40 && f.riskScore < 75;
        return (
          <span
            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
              isHigh
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : isMed
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {f.riskScore}/100
          </span>
        );
      },
    },
    {
      key: 'detectionRule',
      header: 'Detection Rule',
      render: (f) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white text-xs">{f.detectionRule}</div>
          <div className="text-[10px] text-slate-400">{f.ruleCategory}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (f) => (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
          {f.status.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'investigator',
      header: 'Investigator',
      render: (f) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {f.investigator}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Detection Timestamp',
      render: (f) => (
        <span className="text-[11px] font-mono text-slate-500 tabular-nums">
          {new Date(f.date).toLocaleString()}
        </span>
      ),
    },
  ];

  const exportHeaders = ['Alert ID', 'Customer', 'Transaction', 'Risk Score', 'Detection Rule', 'Status', 'Investigator', 'Date'];
  const exportRows = (report?.data || []).map((f) => [
    f.alertId,
    f.customer,
    f.transaction,
    f.riskScore,
    f.detectionRule,
    f.status,
    f.investigator,
    new Date(f.date).toISOString(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Fraud Surveillance & Anomaly Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Machine intelligence telemetry, velocity triggers, geolocation mismatch flags, and investigator status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu
            reportTitle="Fraud Report"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-fraud-report"
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
          title="Surveillance Incidents by Detection Category"
          subtitle="Real-time alert distribution triggering behavioral security countermeasures"
          labels={report.chartData.labels}
          datasets={report.chartData.datasets}
          valuePrefix=""
          valueSuffix=" Incidents"
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
          { label: 'All Alerts', value: 'all' },
          { label: 'Flagged', value: 'flagged' },
          { label: 'Under Investigation', value: 'under_investigation' },
          { label: 'Blocked', value: 'blocked' },
          { label: 'Released / Cleared', value: 'released' },
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
          { label: 'Detection Timestamp', value: 'date' },
          { label: 'Risk Score (High to Low)', value: 'riskScore' },
          { label: 'Customer Name', value: 'customer' },
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
