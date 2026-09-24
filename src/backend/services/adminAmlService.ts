import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { AmlAlert, AmlCase, AmlReport } from '../types/index.ts';
import { adminRbacService } from './adminRbacService.ts';

export const adminAmlService = {
  async getAlerts(params?: {
    status?: string;
    activityType?: string;
    search?: string;
    riskRating?: string;
  }): Promise<AmlAlert[]> {
    await simulateNetworkDelay(80);
    let list = [...db.amlAlerts];

    if (params?.status && params.status !== 'all') {
      list = list.filter((a) => a.status === params.status);
    }
    if (params?.activityType && params.activityType !== 'all') {
      list = list.filter((a) => a.activityType === params.activityType);
    }
    if (params?.riskRating && params.riskRating !== 'all') {
      list = list.filter((a) => a.customerRiskRating === params.riskRating);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.refNumber.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.activityType.toLowerCase().includes(q) ||
          a.destinationCountry.toLowerCase().includes(q) ||
          (a.matchedList && a.matchedList.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  },

  async getAlertById(id: string): Promise<AmlAlert | null> {
    await simulateNetworkDelay(50);
    const alert = db.amlAlerts.find((a) => a.id === id);
    return alert ? JSON.parse(JSON.stringify(alert)) : null;
  },

  async getCases(params?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<AmlCase[]> {
    await simulateNetworkDelay(80);
    let list = [...db.amlCases];

    if (params?.status && params.status !== 'all') {
      list = list.filter((c) => c.status === params.status);
    }
    if (params?.priority && params.priority !== 'all') {
      list = list.filter((c) => c.priority === params.priority);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.assignedAnalyst.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getCaseById(id: string): Promise<AmlCase | null> {
    await simulateNetworkDelay(50);
    const c = db.amlCases.find((x) => x.id === id);
    return c ? JSON.parse(JSON.stringify(c)) : null;
  },

  async getReports(params?: { type?: string; search?: string }): Promise<AmlReport[]> {
    await simulateNetworkDelay(70);
    let list = [...db.amlReports];

    if (params?.type && params.type !== 'all') {
      list = list.filter((r) => r.type === params.type);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.reportNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.regulator.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime());
  },

  async updateAlertStatus(
    id: string,
    status: AmlAlert['status'],
    notes?: string
  ): Promise<AmlAlert> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'aml', 'edit');

    await simulateNetworkDelay(120);
    const alert = db.amlAlerts.find((a) => a.id === id);
    if (!alert) throw new Error(`AML Alert ${id} not found.`);

    alert.status = status;
    if (notes) {
      alert.notes = alert.notes ? `${alert.notes} | ${notes}` : notes;
    }
    db.persist('amlAlerts', db.amlAlerts);

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      adminId: 'adm-aml',
      adminName: 'AML Compliance Officer',
      adminRole: role,
      action: 'AML_STATUS_CHANGE',
      targetType: 'system',
      targetId: alert.id,
      targetName: alert.refNumber,
      details: `Alert ${alert.refNumber} moved to ${status.toUpperCase()}. Notes: ${notes || 'N/A'}`,
      ipAddress: '10.240.12.44',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });
    db.persist('auditLogs', db.auditLogs);

    return JSON.parse(JSON.stringify(alert));
  },

  async createAmlCase(data: {
    alertId?: string;
    customerId: string;
    customerName: string;
    riskScore: number;
    totalVolumeUSD: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    narrativeSummary: string;
  }): Promise<AmlCase> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'aml', 'create');

    await simulateNetworkDelay(150);
    const caseNum = `AML-CASE-2026-${String(db.amlCases.length + 1).padStart(3, '0')}`;
    const newCase: AmlCase = {
      id: `aml-case-${Date.now()}`,
      caseNumber: caseNum,
      customerId: data.customerId,
      customerName: data.customerName,
      riskScore: data.riskScore,
      alertIds: data.alertId ? [data.alertId] : [],
      totalVolumeUSD: data.totalVolumeUSD,
      status: 'investigating',
      priority: data.priority,
      assignedAnalyst: 'Compliance & AML Committee',
      narrativeSummary: data.narrativeSummary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.amlCases.unshift(newCase);
    db.persist('amlCases', db.amlCases);

    if (data.alertId) {
      const alert = db.amlAlerts.find((a) => a.id === data.alertId);
      if (alert) {
        alert.status = 'reviewing';
        db.persist('amlAlerts', db.amlAlerts);
      }
    }

    return JSON.parse(JSON.stringify(newCase));
  },

  async fileSarReport(data: {
    customerId: string;
    customerName: string;
    suspectTransactions: string[];
    regulator: string;
    narrative: string;
    totalSuspiciousAmountUSD: number;
  }): Promise<AmlReport> {
    const role = adminRbacService.getActiveRole();
    adminRbacService.enforcePermission(role, 'aml', 'approve');

    await simulateNetworkDelay(180);
    const repNum = `SAR-2026-${String(db.amlReports.length + 1).padStart(4, '0')}`;
    const newReport: AmlReport = {
      id: `sar-${Date.now()}`,
      reportNumber: repNum,
      type: 'SAR',
      customerId: data.customerId,
      customerName: data.customerName,
      filingDate: new Date().toISOString().split('T')[0],
      status: 'submitted',
      regulator: data.regulator,
      suspectTransactions: data.suspectTransactions,
      narrative: data.narrative,
      preparedBy: `Certified AML Officer (${role})`,
      totalSuspiciousAmountUSD: data.totalSuspiciousAmountUSD,
    };

    db.amlReports.unshift(newReport);
    db.persist('amlReports', db.amlReports);

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      adminId: 'adm-fiu',
      adminName: 'Regulatory Filing Desk',
      adminRole: role,
      action: 'AML_SAR_FILED',
      targetType: 'customer',
      targetId: data.customerId,
      targetName: data.customerName,
      details: `Suspicious Activity Report ${repNum} filed with ${data.regulator} for $${data.totalSuspiciousAmountUSD.toLocaleString()}`,
      ipAddress: '10.240.12.44',
      timestamp: new Date().toISOString(),
      status: 'WARNING',
    });
    db.persist('auditLogs', db.auditLogs);

    return JSON.parse(JSON.stringify(newReport));
  },

  async getMetrics(): Promise<{
    totalAlerts: number;
    pepHits: number;
    sanctionCandidates: number;
    activeInvestigations: number;
    sarReportsSubmitted: number;
    monitoredVolumeUSD: number;
  }> {
    await simulateNetworkDelay(60);
    const alerts = db.amlAlerts;
    const cases = db.amlCases;
    const reports = db.amlReports;

    const pepHits = alerts.filter((a) => a.activityType === 'PEP Match Hit').length;
    const sanctionCandidates = alerts.filter((a) => a.activityType === 'Sanctions List Candidate').length;
    const activeInvestigations = cases.filter((c) => c.status === 'investigating' || c.status === 'open').length;
    const sarReportsSubmitted = reports.filter((r) => r.type === 'SAR' && r.status === 'submitted').length;
    const monitoredVolumeUSD = alerts.reduce((acc, a) => acc + a.amount, 0);

    return {
      totalAlerts: alerts.length,
      pepHits,
      sanctionCandidates,
      activeInvestigations,
      sarReportsSubmitted,
      monitoredVolumeUSD,
    };
  },
};
