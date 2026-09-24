/**
 * Royal Bank Service Layer
 * Clean async service methods matching real enterprise banking REST/GraphQL endpoints.
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
  User,
} from '../types/index.ts';
import { db, simulateNetworkDelay } from '../mockApi/storage.ts';

// Current session storage key
const SESSION_KEY = 'royal_bank_current_user';

export async function getCurrentUser(): Promise<User | null> {
  await simulateNetworkDelay(50);
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      // Default to Alexander Sterling for seamless demo experience
      const defaultUser = db.customers[0];
      localStorage.setItem(SESSION_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(raw);
  } catch {
    return db.customers[0];
  }
}

export async function setCurrentUser(user: User | null): Promise<void> {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function getCustomers(): Promise<Customer[]> {
  await simulateNetworkDelay(100);
  return [...db.customers];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  await simulateNetworkDelay(80);
  return db.customers.find((c) => c.id === id) || null;
}

export async function getAccounts(customerId?: string): Promise<Account[]> {
  await simulateNetworkDelay(90);
  if (!customerId) return [...db.accounts];
  return db.accounts.filter((a) => a.customerId === customerId);
}

export async function getAccountById(id: string): Promise<Account | null> {
  await simulateNetworkDelay(60);
  return db.accounts.find((a) => a.id === id) || null;
}

export async function getTransactions(params?: {
  customerId?: string;
  accountId?: string;
  limit?: number;
}): Promise<Transaction[]> {
  await simulateNetworkDelay(110);
  let list = [...db.transactions];
  if (params?.customerId) {
    list = list.filter((t) => t.customerId === params.customerId);
  }
  if (params?.accountId) {
    list = list.filter((t) => t.accountId === params.accountId);
  }
  // Sort descending by timestamp
  list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  if (params?.limit) {
    list = list.slice(0, params.limit);
  }
  return list;
}

export async function getCards(customerId?: string): Promise<Card[]> {
  await simulateNetworkDelay(90);
  if (!customerId) return [...db.cards];
  return db.cards.filter((c) => c.customerId === customerId);
}

export async function getLoans(customerId?: string): Promise<Loan[]> {
  await simulateNetworkDelay(90);
  if (!customerId) return [...db.loans];
  return db.loans.filter((l) => l.customerId === customerId);
}

export async function getDeposits(customerId?: string): Promise<Deposit[]> {
  await simulateNetworkDelay(80);
  if (!customerId) return [...db.deposits];
  return db.deposits.filter((d) => d.customerId === customerId);
}

export async function getNotifications(userId?: string): Promise<Notification[]> {
  await simulateNetworkDelay(70);
  if (!userId) return [...db.notifications];
  return db.notifications.filter((n) => n.userId === userId);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await simulateNetworkDelay(50);
  const target = db.notifications.find((n) => n.id === id);
  if (target) {
    target.isRead = true;
    db.persist('notifications', db.notifications);
  }
}

export async function getBeneficiaries(customerId?: string): Promise<Beneficiary[]> {
  await simulateNetworkDelay(80);
  if (!customerId) return [...db.beneficiaries];
  return db.beneficiaries.filter((b) => b.customerId === customerId);
}

export async function getMerchants(): Promise<Merchant[]> {
  await simulateNetworkDelay(60);
  return [...db.merchants];
}

export async function getQrPayments(customerId?: string): Promise<QRPayment[]> {
  await simulateNetworkDelay(80);
  if (!customerId) return [...db.qrPayments];
  return db.qrPayments.filter((q) => q.customerId === customerId);
}

export async function getBills(customerId?: string): Promise<Bill[]> {
  await simulateNetworkDelay(80);
  if (!customerId) return [...db.bills];
  return db.bills.filter((b) => b.customerId === customerId);
}

export async function getKycApplications(): Promise<KYCApplication[]> {
  await simulateNetworkDelay(100);
  return [...db.kycApplications];
}

export async function getSupportTickets(customerId?: string): Promise<SupportTicket[]> {
  await simulateNetworkDelay(90);
  if (!customerId) return [...db.supportTickets];
  return db.supportTickets.filter((t) => t.customerId === customerId);
}

export async function getAdmins(): Promise<Admin[]> {
  await simulateNetworkDelay(80);
  return [...db.admins];
}

// Authentication Service Helpers
export async function authenticateCustomer(email: string): Promise<Customer | null> {
  await simulateNetworkDelay(150);
  const customer = db.customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (customer) {
    await setCurrentUser(customer);
    return customer;
  }
  return null;
}

export async function authenticateAdmin(email: string): Promise<Admin | null> {
  await simulateNetworkDelay(150);
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (admin) {
    await setCurrentUser(admin);
    return admin;
  }
  return null;
}

export async function logoutUser(): Promise<void> {
  await simulateNetworkDelay(50);
  await setCurrentUser(null);
}
