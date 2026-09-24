import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/index.ts';
import { accountService, Account, AccountType } from '../../backend/index.ts';
import { AccountCard, AccountSummary } from '../../components/banking/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import {
  Wallet,
  Plus,
  ArrowRightLeft,
  FileText,
  BookOpen,
  Ban,
  Pencil,
  Trash2,
  Filter,
  Search,
  Sparkles,
  Info,
  Check,
  Building2,
  Calendar,
  Percent,
  Landmark,
} from 'lucide-react';

export const CustomerAccountsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newNickname, setNewNickname] = useState('');
  const [stopChequeModalOpen, setStopChequeModalOpen] = useState(false);
  const [chequeNumber, setChequeNumber] = useState('');
  const [stopReason, setStopReason] = useState('Lost or Misplaced');
  const [stopSuccessMsg, setStopSuccessMsg] = useState('');

  const [summary, setSummary] = useState({
    totalBalanceUSD: 0,
    availableBalanceUSD: 0,
    savingsTotal: 0,
    currentTotal: 0,
    dpsTotal: 0,
    fdrTotal: 0,
    accountCount: 0,
  });

  const loadData = async () => {
    try {
      const customerId = user?.id || 'cust-001';
      const [accs, sum] = await Promise.all([
        accountService.getAccounts(customerId),
        accountService.getAccountSummary(customerId),
      ]);
      setAccounts(accs);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenRename = (acc: Account) => {
    setSelectedAccount(acc);
    setNewNickname(acc.customNickName || acc.name);
    setRenameModalOpen(true);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    try {
      await accountService.renameAccount(selectedAccount.id, newNickname);
      setRenameModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenStopCheque = (acc: Account) => {
    setSelectedAccount(acc);
    setStopChequeModalOpen(true);
    setStopSuccessMsg('');
  };

  const handleStopChequeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !chequeNumber) return;
    try {
      await accountService.stopCheque({
        accountId: selectedAccount.id,
        chequeNumber,
        reason: stopReason,
      });
      setStopSuccessMsg(`Cheque #${chequeNumber} has been placed under immediate stop payment stop.`);
      setTimeout(() => {
        setStopChequeModalOpen(false);
        setChequeNumber('');
        setStopSuccessMsg('');
      }, 1800);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'checking' && (acc.type === 'checking' || acc.type === 'current')) ||
      acc.type === filterType;
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.customNickName && acc.customNickName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      acc.accountNumber.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <LoadingState type="card" message="Loading your accounts and portfolios..." />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-royal-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Depository Architecture
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 font-medium">{accounts.length} Open Depots</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Accounts & Sovereign Vaults
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete management of checking, high-yield savings, DPS pension schemes, and FDR certificates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/bank/accounts/cheque-book')}
            icon={<BookOpen className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Cheque Books
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/bank/accounts/open')}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Open New Account
          </Button>
        </div>
      </div>

      {/* Account Portfolio Summary Cards */}
      <AccountSummary
        savingsTotal={summary.savingsTotal}
        currentTotal={summary.currentTotal}
        dpsTotal={summary.dpsTotal}
        fdrTotal={summary.fdrTotal}
        accountCount={summary.accountCount}
        onOpenNew={() => navigate('/bank/accounts/open')}
      />

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by nickname, account name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-royal-600 dark:focus:ring-gold-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'checking', label: 'Checking / Current' },
            { id: 'savings', label: 'High Yield Savings' },
            { id: 'dps', label: 'DPS Schemes' },
            { id: 'fdr', label: 'FDR Receipts' },
            { id: 'multi_currency', label: 'Multi-Currency' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                filterType === tab.id
                  ? 'bg-royal-600 dark:bg-gold-500 text-white dark:text-royal-950 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <div key={account.id} className="relative group">
            <AccountCard
              account={account}
              onRename={(acc) => handleOpenRename(acc)}
              onChequeBook={(acc) => navigate(`/bank/accounts/cheque-book?accountId=${acc.id}`)}
              onCloseAccount={(acc) => navigate(`/bank/accounts/close?accountId=${acc.id}`)}
            />
          </div>
        ))}
      </div>

      {/* Comprehensive Account Information Table */}
      <div className="space-y-4 pt-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Complete Account Registry & Specifications
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full supervisory disclosure including legal holder, domiciled branch, interest yields, and lifecycle status.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Account Number</th>
                  <th className="py-3.5 px-5 font-semibold">Account Type</th>
                  <th className="py-3.5 px-5 font-semibold">Account Holder</th>
                  <th className="py-3.5 px-5 font-semibold">Branch Domicile</th>
                  <th className="py-3.5 px-5 font-semibold">Yield Rate</th>
                  <th className="py-3.5 px-5 font-semibold">Opening Date</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Available Balance</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {accounts.map((acc) => (
                  <tr
                    key={acc.id}
                    onClick={() => navigate(`/bank/accounts/${acc.id}`)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {acc.accountNumber}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {acc.customNickName || acc.name}
                      </div>
                    </td>

                    <td className="py-4 px-5 uppercase tracking-wider text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {acc.type}
                    </td>

                    <td className="py-4 px-5 font-medium text-slate-900 dark:text-white">
                      {acc.accountHolder}
                    </td>

                    <td className="py-4 px-5 text-slate-500">
                      {acc.branch}
                    </td>

                    <td className="py-4 px-5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {acc.interestRateAnnual ? `${acc.interestRateAnnual}%` : 'N/A'}
                    </td>

                    <td className="py-4 px-5 text-slate-500 font-mono">
                      {new Date(acc.openedAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {acc.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {acc.currency} {acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/bank/transfers?from=${acc.id}`)}
                          title="Transfer Funds"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-royal-600 dark:hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/bank/accounts/${acc.id}/statement`)}
                          title="Statement"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-royal-600 dark:hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenStopCheque(acc)}
                          title="Stop Cheque"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenRename(acc)}
                          title="Rename Nickname"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-royal-600 dark:hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rename Account Modal */}
      <Modal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title="Rename Account / Set Custom Nickname"
        subtitle={`Account: ${selectedAccount?.accountNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveRename} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Custom Account Alias
            </label>
            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              required
              placeholder="e.g. Primary Family Vault, London Penthouse Ledger"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-royal-600 dark:focus:ring-gold-400"
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
        title="Emergency Cheque Stop Order"
        subtitle={`Account: ${selectedAccount?.accountNumber}`}
        maxWidth="md"
      >
        {stopSuccessMsg ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 mx-auto flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs">
              {stopSuccessMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleStopChequeSubmit} className="space-y-4 text-xs">
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
                <option value="Erroneous Amount Written">Erroneous Amount Written</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300">
              Stop orders will immediately flag in the clearing house. A standard stop fee may apply pursuant to the depository fee schedule.
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
                Place Stop Order
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
