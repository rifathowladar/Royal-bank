/**
 * Royal Bank Maker-Checker Approval Service
 * Governs the segregation of duties (SoD) where high-impact banking operations
 * (credit disbursements, account limit modifications, freezes, fee tariff shifts)
 * require independent secondary supervisory sign-off.
 */

import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { ApprovalItem, ApprovalStatus, ApprovalRequestType, ApprovalUser } from '../types/index.ts';
import { adminAuditService } from './adminAuditService.ts';

export interface ApprovalFilterParams {
  status?: 'all' | 'pending' | 'history' | ApprovalStatus;
  requestType?: string;
  priority?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedApprovalResult {
  data: ApprovalItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

class AdminApprovalService {
  async getApprovals(params: ApprovalFilterParams = {}): Promise<PaginatedApprovalResult> {
    await simulateNetworkDelay(80);
    let items = [...db.approvals];

    // Status filter
    if (params.status && params.status !== 'all') {
      if (params.status === 'history') {
        items = items.filter((a) => a.status === 'approved' || a.status === 'rejected');
      } else {
        items = items.filter((a) => a.status === params.status);
      }
    }

    // Request type filter
    if (params.requestType && params.requestType !== 'all') {
      items = items.filter((a) => a.requestType.toLowerCase() === params.requestType!.toLowerCase());
    }

    // Priority filter
    if (params.priority && params.priority !== 'all') {
      items = items.filter((a) => a.priority.toLowerCase() === params.priority!.toLowerCase());
    }

    // Search query
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.requester.name.toLowerCase().includes(q) ||
          a.requester.employeeId.toLowerCase().includes(q) ||
          a.requestType.toLowerCase().includes(q) ||
          a.customerOrResource.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q) ||
          a.supportingInformation.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortBy = params.sortBy || 'requestDate';
    const sortOrder = params.sortOrder || 'desc';
    items.sort((a, b) => {
      let valA: any = a[sortBy as keyof ApprovalItem] ?? '';
      let valB: any = b[sortBy as keyof ApprovalItem] ?? '';
      if (sortBy === 'requestDate') {
        return sortOrder === 'asc'
          ? new Date(valA).getTime() - new Date(valB).getTime()
          : new Date(valB).getTime() - new Date(valA).getTime();
      }
      return sortOrder === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

    const pendingCount = db.approvals.filter((a) => a.status === 'pending').length;
    const approvedCount = db.approvals.filter((a) => a.status === 'approved').length;
    const rejectedCount = db.approvals.filter((a) => a.status === 'rejected').length;

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
      pendingCount,
      approvedCount,
      rejectedCount,
    };
  }

  async getApprovalById(id: string): Promise<ApprovalItem | null> {
    await simulateNetworkDelay(50);
    const found = db.approvals.find((a) => a.id === id);
    return found ? { ...found } : null;
  }

  /**
   * Checker approves the request
   * Workflow: Maker creates action -> Pending Approval -> Checker reviews -> Approve -> Action completed -> Audit Log created!
   */
  async approveRequest(
    id: string,
    checker: ApprovalUser,
    notes?: string
  ): Promise<{ success: boolean; item: ApprovalItem; message: string }> {
    await simulateNetworkDelay(120);
    const index = db.approvals.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Approval item with ID ${id} not found.`);
    }

    const item = db.approvals[index];
    if (item.status !== 'pending') {
      throw new Error(`Approval item is already resolved with status "${item.status}".`);
    }

    // Update status
    item.status = 'approved';
    item.reviewedBy = checker;
    item.reviewedAt = new Date().toISOString();
    if (notes) {
      item.supportingInformation = `${item.supportingInformation} | Checker notes: ${notes}`;
    }

    db.approvals[index] = item;
    db.persist('approvals', db.approvals);

    // Automatically execute the underlying action (simulated)
    this.executeApprovedAction(item);

    // Automatically create Audit Log for compliance
    await adminAuditService.recordLog({
      user: checker.name,
      employeeId: checker.employeeId,
      role: checker.role,
      action: `Checker Approved: ${item.requestType}`,
      module: this.mapTypeToModule(item.requestType),
      resource: item.customerOrResource,
      oldValue: item.previousValue,
      newValue: item.requestedValue,
      reason: item.reason,
      ip: '10.240.12.18',
      device: 'Admin Console (Supervisory Station)',
      status: 'SUCCESS',
    });

    return {
      success: true,
      item: { ...item },
      message: `Approval item ${id} successfully approved and executed. Audit record logged.`,
    };
  }

  /**
   * Checker rejects the request with mandatory reason
   */
  async rejectRequest(
    id: string,
    checker: ApprovalUser,
    rejectionReason: string
  ): Promise<{ success: boolean; item: ApprovalItem; message: string }> {
    await simulateNetworkDelay(120);
    const index = db.approvals.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Approval item with ID ${id} not found.`);
    }

    const item = db.approvals[index];
    if (item.status !== 'pending') {
      throw new Error(`Approval item is already resolved with status "${item.status}".`);
    }

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      throw new Error('A detailed regulatory rejection reason is required (minimum 5 characters).');
    }

    item.status = 'rejected';
    item.reviewedBy = checker;
    item.reviewedAt = new Date().toISOString();
    item.rejectionReason = rejectionReason;

    db.approvals[index] = item;
    db.persist('approvals', db.approvals);

    // Automatically create Audit Log
    await adminAuditService.recordLog({
      user: checker.name,
      employeeId: checker.employeeId,
      role: checker.role,
      action: `Checker Rejected: ${item.requestType}`,
      module: this.mapTypeToModule(item.requestType),
      resource: item.customerOrResource,
      oldValue: item.previousValue,
      newValue: `Rejected: ${rejectionReason}`,
      reason: rejectionReason,
      ip: '10.240.12.18',
      device: 'Admin Console (Supervisory Station)',
      status: 'FAILED',
    });

    return {
      success: true,
      item: { ...item },
      message: `Approval item ${id} rejected. Reason logged in compliance register.`,
    };
  }

  /**
   * Maker initiates a new request for dual authorization
   */
  async createApprovalRequest(item: Omit<ApprovalItem, 'id' | 'requestDate' | 'status'>): Promise<ApprovalItem> {
    await simulateNetworkDelay(100);
    const newId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: ApprovalItem = {
      ...item,
      id: newId,
      requestDate: new Date().toISOString(),
      status: 'pending',
    };

    db.approvals.unshift(newItem);
    db.persist('approvals', db.approvals);

    return newItem;
  }

  private mapTypeToModule(type: ApprovalRequestType): any {
    switch (type) {
      case 'Account limit change':
        return 'Accounts';
      case 'Large transaction':
        return 'Transactions';
      case 'Loan approval':
        return 'Loans';
      case 'Customer freeze':
      case 'Customer unfreeze':
        return 'Customers';
      case 'Card block':
        return 'Cards';
      case 'Merchant approval':
        return 'Merchants';
      case 'KYC approval':
        return 'KYC';
      case 'Fee configuration':
      case 'Interest rate change':
        return 'Settings';
      default:
        return 'System';
    }
  }

  private executeApprovedAction(item: ApprovalItem) {
    // Modify live database objects accordingly
    if (item.requestType === 'Customer freeze' && item.actionPayload?.customerId) {
      const cust = db.customers.find((c) => c.id === item.actionPayload!.customerId);
      if (cust) {
        cust.status = 'suspended';
        db.persist('customers', db.customers);
      }
    } else if (item.requestType === 'Customer unfreeze' && item.actionPayload?.customerId) {
      const cust = db.customers.find((c) => c.id === item.actionPayload!.customerId);
      if (cust) {
        cust.status = 'active';
        db.persist('customers', db.customers);
      }
    } else if (item.requestType === 'Card block' && item.actionPayload?.cardId) {
      const card = db.cards.find((c) => c.id === item.actionPayload!.cardId);
      if (card) {
        card.status = 'frozen';
        db.persist('cards', db.cards);
      }
    } else if (item.requestType === 'Merchant approval' && item.actionPayload?.merchantId) {
      const merch = db.merchants.find((m) => m.id === item.actionPayload!.merchantId);
      if (merch) {
        db.persist('merchants', db.merchants);
      }
    }
  }
}

export const adminApprovalService = new AdminApprovalService();
