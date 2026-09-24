import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { FraudAlert, FraudCase, FraudAlertStatus, FraudNote } from '../types/index.ts';
import { adminRbacService } from './adminRbacService.ts';

export const adminFraudService = {
  async getAlerts(params?: {
    status?: string;
    search?: string;
    minRisk?: number;
    ruleCategory?: string;
  }): Promise<FraudAlert[]> {
    await simulateNetworkDelay(80);
    let list = [...db.fraudAlerts];

    if (params?.status && params.status !== 'all') {
      list = list.filter((a) => a.status === params.status);
    }
    if (params?.minRisk) {
      list = list.filter((a) => a.riskScore >= params.minRisk!);
    }
    if (params?.ruleCategory && params.ruleCategory !== 'all') {
      list = list.filter((a) => a.ruleCategory === params.ruleCategory);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.alertNumber.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.customerEmail.toLowerCase().includes(q) ||
          a.ipAddress.toLowerCase().includes(q) ||
          a.detectionRule.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          (a.transactionReference && a.transactionReference.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async getAlertById(id: string): Promise<FraudAlert | null> {
    await simulateNetworkDelay(50);
    const alert = db.fraudAlerts.find((a) => a.id === id);
    return alert ? JSON.parse(JSON.stringify(alert)) : null;
  },

  async getCases(params?: {
    status?: string;
    severity?: string;
    search?: string;
  }): Promise<FraudCase[]> {
    await simulateNetworkDelay(80);
    let list = [...db.fraudCases];

    if (params?.status && params.status !== 'all') {
      list = list.filter((c) => c.status === params.status);
    }
    if (params?.severity && params.severity !== 'all') {
      list = list.filter((c) => c.severity === params.severity);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.assignedTo.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getCaseById(id: string): Promise<FraudCase | null> {
    await simulateNetworkDelay(50);
    const c = db.fraudCases.find((x) => x.id === id);
    return c ? JSON.parse(JSON.stringify(c)) : null;
  },

  /**
   * Action: Investigate
   * Changes status to under_investigation and logs note/audit.
   */
  async investigateAlert(id: string, notes?: string): Promise<FraudAlert> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'fraud', 'edit');

    await simulateNetworkDelay(120);
    const alert = db.fraudAlerts.find((a) => a.id === id);
    if (!alert) throw new Error(`Fraud alert ${id} not found.`);

    alert.status = 'under_investigation';
    alert.assignedTo = `${role.replace('_', ' ').toUpperCase()} (Current Analyst)`;

    if (notes) {
      alert.notes.push({
        id: `fn-${Date.now()}`,
        author: 'Investigator',
        authorRole: role,
        text: notes,
        timestamp: new Date().toISOString(),
      });
    }

    db.persist('fraudAlerts', db.fraudAlerts);
    return JSON.parse(JSON.stringify(alert));
  },

  /**
   * Action: Block
   * Freezes the suspicious transaction, customer card/account, and marks alert as blocked.
   */
  async blockAlert(id: string, reason: string): Promise<FraudAlert> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'fraud', 'reject');

    await simulateNetworkDelay(150);
    const alert = db.fraudAlerts.find((a) => a.id === id);
    if (!alert) throw new Error(`Fraud alert ${id} not found.`);

    alert.status = 'blocked';
    alert.notes.push({
      id: `fn-${Date.now()}`,
      author: 'Security Officer',
      authorRole: role,
      text: `BLOCKED & HARD FREEZE EXECUTED: ${reason}`,
      timestamp: new Date().toISOString(),
    });

    // Also link to account or transaction freeze if customer matches
    const customer = db.customers.find((c) => c.id === alert.customerId);
    if (customer) {
      customer.riskScore = 'High';
      db.persist('customers', db.customers);
    }

    // Add immutable audit log
    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      adminId: 'adm-current',
      adminName: 'Fraud Analyst / Admin',
      adminRole: role,
      action: 'FRAUD_BLOCK_TRANSACTION',
      targetType: 'transaction',
      targetId: alert.transactionId || alert.id,
      targetName: alert.alertNumber,
      details: `Hard freeze applied to ${alert.customerName} (${alert.amount} ${alert.currency}): ${reason}`,
      ipAddress: '10.240.12.99',
      timestamp: new Date().toISOString(),
      status: 'WARNING',
    });
    db.persist('auditLogs', db.auditLogs);
    db.persist('fraudAlerts', db.fraudAlerts);

    return JSON.parse(JSON.stringify(alert));
  },

  /**
   * Action: Release
   * Marks alert as released / legitimate and restores normal processing.
   */
  async releaseAlert(id: string, reason: string): Promise<FraudAlert> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'fraud', 'approve');

    await simulateNetworkDelay(120);
    const alert = db.fraudAlerts.find((a) => a.id === id);
    if (!alert) throw new Error(`Fraud alert ${id} not found.`);

    alert.status = 'released';
    alert.notes.push({
      id: `fn-${Date.now()}`,
      author: 'Security Officer',
      authorRole: role,
      text: `RELEASED & CLEARED: ${reason}`,
      timestamp: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      adminId: 'adm-current',
      adminName: 'Fraud Analyst / Admin',
      adminRole: role,
      action: 'FRAUD_RELEASE_ALERT',
      targetType: 'transaction',
      targetId: alert.id,
      targetName: alert.alertNumber,
      details: `Alert released by analyst: ${reason}`,
      ipAddress: '10.240.12.99',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });
    db.persist('auditLogs', db.auditLogs);
    db.persist('fraudAlerts', db.fraudAlerts);

    return JSON.parse(JSON.stringify(alert));
  },

  /**
   * Action: Add Note
   */
  async addNote(alertId: string, noteText: string): Promise<FraudAlert> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'fraud', 'edit');

    await simulateNetworkDelay(80);
    const alert = db.fraudAlerts.find((a) => a.id === alertId);
    if (!alert) throw new Error(`Fraud alert ${alertId} not found.`);

    alert.notes.push({
      id: `fn-${Date.now()}`,
      author: 'Analyst',
      authorRole: role,
      text: noteText,
      timestamp: new Date().toISOString(),
    });

    db.persist('fraudAlerts', db.fraudAlerts);
    return JSON.parse(JSON.stringify(alert));
  },

  /**
   * Action: Create Case from Alert
   */
  async createCase(data: {
    alertId: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    notes: string;
  }): Promise<FraudCase> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'fraud', 'create');

    await simulateNetworkDelay(160);
    const alert = db.fraudAlerts.find((a) => a.id === data.alertId);
    if (!alert) throw new Error(`Fraud alert ${data.alertId} not found.`);

    const caseCount = db.fraudCases.length + 1;
    const caseNumber = `CASE-2026-${String(caseCount).padStart(3, '0')}`;
    const newCaseId = `case-frd-${Date.now()}`;

    const newCase: FraudCase = {
      id: newCaseId,
      caseNumber,
      title: data.title,
      severity: data.severity,
      status: 'open',
      assignedTo: 'Special Investigations Unit (SIU)',
      assignedRole: role,
      alertIds: [alert.id],
      customerId: alert.customerId,
      customerName: alert.customerName,
      totalExposureUSD: alert.amount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summary: data.notes,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Dossier Initialized',
          actor: `${role} Analyst`,
          notes: `Formal case initiated from Alert ${alert.alertNumber}: ${data.notes}`,
        },
      ],
    };

    db.fraudCases.unshift(newCase);
    db.persist('fraudCases', db.fraudCases);

    alert.status = 'case_created';
    alert.caseId = newCaseId;
    alert.notes.push({
      id: `fn-${Date.now()}`,
      author: 'Case Coordinator',
      authorRole: role,
      text: `Escalated to formal Case ${caseNumber}: ${data.title}`,
      timestamp: new Date().toISOString(),
    });
    db.persist('fraudAlerts', db.fraudAlerts);

    return JSON.parse(JSON.stringify(newCase));
  },

  async getMetrics(): Promise<{
    totalAlerts: number;
    flaggedCount: number;
    underInvestigationCount: number;
    blockedCount: number;
    releasedCount: number;
    openCasesCount: number;
    totalExposureUSD: number;
    avgRiskScore: number;
  }> {
    await simulateNetworkDelay(60);
    const alerts = db.fraudAlerts;
    const cases = db.fraudCases;

    const flaggedCount = alerts.filter((a) => a.status === 'flagged').length;
    const underInvestigationCount = alerts.filter((a) => a.status === 'under_investigation').length;
    const blockedCount = alerts.filter((a) => a.status === 'blocked').length;
    const releasedCount = alerts.filter((a) => a.status === 'released').length;
    const openCasesCount = cases.filter((c) => c.status !== 'closed_cleared' && c.status !== 'closed_blocked').length;

    const totalExposureUSD = alerts.reduce((acc, a) => acc + (a.status !== 'released' ? a.amount : 0), 0);
    const avgRiskScore = alerts.length ? Math.round(alerts.reduce((acc, a) => acc + a.riskScore, 0) / alerts.length) : 0;

    return {
      totalAlerts: alerts.length,
      flaggedCount,
      underInvestigationCount,
      blockedCount,
      releasedCount,
      openCasesCount,
      totalExposureUSD,
      avgRiskScore,
    };
  },
};
