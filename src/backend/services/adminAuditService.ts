/**
 * Royal Bank Admin Audit Service
 * Maintains immutable, non-repudiation audit trails for all supervisory actions,
 * policy changes, approvals, and system state transitions.
 */

import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { AdminAuditLog } from '../types/index.ts';

export interface AuditLogFilterParams {
  search?: string;
  module?: string;
  status?: string;
  user?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAuditLogResult {
  data: AdminAuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  modules: string[];
}

class AdminAuditService {
  async getAuditLogs(params: AuditLogFilterParams = {}): Promise<PaginatedAuditLogResult> {
    await simulateNetworkDelay(70);
    let items = [...db.auditLogs];

    // Filter by module
    if (params.module && params.module !== 'all') {
      items = items.filter((item) => (item.module || '').toLowerCase() === params.module!.toLowerCase());
    }

    // Filter by status
    if (params.status && params.status !== 'all') {
      items = items.filter((item) => item.status.toLowerCase() === params.status!.toLowerCase());
    }

    // Filter by user
    if (params.user && params.user !== 'all') {
      items = items.filter(
        (item) =>
          (item.user || '').toLowerCase().includes(params.user!.toLowerCase()) ||
          (item.employeeId || '').toLowerCase().includes(params.user!.toLowerCase())
      );
    }

    // Filter by date
    if (params.startDate) {
      items = items.filter((item) => new Date(item.timestamp) >= new Date(params.startDate!));
    }
    if (params.endDate) {
      const end = new Date(params.endDate!);
      end.setHours(23, 59, 59, 999);
      items = items.filter((item) => new Date(item.timestamp) <= end);
    }

    // Search query
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.id.toLowerCase().includes(q) ||
          (item.user || '').toLowerCase().includes(q) ||
          (item.employeeId || '').toLowerCase().includes(q) ||
          item.action.toLowerCase().includes(q) ||
          (item.resource || '').toLowerCase().includes(q) ||
          (item.ip || item.ipAddress || '').toLowerCase().includes(q) ||
          (item.reason && item.reason.toLowerCase().includes(q))
      );
    }

    // Sort
    const sortBy = params.sortBy || 'timestamp';
    const sortOrder = params.sortOrder || 'desc';
    items.sort((a, b) => {
      let valA: any = a[sortBy as keyof AdminAuditLog] ?? '';
      let valB: any = b[sortBy as keyof AdminAuditLog] ?? '';
      if (sortBy === 'timestamp') {
        return sortOrder === 'asc'
          ? new Date(valA).getTime() - new Date(valB).getTime()
          : new Date(valB).getTime() - new Date(valA).getTime();
      }
      return sortOrder === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

    const uniqueModules = Array.from(
      new Set(db.auditLogs.map((log) => log.module || 'System').filter(Boolean) as string[])
    );

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
      modules: uniqueModules,
    };
  }

  async getAuditLogById(id: string): Promise<AdminAuditLog | null> {
    await simulateNetworkDelay(50);
    const found = db.auditLogs.find((l) => l.id === id);
    return found || null;
  }

  async recordLog(entry: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<AdminAuditLog> {
    await simulateNetworkDelay(50);
    const newId = `aud-${Date.now().toString().slice(-6)}`;
    const fullEntry: AdminAuditLog = {
      ...entry,
      id: newId,
      timestamp: new Date().toISOString(),
    };
    db.auditLogs.unshift(fullEntry);
    db.persist('auditLogs', db.auditLogs);
    return fullEntry;
  }
}

export const adminAuditService = new AdminAuditService();
