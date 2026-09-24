import { simulateNetworkDelay } from '../mockApi/storage.ts';
import { DetailedNotification, NotificationCategory } from '../types/index.ts';

const defaultDetailedNotifications: DetailedNotification[] = [
  {
    id: 'notif-det-001',
    customerId: 'cust-001',
    title: 'Wire Transfer Settled: $250,000.00 USD',
    message: 'Your outbound Fedwire transfer to Rothschild Wealth Management Zurich (Ref: TRF-FW-992140) was settled with zero intermediary deductions.',
    category: 'transactions',
    priority: 'high',
    timestamp: '2026-09-23T06:30:00Z',
    isRead: false,
    actionUrl: '/bank/transfers/history',
    actionLabel: 'View Settlement Advice',
    iconType: 'arrow-up-right',
  },
  {
    id: 'notif-det-002',
    customerId: 'cust-001',
    title: 'Biometric Touch ID Login Detected',
    message: 'A successful login was registered from a recognized MacBook Pro 16" device in New York, NY.',
    category: 'security',
    priority: 'normal',
    timestamp: '2026-09-23T06:14:00Z',
    isRead: false,
    actionUrl: '/bank/security',
    actionLabel: 'Review Active Sessions',
    iconType: 'shield-check',
  },
  {
    id: 'notif-det-003',
    customerId: 'cust-001',
    title: 'Card Limit Adjusted: Royal Sovereign Centurion Black',
    message: 'Your daily ATM limit was updated to $25,000 and contactless payment was re-enabled as requested.',
    category: 'cards',
    priority: 'normal',
    timestamp: '2026-09-22T14:15:00Z',
    isRead: false,
    actionUrl: '/bank/cards',
    actionLabel: 'Inspect Card Settings',
    iconType: 'credit-card',
  },
  {
    id: 'notif-det-004',
    customerId: 'cust-001',
    title: 'Executive Mortgage Repayment Scheduled',
    message: 'Monthly principal & interest installment of $14,280.00 will be auto-debited on Oct 01, 2026.',
    category: 'loans',
    priority: 'normal',
    timestamp: '2026-09-21T10:00:00Z',
    isRead: true,
    actionUrl: '/bank/loans',
    actionLabel: 'Manage Loan EMI',
    iconType: 'home',
  },
  {
    id: 'notif-det-005',
    customerId: 'cust-001',
    title: 'Utility Auto-Pay Executed: ConEdison Grid ($450.00)',
    message: 'Monthly electricity bill for 450 Park Ave Penthouse North was automatically paid from Checking Account (••9821).',
    category: 'bills',
    priority: 'normal',
    timestamp: '2026-09-20T18:00:00Z',
    isRead: true,
    actionUrl: '/bank/bills/history',
    actionLabel: 'View Receipt',
    iconType: 'file-text',
  },
  {
    id: 'notif-det-006',
    customerId: 'cust-001',
    title: 'Private Client Exclusive: Art Basel VIP Preview Pass',
    message: 'As a Royal Sovereign cardholder, you have 2 complimentary VIP First Choice Passes to Art Basel Paris & Miami Beach.',
    category: 'promotions',
    priority: 'low',
    timestamp: '2026-09-19T11:30:00Z',
    isRead: true,
    actionUrl: '/bank/cards',
    actionLabel: 'Claim Concierge Passes',
    iconType: 'sparkles',
  },
  {
    id: 'notif-det-007',
    customerId: 'cust-001',
    title: 'System Maintenance Window Scheduled',
    message: 'Core ledger synchronizations will occur Sunday Sep 28 between 02:00 AM - 03:30 AM EST. Instant transfers remain 100% operational.',
    category: 'system',
    priority: 'low',
    timestamp: '2026-09-18T09:00:00Z',
    isRead: true,
    iconType: 'info',
  },
];

const STORAGE_KEY = 'royal_bank_detailed_notifications';

function loadNotifications(): DetailedNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDetailedNotifications));
      return defaultDetailedNotifications;
    }
    return JSON.parse(raw);
  } catch {
    return defaultDetailedNotifications;
  }
}

function saveNotifications(data: DetailedNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save notifications', e);
  }
}

class NotificationService {
  async getNotifications(
    customerId = 'cust-001',
    category?: NotificationCategory | 'all',
    unreadOnly = false
  ): Promise<DetailedNotification[]> {
    await simulateNetworkDelay(100);
    let list = loadNotifications().filter((n) => !n.customerId || n.customerId === customerId);

    if (category && category !== 'all') {
      list = list.filter((n) => n.category === category);
    }
    if (unreadOnly) {
      list = list.filter((n) => !n.isRead);
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async markAsRead(id: string): Promise<DetailedNotification[]> {
    await simulateNetworkDelay(80);
    const list = loadNotifications();
    const target = list.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      saveNotifications(list);
    }
    return list;
  }

  async markAllAsRead(customerId = 'cust-001'): Promise<DetailedNotification[]> {
    await simulateNetworkDelay(150);
    const list = loadNotifications();
    list.forEach((n) => {
      if (!n.customerId || n.customerId === customerId) {
        n.isRead = true;
      }
    });
    saveNotifications(list);
    return list;
  }

  async deleteNotification(id: string): Promise<DetailedNotification[]> {
    await simulateNetworkDelay(100);
    const list = loadNotifications().filter((n) => n.id !== id);
    saveNotifications(list);
    return list;
  }

  async clearAllNotifications(customerId = 'cust-001'): Promise<void> {
    await simulateNetworkDelay(150);
    const list = loadNotifications().filter((n) => n.customerId && n.customerId !== customerId);
    saveNotifications(list);
  }

  async addNotification(notification: Omit<DetailedNotification, 'id' | 'timestamp' | 'isRead'>): Promise<DetailedNotification> {
    const list = loadNotifications();
    const newNotif: DetailedNotification = {
      ...notification,
      id: `notif-user-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    list.unshift(newNotif);
    saveNotifications(list);
    return newNotif;
  }

  async getUnreadCount(customerId = 'cust-001'): Promise<{ total: number; byCategory: Record<NotificationCategory, number> }> {
    const list = loadNotifications().filter((n) => (!n.customerId || n.customerId === customerId) && !n.isRead);
    const byCategory: Record<NotificationCategory, number> = {
      transactions: 0,
      security: 0,
      cards: 0,
      loans: 0,
      bills: 0,
      promotions: 0,
      system: 0,
    };

    list.forEach((n) => {
      if (byCategory[n.category] !== undefined) {
        byCategory[n.category]++;
      }
    });

    return {
      total: list.length,
      byCategory,
    };
  }
}

export const notificationService = new NotificationService();
