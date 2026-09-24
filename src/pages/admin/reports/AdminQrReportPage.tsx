import React, { useState, useEffect } from 'react';
import { AdminReportNav } from '../../../components/admin/AdminReportNav.tsx';
import { ReportFilter } from '../../../components/admin/ReportFilter.tsx';
import { ReportTable, Column } from '../../../components/admin/ReportTable.tsx';
import { ReportSummaryCard } from '../../../components/admin/ReportSummaryCard.tsx';
import { ReportChart } from '../../../components/admin/ReportChart.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminReportService, PaginatedReportResult } from '../../../backend/services/adminReportService.ts';
import { CheckCircle2, QrCode, Clock } from 'lucide-react';

export const AdminQrReportPage: React.FC = () => {
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
        const res = await adminReportService.getQrReport({
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
      key: 'qrPaymentId',
      header: 'QR Payment ID',
      render: (q) => (
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-royal-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{q.qrPaymentId}</span>
            <div className="text-[10px] text-slate-400 font-mono">Ref: {q.reference}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'sender',
      header: 'Sender (Customer)',
      render: (q) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{q.sender}</div>
          <div className="text-[10px] text-slate-400 font-mono">{q.senderAccountId}</div>
        </div>
      ),
    },
    {
      key: 'receiverMerchant',
      header: 'Receiver / Merchant',
      render: (q) => (
        <div className="font-semibold text-slate-800 dark:text-slate-200">
          {q.receiverMerchant}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Gross Amount',
      align: 'right',
      render: (q) => (
        <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
          ${q.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'fee',
      header: 'MDR Fee (1.25%)',
      align: 'right',
      render: (q) => (
        <div className="font-mono tabular-nums text-right">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            +${q.fee.toFixed(2)}
          </span>
          <div className="text-[10px] text-slate-400">Net: ${q.netSettlement.toFixed(2)}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (q) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
          <CheckCircle2 className="w-3.5 h-3.5" /> {q.status}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Transaction Date',
      render: (q) => (
        <span className="text-[11px] font-mono text-slate-500 tabular-nums">
          {new Date(q.date).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'settlementStatus',
      header: 'Settlement Status',
      align: 'center',
      render: (q) => (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {q.settlementStatus}
        </span>
      ),
    },
  ];

  const exportHeaders = ['Payment ID', 'Sender', 'Merchant', 'Amount', 'MDR Fee', 'Status', 'Date', 'Settlement Status'];
  const exportRows = (report?.data || []).map((q) => [
    q.qrPaymentId,
    q.sender,
    q.receiverMerchant,
    q.amount,
    q.fee,
    q.status,
    new Date(q.date).toISOString(),
    q.settlementStatus,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Merchant QR Transactions & Clearing Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time EMVCo scan-to-pay throughput, Merchant Discount Rate (MDR) accruals, and instant settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu
            reportTitle="QR Report"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-qr-report"
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
          title="Merchant Category QR Volume"
          subtitle="Gross settlement breakdown across commercial merchant tiers"
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
          { label: 'Completed & Settled', value: 'completed' },
          { label: 'Pending Settlement', value: 'pending' },
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
          { label: 'Transaction Date', value: 'date' },
          { label: 'Amount ($USD)', value: 'amount' },
          { label: 'Merchant Name', value: 'receiverMerchant' },
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
