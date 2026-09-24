/**
 * Simulated In-Memory & LocalStorage Database for Royal Bank Demo API.
 * Keeps changes persistent across navigation and reloads.
 */

import {
  Customer,
  Admin,
  Account,
  Transaction,
  Card,
  Loan,
  Deposit,
  Beneficiary,
  QRPayment,
  Notification,
  Bill,
  KYCApplication,
  SupportTicket,
  Merchant,
  CardOffer,
  CardStatement,
  EMIPlan,
  CardReplacementRequest,
  Biller,
  SavedBiller,
  BillPaymentRecord,
  MobileOperator,
  RechargePlan,
  RechargeRecord,
  RoleDefinition,
  PermissionMatrix,
  FraudAlert,
  FraudCase,
  AmlAlert,
  AmlCase,
  AmlReport,
  Branch,
  Employee,
} from '../types/index.ts';

import {
  mockCustomers,
  mockAdmins,
  mockAccounts,
  mockTransactions,
  mockCards,
  mockLoans,
  mockDeposits,
  mockBeneficiaries,
  mockMerchants,
  mockQrPayments,
  mockNotifications,
  mockBills,
  mockKycApplications,
  mockSupportTickets,
  mockCardOffers,
  mockCardStatements,
  mockEMIPlans,
  mockBillers,
  mockSavedBillers,
  mockBillPaymentRecords,
  mockMobileOperators,
  mockRechargePlans,
  mockRechargeRecords,
} from '../data/index.ts';

import { mockRoles, initialPermissionMatrix } from '../data/mockRbac.ts';
import { mockFraudAlerts, mockFraudCases } from '../data/mockFraud.ts';
import { mockAmlAlerts, mockAmlCases, mockAmlReports } from '../data/mockAml.ts';
import { mockBranches } from '../data/mockBranches.ts';
import { mockEmployees } from '../data/mockEmployees.ts';
import { mockAuditLogs } from '../data/mockAuditLogs.ts';
import { mockApprovals } from '../data/mockApprovals.ts';
import { mockSystemSettings } from '../data/mockSettings.ts';
import { AdminAuditLog, AccountLimits, ApprovalItem, SystemSettings } from '../types/index.ts';

const initialAuditLogs: AdminAuditLog[] = [
  {
    id: 'aud-001',
    adminId: 'adm-001',
    adminName: 'Victoria Ashford',
    adminRole: 'super_admin',
    action: 'SYSTEM_STARTUP',
    targetType: 'system',
    targetId: 'sys-core',
    targetName: 'Core Banking Cluster',
    details: 'Daily automated reconciliation and SWIFT GPI bridge validated',
    ipAddress: '10.240.12.18',
    timestamp: '2026-09-24T01:00:00Z',
    status: 'SUCCESS',
  },
  {
    id: 'aud-002',
    adminId: 'adm-002',
    adminName: 'Julian Cross',
    adminRole: 'compliance_officer',
    action: 'AML_SANCTION_SCREEN',
    targetType: 'transaction',
    targetId: 'tx-102',
    targetName: 'REF-2026-9812-402',
    details: 'Passed automated OFAC / EU sanction screening with 0 match hits',
    ipAddress: '10.240.12.44',
    timestamp: '2026-09-23T14:32:00Z',
    status: 'SUCCESS',
  },
  {
    id: 'aud-003',
    adminId: 'adm-001',
    adminName: 'Victoria Ashford',
    adminRole: 'super_admin',
    action: 'KYC_TIER_UPGRADE',
    targetType: 'customer',
    targetId: 'cust-001',
    targetName: 'Alexander Sterling',
    details: 'Upgraded customer to Sovereign Tier 3 after biometric passport verification',
    ipAddress: '10.240.12.18',
    timestamp: '2026-09-23T10:15:00Z',
    status: 'SUCCESS',
  },
  {
    id: 'aud-004',
    adminId: 'adm-002',
    adminName: 'Julian Cross',
    adminRole: 'compliance_officer',
    action: 'FLAG_SUSPICIOUS_TRANSFER',
    targetType: 'transaction',
    targetId: 'tx-108',
    targetName: 'REF-2026-9812-408',
    details: 'High-value off-hours cross-border transfer flagged for secondary dual-key approval',
    ipAddress: '10.240.12.44',
    timestamp: '2026-09-22T23:45:00Z',
    status: 'WARNING',
  },
];

const initialAccountLimits: Record<string, AccountLimits> = {
  'acc-001': {
    accountId: 'acc-001',
    dailyTransferLimit: 250000,
    dailyAtmLimit: 5000,
    singleTransactionLimit: 100000,
    internationalTransferLimit: 500000,
    isOverdraftAllowed: true,
    overdraftLimit: 50000,
    updatedAt: '2026-09-01T00:00:00Z',
    updatedBy: 'Victoria Ashford',
  },
  'acc-002': {
    accountId: 'acc-002',
    dailyTransferLimit: 100000,
    dailyAtmLimit: 2500,
    singleTransactionLimit: 50000,
    internationalTransferLimit: 200000,
    isOverdraftAllowed: false,
    overdraftLimit: 0,
    updatedAt: '2026-09-01T00:00:00Z',
    updatedBy: 'Julian Cross',
  },
  'acc-003': {
    accountId: 'acc-003',
    dailyTransferLimit: 75000,
    dailyAtmLimit: 2000,
    singleTransactionLimit: 30000,
    internationalTransferLimit: 150000,
    isOverdraftAllowed: false,
    overdraftLimit: 0,
    updatedAt: '2026-09-01T00:00:00Z',
    updatedBy: 'Victoria Ashford',
  },
};

const STORAGE_KEY_PREFIX = 'royal_bank_db_';

function getOrInit<T>(key: string, initialData: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch {
    return initialData;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

class MockDatabase {
  customers: Customer[] = getOrInit('customers', mockCustomers);
  admins: Admin[] = getOrInit('admins', mockAdmins);
  accounts: Account[] = getOrInit('accounts', mockAccounts);
  transactions: Transaction[] = getOrInit('transactions', mockTransactions);
  cards: Card[] = getOrInit('cards', mockCards);
  loans: Loan[] = getOrInit('loans', mockLoans);
  deposits: Deposit[] = getOrInit('deposits', mockDeposits);
  beneficiaries: Beneficiary[] = getOrInit('beneficiaries', mockBeneficiaries);
  merchants: Merchant[] = getOrInit('merchants', mockMerchants);
  qrPayments: QRPayment[] = getOrInit('qrPayments', mockQrPayments);
  notifications: Notification[] = getOrInit('notifications', mockNotifications);
  bills: Bill[] = getOrInit('bills', mockBills);
  kycApplications: KYCApplication[] = getOrInit('kycApplications', mockKycApplications);
  supportTickets: SupportTicket[] = getOrInit('supportTickets', mockSupportTickets);

  // New collections for Card, Bill, and Recharge systems
  cardOffers: CardOffer[] = getOrInit('cardOffers', mockCardOffers);
  cardStatements: CardStatement[] = getOrInit('cardStatements', mockCardStatements);
  emiPlans: EMIPlan[] = getOrInit('emiPlans', mockEMIPlans);
  cardReplacements: CardReplacementRequest[] = getOrInit('cardReplacements', []);
  billers: Biller[] = getOrInit('billers', mockBillers);
  savedBillers: SavedBiller[] = getOrInit('savedBillers', mockSavedBillers);
  billPaymentRecords: BillPaymentRecord[] = getOrInit('billPaymentRecords', mockBillPaymentRecords);
  mobileOperators: MobileOperator[] = getOrInit('mobileOperators', mockMobileOperators);
  rechargePlans: RechargePlan[] = getOrInit('rechargePlans', mockRechargePlans);
  rechargeRecords: RechargeRecord[] = getOrInit('rechargeRecords', mockRechargeRecords);
  auditLogs: AdminAuditLog[] = getOrInit('auditLogs', mockAuditLogs);
  approvals: ApprovalItem[] = getOrInit('approvals', mockApprovals);
  settings: SystemSettings = getOrInit('systemSettings', mockSystemSettings);
  accountLimits: Record<string, AccountLimits> = getOrInit('accountLimits', initialAccountLimits);

  // New modules: RBAC, Fraud, AML, Branches, Employees
  roles: RoleDefinition[] = getOrInit('roles', mockRoles);
  permissionMatrix: PermissionMatrix = getOrInit('permissionMatrix', initialPermissionMatrix);
  activeAdminRole: string = getOrInit('activeAdminRole', 'super_admin');
  fraudAlerts: FraudAlert[] = getOrInit('fraudAlerts', mockFraudAlerts);
  fraudCases: FraudCase[] = getOrInit('fraudCases', mockFraudCases);
  amlAlerts: AmlAlert[] = getOrInit('amlAlerts', mockAmlAlerts);
  amlCases: AmlCase[] = getOrInit('amlCases', mockAmlCases);
  amlReports: AmlReport[] = getOrInit('amlReports', mockAmlReports);
  branches: Branch[] = getOrInit('branches', mockBranches);
  employees: Employee[] = getOrInit('employees', mockEmployees);

  persist(key: string, data: unknown) {
    save(key, data);
  }

  resetAll() {
    this.customers = [...mockCustomers];
    this.admins = [...mockAdmins];
    this.accounts = [...mockAccounts];
    this.transactions = [...mockTransactions];
    this.cards = [...mockCards];
    this.loans = [...mockLoans];
    this.deposits = [...mockDeposits];
    this.beneficiaries = [...mockBeneficiaries];
    this.merchants = [...mockMerchants];
    this.qrPayments = [...mockQrPayments];
    this.notifications = [...mockNotifications];
    this.bills = [...mockBills];
    this.kycApplications = [...mockKycApplications];
    this.supportTickets = [...mockSupportTickets];
    this.cardOffers = [...mockCardOffers];
    this.cardStatements = [...mockCardStatements];
    this.emiPlans = [...mockEMIPlans];
    this.cardReplacements = [];
    this.billers = [...mockBillers];
    this.savedBillers = [...mockSavedBillers];
    this.billPaymentRecords = [...mockBillPaymentRecords];
    this.mobileOperators = [...mockMobileOperators];
    this.rechargePlans = [...mockRechargePlans];
    this.rechargeRecords = [...mockRechargeRecords];
    this.auditLogs = [...mockAuditLogs];
    this.approvals = [...mockApprovals];
    this.settings = JSON.parse(JSON.stringify(mockSystemSettings));
    this.accountLimits = { ...initialAccountLimits };

    this.roles = [...mockRoles];
    this.permissionMatrix = { ...initialPermissionMatrix };
    this.activeAdminRole = 'super_admin';
    this.fraudAlerts = [...mockFraudAlerts];
    this.fraudCases = [...mockFraudCases];
    this.amlAlerts = [...mockAmlAlerts];
    this.amlCases = [...mockAmlCases];
    this.amlReports = [...mockAmlReports];
    this.branches = [...mockBranches];
    this.employees = [...mockEmployees];

    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  }
}

export const db = new MockDatabase();

export const getDatabase = (): MockDatabase => db;
export const saveDatabase = (key: string, data: unknown): void => db.persist(key, data);

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn('Failed to set storage item:', err);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  } catch (err) {
    console.warn('Failed to remove storage item:', err);
  }
}

/** Helper for realistic network latency in mock API */
export const simulateNetworkDelay = async (ms = 120): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const simulateLatency = simulateNetworkDelay;

