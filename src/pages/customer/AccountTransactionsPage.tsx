import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  accountService,
  transactionService,
  Account,
  Transaction,
} from '../../backend/index.ts';
import { TransactionTable, TransactionDetails } from '../../components/banking/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import {
  ArrowLeft,
  Filter,
  Search,
  Download,
  Calendar,
  DollarSign,
  ArrowUpDown,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

export const AccountTransactionsPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedAccId, setSelectedAccId] = useState<string>(accountId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const [accs, txs] = await Promise.all([
        accountService.getAccounts(),
        transactionService.getTransactions({
          accountId: selectedAccId === 'all' ? undefined : selectedAccId,
          type: selectedType === 'all' ? undefined : selectedType,
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchTerm || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          minAmount: minAmount ? parseFloat(minAmount) : undefined,
          maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        }),
      ]);
      setAccounts(accs);
      setTransactions(txs);
      if (selectedAccId !== 'all') {
        const acc = accs.find((a) => a.id === selectedAccId);
        setSelectedAccount(acc || null);
      } else {
        setSelectedAccount(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedAccId, selectedType, selectedStatus, selectedCategory, startDate, endDate, minAmount, maxAmount]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSelectedAccId(accountId || 'all');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(accountId ? `/bank/accounts/${accountId}` : '/bank/accounts')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-600 dark:text-slate-400"
          >
            Back
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {selectedAccount ? `${selectedAccount.customNickName || selectedAccount.name} Ledger` : 'Transaction History'}
            </h1>
            <p className="text-xs text-slate-500">
              {selectedAccount ? `Account #${selectedAccount.accountNumber}` : 'Comprehensive transaction settlements ledger'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedAccount && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/bank/accounts/${selectedAccount.id}/statement`)}
              className="text-xs"
            >
              Account Statement
            </Button>
          )}
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/bank/transfers')}
            className="text-xs"
          >
            New Transfer
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Filter className="w-4 h-4 text-royal-600 dark:text-gold-400" />
            <span>Audit & Search Filters</span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-royal-600 dark:hover:text-gold-400"
          >
            <RefreshCw className="w-3 h-3" /> Reset Filters
          </button>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Account Selector */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">Account</label>
            <select
              value={selectedAccId}
              onChange={(e) => setSelectedAccId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.customNickName || acc.name} ({acc.accountNumber.slice(-4)})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Types</option>
              <option value="transfer_in">Credits (Inbound)</option>
              <option value="transfer_out">Debits (Outbound)</option>
              <option value="card_purchase">Card Purchase</option>
              <option value="qr_payment">QR Clearing</option>
              <option value="bill_payment">Bill Payment</option>
              <option value="interest">Interest Yield</option>
              <option value="dps_installment">DPS Installment</option>
              <option value="fdr_creation">FDR Creation</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed / Settled</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              <option value="Salary">Salary</option>
              <option value="Investment">Investment</option>
              <option value="Transfer">Transfer</option>
              <option value="Travel">Travel</option>
              <option value="Dining">Dining</option>
              <option value="Utilities">Utilities</option>
              <option value="Banking">Banking</option>
              <option value="Shopping">Shopping</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-slate-500 text-[11px] mb-1 font-medium">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Amount Range & Keyword search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-1">
            <input
              type="text"
              placeholder="Search keyword / reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Min Amount ($)"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max Amount ($)"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Main Transactions Table */}
      {loading ? (
        <LoadingState type="table" message="Querying ledger records..." />
      ) : (
        <TransactionTable
          transactions={transactions}
          showFilters={false}
          onSelectTransaction={(tx) => {
            setSelectedTx(tx);
            setIsDetailsOpen(true);
          }}
        />
      )}

      {/* Transaction Details Modal */}
      <TransactionDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
};
