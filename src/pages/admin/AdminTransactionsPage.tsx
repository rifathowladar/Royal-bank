import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  adminTransactionService,
  Transaction,
  TransactionListResult,
} from '../../backend/index.ts';
import {
  AdminDataTable,
  ColumnDef,
  AdminBadge,
  AdminFilterBar,
  FilterConfig,
  AdminActionModal,
  AdminActionType,
} from '../../components/admin/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';
import { useAdminPermissions, useToast } from '../../hooks/index.ts';
import {
  ArrowRightLeft,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldAlert,
  Download,
  Filter,
  Search,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const AdminTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const permissions = useAdminPermissions();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TransactionListResult>({
    transactions: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [amlFilter, setAmlFilter] = useState<'all' | 'true' | 'false'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'referenceNumber'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Modal State
  const [actionModal, setActionModal] = useState<{
    type: AdminActionType;
    transaction: Transaction;
  } | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await adminTransactionService.getTransactions({
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
        paymentMethod: paymentMethodFilter,
        isFlaggedByAML: amlFilter === 'all' ? undefined : amlFilter === 'true',
        sortBy,
        sortOrder,
        page,
        limit: 10,
      });
      setData(res);
    } catch (err: any) {
      addToast(err?.message || 'Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery, statusFilter, typeFilter, paymentMethodFilter, amlFilter, sortBy, sortOrder, page]);

  const handleActionConfirm = async (payload: { reason: string; extra?: any }) => {
    if (!actionModal) return;
    const { type, transaction } = actionModal;

    try {
      if (type === 'approve_transaction') {
        await adminTransactionService.approveTransaction(transaction.id, payload.reason);
        addToast(`Transaction ${transaction.referenceNumber} approved.`, 'success');
      } else if (type === 'reject_transaction') {
        await adminTransactionService.rejectTransaction(transaction.id, payload.reason);
        addToast(`Transaction ${transaction.referenceNumber} rejected.`, 'warning');
      } else if (type === 'reverse_transaction') {
        await adminTransactionService.reverseTransaction(transaction.id, payload.reason);
        addToast(`Reversal executed for ${transaction.referenceNumber}. Ledger balances adjusted.`, 'success');
      } else if (type === 'refund_transaction') {
        await adminTransactionService.refundTransaction(
          transaction.id,
          payload.reason,
          payload.extra?.refundAmount
        );
        addToast(`Administrative refund issued for ${transaction.referenceNumber}.`, 'success');
      }
      fetchTransactions();
    } catch (err: any) {
      addToast(err?.message || 'Action failed', 'error');
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const allData = await adminTransactionService.getTransactions({
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
        paymentMethod: paymentMethodFilter,
        limit: 1000,
      });
      await adminTransactionService.exportTransactions(allData.transactions, format);
      addToast(`Exported ${allData.transactions.length} transactions as ${format.toUpperCase()}`, 'success');
    } catch (err: any) {
      addToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const filters: FilterConfig[] = [
    {
      id: 'status',
      label: 'Status',
      currentValue: statusFilter,
      onChange: (val) => {
        setStatusFilter(val);
        setPage(1);
      },
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Completed', value: 'completed' },
        { label: 'Pending Approval', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'AML Flagged', value: 'flagged' },
        { label: 'Failed', value: 'failed' },
        { label: 'Reversed', value: 'reversed' },
      ],
    },
    {
      id: 'type',
      label: 'Type',
      currentValue: typeFilter,
      onChange: (val) => {
        setTypeFilter(val);
        setPage(1);
      },
      options: [
        { label: 'All Rails', value: 'all' },
        { label: 'Transfer Out', value: 'transfer_out' },
        { label: 'Transfer In', value: 'transfer_in' },
        { label: 'QR Instant Pay', value: 'qr_payment' },
        { label: 'Card Settlement', value: 'card_purchase' },
        { label: 'Deposit', value: 'deposit' },
        { label: 'Bill Settlement', value: 'bill_payment' },
      ],
    },
    {
      id: 'paymentMethod',
      label: 'Method',
      currentValue: paymentMethodFilter,
      onChange: (val) => {
        setPaymentMethodFilter(val);
        setPage(1);
      },
      options: [
        { label: 'All Methods', value: 'all' },
        { label: 'Fedwire / Wire', value: 'Wire' },
        { label: 'SWIFT International', value: 'SWIFT' },
        { label: 'EMVCo QR', value: 'EMVCo QR' },
        { label: 'Direct ACH', value: 'ACH' },
        { label: 'Internal Book', value: 'Internal Book Transfer' },
      ],
    },
    {
      id: 'aml',
      label: 'AML Surveillance',
      currentValue: amlFilter,
      onChange: (val) => {
        setAmlFilter(val as any);
        setPage(1);
      },
      options: [
        { label: 'All Surveillance', value: 'all' },
        { label: 'Flagged Only', value: 'true' },
        { label: 'Clean Only', value: 'false' },
      ],
    },
  ];

  const columns: ColumnDef<any>[] = [
    // Column 1: Reference Number
    {
      key: 'referenceNumber',
      header: 'Reference',
      sortable: true,
      render: (row) => (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/transactions/${row.id}`);
            }}
            className="font-mono font-bold text-slate-900 dark:text-white hover:text-amber-600 block text-left"
          >
            {row.referenceNumber}
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            {formatDate(row.timestamp)}
          </span>
        </div>
      ),
    },
    // Column 2: Customer / Account
    {
      key: 'customerName',
      header: 'Beneficiary / Account',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">
            {row.customerName}
          </span>
          <span className="font-mono text-xs text-slate-400">
            {row.accountNumber || 'Direct Clearing'}
          </span>
        </div>
      ),
    },
    // Column 3: Type & Description
    {
      key: 'description',
      header: 'Description / Counterparty',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {row.description}
          </p>
          <span className="text-[11px] text-slate-400 truncate block">
            {row.counterpartyName || row.category}
          </span>
        </div>
      ),
    },
    // Column 4: Amount
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (row) => {
        const isPositive = row.amount >= 0;
        return (
          <div className="text-right">
            <span
              className={`font-mono font-bold text-sm ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(row.amount, row.currency)}
            </span>
            {row.fee > 0 && (
              <span className="text-[10px] text-slate-400 block font-mono">
                Fee: ${row.fee.toFixed(2)}
              </span>
            )}
          </div>
        );
      },
    },
    // Column 5: Status
    {
      key: 'status',
      header: 'Status',
      render: (row) => <AdminBadge type="transaction_status" value={row.status} />,
    },
    // Column 6: Payment Method
    {
      key: 'paymentMethod',
      header: 'Clearing Rail',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {row.paymentMethod || 'Wire Rail'}
        </span>
      ),
    },
    // Column 7: AML Flagged
    {
      key: 'isFlaggedByAML',
      header: 'Surveillance',
      render: (row) =>
        row.isFlaggedByAML ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900">
            <ShieldAlert className="w-3 h-3" />
            AML FLAGGED
          </span>
        ) : (
          <span className="text-[11px] font-mono text-slate-400">CLEAR</span>
        ),
    },
    // Column 8: Actions
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const isPending = row.status === 'pending' || row.status === 'flagged' || row.status === 'processing';
        const isCompleted = row.status === 'completed';

        return (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* View */}
            <button
              onClick={() => navigate(`/admin/transactions/${row.id}`)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-royal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Inspect Settlement Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Approve (for pending/flagged) */}
            {isPending && permissions.canApproveTransaction && (
              <button
                onClick={() =>
                  setActionModal({
                    type: 'approve_transaction',
                    transaction: row,
                  })
                }
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                title="Approve Settlement"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}

            {/* Reject (for pending/flagged) */}
            {isPending && permissions.canRejectTransaction && (
              <button
                onClick={() =>
                  setActionModal({
                    type: 'reject_transaction',
                    transaction: row,
                  })
                }
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Reject Transaction"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}

            {/* Reverse (for completed, super admin) */}
            {isCompleted && permissions.canReverseTransaction && (
              <button
                onClick={() =>
                  setActionModal({
                    type: 'reverse_transaction',
                    transaction: row,
                  })
                }
                className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                title="Execute Dual-Key Reversal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Refund (for completed debit/purchases) */}
            {isCompleted && permissions.canRefundTransaction && (
              <button
                onClick={() =>
                  setActionModal({
                    type: 'refund_transaction',
                    transaction: row,
                  })
                }
                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                title="Issue Administrative Refund"
              >
                <DollarSign className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
              Real-Time Clearing Pipeline
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Dual-Key Clearance Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Settlement & Transaction Journal
          </h1>
        </div>

        {/* Global Export Controls */}
        <div className="flex items-center gap-2">
          {permissions.canExportData && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('json')}
                disabled={isExporting}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Export JSON
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <AdminFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        searchPlaceholder="Search reference, description, counterparty, account..."
        filters={filters}
        totalResults={data.total}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('all');
          setTypeFilter('all');
          setPaymentMethodFilter('all');
          setAmlFilter('all');
          setPage(1);
        }}
        onRefresh={fetchTransactions}
      />

      {/* Transactions Table */}
      <AdminDataTable
        columns={columns}
        data={data.transactions}
        loading={loading}
        page={data.page}
        totalPages={data.totalPages}
        totalRecords={data.total}
        pageSize={data.limit}
        onPageChange={(p) => setPage(p)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(key) => {
          if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(key as any);
            setSortOrder('desc');
          }
        }}
        onRowClick={(row) => navigate(`/admin/transactions/${row.id}`)}
        rowKey={(row) => row.id}
      />

      {/* Action Modal (Approve, Reject, Reverse, Refund) */}
      {actionModal && (
        <AdminActionModal
          isOpen={true}
          onClose={() => setActionModal(null)}
          actionType={actionModal.type}
          targetId={actionModal.transaction.id}
          targetName={`${actionModal.transaction.referenceNumber} (${formatCurrency(
            actionModal.transaction.amount,
            actionModal.transaction.currency
          )})`}
          initialExtra={actionModal.transaction}
          onConfirm={handleActionConfirm}
        />
      )}
    </div>
  );
};
