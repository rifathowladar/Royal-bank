import { db } from '../mockApi/storage.ts';
import {
  Card,
  CardReplacementRequest,
  EMIPlan,
  CardOffer,
  CardStatement,
  Transaction,
  Notification,
  Account,
} from '../types/index.ts';

class CardService {
  /**
   * Retrieve all cards for a customer
   */
  async getCards(customerId = 'cust-001'): Promise<Card[]> {
    return db.cards.filter((c) => c.customerId === customerId);
  }

  /**
   * Get specific card by ID
   */
  async getCardById(cardId: string): Promise<Card | null> {
    const card = db.cards.find((c) => c.id === cardId);
    return card || null;
  }

  /**
   * Toggle Freeze / Unfreeze
   */
  async toggleFreezeCard(cardId: string): Promise<Card> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    const newStatus = card.status === 'frozen' ? 'active' : 'frozen';
    card.status = newStatus;
    db.persist('cards', db.cards);

    // Notification
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: card.customerId,
      title: `Card ${newStatus === 'frozen' ? 'Temporarily Frozen' : 'Reactivated'}`,
      message: `Your card ending in ${card.cardNumberMasked.slice(-4)} was successfully ${newStatus === 'frozen' ? 'frozen' : 'unfrozen'}.`,
      type: 'security',
      priority: 'normal',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/bank/cards/${card.id}`,
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return card;
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

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: card.customerId,
      title: 'Card Activated Successfully',
      message: `Your card ending in ${card.cardNumberMasked.slice(-4)} is now activated and ready for all global transactions.`,
      type: 'security',
      priority: 'high',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/bank/cards/${card.id}`,
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return card;
  }

  /**
   * Change Card PIN
   */
  async changePin(cardId: string, _oldPin: string, _newPin: string): Promise<boolean> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    card.pinSet = true;
    db.persist('cards', db.cards);

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: card.customerId,
      title: 'Card PIN Updated',
      message: `Security notice: The 4-digit PIN for your card ending in ${card.cardNumberMasked.slice(-4)} was changed successfully.`,
      type: 'security',
      priority: 'high',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/bank/cards/${card.id}`,
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return true;
  }

  /**
   * Update Transaction Limits (ATM, POS, Online, Monthly)
   */
  async updateLimits(
    cardId: string,
    limits: {
      dailyAtmLimit?: number;
      dailyPosLimit?: number;
      dailyOnlineLimit?: number;
      spendingLimitMonthly?: number;
    }
  ): Promise<Card> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    if (limits.dailyAtmLimit !== undefined) card.dailyAtmLimit = limits.dailyAtmLimit;
    if (limits.dailyPosLimit !== undefined) card.dailyPosLimit = limits.dailyPosLimit;
    if (limits.dailyOnlineLimit !== undefined) card.dailyOnlineLimit = limits.dailyOnlineLimit;
    if (limits.spendingLimitMonthly !== undefined) card.spendingLimitMonthly = limits.spendingLimitMonthly;

    db.persist('cards', db.cards);
    return card;
  }

  /**
   * Update Channel Toggles (Online, International, Contactless)
   */
  async updateChannels(
    cardId: string,
    toggles: {
      isOnlinePaymentsEnabled?: boolean;
      isInternationalEnabled?: boolean;
      isContactlessEnabled?: boolean;
    }
  ): Promise<Card> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    if (toggles.isOnlinePaymentsEnabled !== undefined) {
      card.isOnlinePaymentsEnabled = toggles.isOnlinePaymentsEnabled;
    }
    if (toggles.isInternationalEnabled !== undefined) {
      card.isInternationalEnabled = toggles.isInternationalEnabled;
    }
    if (toggles.isContactlessEnabled !== undefined) {
      card.isContactlessEnabled = toggles.isContactlessEnabled;
    }

    db.persist('cards', db.cards);
    return card;
  }

  /**
   * Generate Virtual Card
   */
  async generateVirtualCard(params: {
    customerId: string;
    accountId: string;
    label: string;
    spendingLimitMonthly: number;
    colorScheme: 'royal_gold' | 'midnight_blue' | 'black_titanium' | 'emerald_prestige';
    isBurner?: boolean;
  }): Promise<Card> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const randomMid1 = Math.floor(1000 + Math.random() * 9000).toString();
    const randomMid2 = Math.floor(1000 + Math.random() * 9000).toString();
    const randomCVV = Math.floor(100 + Math.random() * 900).toString();
    const prefix = params.colorScheme === 'royal_gold' ? '4532' : '5399';

    const fullNumber = `${prefix} ${randomMid1} ${randomMid2} ${randomSuffix}`;
    const maskedNumber = `•••• •••• •••• ${randomSuffix}`;

    const newCard: Card = {
      id: `crd-virt-${Date.now()}`,
      accountId: params.accountId,
      customerId: params.customerId,
      cardNumberMasked: maskedNumber,
      fullCardNumber: fullNumber,
      cvvMasked: randomCVV,
      cardholderName: 'ALEXANDER STERLING',
      expiryMonth: (new Date().getMonth() + 1),
      expiryYear: parseInt(new Date().getFullYear().toString().slice(-2), 10) + (params.isBurner ? 1 : 3),
      type: 'virtual_prepaid',
      network: params.colorScheme === 'royal_gold' ? 'Visa Infinite' : 'Mastercard World Elite',
      status: 'active',
      spendingLimitMonthly: params.spendingLimitMonthly,
      spendingCurrentMonthly: 0,
      dailyAtmLimit: 0,
      dailyPosLimit: Math.min(params.spendingLimitMonthly, 5000),
      dailyOnlineLimit: params.spendingLimitMonthly,
      isContactlessEnabled: false,
      isOnlinePaymentsEnabled: true,
      isInternationalEnabled: true,
      pinSet: true,
      isActivated: true,
      colorScheme: params.colorScheme,
      cardLabel: params.label || 'Digital Virtual Shield',
      isBurner: !!params.isBurner,
      cardReplacementStatus: 'none',
    };

    db.cards.push(newCard);
    db.persist('cards', db.cards);

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: params.customerId,
      title: 'Virtual Card Issued',
      message: `Your new virtual card "${newCard.cardLabel}" ending in ${randomSuffix} has been instantly generated and is active.`,
      type: 'transaction',
      priority: 'normal',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/bank/cards/virtual`,
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return newCard;
  }

  /**
   * Delete Virtual Card
   */
  async deleteVirtualCard(cardId: string): Promise<boolean> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');
    if (card.type !== 'virtual_prepaid') {
      throw new Error('Only virtual cards can be deleted');
    }

    db.cards = db.cards.filter((c) => c.id !== cardId);
    db.persist('cards', db.cards);
    return true;
  }

  /**
   * Request Card Replacement (Lost/Stolen/Damaged/Expired)
   */
  async requestCardReplacement(params: {
    cardId: string;
    reason: 'lost' | 'stolen' | 'damaged' | 'expired';
    deliveryAddress: string;
    instantVirtual: boolean;
  }): Promise<{ replacement: CardReplacementRequest; virtualCard?: Card }> {
    const card = db.cards.find((c) => c.id === params.cardId);
    if (!card) throw new Error('Card not found');

    // Deactivate / block the old compromised/damaged card
    card.status = 'cancelled';
    card.cardReplacementStatus = 'requested';
    db.persist('cards', db.cards);

    const replacement: CardReplacementRequest = {
      id: `rep-${Date.now()}`,
      cardId: card.id,
      customerId: card.customerId,
      reason: params.reason,
      deliveryAddress: params.deliveryAddress,
      instantVirtual: params.instantVirtual,
      requestDate: new Date().toISOString(),
      status: 'processing',
      trackingNumber: `RB-EXP-99${Math.floor(10000 + Math.random() * 90000)}US`,
    };

    db.cardReplacements.unshift(replacement);
    db.persist('cardReplacements', db.cardReplacements);

    let virtualCard: Card | undefined;
    if (params.instantVirtual) {
      virtualCard = await this.generateVirtualCard({
        customerId: card.customerId,
        accountId: card.accountId,
        label: `Instant Replacement for ${card.cardLabel || card.cardNumberMasked.slice(-4)}`,
        spendingLimitMonthly: card.spendingLimitMonthly,
        colorScheme: card.colorScheme,
        isBurner: false,
      });
    }

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: card.customerId,
      title: 'Card Replacement In Transit',
      message: `Replacement for card ending in ${card.cardNumberMasked.slice(-4)} has been dispatched to ${params.deliveryAddress}. Tracking: ${replacement.trackingNumber}`,
      type: 'security',
      priority: 'high',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/bank/cards`,
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return { replacement, virtualCard };
  }

  /**
   * Get Past Monthly Statements
   */
  async getCardStatements(cardId = 'crd-002'): Promise<CardStatement[]> {
    return db.cardStatements.filter((s) => s.cardId === cardId || cardId.includes('002'));
  }

  /**
   * Credit Card: Get EMI Plans
   */
  async getEMIOffers(cardId = 'crd-002'): Promise<EMIPlan[]> {
    return db.emiPlans.filter((p) => p.cardId === cardId || cardId.includes('002'));
  }

  /**
   * Credit Card: Get Eligible Transactions for EMI Conversion
   */
  async getEligibleTransactionsForEMI(_cardId = 'crd-002'): Promise<Transaction[]> {
    return db.transactions.filter(
      (tx) => tx.type === 'debit' && tx.amount >= 200 && tx.status === 'completed'
    );
  }

  /**
   * Convert Transaction to EMI
   */
  async convertTransactionToEMI(params: {
    cardId: string;
    transactionId: string;
    tenureMonths: 3 | 6 | 12 | 24;
    interestRate: number;
  }): Promise<EMIPlan> {
    const tx = db.transactions.find((t) => t.id === params.transactionId);
    const amount = tx ? tx.amount : 2500;
    const merchant = tx ? tx.counterpartyName : 'Retail Purchase';

    const interestTotal = (amount * (params.interestRate / 100) * params.tenureMonths) / 12;
    const totalRepayment = amount + interestTotal;
    const monthlyInstallment = parseFloat((totalRepayment / params.tenureMonths).toFixed(2));

    const newEmi: EMIPlan = {
      id: `emi-${Date.now()}`,
      cardId: params.cardId,
      transactionId: params.transactionId,
      merchantName: merchant,
      originalAmount: amount,
      tenureMonths: params.tenureMonths,
      interestRate: params.interestRate,
      monthlyInstallment,
      totalRepayment: parseFloat(totalRepayment.toFixed(2)),
      remainingMonths: params.tenureMonths,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    db.emiPlans.unshift(newEmi);
    db.persist('emiPlans', db.emiPlans);

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: 'cust-001',
      title: 'EMI Conversion Confirmed',
      message: `Converted $${amount.toLocaleString()} purchase at ${merchant} into ${params.tenureMonths} monthly payments of $${monthlyInstallment}.`,
      type: 'transaction',
      priority: 'normal',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/bank/cards/credit`,
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return newEmi;
  }

  /**
   * Credit Card: Pay Outstanding or Minimum Bill
   */
  async payCreditCardBill(params: {
    cardId: string;
    sourceAccountId: string;
    amount: number;
    note?: string;
  }): Promise<{ success: boolean; transactionId: string; newOutstanding: number }> {
    const card = db.cards.find((c) => c.id === params.cardId);
    if (!card) throw new Error('Credit card not found');

    const sourceAccount = db.accounts.find((a) => a.id === params.sourceAccountId);
    if (!sourceAccount) throw new Error('Payment source account not found');
    if (sourceAccount.balance < params.amount) {
      throw new Error(`Insufficient funds in ${sourceAccount.name}. Balance: $${sourceAccount.balance.toLocaleString()}`);
    }

    // Debit source account
    sourceAccount.balance -= params.amount;
    sourceAccount.availableBalance -= params.amount;
    db.persist('accounts', db.accounts);

    // Credit card balances
    card.outstandingBalance = Math.max(0, (card.outstandingBalance || 0) - params.amount);
    card.availableCredit = Math.min(card.creditLimit || 100000, (card.availableCredit || 0) + params.amount);
    card.spendingCurrentMonthly = Math.max(0, card.spendingCurrentMonthly - params.amount);
    if (card.minimumDue) {
      card.minimumDue = Math.max(0, card.minimumDue - params.amount);
    }
    db.persist('cards', db.cards);

    const txId = `tx-ccpay-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      referenceNumber: `RB-CCPAY-${Math.floor(100000 + Math.random() * 900000)}`,
      accountId: sourceAccount.id,
      customerId: card.customerId,
      type: 'debit',
      category: 'Credit Card Payment',
      amount: params.amount,
      currency: 'USD',
      description: `Payment to Royal Bank Private Card ending in ${card.cardNumberMasked.slice(-4)}${params.note ? ` - ${params.note}` : ''}`,
      status: 'completed',
      timestamp: new Date().toISOString(),
      counterpartyName: 'Royal Bank Card Services',
      counterpartyAccount: card.cardNumberMasked,
      fee: 0,
    };
    db.transactions.unshift(newTx);
    db.persist('transactions', db.transactions);

    return {
      success: true,
      transactionId: txId,
      newOutstanding: card.outstandingBalance,
    };
  }

  /**
   * Redeem Reward Points
   */
  async redeemRewards(
    cardId: string,
    points: number,
    rewardType: 'statement_credit' | 'cash_deposit' | 'airline_miles',
    targetAccountId?: string
  ): Promise<{ success: boolean; value: number; remainingPoints: number }> {
    const card = db.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');
    if ((card.rewardPoints || 0) < points) {
      throw new Error('Insufficient reward points balance');
    }

    const dollarValue = points * 0.01; // 100 pts = $1
    card.rewardPoints = (card.rewardPoints || 0) - points;

    if (rewardType === 'statement_credit') {
      card.outstandingBalance = Math.max(0, (card.outstandingBalance || 0) - dollarValue);
    } else if (rewardType === 'cash_deposit' && targetAccountId) {
      const acc = db.accounts.find((a) => a.id === targetAccountId);
      if (acc) {
        acc.balance += dollarValue;
        acc.availableBalance += dollarValue;
        db.persist('accounts', db.accounts);
      }
    }

    db.persist('cards', db.cards);

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: card.customerId,
      title: 'Rewards Redeemed Successfully',
      message: `Redeemed ${points.toLocaleString()} points for $${dollarValue.toFixed(2)} ${rewardType.replace('_', ' ')}.`,
      type: 'transaction',
      priority: 'normal',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/bank/cards/credit`,
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return {
      success: true,
      value: dollarValue,
      remainingPoints: card.rewardPoints,
    };
  }

  /**
   * Get Exclusive Card Offers
   */
  async getCardOffers(): Promise<CardOffer[]> {
    return db.cardOffers;
  }

  /**
   * Get Card Specific Transactions
   */
  async getCardTransactions(_cardId: string): Promise<Transaction[]> {
    return db.transactions.filter(
      (tx) => tx.category === 'Dining' || tx.category === 'Shopping' || tx.category === 'Travel' || tx.description.toLowerCase().includes('card')
    );
  }
}

export const cardService = new CardService();
