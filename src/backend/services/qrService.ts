import { db } from '../mockApi/storage.ts';
import {
  QRPayment,
  QRPayloadData,
  Transaction,
  Account,
} from '../types/index.ts';

export interface DemoQRCodeItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'customer' | 'merchant';
  recipientName: string;
  accountOrCode: string;
  avatarText: string;
  currency: string;
  suggestedAmount?: number;
  qrPayload: string;
  description: string;
}

class QRService {
  /**
   * Generate Customer QR Payload
   */
  generateCustomerQR(params: {
    customerId: string;
    accountId: string;
    amount?: number;
    currency?: string;
    note?: string;
  }): { payload: string; qrData: QRPayloadData } {
    const customer = db.customers.find((c) => c.id === params.customerId);
    const account = db.accounts.find((a) => a.id === params.accountId);

    const name = customer ? `${customer.firstName} ${customer.lastName}` : 'Alexander Sterling';
    const accNumber = account ? account.accountNumber : '4820-9901-2814';
    const currency = params.currency || account?.currency || 'USD';

    const qrData: QRPayloadData = {
      type: 'royal_bank_customer',
      customerId: params.customerId,
      name,
      accountNumber: accNumber,
      currency,
      amount: params.amount,
      note: params.note,
      bankName: 'Royal Bank',
    };

    // Standard readable URI scheme
    const urlParams = new URLSearchParams();
    urlParams.set('type', 'customer');
    urlParams.set('cid', params.customerId);
    urlParams.set('name', name);
    urlParams.set('acc', accNumber);
    urlParams.set('cur', currency);
    if (params.amount) urlParams.set('amt', params.amount.toString());
    if (params.note) urlParams.set('note', params.note);

    const payload = `royalbank://pay?${urlParams.toString()}`;
    return { payload, qrData };
  }

  /**
   * Decode and parse any QR string
   */
  scanQR(rawPayload: string): QRPayloadData {
    try {
      // 1. Try URL parsing if royalbank:// scheme
      if (rawPayload.startsWith('royalbank://')) {
        const urlStr = rawPayload.replace('royalbank://pay?', 'https://dummy.bank/?');
        const url = new URL(urlStr);
        const pType = url.searchParams.get('type') || 'customer';

        if (pType === 'merchant') {
          return {
            type: 'royal_bank_merchant',
            merchantId: url.searchParams.get('mid') || 'merch-001',
            name: url.searchParams.get('name') || 'Registered Merchant',
            accountNumber: url.searchParams.get('acc') || 'RB-MCH-7781',
            currency: url.searchParams.get('cur') || 'USD',
            amount: url.searchParams.get('amt') ? parseFloat(url.searchParams.get('amt')!) : undefined,
            note: url.searchParams.get('note') || undefined,
            bankName: 'Royal Bank Merchant Network',
          };
        }

        return {
          type: 'royal_bank_customer',
          customerId: url.searchParams.get('cid') || undefined,
          name: url.searchParams.get('name') || 'Royal Bank Customer',
          accountNumber: url.searchParams.get('acc') || '4820-9901-0000',
          currency: url.searchParams.get('cur') || 'USD',
          amount: url.searchParams.get('amt') ? parseFloat(url.searchParams.get('amt')!) : undefined,
          note: url.searchParams.get('note') || undefined,
          bankName: 'Royal Bank',
        };
      }

      // 2. Try JSON payload
      if (rawPayload.startsWith('{')) {
        const parsed = JSON.parse(rawPayload);
        return {
          type: parsed.type || 'royal_bank_customer',
          customerId: parsed.customerId,
          merchantId: parsed.merchantId,
          name: parsed.name || 'Verified Recipient',
          accountNumber: parsed.accountNumber || '4820-0000-0000',
          currency: parsed.currency || 'USD',
          amount: parsed.amount,
          note: parsed.note,
          bankName: parsed.bankName || 'Royal Bank',
        };
      }
    } catch (e) {
      console.warn('QR parse fallback to raw string', e);
    }

    // Default fallback
    return {
      type: 'royal_bank_customer',
      name: 'Counterparty QR Recipient',
      accountNumber: '4820-9901-1122',
      currency: 'USD',
      bankName: 'Royal Bank',
    };
  }

  /**
   * Get Verified Recipient profile from QR Payload
   */
  async getQRRecipient(qrPayload: string): Promise<{
    name: string;
    accountNumber: string;
    currency: string;
    suggestedAmount?: number;
    note?: string;
    isMerchant: boolean;
    tier: string;
    branch: string;
    verified: boolean;
    customerId?: string;
  }> {
    const data = this.scanQR(qrPayload);

    // If matches known customer
    let tier = 'Private Client';
    let branch = 'Wall Street Flagship';

    if (data.customerId) {
      const cust = db.customers.find((c) => c.id === data.customerId);
      if (cust) {
        tier = cust.tier;
        const acc = db.accounts.find((a) => a.customerId === cust.id);
        if (acc) branch = acc.branch;
      }
    } else if (data.name.toLowerCase().includes('marcus')) {
      tier = 'Premier Client';
      branch = 'San Francisco Financial Center';
    } else if (data.name.toLowerCase().includes('elena')) {
      tier = 'Royal Sovereign';
      branch = 'London Mayfair Global Pavilion';
    }

    return {
      name: data.name,
      accountNumber: data.accountNumber,
      currency: data.currency || 'USD',
      suggestedAmount: data.amount,
      note: data.note,
      isMerchant: data.type === 'royal_bank_merchant',
      tier,
      branch,
      verified: true,
      customerId: data.customerId,
    };
  }

  /**
   * Confirm and Execute Instant QR Payment:
   * 1. Decreases sender (Customer A) balance
   * 2. Increases recipient (Customer B) balance
   * 3. Creates debit transaction for sender
   * 4. Creates credit transaction for recipient
   * 5. Updates QR payment history
   * 6. Creates notifications for both parties
   */
  async confirmQRPayment(params: {
    senderCustomerId: string;
    senderAccountId: string;
    amount: number;
    recipientName: string;
    recipientAccountNumber: string;
    recipientCustomerId?: string;
    isMerchant?: boolean;
    note?: string;
  }): Promise<{
    payment: QRPayment;
    senderTransaction: Transaction;
    referenceNumber: string;
    timestamp: string;
  }> {
    const senderAcc = db.accounts.find((a) => a.id === params.senderAccountId);
    if (!senderAcc) throw new Error('Sender source account not found.');

    if (senderAcc.availableBalance < params.amount) {
      throw new Error(
        `Insufficient balance. Available: ${senderAcc.currency} ${senderAcc.availableBalance.toLocaleString()}, Required: ${senderAcc.currency} ${params.amount.toLocaleString()}`
      );
    }

    const timestamp = new Date().toISOString();
    const referenceNumber = `QR-PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const paymentId = `qr_${Date.now()}`;

    // 1. Debit Sender Account
    senderAcc.balance -= params.amount;
    senderAcc.availableBalance -= params.amount;
    senderAcc.ledgerBalance -= params.amount;

    // 2. Locate Recipient Account & Credit
    const cleanRecAcc = params.recipientAccountNumber.replace(/\D/g, '');
    let recipientAcc = db.accounts.find(
      (a) =>
        a.accountNumber.replace(/\D/g, '') === cleanRecAcc ||
        (params.recipientCustomerId && a.customerId === params.recipientCustomerId)
    );

    // If no direct account exists in mock DB for recipient, create or look up dynamically
    if (!recipientAcc && params.recipientCustomerId) {
      recipientAcc = {
        id: `acc_rec_${params.recipientCustomerId}`,
        customerId: params.recipientCustomerId,
        accountNumber: params.recipientAccountNumber,
        iban: `US89RBANK${cleanRecAcc}`,
        swiftBic: 'ROBANUS33XXX',
        currency: senderAcc.currency,
        name: `${params.recipientName} Operating Depot`,
        type: 'checking',
        balance: 10000,
        availableBalance: 10000,
        ledgerBalance: 10000,
        status: 'active',
        openedAt: timestamp,
        branch: 'Wall Street Flagship',
        accountHolder: params.recipientName,
      };
      db.accounts.push(recipientAcc);
    }

    if (recipientAcc) {
      // Credit Recipient Account
      recipientAcc.balance += params.amount;
      recipientAcc.availableBalance += params.amount;
      recipientAcc.ledgerBalance += params.amount;

      // Create Recipient Transaction (Credit)
      db.transactions.unshift({
        id: `tx_qr_cr_${Date.now()}`,
        accountId: recipientAcc.id,
        customerId: recipientAcc.customerId,
        referenceNumber: `${referenceNumber}-CR`,
        type: 'qr_payment',
        category: 'Transfer',
        amount: params.amount,
        currency: recipientAcc.currency,
        status: 'completed',
        timestamp,
        description: params.note || `QR Payment received from ${senderAcc.accountHolder}`,
        counterpartyName: senderAcc.accountHolder,
        counterpartyAccount: senderAcc.accountNumber,
        sender: senderAcc.accountHolder,
        receiver: params.recipientName,
        paymentMethod: 'EMVCo QR',
        fee: 0,
      });

      // Recipient Notification
      db.notifications.unshift({
        id: `notif_qr_rec_${Date.now()}`,
        userId: recipientAcc.customerId,
        title: 'QR Payment Received',
        message: `Received ${recipientAcc.currency} ${params.amount.toLocaleString()} from ${senderAcc.accountHolder} via QR. Ref: ${referenceNumber}`,
        type: 'transaction',
        priority: 'high',
        isRead: false,
        createdAt: timestamp,
      });
    }

    // 3. Create Sender Transaction (Debit)
    const senderTx: Transaction = {
      id: `tx_qr_db_${Date.now()}`,
      accountId: senderAcc.id,
      customerId: params.senderCustomerId,
      referenceNumber,
      type: 'qr_payment',
      category: params.isMerchant ? 'Shopping' : 'Transfer',
      amount: -params.amount,
      currency: senderAcc.currency,
      status: 'completed',
      timestamp,
      description: params.note || `QR Payment to ${params.recipientName}`,
      counterpartyName: params.recipientName,
      counterpartyAccount: params.recipientAccountNumber,
      sender: senderAcc.accountHolder,
      receiver: params.recipientName,
      paymentMethod: 'EMVCo QR',
      fee: 0,
    };
    db.transactions.unshift(senderTx);

    // 4. Update QR Payment History
    const paymentRecord: QRPayment = {
      id: paymentId,
      paymentCode: referenceNumber,
      recipientType: params.isMerchant ? 'merchant' : 'customer',
      recipientCustomerId: params.recipientCustomerId,
      recipientName: params.recipientName,
      recipientAccountNumber: params.recipientAccountNumber,
      customerId: params.senderCustomerId,
      senderName: senderAcc.accountHolder,
      accountId: senderAcc.id,
      amount: params.amount,
      currency: senderAcc.currency,
      status: 'completed',
      timestamp,
      reference: referenceNumber,
      note: params.note,
    };
    db.qrPayments.unshift(paymentRecord);

    // 5. Sender Notification
    db.notifications.unshift({
      id: `notif_qr_snd_${Date.now()}`,
      userId: params.senderCustomerId,
      title: 'QR Payment Sent',
      message: `Successfully transferred ${senderAcc.currency} ${params.amount.toLocaleString()} to ${params.recipientName}. Ref: ${referenceNumber}`,
      type: 'transaction',
      priority: 'normal',
      isRead: false,
      createdAt: timestamp,
    });

    // 6. Persist All Changes to DB
    db.persist('accounts', db.accounts);
    db.persist('transactions', db.transactions);
    db.persist('qrPayments', db.qrPayments);
    db.persist('notifications', db.notifications);

    return {
      payment: paymentRecord,
      senderTransaction: senderTx,
      referenceNumber,
      timestamp,
    };
  }

  /**
   * Get QR Payment History for Customer
   */
  async getQRHistory(customerId = 'cust-001'): Promise<QRPayment[]> {
    return db.qrPayments.filter(
      (q) => q.customerId === customerId || q.recipientCustomerId === customerId
    );
  }

  /**
   * Pre-configured demo QR codes for instant 1-click scanning & testing
   */
  getDemoQRCodes(): DemoQRCodeItem[] {
    return [
      {
        id: 'demo-qr-1',
        title: 'Marcus Vance',
        subtitle: 'San Francisco Tech Founder',
        type: 'customer',
        recipientName: 'Marcus Vance',
        accountOrCode: '3824-5018-1192',
        avatarText: 'MV',
        currency: 'USD',
        suggestedAmount: 1000,
        qrPayload:
          'royalbank://pay?type=customer&cid=cust-003&name=Marcus+Vance&acc=3824-5018-1192&cur=USD&amt=1000&note=Seed+Angel+Syndicate',
        description: 'Instant transfer to Marcus Vance ($1,000 preset)',
      },
      {
        id: 'demo-qr-2',
        title: 'Elena Rostova',
        subtitle: 'London Sovereign Private Client',
        type: 'customer',
        recipientName: 'Elena Rostova',
        accountOrCode: '7719-2041-9981',
        avatarText: 'ER',
        currency: 'USD',
        suggestedAmount: 2500,
        qrPayload:
          'royalbank://pay?type=customer&cid=cust-002&name=Elena+Rostova&acc=7719-2041-9981&cur=USD&amt=2500&note=Mayfair+Private+Equity',
        description: 'High-value private client clearing ($2,500)',
      },
      {
        id: 'demo-qr-3',
        title: 'Sophie Chen',
        subtitle: 'Chen Holdings Asia-Pacific',
        type: 'customer',
        recipientName: 'Sophie Chen',
        accountOrCode: '5520-1920-8812',
        avatarText: 'SC',
        currency: 'USD',
        suggestedAmount: 500,
        qrPayload:
          'royalbank://pay?type=customer&cid=cust-004&name=Sophie+Chen&acc=5520-1920-8812&cur=USD&amt=500&note=Consulting+Fee',
        description: 'Cross-border merchant settlement ($500)',
      },
      {
        id: 'demo-qr-4',
        title: 'Le Bernardin Manhattan',
        subtitle: 'Merchant Terminal #RB-MCH-7781',
        type: 'merchant',
        recipientName: 'Le Bernardin Manhattan',
        accountOrCode: 'RB-MCH-7781',
        avatarText: 'LB',
        currency: 'USD',
        suggestedAmount: 385,
        qrPayload:
          'royalbank://pay?type=merchant&mid=merch-001&name=Le+Bernardin+Manhattan&acc=RB-MCH-7781&cur=USD&amt=385&note=Fine+Dining+Table+14',
        description: 'Point-of-Sale merchant check payment ($385)',
      },
    ];
  }
}

export const qrService = new QRService();
