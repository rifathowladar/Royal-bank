import { db } from '../mockApi/storage.ts';
import { QRPayment, AdminAuditLog } from '../types/index.ts';

export interface AdminMerchant {
  id: string;
  name: string;
  category: string;
  merchantCode: string;
  qrPayload: string;
  terminalLocation: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string;
  status: 'active' | 'pending_approval' | 'suspended' | 'terminated';
  kycStatus: 'verified' | 'pending_review' | 'rejected';
  feeRatePercent: number; // e.g., 1.25%
  fixedFee: number; // e.g. $0.25
  dailyVolumeLimit: number;
  singleTransactionLimit: number;
  totalVolume: number;
  pendingSettlementAmount: number;
  bankAccount: string;
  bankName: string;
  createdAt: string;
}

export interface QRSettlementBatch {
  id: string;
  batchNumber: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  feeDeducted: number;
  netPayout: number;
  transactionCount: number;
  status: 'completed' | 'processing' | 'held';
  settledAt: string;
  payoutAccount: string;
  payoutBank: string;
  clearingReference: string;
}

export interface DynamicQRInvoice {
  invoiceId: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  qrPayload: string;
  qrString: string;
  reference: string;
  expiresAt: string;
  status: 'active' | 'paid' | 'expired';
}

const INITIAL_ADMIN_MERCHANTS: AdminMerchant[] = [
  {
    id: 'merch-001',
    name: 'Le Bernardin Manhattan',
    category: 'Fine Dining & Hospitality',
    merchantCode: 'RB-MCH-7781',
    qrPayload: 'royalbank://pay?merchant=RB-MCH-7781&name=Le+Bernardin&currency=USD',
    terminalLocation: '155 W 51st St, New York, NY 10019',
    contactPerson: 'Eric Ripert',
    email: 'billing@le-bernardin.com',
    phone: '+1 (212) 554-1515',
    taxId: 'US-13-8829104',
    status: 'active',
    kycStatus: 'verified',
    feeRatePercent: 1.25,
    fixedFee: 0.30,
    dailyVolumeLimit: 250000,
    singleTransactionLimit: 50000,
    totalVolume: 842190.50,
    pendingSettlementAmount: 18450.00,
    bankAccount: '•••• 8821',
    bankName: 'Royal Bank Private',
    createdAt: '2023-01-15T10:00:00Z',
  },
  {
    id: 'merch-002',
    name: 'Sotheby’s Fine Art Auctions',
    category: 'Art, Antiquities & Luxury',
    merchantCode: 'RB-MCH-9920',
    qrPayload: 'royalbank://pay?merchant=RB-MCH-9920&name=Sothebys&currency=USD',
    terminalLocation: '1334 York Ave, New York, NY 10021',
    contactPerson: 'Helena Vandermeer',
    email: 'treasury@sothebys.com',
    phone: '+1 (212) 606-7000',
    taxId: 'US-13-4492100',
    status: 'active',
    kycStatus: 'verified',
    feeRatePercent: 0.95,
    fixedFee: 0.50,
    dailyVolumeLimit: 2000000,
    singleTransactionLimit: 500000,
    totalVolume: 4920400.00,
    pendingSettlementAmount: 142800.00,
    bankAccount: '•••• 1009',
    bankName: 'Royal Bank Corporate Escrow',
    createdAt: '2022-08-10T12:00:00Z',
  },
  {
    id: 'merch-003',
    name: 'Harrods Mayfair Boutique',
    category: 'Haute Horlogerie & Fashion',
    merchantCode: 'RB-MCH-3041',
    qrPayload: 'royalbank://pay?merchant=RB-MCH-3041&name=Harrods+Mayfair&currency=GBP',
    terminalLocation: '87-135 Brompton Rd, Knightsbridge, London',
    contactPerson: 'Lord Alistair Crawford',
    email: 'pos.clearing@harrods.co.uk',
    phone: '+44 20 7730 1234',
    taxId: 'GB-992-1082-14',
    status: 'active',
    kycStatus: 'verified',
    feeRatePercent: 1.10,
    fixedFee: 0.25,
    dailyVolumeLimit: 500000,
    singleTransactionLimit: 100000,
    totalVolume: 1250800.00,
    pendingSettlementAmount: 32600.00,
    bankAccount: '•••• 4410',
    bankName: 'Royal Bank London',
    createdAt: '2023-04-20T09:30:00Z',
  },
  {
    id: 'merch-004',
    name: 'Baur au Lac Zurich Lakeside',
    category: 'Ultra-Luxury Hotel & Suites',
    merchantCode: 'RB-MCH-1109',
    qrPayload: 'royalbank://pay?merchant=RB-MCH-1109&name=Baur+au+Lac&currency=CHF',
    terminalLocation: 'Talstrasse 1, 8001 Zürich, Switzerland',
    contactPerson: 'Marc Eichenberger',
    email: 'finance@bauraulac.ch',
    phone: '+41 44 220 50 20',
    taxId: 'CHE-102.394.881',
    status: 'pending_approval',
    kycStatus: 'pending_review',
    feeRatePercent: 1.35,
    fixedFee: 0.40,
    dailyVolumeLimit: 150000,
    singleTransactionLimit: 30000,
    totalVolume: 24000.00,
    pendingSettlementAmount: 24000.00,
    bankAccount: '•••• 7732',
    bankName: 'Banque Cantonale de Genève',
    createdAt: '2026-09-18T14:15:00Z',
  },
  {
    id: 'merch-005',
    name: 'Gstaad Palace Aviation Hangars',
    category: 'Private Jet Charter & Fuel',
    merchantCode: 'RB-MCH-8802',
    qrPayload: 'royalbank://pay?merchant=RB-MCH-8802&name=Gstaad+Aviation&currency=CHF',
    terminalLocation: 'Palacestrasse 28, 3780 Gstaad, Switzerland',
    contactPerson: 'Jean-Luc Moreau',
    email: 'hangar@gstaad-aviation.ch',
    phone: '+41 33 748 50 00',
    taxId: 'CHE-401.819.330',
    status: 'suspended',
    kycStatus: 'rejected',
    feeRatePercent: 1.50,
    fixedFee: 1.00,
    dailyVolumeLimit: 100000,
    singleTransactionLimit: 25000,
    totalVolume: 51200.00,
    pendingSettlementAmount: 0.00,
    bankAccount: '•••• 9012',
    bankName: 'UBS Switzerland AG',
    createdAt: '2025-11-04T16:00:00Z',
  },
];

const INITIAL_SETTLEMENT_BATCHES: QRSettlementBatch[] = [
  {
    id: 'set-001',
    batchNumber: 'SET-2026-0923-01',
    merchantId: 'merch-001',
    merchantName: 'Le Bernardin Manhattan',
    amount: 42100.00,
    feeDeducted: 526.25,
    netPayout: 41573.75,
    transactionCount: 28,
    status: 'completed',
    settledAt: '2026-09-23T18:00:00Z',
    payoutAccount: '•••• 8821',
    payoutBank: 'Royal Bank Private',
    clearingReference: 'FEDWIRE-CLR-990142',
  },
  {
    id: 'set-002',
    batchNumber: 'SET-2026-0922-04',
    merchantId: 'merch-002',
    merchantName: 'Sotheby’s Fine Art Auctions',
    amount: 380000.00,
    feeDeducted: 3610.00,
    netPayout: 376390.00,
    transactionCount: 14,
    status: 'completed',
    settledAt: '2026-09-22T19:30:00Z',
    payoutAccount: '•••• 1009',
    payoutBank: 'Royal Bank Corporate Escrow',
    clearingReference: 'CHIPS-NY-884102',
  },
  {
    id: 'set-003',
    batchNumber: 'SET-2026-0921-02',
    merchantId: 'merch-003',
    merchantName: 'Harrods Mayfair Boutique',
    amount: 68400.00,
    feeDeducted: 752.40,
    netPayout: 67647.60,
    transactionCount: 42,
    status: 'completed',
    settledAt: '2026-09-21T17:45:00Z',
    payoutAccount: '•••• 4410',
    payoutBank: 'Royal Bank London',
    clearingReference: 'BACS-LON-109283',
  },
];

class AdminQrService {
  private getMerchantsFromStorage(): AdminMerchant[] {
    try {
      const raw = localStorage.getItem('royal_bank_admin_merchants');
      if (!raw) {
        localStorage.setItem('royal_bank_admin_merchants', JSON.stringify(INITIAL_ADMIN_MERCHANTS));
        return INITIAL_ADMIN_MERCHANTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_MERCHANTS;
    }
  }

  private saveMerchantsToStorage(merchants: AdminMerchant[]): void {
    try {
      localStorage.setItem('royal_bank_admin_merchants', JSON.stringify(merchants));
    } catch (err) {
      console.warn('Failed to save admin merchants:', err);
    }
  }

  private getSettlementsFromStorage(): QRSettlementBatch[] {
    try {
      const raw = localStorage.getItem('royal_bank_admin_qr_settlements');
      if (!raw) {
        localStorage.setItem('royal_bank_admin_qr_settlements', JSON.stringify(INITIAL_SETTLEMENT_BATCHES));
        return INITIAL_SETTLEMENT_BATCHES;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_SETTLEMENT_BATCHES;
    }
  }

  private saveSettlementsToStorage(batches: QRSettlementBatch[]): void {
    try {
      localStorage.setItem('royal_bank_admin_qr_settlements', JSON.stringify(batches));
    } catch (err) {
      console.warn('Failed to save settlements:', err);
    }
  }

  /**
   * Get all merchants with filtering
   */
  async getMerchants(params?: {
    search?: string;
    status?: string;
    kycStatus?: string;
    category?: string;
  }): Promise<AdminMerchant[]> {
    let list = this.getMerchantsFromStorage();

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.merchantCode.toLowerCase().includes(q) ||
          m.terminalLocation.toLowerCase().includes(q) ||
          m.contactPerson.toLowerCase().includes(q)
      );
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((m) => m.status === params.status);
    }

    if (params?.kycStatus && params.kycStatus !== 'all') {
      list = list.filter((m) => m.kycStatus === params.kycStatus);
    }

    if (params?.category && params.category !== 'all') {
      list = list.filter((m) => m.category === params.category);
    }

    return list;
  }

  async getMerchantById(id: string): Promise<AdminMerchant | null> {
    const list = this.getMerchantsFromStorage();
    return list.find((m) => m.id === id) || null;
  }

  /**
   * Register new merchant
   */
  async registerMerchant(data: {
    name: string;
    category: string;
    terminalLocation: string;
    contactPerson: string;
    email: string;
    phone: string;
    taxId: string;
    bankAccount: string;
    bankName: string;
    feeRatePercent?: number;
    dailyVolumeLimit?: number;
    singleTransactionLimit?: number;
  }): Promise<AdminMerchant> {
    const list = this.getMerchantsFromStorage();
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const merchantCode = `RB-MCH-${codeNumber}`;

    const newMerchant: AdminMerchant = {
      id: `merch-${Date.now()}`,
      name: data.name,
      category: data.category,
      merchantCode,
      qrPayload: `royalbank://pay?merchant=${merchantCode}&name=${encodeURIComponent(data.name)}&currency=USD`,
      terminalLocation: data.terminalLocation,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      taxId: data.taxId,
      status: 'pending_approval',
      kycStatus: 'pending_review',
      feeRatePercent: data.feeRatePercent || 1.25,
      fixedFee: 0.25,
      dailyVolumeLimit: data.dailyVolumeLimit || 100000,
      singleTransactionLimit: data.singleTransactionLimit || 25000,
      totalVolume: 0,
      pendingSettlementAmount: 0,
      bankAccount: data.bankAccount,
      bankName: data.bankName,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newMerchant);
    this.saveMerchantsToStorage(list);

    // Audit log
    this.logAudit(
      'REGISTER_MERCHANT',
      'merchant',
      newMerchant.id,
      newMerchant.name,
      `New merchant onboarded with code ${merchantCode}. Awaiting KYC & executive clearance.`
    );

    return newMerchant;
  }

  /**
   * Update merchant status (Approve, Suspend, Activate, Terminate)
   */
  async updateMerchantStatus(
    merchantId: string,
    status: AdminMerchant['status'],
    reason: string
  ): Promise<AdminMerchant> {
    const list = this.getMerchantsFromStorage();
    const index = list.findIndex((m) => m.id === merchantId);
    if (index === -1) throw new Error('Merchant terminal not found');

    list[index].status = status;
    this.saveMerchantsToStorage(list);

    this.logAudit(
      'MERCHANT_STATUS_CHANGE',
      'merchant',
      merchantId,
      list[index].name,
      `Status updated to ${status.toUpperCase()}. Reason: ${reason}`
    );

    return list[index];
  }

  /**
   * Update merchant KYC status
   */
  async updateMerchantKyc(
    merchantId: string,
    kycStatus: AdminMerchant['kycStatus'],
    notes: string
  ): Promise<AdminMerchant> {
    const list = this.getMerchantsFromStorage();
    const index = list.findIndex((m) => m.id === merchantId);
    if (index === -1) throw new Error('Merchant terminal not found');

    list[index].kycStatus = kycStatus;
    if (kycStatus === 'verified' && list[index].status === 'pending_approval') {
      list[index].status = 'active';
    }
    this.saveMerchantsToStorage(list);

    this.logAudit(
      'MERCHANT_KYC_VERIFICATION',
      'merchant',
      merchantId,
      list[index].name,
      `Merchant KYC updated to ${kycStatus.toUpperCase()}. Rationale: ${notes}`
    );

    return list[index];
  }

  /**
   * Update Merchant Fees & Limits
   */
  async updateMerchantFeesAndLimits(
    merchantId: string,
    data: {
      feeRatePercent?: number;
      fixedFee?: number;
      dailyVolumeLimit?: number;
      singleTransactionLimit?: number;
    },
    reason: string
  ): Promise<AdminMerchant> {
    const list = this.getMerchantsFromStorage();
    const index = list.findIndex((m) => m.id === merchantId);
    if (index === -1) throw new Error('Merchant not found');

    if (data.feeRatePercent !== undefined) list[index].feeRatePercent = data.feeRatePercent;
    if (data.fixedFee !== undefined) list[index].fixedFee = data.fixedFee;
    if (data.dailyVolumeLimit !== undefined) list[index].dailyVolumeLimit = data.dailyVolumeLimit;
    if (data.singleTransactionLimit !== undefined) list[index].singleTransactionLimit = data.singleTransactionLimit;

    this.saveMerchantsToStorage(list);

    this.logAudit(
      'UPDATE_MERCHANT_COMMERCIAL_TERMS',
      'merchant',
      merchantId,
      list[index].name,
      `Updated fee rate to ${list[index].feeRatePercent}% and daily ceiling to $${list[index].dailyVolumeLimit.toLocaleString()}. Rationale: ${reason}`
    );

    return list[index];
  }

  /**
   * Generate Dynamic QR Invoice
   */
  generateDynamicQR(
    merchantId: string,
    amount: number,
    currency = 'USD',
    memo = 'Invoice'
  ): DynamicQRInvoice {
    const list = this.getMerchantsFromStorage();
    const merchant = list.find((m) => m.id === merchantId);
    if (!merchant) throw new Error('Merchant not found');

    const invoiceId = `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const reference = `REF-QR-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const qrPayload = `royalbank://checkout?merchant=${merchant.merchantCode}&inv=${invoiceId}&amt=${amount}&cur=${currency}&ref=${reference}&exp=${encodeURIComponent(expiresAt)}`;

    return {
      invoiceId,
      merchantId: merchant.id,
      merchantName: merchant.name,
      amount,
      currency,
      qrPayload,
      qrString: qrPayload,
      reference,
      expiresAt,
      status: 'active',
    };
  }

  /**
   * Get all QR transactions
   */
  async getQrTransactions(params?: {
    merchantId?: string;
    search?: string;
    status?: string;
  }): Promise<QRPayment[]> {
    let txs = [...db.qrPayments];

    // augment with mock historical QR data if needed
    if (txs.length < 5) {
      const extra: QRPayment[] = [
        {
          id: 'qr-tx-001',
          paymentCode: 'QR-2026-9041-NYC',
          merchantId: 'merch-001',
          merchantName: 'Le Bernardin Manhattan',
          recipientType: 'merchant',
          customerId: 'cust-001',
          senderName: 'Alexander Sterling',
          accountId: 'acc-001',
          amount: 1420.00,
          currency: 'USD',
          status: 'completed',
          timestamp: '2026-09-24T00:15:00Z',
          reference: 'CHEF-DEGUSTATION-984',
          note: 'Sommelier Reserve Pairing Table 4',
        },
        {
          id: 'qr-tx-002',
          paymentCode: 'QR-2026-9042-LON',
          merchantId: 'merch-003',
          merchantName: 'Harrods Mayfair Boutique',
          recipientType: 'merchant',
          customerId: 'cust-002',
          senderName: 'Elena Rostova',
          accountId: 'acc-002',
          amount: 8950.00,
          currency: 'GBP',
          status: 'completed',
          timestamp: '2026-09-23T16:30:00Z',
          reference: 'HAUTE-WATCH-771',
          note: 'Patek Philippe Complications',
        },
        {
          id: 'qr-tx-003',
          paymentCode: 'QR-2026-9043-ZUR',
          merchantId: 'merch-004',
          merchantName: 'Baur au Lac Zurich Lakeside',
          recipientType: 'merchant',
          customerId: 'cust-003',
          senderName: 'Julian Croft',
          accountId: 'acc-003',
          amount: 3200.00,
          currency: 'CHF',
          status: 'pending',
          timestamp: '2026-09-23T11:20:00Z',
          reference: 'SUITE-PRESIDENTIAL-201',
          note: 'VIP Suite Booking Escrow',
        },
        {
          id: 'qr-tx-004',
          paymentCode: 'QR-2026-9044-NYC',
          merchantId: 'merch-002',
          merchantName: 'Sotheby’s Fine Art Auctions',
          recipientType: 'merchant',
          customerId: 'cust-001',
          senderName: 'Alexander Sterling',
          accountId: 'acc-001',
          amount: 75000.00,
          currency: 'USD',
          status: 'completed',
          timestamp: '2026-09-22T14:10:00Z',
          reference: 'AUCTION-BID-LOT-88',
          note: 'Post-War Contemporary Art Lot 88',
        },
        {
          id: 'qr-tx-005',
          paymentCode: 'QR-2026-9045-GST',
          merchantId: 'merch-005',
          merchantName: 'Gstaad Palace Aviation Hangars',
          recipientType: 'merchant',
          customerId: 'cust-002',
          senderName: 'Elena Rostova',
          accountId: 'acc-002',
          amount: 18500.00,
          currency: 'CHF',
          status: 'failed',
          timestamp: '2026-09-21T09:45:00Z',
          reference: 'JET-REFUEL-JET-A1',
          note: 'Declined due to merchant account suspension',
        },
      ];
      txs = [...txs, ...extra];
    }

    if (params?.merchantId && params.merchantId !== 'all') {
      txs = txs.filter((t) => t.merchantId === params.merchantId);
    }

    if (params?.status && params.status !== 'all') {
      txs = txs.filter((t) => t.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      txs = txs.filter(
        (t) =>
          t.paymentCode.toLowerCase().includes(q) ||
          (t.merchantName && t.merchantName.toLowerCase().includes(q)) ||
          t.reference.toLowerCase().includes(q) ||
          (t.senderName && t.senderName.toLowerCase().includes(q))
      );
    }

    return txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Refund a QR Payment
   */
  async refundQrPayment(paymentId: string, reason: string): Promise<QRPayment> {
    const txs = await this.getQrTransactions();
    const tx = txs.find((t) => t.id === paymentId);
    if (!tx) throw new Error('QR Transaction not found');

    tx.status = 'failed'; // marked refunded/reversed
    tx.note = (tx.note ? tx.note + ' | ' : '') + `ADMIN REFUND: ${reason}`;

    // Adjust merchant pending settlement if positive
    const merchants = this.getMerchantsFromStorage();
    const mIndex = merchants.findIndex((m) => m.id === tx.merchantId);
    if (mIndex !== -1) {
      merchants[mIndex].pendingSettlementAmount = Math.max(
        0,
        merchants[mIndex].pendingSettlementAmount - tx.amount
      );
      this.saveMerchantsToStorage(merchants);
    }

    this.logAudit(
      'REFUND_QR_PAYMENT',
      'qr_payment',
      paymentId,
      tx.paymentCode,
      `Refund of $${tx.amount.toLocaleString()} executed to customer. Reason: ${reason}`
    );

    return tx;
  }

  /**
   * Get all Settlement Batches
   */
  async getSettlementBatches(): Promise<QRSettlementBatch[]> {
    return this.getSettlementsFromStorage();
  }

  /**
   * Execute Batch Settlement for a Merchant
   */
  async executeMerchantSettlement(merchantId: string): Promise<QRSettlementBatch> {
    const list = this.getMerchantsFromStorage();
    const merchant = list.find((m) => m.id === merchantId);
    if (!merchant) throw new Error('Merchant not found');

    if (merchant.pendingSettlementAmount <= 0) {
      throw new Error('Merchant currently has no pending settlement balance to payout');
    }

    const grossAmount = merchant.pendingSettlementAmount;
    const feeRate = merchant.feeRatePercent / 100;
    const feeDeducted = Number((grossAmount * feeRate + merchant.fixedFee).toFixed(2));
    const netPayout = Number((grossAmount - feeDeducted).toFixed(2));

    const batch: QRSettlementBatch = {
      id: `set-${Date.now()}`,
      batchNumber: `SET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      amount: grossAmount,
      feeDeducted,
      netPayout,
      transactionCount: Math.max(1, Math.floor(grossAmount / 2500)),
      status: 'completed',
      settledAt: new Date().toISOString(),
      payoutAccount: merchant.bankAccount,
      payoutBank: merchant.bankName,
      clearingReference: `FED-ACH-CLR-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    // Reset merchant pending settlement
    merchant.pendingSettlementAmount = 0;
    merchant.totalVolume += grossAmount;
    this.saveMerchantsToStorage(list);

    const settlements = this.getSettlementsFromStorage();
    settlements.unshift(batch);
    this.saveSettlementsToStorage(settlements);

    this.logAudit(
      'EXECUTE_QR_SETTLEMENT',
      'settlement',
      batch.id,
      batch.batchNumber,
      `Settled gross $${grossAmount.toLocaleString()} (Net $${netPayout.toLocaleString()} after $${feeDeducted} fees) to ${merchant.name}.`
    );

    return batch;
  }

  /**
   * Execute Universal Settlement for all eligible merchants
   */
  async executeUniversalSettlement(): Promise<QRSettlementBatch[]> {
    const merchants = this.getMerchantsFromStorage();
    const eligible = merchants.filter((m) => m.status === 'active' && m.pendingSettlementAmount > 0);

    const created: QRSettlementBatch[] = [];
    for (const m of eligible) {
      try {
        const batch = await this.executeMerchantSettlement(m.id);
        created.push(batch);
      } catch (err) {
        console.warn('Settlement error for merchant', m.id, err);
      }
    }
    return created;
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

export const adminQrService = new AdminQrService();
