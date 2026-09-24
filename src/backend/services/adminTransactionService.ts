import { db, simulateLatency } from '../mockApi/storage.ts';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  Customer,
  Account,
  AdminAuditLog,
  AdminDashboardMetrics,
} from '../types/index.ts';

export interface TransactionQueryFilter {
  search?: string;
  status?: string;
  type?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  isFlaggedByAML?: boolean;
  sortBy?: 'timestamp' | 'amount' | 'referenceNumber';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TransactionListResult {
  transactions: (Transaction & {
    customerName?: string;
    customerNumber?: string;
    accountNumber?: string;
  })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionFullDetailResult {
  transaction: Transaction;
  customer: Customer | null;
  account: Account | null;
  auditLogs: AdminAuditLog[];
}

export const adminTransactionService = {
  async getTransactions(filter: TransactionQueryFilter = {}): Promise<TransactionListResult> {
    await simulateLatency(120);
    const {
      search = '',
      status = 'all',
      type = 'all',
      paymentMethod = 'all',
      startDate,
      endDate,
      minAmount,
      maxAmount,
      isFlaggedByAML,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filter;

    let list = [...db.transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.referenceNumber.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.counterpartyName.toLowerCase().includes(q) ||
          (t.counterpartyAccount && t.counterpartyAccount.toLowerCase().includes(q)) ||
          (t.sender && t.sender.toLowerCase().includes(q)) ||
          (t.receiver && t.receiver.toLowerCase().includes(q))
      );
    }

    if (status !== 'all') {
      list = list.filter((t) => t.status === status);
    }

    if (type !== 'all') {
      list = list.filter((t) => t.type === type);
    }

    if (paymentMethod !== 'all') {
      list = list.filter((t) => t.paymentMethod === paymentMethod);
    }

    if (isFlaggedByAML !== undefined) {
      list = list.filter((t) => !!t.isFlaggedByAML === isFlaggedByAML);
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      list = list.filter((t) => new Date(t.timestamp).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime();
      list = list.filter((t) => new Date(t.timestamp).getTime() <= end);
    }

    if (minAmount !== undefined) {
      list = list.filter((t) => Math.abs(t.amount) >= minAmount);
    }

    if (maxAmount !== undefined) {
      list = list.filter((t) => Math.abs(t.amount) <= maxAmount);
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'amount') {
        comparison = Math.abs(a.amount) - Math.abs(b.amount);
      } else if (sortBy === 'referenceNumber') {
        comparison = a.referenceNumber.localeCompare(b.referenceNumber);
      } else {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    const enriched = paginated.map((tx) => {
      const customer = db.customers.find((c) => c.id === tx.customerId);
      const account = db.accounts.find((a) => a.id === tx.accountId);
      return {
        ...tx,
        customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Direct Clearing',
        customerNumber: customer?.customerNumber,
        accountNumber: account?.accountNumber,
      };
    });

    return {
      transactions: enriched,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getTransactionById(id: string): Promise<Transaction | null> {
    await simulateLatency(80);
    const tx = db.transactions.find((t) => t.id === id);
    return tx || null;
  },

  async getTransactionFullDetails(id: string): Promise<TransactionFullDetailResult | null> {
    await simulateLatency(130);
    const transaction = db.transactions.find((t) => t.id === id);
    if (!transaction) return null;

    const customer = db.customers.find((c) => c.id === transaction.customerId) || null;
    const account = db.accounts.find((a) => a.id === transaction.accountId) || null;
    const auditLogs = db.auditLogs.filter(
      (log) => log.targetType === 'transaction' && log.targetId === id
    );

    return {
      transaction,
      customer,
      account,
      auditLogs,
    };
  },

  async approveTransaction(
    id: string,
    notes = 'Dual-key supervisory approval cleared',
    adminName = 'Victoria Ashford'
  ): Promise<Transaction> {
    await simulateLatency(150);
    const index = db.transactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const tx = db.transactions[index];
    tx.status = 'completed';
    tx.isFlaggedByAML = false;
    db.transactions[index] = tx;
    db.persist('transactions', db.transactions);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'APPROVE_TRANSACTION',
      targetType: 'transaction',
      targetId: id,
      targetName: tx.referenceNumber,
      details: `Transaction approved and released to settlement pipeline. ${notes}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return tx;
  },

  async rejectTransaction(
    id: string,
    reason: string,
    adminName = 'Julian Cross'
  ): Promise<Transaction> {
    await simulateLatency(150);
    const index = db.transactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const tx = db.transactions[index];
    tx.status = 'failed';
    db.transactions[index] = tx;
    db.persist('transactions', db.transactions);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-002',
      adminName,
      adminRole: 'compliance_officer',
      action: 'REJECT_TRANSACTION',
      targetType: 'transaction',
      targetId: id,
      targetName: tx.referenceNumber,
      details: `Transaction formally rejected. Reason: ${reason}`,
      ipAddress: '10.240.12.44',
      timestamp: new Date().toISOString(),
      status: 'WARNING',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return tx;
  },

  async reverseTransaction(
    id: string,
    reason: string,
    adminName = 'Victoria Ashford'
  ): Promise<Transaction> {
    await simulateLatency(180);
    const index = db.transactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const originalTx = db.transactions[index];
    originalTx.status = 'reversed';
    db.transactions[index] = originalTx;

    // Restore ledger balance for original transaction
    const accountIndex = db.accounts.findIndex((a) => a.id === originalTx.accountId);
    if (accountIndex !== -1) {
      // If it was debit (negative amount), refund it back; if credit (positive), deduct it back
      const delta = -originalTx.amount;
      db.accounts[accountIndex].balance += delta;
      db.accounts[accountIndex].availableBalance += delta;
      db.accounts[accountIndex].ledgerBalance += delta;
      db.persist('accounts', db.accounts);
    }

    // Create complementary reversal transaction record
    const reversalTx: Transaction = {
      id: `tx-rev-${Date.now()}`,
      accountId: originalTx.accountId,
      customerId: originalTx.customerId,
      referenceNumber: `REV-${originalTx.referenceNumber.replace('REF-', '')}`,
      type: 'transfer_in',
      category: 'Correction / Reversal',
      amount: -originalTx.amount, // reverse polarity
      currency: originalTx.currency,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: `Reversal of [${originalTx.referenceNumber}] - ${reason}`,
      counterpartyName: 'Royal Bank Core Ledger Settlement',
      fee: 0,
      paymentMethod: 'Internal Book Transfer',
    };

    db.transactions.unshift(reversalTx);
    db.persist('transactions', db.transactions);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'REVERSE_SETTLED_TRANSACTION',
      targetType: 'transaction',
      targetId: id,
      targetName: originalTx.referenceNumber,
      details: `Reversed transaction of ${originalTx.currency} ${Math.abs(originalTx.amount).toLocaleString()}. New ledger balancing record: ${reversalTx.referenceNumber}. Reason: ${reason}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return originalTx;
  },

  async refundTransaction(
    id: string,
    reason: string,
    refundAmount?: number,
    adminName = 'Victoria Ashford'
  ): Promise<Transaction> {
    await simulateLatency(160);
    const index = db.transactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const originalTx = db.transactions[index];
    const amountToRefund = refundAmount ?? Math.abs(originalTx.amount);

    // Apply refund to account
    const accountIndex = db.accounts.findIndex((a) => a.id === originalTx.accountId);
    if (accountIndex !== -1) {
      db.accounts[accountIndex].balance += amountToRefund;
      db.accounts[accountIndex].availableBalance += amountToRefund;
      db.accounts[accountIndex].ledgerBalance += amountToRefund;
      db.persist('accounts', db.accounts);
    }

    const refundTx: Transaction = {
      id: `tx-ref-${Date.now()}`,
      accountId: originalTx.accountId,
      customerId: originalTx.customerId,
      referenceNumber: `RFD-${Date.now().toString().slice(-6)}`,
      type: 'transfer_in',
      category: 'Merchant Refund',
      amount: amountToRefund,
      currency: originalTx.currency,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: `Administrative Refund for ${originalTx.referenceNumber} - ${reason}`,
      counterpartyName: originalTx.counterpartyName || 'Royal Bank Merchant Clearing',
      fee: 0,
      paymentMethod: 'Internal Book Transfer',
    };

    db.transactions.unshift(refundTx);
    db.persist('transactions', db.transactions);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'ISSUE_ADMIN_REFUND',
      targetType: 'transaction',
      targetId: id,
      targetName: originalTx.referenceNumber,
      details: `Issued refund of ${originalTx.currency} ${amountToRefund.toLocaleString()}. Reason: ${reason}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return refundTx;
  },

  async exportTransactions(transactions: Transaction[], format: 'csv' | 'json' = 'csv'): Promise<void> {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `royal-bank-transactions-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return;
    }

    const headers = [
      'Reference Number',
      'Timestamp',
      'Type',
      'Category',
      'Amount',
      'Currency',
      'Status',
      'Description',
      'Counterparty',
      'Payment Method',
      'Fee',
      'Flagged AML',
    ];

    const rows = transactions.map((t) => [
      `"${t.referenceNumber}"`,
      `"${t.timestamp}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      t.amount,
      `"${t.currency}"`,
      `"${t.status}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.counterpartyName || '').replace(/"/g, '""')}"`,
      `"${t.paymentMethod || 'Internal Transfer'}"`,
      t.fee,
      t.isFlaggedByAML ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `royal-bank-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    await simulateLatency(100);
    const totalCustomers = db.customers.length;
    const activeCustomers = db.customers.filter((c) => c.status === 'active').length;
    const totalDepositsUSD = db.accounts.reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);
    const totalLoansUSD = db.loans.reduce((sum, l) => sum + l.currentBalance, 0);

    // Today's transactions
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const todayTx = db.transactions.filter((t) => t.timestamp.startsWith(todayStr) || true); // fallback for demo dataset
    const todayTransactionsCount = todayTx.length;
    const todayTransactionsVolumeUSD = todayTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const qrTransactionsCount = db.transactions.filter(
      (t) => t.type === 'qr_payment' || t.paymentMethod === 'EMVCo QR'
    ).length + db.qrPayments.length;

    const failedTransactionsCount = db.transactions.filter((t) => t.status === 'failed').length;
    const pendingKycCount = db.kycApplications.filter((k) => k.status === 'pending').length;
    const pendingLoansCount = db.loans.filter((l) => l.status === 'in_review').length;
    const fraudAlertsCount = db.transactions.filter((t) => t.isFlaggedByAML || t.status === 'flagged').length;

    return {
      totalCustomers,
      activeCustomers,
      totalDepositsUSD,
      totalLoansUSD,
      todayTransactionsCount,
      todayTransactionsVolumeUSD,
      qrTransactionsCount,
      failedTransactionsCount,
      pendingKycCount,
      pendingLoansCount,
      fraudAlertsCount,
      customerGrowthRate: 14.8,
      totalRevenueUSD: 2480500,
    };
  },
};
