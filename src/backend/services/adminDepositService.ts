import { db } from '../mockApi/storage.ts';
import { AdminAuditLog } from '../types/index.ts';

export type AdminDepositCategory = 'DPS' | 'FDR' | 'Term Fixed Deposit';
export type AdminDepositStatus = 'active' | 'pending_approval' | 'matured' | 'early_withdrawn' | 'closed';

export interface AdminDepositScheme {
  id: string;
  schemeNumber: string;
  customerId: string;
  customerName: string;
  category: AdminDepositCategory; // 'DPS' | 'FDR' | 'Term Fixed Deposit'
  schemeTitle: string;
  sourceAccountId: string;
  sourceAccountNumber: string;
  principalAmount: number; // for FDR or initial deposit
  monthlyInstallment?: number; // for DPS
  installmentsPaid?: number; // for DPS e.g. 14 / 60
  totalInstallments?: number; // for DPS e.g. 60
  currency: string;
  interestRateAnnual: number; // e.g. 7.5%
  termMonths: number;
  startDate: string;
  maturityDate: string;
  maturityPayoutAmount: number;
  accruedInterest: number;
  earlyWithdrawalPenaltyPercent: number; // e.g. 1.5%
  status: AdminDepositStatus;
  autoRenew: boolean;
  renewalType?: 'principal_only' | 'principal_and_interest';
  nomineeName?: string;
  nomineeRelationship?: string;
  createdAt: string;
}

const INITIAL_DEPOSITS: AdminDepositScheme[] = [
  // FDRs
  {
    id: 'fdr-001',
    schemeNumber: 'RB-FDR-2026-8801',
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    category: 'FDR',
    schemeTitle: 'Sovereign High Yield Term FDR',
    sourceAccountId: 'acc-001',
    sourceAccountNumber: 'RB-NY-092144',
    principalAmount: 500000.00,
    currency: 'USD',
    interestRateAnnual: 5.65,
    termMonths: 24,
    startDate: '2025-09-01',
    maturityDate: '2027-09-01',
    maturityPayoutAmount: 556500.00,
    accruedInterest: 29800.00,
    earlyWithdrawalPenaltyPercent: 1.5,
    status: 'active',
    autoRenew: true,
    renewalType: 'principal_and_interest',
    nomineeName: 'Evelyn Sterling',
    nomineeRelationship: 'Spouse',
    createdAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'fdr-002',
    schemeNumber: 'RB-FDR-2026-8802',
    customerId: 'cust-002',
    customerName: 'Elena Rostova',
    category: 'FDR',
    schemeTitle: 'Sterling Platinum Fixed Deposit',
    sourceAccountId: 'acc-002',
    sourceAccountNumber: 'RB-LON-881290',
    principalAmount: 250000.00,
    currency: 'USD',
    interestRateAnnual: 5.25,
    termMonths: 12,
    startDate: '2025-10-15',
    maturityDate: '2026-10-15',
    maturityPayoutAmount: 263125.00,
    accruedInterest: 12250.00,
    earlyWithdrawalPenaltyPercent: 1.5,
    status: 'active',
    autoRenew: false,
    nomineeName: 'Dmitri Rostov',
    nomineeRelationship: 'Brother',
    createdAt: '2025-10-15T11:00:00Z',
  },
  {
    id: 'fdr-003',
    schemeNumber: 'RB-FDR-2026-8803',
    customerId: 'cust-003',
    customerName: 'Julian Croft',
    category: 'FDR',
    schemeTitle: 'Swiss Alpine Vault Certificate',
    sourceAccountId: 'acc-003',
    sourceAccountNumber: 'RB-ZUR-330198',
    principalAmount: 100000.00,
    currency: 'USD',
    interestRateAnnual: 4.75,
    termMonths: 6,
    startDate: '2026-03-20',
    maturityDate: '2026-09-20',
    maturityPayoutAmount: 102375.00,
    accruedInterest: 2375.00,
    earlyWithdrawalPenaltyPercent: 1.0,
    status: 'matured',
    autoRenew: false,
    createdAt: '2026-03-20T08:00:00Z',
  },
  // DPS (Deposit Pension Schemes)
  {
    id: 'dps-001',
    schemeNumber: 'RB-DPS-2026-3301',
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    category: 'DPS',
    schemeTitle: 'Royal Dynasty Millionaire DPS',
    sourceAccountId: 'acc-001',
    sourceAccountNumber: 'RB-NY-092144',
    principalAmount: 0,
    monthlyInstallment: 5000.00,
    installmentsPaid: 24,
    totalInstallments: 60, // 5 years
    currency: 'USD',
    interestRateAnnual: 7.20,
    termMonths: 60,
    startDate: '2024-09-01',
    maturityDate: '2029-09-01',
    maturityPayoutAmount: 362400.00,
    accruedInterest: 18450.00,
    earlyWithdrawalPenaltyPercent: 2.0,
    status: 'active',
    autoRenew: false,
    nomineeName: 'Evelyn Sterling',
    nomineeRelationship: 'Spouse',
    createdAt: '2024-09-01T10:00:00Z',
  },
  {
    id: 'dps-002',
    schemeNumber: 'RB-DPS-2026-3302',
    customerId: 'cust-002',
    customerName: 'Elena Rostova',
    category: 'DPS',
    schemeTitle: 'Executive Wealth Accumulator DPS',
    sourceAccountId: 'acc-002',
    sourceAccountNumber: 'RB-LON-881290',
    principalAmount: 0,
    monthlyInstallment: 2500.00,
    installmentsPaid: 12,
    totalInstallments: 36, // 3 years
    currency: 'USD',
    interestRateAnnual: 6.85,
    termMonths: 36,
    startDate: '2025-09-10',
    maturityDate: '2028-09-10',
    maturityPayoutAmount: 101850.00,
    accruedInterest: 4320.00,
    earlyWithdrawalPenaltyPercent: 1.5,
    status: 'active',
    autoRenew: true,
    createdAt: '2025-09-10T14:00:00Z',
  },
  {
    id: 'dps-003',
    schemeNumber: 'RB-DPS-2026-3303',
    customerId: 'cust-004',
    customerName: 'Sophia Lorenzen',
    category: 'DPS',
    schemeTitle: 'Future Horizon Pension Scheme',
    sourceAccountId: 'acc-001',
    sourceAccountNumber: 'RB-MUN-440192',
    principalAmount: 0,
    monthlyInstallment: 1000.00,
    installmentsPaid: 0,
    totalInstallments: 60,
    currency: 'USD',
    interestRateAnnual: 7.00,
    termMonths: 60,
    startDate: '2026-09-24',
    maturityDate: '2031-09-24',
    maturityPayoutAmount: 72800.00,
    accruedInterest: 0,
    earlyWithdrawalPenaltyPercent: 1.5,
    status: 'pending_approval',
    autoRenew: false,
    createdAt: '2026-09-24T02:00:00Z',
  },
];

class AdminDepositService {
  private getDepositsFromStorage(): AdminDepositScheme[] {
    try {
      const raw = localStorage.getItem('royal_bank_admin_deposits');
      if (!raw) {
        localStorage.setItem('royal_bank_admin_deposits', JSON.stringify(INITIAL_DEPOSITS));
        return INITIAL_DEPOSITS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEPOSITS;
    }
  }

  private saveDepositsToStorage(deposits: AdminDepositScheme[]): void {
    try {
      localStorage.setItem('royal_bank_admin_deposits', JSON.stringify(deposits));
    } catch (err) {
      console.warn('Failed to save deposits:', err);
    }
  }

  /**
   * Get all deposits with filtering
   */
  async getDeposits(params?: {
    category?: AdminDepositCategory | 'all';
    status?: AdminDepositStatus | 'all';
    search?: string;
  }): Promise<AdminDepositScheme[]> {
    let list = this.getDepositsFromStorage();

    if (params?.category && params.category !== 'all') {
      list = list.filter((d) => d.category === params.category);
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((d) => d.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.schemeNumber.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          d.schemeTitle.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getDepositById(id: string): Promise<AdminDepositScheme | null> {
    const list = this.getDepositsFromStorage();
    return list.find((d) => d.id === id || d.schemeNumber === id) || null;
  }

  /**
   * Open new Deposit Scheme (DPS or FDR)
   */
  async openDepositScheme(data: {
    customerId: string;
    customerName: string;
    category: AdminDepositCategory;
    schemeTitle: string;
    sourceAccountId: string;
    sourceAccountNumber: string;
    principalAmount?: number;
    monthlyInstallment?: number;
    termMonths: number;
    interestRateAnnual: number;
    autoRenew: boolean;
    renewalType?: 'principal_only' | 'principal_and_interest';
    nomineeName?: string;
    nomineeRelationship?: string;
  }): Promise<AdminDepositScheme> {
    const list = this.getDepositsFromStorage();
    const prefix = data.category === 'DPS' ? 'RB-DPS' : 'RB-FDR';
    const schemeNumber = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const startDate = new Date().toISOString().slice(0, 10);
    const maturityDateObj = new Date();
    maturityDateObj.setMonth(maturityDateObj.getMonth() + data.termMonths);
    const maturityDate = maturityDateObj.toISOString().slice(0, 10);

    let maturityPayoutAmount = 0;
    if (data.category === 'DPS') {
      const inst = data.monthlyInstallment || 1000;
      const totalContributed = inst * data.termMonths;
      const simpleInterest = totalContributed * (data.interestRateAnnual / 100) * (data.termMonths / 24);
      maturityPayoutAmount = Number((totalContributed + simpleInterest).toFixed(2));
    } else {
      const p = data.principalAmount || 10000;
      const interest = p * (data.interestRateAnnual / 100) * (data.termMonths / 12);
      maturityPayoutAmount = Number((p + interest).toFixed(2));
    }

    const newDeposit: AdminDepositScheme = {
      id: `dep-${Date.now()}`,
      schemeNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      category: data.category,
      schemeTitle: data.schemeTitle,
      sourceAccountId: data.sourceAccountId,
      sourceAccountNumber: data.sourceAccountNumber,
      principalAmount: data.principalAmount || 0,
      monthlyInstallment: data.monthlyInstallment,
      installmentsPaid: data.category === 'DPS' ? 1 : undefined,
      totalInstallments: data.category === 'DPS' ? data.termMonths : undefined,
      currency: 'USD',
      interestRateAnnual: data.interestRateAnnual,
      termMonths: data.termMonths,
      startDate,
      maturityDate,
      maturityPayoutAmount,
      accruedInterest: 0,
      earlyWithdrawalPenaltyPercent: 1.5,
      status: 'active',
      autoRenew: data.autoRenew,
      renewalType: data.renewalType,
      nomineeName: data.nomineeName,
      nomineeRelationship: data.nomineeRelationship,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newDeposit);
    this.saveDepositsToStorage(list);

    this.logAudit(
      'OPEN_DEPOSIT_SCHEME',
      'deposit',
      newDeposit.id,
      newDeposit.schemeNumber,
      `Opened ${data.category} (${data.schemeTitle}) for ${data.customerName}. Maturity: $${maturityPayoutAmount.toLocaleString()}`
    );

    return newDeposit;
  }

  /**
   * Approve pending deposit
   */
  async approveDeposit(depositId: string, notes: string): Promise<AdminDepositScheme> {
    const list = this.getDepositsFromStorage();
    const deposit = list.find((d) => d.id === depositId);
    if (!deposit) throw new Error('Deposit not found');

    deposit.status = 'active';
    this.saveDepositsToStorage(list);

    this.logAudit(
      'APPROVE_DEPOSIT',
      'deposit',
      deposit.id,
      deposit.schemeNumber,
      `Deposit scheme approved and active on ledger. Notes: ${notes}`
    );

    return deposit;
  }

  /**
   * Mature deposit and payout to customer account
   */
  async matureDeposit(depositId: string): Promise<{ deposit: AdminDepositScheme; payoutAmount: number }> {
    const list = this.getDepositsFromStorage();
    const deposit = list.find((d) => d.id === depositId);
    if (!deposit) throw new Error('Deposit not found');

    if (deposit.status !== 'active') {
      throw new Error(`Deposit cannot be matured in state ${deposit.status}`);
    }

    deposit.status = 'matured';
    const payoutAmount = deposit.maturityPayoutAmount;

    // Credit linked account
    const account = db.accounts.find((a) => a.id === deposit.sourceAccountId);
    if (account) {
      account.balance += payoutAmount;
      db.persist('accounts', db.accounts);
    }

    this.saveDepositsToStorage(list);

    this.logAudit(
      'MATURE_DEPOSIT_PAYOUT',
      'deposit',
      deposit.id,
      deposit.schemeNumber,
      `Matured and credited $${payoutAmount.toLocaleString()} to ledger ${deposit.sourceAccountNumber}.`
    );

    return { deposit, payoutAmount };
  }

  /**
   * Renew / Rollover Deposit
   */
  async renewDeposit(
    depositId: string,
    rolloverType: 'principal_only' | 'principal_and_interest'
  ): Promise<AdminDepositScheme> {
    const list = this.getDepositsFromStorage();
    const deposit = list.find((d) => d.id === depositId);
    if (!deposit) throw new Error('Deposit not found');

    const newPrincipal =
      rolloverType === 'principal_and_interest'
        ? deposit.maturityPayoutAmount
        : deposit.principalAmount;

    const startDate = new Date().toISOString().slice(0, 10);
    const maturityDateObj = new Date();
    maturityDateObj.setMonth(maturityDateObj.getMonth() + deposit.termMonths);
    const maturityDate = maturityDateObj.toISOString().slice(0, 10);

    const interest = newPrincipal * (deposit.interestRateAnnual / 100) * (deposit.termMonths / 12);
    const newMaturityAmount = Number((newPrincipal + interest).toFixed(2));

    deposit.principalAmount = newPrincipal;
    deposit.startDate = startDate;
    deposit.maturityDate = maturityDate;
    deposit.maturityPayoutAmount = newMaturityAmount;
    deposit.accruedInterest = 0;
    deposit.status = 'active';

    this.saveDepositsToStorage(list);

    this.logAudit(
      'RENEW_DEPOSIT_ROLLOVER',
      'deposit',
      deposit.id,
      deposit.schemeNumber,
      `Rolled over (${rolloverType}) new principal $${newPrincipal.toLocaleString()} with new maturity $${newMaturityAmount.toLocaleString()}.`
    );

    return deposit;
  }

  /**
   * Early Withdrawal / Liquidation with penalty
   */
  async executeEarlyWithdrawal(
    depositId: string,
    reason: string
  ): Promise<{
    deposit: AdminDepositScheme;
    grossContributed: number;
    penaltyDeducted: number;
    proratedInterest: number;
    netPayout: number;
  }> {
    const list = this.getDepositsFromStorage();
    const deposit = list.find((d) => d.id === depositId);
    if (!deposit) throw new Error('Deposit not found');

    const grossContributed =
      deposit.category === 'DPS'
        ? (deposit.monthlyInstallment || 0) * (deposit.installmentsPaid || 1)
        : deposit.principalAmount;

    const proratedInterest = Math.max(0, deposit.accruedInterest * 0.4); // 40% of accrued interest
    const penaltyDeducted = Number((grossContributed * (deposit.earlyWithdrawalPenaltyPercent / 100)).toFixed(2));
    const netPayout = Number((grossContributed + proratedInterest - penaltyDeducted).toFixed(2));

    deposit.status = 'early_withdrawn';
    this.saveDepositsToStorage(list);

    // Credit linked account
    const account = db.accounts.find((a) => a.id === deposit.sourceAccountId);
    if (account) {
      account.balance += netPayout;
      db.persist('accounts', db.accounts);
    }

    this.logAudit(
      'EARLY_WITHDRAWAL_LIQUIDATION',
      'deposit',
      deposit.id,
      deposit.schemeNumber,
      `Liquidated prematurely. Net refund: $${netPayout.toLocaleString()} (Penalty -$${penaltyDeducted}). Reason: ${reason}`
    );

    return {
      deposit,
      grossContributed,
      penaltyDeducted,
      proratedInterest,
      netPayout,
    };
  }

  private logAudit(
    action: string,
    targetType: AdminAuditLog['targetType'],
    targetId: string,
    targetName: string,
    details: string
  ) {
    const log: AdminAuditLog = {
      id: `aud-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      adminId: 'adm-001',
      adminName: 'Victoria Ashford',
      adminRole: 'super_admin',
      action,
      targetType,
      targetId,
      targetName,
      details,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };
    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);
  }
}

export const adminDepositService = new AdminDepositService();
