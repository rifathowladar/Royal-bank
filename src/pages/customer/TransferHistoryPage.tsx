import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/index.ts';
import {
  transactionService,
  accountService,
  Transaction,
  Account,
  TransferResult,
} from '../../backend/index.ts';
import { TransferHistory } from '../../components/transfer/TransferHistory.tsx';
import { TransferReceipt } from '../../components/transfer/TransferReceipt.tsx';
import { TransactionDetails } from '../../components/banking/TransactionDetails.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';

export const TransferHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Transaction for Details Modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Receipt Modal
  const [receiptResult, setReceiptResult] = useState<TransferResult | null>(null);

  const loadData = async () => {
    try {
      const [txs, accs] = await Promise.all([
        transactionService.getTransactions({ customerId: user?.id || 'cust-001' }),
        accountService.getAccounts(user?.id || 'cust-001'),
      ]);
      setTransactions(txs);
      setAccounts(accs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSelectTransaction = (tx: Transaction) => {
    setSelectedTx(tx);
    setDetailsOpen(true);
  };

  const handleViewReceiptFromTx = (tx: Transaction) => {
    const srcAccount = accounts.find((a) => a.id === tx.accountId) || accounts[0];
    const res: TransferResult = {
      success: true,
      transactionId: tx.id,
      referenceNumber: tx.referenceNumber,
      timestamp: tx.timestamp,
      amount: Math.abs(tx.amount),
      fee: tx.fee || 0,
      currency: tx.currency,
      sourceAccount: srcAccount,
      recipientName: tx.counterpartyName || tx.receiver || 'Beneficiary',
      recipientAccount: tx.counterpartyAccount || 'Direct Settlement',
      recipientBank: 'Royal Bank Clearing Hub',
      transferType: 'other_bank',
      referenceNote: tx.description,
      status: 'completed',
    };
    setReceiptResult(res);
  };

  if (loading) {
    return <LoadingState type="table" message="Loading transfer settlement history..." />;
  }

  if (receiptResult) {
    return <TransferReceipt result={receiptResult} onClose={() => setReceiptResult(null)} />;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bank/transfers')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-600 dark:text-slate-400"
          >
            Transfers Hub
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Transfer Audit & Execution History
            </h1>
            <p className="text-xs text-slate-500">
              Complete historical ledger of intra-bank, inter-bank, and instant QR remittances.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Refresh
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/bank/transfers')}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            New Transfer
          </Button>
        </div>
      </div>

      {/* Main Filterable History Component */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <TransferHistory
          transactions={transactions}
          onSelectTransaction={handleSelectTransaction}
        />
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <TransactionDetails
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          transaction={selectedTx}
          onDownloadReceipt={() => {
            setDetailsOpen(false);
            handleViewReceiptFromTx(selectedTx);
          }}
        />
      )}
    </div>
  );
};
