import { db } from '../mockApi/storage.ts';
import {
  MobileOperator,
  RechargePlan,
  RechargeRecord,
  Transaction,
  Notification,
} from '../types/index.ts';

class RechargeService {
  /**
   * Get all supported mobile operators
   */
  async getOperators(): Promise<MobileOperator[]> {
    return db.mobileOperators;
  }

  /**
   * Get specific operator by ID
   */
  async getOperatorById(id: string): Promise<MobileOperator | null> {
    const op = db.mobileOperators.find((o) => o.id === id);
    return op || null;
  }

  /**
   * Get plans, optionally filtered by operator or category
   */
  async getPlans(operatorId?: string, category?: string): Promise<RechargePlan[]> {
    let plans = db.rechargePlans;
    if (operatorId) {
      plans = plans.filter((p) => p.operatorId === operatorId);
    }
    if (category && category !== 'all') {
      plans = plans.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    return plans;
  }

  /**
   * Process Mobile Recharge
   */
  async processRecharge(params: {
    customerId: string;
    mobileNumber: string;
    operatorId: string;
    connectionType: 'prepaid' | 'postpaid';
    amount: number;
    planName?: string;
    sourceAccountId: string;
  }): Promise<{ record: RechargeRecord; transaction: Transaction }> {
    const operator = db.mobileOperators.find((o) => o.id === params.operatorId);
    if (!operator) throw new Error('Operator not found');

    const account = db.accounts.find((a) => a.id === params.sourceAccountId);
    if (!account) throw new Error('Payment source account not found');
    if (account.balance < params.amount) {
      throw new Error(`Insufficient funds in ${account.name}. Available: $${account.availableBalance.toLocaleString()}`);
    }

    // Deduct source account
    account.balance -= params.amount;
    account.availableBalance -= params.amount;
    db.persist('accounts', db.accounts);

    const ref = `RB-RCH-${Math.floor(100000 + Math.random() * 900000)}`;
    const opRef = `TELCO-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Transaction
    const newTx: Transaction = {
      id: `tx-rch-${Date.now()}`,
      referenceNumber: ref,
      accountId: account.id,
      customerId: params.customerId,
      type: 'debit',
      category: 'Mobile Recharge',
      amount: params.amount,
      currency: 'USD',
      description: `Mobile ${params.connectionType === 'postpaid' ? 'Postpaid Bill' : 'Recharge'} - ${params.mobileNumber} (${operator.name})${params.planName ? ` - ${params.planName}` : ''}`,
      status: 'completed',
      timestamp: new Date().toISOString(),
      counterpartyName: operator.name,
      counterpartyAccount: params.mobileNumber,
      fee: 0,
    };
    db.transactions.unshift(newTx);
    db.persist('transactions', db.transactions);

    // Create Recharge Record
    const record: RechargeRecord = {
      id: `rch-${Date.now()}`,
      customerId: params.customerId,
      mobileNumber: params.mobileNumber,
      operatorId: operator.id,
      operatorName: operator.name,
      connectionType: params.connectionType,
      amount: params.amount,
      planName: params.planName,
      currency: 'USD',
      sourceAccountId: account.id,
      paymentDate: new Date().toISOString(),
      transactionReference: ref,
      operatorRef: opRef,
      status: 'successful',
    };
    db.rechargeRecords.unshift(record);
    db.persist('rechargeRecords', db.rechargeRecords);

    // Notification
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: params.customerId,
      title: 'Mobile Recharge Successful',
      message: `$${params.amount.toFixed(2)} recharge to ${params.mobileNumber} (${operator.name}) completed instantly.`,
      type: 'transaction',
      priority: 'normal',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/bank/bills/recharge`,
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return { record, transaction: newTx };
  }

  /**
   * Get customer recharge history
   */
  async getRechargeHistory(customerId = 'cust-001'): Promise<RechargeRecord[]> {
    return db.rechargeRecords.filter((r) => r.customerId === customerId);
  }

  /**
   * Get quick saved / recent recharge numbers
   */
  async getRecentNumbers(customerId = 'cust-001'): Promise<Array<{ number: string; name: string; operatorId: string }>> {
    const history = await this.getRechargeHistory(customerId);
    const seen = new Set<string>();
    const recents: Array<{ number: string; name: string; operatorId: string }> = [
      { number: '+1 (917) 555-0192', name: 'My Primary (Alexander)', operatorId: 'op-att' },
      { number: '+1 (646) 555-8834', name: 'Evelyn Sterling', operatorId: 'op-verizon' },
      { number: '+1 (415) 555-7721', name: 'Sophie Chen (Family)', operatorId: 'op-tmobile' },
    ];

    history.forEach((h) => {
      if (!seen.has(h.mobileNumber) && !recents.some((r) => r.number === h.mobileNumber)) {
        seen.add(h.mobileNumber);
        recents.push({
          number: h.mobileNumber,
          name: h.mobileNumber,
          operatorId: h.operatorId,
        });
      }
    });

    return recents.slice(0, 5);
  }
}

export const rechargeService = new RechargeService();
