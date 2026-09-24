import { db } from '../mockApi/storage.ts';
import { Card, AdminAuditLog } from '../types/index.ts';

export type AdminCardItem = Card;

export interface AdminCardTransaction {
  id: string;
  cardId: string;
  cardNumberMasked: string;
  customerId: string;
  customerName: string;
  merchantName: string;
  mccCode: string;
  mccCategory: string;
  amount: number;
  currency: string;
  status: 'approved' | 'declined' | 'flagged_fraud' | 'reversed';
  declineReason?: string;
  country: string;
  city: string;
  authCode: string;
  interchangeFee: number;
  timestamp: string;
  isInternational: boolean;
  channel: 'POS Contactless' | 'POS Chip & PIN' | 'E-Commerce Online' | 'ATM Cash';
  entryMethod?: string;
}

export interface CardFraudAlert {
  id: string;
  cardId: string;
  cardNumberMasked: string;
  customerId: string;
  customerName: string;
  transactionId?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number; // 0 - 100
  triggerRule: string;
  description: string;
  location: string;
  amount?: number;
  currency?: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  actionTaken?: string;
}

const INITIAL_CARD_TRANSACTIONS: AdminCardTransaction[] = [
  {
    id: 'ctx-001',
    cardId: 'card-001',
    cardNumberMasked: '•••• 4921',
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    merchantName: 'Bergdorf Goodman Fifth Ave',
    mccCode: '5311',
    mccCategory: 'Luxury Department Stores',
    amount: 3450.00,
    currency: 'USD',
    status: 'approved',
    country: 'United States',
    city: 'New York',
    authCode: 'AUTH-990142',
    interchangeFee: 41.40,
    timestamp: '2026-09-24T01:12:00Z',
    isInternational: false,
    channel: 'POS Contactless',
  },
  {
    id: 'ctx-002',
    cardId: 'card-002',
    cardNumberMasked: '•••• 8820',
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    merchantName: 'Delta Air Lines First Class',
    mccCode: '4511',
    mccCategory: 'Airlines & Air Carriers',
    amount: 6200.00,
    currency: 'USD',
    status: 'approved',
    country: 'United States',
    city: 'Atlanta',
    authCode: 'AUTH-881290',
    interchangeFee: 74.40,
    timestamp: '2026-09-23T22:40:00Z',
    isInternational: false,
    channel: 'E-Commerce Online',
  },
  {
    id: 'ctx-003',
    cardId: 'card-003',
    cardNumberMasked: '•••• 1104',
    customerId: 'cust-002',
    customerName: 'Elena Rostova',
    merchantName: 'Crypto-Bridge Global Ltd',
    mccCode: '6051',
    mccCategory: 'Non-Financial Quasi-Cash / Crypto',
    amount: 14500.00,
    currency: 'EUR',
    status: 'declined',
    declineReason: 'Restricted merchant category code: Crypto onramp requires dual authorization',
    country: 'Cyprus',
    city: 'Limassol',
    authCode: 'DECL-501192',
    interchangeFee: 0,
    timestamp: '2026-09-23T19:15:00Z',
    isInternational: true,
    channel: 'E-Commerce Online',
  },
  {
    id: 'ctx-004',
    cardId: 'card-001',
    cardNumberMasked: '•••• 4921',
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    merchantName: 'ATM Euronet Zurich Bahnhof',
    mccCode: '6011',
    mccCategory: 'Automated Cash Disbursements',
    amount: 1200.00,
    currency: 'CHF',
    status: 'flagged_fraud',
    declineReason: 'Velocity anomaly: High-value foreign ATM withdrawal without travel advisory',
    country: 'Switzerland',
    city: 'Zurich',
    authCode: 'FLAG-993810',
    interchangeFee: 14.40,
    timestamp: '2026-09-23T17:05:00Z',
    isInternational: true,
    channel: 'ATM Cash',
  },
  {
    id: 'ctx-005',
    cardId: 'card-002',
    cardNumberMasked: '•••• 8820',
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    merchantName: 'Le Gabriel Paris 3-Star',
    mccCode: '5812',
    mccCategory: 'Eating Places & Restaurants',
    amount: 890.00,
    currency: 'EUR',
    status: 'approved',
    country: 'France',
    city: 'Paris',
    authCode: 'AUTH-119203',
    interchangeFee: 10.68,
    timestamp: '2026-09-22T20:30:00Z',
    isInternational: true,
    channel: 'POS Chip & PIN',
  },
];

const INITIAL_CARD_FRAUD_ALERTS: CardFraudAlert[] = [
  {
    id: 'cfa-001',
    cardId: 'card-001',
    cardNumberMasked: '•••• 4921',
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    transactionId: 'ctx-004',
    severity: 'critical',
    riskScore: 92,
    triggerRule: 'ANOMALOUS_CROSS_BORDER_VELOCITY',
    description: 'Card used in New York at Bergdorf Goodman and in Zurich ATM within 16 hours without flight booking or travel notification on file.',
    location: 'Zurich, Switzerland',
    amount: 1200.00,
    currency: 'CHF',
    status: 'open',
    detectedAt: '2026-09-23T17:05:30Z',
  },
  {
    id: 'cfa-002',
    cardId: 'card-003',
    cardNumberMasked: '•••• 1104',
    customerId: 'cust-002',
    customerName: 'Elena Rostova',
    transactionId: 'ctx-003',
    severity: 'high',
    riskScore: 78,
    triggerRule: 'QUASI_CASH_HIGH_RISK_MERCHANT',
    description: 'High-value e-commerce attempt at offshore crypto gateway in Limassol exceeding customer normal profile baseline by 400%.',
    location: 'Limassol, Cyprus',
    amount: 14500.00,
    currency: 'EUR',
    status: 'open',
    detectedAt: '2026-09-23T19:15:10Z',
  },
  {
    id: 'cfa-003',
    cardId: 'card-004',
    cardNumberMasked: '•••• 7731',
    customerId: 'cust-003',
    customerName: 'Julian Croft',
    severity: 'medium',
    riskScore: 61,
    triggerRule: 'MULTIPLE_PIN_FAILURES',
    description: '3 consecutive incorrect PIN entries recorded at domestic ATM terminal in London City core.',
    location: 'London, United Kingdom',
    amount: 500.00,
    currency: 'GBP',
    status: 'investigating',
    detectedAt: '2026-09-22T14:22:00Z',
  },
];

class AdminCardService {
  private getFraudAlertsFromStorage(): CardFraudAlert[] {
    try {
      const raw = localStorage.getItem('royal_bank_card_fraud_alerts');
      if (!raw) {
        localStorage.setItem('royal_bank_card_fraud_alerts', JSON.stringify(INITIAL_CARD_FRAUD_ALERTS));
        return INITIAL_CARD_FRAUD_ALERTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_CARD_FRAUD_ALERTS;
    }
  }

  private saveFraudAlertsToStorage(alerts: CardFraudAlert[]): void {
    try {
      localStorage.setItem('royal_bank_card_fraud_alerts', JSON.stringify(alerts));
    } catch (err) {
      console.warn('Failed to save card fraud alerts:', err);
    }
  }

  private getCardTransactionsFromStorage(): AdminCardTransaction[] {
    try {
      const raw = localStorage.getItem('royal_bank_card_txs');
      if (!raw) {
        localStorage.setItem('royal_bank_card_txs', JSON.stringify(INITIAL_CARD_TRANSACTIONS));
        return INITIAL_CARD_TRANSACTIONS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_CARD_TRANSACTIONS;
    }
  }

  private saveCardTransactionsToStorage(txs: AdminCardTransaction[]): void {
    try {
      localStorage.setItem('royal_bank_card_txs', JSON.stringify(txs));
    } catch (err) {
      console.warn('Failed to save card transactions:', err);
    }
  }

  /**
   * Get all cards with filters
   */
  async getCards(params?: {
    search?: string;
    status?: string;
    type?: string;
    network?: string;
  }): Promise<Card[]> {
    let list = [...db.cards];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.cardholderName.toLowerCase().includes(q) ||
          c.cardNumberMasked.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((c) => c.status === params.status);
    }

    if (params?.type && params.type !== 'all') {
      list = list.filter((c) => c.type === params.type);
    }

    if (params?.network && params.network !== 'all') {
      list = list.filter((c) => c.network === params.network);
    }

    return list;
  }

  async getCardById(cardId: string): Promise<Card | null> {
    return db.cards.find((c) => c.id === cardId) || null;
  }

  /**
   * Issue new physical or virtual card
   */
  async issueCard(data: {
    customerId: string;
    cardHolderName: string;
    accountId?: string;
    type: Card['type'];
    network: Card['network'];
    colorScheme: Card['colorScheme'];
    spendingLimitMonthly: number;
    dailyAtmLimit: number;
    dailyPosLimit: number;
    dailyOnlineLimit: number;
    isContactlessEnabled: boolean;
    isInternationalEnabled: boolean;
    isOnlinePaymentsEnabled: boolean;
    physicalShippingAddress?: string;
    creditLimit?: number;
    aprPercentage?: number;
  }): Promise<Card> {
    const lastDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const expiryYear = new Date().getFullYear() + 4;
    const expiryMonth = Math.floor(1 + Math.random() * 12);

    const newCard: Card = {
      id: `card-${Date.now()}`,
      customerId: data.customerId,
      accountId: data.accountId || 'acc-001',
      cardNumberMasked: `•••• ${lastDigits}`,
      cardholderName: data.cardHolderName.toUpperCase(),
      expiryMonth,
      expiryYear,
      type: data.type,
      network: data.network,
      status: 'active',
      spendingLimitMonthly: data.spendingLimitMonthly,
      spendingCurrentMonthly: 0,
      dailyAtmLimit: data.dailyAtmLimit,
      dailyPosLimit: data.dailyPosLimit,
      dailyOnlineLimit: data.dailyOnlineLimit,
      isContactlessEnabled: data.isContactlessEnabled,
      isOnlinePaymentsEnabled: data.isOnlinePaymentsEnabled,
      isInternationalEnabled: data.isInternationalEnabled,
      pinSet: true,
      isActivated: true,
      colorScheme: data.colorScheme,
      cardLabel: `${data.network} ${data.type === 'credit' ? 'Infinite Credit' : 'Signature Debit'}`,
      creditLimit: data.type === 'credit' ? (data.creditLimit || 50000) : undefined,
      availableCredit: data.type === 'credit' ? (data.creditLimit || 50000) : undefined,
      outstandingBalance: 0,
      aprPercentage: data.type === 'credit' ? (data.aprPercentage || 14.99) : undefined,
    };

    db.cards.unshift(newCard);
    db.persist('cards', db.cards);

    this.logAudit(
      'ISSUE_CARD',
      'card',
      newCard.id,
      newCard.cardNumberMasked,
      `Issued ${newCard.network} ${newCard.type.toUpperCase()} card to ${data.cardHolderName}. Limit: $${data.spendingLimitMonthly.toLocaleString()}.`
    );

    return newCard;
  }

  /**
   * Activate Card
   */
  async activateCard(cardId: string): Promise<Card> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    card.isActivated = true;
    card.status = 'active';
    db.persist('cards', db.cards);

    this.logAudit(
      'ACTIVATE_CARD',
      'card',
      cardId,
      card.cardNumberMasked,
      'Administrative activation executed for cardholder.'
    );

    return card;
  }

  /**
   * Block Card (permanent security hotlist)
   */
  async blockCard(cardId: string, reason: string): Promise<Card> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    card.status = 'cancelled'; // or hotlisted
    card.isActivated = false;
    db.persist('cards', db.cards);

    this.logAudit(
      'BLOCK_CARD',
      'card',
      cardId,
      card.cardNumberMasked,
      `Card blocked permanently on Visa/Mastercard Global Hotlist. Reason: ${reason}`
    );

    return card;
  }

  /**
   * Freeze Card
   */
  async freezeCard(cardId: string, reason: string): Promise<Card> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');
    card.status = 'frozen';
    db.persist('cards', db.cards);
    this.logAudit('FREEZE_CARD', 'card', cardId, card.cardNumberMasked, reason);
    return card;
  }

  /**
   * Unfreeze Card
   */
  async unfreezeCard(cardId: string, reason: string): Promise<Card> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');
    card.status = 'active';
    db.persist('cards', db.cards);
    this.logAudit('UNFREEZE_CARD', 'card', cardId, card.cardNumberMasked, reason);
    return card;
  }

  /**
   * Freeze or Unfreeze Card
   */
  async toggleFreezeCard(cardId: string, reason: string): Promise<Card> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    const nextStatus = card.status === 'frozen' ? 'active' : 'frozen';
    card.status = nextStatus;
    db.persist('cards', db.cards);

    this.logAudit(
      nextStatus === 'frozen' ? 'FREEZE_CARD' : 'UNFREEZE_CARD',
      'card',
      cardId,
      card.cardNumberMasked,
      `Card status changed to ${nextStatus.toUpperCase()}. Rationale: ${reason}`
    );

    return card;
  }

  /**
   * Replace Card
   */
  async replaceCard(
    cardId: string,
    reason: 'lost' | 'stolen' | 'damaged' | 'fraud_compromised' | string,
    deliveryAddress?: string
  ): Promise<{ oldCard: Card; newCard: Card } & Card> {
    const oldCard = db.cards.find((c) => c.id === cardId);
    if (!oldCard) throw new Error('Card not found');

    // Block old card
    oldCard.status = 'cancelled';
    db.persist('cards', db.cards);

    // Issue replacement card
    const lastDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const newCard: Card = {
      ...oldCard,
      id: `card-${Date.now()}`,
      cardNumberMasked: `•••• ${lastDigits}`,
      status: 'active',
      isActivated: true,
      cardReplacementStatus: 'shipped',
      spendingCurrentMonthly: 0,
    };

    db.cards.unshift(newCard);
    db.persist('cards', db.cards);

    const address = deliveryAddress || 'Primary registered residential address';
    this.logAudit(
      'REPLACE_CARD',
      'card',
      newCard.id,
      `${oldCard.cardNumberMasked} -> ${newCard.cardNumberMasked}`,
      `Replaced card due to: ${reason}. Shipped to: ${address}. Tracking: DHL-RB-${Math.floor(100000 + Math.random() * 900000)}`
    );

    return Object.assign(newCard, { oldCard, newCard });
  }

  /**
   * Update Limits alias
   */
  async updateLimits(
    cardId: string,
    limits: {
      dailyLimit?: number;
      atmDailyLimit?: number;
      onlineLimit?: number;
      spendingLimitMonthly?: number;
      dailyAtmLimit?: number;
      dailyPosLimit?: number;
      dailyOnlineLimit?: number;
    },
    reason: string
  ): Promise<Card> {
    return this.updateCardLimits(
      cardId,
      {
        spendingLimitMonthly: limits.spendingLimitMonthly ?? limits.dailyLimit,
        dailyAtmLimit: limits.dailyAtmLimit ?? limits.atmDailyLimit,
        dailyPosLimit: limits.dailyPosLimit ?? limits.dailyLimit,
        dailyOnlineLimit: limits.dailyOnlineLimit ?? limits.onlineLimit,
      },
      reason
    );
  }

  /**
   * Update Card Limits
   */
  async updateCardLimits(
    cardId: string,
    limits: {
      spendingLimitMonthly?: number;
      dailyAtmLimit?: number;
      dailyPosLimit?: number;
      dailyOnlineLimit?: number;
      isContactlessEnabled?: boolean;
      isOnlinePaymentsEnabled?: boolean;
      isInternationalEnabled?: boolean;
      creditLimit?: number;
    },
    reason: string
  ): Promise<Card> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    if (limits.spendingLimitMonthly !== undefined) card.spendingLimitMonthly = limits.spendingLimitMonthly;
    if (limits.dailyAtmLimit !== undefined) card.dailyAtmLimit = limits.dailyAtmLimit;
    if (limits.dailyPosLimit !== undefined) card.dailyPosLimit = limits.dailyPosLimit;
    if (limits.dailyOnlineLimit !== undefined) card.dailyOnlineLimit = limits.dailyOnlineLimit;
    if (limits.isContactlessEnabled !== undefined) card.isContactlessEnabled = limits.isContactlessEnabled;
    if (limits.isOnlinePaymentsEnabled !== undefined) card.isOnlinePaymentsEnabled = limits.isOnlinePaymentsEnabled;
    if (limits.isInternationalEnabled !== undefined) card.isInternationalEnabled = limits.isInternationalEnabled;
    if (limits.creditLimit !== undefined) {
      card.creditLimit = limits.creditLimit;
      card.availableCredit = limits.creditLimit - (card.outstandingBalance || 0);
    }

    db.persist('cards', db.cards);

    this.logAudit(
      'UPDATE_CARD_LIMITS',
      'card',
      cardId,
      card.cardNumberMasked,
      `Limits updated. Monthly limit: $${card.spendingLimitMonthly.toLocaleString()}. Reason: ${reason}`
    );

    return card;
  }

  /**
   * Get Card Transactions Feed
   */
  async getCardTransactions(params?: {
    cardId?: string;
    status?: string;
    search?: string;
  }): Promise<AdminCardTransaction[]> {
    let list = this.getCardTransactionsFromStorage();

    if (params?.cardId && params.cardId !== 'all') {
      list = list.filter((t) => t.cardId === params.cardId);
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((t) => t.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.merchantName.toLowerCase().includes(q) ||
          t.cardNumberMasked.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.authCode.toLowerCase().includes(q) ||
          t.mccCategory.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get Fraud Alerts
   */
  async getFraudAlerts(params?: {
    severity?: string;
    status?: string;
  }): Promise<CardFraudAlert[]> {
    let list = this.getFraudAlertsFromStorage();

    if (params?.severity && params.severity !== 'all') {
      list = list.filter((a) => a.severity === params.severity);
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((a) => a.status === params.status);
    }

    return list.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  /**
   * Resolve Fraud Alert with action
   */
  async resolveFraudAlert(
    alertId: string,
    action: 'freeze_card' | 'block_card' | 'replace_card' | 'mark_false_positive' | 'dismiss',
    notes: string
  ): Promise<CardFraudAlert> {
    const alerts = this.getFraudAlertsFromStorage();
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) throw new Error('Fraud alert not found');

    alert.status = action === 'mark_false_positive' ? 'false_positive' : 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = 'Victoria Ashford';
    alert.actionTaken = `${action.toUpperCase()}: ${notes}`;

    // Trigger matching card operation
    if (action === 'freeze_card') {
      await this.toggleFreezeCard(alert.cardId, `Automated safety freeze from fraud alert ${alert.id}`);
    } else if (action === 'block_card') {
      await this.blockCard(alert.cardId, `Security compromise hotlist from fraud alert ${alert.id}`);
    } else if (action === 'replace_card') {
      await this.replaceCard(alert.cardId, 'fraud_compromised', 'Primary cardholder verified billing address');
    }

    this.saveFraudAlertsToStorage(alerts);

    this.logAudit(
      'RESOLVE_CARD_FRAUD_ALERT',
      'card',
      alert.cardId,
      alert.cardNumberMasked,
      `Fraud alert resolved via ${action}. Rationale: ${notes}`
    );

    return alert;
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

export const adminCardService = new AdminCardService();
