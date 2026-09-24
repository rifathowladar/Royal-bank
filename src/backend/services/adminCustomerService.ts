import { db, simulateLatency } from '../mockApi/storage.ts';
import {
  Customer,
  FullCustomerProfile,
  Account,
  Transaction,
  Card,
  Loan,
  KYCProfileState,
  SecuritySettingsState,
  TrustedDevice,
  ActiveSession,
  DetailedSupportTicket,
  AdminAuditLog,
} from '../types/index.ts';
import { profileService } from './profileService.ts';
import { kycService } from './kycService.ts';
import { securityService } from './securityService.ts';
import { supportService } from './supportService.ts';

export interface CustomerQueryFilter {
  search?: string;
  status?: string;
  kycStatus?: string;
  riskScore?: string;
  tier?: string;
  sortBy?: 'name' | 'createdAt' | 'balance' | 'customerNumber';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CustomerListResult {
  customers: (Customer & { primaryAccount?: string; totalAccounts: number })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerFullDetailResult {
  customer: Customer;
  profile: FullCustomerProfile;
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  loans: Loan[];
  kyc: KYCProfileState | null;
  security: SecuritySettingsState;
  devices: TrustedDevice[];
  sessions: ActiveSession[];
  tickets: DetailedSupportTicket[];
  auditLogs: AdminAuditLog[];
}

export const adminCustomerService = {
  async getCustomers(filter: CustomerQueryFilter = {}): Promise<CustomerListResult> {
    await simulateLatency(120);
    const {
      search = '',
      status = 'all',
      kycStatus = 'all',
      riskScore = 'all',
      tier = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filter;

    let list = [...db.customers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.customerNumber.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    if (status !== 'all') {
      list = list.filter((c) => c.status === status);
    }

    if (kycStatus !== 'all') {
      list = list.filter((c) => c.kycStatus === kycStatus);
    }

    if (riskScore !== 'all') {
      list = list.filter((c) => c.riskScore === riskScore);
    }

    if (tier !== 'all') {
      list = list.filter((c) => c.tier === tier);
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === 'balance') {
        comparison = a.totalBalanceUSD - b.totalBalanceUSD;
      } else if (sortBy === 'customerNumber') {
        comparison = a.customerNumber.localeCompare(b.customerNumber);
      } else {
        // createdAt
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    const enriched = paginated.map((c) => {
      const custAccounts = db.accounts.filter((a) => a.customerId === c.id);
      return {
        ...c,
        primaryAccount: custAccounts[0]?.accountNumber || 'Pending Allocation',
        totalAccounts: custAccounts.length,
      };
    });

    return {
      customers: enriched,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    await simulateLatency(80);
    const customer = db.customers.find((c) => c.id === id);
    return customer || null;
  },

  async getCustomerFullDetails(id: string): Promise<CustomerFullDetailResult | null> {
    await simulateLatency(150);
    const customer = db.customers.find((c) => c.id === id);
    if (!customer) return null;

    // Fetch related profile details from profileService or fallback
    let profile: FullCustomerProfile;
    try {
      profile = await profileService.getProfile(id);
    } catch {
      profile = {
        id: customer.id,
        customerNumber: customer.customerNumber,
        title: 'Mr.',
        firstName: customer.firstName,
        lastName: customer.lastName,
        dateOfBirth: customer.dateOfBirth,
        gender: 'Male',
        nationality: customer.address.country,
        maritalStatus: 'Married',
        taxResidency: customer.address.country,
        nationalIdMasked: customer.nationalIdMasked,
        phone: customer.phone,
        email: customer.email,
        residentialAddress: customer.address,
        sameAsResidential: true,
        employment: {
          employmentStatus: 'Investor',
          occupation: 'Principal',
          designation: 'Managing Director',
          companyName: `${customer.lastName} Holdings Ltd`,
          companyAddress: customer.address.line1,
          industry: 'Financial Assets & Family Office',
          monthlyIncome: 45000,
          annualIncome: 540000,
          sourceOfFunds: 'Capital Returns & Investments',
          tinOrTaxId: 'US-981048-A',
          experienceYears: 18,
        },
        nominee: {
          fullName: 'Designated Family Trust & Successors',
          relationship: 'Spouse',
          dateOfBirth: '1985-05-12',
          phone: customer.phone,
          identityType: 'Passport',
          identityNumberMasked: '•••• 1982',
          sharePercentage: 100,
          streetAddress: customer.address.line1,
          city: customer.address.city,
          state: customer.address.state,
          postalCode: customer.address.postalCode,
          country: customer.address.country,
        },
        tier: customer.tier,
        memberSince: customer.createdAt,
      };
    }

    const accounts = db.accounts.filter((a) => a.customerId === id);
    const transactions = db.transactions
      .filter((t) => t.customerId === id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const cards = db.cards.filter((c) => c.customerId === id);
    const loans = db.loans.filter((l) => l.customerId === id);

    let kyc: KYCProfileState | null = null;
    try {
      kyc = await kycService.getKycStatus(id);
    } catch {
      kyc = null;
    }

    let security: SecuritySettingsState;
    try {
      security = await securityService.getSecuritySettings(id);
    } catch {
      security = {
        twoFactorEnabled: customer.twoFactorEnabled,
        twoFactorMethod: 'authenticator',
        twoFactorPhoneMasked: customer.phone,
        twoFactorEmailMasked: customer.email,
        biometricEnabled: true,
        loginAlertsEnabled: true,
        transactionPinSet: true,
        lastPasswordChangeDate: '2026-08-15',
        lastPinChangeDate: '2026-08-15',
        sessionTimeoutMinutes: 15,
        allowInternationalLogins: true,
      };
    }

    const [devices, sessions] = await Promise.all([
      securityService.getTrustedDevices().catch(() => []),
      securityService.getActiveSessions().catch(() => []),
    ]);

    const tickets = await supportService.getTickets(id).catch(() => []);
    const auditLogs = db.auditLogs.filter(
      (log) => log.targetType === 'customer' && log.targetId === id
    );

    return {
      customer,
      profile,
      accounts,
      transactions,
      cards,
      loans,
      kyc,
      security,
      devices,
      sessions,
      tickets,
      auditLogs,
    };
  },

  async updateCustomer(
    id: string,
    updates: Partial<Customer>,
    adminName = 'Victoria Ashford'
  ): Promise<Customer> {
    await simulateLatency(120);
    const index = db.customers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer not found');

    const prev = db.customers[index];
    const updated: Customer = {
      ...prev,
      ...updates,
    };

    db.customers[index] = updated;
    db.persist('customers', db.customers);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'UPDATE_CUSTOMER_DOSSIER',
      targetType: 'customer',
      targetId: id,
      targetName: `${updated.firstName} ${updated.lastName}`,
      details: `Updated customer parameters: ${Object.keys(updates).join(', ')}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return updated;
  },

  async freezeCustomer(
    id: string,
    reason: string,
    adminName = 'Victoria Ashford'
  ): Promise<Customer> {
    await simulateLatency(150);
    const index = db.customers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer not found');

    const customer = db.customers[index];
    customer.status = 'suspended';
    db.customers[index] = customer;
    db.persist('customers', db.customers);

    // Freeze related accounts
    db.accounts = db.accounts.map((acc) =>
      acc.customerId === id ? { ...acc, status: 'frozen' as const } : acc
    );
    db.persist('accounts', db.accounts);

    // Freeze related cards
    db.cards = db.cards.map((crd) =>
      crd.customerId === id ? { ...crd, status: 'frozen' as const } : crd
    );
    db.persist('cards', db.cards);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'FREEZE_CUSTOMER_ASSETS',
      targetType: 'customer',
      targetId: id,
      targetName: `${customer.firstName} ${customer.lastName}`,
      details: `Customer account & linked ledgers frozen. Reason: ${reason}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'WARNING',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return customer;
  },

  async unfreezeCustomer(
    id: string,
    reason: string,
    adminName = 'Victoria Ashford'
  ): Promise<Customer> {
    await simulateLatency(150);
    const index = db.customers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer not found');

    const customer = db.customers[index];
    customer.status = 'active';
    db.customers[index] = customer;
    db.persist('customers', db.customers);

    // Reactivate related accounts
    db.accounts = db.accounts.map((acc) =>
      acc.customerId === id && acc.status === 'frozen' ? { ...acc, status: 'active' as const } : acc
    );
    db.persist('accounts', db.accounts);

    // Reactivate related cards
    db.cards = db.cards.map((crd) =>
      crd.customerId === id && crd.status === 'frozen' ? { ...crd, status: 'active' as const } : crd
    );
    db.persist('cards', db.cards);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'UNFREEZE_CUSTOMER_ASSETS',
      targetType: 'customer',
      targetId: id,
      targetName: `${customer.firstName} ${customer.lastName}`,
      details: `Customer operational status restored to Active. Reason: ${reason}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return customer;
  },

  async resetPassword(
    id: string,
    adminName = 'Victoria Ashford'
  ): Promise<{ temporaryPassword: string; notified: boolean }> {
    await simulateLatency(140);
    const customer = db.customers.find((c) => c.id === id);
    if (!customer) throw new Error('Customer not found');

    const temporaryPassword = `RB-${Math.random().toString(36).substring(2, 7).toUpperCase()}#2026`;

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-001',
      adminName,
      adminRole: 'super_admin',
      action: 'ADMIN_RESET_PASSWORD',
      targetType: 'customer',
      targetId: id,
      targetName: `${customer.firstName} ${customer.lastName}`,
      details: `Temporary credentials generated and dispatched via encrypted channel to ${customer.email}`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return {
      temporaryPassword,
      notified: true,
    };
  },

  async updateRiskScore(
    id: string,
    riskScore: 'Low' | 'Medium' | 'High',
    notes: string,
    adminName = 'Julian Cross'
  ): Promise<Customer> {
    await simulateLatency(120);
    const index = db.customers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer not found');

    db.customers[index].riskScore = riskScore;
    db.persist('customers', db.customers);

    const log: AdminAuditLog = {
      id: `aud-${Date.now()}`,
      adminId: 'adm-002',
      adminName,
      adminRole: 'compliance_officer',
      action: 'UPDATE_RISK_SCORE',
      targetType: 'customer',
      targetId: id,
      targetName: `${db.customers[index].firstName} ${db.customers[index].lastName}`,
      details: `Compliance risk rating updated to ${riskScore}. Notes: ${notes}`,
      ipAddress: '10.240.12.44',
      timestamp: new Date().toISOString(),
      status: riskScore === 'High' ? 'WARNING' : 'SUCCESS',
    };

    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);

    return db.customers[index];
  },
};
