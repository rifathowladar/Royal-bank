import { db, simulateLatency } from '../mockApi/storage.ts';
import {
  Account,
  AccountType,
  AccountStatus,
  AccountLimits,
  Customer,
  Transaction,
  Card,
  AdminAuditLog,
} from '../types/index.ts';

export interface AccountQueryFilter {
  search?: string;
  status?: string;
  type?: string;
  currency?: string;
  branch?: string;
  sortBy?: 'name' | 'balance' | 'openedAt' | 'accountNumber';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AccountListResult {
  accounts: (Account & { customerName?: string; customerEmail?: string })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AccountFullDetailResult {
  account: Account;
  customer: Customer | null;
  limits: AccountLimits;
  transactions: Transaction[];
  cards: Card[];
  auditLogs: AdminAuditLog[];
}

export interface CreateAccountPayload {
  customerId: string;
  type: AccountType;
  currency: 'USD' | 'EUR' | 'GBP' | 'CHF' | 'SGD';
  name: string;
  customNickName?: string;
  initialDeposit: number;
  branch: string;
  interestRateAnnual?: number;
}

export const adminAccountService = {
  async getAccounts(filter: AccountQueryFilter = {}): Promise<AccountListResult> {
    await simulateLatency(120);
    const {
      search = '',
      status = 'all',
      type = 'all',
      currency = 'all',
      branch = 'all',
      sortBy = 'openedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filter;

    let list = [...db.accounts];

    // Search by account number, name, holder or IBAN
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.accountNumber.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.accountHolder.toLowerCase().includes(q) ||
          a.iban.toLowerCase().includes(q)
      );
    }

    if (status !== 'all') {
      list = list.filter((a) => a.status === status);
    }

    if (type !== 'all') {
      list = list.filter((a) => a.type === type);
    }

    if (currency !== 'all') {
      list = list.filter((a) => a.currency === currency);
    }

    if (branch !== 'all') {
      list = list.filter((a) => a.branch === branch);
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'balance') {
        comparison = a.balance - b.balance;
      } else if (sortBy === 'accountNumber') {
        comparison = a.accountNumber.localeCompare(b.accountNumber);
      } else {
        comparison = new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    const enriched = paginated.map((acc) => {
      const customer = db.customers.find((c) => c.id === acc.customerId);
      return {
        ...acc,
        customerName: customer ? `${customer.firstName} ${customer.lastName}` : acc.accountHolder,
        customerEmail: customer?.email,
      };
    });

    return {
      accounts: enriched,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getAccountById(id: string): Promise<Account | null> {
    await simulateLatency(80);
    const account = db.accounts.find((a) => a.id === id);
    return account || null;
  },

  async getAccountFullDetails(id: string): Promise<AccountFullDetailResult | null> {
    await simulateLatency(140);
    const account = db.accounts.find((a) => a.id === id);
    if (!account) return null;

    const customer = db.customers.find((c) => c.id === account.customerId) || null;
    const transactions = db.transactions
      .filter((t) => t.accountId === id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const cards = db.cards.filter((c) => c.accountId === id);

    let limits = db.accountLimits[id];
    if (!limits) {
      limits = {
        accountId: id,
        dailyTransferLimit: 150000,
        dailyAtmLimit: 3000,
        singleTransactionLimit: 50000,
        internationalTransferLimit: 250000,
        isOverdraftAllowed: false,
        overdraftLimit: 0,
        updatedAt: account.openedAt,
        updatedBy: 'System Default',
      };
      db.accountLimits[id] = limits;
      db.persist('accountLimits', db.accountLimits);
    }

    const auditLogs = db.auditLogs.filter(
      (log) => log.targetType === 'account' && log.targetId === id
    );

    return {
      account,
      customer,
      limits,
      transactions,
      cards,
      auditLogs,
    };
  },

  async createAccount(
    payload: CreateAccountPayload,
    adminName = 'Victoria Ashford'
  ): Promise<Account> {
    await simulateLatency(180);
    const customer = db.customers.find((c) => c.id === payload.customerId);
    if (!customer) throw new Error('Target customer does not exist');

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const accountNumber = `4820-${Math.floor(1000 + Math.random() * 9000)}-${randomSuffix}`;
    const countryCode = payload.currency === 'GBP' ? 'GB' : payload.currency === 'CHF' ? 'CH' : payload.currency === 'EUR' ? 'DE' : 'US';
    const iban = `${countryCode}89RBANK${accountNumber.replace(/-/g, '')}`;
    const swiftBic = payload.currency === 'GBP' ? 'ROBANG22XXX' : payload.currency === 'CHF' ? 'ROBACH22XXX' : 'ROBANUS33XXX';

    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      customerId: customer.id,
      accountNumber,
      iban,
      swiftBic,
      currency: payload.currency,
      name: payload.name,
      customNickName: payload.customNickName,
      type: payload.type,
      balance: payload.initialDeposit || 0,
      availableBalance: payload.initialDeposit || 0,
      ledgerBalance: payload.initialDeposit || 0,
      status: 'active',
      openedAt: new Date().toISOString(),
      interestRateAnnual: payload.interestRateAnnual ?? (payload.type === 'savings' ? 4.5 : 1.0),
      branch: payload.branch,
      accountHolder: `${customer.firstName} ${customer.lastName}`,
    };

    db.accounts.unshift(newAccount);
    db.persist('accounts', db.accounts);

    // Update customer totalBalanceUSD if needed
    customer.totalBalanceUSD += payload.initialDeposit;
    db.persist('customers', db.customers);

    // Initial deposit transaction if > 0
    if (payload.initialDeposit > 0) {
      const depositTx: Transaction = {
        id: `tx-${Date.now()}`,
        accountId: newAccount.id,
        customerId: customer.id,
        referenceNumber: `DEP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        type: 'deposit',
        category: 'Deposit',
        amount: payload.initialDeposit,
        currency: payload.currency,
        status: 'completed',
        timestamp: new Date().toISOString(),
        description: 'Initial Sovereign Vault Opening Deposit',
        counterpartyName: 'Royal Bank Treasury Division',
        fee: 0,
        paymentMethod: 'Internal Book Transfer',
      };
      db.transactions.unshift(depositTx);
      db.persist('transactions', db.transactions);
    }

    // Default limits
    db.accountLimits[newAccount.id] = {
      accountId: newAccount.id,
      dailyTransferLimit: 250000,
      dailyAtmLimit: 5000,
      singleTransactionLimit: 100000,
      internationalTransferLimit: 500000,
      isOverdraftAllowed: false,
      overdraftLimit: 0,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName,
    };
    db.persist('accountLimits', db.accountLimits);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'PROVISION_ACCOUNT_LEDGER',
      targetType: 'account',
      targetId: newAccount.id,
      targetName: `${newAccount.name} (${newAccount.accountNumber})`,
      details: `Opened new ${payload.type} ledger with ${payload.currency} ${payload.initialDeposit.toLocaleString()} initial funding for ${newAccount.accountHolder}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return newAccount;
  },

  async approveAccount(id: string, adminName = 'Victoria Ashford'): Promise<Account> {
    await simulateLatency(120);
    const index = db.accounts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Account not found');

    db.accounts[index].status = 'active';
    db.persist('accounts', db.accounts);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'APPROVE_ACCOUNT_LEDGER',
      targetType: 'account',
      targetId: id,
      targetName: db.accounts[index].accountNumber,
      details: 'Account ledger formally cleared and activated by Supervisory Treasury',
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return db.accounts[index];
  },

  async freezeAccount(
    id: string,
    reason: string,
    adminName = 'Julian Cross'
  ): Promise<Account> {
    await simulateLatency(140);
    const index = db.accounts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Account not found');

    db.accounts[index].status = 'frozen';
    db.persist('accounts', db.accounts);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-002',
      adminName,
      adminRole: 'compliance_officer',
      action: 'FREEZE_ACCOUNT_LEDGER',
      targetType: 'account',
      targetId: id,
      targetName: db.accounts[index].accountNumber,
      details: `Account operations frozen. Reason: ${reason}`,
      ipAddress: '10.240.12.44',
      timestamp: new Date().toISOString(),
      status: 'WARNING',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return db.accounts[index];
  },

  async unfreezeAccount(
    id: string,
    reason: string,
    adminName = 'Julian Cross'
  ): Promise<Account> {
    await simulateLatency(140);
    const index = db.accounts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Account not found');

    db.accounts[index].status = 'active';
    db.persist('accounts', db.accounts);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-002',
      adminName,
      adminRole: 'compliance_officer',
      action: 'UNFREEZE_ACCOUNT_LEDGER',
      targetType: 'account',
      targetId: id,
      targetName: db.accounts[index].accountNumber,
      details: `Account freeze lifted and active status restored. Reason: ${reason}`,
      ipAddress: '10.240.12.44',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return db.accounts[index];
  },

  async closeAccount(
    id: string,
    reason: string,
    adminName = 'Victoria Ashford'
  ): Promise<Account> {
    await simulateLatency(150);
    const index = db.accounts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Account not found');

    db.accounts[index].status = 'closed';
    db.persist('accounts', db.accounts);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'CLOSE_ACCOUNT_LEDGER',
      targetType: 'account',
      targetId: id,
      targetName: db.accounts[index].accountNumber,
      details: `Account permanently closed. Reason: ${reason}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'WARNING',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return db.accounts[index];
  },

  async reactivateAccount(
    id: string,
    reason: string,
    adminName = 'Victoria Ashford'
  ): Promise<Account> {
    await simulateLatency(140);
    const index = db.accounts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Account not found');

    db.accounts[index].status = 'active';
    db.persist('accounts', db.accounts);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'REACTIVATE_ACCOUNT_LEDGER',
      targetType: 'account',
      targetId: id,
      targetName: db.accounts[index].accountNumber,
      details: `Reactivated account ledger. Reason: ${reason}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return db.accounts[index];
  },

  async changeAccountStatus(
    id: string,
    status: AccountStatus,
    reason: string,
    adminName = 'Victoria Ashford'
  ): Promise<Account> {
    await simulateLatency(130);
    const index = db.accounts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Account not found');

    const previousStatus = db.accounts[index].status;
    db.accounts[index].status = status;
    db.persist('accounts', db.accounts);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'CHANGE_ACCOUNT_STATUS',
      targetType: 'account',
      targetId: id,
      targetName: db.accounts[index].accountNumber,
      details: `Status altered from ${previousStatus} to ${status}. Reason: ${reason}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: status === 'frozen' || status === 'restricted' ? 'WARNING' : 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return db.accounts[index];
  },

  async changeLimits(
    id: string,
    limits: Partial<AccountLimits>,
    adminName = 'Victoria Ashford'
  ): Promise<AccountLimits> {
    await simulateLatency(130);
    const existing = db.accountLimits[id] || {
      accountId: id,
      dailyTransferLimit: 150000,
      dailyAtmLimit: 3000,
      singleTransactionLimit: 50000,
      internationalTransferLimit: 250000,
      isOverdraftAllowed: false,
      overdraftLimit: 0,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName,
    };

    const updated: AccountLimits = {
      ...existing,
      ...limits,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName,
    };

    db.accountLimits[id] = updated;
    db.persist('accountLimits', db.accountLimits);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'UPDATE_ACCOUNT_LIMITS',
      targetType: 'account',
      targetId: id,
      details: `Daily Transfer: $${updated.dailyTransferLimit.toLocaleString()} | Single Tx: $${updated.singleTransactionLimit.toLocaleString()} | Overdraft: $${updated.overdraftLimit.toLocaleString()}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return updated;
  },
};
