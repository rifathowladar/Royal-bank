import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { billService } from '../../../backend/services/billService.ts';
import { accountService } from '../../../backend/services/accountService.ts';
import {
  Biller,
  BillCategory,
  FetchedBill,
  BillPaymentRecord,
  Account,
} from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  Receipt,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  Bookmark,
  Bell,
  RefreshCw,
} from 'lucide-react';

export const PayBillPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL Query pre-population
  const queryCategory = searchParams.get('category');
  const queryBillerId = searchParams.get('biller');
  const queryRef = searchParams.get('ref');

  // State
  const [billers, setBillers] = useState<Biller[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<string>(queryCategory || 'all');
  const [selectedBillerId, setSelectedBillerId] = useState<string>(queryBillerId || '');
  const [customerNumber, setCustomerNumber] = useState<string>(queryRef || '');
  const [billerSearch, setBillerSearch] = useState<string>('');

  // Fetched Bill Data
  const [fetchedBill, setFetchedBill] = useState<FetchedBill | null>(null);
  const [isFetchingBill, setIsFetchingBill] = useState(false);

  // Payment Options
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [saveBiller, setSaveBiller] = useState(true);
  const [billerNickname, setBillerNickname] = useState('');
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Execution & Receipt
  const [isExecuting, setIsExecuting] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<BillPaymentRecord | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const bList = await billService.getBillers();
      setBillers(bList);
      if (queryBillerId) {
        setSelectedBillerId(queryBillerId);
      } else if (bList.length > 0) {
        setSelectedBillerId(bList[0].id);
      }

      const accs = await accountService.getAccounts(user?.id);
      setAccounts(accs);
      if (accs.length > 0) setSourceAccountId(accs[0].id);

      // If both biller and ref were supplied via URL, auto-fetch the bill
      if (queryBillerId && queryRef) {
        autoFetch(queryBillerId, queryRef);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to initialize billing session');
    } finally {
      setLoading(false);
    }
  };

  const autoFetch = async (billerId: string, ref: string) => {
    try {
      setIsFetchingBill(true);
      const bill = await billService.fetchDemoBill(billerId, ref);
      setFetchedBill(bill);
      setBillerNickname(`${bill.billerName} (${ref.slice(-4)})`);
    } catch (err: any) {
      console.warn('Auto fetch failed:', err);
    } finally {
      setIsFetchingBill(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const selectedBiller = billers.find((b) => b.id === selectedBillerId);

  // Filtered Billers
  const filteredBillers = billers.filter((b) => {
    const matchesCategory =
      selectedCategory === 'all' || b.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      b.name.toLowerCase().includes(billerSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(billerSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFetchBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillerId) {
      toastError('Please select a verified utility biller');
      return;
    }
    if (!customerNumber.trim()) {
      toastError('Please enter your customer/account reference number');
      return;
    }

    try {
      setIsFetchingBill(true);
      const bill = await billService.fetchDemoBill(selectedBillerId, customerNumber.trim());
      setFetchedBill(bill);
      setBillerNickname(`${bill.billerName} (${customerNumber.slice(-4)})`);
      success(`Statement fetched: ${formatCurrency(bill.totalPayable)} due`);
    } catch (err: any) {
      toastError(err.message || 'Failed to retrieve bill records from utility server');
    } finally {
      setIsFetchingBill(false);
    }
  };

  const handleExecutePayment = async () => {
    if (!fetchedBill || !selectedBiller) return;
    if (!sourceAccountId) {
      toastError('Please select a payment source account');
      return;
    }

    try {
      setIsExecuting(true);
      const res = await billService.payBill({
        customerId: user?.id || 'cust-001',
        billerId: selectedBiller.id,
        customerNumber: fetchedBill.accountReference,
        amount: fetchedBill.totalPayable,
        sourceAccountId,
        note: paymentNote,
        saveBiller,
        billerNickname,
        autoPayEnabled,
        reminderEnabled,
      });

      setCompletedRecord(res.record);
      success(`Bill payment of ${formatCurrency(res.record.totalPaid)} settled successfully!`);
    } catch (err: any) {
      toastError(err.message || 'Payment execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading && billers.length === 0) {
    return <LoadingState message="Connecting to central billing registry..." />;
  }

  // RENDER: Success Receipt View
  if (completedRecord) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Payment Confirmed & Cleared
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your utility payment was authorized and settled in real-time through the Royal Bank Treasury clearing gateway.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 uppercase font-semibold">Total Paid</span>
              <span className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
                {formatCurrency(completedRecord.totalPaid)}
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Biller Organization</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {completedRecord.billerName}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold">{completedRecord.category}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Consumer Account Reference</span>
                <span className="font-mono font-semibold">{completedRecord.accountReference}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Payment Reference Number</span>
                <span className="font-mono font-bold text-royal-600 dark:text-gold-400">
                  {completedRecord.referenceNumber}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Authorization Code</span>
                <span className="font-mono font-semibold">{completedRecord.authCode}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Timestamp</span>
                <span>{new Date(completedRecord.paymentDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Settlement Account</span>
                <span className="font-mono">{completedRecord.sourceAccountNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs"
            >
              <Printer className="w-4 h-4" /> Print Tax Receipt
            </Button>
            <Button
              variant="outline"
              onClick={() => success('Official PDF receipt saved.')}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs"
            >
              <Download className="w-4 h-4" /> Download PDF
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/bank/bills')}
              className="flex-1 text-xs"
            >
              Back to Utility Hub
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // RENDER: Standard Bill Pay Flow
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/bank/bills')}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-royal-600 dark:text-gold-400" />
            Pay Utility or Municipal Bill
          </h1>
          <p className="text-xs text-slate-500">
            Query live customer balances and execute guaranteed instantaneous payment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Biller Selection & Customer Number Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              1. Select Utility / Biller
            </h2>

            {/* Category Filter */}
            <div className="mb-3">
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Filter Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              >
                <option value="all">All Categories ({billers.length})</option>
                <option value="Electricity">Electricity</option>
                <option value="Gas">Natural Gas</option>
                <option value="Water">Water & Sanitation</option>
                <option value="Internet">Broadband Fiber</option>
                <option value="Telephone">Mobile & Telecom</option>
                <option value="Education">Tuition & Universities</option>
                <option value="Insurance">Insurance Policies</option>
                <option value="Government">Government & Property Tax</option>
                <option value="Credit card">External Credit Cards</option>
                <option value="Subscription">Digital Subscriptions</option>
              </select>
            </div>

            {/* Search Biller */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search biller name..."
                value={billerSearch}
                onChange={(e) => setBillerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            {/* Biller Radio Grid */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/50 mb-4">
              {filteredBillers.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBillerId(b.id);
                    setFetchedBill(null);
                  }}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    selectedBillerId === b.id
                      ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 dark:border-gold-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs text-slate-900 dark:text-slate-100">{b.name}</div>
                    <div className="text-[10px] text-slate-400">{b.category}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {b.fee === 0 ? 'FREE' : formatCurrency(b.fee)}
                  </span>
                </div>
              ))}
            </div>

            {/* Form to enter customer number and fetch bill */}
            <form onSubmit={handleFetchBill} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Input
                label={selectedBiller?.customerNumberLabel || 'Customer / Account Reference Number'}
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                placeholder={selectedBiller?.sampleAccountFormat || 'e.g. 1002948201'}
                helperText="Enter your customer or meter number printed on your bill invoice."
                required
              />

              <Button
                variant="primary"
                type="submit"
                loading={isFetchingBill}
                className="w-full bg-royal-600 hover:bg-royal-500 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Fetch Demo Bill & Due Amount
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Fetched Bill Breakdown & Final Payment Authorization */}
        <div className="lg:col-span-6 space-y-4">
          {fetchedBill ? (
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100">
                    2. Verified Bill Statement
                  </h2>
                  <div className="text-xs text-slate-500">{fetchedBill.billerName}</div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    fetchedBill.status === 'overdue'
                      ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400'
                      : 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400'
                  }`}
                >
                  {fetchedBill.status.toUpperCase()}
                </span>
              </div>

              {/* Statement Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Consumer Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {fetchedBill.consumerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Period:</span>
                  <span>{fetchedBill.billingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-semibold text-amber-600 dark:text-gold-400">
                    {formatDate(fetchedBill.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Base Usage Charges:</span>
                  <span>{formatCurrency(fetchedBill.baseAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Municipal Surcharge:</span>
                  <span>+{formatCurrency(fetchedBill.surcharge)}</span>
                </div>
                {fetchedBill.lateFee > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Late Payment Surcharge:</span>
                    <span>+{formatCurrency(fetchedBill.lateFee)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
                  <span className="text-slate-900 dark:text-slate-100">Total Payable:</span>
                  <span className="font-mono text-royal-600 dark:text-gold-400">
                    {formatCurrency(fetchedBill.totalPayable)}
                  </span>
                </div>
              </div>

              {/* Source Account Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                  Select Payment Account
                </label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) - {formatCurrency(acc.availableBalance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Options: Auto-pay, Reminders, Save Biller */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      Save biller for future payments
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={saveBiller}
                    onChange={(e) => setSaveBiller(e.target.checked)}
                    className="w-4 h-4 text-royal-600 rounded cursor-pointer"
                  />
                </div>

                {saveBiller && (
                  <Input
                    label="Biller Nickname"
                    value={billerNickname}
                    onChange={(e) => setBillerNickname(e.target.value)}
                    placeholder="e.g. Home Electric, Office Fiber"
                  />
                )}

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      Enable Auto-Pay (Direct Debit)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoPayEnabled}
                    onChange={(e) => setAutoPayEnabled(e.target.checked)}
                    className="w-4 h-4 text-royal-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      Send SMS & Email reminder 3 days before due date
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 text-royal-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleExecutePayment}
                loading={isExecuting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 text-sm"
              >
                Authorize & Pay {formatCurrency(fetchedBill.totalPayable)}
              </Button>
            </Card>
          ) : (
            <Card className="p-8 bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center min-h-[350px]">
              <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Awaiting Bill Lookup
              </h3>
              <p className="text-xs text-slate-400 max-w-[260px] mt-1">
                Select your utility organization and click "Fetch Demo Bill" to retrieve your current balance, surcharge calculation, and due date.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
