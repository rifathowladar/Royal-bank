import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/index.ts';
import {
  accountService,
  transactionService,
  getCards,
  getLoans,
  getNotifications,
  Account,
  Transaction,
  Card as CardType,
  Loan,
  Notification,
} from '../../backend/index.ts';
import {
  BalanceCard,
  AccountCard,
  TransactionItem,
  TransactionDetails,
  QuickAction,
  FinancialChart,
  AccountSummary,
} from '../../components/banking/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import {
  Bell,
  CreditCard,
  Building,
  CalendarClock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  PlusCircle,
  Eye,
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [financialOverview, setFinancialOverview] = useState<{
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    monthlySpending: number;
    monthlyTrends: { month: string; income: number; expense: number }[];
    categoryBreakdown: { category: string; amount: number; percentage: number }[];
  } | null>(null);
  const [accountSummary, setAccountSummary] = useState<{
    totalBalanceUSD: number;
    availableBalanceUSD: number;
    savingsTotal: number;
    currentTotal: number;
    dpsTotal: number;
    fdrTotal: number;
    accountCount: number;
  }>({
    totalBalanceUSD: 0,
    availableBalanceUSD: 0,
    savingsTotal: 0,
    currentTotal: 0,
    dpsTotal: 0,
    fdrTotal: 0,
    accountCount: 0,
  });
  const [cards, setCards] = useState<CardType[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const customerId = user?.id || 'cust-001';

    Promise.all([
      accountService.getAccounts(customerId),
      accountService.getAccountSummary(customerId),
      transactionService.getRecentTransactions(6, customerId),
      transactionService.getMonthlyFinancialOverview(customerId),
      getCards(customerId),
      getLoans(customerId),
      getNotifications(customerId),
    ])
      .then(([accs, sum, txs, fin, crds, lns, notifs]) => {
        if (!mounted) return;
        setAccounts(accs);
        setAccountSummary(sum);
        setRecentTransactions(txs);
        setFinancialOverview(fin);
        setCards(crds);
        setLoans(lns);
        setNotifications(notifs.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) {
    return <LoadingState type="card" message="Decrypting sovereign vault balances & records..." />;
  }

  // Upcoming scheduled payments mock list
  const upcomingPayments = [
    {
      id: 'up-1',
      title: 'Mortgage Amortization - Manhattan Penthouse',
      dueDate: 'Oct 01, 2026',
      amount: 14200.0,
      currency: 'USD',
      account: 'Primary Operational (..2814)',
      type: 'Loan',
    },
    {
      id: 'up-2',
      title: 'Royal Wealth DPS Scheme Monthly Deposit',
      dueDate: 'Oct 05, 2026',
      amount: 1000.0,
      currency: 'USD',
      account: 'Primary Operational (..2814)',
      type: 'DPS',
    },
    {
      id: 'up-3',
      title: 'Park Avenue HOA Residence Maintenance',
      dueDate: 'Oct 15, 2026',
      amount: 1850.25,
      currency: 'USD',
      account: 'Primary Operational (..2814)',
      type: 'Utility',
    },
  ];

  const primaryCard = cards[0];
  const primaryLoan = loans[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-royal-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Sovereign Depository Vault
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 font-medium">Customer: RB-984021</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Welcome back, {user?.firstName || 'Alexander'} {user?.lastName || 'Sterling'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/bank/accounts/statement')}
            className="text-xs"
          >
            Bank Statement
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/bank/accounts/open')}
            icon={<PlusCircle className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Open New Account
          </Button>
        </div>
      </div>

      {/* 1. Main Balance Hero Component */}
      <BalanceCard
        totalBalance={accountSummary.totalBalanceUSD}
        availableBalance={accountSummary.availableBalanceUSD}
        savingsTotal={accountSummary.savingsTotal}
        currentTotal={accountSummary.currentTotal}
        dpsTotal={accountSummary.dpsTotal}
        fdrTotal={accountSummary.fdrTotal}
        currency="USD"
        onSendMoney={() => navigate('/bank/transfers?mode=wire')}
        onDeposit={() => navigate('/bank/deposits')}
      />

      {/* 2. Quick Actions Bar (All 8 requested items) */}
      <QuickAction onActionClick={(id) => console.log('Action triggered:', id)} />

      {/* 3. Account Summary Bento Section (Savings, Current, DPS, FDR) */}
      <AccountSummary
        savingsTotal={accountSummary.savingsTotal}
        currentTotal={accountSummary.currentTotal}
        dpsTotal={accountSummary.dpsTotal}
        fdrTotal={accountSummary.fdrTotal}
        accountCount={accountSummary.accountCount}
        onOpenNew={() => navigate('/bank/accounts/open')}
      />

      {/* 4. Active Accounts Carousel / Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Primary Depository Accounts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct access to operational ledgers, vaults, and terms
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bank/accounts')}
            className="text-xs text-royal-600 dark:text-gold-400 hover:underline"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            View All ({accounts.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.slice(0, 3).map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              onTransfer={() => navigate(`/bank/transfers?from=${acc.id}`)}
              onViewStatement={() => navigate(`/bank/accounts/${acc.id}/statement`)}
              onChequeBook={() => navigate(`/bank/accounts/cheque-book?accountId=${acc.id}`)}
              onCloseAccount={() => navigate(`/bank/accounts/close?accountId=${acc.id}`)}
            />
          ))}
        </div>
      </div>

      {/* 5. Financial Overview & Analytics Section (Income vs Expense, Monthly Trends) */}
      {financialOverview && (
        <FinancialChart
          monthlyTrends={financialOverview.monthlyTrends}
          categoryBreakdown={financialOverview.categoryBreakdown}
        />
      )}

      {/* 6. Recent Transactions & Upcoming Payments Dual Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Settlements & Activity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time clearing across international rails
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/bank/accounts/acc-001/transactions')}
              className="text-xs"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              All Records
            </Button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onClick={(t) => {
                  setSelectedTx(t);
                  setIsDetailsOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar: Upcoming Payments, Cards & Loans Summary */}
        <div className="space-y-6">
          {/* Upcoming Payments Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Upcoming Payments
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {upcomingPayments.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {upcomingPayments.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {item.title}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> Due {item.dueDate}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-medium">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/bank/bills')}
              className="w-full text-xs"
            >
              Manage Scheduled Payments
            </Button>
          </div>

          {/* Card Summary Card */}
          {primaryCard && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-royal-950 to-slate-900 border border-slate-800 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gold-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Primary Card Instrument
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-base font-mono tracking-widest text-slate-200">
                  {primaryCard.cardNumberMasked}
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                  <span>{primaryCard.cardholderName}</span>
                  <span className="font-mono">
                    {String(primaryCard.expiryMonth).padStart(2, '0')}/{primaryCard.expiryYear}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Spend Limit:</span>
                  <span className="font-mono text-white">
                    ${primaryCard.spendingCurrentMonthly.toLocaleString()} / $
                    {primaryCard.spendingLimitMonthly.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    style={{
                      width: `${(primaryCard.spendingCurrentMonthly / primaryCard.spendingLimitMonthly) * 100}%`,
                    }}
                    className="h-full bg-gold-400 rounded-full"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/bank/cards')}
                className="w-full text-xs text-white border-white/20 hover:bg-white/10"
              >
                Card Security & Limits
              </Button>
            </div>
          )}

          {/* Loan Summary Card */}
          {primaryLoan && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Sovereign Credit Facility
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                  {primaryLoan.annualInterestRate}% Fixed
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Current Outstanding Balance</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  ${primaryLoan.currentBalance.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Original Principal: ${primaryLoan.principalAmount.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly Installment</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${primaryLoan.monthlyInstallment.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Remaining Term</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {primaryLoan.remainingMonths} Months
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/bank/loans')}
                className="w-full text-xs"
              >
                Loan Schedule & Payoff
              </Button>
            </div>
          )}

          {/* Notifications Card */}
          {notifications.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Notifications
                  </h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/bank/notifications')}
                  className="text-[11px] p-0 h-auto text-royal-600 dark:text-gold-400"
                >
                  View All
                </Button>
              </div>

              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {n.title}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block pt-0.5">
                      {new Date(n.timestamp || n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
};
