import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { Account, AccountType, ChequeBookRequest, ChequeStopRequest } from '../types/index.ts';

const CHEQUE_REQUESTS_KEY = 'royal_bank_cheque_requests';
const CHEQUE_STOPS_KEY = 'royal_bank_cheque_stops';

function getStoredChequeRequests(): ChequeBookRequest[] {
  try {
    const raw = localStorage.getItem(CHEQUE_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 'chq-req-001',
        accountId: 'acc-001',
        accountNumber: '4820-9901-2814',
        leavesCount: 50,
        deliveryOption: 'branch_pickup',
        branch: 'New York Wall Street Flagship',
        status: 'delivered',
        requestedAt: '2026-08-10T11:20:00Z',
        trackingNumber: 'RB-NY-CHK-9921',
      },
    ];
  } catch {
    return [];
  }
}

function saveChequeRequests(items: ChequeBookRequest[]) {
  try {
    localStorage.setItem(CHEQUE_REQUESTS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn(err);
  }
}

function getStoredChequeStops(): ChequeStopRequest[] {
  try {
    const raw = localStorage.getItem(CHEQUE_STOPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChequeStops(items: ChequeStopRequest[]) {
  try {
    localStorage.setItem(CHEQUE_STOPS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn(err);
  }
}

export const accountService = {
  /**
   * Get all accounts for a customer (defaults to primary customer cust-001)
   */
  async getAccounts(customerId = 'cust-001'): Promise<Account[]> {
    await simulateNetworkDelay(90);
    return db.accounts.filter(
      (acc) => acc.customerId === customerId && acc.status !== 'closed'
    );
  },

  /**
   * Get single account by ID
   */
  async getAccountById(accountId: string): Promise<Account | null> {
    await simulateNetworkDelay(70);
    const found = db.accounts.find((acc) => acc.id === accountId);
    return found || null;
  },

  /**
   * Open a new account (Savings, Current, DPS, FDR, etc.)
   */
  async openAccount(params: {
    customerId: string;
    name: string;
    type: AccountType;
    currency: 'USD' | 'EUR' | 'GBP' | 'CHF' | 'SGD';
    initialDeposit: number;
    branch?: string;
    monthlyInstallment?: number;
    tenureMonths?: number;
  }): Promise<Account> {
    await simulateNetworkDelay(250);

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const accNumber = `4820-9901-${randomDigits}`;
    const ibanPrefix = params.currency === 'GBP' ? 'GB29' : params.currency === 'CHF' ? 'CH44' : 'US89';
    const iban = `${ibanPrefix}RBANK${accNumber.replace(/-/g, '')}`;

    let interestRate = 1.5;
    if (params.type === 'savings') interestRate = 4.85;
    if (params.type === 'dps') interestRate = 6.25;
    if (params.type === 'fdr') interestRate = 5.5;

    let maturityDate: string | undefined;
    let maturityAmount: number | undefined;

    if (params.tenureMonths) {
      const d = new Date();
      d.setMonth(d.getMonth() + params.tenureMonths);
      maturityDate = d.toISOString();

      if (params.type === 'fdr') {
        maturityAmount = +(params.initialDeposit * (1 + (interestRate / 100) * (params.tenureMonths / 12))).toFixed(2);
      } else if (params.type === 'dps' && params.monthlyInstallment) {
        const totalPaid = params.monthlyInstallment * params.tenureMonths;
        maturityAmount = +(totalPaid * 1.15).toFixed(2);
      }
    }

    const newAccount: Account = {
      id: `acc-${Date.now().toString(36)}`,
      customerId: params.customerId,
      accountNumber: accNumber,
      iban,
      swiftBic: params.currency === 'GBP' ? 'ROBANG22XXX' : params.currency === 'CHF' ? 'ROBACH88XXX' : 'ROBANUS33XXX',
      currency: params.currency,
      name: params.name,
      type: params.type,
      balance: params.initialDeposit,
      availableBalance: params.initialDeposit,
      ledgerBalance: params.initialDeposit,
      status: 'active',
      openedAt: new Date().toISOString(),
      interestRateAnnual: interestRate,
      branch: params.branch || 'New York Wall Street Flagship',
      accountHolder: 'Alexander Sterling',
      monthlyInstallment: params.monthlyInstallment,
      tenureMonths: params.tenureMonths,
      maturityDate,
      maturityAmount,
    };

    db.accounts.push(newAccount);
    db.persist('accounts', db.accounts);

    return newAccount;
  },

  /**
   * Close account
   */
  async closeAccount(accountId: string, reason: string): Promise<{ success: boolean; message: string }> {
    await simulateNetworkDelay(200);
    const acc = db.accounts.find((a) => a.id === accountId);
    if (!acc) {
      throw new Error('Account not found.');
    }
    if (acc.balance > 0) {
      throw new Error('Cannot close an account with a remaining credit balance. Please transfer funds out first.');
    }

    acc.status = 'closed';
    db.persist('accounts', db.accounts);
    return {
      success: true,
      message: `Account ${acc.accountNumber} has been successfully closed. Confirmation reference: RB-CLS-${Date.now()}`,
    };
  },

  /**
   * Rename / Set Custom Nickname for Account
   */
  async renameAccount(accountId: string, customNickName: string): Promise<Account> {
    await simulateNetworkDelay(120);
    const acc = db.accounts.find((a) => a.id === accountId);
    if (!acc) throw new Error('Account not found.');

    acc.customNickName = customNickName;
    db.persist('accounts', db.accounts);
    return acc;
  },

  /**
   * Get financial totals breakdown
   */
  async getAccountSummary(customerId = 'cust-001') {
    const accounts = await this.getAccounts(customerId);

    let totalBalanceUSD = 0;
    let availableBalanceUSD = 0;
    let savingsTotal = 0;
    let currentTotal = 0;
    let dpsTotal = 0;
    let fdrTotal = 0;

    for (const acc of accounts) {
      // Normalize simple conversion rates for demo: GBP ~ 1.30 USD, CHF ~ 1.15 USD
      const rate = acc.currency === 'GBP' ? 1.3 : acc.currency === 'CHF' ? 1.15 : 1.0;
      const balanceInUSD = acc.balance * rate;
      const availInUSD = acc.availableBalance * rate;

      totalBalanceUSD += balanceInUSD;
      availableBalanceUSD += availInUSD;

      if (acc.type === 'savings') savingsTotal += balanceInUSD;
      else if (acc.type === 'checking' || acc.type === 'current') currentTotal += balanceInUSD;
      else if (acc.type === 'dps') dpsTotal += balanceInUSD;
      else if (acc.type === 'fdr') fdrTotal += balanceInUSD;
    }

    return {
      totalBalanceUSD,
      availableBalanceUSD,
      savingsTotal,
      currentTotal,
      dpsTotal,
      fdrTotal,
      accountCount: accounts.length,
    };
  },

  /**
   * Cheque Book Services
   */
  async requestChequeBook(params: {
    accountId: string;
    leavesCount: 25 | 50 | 100;
    deliveryOption: 'branch_pickup' | 'registered_courier';
    branch?: string;
  }): Promise<ChequeBookRequest> {
    await simulateNetworkDelay(200);
    const acc = db.accounts.find((a) => a.id === params.accountId);
    if (!acc) throw new Error('Account not found.');

    const newReq: ChequeBookRequest = {
      id: `chq-${Date.now().toString(36)}`,
      accountId: params.accountId,
      accountNumber: acc.accountNumber,
      leavesCount: params.leavesCount,
      deliveryOption: params.deliveryOption,
      branch: params.branch || acc.branch,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      trackingNumber: `RB-CHK-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    const requests = getStoredChequeRequests();
    requests.unshift(newReq);
    saveChequeRequests(requests);

    return newReq;
  },

  async getChequeBookRequests(accountId?: string): Promise<ChequeBookRequest[]> {
    await simulateNetworkDelay(80);
    const all = getStoredChequeRequests();
    if (accountId) return all.filter((r) => r.accountId === accountId);
    return all;
  },

  async stopCheque(params: {
    accountId: string;
    chequeNumber: string;
    reason: string;
    amount?: number;
  }): Promise<ChequeStopRequest> {
    await simulateNetworkDelay(200);
    const newStop: ChequeStopRequest = {
      id: `stp-${Date.now().toString(36)}`,
      accountId: params.accountId,
      chequeNumber: params.chequeNumber,
      reason: params.reason,
      amount: params.amount,
      stoppedAt: new Date().toISOString(),
      status: 'active',
    };

    const stops = getStoredChequeStops();
    stops.unshift(newStop);
    saveChequeStops(stops);

    return newStop;
  },

  async getStoppedCheques(accountId?: string): Promise<ChequeStopRequest[]> {
    await simulateNetworkDelay(80);
    const stops = getStoredChequeStops();
    if (accountId) return stops.filter((s) => s.accountId === accountId);
    return stops;
  },
};
