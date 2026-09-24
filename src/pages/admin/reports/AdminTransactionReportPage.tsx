import React, { useState, useEffect } from 'react';
import { AdminReportNav } from '../../../components/admin/AdminReportNav.tsx';
import { ReportFilter } from '../../../components/admin/ReportFilter.tsx';
import { ReportTable, Column } from '../../../components/admin/ReportTable.tsx';
import { ReportSummaryCard } from '../../../components/admin/ReportSummaryCard.tsx';
import { ReportChart } from '../../../components/admin/ReportChart.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminReportService, PaginatedReportResult } from '../../../backend/services/adminReportService.ts';
import { Transaction } from '../../../backend/types/index.ts';
import { CheckCircle2, Clock, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const AdminTransactionReportPage: React.FC = () => {
  const [report, setReport] = useState<PaginatedReportResult<Transaction> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountId, setAccountId] = useState('all');
  const [customerId, setCustomerId] = useState('all');
  const [branchId, setBranchId] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await adminReportService.getTransactionReport({
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
    setSortBy('timestamp');
    setSortOrder('desc');
    setPage(1);
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Transaction ID',
      render: (t) => (
        <div>
          <span className="font-mono font-bold text-slate-900 dark:text-white">{t.id}</span>
          <div className="text-[10px] text-slate-400 font-mono">{t.referenceNumber || t.reference}</div>
        </div>
      ),
    },
    {
      key: 'counterpartyName',
      header: 'Customer / Counterparty',
      render: (t) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {t.counterpartyName || t.sender || t.receiver || 'Alexander Sterling'}
          </div>
          <div className="text-[10px] text-slate-400">{t.description}</div>
        </div>
      ),
    },
    {
      key: 'accountId',
      header: 'Account',
      render: (t) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {t.senderAccount || t.accountId}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (t) => (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
          {t.type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (t) => {
        const isCredit = t.amount > 0;
        return (
          <div className="font-mono font-bold tabular-nums">
            <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
              {isCredit ? '+' : '-'}${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[10px] text-slate-400 font-normal">{t.currency}</div>
          </div>
        );
      },
    },
    {
      key: 'fee',
      header: 'Fee',
      align: 'right',
      render: (t) => (
        <span className="font-mono text-xs text-slate-500 tabular-nums">
          ${(t.fee || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: (t) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {t.paymentMethod || 'SWIFT Wire'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (t) => {
        if (t.status === 'completed') {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          );
        }
        if (t.status === 'flagged' || t.isFlaggedByAML) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Flagged
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" /> {t.status}
          </span>
        );
      },
    },
    {
      key: 'timestamp',
      header: 'Date & Reference',
      render: (t) => (
        <div className="text-[11px] font-mono text-slate-500 tabular-nums">
          <div>{new Date(t.timestamp).toLocaleDateString()}</div>
          <div className="text-[10px] text-slate-400">{t.referenceNumber}</div>
        </div>
      ),
    },
  ];

  const exportHeaders = [
    'Transaction ID',
    'Customer',
    'Account',
    'Type',
    'Amount',
    'Fee',
    'Payment Method',
    'Status',
    'Date',
    'Reference',
  ];

  const exportRows = (report?.data || []).map((t) => [
    t.id,
    t.counterpartyName || t.sender || 'Alexander Sterling',
    t.accountId,
    t.type,
    t.amount,
    t.fee || 0,
    t.paymentMethod || 'Wire',
    t.status,
    new Date(t.timestamp).toISOString(),
    t.referenceNumber || t.reference || '',
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions Audit Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Comprehensive audit register of cross-border wires, inter-bank clearings, and card ledger debits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu
            reportTitle="Transactions Report"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-transactions-report"
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
          title="Transaction Volume by Operational Channel"
          subtitle="Aggregated volume distribution across clearing networks"
          labels={report.chartData.labels}
          datasets={report.chartData.datasets}
        />
      )}

      {/* Parameterized Filters */}
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
          { label: 'Completed', value: 'completed' },
          { label: 'Pending', value: 'pending' },
          { label: 'Flagged', value: 'flagged' },
          { label: 'Failed', value: 'failed' },
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
          { label: 'Date (Recent First)', value: 'timestamp' },
          { label: 'Amount ($USD)', value: 'amount' },
          { label: 'Fee', value: 'fee' },
        ]}
        onReset={handleResetFilters}
      />

      {/* Detailed Table */}
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
