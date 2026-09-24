import React, { useEffect, useState } from 'react';
import { AdminQrNav } from '../../../components/admin/AdminQrNav.tsx';
import { AdminDataTable, Column } from '../../../components/admin/AdminDataTable.tsx';
import { AdminStatCard } from '../../../components/admin/AdminStatCard.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminQrService,
  AdminMerchant,
  QRSettlementBatch,
} from '../../../backend/services/adminQrService.ts';
import {
  Landmark,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  RefreshCw,
  Building2,
  DollarSign,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminQrSettlementsPage: React.FC = () => {
  const [merchants, setMerchants] = useState<AdminMerchant[]>([]);
  const [batches, setBatches] = useState<QRSettlementBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingMerchantId, setProcessingMerchantId] = useState<string | null>(null);
  const [processingAll, setProcessingAll] = useState(false);

  // Receipt modal
  const [selectedBatch, setSelectedBatch] = useState<QRSettlementBatch | null>(null);

  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [mList, bList] = await Promise.all([
        adminQrService.getMerchants(),
        adminQrService.getSettlementBatches(),
      ]);
      setMerchants(mList);
      setBatches(bList);
    } catch {
      addToast('Error loading settlement ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPendingEscrow = merchants.reduce((sum, m) => sum + m.pendingSettlementAmount, 0);
  const totalSettledHistorical = batches.reduce((sum, b) => sum + b.netPayout, 0);
  const totalFeesCaptured = batches.reduce((sum, b) => sum + b.feeDeducted, 0);

  const handleSettleSingle = async (merchantId: string) => {
    setProcessingMerchantId(merchantId);
    try {
      const batch = await adminQrService.executeMerchantSettlement(merchantId);
      addToast(`Settlement batch ${batch.batchNumber} generated for ${batch.merchantName}`, 'success');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Settlement failed';
      addToast(msg, 'error');
    } finally {
      setProcessingMerchantId(null);
    }
  };

  const handleUniversalSettlement = async () => {
    if (totalPendingEscrow <= 0) {
      addToast('No pending escrow balances to settle', 'info');
      return;
    }
    setProcessingAll(true);
    try {
      const created = await adminQrService.executeUniversalSettlement();
      addToast(`Executed ${created.length} commercial merchant settlements successfully`, 'success');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Batch settlement failed';
      addToast(msg, 'error');
    } finally {
      setProcessingAll(false);
    }
  };

  const batchColumns: Column<QRSettlementBatch>[] = [
    {
      header: 'Batch Reference',
      accessor: (b) => (
        <div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{b.batchNumber}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            Clearing: {b.clearingReference}
          </div>
        </div>
      ),
    },
    {
      header: 'Beneficiary Merchant',
      accessor: (b) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-white">
            {b.merchantName}
          </div>
          <div className="text-slate-500 font-mono mt-0.5">
            Account: {b.payoutAccount} ({b.payoutBank})
          </div>
        </div>
      ),
    },
    {
      header: 'Transactions',
      accessor: (b) => (
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <span className="font-semibold">{b.transactionCount}</span> items cleared
        </div>
      ),
    },
    {
      header: 'Gross & Fee Deducted',
      accessor: (b) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-600 dark:text-slate-400">
            Gross: {formatCurrency(b.amount, 'USD')}
          </div>
          <div className="text-rose-600 dark:text-rose-400">
            MDR Fee: -{formatCurrency(b.feeDeducted, 'USD')}
          </div>
        </div>
      ),
    },
    {
      header: 'Net Payout Settled',
      accessor: (b) => (
        <div className="text-right">
          <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
            {formatCurrency(b.netPayout, 'USD')}
          </div>
          <div className="text-[11px] text-slate-400">
            {formatDate(b.settledAt)}
          </div>
        </div>
      ),
    },
    {
      header: 'Receipt',
      accessor: (b) => (
        <div className="flex justify-end">
          <button
            onClick={() => setSelectedBatch(b)}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            title="View Official Clearing Advice"
          >
            <Download className="w-4 h-4 text-amber-600" />
          </button>
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
            Merchant Settlement Escrow & Payout Clearing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated clearing house batches, commission fee withholding and treasury disbursements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Ledger</span>
          </Button>
          <Button
            size="sm"
            onClick={handleUniversalSettlement}
            isLoading={processingAll}
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
          >
            <Landmark className="w-4 h-4" />
            <span>Execute Batch Payouts</span>
          </Button>
        </div>
      </div>

      <AdminQrNav />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Pending Settlement Escrow"
          value={formatCurrency(totalPendingEscrow, 'USD')}
          icon={Landmark}
          badge={{ text: 'Cycle T+1 Ready', variant: 'warning' }}
        />
        <AdminStatCard
          title="Total Disbursed to Merchants"
          value={formatCurrency(totalSettledHistorical, 'USD')}
          icon={CheckCircle2}
          change={{ value: 16.5, isPositive: true }}
          period="cumulative net payouts"
        />
        <AdminStatCard
          title="Royal Bank Tariff Revenue"
          value={formatCurrency(totalFeesCaptured, 'USD')}
          icon={DollarSign}
          change={{ value: 9.8, isPositive: true }}
          period="retained MDR commission"
        />
      </div>

      {/* Escrow Pending Queue by Merchant */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Awaiting Settlement Disbursement
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {merchants.filter((m) => m.pendingSettlementAmount > 0).length} merchants with accrued balance
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {merchants
            .filter((m) => m.pendingSettlementAmount > 0)
            .map((m) => {
              const fee = (m.pendingSettlementAmount * (m.feeRatePercent / 100)) + m.fixedFee;
              const net = m.pendingSettlementAmount - fee;
              return (
                <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{m.name}</span>
                      <span className="text-xs font-mono font-normal text-slate-500">
                        ({m.merchantCode})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Destination: {m.bankAccount} • {m.bankName} • MDR: {m.feeRatePercent}%
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">
                        Gross: {formatCurrency(m.pendingSettlementAmount, 'USD')}
                      </div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        Net: {formatCurrency(net, 'USD')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSettleSingle(m.id)}
                      isLoading={processingMerchantId === m.id}
                      className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
                    >
                      <span>Settle Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

          {merchants.filter((m) => m.pendingSettlementAmount > 0).length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">
              All merchant escrows are currently settled to date.
            </div>
          )}
        </div>
      </div>

      {/* Historical Batches Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Executed Settlement Batches Journal
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              addToast('Settlement journal exported as CSV', 'info');
            }}
            className="flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Clearing CSV</span>
          </Button>
        </div>

        <AdminDataTable
          columns={batchColumns}
          data={batches}
          keyExtractor={(b) => b.id}
          isLoading={loading}
          emptyTitle="No settlement batches found"
          emptyDescription="Cleared settlement batches will appear here."
        />
      </div>

      {/* Settlement Advice Modal */}
      {selectedBatch && (
        <Modal
          isOpen={!!selectedBatch}
          onClose={() => setSelectedBatch(null)}
          title={`Settlement Payment Advice • ${selectedBatch.batchNumber}`}
          subtitle="Official Interbank Wire / ACH clearing instruction"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-500">Net Commercial Payout</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedBatch.netPayout, 'USD')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant Beneficiary:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedBatch.merchantName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cleared Transactions:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedBatch.transactionCount} transactions
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Processed Volume:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {formatCurrency(selectedBatch.amount, 'USD')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Royal Bank Withheld Fee:</span>
                <span className="font-mono text-rose-600 font-semibold">
                  -{formatCurrency(selectedBatch.feeDeducted, 'USD')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Disbursement Bank:</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {selectedBatch.payoutBank} ({selectedBatch.payoutAccount})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clearing Wire Reference:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedBatch.clearingReference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Date:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatDate(selectedBatch.settledAt)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedBatch(null)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  addToast('Settlement advice downloaded as PDF', 'success');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Advice PDF</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
