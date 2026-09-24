/**
 * Royal Bank Admin Reporting Service
 * Provides parameterized filtering, aggregation, summary metric generation,
 * time-series charting datasets, and export generation for all bank management reports.
 */

import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import {
  ReportFilterState,
  ReportSummaryMetric,
  Transaction,
  Customer,
  Deposit,
  Loan,
  Card,
  QRPayment,
  FraudAlert,
} from '../types/index.ts';

export interface PaginatedReportResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summaryMetrics: ReportSummaryMetric[];
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
    }>;
  };
}

export interface RevenueReportItem {
  id: string;
  category: string;
  source: string;
  description: string;
  volumeCount: number;
  grossAmountUSD: number;
  feeOrInterestUSD: number;
  effectiveRate: string;
  status: string;
  date: string;
}

export interface RevenueBreakdown {
  transactionFeesUSD: number;
  qrFeesUSD: number;
  cardFeesUSD: number;
  loanInterestUSD: number;
  otherRevenueUSD: number;
  totalRevenueUSD: number;
}

class AdminReportService {
  /**
   * 1. TRANSACTIONS REPORT
   * Show: Transaction ID, Customer, Account, Type, Amount, Fee, Payment method, Status, Date, Reference
   */
  async getTransactionReport(filters: Partial<ReportFilterState>): Promise<PaginatedReportResult<Transaction>> {
    await simulateNetworkDelay(90);
    let items = [...db.transactions];

    // Filter by date range
    if (filters.startDate) {
      items = items.filter((t) => new Date(t.timestamp) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate!);
      end.setHours(23, 59, 59, 999);
      items = items.filter((t) => new Date(t.timestamp) <= end);
    }

    // Filter by account
    if (filters.accountId && filters.accountId !== 'all') {
      items = items.filter((t) => t.accountId === filters.accountId);
    }

    // Filter by customer
    if (filters.customerId && filters.customerId !== 'all') {
      items = items.filter((t) => t.customerId === filters.customerId);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      items = items.filter((t) => t.status.toLowerCase() === filters.status!.toLowerCase());
    }

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.referenceNumber.toLowerCase().includes(q) ||
          (t.reference && t.reference.toLowerCase().includes(q)) ||
          t.counterpartyName.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortBy = filters.sortBy || 'timestamp';
    const sortOrder = filters.sortOrder || 'desc';
    items.sort((a, b) => {
      let valA: any = a[sortBy as keyof Transaction] ?? '';
      let valB: any = b[sortBy as keyof Transaction] ?? '';
      if (sortBy === 'amount' || sortBy === 'fee') {
        return sortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }
      if (sortBy === 'timestamp') {
        return sortOrder === 'asc'
          ? new Date(valA).getTime() - new Date(valB).getTime()
          : new Date(valB).getTime() - new Date(valA).getTime();
      }
      return sortOrder === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

    // Summary calculations
    const totalVolume = items.reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const totalFees = items.reduce((acc, t) => acc + (t.fee || 0), 0);
    const completedCount = items.filter((t) => t.status === 'completed').length;
    const flaggedCount = items.filter((t) => t.status === 'flagged' || t.isFlaggedByAML).length;

    const summaryMetrics: ReportSummaryMetric[] = [
      {
        title: 'Gross Volume',
        value: `$${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: '+8.4% vs last period',
        isPositive: true,
      },
      {
        title: 'Fee Earnings',
        value: `$${totalFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: '+12.1% net yield',
        isPositive: true,
      },
      {
        title: 'Total Executions',
        value: items.length.toString(),
        subtitle: `${completedCount} completed successfully`,
      },
      {
        title: 'Flagged / Review',
        value: flaggedCount.toString(),
        change: flaggedCount > 0 ? 'Surveillance Active' : '0 Flagged',
        isPositive: flaggedCount === 0,
        variant: flaggedCount > 0 ? 'warning' : 'success',
      },
    ];

    // Chart dataset (volume per day or category)
    const categoryVolumes: Record<string, number> = {};
    items.forEach((t) => {
      const cat = t.type.replace(/_/g, ' ').toUpperCase();
      categoryVolumes[cat] = (categoryVolumes[cat] || 0) + Math.abs(t.amount);
    });

    const chartLabels = Object.keys(categoryVolumes);
    const chartData = {
      labels: chartLabels.length ? chartLabels : ['TRANSFERS', 'CARD PURCHASES', 'QR PAYMENTS', 'FEES'],
      datasets: [
        {
          label: 'Transaction Volume ($USD)',
          data: chartLabels.length ? Object.values(categoryVolumes) : [450000, 182000, 94000, 12500],
          backgroundColor: '#0a192f',
          borderColor: '#c5a059',
        },
      ],
    };

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
      summaryMetrics,
      chartData,
    };
  }

  /**
   * 2. CUSTOMER REPORT
   * Show: Customer ID, Name, Account, KYC status, Risk level, Account status, Registration date
   */
  async getCustomerReport(filters: Partial<ReportFilterState>): Promise<PaginatedReportResult<any>> {
    await simulateNetworkDelay(90);
    let customers = [...db.customers];

    // Filter by date range (createdAt)
    if (filters.startDate) {
      customers = customers.filter((c) => new Date(c.createdAt) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate!);
      end.setHours(23, 59, 59, 999);
      customers = customers.filter((c) => new Date(c.createdAt) <= end);
    }

    // Filter by status (active, pending, etc)
    if (filters.status && filters.status !== 'all') {
      customers = customers.filter((c) => c.status === filters.status || c.kycStatus === filters.status);
    }

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.customerNumber.toLowerCase().includes(q) ||
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.tier.toLowerCase().includes(q)
      );
    }

    // Map into customer report rows
    let rows = customers.map((c) => {
      const customerAccounts = db.accounts.filter((a) => a.customerId === c.id);
      const primaryAcc = customerAccounts[0]?.accountNumber || 'Pending Allocation';
      const branch = customerAccounts[0]?.branch || 'Main Manhattan Flagship';
      return {
        customerId: c.customerNumber || c.id,
        rawId: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        account: primaryAcc,
        accountsCount: customerAccounts.length,
        branch,
        kycStatus: c.kycStatus,
        riskLevel: c.riskScore || 'Low',
        accountStatus: c.status,
        registrationDate: c.createdAt,
        totalBalanceUSD: c.totalBalanceUSD || 0,
        tier: c.tier,
      };
    });

    // Branch filter
    if (filters.branchId && filters.branchId !== 'all') {
      rows = rows.filter((r) => r.branch.toLowerCase().includes(filters.branchId!.toLowerCase()));
    }

    // Sort
    const sortBy = filters.sortBy || 'registrationDate';
    const sortOrder = filters.sortOrder || 'desc';
    rows.sort((a, b) => {
      let valA: any = (a as any)[sortBy] ?? '';
      let valB: any = (b as any)[sortBy] ?? '';
      if (sortBy === 'totalBalanceUSD') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

    const totalAUM = rows.reduce((acc, r) => acc + r.totalBalanceUSD, 0);
    const verifiedKycCount = rows.filter((r) => r.kycStatus === 'verified').length;
    const highRiskCount = rows.filter((r) => r.riskLevel === 'High').length;

    const summaryMetrics: ReportSummaryMetric[] = [
      {
        title: 'Active Client Base',
        value: rows.length.toString(),
        change: '+14.2% YoY growth',
        isPositive: true,
      },
      {
        title: 'Total Client AUM',
        value: `$${totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtitle: 'Assets Under Management',
      },
      {
        title: 'KYC Verified Ratio',
        value: `${rows.length ? Math.round((verifiedKycCount / rows.length) * 100) : 100}%`,
        isPositive: true,
      },
      {
        title: 'High-Risk Tier',
        value: highRiskCount.toString(),
        subtitle: 'Enhanced Due Diligence (EDD)',
        variant: highRiskCount > 0 ? 'warning' : 'success',
      },
    ];

    const chartData = {
      labels: ['Private Client', 'Royal Sovereign', 'Premier', 'Standard'],
      datasets: [
        {
          label: 'Customer Distribution by Tier',
          data: [
            rows.filter((r) => r.tier === 'Private Client').length || 1,
            rows.filter((r) => r.tier === 'Royal Sovereign').length || 1,
            rows.filter((r) => r.tier === 'Premier').length || 1,
            rows.filter((r) => r.tier === 'Standard').length || 1,
          ],
          backgroundColor: '#0a192f',
          borderColor: '#c5a059',
        },
      ],
    };

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = rows.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
      summaryMetrics,
      chartData,
    };
  }

  /**
   * 3. DEPOSIT REPORT
   * Show: Account, Deposit type, Principal, Interest, Maturity, Status
   */
  async getDepositReport(filters: Partial<ReportFilterState>): Promise<PaginatedReportResult<any>> {
    await simulateNetworkDelay(90);
    let deposits = [...db.deposits];

    // Match customer / account info
    let rows = deposits.map((d) => {
      const acc = db.accounts.find((a) => a.id === d.accountId);
      const cust = db.customers.find((c) => c.id === d.customerId);
      const interestAmount = (d.principalAmount * (d.interestRate / 100) * (d.termDays / 365));
      return {
        id: d.id,
        certificateNumber: d.certificateNumber,
        account: acc?.accountNumber || 'ACC-9812-401',
        customer: cust ? `${cust.firstName} ${cust.lastName}` : 'Alexander Sterling',
        customerId: d.customerId,
        branch: acc?.branch || 'Manhattan Private Banking Suite',
        depositType: d.depositType,
        principal: d.principalAmount,
        interestRate: d.interestRate,
        accruedInterest: interestAmount,
        maturityPayout: d.maturityPayoutAmount,
        maturity: d.maturityDate,
        startDate: d.startDate,
        status: d.status,
      };
    });

    if (filters.startDate) {
      rows = rows.filter((r) => new Date(r.startDate) >= new Date(filters.startDate!));
    }
    if (filters.status && filters.status !== 'all') {
      rows = rows.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.certificateNumber.toLowerCase().includes(q) ||
          r.account.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.depositType.toLowerCase().includes(q)
      );
    }

    const totalPrincipal = rows.reduce((acc, r) => acc + r.principal, 0);
    const totalExpectedInterest = rows.reduce((acc, r) => acc + r.accruedInterest, 0);

    const summaryMetrics: ReportSummaryMetric[] = [
      {
        title: 'Total Term Deposits',
        value: `$${totalPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: '+18.5% YTD inflow',
        isPositive: true,
      },
      {
        title: 'Projected Interest Yield',
        value: `$${totalExpectedInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtitle: 'Weighted Avg Yield 4.95%',
      },
      {
        title: 'Active Certificates',
        value: rows.length.toString(),
        subtitle: '100% On-schedule',
      },
      {
        title: 'Auto-Renew Rate',
        value: '84%',
        change: '+4% renewal retention',
        isPositive: true,
      },
    ];

    const chartData = {
      labels: ['High Yield Sovereign', 'Term Fixed Deposit (FDR)', 'Monthly DPS', 'Liquidity Sweep'],
      datasets: [
        {
          label: 'Deposit Book Allocation ($USD)',
          data: [totalPrincipal * 0.55, totalPrincipal * 0.30, totalPrincipal * 0.10, totalPrincipal * 0.05],
          backgroundColor: '#0a192f',
          borderColor: '#c5a059',
        },
      ],
    };

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = rows.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
      summaryMetrics,
      chartData,
    };
  }

  /**
   * 4. LOAN REPORT
   * Show: Loan ID, Customer, Loan type, Amount, Outstanding, EMI, Interest rate, Status
   */
  async getLoanReport(filters: Partial<ReportFilterState>): Promise<PaginatedReportResult<any>> {
    await simulateNetworkDelay(90);
    let loans = [...db.loans];

    let rows = loans.map((ln) => {
      const cust = db.customers.find((c) => c.id === ln.customerId);
      return {
        id: ln.id,
        loanId: ln.loanNumber,
        customer: cust ? `${cust.firstName} ${cust.lastName}` : 'Elena Rostova',
        customerId: ln.customerId,
        loanType: ln.type.replace(/_/g, ' ').toUpperCase(),
        amount: ln.principalAmount,
        outstanding: ln.currentBalance,
        emi: ln.monthlyInstallment,
        interestRate: ln.annualInterestRate,
        status: ln.status,
        termMonths: ln.termMonths,
        remainingMonths: ln.remainingMonths,
        nextDueDate: ln.nextDueDate,
        disbursedAt: ln.disbursedAt,
      };
    });

    if (filters.status && filters.status !== 'all') {
      rows = rows.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.loanId.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.loanType.toLowerCase().includes(q)
      );
    }

    const totalDisbursed = rows.reduce((acc, r) => acc + r.amount, 0);
    const totalOutstanding = rows.reduce((acc, r) => acc + r.outstanding, 0);
    const totalMonthlyEmi = rows.reduce((acc, r) => acc + r.emi, 0);

    const summaryMetrics: ReportSummaryMetric[] = [
      {
        title: 'Total Disbursed Credit',
        value: `$${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtitle: 'Prudential Underwriting Limit',
      },
      {
        title: 'Outstanding Principal',
        value: `$${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: 'LTV Average 58.4%',
        isPositive: true,
      },
      {
        title: 'Monthly Scheduled EMI',
        value: `$${totalMonthlyEmi.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtitle: '100% performing book',
      },
      {
        title: 'Non-Performing Loan (NPL)',
        value: '0.00%',
        change: 'Zero delinquency',
        isPositive: true,
        variant: 'success',
      },
    ];

    const chartData = {
      labels: ['Mortgage Residential', 'Commercial Growth', 'Lombard Securities Loan', 'Bridge Facility'],
      datasets: [
        {
          label: 'Credit Portfolio Exposure ($USD)',
          data: [totalDisbursed * 0.70, totalDisbursed * 0.20, totalDisbursed * 0.08, totalDisbursed * 0.02],
          backgroundColor: '#0a192f',
          borderColor: '#c5a059',
        },
      ],
    };

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = rows.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
      summaryMetrics,
      chartData,
    };
  }

  /**
   * 5. CARD REPORT
   * Show: Card, Customer, Card type, Status, Limit, Transactions
   */
  async getCardReport(filters: Partial<ReportFilterState>): Promise<PaginatedReportResult<any>> {
    await simulateNetworkDelay(90);
    let cards = [...db.cards];

    let rows = cards.map((c) => {
      const cust = db.customers.find((cust) => cust.id === c.customerId);
      const txCount = db.transactions.filter(
        (t) => t.type === 'card_purchase' && (t.customerId === c.customerId || t.accountId === c.accountId)
      ).length;
      return {
        id: c.id,
        card: `${c.network} (${c.cardNumberMasked})`,
        cardNumberMasked: c.cardNumberMasked,
        customer: c.cardholderName || (cust ? `${cust.firstName} ${cust.lastName}` : 'Alexander Sterling'),
        customerId: c.customerId,
        cardType: c.type.toUpperCase(),
        network: c.network,
        status: c.status,
        limit: c.creditLimit || c.spendingLimitMonthly,
        spendingCurrent: c.spendingCurrentMonthly,
        transactions: txCount || 4,
        expiry: `${c.expiryMonth.toString().padStart(2, '0')}/${c.expiryYear}`,
      };
    });

    if (filters.status && filters.status !== 'all') {
      rows = rows.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.cardNumberMasked.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.cardType.toLowerCase().includes(q) ||
          r.network.toLowerCase().includes(q)
      );
    }

    const totalLimit = rows.reduce((acc, r) => acc + r.limit, 0);
    const totalSpent = rows.reduce((acc, r) => acc + r.spendingCurrent, 0);
    const activeCardsCount = rows.filter((r) => r.status === 'active').length;

    const summaryMetrics: ReportSummaryMetric[] = [
      {
        title: 'Active Card Portfolio',
        value: activeCardsCount.toString(),
        subtitle: `${rows.length} total issued`,
      },
      {
        title: 'Aggregate Credit & Spend Limit',
        value: `$${totalLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
      {
        title: 'Current Month Volume',
        value: `$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: '+9.3% interchange run-rate',
        isPositive: true,
      },
      {
        title: 'Fraud Alert Incidents',
        value: '0',
        change: 'Protected by 3D-Secure 2.2',
        isPositive: true,
        variant: 'success',
      },
    ];

    const chartData = {
      labels: ['Visa Infinite', 'Mastercard World Elite', 'Royal Private Titanium', 'Virtual Cloud Prepaid'],
      datasets: [
        {
          label: 'Card Issuance Volume ($USD)',
          data: [120000, 85000, 160000, 25000],
          backgroundColor: '#0a192f',
          borderColor: '#c5a059',
        },
      ],
    };

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = rows.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
      summaryMetrics,
      chartData,
    };
  }

  /**
   * 6. QR REPORT
   * Show: QR payment ID, Sender, Receiver/Merchant, Amount, Fee, Status, Date, Settlement status
   */
  async getQrReport(filters: Partial<ReportFilterState>): Promise<PaginatedReportResult<any>> {
    await simulateNetworkDelay(90);
    let qrPayments = [...db.qrPayments];

    let rows = qrPayments.map((q) => {
      const cust = db.customers.find((c) => c.id === q.customerId);
      const merch = db.merchants.find((m) => m.id === q.merchantId);
      const fee = Number((q.amount * 0.0125).toFixed(2));
      return {
        id: q.id,
        qrPaymentId: q.paymentCode || `QR-${q.id.toUpperCase()}`,
        sender: cust ? `${cust.firstName} ${cust.lastName}` : 'Alexander Sterling',
        senderAccountId: q.accountId,
        receiverMerchant: q.merchantName || merch?.name || 'Le Bernardin Manhattan',
        amount: q.amount,
        fee,
        netSettlement: q.amount - fee,
        status: q.status,
        date: q.timestamp,
        settlementStatus: q.status === 'completed' ? 'Settled T+0' : 'Pending Clearing',
        reference: q.reference || 'QR-PAY-ONLINE',
      };
    });

    if (filters.status && filters.status !== 'all') {
      rows = rows.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.qrPaymentId.toLowerCase().includes(query) ||
          r.sender.toLowerCase().includes(query) ||
          r.receiverMerchant.toLowerCase().includes(query) ||
          r.settlementStatus.toLowerCase().includes(query)
      );
    }

    const totalQrAmount = rows.reduce((acc, r) => acc + r.amount, 0);
    const totalQrFees = rows.reduce((acc, r) => acc + r.fee, 0);

    const summaryMetrics: ReportSummaryMetric[] = [
      {
        title: 'Gross QR GMV',
        value: `$${totalQrAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: '+31.4% MoM adoption',
        isPositive: true,
      },
      {
        title: 'MDR Interchange Revenue',
        value: `$${totalQrFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtitle: 'Standard MDR 1.25%',
      },
      {
        title: 'Total Scans & Settled',
        value: rows.length.toString(),
        subtitle: 'Sub-second EMVCo processing',
      },
      {
        title: 'Settlement Efficiency',
        value: '100%',
        change: 'Zero reconciliation discrepancies',
        isPositive: true,
      },
    ];

    const chartData = {
      labels: ['Fine Dining', 'Art & Auctions', 'Retail Boutiques', 'Executive Transit'],
      datasets: [
        {
          label: 'Merchant QR Gross Volume ($USD)',
          data: [42000, 98000, 31000, 15000],
          backgroundColor: '#0a192f',
          borderColor: '#c5a059',
        },
      ],
    };

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = rows.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
      summaryMetrics,
      chartData,
    };
  }

  /**
   * 7. FRAUD REPORT
   * Show: Alert ID, Customer, Transaction, Risk score, Detection rule, Status, Investigator, Date
   */
  async getFraudReport(filters: Partial<ReportFilterState>): Promise<PaginatedReportResult<any>> {
    await simulateNetworkDelay(90);
    let alerts = [...db.fraudAlerts];

    let rows = alerts.map((f) => {
      return {
        id: f.id,
        alertId: f.alertNumber,
        customer: f.customerName,
        customerId: f.customerId,
        transaction: f.transactionReference || (f.transactionId ? `TX-${f.transactionId}` : 'Off-Session Auth'),
        riskScore: f.riskScore,
        detectionRule: f.detectionRule,
        ruleCategory: f.ruleCategory,
        status: f.status,
        investigator: f.assignedTo || 'Unassigned (Queue)',
        date: f.timestamp,
        amount: f.amount,
        currency: f.currency,
        country: f.country,
      };
    });

    if (filters.status && filters.status !== 'all') {
      rows = rows.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.alertId.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.detectionRule.toLowerCase().includes(q) ||
          r.investigator.toLowerCase().includes(q)
      );
    }

    const highRiskAlerts = rows.filter((r) => r.riskScore >= 75).length;
    const blockedAlerts = rows.filter((r) => r.status === 'blocked').length;

    const summaryMetrics: ReportSummaryMetric[] = [
      {
        title: 'Total Surveillance Alerts',
        value: rows.length.toString(),
        subtitle: 'Autonomous AI Guard 24/7',
      },
      {
        title: 'Critical Risk Alerts',
        value: highRiskAlerts.toString(),
        change: highRiskAlerts > 0 ? 'Requires L2 Escalation' : 'No Critical Incidents',
        isPositive: highRiskAlerts === 0,
        variant: highRiskAlerts > 0 ? 'danger' : 'success',
      },
      {
        title: 'Auto-Blocked Threats',
        value: blockedAlerts.toString(),
        subtitle: 'Estimated $410,000 Saved',
      },
      {
        title: 'False Positive Rate',
        value: '0.42%',
        change: 'Best-in-class precision',
        isPositive: true,
      },
    ];

    const chartData = {
      labels: ['Velocity Spikes', 'Geolocation Anomaly', 'Device Fingerprint', 'High-Risk MCC', 'Credential Stuffing'],
      datasets: [
        {
          label: 'Incidents by Detection Rule',
          data: [12, 8, 5, 3, 2],
          backgroundColor: '#0a192f',
          borderColor: '#c5a059',
        },
      ],
    };

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = rows.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
      summaryMetrics,
      chartData,
    };
  }

  /**
   * 8. REVENUE REPORT
   * Show: Transaction fees, QR fees, Card fees, Loan interest, Other revenue, Total revenue
   */
  async getRevenueReport(filters: Partial<ReportFilterState>): Promise<PaginatedReportResult<RevenueReportItem> & { breakdown: RevenueBreakdown }> {
    await simulateNetworkDelay(90);

    // Calculate dynamic revenues from data
    const transactionFees = db.transactions.reduce((acc, t) => acc + (t.fee || 0), 0) + 14250.0;
    const qrFees = db.qrPayments.reduce((acc, q) => acc + (q.amount * 0.0125), 0) + 6820.0;
    const cardFees = 18450.0; // Interchange + annual card fees
    const loanInterest = db.loans.reduce((acc, l) => acc + ((l.principalAmount * (l.annualInterestRate / 100)) / 12), 0) * 12;
    const otherRevenue = 8900.0; // Account maintenance & FX treasury spread

    const breakdown: RevenueBreakdown = {
      transactionFeesUSD: Number(transactionFees.toFixed(2)),
      qrFeesUSD: Number(qrFees.toFixed(2)),
      cardFeesUSD: Number(cardFees.toFixed(2)),
      loanInterestUSD: Number(loanInterest.toFixed(2)),
      otherRevenueUSD: Number(otherRevenue.toFixed(2)),
      totalRevenueUSD: Number((transactionFees + qrFees + cardFees + loanInterest + otherRevenue).toFixed(2)),
    };

    const lineItems: RevenueReportItem[] = [
      {
        id: 'rev-001',
        category: 'Wire & Transfer Fees',
        source: 'SWIFT International & Fedwire Clearing',
        description: 'Cross-border liquidity wire routing tariffs and correspondent fees',
        volumeCount: 1420,
        grossAmountUSD: 18500000,
        feeOrInterestUSD: transactionFees,
        effectiveRate: '0.15% + $25 flat',
        status: 'Realized',
        date: '2026-09-24',
      },
      {
        id: 'rev-002',
        category: 'Merchant QR Fees',
        source: 'Merchant Acquiring Terminals',
        description: 'Instant settlement MDR earned on luxury retail and dining points-of-sale',
        volumeCount: 3890,
        grossAmountUSD: 545600,
        feeOrInterestUSD: qrFees,
        effectiveRate: '1.25% MDR',
        status: 'Realized',
        date: '2026-09-24',
      },
      {
        id: 'rev-003',
        category: 'Card Interchange & Annual Dues',
        source: 'Visa Infinite & Private Palladium',
        description: 'Interchange fee share and Sovereign tier member annual dues',
        volumeCount: 2940,
        grossAmountUSD: 1240000,
        feeOrInterestUSD: cardFees,
        effectiveRate: '1.85% Interchange',
        status: 'Realized',
        date: '2026-09-24',
      },
      {
        id: 'rev-004',
        category: 'Loan Net Interest Margin',
        source: 'Mortgage & Private Commercial Lending',
        description: 'Yield on outstanding credit book amortized over prime lending rates',
        volumeCount: 42,
        grossAmountUSD: 2450000,
        feeOrInterestUSD: loanInterest,
        effectiveRate: '5.25% - 6.25% APR',
        status: 'Accruing',
        date: '2026-09-24',
      },
      {
        id: 'rev-005',
        category: 'Treasury FX Spread & Other',
        source: 'Institutional Multi-Currency FX Desks',
        description: 'Bid-ask spreads realized on CHF, EUR, GBP, SGD treasury conversions',
        volumeCount: 88,
        grossAmountUSD: 4100000,
        feeOrInterestUSD: otherRevenue,
        effectiveRate: '0.08% spread',
        status: 'Realized',
        date: '2026-09-24',
      },
    ];

    let filtered = [...lineItems];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (i) => i.category.toLowerCase().includes(q) || i.source.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    const summaryMetrics: ReportSummaryMetric[] = [
      {
        title: 'Total Consolidated Revenue',
        value: `$${breakdown.totalRevenueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: '+16.8% YoY net income',
        isPositive: true,
      },
      {
        title: 'Credit & Lending NIM',
        value: `$${breakdown.loanInterestUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtitle: 'Primary Margin Generator',
      },
      {
        title: 'Fee & Non-Interest Income',
        value: `$${(breakdown.transactionFeesUSD + breakdown.qrFeesUSD + breakdown.cardFeesUSD).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: '42.8% of aggregate revenue',
        isPositive: true,
      },
      {
        title: 'Cost-to-Income Ratio',
        value: '38.2%',
        change: 'Industry benchmark top decile',
        isPositive: true,
        variant: 'success',
      },
    ];

    const chartData = {
      labels: ['Loan Interest (NIM)', 'Wire Transfer Fees', 'Card Fees & Interchange', 'Merchant QR Fees', 'Treasury FX & Other'],
      datasets: [
        {
          label: 'Revenue Breakdown ($USD)',
          data: [
            breakdown.loanInterestUSD,
            breakdown.transactionFeesUSD,
            breakdown.cardFeesUSD,
            breakdown.qrFeesUSD,
            breakdown.otherRevenueUSD,
          ],
          backgroundColor: '#0a192f',
          borderColor: '#c5a059',
        },
      ],
    };

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginated,
      breakdown,
      total,
      page,
      pageSize,
      totalPages,
      summaryMetrics,
      chartData,
    };
  }

  /**
   * Utility to export dataset to CSV string
   */
  generateCsvContent(headers: string[], rows: any[][]): string {
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    const headerRow = headers.map(escapeCsv).join(',');
    const dataRows = rows.map((r) => r.map(escapeCsv).join(','));
    return [headerRow, ...dataRows].join('\n');
  }
}

export const adminReportService = new AdminReportService();
