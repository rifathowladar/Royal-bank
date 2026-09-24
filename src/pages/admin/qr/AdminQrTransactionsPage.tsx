import React, { useEffect, useState } from 'react';
import { AdminQrNav } from '../../../components/admin/AdminQrNav.tsx';
import { AdminDataTable, Column } from '../../../components/admin/AdminDataTable.tsx';
import { AdminFilterBar } from '../../../components/admin/AdminFilterBar.tsx';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminQrService,
  AdminMerchant,
} from '../../../backend/services/adminQrService.ts';
import { QRPayment } from '../../../backend/types/index.ts';
import {
  QrCode,
  ArrowRightLeft,
  RotateCcw,
  Eye,
  CheckCircle,
  FileText,
  Copy,
  Receipt,
  Download,
} from 'lucide-react';

export const AdminQrTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<QRPayment[]>([]);
  const [merchants, setMerchants] = useState<AdminMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [merchantFilter, setMerchantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedTx, setSelectedTx] = useState<QRPayment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txList, mList] = await Promise.all([
        adminQrService.getQrTransactions({
          merchantId: merchantFilter,
          status: statusFilter,
          search,
        }),
        adminQrService.getMerchants(),
      ]);
      setTransactions(txList);
      setMerchants(mList);
    } catch {
      addToast('Error loading QR transaction feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, merchantFilter, statusFilter]);

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;
    setRefunding(true);
    try {
      await adminQrService.refundQrPayment(selectedTx.id, refundReason || 'Customer dispute settlement');
      addToast(`Transaction ${selectedTx.paymentCode} refunded successfully`, 'success');
      setShowRefundModal(false);
      setRefundReason('');
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Refund failed';
      addToast(msg, 'error');
    } finally {
      setRefunding(false);
    }
  };

  const columns: Column<QRPayment>[] = [
    {
      header: 'QR Payment Code',
      accessor: (t) => (
        <div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t.paymentCode}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ref: {t.reference}
          </div>
        </div>
      ),
    },
    {
      header: 'Merchant Terminal',
      accessor: (t) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-slate-200">
            {t.merchantName || 'Royal Merchant'}
          </div>
          <div className="text-slate-500 font-mono mt-0.5">
            {t.merchantId || 'POS-EMV'}
          </div>
        </div>
      ),
    },
    {
      header: 'Payer / Account',
      accessor: (t) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {t.senderName || 'Authorized Client'}
          </div>
          <div className="text-slate-500 font-mono mt-0.5">
            Acc: {t.accountId}
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (t) => (
        <div className="text-right">
          <div className="font-bold text-sm text-slate-900 dark:text-white">
            {formatCurrency(t.amount, t.currency)}
          </div>
          <div className="text-[11px] text-slate-400">
            Gross Clearing
          </div>
        </div>
      ),
    },
    {
      header: 'Status & Timestamp',
      accessor: (t) => (
        <div className="space-y-1">
          <div>
            <AdminBadge type="transaction_status" value={t.status} />
          </div>
          <div className="text-[11px] text-slate-500">
            {formatDate(t.timestamp)}
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedTx(t);
              setShowDetailModal(true);
            }}
            title="Inspect Transaction"
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
          </button>
          {t.status === 'completed' && (
            <button
              onClick={() => {
                setSelectedTx(t);
                setShowRefundModal(true);
              }}
              title="Issue Administrative Refund"
              className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            QR Transactions & POS Clearing Stream
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time EMVCo QR settlement journal, payment audits, and supervisory refunds
          </p>
        </div>
      </div>

      <AdminQrNav />

      {/* Filter Bar */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by payment code, customer, merchant, reference..."
        filters={[
          {
            label: 'Merchant Terminal',
            value: merchantFilter,
            onChange: setMerchantFilter,
            options: [
              { label: 'All Merchants', value: 'all' },
              ...merchants.map((m) => ({ label: m.name, value: m.id })),
            ],
          },
          {
            label: 'Transaction Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Completed', value: 'completed' },
              { label: 'Pending', value: 'pending' },
              { label: 'Failed / Refunded', value: 'failed' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setMerchantFilter('all');
          setStatusFilter('all');
        }}
      />

      {/* Table */}
      <AdminDataTable
        columns={columns}
        data={transactions}
        keyExtractor={(t) => t.id}
        isLoading={loading}
        emptyTitle="No QR transactions match criteria"
        emptyDescription="Try clearing filters or checking other merchant terminals."
      />

      {/* Modal: Transaction Details */}
      {selectedTx && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`QR Clearing Receipt • ${selectedTx.paymentCode}`}
          subtitle="Point-of-Sale digital token authorization manifest"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-500">Gross Amount</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedTx.amount, selectedTx.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant Terminal:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {selectedTx.merchantName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payer Name:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {selectedTx.senderName || 'Alexander Sterling'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ledger Account:</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {selectedTx.accountId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clearing Status:</span>
                <AdminBadge type="transaction_status" value={selectedTx.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatDate(selectedTx.timestamp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {selectedTx.reference}
                </span>
              </div>
              {selectedTx.note && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-0.5">Notes:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {selectedTx.note}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  addToast('Printed official clearing slip', 'success');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Clearing Slip</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Administrative Refund */}
      {selectedTx && (
        <Modal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          title={`Administrative Refund • ${selectedTx.paymentCode}`}
          subtitle="Reverses QR payment, refunds customer account, and decrements merchant escrow"
          maxWidth="md"
        >
          <form onSubmit={handleRefund} className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-semibold text-amber-900 dark:text-amber-200">
                <span>Refund Amount:</span>
                <span>{formatCurrency(selectedTx.amount, selectedTx.currency)}</span>
              </div>
              <p className="text-amber-700 dark:text-amber-400">
                Funds will be immediately credited back to {selectedTx.senderName || 'the customer'} and debited from {selectedTx.merchantName}&apos;s pending escrow balance.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Supervisory Refund Rationale
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Document cause: Merchant duplicate charge, goods not rendered, customer dispute..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowRefundModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={refunding}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Full Refund
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
