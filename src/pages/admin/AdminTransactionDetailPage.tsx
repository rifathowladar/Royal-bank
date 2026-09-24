import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  adminTransactionService,
  TransactionFullDetailResult,
} from '../../backend/index.ts';
import {
  AdminBadge,
  AdminActionModal,
  AdminActionType,
  AdminAuditLogViewer,
} from '../../components/admin/index.ts';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';
import { useAdminPermissions, useToast } from '../../hooks/index.ts';
import {
  ArrowRightLeft,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  DollarSign,
  ShieldAlert,
  Landmark,
  User,
  Clock,
  Printer,
  FileText,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const AdminTransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = useAdminPermissions();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<TransactionFullDetailResult | null>(null);

  // Modal State
  const [actionModal, setActionModal] = useState<AdminActionType | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminTransactionService.getTransactionFullDetails(id);
      if (!res) {
        addToast('Transaction not found', 'error');
        navigate('/admin/transactions');
        return;
      }
      setDetail(res);
    } catch (err: any) {
      addToast(err?.message || 'Failed to load transaction details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading || !detail) {
    return (
      <LoadingState
        type="table"
        message="Querying distributed ledger nodes for transaction proof..."
      />
    );
  }

  const { transaction, customer, account, auditLogs } = detail;
  const isPending = transaction.status === 'pending' || transaction.status === 'flagged' || transaction.status === 'processing';
  const isCompleted = transaction.status === 'completed';

  const handleActionConfirm = async (payload: { reason: string; extra?: any }) => {
    if (!actionModal) return;
    try {
      if (actionModal === 'approve_transaction') {
        await adminTransactionService.approveTransaction(transaction.id, payload.reason);
        addToast(`Transaction ${transaction.referenceNumber} approved.`, 'success');
      } else if (actionModal === 'reject_transaction') {
        await adminTransactionService.rejectTransaction(transaction.id, payload.reason);
        addToast(`Transaction ${transaction.referenceNumber} rejected.`, 'warning');
      } else if (actionModal === 'reverse_transaction') {
        await adminTransactionService.reverseTransaction(transaction.id, payload.reason);
        addToast(`Transaction reversed and ledger balances adjusted.`, 'success');
      } else if (actionModal === 'refund_transaction') {
        await adminTransactionService.refundTransaction(
          transaction.id,
          payload.reason,
          payload.extra?.refundAmount
        );
        addToast(`Administrative refund issued.`, 'success');
      }
      loadData();
    } catch (err: any) {
      addToast(err?.message || 'Operation failed', 'error');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Return Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/transactions')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settlement Journal
        </button>

        <span className="font-mono text-xs text-slate-400">
          Internal Transaction UID: {transaction.id}
        </span>
      </div>

      {/* Main Detail Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-royal-900 dark:bg-royal-950 text-amber-400 font-bold text-xl flex items-center justify-center shrink-0 ring-4 ring-slate-100 dark:ring-slate-800 shadow-sm">
              <ArrowRightLeft className="w-8 h-8" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white truncate">
                  {transaction.referenceNumber}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                  {transaction.type.replace('_', ' ')}
                </span>
                {transaction.isFlaggedByAML && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900">
                    <ShieldAlert className="w-3 h-3" />
                    AML FLAGGED
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 font-mono">
                Settled: {formatDate(transaction.timestamp)} · Rail:{' '}
                {transaction.paymentMethod || 'Core Book Transfer'}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <AdminBadge type="transaction_status" value={transaction.status} />
              </div>
            </div>
          </div>

          {/* Amount and Immediate Action Controls */}
          <div className="flex flex-wrap items-center gap-4 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-6">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Settlement Sum
              </p>
              <p
                className={`text-2xl sm:text-3xl font-bold font-mono ${
                  transaction.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                }`}
              >
                {transaction.amount >= 0 ? '+' : ''}
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Clearing Fee: ${transaction.fee.toFixed(2)} USD
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isPending && permissions.canApproveTransaction && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setActionModal('approve_transaction')}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Approve
                </Button>
              )}

              {isPending && permissions.canRejectTransaction && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActionModal('reject_transaction')}
                  icon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                >
                  Reject
                </Button>
              )}

              {isCompleted && permissions.canReverseTransaction && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActionModal('reverse_transaction')}
                  icon={<RotateCcw className="w-3.5 h-3.5 text-purple-500" />}
                >
                  Reverse
                </Button>
              )}

              {isCompleted && permissions.canRefundTransaction && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActionModal('refund_transaction')}
                  icon={<DollarSign className="w-3.5 h-3.5 text-amber-500" />}
                >
                  Refund
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={handlePrintReceipt}
                icon={<Printer className="w-3.5 h-3.5" />}
              >
                Receipt
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Transaction Details, Counterparty, and Linked Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Transaction Ledger Data */}
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            Settlement Breakdown & Messaging
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Description / Memo</span>
              <span className="font-semibold text-slate-900 dark:text-white text-right max-w-sm">
                {transaction.description}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Counterparty Entity</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {transaction.counterpartyName}
              </span>
            </div>
            {transaction.counterpartyAccount && (
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Counterparty Ledger / IBAN</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {transaction.counterpartyAccount}
                </span>
              </div>
            )}
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Category Tag</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {transaction.category}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Clearing Network</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {transaction.paymentMethod || 'Direct Federal Reserve Fedwire'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">AML Risk Indicator</span>
              <span
                className={`font-semibold ${
                  transaction.isFlaggedByAML
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {transaction.isFlaggedByAML ? 'Requires Dual-Key Clearance' : 'Passed Real-Time AML Filter'}
              </span>
            </div>
          </div>
        </Card>

        {/* Linked Customer & Ledger Card */}
        <div className="space-y-4">
          <Card className="p-5 border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold tracking-tight uppercase text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              Account Holder
            </h3>
            {customer ? (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="font-mono text-slate-500">{customer.customerNumber}</p>
                <p className="text-slate-500">{customer.email}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate(`/admin/customers/${customer.id}`)}
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View Customer Dossier
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Institutional Booking</p>
            )}
          </Card>

          <Card className="p-5 border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold tracking-tight uppercase text-slate-400 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-royal-500" />
              Impacted Ledger
            </h3>
            {account ? (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{account.name}</p>
                <p className="font-mono text-slate-500">{account.accountNumber}</p>
                <p className="font-mono text-slate-500 font-medium">
                  Ledger Balance: {formatCurrency(account.balance, account.currency)}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate(`/admin/accounts/${account.id}`)}
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Inspect Account Ledger
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Omnibus Clearing Account</p>
            )}
          </Card>
        </div>
      </div>

      {/* Immutable Audit Trail Section */}
      <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Supervisory Audit Trail & Dual-Key Execution Records
        </h3>
        <AdminAuditLogViewer logs={auditLogs} />
      </Card>

      {/* Action Modal */}
      {actionModal && (
        <AdminActionModal
          isOpen={true}
          onClose={() => setActionModal(null)}
          actionType={actionModal}
          targetId={transaction.id}
          targetName={`${transaction.referenceNumber} (${formatCurrency(
            transaction.amount,
            transaction.currency
          )})`}
          initialExtra={transaction}
          onConfirm={handleActionConfirm}
        />
      )}
    </div>
  );
};
