import { db } from '../mockApi/storage.ts';
import {
  Biller,
  Bill,
  FetchedBill,
  SavedBiller,
  BillPaymentRecord,
  BillCategory,
  Transaction,
  Notification,
} from '../types/index.ts';

class BillService {
  /**
   * Get all billers, optionally filtered by category
   */
  async getBillers(category?: BillCategory): Promise<Biller[]> {
    if (!category) return db.billers;
    return db.billers.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Get biller by ID
   */
  async getBillerById(id: string): Promise<Biller | null> {
    const biller = db.billers.find((b) => b.id === id);
    return biller || null;
  }

  /**
   * Fetch Demo Bill (Simulates querying utility company database)
   */
  async fetchDemoBill(billerId: string, customerNumber: string): Promise<FetchedBill> {
    const biller = db.billers.find((b) => b.id === billerId);
    if (!biller) throw new Error('Biller not found in directory');

    // Deterministic yet realistic bill calculation based on customerNumber
    const hash = customerNumber.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const baseAmounts: Record<string, number> = {
      Electricity: 280 + (hash % 240),
      Gas: 95 + (hash % 110),
      Water: 65 + (hash % 50),
      Internet: 89.99 + (hash % 60),
      Telephone: 120 + (hash % 90),
      Education: 3500 + (hash % 2000),
      Insurance: 450 + (hash % 350),
      Government: 1250 + (hash % 1500),
      'Credit card': 850 + (hash % 1200),
      Subscription: 49.99 + (hash % 150),
    };

    const baseAmount = baseAmounts[biller.category] || 150.0;
    const surcharge = parseFloat((baseAmount * 0.045).toFixed(2));
    const lateFee = hash % 5 === 0 ? 15.0 : 0.0; // 20% chance of small late penalty
    const totalPayable = parseFloat((baseAmount + surcharge + lateFee).toFixed(2));

    const today = new Date();
    const issueDate = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const fetched: FetchedBill = {
      billId: `bill-fetch-${Date.now()}`,
      billerId: biller.id,
      billerName: biller.name,
      category: biller.category,
      accountReference: customerNumber,
      consumerName: 'ALEXANDER STERLING',
      billingPeriod: `${new Date(today.getFullYear(), today.getMonth() - 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(today.getFullYear(), today.getMonth(), 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      issueDate,
      dueDate,
      baseAmount: parseFloat(baseAmount.toFixed(2)),
      surcharge,
      lateFee,
      totalPayable,
      currency: 'USD',
      status: lateFee > 0 ? 'overdue' : 'unpaid',
    };

    return fetched;
  }

  /**
   * Pay Bill
   */
  async payBill(params: {
    customerId: string;
    billerId: string;
    customerNumber: string;
    amount: number;
    sourceAccountId: string;
    note?: string;
    saveBiller?: boolean;
    billerNickname?: string;
    autoPayEnabled?: boolean;
    reminderEnabled?: boolean;
  }): Promise<{ record: BillPaymentRecord; transaction: Transaction }> {
    const biller = db.billers.find((b) => b.id === params.billerId);
    if (!biller) throw new Error('Biller not found');

    const account = db.accounts.find((a) => a.id === params.sourceAccountId);
    if (!account) throw new Error('Source account not found');

    const totalToDebit = params.amount + biller.fee;
    if (account.balance < totalToDebit) {
      throw new Error(`Insufficient funds in ${account.name}. Available: $${account.availableBalance.toLocaleString()}`);
    }

    // Deduct balance
    account.balance -= totalToDebit;
    account.availableBalance -= totalToDebit;
    db.persist('accounts', db.accounts);

    // Create Transaction
    const refCode = `RB-BILL-${Math.floor(100000 + Math.random() * 900000)}`;
    const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      referenceNumber: refCode,
      accountId: account.id,
      customerId: params.customerId,
      type: 'debit',
      category: 'Bills & Utilities',
      amount: totalToDebit,
      currency: 'USD',
      description: `Bill Payment to ${biller.name} (${params.customerNumber})${params.note ? ` - ${params.note}` : ''}`,
      status: 'completed',
      timestamp: new Date().toISOString(),
      counterpartyName: biller.name,
      counterpartyAccount: params.customerNumber,
      fee: biller.fee,
    };
    db.transactions.unshift(newTx);
    db.persist('transactions', db.transactions);

    // Create Payment Record
    const record: BillPaymentRecord = {
      id: `bpay-${Date.now()}`,
      customerId: params.customerId,
      billerId: biller.id,
      billerName: biller.name,
      category: biller.category,
      accountReference: params.customerNumber,
      consumerName: 'Alexander Sterling',
      amount: params.amount,
      fee: biller.fee,
      totalPaid: totalToDebit,
      currency: 'USD',
      sourceAccountId: account.id,
      sourceAccountNumber: account.accountNumber,
      status: 'completed',
      paymentDate: new Date().toISOString(),
      referenceNumber: refCode,
      authCode,
      note: params.note,
      autoDebit: params.autoPayEnabled,
    };
    db.billPaymentRecords.unshift(record);
    db.persist('billPaymentRecords', db.billPaymentRecords);

    // Update or clear matching pending bill in db.bills
    const existingBill = db.bills.find(
      (b) => b.accountReference === params.customerNumber || b.billerName.toLowerCase().includes(biller.name.toLowerCase().slice(0, 8))
    );
    if (existingBill) {
      existingBill.status = 'paid';
      db.persist('bills', db.bills);
    }

    // Save Biller if requested or updated
    if (params.saveBiller) {
      const existingSaved = db.savedBillers.find(
        (sb) => sb.billerId === biller.id && sb.accountReference === params.customerNumber
      );
      if (existingSaved) {
        existingSaved.nickName = params.billerNickname || existingSaved.nickName;
        existingSaved.lastPaidAmount = params.amount;
        existingSaved.lastPaidDate = new Date().toISOString().split('T')[0];
        if (params.autoPayEnabled !== undefined) existingSaved.autoPayEnabled = params.autoPayEnabled;
        if (params.reminderEnabled !== undefined) existingSaved.reminderEnabled = params.reminderEnabled;
      } else {
        const newSaved: SavedBiller = {
          id: `sb-${Date.now()}`,
          customerId: params.customerId,
          billerId: biller.id,
          billerName: biller.name,
          category: biller.category,
          accountReference: params.customerNumber,
          nickName: params.billerNickname || `${biller.name} (${params.customerNumber.slice(-4)})`,
          autoPayEnabled: !!params.autoPayEnabled,
          autoPayAccountId: params.autoPayEnabled ? account.id : undefined,
          reminderEnabled: params.reminderEnabled ?? true,
          reminderDaysBefore: 3,
          lastPaidAmount: params.amount,
          lastPaidDate: new Date().toISOString().split('T')[0],
        };
        db.savedBillers.push(newSaved);
      }
      db.persist('savedBillers', db.savedBillers);
    }

    // Push notification
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: params.customerId,
      title: 'Bill Payment Executed',
      message: `Successfully settled $${params.amount.toLocaleString()} to ${biller.name}. Auth Code: ${authCode}`,
      type: 'transaction',
      priority: 'normal',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/bank/bills/history`,
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return { record, transaction: newTx };
  }

  /**
   * Get Saved Billers
   */
  async getSavedBillers(customerId = 'cust-001'): Promise<SavedBiller[]> {
    return db.savedBillers.filter((sb) => sb.customerId === customerId);
  }

  /**
   * Add New Saved Biller
   */
  async saveBiller(params: {
    customerId: string;
    billerId: string;
    customerNumber: string;
    nickName: string;
    autoPayEnabled?: boolean;
    autoPayAccountId?: string;
    reminderEnabled?: boolean;
    reminderDaysBefore?: number;
  }): Promise<SavedBiller> {
    const biller = db.billers.find((b) => b.id === params.billerId);
    if (!biller) throw new Error('Biller not found');

    const newSaved: SavedBiller = {
      id: `sb-${Date.now()}`,
      customerId: params.customerId,
      billerId: biller.id,
      billerName: biller.name,
      category: biller.category,
      accountReference: params.customerNumber,
      nickName: params.nickName,
      autoPayEnabled: !!params.autoPayEnabled,
      autoPayAccountId: params.autoPayAccountId,
      reminderEnabled: params.reminderEnabled ?? true,
      reminderDaysBefore: params.reminderDaysBefore || 3,
    };

    db.savedBillers.push(newSaved);
    db.persist('savedBillers', db.savedBillers);
    return newSaved;
  }

  /**
   * Update Saved Biller
   */
  async updateSavedBiller(id: string, updates: Partial<SavedBiller>): Promise<SavedBiller> {
    const idx = db.savedBillers.findIndex((sb) => sb.id === id);
    if (idx === -1) throw new Error('Saved biller not found');

    db.savedBillers[idx] = { ...db.savedBillers[idx], ...updates };
    db.persist('savedBillers', db.savedBillers);
    return db.savedBillers[idx];
  }

  /**
   * Delete Saved Biller
   */
  async deleteSavedBiller(id: string): Promise<boolean> {
    db.savedBillers = db.savedBillers.filter((sb) => sb.id !== id);
    db.persist('savedBillers', db.savedBillers);
    return true;
  }

  /**
   * Toggle Auto-Pay on Saved Biller
   */
  async toggleAutoPay(id: string, enabled: boolean, accountId?: string): Promise<SavedBiller> {
    const sb = db.savedBillers.find((b) => b.id === id);
    if (!sb) throw new Error('Saved biller not found');

    sb.autoPayEnabled = enabled;
    if (accountId) sb.autoPayAccountId = accountId;
    db.persist('savedBillers', db.savedBillers);
    return sb;
  }

  /**
   * Toggle Reminder on Saved Biller
   */
  async toggleReminder(id: string, enabled: boolean, daysBefore = 3): Promise<SavedBiller> {
    const sb = db.savedBillers.find((b) => b.id === id);
    if (!sb) throw new Error('Saved biller not found');

    sb.reminderEnabled = enabled;
    sb.reminderDaysBefore = daysBefore;
    db.persist('savedBillers', db.savedBillers);
    return sb;
  }

  /**
   * Get Bill Payment History
   */
  async getBillHistory(customerId = 'cust-001'): Promise<BillPaymentRecord[]> {
    return db.billPaymentRecords.filter((r) => r.customerId === customerId);
  }

  /**
   * Get Pending / Unpaid Utility Bills
   */
  async getPendingBills(customerId = 'cust-001'): Promise<Bill[]> {
    return db.bills.filter((b) => b.customerId === customerId);
  }
}

export const billService = new BillService();
