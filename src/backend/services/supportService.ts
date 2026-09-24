import { simulateNetworkDelay } from '../mockApi/storage.ts';
import {
  DetailedSupportTicket,
  SupportTicketCategory,
  TicketMessage,
  FAQItem,
  BranchAppointment,
} from '../types/index.ts';

const defaultTickets: DetailedSupportTicket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'RB-SUP-89102',
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    category: 'Wire Transfer',
    subject: 'SWIFT MT103 Tracking Request for Swiss Franc Outbound',
    description: 'We require the formal cryptographic MT103 Swift copy and UETR tracking code for the 250,000 CHF wire executed on Sept 22 to UBS Zurich.',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-09-23T06:10:00Z',
    lastUpdatedAt: '2026-09-23T06:45:00Z',
    assignedAgent: {
      name: 'Victoria Ashford',
      role: 'Senior Private Banker & Treasury Desk',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
    messages: [
      {
        id: 'msg-001',
        sender: 'user',
        senderName: 'Alexander Sterling',
        message: 'Hello Victoria, could your desk please transmit the verified MT103 advice PDF for the Zurich wire? Our Swiss tax counsel requires it for notary filing.',
        timestamp: '2026-09-23T06:10:00Z',
      },
      {
        id: 'msg-002',
        sender: 'agent',
        senderName: 'Victoria Ashford',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        message: 'Good morning Mr. Sterling. The Swiss franc wire has cleared the SWIFT GPI corridor with UETR ref: 7a92-f018-4491-b302. I have generated your authenticated PDF proof and attached it below.',
        timestamp: '2026-09-23T06:45:00Z',
        attachments: [
          {
            name: 'SWIFT_MT103_RB_UBS_250kCHF_Authenticated.pdf',
            size: '1.4 MB',
            url: '#',
          },
        ],
      },
    ],
  },
  {
    id: 'tkt-002',
    ticketNumber: 'RB-SUP-84192',
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    category: 'Card Services',
    subject: 'Complimentary Valet Parking and Lounge Access at JFK Terminal 8',
    description: 'Confirming Centurion Private Card guest allowances for upcoming transatlantic flight.',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2026-09-18T10:00:00Z',
    lastUpdatedAt: '2026-09-18T11:20:00Z',
    assignedAgent: {
      name: 'Julian Cross',
      role: 'Private Concierge Manager',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    rating: 5,
    messages: [
      {
        id: 'msg-101',
        sender: 'user',
        senderName: 'Alexander Sterling',
        message: 'Hi Julian, does my primary Royal Sovereign Card admit 3 guests to the JFK First Class Lounge?',
        timestamp: '2026-09-18T10:00:00Z',
      },
      {
        id: 'msg-102',
        sender: 'agent',
        senderName: 'Julian Cross',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        message: 'Yes, Mr. Sterling. Your tier includes unlimited complimentary entry for yourself plus up to 4 registered guests, with private meeting suites available upon reservation.',
        timestamp: '2026-09-18T11:20:00Z',
      },
    ],
  },
];

const defaultFaqs: FAQItem[] = [
  {
    id: 'faq-01',
    category: 'Transfers & Wires',
    question: 'What are the daily limits for International Fedwire and SWIFT transfers?',
    answer: 'For Royal Sovereign and Private Banking clients, online wire limits are set at $1,000,000 USD per transaction and $5,000,000 USD daily with multi-factor biometric authorization. Custom limits can be arranged 24/7 through your assigned private banker.',
    helpfulCount: 142,
  },
  {
    id: 'faq-02',
    category: 'Security & 2FA',
    question: 'How do I activate hardware security keys or authenticator apps for 2FA?',
    answer: 'Navigate to Security Settings > Two-Factor Authentication. Select Authenticator App to reveal your private TOTP QR code, which can be scanned using Google Authenticator, 1Password, or YubiKey.',
    helpfulCount: 98,
  },
  {
    id: 'faq-03',
    category: 'Cards & Limits',
    question: 'What should I do if my physical debit or credit card is misplaced?',
    answer: 'You can instantly freeze your card with zero liability from the Cards section. You can also generate a single-use or reusable virtual card in 10 seconds for immediate online spending while a replacement is couriered to your address.',
    helpfulCount: 215,
  },
  {
    id: 'faq-04',
    category: 'Deposits & Yield',
    question: 'Are high-yield Fixed Term and DPS deposits FDIC / Sovereign insured?',
    answer: 'Yes, deposits with Royal Bank are backed by the highest tier statutory insurance regimes up to standard legal caps, with institutional excess depositor insurance available through our Syndicate Sweep facility.',
    helpfulCount: 76,
  },
  {
    id: 'faq-05',
    category: 'KYC & Compliance',
    question: 'How frequently do I need to update my KYC proof of residence?',
    answer: 'Standard Tier 3 accounts undergo automated digital verification every 24 months. You will receive an encrypted notification 30 days prior if refreshed documentation is necessary.',
    helpfulCount: 64,
  },
];

const defaultAppointments: BranchAppointment[] = [
  {
    id: 'apt-001',
    customerId: 'cust-001',
    branchName: 'Royal Bank Flagship Mayfair & Manhattan Plaza',
    branchAddress: '450 Park Avenue, 28th Floor, New York, NY 10022',
    serviceType: 'Private Wealth Consultation & Estate Structuring',
    date: '2026-10-02',
    timeSlot: '14:00 - 15:00 EST',
    specialRequirements: 'Review cross-border estate trust setup and municipal bond allocation.',
    status: 'confirmed',
    tokenNumber: 'RB-VIP-9941',
    advisorName: 'Victoria Ashford',
    createdAt: '2026-09-22T10:00:00Z',
  },
];

const STORAGE_KEY_TICKETS = 'royal_bank_support_tickets_v2';
const STORAGE_KEY_FAQS = 'royal_bank_faqs_v2';
const STORAGE_KEY_APPOINTMENTS = 'royal_bank_appointments_v2';

function loadTickets(): DetailedSupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(defaultTickets));
      return defaultTickets;
    }
    return JSON.parse(raw);
  } catch {
    return defaultTickets;
  }
}

function saveTickets(data: DetailedSupportTicket[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save tickets', e);
  }
}

function loadFaqs(): FAQItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAQS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FAQS, JSON.stringify(defaultFaqs));
      return defaultFaqs;
    }
    return JSON.parse(raw);
  } catch {
    return defaultFaqs;
  }
}

function saveFaqs(data: FAQItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FAQS, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save faqs', e);
  }
}

function loadAppointments(): BranchAppointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(defaultAppointments));
      return defaultAppointments;
    }
    return JSON.parse(raw);
  } catch {
    return defaultAppointments;
  }
}

function saveAppointments(data: BranchAppointment[]) {
  try {
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save appointments', e);
  }
}

class SupportService {
  async getTickets(customerId = 'cust-001'): Promise<DetailedSupportTicket[]> {
    await simulateNetworkDelay(120);
    return loadTickets().filter((t) => !t.customerId || t.customerId === customerId);
  }

  async getTicketById(ticketId: string): Promise<DetailedSupportTicket | null> {
    await simulateNetworkDelay(100);
    const tickets = loadTickets();
    const t = tickets.find((item) => item.id === ticketId || item.ticketNumber === ticketId);
    return t || null;
  }

  async createTicket(payload: {
    customerId: string;
    customerName: string;
    category: SupportTicketCategory;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<DetailedSupportTicket> {
    await simulateNetworkDelay(250);
    const list = loadTickets();
    const ticketNo = `RB-SUP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket: DetailedSupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: ticketNo,
      customerId: payload.customerId,
      customerName: payload.customerName,
      category: payload.category,
      subject: payload.subject,
      description: payload.description,
      priority: payload.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      assignedAgent: {
        name: 'Victoria Ashford',
        role: 'Senior Private Banker',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          senderName: payload.customerName,
          message: payload.description,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    list.unshift(newTicket);
    saveTickets(list);
    return newTicket;
  }

  async addMessage(
    ticketId: string,
    messageText: string,
    sender: 'user' | 'agent' = 'user',
    senderName = 'Alexander Sterling'
  ): Promise<DetailedSupportTicket> {
    await simulateNetworkDelay(200);
    const list = loadTickets();
    const ticket = list.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const msg: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    ticket.messages.push(msg);
    ticket.lastUpdatedAt = new Date().toISOString();
    if (sender === 'user' && ticket.status === 'resolved') {
      ticket.status = 'in_progress';
    }

    saveTickets(list);
    return ticket;
  }

  async resolveTicket(ticketId: string, rating?: number): Promise<DetailedSupportTicket> {
    await simulateNetworkDelay(150);
    const list = loadTickets();
    const ticket = list.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) throw new Error('Ticket not found');

    ticket.status = 'resolved';
    ticket.lastUpdatedAt = new Date().toISOString();
    if (rating) ticket.rating = rating;

    saveTickets(list);
    return ticket;
  }

  async getFaqs(category?: string, searchQuery?: string): Promise<FAQItem[]> {
    await simulateNetworkDelay(80);
    let list = loadFaqs();
    if (category && category !== 'All') {
      list = list.filter((f) => f.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async voteFaqHelpful(faqId: string): Promise<number> {
    await simulateNetworkDelay(60);
    const list = loadFaqs();
    const target = list.find((f) => f.id === faqId);
    if (target) {
      target.helpfulCount += 1;
      saveFaqs(list);
      return target.helpfulCount;
    }
    return 0;
  }

  async getAppointments(customerId = 'cust-001'): Promise<BranchAppointment[]> {
    await simulateNetworkDelay(100);
    return loadAppointments().filter((a) => !a.customerId || a.customerId === customerId);
  }

  async bookBranchAppointment(payload: {
    customerId: string;
    branchName: string;
    branchAddress: string;
    serviceType: string;
    date: string;
    timeSlot: string;
    specialRequirements?: string;
  }): Promise<BranchAppointment> {
    await simulateNetworkDelay(250);
    const list = loadAppointments();
    const newApt: BranchAppointment = {
      id: `apt-${Date.now()}`,
      customerId: payload.customerId,
      branchName: payload.branchName,
      branchAddress: payload.branchAddress,
      serviceType: payload.serviceType,
      date: payload.date,
      timeSlot: payload.timeSlot,
      specialRequirements: payload.specialRequirements,
      status: 'confirmed',
      tokenNumber: `RB-VIP-${Math.floor(1000 + Math.random() * 9000)}`,
      advisorName: 'Victoria Ashford (Private Client Officer)',
      createdAt: new Date().toISOString(),
    };

    list.unshift(newApt);
    saveAppointments(list);
    return newApt;
  }

  async cancelAppointment(aptId: string): Promise<BranchAppointment[]> {
    await simulateNetworkDelay(150);
    const list = loadAppointments();
    const apt = list.find((a) => a.id === aptId);
    if (apt) {
      apt.status = 'cancelled';
      saveAppointments(list);
    }
    return list;
  }
}

export const supportService = new SupportService();
