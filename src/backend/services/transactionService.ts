import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { Transaction, Account } from '../types/index.ts';

export interface TransactionFilters {
  accountId?: string;
  customerId?: string;
  type?: string;
  status?: string;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const transactionService = {
  /**
   * Get filtered transactions
   */
  async getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    await simulateNetworkDelay(100);
    const customerId = filters.customerId || 'cust-001';

    let txs = db.transactions.filter((tx) => tx.customerId === customerId);

    if (filters.accountId && filters.accountId !== 'all') {
      txs = txs.filter((tx) => tx.accountId === filters.accountId);
    }
    if (filters.type && filters.type !== 'all') {
      txs = txs.filter((tx) => tx.type === filters.type);
    }
    if (filters.status && filters.status !== 'all') {
      txs = txs.filter((tx) => tx.status === filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      txs = txs.filter((tx) => tx.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      txs = txs.filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          tx.counterpartyName.toLowerCase().includes(q) ||
          tx.referenceNumber.toLowerCase().includes(q) ||
          (tx.counterpartyAccount && tx.counterpartyAccount.toLowerCase().includes(q))
      );
    }
    if (filters.startDate) {
      txs = txs.filter((tx) => new Date(tx.timestamp) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      txs = txs.filter((tx) => new Date(tx.timestamp) <= new Date(filters.endDate!));
    }
    if (filters.minAmount !== undefined) {
      txs = txs.filter((tx) => Math.abs(tx.amount) >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      txs = txs.filter((tx) => Math.abs(tx.amount) <= filters.maxAmount!);
    }

    // Sort newest first
    return txs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  /**
   * Get single transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    await simulateNetworkDelay(70);
    const found = db.transactions.find((t) => t.id === transactionId);
    return found || null;
  },

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit = 6, customerId = 'cust-001'): Promise<Transaction[]> {
    await simulateNetworkDelay(60);
    const customerTxs = db.transactions
      .filter((tx) => tx.customerId === customerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return customerTxs.slice(0, limit);
  },

  /**
   * Calculate monthly spending, income vs expense, category breakdown, and trends
   */
  async getMonthlyFinancialOverview(customerId = 'cust-001') {
    await simulateNetworkDelay(100);
    const txs = db.transactions.filter((tx) => tx.customerId === customerId);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    for (const tx of txs) {
      if (tx.status === 'failed' || tx.status === 'reversed') continue;
      if (tx.amount > 0) {
        totalIncome += tx.amount;
      } else {
        const absVal = Math.abs(tx.amount);
        totalExpense += absVal;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + absVal;
      }
    }

    // Category breakdown
    const categoryBreakdown = Object.entries(categoryTotals).map(([cat, amount]) => ({
      category: cat,
      amount,
      percentage: totalExpense > 0 ? +((amount / totalExpense) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // Monthly Trends for financial chart
    const monthlyTrends = [
      { month: 'Apr', income: 65000, expense: 38200 },
      { month: 'May', income: 72000, expense: 42100 },
      { month: 'Jun', income: 84000, expense: 51200 },
      { month: 'Jul', income: 68000, expense: 34900 },
      { month: 'Aug', income: 91000, expense: 62400 },
      { month: 'Sep', income: 85000, expense: 41100 },
    ];

    return {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      monthlySpending: 41100,
      monthlyTrends,
      categoryBreakdown,
    };
  },

  /**
   * Generate Account Statement
   */
  async getAccountStatement(accountId: string, startDate?: string, endDate?: string): Promise<{
    account: Account;
    transactions: Transaction[];
    openingBalance: number;
    closingBalance: number;
    totalCredits: number;
    totalDebits: number;
    statementPeriod: { from: string; to: string };
  }> {
    await simulateNetworkDelay(150);
    const account = db.accounts.find((a) => a.id === accountId);
    if (!account) throw new Error('Account not found.');

    const fromDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const toDate = endDate ? new Date(endDate) : new Date();

    const txs = db.transactions
      .filter((t) => t.accountId === accountId)
      .filter((t) => {
        const tDate = new Date(t.timestamp);
        return tDate >= fromDate && tDate <= toDate;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalCredits = 0;
    let totalDebits = 0;

    for (const t of txs) {
      if (t.amount > 0) totalCredits += t.amount;
      else totalDebits += Math.abs(t.amount);
    }

    const closingBalance = account.balance;
    const openingBalance = closingBalance - totalCredits + totalDebits;

    return {
      account,
      transactions: txs,
      openingBalance,
      closingBalance,
      totalCredits,
      totalDebits,
      statementPeriod: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
    };
  },

  /**
   * Execute or record a new transaction
   */
  async recordTransaction(tx: Omit<Transaction, 'id' | 'timestamp' | 'referenceNumber'>): Promise<Transaction> {
    await simulateNetworkDelay(200);
    const refNum = `RB-TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      referenceNumber: refNum,
    };

    db.transactions.unshift(newTx);
    db.persist('transactions', db.transactions);

    // Update account balance
    const acc = db.accounts.find((a) => a.id === tx.accountId);
    if (acc) {
      acc.balance += tx.amount - (tx.fee || 0);
      acc.availableBalance = acc.balance;
      acc.ledgerBalance = acc.balance;
      db.persist('accounts', db.accounts);
    }

    return newTx;
  },
};
