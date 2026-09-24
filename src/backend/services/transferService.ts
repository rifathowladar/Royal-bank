import { db } from '../mockApi/storage.ts';
import {
  Beneficiary,
  TransferRequest,
  TransferResult,
  MoneyRequest,
  SplitBill,
  Transaction,
  Notification,
  Account,
} from '../types/index.ts';

class TransferService {
  /**
   * Beneficiaries Management
   */
  async getBeneficiaries(customerId = 'cust-001'): Promise<Beneficiary[]> {
    return db.beneficiaries.filter((b) => b.customerId === customerId);
  }

  async addBeneficiary(data: Omit<Beneficiary, 'id'>): Promise<Beneficiary> {
    const newBen: Beneficiary = {
      ...data,
      id: `ben-${Date.now()}`,
    };
    db.beneficiaries.unshift(newBen);
    db.persist('beneficiaries', db.beneficiaries);
    return newBen;
  }

  async updateBeneficiary(id: string, updates: Partial<Beneficiary>): Promise<Beneficiary> {
    const idx = db.beneficiaries.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Beneficiary not found');
    db.beneficiaries[idx] = { ...db.beneficiaries[idx], ...updates };
    db.persist('beneficiaries', db.beneficiaries);
    return db.beneficiaries[idx];
  }

  async deleteBeneficiary(id: string): Promise<boolean> {
    db.beneficiaries = db.beneficiaries.filter((b) => b.id !== id);
    db.persist('beneficiaries', db.beneficiaries);
    return true;
  }

  async toggleFavorite(id: string): Promise<Beneficiary> {
    const ben = db.beneficiaries.find((b) => b.id === id);
    if (!ben) throw new Error('Beneficiary not found');
    ben.isFavorite = !ben.isFavorite;
    db.persist('beneficiaries', db.beneficiaries);
    return ben;
  }

  /**
   * Real-time Account Verification (Clearing House Simulator)
   */
  async verifyAccount(
    accountNumber: string,
    bankNameOrRouting: string,
    type: 'internal' | 'domestic' | 'international_swift' | 'npsb' | 'beftn' | 'rtgs'
  ): Promise<{ verified: boolean; accountTitle: string; branch: string; routingValid: boolean }> {
    // Artificial latency for realism
    await new Promise((r) => setTimeout(r, 600));

    // Internal check
    if (type === 'internal' || bankNameOrRouting.toLowerCase().includes('royal')) {
      const cleanAcc = accountNumber.replace(/\D/g, '');
      const match = db.accounts.find(
        (a) => a.accountNumber.replace(/\D/g, '').includes(cleanAcc) || cleanAcc.includes(a.accountNumber.replace(/\D/g, ''))
      );
      if (match) {
        return {
          verified: true,
          accountTitle: match.accountHolder,
          branch: match.branch,
          routingValid: true,
        };
      }
    }

    // Secondary known customers for internal transfer
    if (accountNumber.includes('7719') || accountNumber.includes('9981')) {
      return { verified: true, accountTitle: 'Elena Rostova', branch: 'London Mayfair Global Pavilion', routingValid: true };
    }
    if (accountNumber.includes('3824') || accountNumber.includes('1192')) {
      return { verified: true, accountTitle: 'Marcus Vance', branch: 'San Francisco Financial Center', routingValid: true };
    }

    // Default verified name based on inputs
    return {
      verified: true,
      accountTitle: 'Institutional Verified Counterparty',
      branch: 'Central Clearing Exchange',
      routingValid: true,
    };
  }

  /**
   * Search Royal Bank Customer by ID, Phone, Email, or Account Number
   */
  async searchRoyalBankCustomer(query: string): Promise<{
    customer: { id: string; name: string; customerNumber: string; tier: string };
    account: Account;
  } | null> {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    // Search customer
    const foundCustomer = db.customers.find(
      (c) =>
        c.id.toLowerCase() === q ||
        c.customerNumber.toLowerCase() === q ||
        c.email.toLowerCase() === q ||
        c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
    );

    if (foundCustomer) {
      const acc = db.accounts.find((a) => a.customerId === foundCustomer.id) || {
        id: `acc-dyn-${foundCustomer.id}`,
        customerId: foundCustomer.id,
        accountNumber: `${foundCustomer.customerNumber}-01`,
        iban: `US99RBANK${foundCustomer.customerNumber}`,
        swiftBic: 'ROBANUS33XXX',
        currency: 'USD',
        name: 'Sovereign Depository',
        type: 'checking',
        balance: 150000,
        availableBalance: 150000,
        ledgerBalance: 150000,
        status: 'active',
        openedAt: new Date().toISOString(),
        interestRateAnnual: 1.5,
        branch: 'Wall Street Flagship',
        accountHolder: `${foundCustomer.firstName} ${foundCustomer.lastName}`,
      };
      return {
        customer: {
          id: foundCustomer.id,
          name: `${foundCustomer.firstName} ${foundCustomer.lastName}`,
          customerNumber: foundCustomer.customerNumber,
          tier: foundCustomer.tier,
        },
        account: acc,
      };
    }

    // Search by account number
    const foundAccount = db.accounts.find((a) =>
      a.accountNumber.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    );
    if (foundAccount) {
      const cust = db.customers.find((c) => c.id === foundAccount.customerId);
      return {
        customer: {
          id: foundAccount.customerId,
          name: foundAccount.accountHolder,
          customerNumber: cust?.customerNumber || 'RB-EXT-01',
          tier: cust?.tier || 'Premier Client',
        },
        account: foundAccount,
      };
    }

    return null;
  }

  /**
   * Execute Money Transfer (Own, Royal Bank, Other Bank, NPSB, BEFTN, RTGS, Scheduled, Recurring)
   */
  async executeTransfer(payload: TransferRequest): Promise<TransferResult> {
    const sourceAcc = db.accounts.find((a) => a.id === payload.sourceAccountId);
    if (!sourceAcc) {
      throw new Error('Funding source account not found.');
    }

    const totalDebit = payload.amount + (payload.fee || 0);
    if (sourceAcc.availableBalance < totalDebit) {
      throw new Error(
        `Insufficient funds. Available: ${sourceAcc.currency} ${sourceAcc.availableBalance.toLocaleString()}, Required: ${sourceAcc.currency} ${totalDebit.toLocaleString()}`
      );
    }

    const now = new Date().toISOString();
    const referenceNumber = `RB-TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const txId = `tx_${Date.now()}`;

    // 1. Debit Source Account
    sourceAcc.balance -= totalDebit;
    sourceAcc.availableBalance -= totalDebit;
    sourceAcc.ledgerBalance -= totalDebit;

    // 2. Create Sender Debit Transaction
    const senderTx: Transaction = {
      id: txId,
      accountId: sourceAcc.id,
      customerId: sourceAcc.customerId,
      referenceNumber,
      type: 'transfer_out',
      category: 'Transfer',
      amount: -payload.amount,
      currency: sourceAcc.currency,
      status: payload.scheduledDate ? 'pending' : 'completed',
      timestamp: now,
      description: payload.referenceNote || `Transfer to ${payload.recipientName}`,
      counterpartyName: payload.recipientName,
      counterpartyAccount: payload.recipientAccount,
      sender: sourceAcc.accountHolder,
      receiver: payload.recipientName,
      senderAccount: sourceAcc.accountNumber,
      receiverAccount: payload.recipientAccount,
      fee: payload.fee || 0,
      paymentMethod:
        payload.transferType === 'npsb'
          ? 'NPSB Instant Clearing'
          : payload.transferType === 'beftn'
          ? 'BEFTN Electronic Clearing'
          : payload.transferType === 'rtgs'
          ? 'RTGS Real-Time Settlement'
          : payload.transferType === 'own_account'
          ? 'Internal Book Transfer'
          : 'High-Value Wire',
    };
    db.transactions.unshift(senderTx);

    // 3. Handle Internal Credit (Own Account or Royal Bank Customer Transfer)
    let recipientBank = payload.recipientBank || 'Royal Bank';
    if (payload.transferType === 'own_account' && payload.targetAccountId) {
      const targetAcc = db.accounts.find((a) => a.id === payload.targetAccountId);
      if (targetAcc) {
        targetAcc.balance += payload.amount;
        targetAcc.availableBalance += payload.amount;
        targetAcc.ledgerBalance += payload.amount;
        recipientBank = 'Royal Bank (Internal Book)';

        // Receiver Transaction
        db.transactions.unshift({
          id: `tx_in_${Date.now()}`,
          accountId: targetAcc.id,
          customerId: targetAcc.customerId,
          referenceNumber: `${referenceNumber}-CR`,
          type: 'transfer_in',
          category: 'Transfer',
          amount: payload.amount,
          currency: targetAcc.currency,
          status: 'completed',
          timestamp: now,
          description: `Internal Transfer from ${sourceAcc.customNickName || sourceAcc.name}`,
          counterpartyName: sourceAcc.accountHolder,
          counterpartyAccount: sourceAcc.accountNumber,
          sender: sourceAcc.accountHolder,
          receiver: targetAcc.accountHolder,
          fee: 0,
          paymentMethod: 'Internal Book Transfer',
        });
      }
    } else if (payload.transferType === 'royal_bank') {
      // Find recipient account
      const cleanTargetAcc = payload.recipientAccount.replace(/\D/g, '');
      const targetAcc = db.accounts.find(
        (a) =>
          a.accountNumber.replace(/\D/g, '') === cleanTargetAcc ||
          (payload.recipientCustomerId && a.customerId === payload.recipientCustomerId)
      );

      if (targetAcc) {
        targetAcc.balance += payload.amount;
        targetAcc.availableBalance += payload.amount;
        targetAcc.ledgerBalance += payload.amount;

        // Credit Transaction for Recipient
        db.transactions.unshift({
          id: `tx_rec_${Date.now()}`,
          accountId: targetAcc.id,
          customerId: targetAcc.customerId,
          referenceNumber: `${referenceNumber}-CR`,
          type: 'transfer_in',
          category: 'Transfer',
          amount: payload.amount,
          currency: targetAcc.currency,
          status: 'completed',
          timestamp: now,
          description: payload.referenceNote || `Payment from ${sourceAcc.accountHolder}`,
          counterpartyName: sourceAcc.accountHolder,
          counterpartyAccount: sourceAcc.accountNumber,
          sender: sourceAcc.accountHolder,
          receiver: targetAcc.accountHolder,
          fee: 0,
          paymentMethod: 'Royal Bank Instant Transfer',
        });

        // Add Notification for Recipient
        db.notifications.unshift({
          id: `notif_${Date.now()}_rec`,
          userId: targetAcc.customerId,
          title: 'Deposit Received',
          message: `Received ${targetAcc.currency} ${payload.amount.toLocaleString()} from ${sourceAcc.accountHolder}. Ref: ${referenceNumber}`,
          type: 'transaction',
          priority: 'high',
          isRead: false,
          createdAt: now,
        });
      }
    }

    // 4. Create Sender Notification
    db.notifications.unshift({
      id: `notif_${Date.now()}_snd`,
      userId: sourceAcc.customerId,
      title: 'Transfer Executed',
      message: `Transferred ${sourceAcc.currency} ${payload.amount.toLocaleString()} to ${payload.recipientName}. Ref: ${referenceNumber}`,
      type: 'transaction',
      priority: 'normal',
      isRead: false,
      createdAt: now,
    });

    // 5. Persist State Changes
    db.persist('accounts', db.accounts);
    db.persist('transactions', db.transactions);
    db.persist('notifications', db.notifications);

    return {
      success: true,
      transactionId: txId,
      referenceNumber,
      timestamp: now,
      amount: payload.amount,
      fee: payload.fee || 0,
      currency: sourceAcc.currency,
      sourceAccount: sourceAcc,
      recipientName: payload.recipientName,
      recipientAccount: payload.recipientAccount,
      recipientBank,
      transferType: payload.transferType,
      referenceNote: payload.referenceNote,
      status: payload.scheduledDate ? 'scheduled' : 'completed',
    };
  }

  /**
   * Money Request
   */
  async createMoneyRequest(data: {
    requesterId: string;
    requesterName: string;
    requesterAccount: string;
    payerName?: string;
    payerEmailOrPhone?: string;
    amount: number;
    currency: string;
    note: string;
  }): Promise<MoneyRequest> {
    const referenceCode = `REQ-${Date.now().toString(36).toUpperCase()}`;
    const qrPayload = `royalbank://request?code=${referenceCode}&amount=${data.amount}&to=${encodeURIComponent(
      data.requesterName
    )}&acc=${data.requesterAccount}`;

    const req: MoneyRequest = {
      id: `req-${Date.now()}`,
      ...data,
      referenceCode,
      qrPayload,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const storedRequests: MoneyRequest[] = JSON.parse(
      localStorage.getItem('royal_bank_money_requests') || '[]'
    );
    storedRequests.unshift(req);
    localStorage.setItem('royal_bank_money_requests', JSON.stringify(storedRequests));

    return req;
  }

  async getMoneyRequests(customerId = 'cust-001'): Promise<MoneyRequest[]> {
    const storedRequests: MoneyRequest[] = JSON.parse(
      localStorage.getItem('royal_bank_money_requests') || '[]'
    );
    return storedRequests.filter((r) => r.requesterId === customerId);
  }

  /**
   * Split Bill
   */
  async createSplitBill(data: {
    creatorId: string;
    title: string;
    totalAmount: number;
    currency: string;
    participants: { name: string; emailOrPhone?: string; shareAmount: number }[];
  }): Promise<SplitBill> {
    const split: SplitBill = {
      id: `split-${Date.now()}`,
      creatorId: data.creatorId,
      title: data.title,
      totalAmount: data.totalAmount,
      currency: data.currency,
      participants: data.participants.map((p) => ({
        ...p,
        status: p.name.includes('Alexander') ? 'paid' : 'pending',
        paidAt: p.name.includes('Alexander') ? new Date().toISOString() : undefined,
      })),
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    const stored: SplitBill[] = JSON.parse(
      localStorage.getItem('royal_bank_split_bills') || '[]'
    );
    stored.unshift(split);
    localStorage.setItem('royal_bank_split_bills', JSON.stringify(stored));

    return split;
  }

  async getSplitBills(creatorId = 'cust-001'): Promise<SplitBill[]> {
    const stored: SplitBill[] = JSON.parse(
      localStorage.getItem('royal_bank_split_bills') || '[]'
    );
    return stored.filter((s) => s.creatorId === creatorId);
  }
}

export const transferService = new TransferService();
