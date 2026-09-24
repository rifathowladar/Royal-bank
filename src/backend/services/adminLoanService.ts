import { db } from '../mockApi/storage.ts';
import { Loan, LoanType, AdminAuditLog } from '../types/index.ts';

export type LoanWorkflowStage =
  | 'pending'
  | 'kyc_review'
  | 'credit_assessment'
  | 'risk_review'
  | 'approved'
  | 'disbursed'
  | 'active'
  | 'completed'
  | 'rejected'
  | 'defaulted';

export interface LoanDocumentItem {
  id: string;
  name: string;
  category: 'Income Proof' | 'Tax Return' | 'Collateral Deed' | 'Business Financials' | 'Identity Document';
  status: 'submitted' | 'verified' | 'requested' | 'rejected';
  submittedAt?: string;
  fileUrl?: string;
  notes?: string;
}

export interface AdminLoanApplication {
  id: string;
  loanNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  creditScore: number; // e.g. 785
  debtToIncomeRatio: number; // e.g. 24.5%
  type: LoanType;
  purpose: string;
  requestedAmount: number;
  approvedAmount: number;
  currentBalance: number;
  currency: string;
  annualInterestRate: number; // e.g. 6.25%
  termMonths: number;
  monthlyInstallment: number;
  totalRepayment: number;
  stage: LoanWorkflowStage;
  statusNotes: string;
  disbursementAccountId: string;
  disbursementAccountNumber: string;
  collateralDescription?: string;
  collateralValueUSD?: number;
  documents: LoanDocumentItem[];
  stageHistory: {
    stage: LoanWorkflowStage;
    changedAt: string;
    changedBy: string;
    notes?: string;
  }[];
  appliedAt: string;
  approvedAt?: string;
  disbursedAt?: string;
  maturityDate?: string;
}

const INITIAL_LOAN_APPLICATIONS: AdminLoanApplication[] = [
  {
    id: 'loan-app-001',
    loanNumber: 'RB-MORT-2026-901',
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    customerEmail: 'alexander.sterling@royalbank.com',
    customerPhone: '+1 (212) 555-0199',
    creditScore: 820,
    debtToIncomeRatio: 18.2,
    type: 'mortgage',
    purpose: 'Acquisition of residential penthouse property on Fifth Avenue, Manhattan',
    requestedAmount: 2500000,
    approvedAmount: 2500000,
    currentBalance: 2500000,
    currency: 'USD',
    annualInterestRate: 4.85,
    termMonths: 240, // 20 years
    monthlyInstallment: 16298.50,
    totalRepayment: 3911640.00,
    stage: 'active',
    statusNotes: 'Performing facility in good standing. Automated auto-debit active.',
    disbursementAccountId: 'acc-001',
    disbursementAccountNumber: 'RB-NY-092144',
    collateralDescription: 'Deed of Trust on 781 5th Ave Penthouse, Manhattan NY',
    collateralValueUSD: 4800000,
    documents: [
      { id: 'doc-1', name: 'Federal Tax Returns (3 Years)', category: 'Tax Return', status: 'verified', submittedAt: '2026-08-10' },
      { id: 'doc-2', name: 'Independent Property Appraisal Report', category: 'Collateral Deed', status: 'verified', submittedAt: '2026-08-14' },
      { id: 'doc-3', name: 'Certified Liquid Asset Statements', category: 'Income Proof', status: 'verified', submittedAt: '2026-08-12' },
    ],
    stageHistory: [
      { stage: 'pending', changedAt: '2026-08-01T10:00:00Z', changedBy: 'System Intake', notes: 'Application logged' },
      { stage: 'kyc_review', changedAt: '2026-08-03T11:00:00Z', changedBy: 'Julian Cross', notes: 'Customer tier Sovereign KYC verified' },
      { stage: 'credit_assessment', changedAt: '2026-08-08T15:30:00Z', changedBy: 'Credit Committee', notes: 'FICO 820 confirmed' },
      { stage: 'risk_review', changedAt: '2026-08-12T16:00:00Z', changedBy: 'Risk Board', notes: 'LTV is 52%, well below 70% threshold' },
      { stage: 'approved', changedAt: '2026-08-15T14:00:00Z', changedBy: 'Victoria Ashford', notes: 'Executive board signoff' },
      { stage: 'disbursed', changedAt: '2026-08-18T09:00:00Z', changedBy: 'Disbursement Escrow', notes: 'Wire settled to seller escrow' },
      { stage: 'active', changedAt: '2026-08-18T09:30:00Z', changedBy: 'System', notes: 'Amortization schedule active' },
    ],
    appliedAt: '2026-08-01T10:00:00Z',
    approvedAt: '2026-08-15T14:00:00Z',
    disbursedAt: '2026-08-18T09:00:00Z',
    maturityDate: '2046-08-18',
  },
  {
    id: 'loan-app-002',
    loanNumber: 'RB-BUS-2026-442',
    customerId: 'cust-002',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@royalbank.com',
    customerPhone: '+44 20 7946 0912',
    creditScore: 760,
    debtToIncomeRatio: 28.4,
    type: 'business_growth',
    purpose: 'Expansion of logistics fleet and autonomous drone dispatch hub in Zurich',
    requestedAmount: 850000,
    approvedAmount: 750000,
    currentBalance: 750000,
    currency: 'USD',
    annualInterestRate: 6.25,
    termMonths: 60, // 5 years
    monthlyInstallment: 14585.20,
    totalRepayment: 875112.00,
    stage: 'credit_assessment',
    statusNotes: 'Underwriter assessing 3-year EBITDA forecasts and audited balance sheets.',
    disbursementAccountId: 'acc-002',
    disbursementAccountNumber: 'RB-LON-881290',
    collateralDescription: 'Corporate pledge on 12 freight vehicles and warehouse leasehold',
    collateralValueUSD: 1200000,
    documents: [
      { id: 'doc-4', name: 'Audited Financial Statements 2024-2025', category: 'Business Financials', status: 'verified', submittedAt: '2026-09-10' },
      { id: 'doc-5', name: 'Certificate of Corporate Incorporation', category: 'Identity Document', status: 'verified', submittedAt: '2026-09-10' },
      { id: 'doc-6', name: 'Commercial Collateral Valuation', category: 'Collateral Deed', status: 'submitted', submittedAt: '2026-09-20' },
    ],
    stageHistory: [
      { stage: 'pending', changedAt: '2026-09-08T09:00:00Z', changedBy: 'System Intake', notes: 'Commercial expansion application' },
      { stage: 'kyc_review', changedAt: '2026-09-12T14:20:00Z', changedBy: 'Julian Cross', notes: 'Corporate directors KYC validated' },
      { stage: 'credit_assessment', changedAt: '2026-09-16T11:00:00Z', changedBy: 'Commercial Underwriter', notes: 'Reviewed debt service coverage ratio 1.85x' },
    ],
    appliedAt: '2026-09-08T09:00:00Z',
  },
  {
    id: 'loan-app-003',
    loanNumber: 'RB-AUTO-2026-109',
    customerId: 'cust-003',
    customerName: 'Julian Croft',
    customerEmail: 'julian.croft@royalbank.com',
    customerPhone: '+41 22 555 0142',
    creditScore: 710,
    debtToIncomeRatio: 33.1,
    type: 'auto',
    purpose: 'Bespoke Aston Martin Valkyrie hypercar acquisition financing',
    requestedAmount: 320000,
    approvedAmount: 300000,
    currentBalance: 300000,
    currency: 'USD',
    annualInterestRate: 5.75,
    termMonths: 48,
    monthlyInstallment: 7012.40,
    totalRepayment: 336595.20,
    stage: 'approved',
    statusNotes: 'Final approval issued. Awaiting disbursement clearance instruction.',
    disbursementAccountId: 'acc-003',
    disbursementAccountNumber: 'RB-ZUR-330198',
    collateralDescription: 'Lien registered on VIN #AMV-2026-098124',
    collateralValueUSD: 450000,
    documents: [
      { id: 'doc-7', name: 'Aston Martin Geneva Proforma Invoice', category: 'Income Proof', status: 'verified', submittedAt: '2026-09-18' },
      { id: 'doc-8', name: 'Comprehensive Insurance Policy Binder', category: 'Collateral Deed', status: 'verified', submittedAt: '2026-09-22' },
    ],
    stageHistory: [
      { stage: 'pending', changedAt: '2026-09-15T08:00:00Z', changedBy: 'System Intake' },
      { stage: 'kyc_review', changedAt: '2026-09-16T10:00:00Z', changedBy: 'Julian Cross' },
      { stage: 'credit_assessment', changedAt: '2026-09-18T14:00:00Z', changedBy: 'Asset Finance Team' },
      { stage: 'risk_review', changedAt: '2026-09-20T16:00:00Z', changedBy: 'Risk Committee' },
      { stage: 'approved', changedAt: '2026-09-22T12:00:00Z', changedBy: 'Victoria Ashford', notes: 'Approved at 5.75% for 48 months' },
    ],
    appliedAt: '2026-09-15T08:00:00Z',
    approvedAt: '2026-09-22T12:00:00Z',
  },
  {
    id: 'loan-app-004',
    loanNumber: 'RB-PERS-2026-788',
    customerId: 'cust-004',
    customerName: 'Sophia Lorenzen',
    customerEmail: 'sophia.l@royalbank.com',
    customerPhone: '+49 89 2049 1102',
    creditScore: 690,
    debtToIncomeRatio: 38.5,
    type: 'personal',
    purpose: 'Bridge financing for art collection acquisition at Art Basel',
    requestedAmount: 150000,
    approvedAmount: 150000,
    currentBalance: 150000,
    currency: 'USD',
    annualInterestRate: 7.50,
    termMonths: 36,
    monthlyInstallment: 4665.80,
    totalRepayment: 167968.80,
    stage: 'pending',
    statusNotes: 'Initial application submitted. Assigned to loan officer for KYC intake.',
    disbursementAccountId: 'acc-001',
    disbursementAccountNumber: 'RB-MUN-440192',
    documents: [
      { id: 'doc-9', name: 'Bank Statements Last 6 Months', category: 'Income Proof', status: 'submitted', submittedAt: '2026-09-23' },
    ],
    stageHistory: [
      { stage: 'pending', changedAt: '2026-09-23T18:00:00Z', changedBy: 'Customer Portal', notes: 'Online loan submission' },
    ],
    appliedAt: '2026-09-23T18:00:00Z',
  },
];

class AdminLoanService {
  private getLoansFromStorage(): AdminLoanApplication[] {
    try {
      const raw = localStorage.getItem('royal_bank_admin_loans');
      if (!raw) {
        localStorage.setItem('royal_bank_admin_loans', JSON.stringify(INITIAL_LOAN_APPLICATIONS));
        return INITIAL_LOAN_APPLICATIONS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_LOAN_APPLICATIONS;
    }
  }

  private saveLoansToStorage(loans: AdminLoanApplication[]): void {
    try {
      localStorage.setItem('royal_bank_admin_loans', JSON.stringify(loans));
    } catch (err) {
      console.warn('Failed to save loans:', err);
    }
  }

  /**
   * Calculate monthly installment
   */
  calculateEMI(principal: number, annualRatePercent: number, termMonths: number): number {
    if (termMonths <= 0 || principal <= 0) return 0;
    const monthlyRate = annualRatePercent / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    return Number(emi.toFixed(2));
  }

  /**
   * Get all loans / applications
   */
  async getLoans(params?: {
    search?: string;
    stage?: string;
    type?: string;
    customerId?: string;
  }): Promise<AdminLoanApplication[]> {
    let list = this.getLoansFromStorage();

    if (params?.customerId) {
      list = list.filter((l) => l.customerId === params.customerId);
    }

    if (params?.stage && params.stage !== 'all') {
      list = list.filter((l) => l.stage === params.stage);
    }

    if (params?.type && params.type !== 'all') {
      list = list.filter((l) => l.type === params.type);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.loanNumber.toLowerCase().includes(q) ||
          l.customerName.toLowerCase().includes(q) ||
          l.purpose.toLowerCase().includes(q) ||
          l.customerEmail.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }

  async getLoanById(id: string): Promise<AdminLoanApplication | null> {
    const list = this.getLoansFromStorage();
    return list.find((l) => l.id === id || l.loanNumber === id) || null;
  }

  /**
   * Advance workflow stage
   */
  async advanceWorkflowStage(
    loanId: string,
    targetStage: LoanWorkflowStage,
    notes: string
  ): Promise<AdminLoanApplication> {
    const list = this.getLoansFromStorage();
    const loan = list.find((l) => l.id === loanId);
    if (!loan) throw new Error('Loan application not found');

    const previousStage = loan.stage;
    loan.stage = targetStage;
    loan.statusNotes = notes;

    if (targetStage === 'approved' && !loan.approvedAt) {
      loan.approvedAt = new Date().toISOString();
    }

    loan.stageHistory.push({
      stage: targetStage,
      changedAt: new Date().toISOString(),
      changedBy: 'Victoria Ashford',
      notes,
    });

    this.saveLoansToStorage(list);

    this.logAudit(
      'LOAN_WORKFLOW_ADVANCE',
      'loan',
      loan.id,
      loan.loanNumber,
      `Advanced stage from ${previousStage.toUpperCase()} to ${targetStage.toUpperCase()}. Note: ${notes}`
    );

    return loan;
  }

  /**
   * Reject loan application
   */
  async rejectLoan(loanId: string, reason: string): Promise<AdminLoanApplication> {
    const list = this.getLoansFromStorage();
    const loan = list.find((l) => l.id === loanId);
    if (!loan) throw new Error('Loan application not found');

    loan.stage = 'rejected';
    loan.statusNotes = `Rejected: ${reason}`;
    loan.stageHistory.push({
      stage: 'rejected',
      changedAt: new Date().toISOString(),
      changedBy: 'Victoria Ashford',
      notes: reason,
    });

    this.saveLoansToStorage(list);

    this.logAudit(
      'REJECT_LOAN_APPLICATION',
      'loan',
      loan.id,
      loan.loanNumber,
      `Application rejected. Rationale: ${reason}`
    );

    return loan;
  }

  /**
   * Request additional documentation
   */
  async requestDocuments(
    loanId: string,
    documentNames: string[],
    instructions: string
  ): Promise<AdminLoanApplication> {
    const list = this.getLoansFromStorage();
    const loan = list.find((l) => l.id === loanId);
    if (!loan) throw new Error('Loan application not found');

    documentNames.forEach((docName) => {
      loan.documents.push({
        id: `doc-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
        name: docName,
        category: 'Income Proof',
        status: 'requested',
        notes: instructions,
      });
    });

    loan.statusNotes = `Additional documents requested: ${documentNames.join(', ')}`;
    this.saveLoansToStorage(list);

    this.logAudit(
      'REQUEST_LOAN_DOCUMENTS',
      'loan',
      loan.id,
      loan.loanNumber,
      `Requested supplementary documentation: ${documentNames.join(', ')}`
    );

    return loan;
  }

  /**
   * Change interest rate
   */
  async changeInterestRate(
    loanId: string,
    newAnnualRate: number,
    reason: string
  ): Promise<AdminLoanApplication> {
    const list = this.getLoansFromStorage();
    const loan = list.find((l) => l.id === loanId);
    if (!loan) throw new Error('Loan application not found');

    const oldRate = loan.annualInterestRate;
    loan.annualInterestRate = newAnnualRate;
    loan.monthlyInstallment = this.calculateEMI(loan.approvedAmount, newAnnualRate, loan.termMonths);
    loan.totalRepayment = Number((loan.monthlyInstallment * loan.termMonths).toFixed(2));

    this.saveLoansToStorage(list);

    this.logAudit(
      'UPDATE_LOAN_INTEREST_RATE',
      'loan',
      loan.id,
      loan.loanNumber,
      `Interest rate changed from ${oldRate}% to ${newAnnualRate}%. New EMI: $${loan.monthlyInstallment.toLocaleString()}. Reason: ${reason}`
    );

    return loan;
  }

  /**
   * Change loan amount / limit
   */
  async changeLoanAmount(
    loanId: string,
    newApprovedAmount: number,
    reason: string
  ): Promise<AdminLoanApplication> {
    const list = this.getLoansFromStorage();
    const loan = list.find((l) => l.id === loanId);
    if (!loan) throw new Error('Loan application not found');

    const oldAmount = loan.approvedAmount;
    loan.approvedAmount = newApprovedAmount;
    loan.currentBalance = newApprovedAmount;
    loan.monthlyInstallment = this.calculateEMI(newApprovedAmount, loan.annualInterestRate, loan.termMonths);
    loan.totalRepayment = Number((loan.monthlyInstallment * loan.termMonths).toFixed(2));

    this.saveLoansToStorage(list);

    this.logAudit(
      'UPDATE_LOAN_LIMIT',
      'loan',
      loan.id,
      loan.loanNumber,
      `Principal amount adjusted from $${oldAmount.toLocaleString()} to $${newApprovedAmount.toLocaleString()}. Reason: ${reason}`
    );

    return loan;
  }

  /**
   * Approve disbursement & fund designated account
   */
  async approveDisbursement(loanId: string, notes: string): Promise<AdminLoanApplication> {
    const list = this.getLoansFromStorage();
    const loan = list.find((l) => l.id === loanId);
    if (!loan) throw new Error('Loan application not found');

    loan.stage = 'active';
    loan.disbursedAt = new Date().toISOString();
    loan.maturityDate = new Date(Date.now() + loan.termMonths * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    loan.statusNotes = `Disbursed $${loan.approvedAmount.toLocaleString()} to account ${loan.disbursementAccountNumber}. Facility active.`;

    loan.stageHistory.push({
      stage: 'disbursed',
      changedAt: new Date().toISOString(),
      changedBy: 'Victoria Ashford',
      notes: `Disbursement released. ${notes}`,
    });
    loan.stageHistory.push({
      stage: 'active',
      changedAt: new Date().toISOString(),
      changedBy: 'System Core Ledger',
      notes: 'Active ledger amortization active',
    });

    // Credit destination account if exists in db
    const account = db.accounts.find((a) => a.id === loan.disbursementAccountId);
    if (account) {
      account.balance += loan.approvedAmount;
      db.persist('accounts', db.accounts);
    }

    this.saveLoansToStorage(list);

    this.logAudit(
      'APPROVE_LOAN_DISBURSEMENT',
      'loan',
      loan.id,
      loan.loanNumber,
      `Disbursed $${loan.approvedAmount.toLocaleString()} into ${loan.disbursementAccountNumber}. Notes: ${notes}`
    );

    return loan;
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

export const adminLoanService = new AdminLoanService();
