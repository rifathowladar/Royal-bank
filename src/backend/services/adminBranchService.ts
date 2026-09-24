import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { Branch, Transaction, Employee } from '../types/index.ts';
import { adminRbacService } from './adminRbacService.ts';

export const adminBranchService = {
  async getBranches(params?: {
    search?: string;
    city?: string;
    type?: string;
  }): Promise<Branch[]> {
    await simulateNetworkDelay(70);
    let list = [...db.branches];

    if (params?.city && params.city !== 'all') {
      list = list.filter((b) => b.city.toLowerCase() === params.city!.toLowerCase());
    }
    if (params?.type && params.type !== 'all') {
      list = list.filter((b) => b.type === params.type);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          b.country.toLowerCase().includes(q) ||
          b.branchManager.name.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getBranchById(id: string): Promise<Branch | null> {
    await simulateNetworkDelay(50);
    const b = db.branches.find((br) => br.id === id || br.code.toLowerCase() === id.toLowerCase());
    return b ? JSON.parse(JSON.stringify(b)) : null;
  },

  async getBranchEmployees(branchId: string): Promise<Employee[]> {
    await simulateNetworkDelay(60);
    const branch = db.branches.find((b) => b.id === branchId || b.code === branchId);
    if (!branch) return [];

    return db.employees.filter((e) => e.branchId === branch.id || e.branchName === branch.name);
  },

  async getBranchTransactions(branchId: string): Promise<Transaction[]> {
    await simulateNetworkDelay(60);
    // Return realistic transactions associated with this branch's accounts or recent activity
    const txs = [...db.transactions].slice(0, 15);
    return txs;
  },

  async updateCashPosition(
    branchId: string,
    vaultCashUSD: number
  ): Promise<Branch> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'branches', 'edit');

    await simulateNetworkDelay(120);
    const branch = db.branches.find((b) => b.id === branchId);
    if (!branch) throw new Error(`Branch ${branchId} not found.`);

    branch.cashPosition.vaultCashUSD = vaultCashUSD;
    branch.cashPosition.lastAuditedAt = new Date().toISOString();
    if (vaultCashUSD < branch.cashPosition.vaultCapacityUSD * 0.25) {
      branch.cashPosition.status = 'low';
    } else if (vaultCashUSD > branch.cashPosition.vaultCapacityUSD * 0.9) {
      branch.cashPosition.status = 'excess';
    } else {
      branch.cashPosition.status = 'normal';
    }

    db.persist('branches', db.branches);

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      adminId: 'adm-cash',
      adminName: 'Treasury / Branch Controller',
      adminRole: role,
      action: 'BRANCH_CASH_UPDATE',
      targetType: 'system',
      targetId: branch.id,
      targetName: branch.name,
      details: `Vault cash reserve updated to $${vaultCashUSD.toLocaleString()} USD (${branch.cashPosition.status.toUpperCase()})`,
      ipAddress: '10.240.12.18',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });
    db.persist('auditLogs', db.auditLogs);

    return JSON.parse(JSON.stringify(branch));
  },

  async getNetworkMetrics(): Promise<{
    totalBranches: number;
    activeCount: number;
    totalVaultCashUSD: number;
    totalAtms: number;
    operationalAtms: number;
    totalEmployees: number;
    todayNetworkVolumeUSD: number;
  }> {
    await simulateNetworkDelay(50);
    const branches = db.branches;
    const totalVaultCashUSD = branches.reduce((acc, b) => acc + b.cashPosition.vaultCashUSD, 0);
    const allAtms = branches.flatMap((b) => b.atms);
    const operationalAtms = allAtms.filter((a) => a.status === 'operational').length;
    const totalEmployees = branches.reduce((acc, b) => acc + b.employeesCount, 0);
    const todayNetworkVolumeUSD = branches.reduce((acc, b) => acc + b.volumeUSDToday, 0);

    return {
      totalBranches: branches.length,
      activeCount: branches.filter((b) => b.status === 'active').length,
      totalVaultCashUSD,
      totalAtms: allAtms.length,
      operationalAtms,
      totalEmployees,
      todayNetworkVolumeUSD,
    };
  },
};
