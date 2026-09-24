import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  accountService,
  transactionService,
  Account,
  Transaction,
} from '../../backend/index.ts';
import { TransactionItem, TransactionDetails } from '../../components/banking/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import {
  Copy,
  Check,
  ArrowLeft,
  ArrowUpRight,
  FileText,
  BookOpen,
  Ban,
  Pencil,
  Trash2,
  ShieldCheck,
  Building2,
  Calendar,
  Percent,
  Landmark,
  TrendingUp,
  Download,
  AlertCircle,
} from 'lucide-react';

export const AccountDetailsPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [stopChequeModalOpen, setStopChequeModalOpen] = useState(false);
  const [chequeNumber, setChequeNumber] = useState('');
  const [stopReason, setStopReason] = useState('Lost or Misplaced');
  const [stopSuccess, setStopSuccess] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadAccountData = async () => {
    if (!accountId) return;
    try {
      const [acc, txs] = await Promise.all([
        accountService.getAccountById(accountId),
        transactionService.getTransactions({ accountId }),
      ]);
      setAccount(acc);
      setTransactions(txs);
      if (acc) {
        setCustomName(acc.customNickName || acc.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, [accountId]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    try {
      await accountService.renameAccount(account.id, customName);
      setRenameModalOpen(false);
      loadAccountData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopCheque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !chequeNumber) return;
    try {
      await accountService.stopCheque({
        accountId: account.id,
        chequeNumber,
        reason: stopReason,
      });
      setStopSuccess(true);
      setTimeout(() => {
        setStopChequeModalOpen(false);
        setStopSuccess(false);
        setChequeNumber('');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingState type="card" message="Decrypting sovereign account ledger..." />;
  }

  if (!account) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Not Found</h2>
        <p className="text-slate-500 text-xs">The requested account record does not exist or has been closed.</p>
        <Button variant="outline" onClick={() => navigate('/bank/accounts')}>
          Return to Accounts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bank/accounts')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-600 dark:text-slate-400"
          >
            All Accounts
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            {account.accountNumber}
          </span>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRenameModalOpen(true)}
            icon={<Pencil className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Rename
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/bank/accounts/${account.id}/statement`)}
            icon={<FileText className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Statement
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate(`/bank/transfers?from=${account.id}`)}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Transfer Funds
          </Button>
        </div>
      </div>

      {/* Account Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-royal-950 via-slate-900 to-royal-950 text-white border border-gold-500/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-gold-400/20 text-gold-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-gold-400/30">
                {account.type}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">
                {account.customNickName || account.name}
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
              {account.currency}{' '}
              {account.balance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
              <span>
                Available Balance:{' '}
                <strong className="text-white font-mono">
                  {account.currency} {account.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </span>
              <span className="text-slate-600">•</span>
              <span>Ledger: {account.currency} {account.ledgerBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/bank/accounts/cheque-book?accountId=${account.id}`)}
              icon={<BookOpen className="w-3.5 h-3.5" />}
              className="text-white border-white/20 hover:bg-white/10 text-xs"
            >
              Request Cheque Book
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStopChequeModalOpen(true)}
              icon={<Ban className="w-3.5 h-3.5" />}
              className="text-amber-300 border-amber-500/30 hover:bg-amber-500/10 text-xs"
            >
              Stop Cheque
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/bank/accounts/close?accountId=${account.id}`)}
              icon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-rose-300 border-rose-500/30 hover:bg-rose-500/10 text-xs"
            >
              Close Account
            </Button>
          </div>
        </div>
      </div>

      {/* Account Full Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Ledger Identification */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Supervisory & Clearing Identifiers
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500">Account Number</span>
              <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-white">
                <span>{account.accountNumber}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(account.accountNumber, 'acc')}
                  className="text-royal-600 dark:text-gold-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500">International IBAN</span>
              <div className="flex items-center gap-2 font-mono font-semibold text-slate-900 dark:text-white">
                <span>{account.iban}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(account.iban, 'iban')}
                  className="text-royal-600 dark:text-gold-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500">SWIFT / BIC Code</span>
              <div className="flex items-center gap-2 font-mono font-semibold text-slate-900 dark:text-white">
                <span>{account.swiftBic}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(account.swiftBic, 'swift')}
                  className="text-royal-600 dark:text-gold-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {copiedField === 'swift' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500">Currency</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {account.currency}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500">Lifecycle Status</span>
              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {account.status}
              </span>
            </div>
          </div>
        </div>

        {/* Domicile, Yield & Terms */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Domicile, Holder & Term Yield
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500">Primary Account Holder</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {account.accountHolder}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500">Domiciled Branch</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {account.branch}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500">Annual Yield Interest</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {account.interestRateAnnual ? `${account.interestRateAnnual}% Annualized` : 'Non-interest bearing'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500">Depository Inception Date</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {new Date(account.openedAt).toLocaleDateString()}
              </span>
            </div>

            {/* If DPS */}
            {account.type === 'dps' && (
              <>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-500">Monthly DPS Installment</span>
                  <span className="font-mono font-bold text-gold-500">
                    ${account.monthlyInstallment?.toLocaleString()}
                  </span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-500">Maturity Date & Payout</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {account.maturityDate ? new Date(account.maturityDate).toLocaleDateString() : 'N/A'} (${account.maturityAmount?.toLocaleString()})
                  </span>
                </div>
              </>
            )}

            {/* If FDR */}
            {account.type === 'fdr' && (
              <>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-500">FDR Tenure</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {account.tenureMonths} Months Guaranteed
                  </span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-500">Maturity Date & Return</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {account.maturityDate ? new Date(account.maturityDate).toLocaleDateString() : 'N/A'} (${account.maturityAmount?.toLocaleString()})
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Account Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Account Transaction Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Settlement history and debit/credit postings for this specific account
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/bank/accounts/${account.id}/transactions`)}
              className="text-xs"
            >
              Filter & Search ({transactions.length})
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate(`/bank/accounts/${account.id}/statement`)}
              icon={<Download className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Account Statement
            </Button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
            No transactions posted to this ledger yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {transactions.slice(0, 5).map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onClick={(t) => {
                  setSelectedTx(t);
                  setDetailsOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title="Rename Account / Set Custom Nickname"
        subtitle={`Account: ${account.accountNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveRename} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Custom Account Alias
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameModalOpen(false)}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              className="flex-1 text-xs"
            >
              Save Alias
            </Button>
          </div>
        </form>
      </Modal>

      {/* Stop Cheque Modal */}
      <Modal
        isOpen={stopChequeModalOpen}
        onClose={() => setStopChequeModalOpen(false)}
        title="Stop Cheque Order"
        subtitle={`Account: ${account.accountNumber}`}
        maxWidth="md"
      >
        {stopSuccess ? (
          <div className="p-4 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            Cheque #{chequeNumber} has been placed under immediate stop order.
          </div>
        ) : (
          <form onSubmit={handleStopCheque} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Cheque Leaf Serial Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 004819"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Reason for Stop Payment
              </label>
              <select
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Lost or Misplaced">Lost or Misplaced</option>
                <option value="Stolen Leaf">Stolen Leaf</option>
                <option value="Commercial Dispute">Commercial Dispute</option>
                <option value="Duplicate Cheque Issued">Duplicate Cheque Issued</option>
              </select>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStopChequeModalOpen(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                className="flex-1 text-xs"
              >
                Confirm Stop Order
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Transaction Details Modal */}
      <TransactionDetails
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
};
