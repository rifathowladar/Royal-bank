/**
 * Royal Bank Admin System Settings Service
 * Manages institutional banking parameters, security policies, fees, limits, and rates.
 */

import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { SystemSettings } from '../types/index.ts';
import { adminAuditService } from './adminAuditService.ts';

class AdminSettingsService {
  async getSettings(): Promise<SystemSettings> {
    await simulateNetworkDelay(60);
    return JSON.parse(JSON.stringify(db.settings));
  }

  async updateGeneralSettings(
    updates: Partial<SystemSettings['general']>,
    actorName = 'Victoria Ashford',
    actorEmployeeId = 'EMP-9101',
    actorRole = 'Super Admin'
  ): Promise<SystemSettings> {
    await simulateNetworkDelay(100);
    const oldVal = { ...db.settings.general };
    db.settings.general = { ...db.settings.general, ...updates };
    db.persist('systemSettings', db.settings);

    await adminAuditService.recordLog({
      user: actorName,
      employeeId: actorEmployeeId,
      role: actorRole,
      action: 'Update Institutional General Settings',
      module: 'Settings',
      resource: 'Core Banking General Parameters',
      oldValue: oldVal,
      newValue: db.settings.general,
      reason: 'Administrative update via supervisory console',
      ip: '10.240.12.18',
      device: 'Admin Console (Supervisory Station)',
      status: 'SUCCESS',
    });

    return JSON.parse(JSON.stringify(db.settings));
  }

  async updateSecuritySettings(
    updates: Partial<SystemSettings['security']>,
    actorName = 'Victoria Ashford',
    actorEmployeeId = 'EMP-9101',
    actorRole = 'Super Admin'
  ): Promise<SystemSettings> {
    await simulateNetworkDelay(100);
    const oldVal = { ...db.settings.security };
    db.settings.security = { ...db.settings.security, ...updates };
    db.persist('systemSettings', db.settings);

    await adminAuditService.recordLog({
      user: actorName,
      employeeId: actorEmployeeId,
      role: actorRole,
      action: 'Update System Security Policies',
      module: 'Security',
      resource: 'Zero-Trust Security Parameters & HSM',
      oldValue: oldVal,
      newValue: db.settings.security,
      reason: 'Periodic compliance security policy review',
      ip: '10.240.12.18',
      device: 'Admin Console (Supervisory Station)',
      status: 'SUCCESS',
    });

    return JSON.parse(JSON.stringify(db.settings));
  }

  async updateTransactionSettings(
    updates: Partial<SystemSettings['transactions']>,
    actorName = 'Victoria Ashford',
    actorEmployeeId = 'EMP-9101',
    actorRole = 'Super Admin'
  ): Promise<SystemSettings> {
    await simulateNetworkDelay(100);
    const oldVal = { ...db.settings.transactions };
    db.settings.transactions = { ...db.settings.transactions, ...updates };
    db.persist('systemSettings', db.settings);

    await adminAuditService.recordLog({
      user: actorName,
      employeeId: actorEmployeeId,
      role: actorRole,
      action: 'Update Transaction Clearing Rules',
      module: 'Transactions',
      resource: 'Straight-Through-Processing & Settlement Limits',
      oldValue: oldVal,
      newValue: db.settings.transactions,
      reason: 'Clearing and settlement threshold adjustment',
      ip: '10.240.12.18',
      device: 'Admin Console (Supervisory Station)',
      status: 'SUCCESS',
    });

    return JSON.parse(JSON.stringify(db.settings));
  }

  async updateFeeSettings(
    updates: Partial<SystemSettings['fees']>,
    actorName = 'Victoria Ashford',
    actorEmployeeId = 'EMP-9101',
    actorRole = 'Super Admin'
  ): Promise<SystemSettings> {
    await simulateNetworkDelay(100);
    const oldVal = { ...db.settings.fees };
    db.settings.fees = { ...db.settings.fees, ...updates };
    db.persist('systemSettings', db.settings);

    await adminAuditService.recordLog({
      user: actorName,
      employeeId: actorEmployeeId,
      role: actorRole,
      action: 'Update Institutional Tariff & Fee Schedule',
      module: 'Settings',
      resource: 'Global Fee Schedule',
      oldValue: oldVal,
      newValue: db.settings.fees,
      reason: 'Asset-Liability Committee tariff adjustment',
      ip: '10.240.12.18',
      device: 'Admin Console (Supervisory Station)',
      status: 'SUCCESS',
    });

    return JSON.parse(JSON.stringify(db.settings));
  }

  async updateLimitsSettings(
    updates: Partial<SystemSettings['limits']>,
    actorName = 'Victoria Ashford',
    actorEmployeeId = 'EMP-9101',
    actorRole = 'Super Admin'
  ): Promise<SystemSettings> {
    await simulateNetworkDelay(100);
    const oldVal = { ...db.settings.limits };
    db.settings.limits = { ...db.settings.limits, ...updates };
    db.persist('systemSettings', db.settings);

    await adminAuditService.recordLog({
      user: actorName,
      employeeId: actorEmployeeId,
      role: actorRole,
      action: 'Update Channel & Card Daily Limits',
      module: 'Accounts',
      resource: 'Core Channel Velocity & POS Limits',
      oldValue: oldVal,
      newValue: db.settings.limits,
      reason: 'Channel velocity limit update',
      ip: '10.240.12.18',
      device: 'Admin Console (Supervisory Station)',
      status: 'SUCCESS',
    });

    return JSON.parse(JSON.stringify(db.settings));
  }

  async updateNotificationSettings(
    updates: Partial<SystemSettings['notifications']>,
    actorName = 'Victoria Ashford',
    actorEmployeeId = 'EMP-9101',
    actorRole = 'Super Admin'
  ): Promise<SystemSettings> {
    await simulateNetworkDelay(100);
    const oldVal = { ...db.settings.notifications };
    db.settings.notifications = { ...db.settings.notifications, ...updates };
    db.persist('systemSettings', db.settings);

    await adminAuditService.recordLog({
      user: actorName,
      employeeId: actorEmployeeId,
      role: actorRole,
      action: 'Update Alert & Webhook Notifications',
      module: 'Settings',
      resource: 'Notification Dispatch Engine',
      oldValue: oldVal,
      newValue: db.settings.notifications,
      reason: 'Integration and operational webhook route update',
      ip: '10.240.12.18',
      device: 'Admin Console (Supervisory Station)',
      status: 'SUCCESS',
    });

    return JSON.parse(JSON.stringify(db.settings));
  }

  async updateRatesSettings(
    updates: Partial<SystemSettings['rates']>,
    actorName = 'Victoria Ashford',
    actorEmployeeId = 'EMP-9101',
    actorRole = 'Super Admin'
  ): Promise<SystemSettings> {
    await simulateNetworkDelay(100);
    const oldVal = { ...db.settings.rates };
    db.settings.rates = { ...db.settings.rates, ...updates };
    db.persist('systemSettings', db.settings);

    await adminAuditService.recordLog({
      user: actorName,
      employeeId: actorEmployeeId,
      role: actorRole,
      action: 'Update Institutional Benchmark Interest & Loan Rates',
      module: 'Settings',
      resource: 'Treasury Rates Table',
      oldValue: oldVal,
      newValue: db.settings.rates,
      reason: 'ALCO base rate adjustment passed',
      ip: '10.240.12.18',
      device: 'Admin Console (Supervisory Station)',
      status: 'SUCCESS',
    });

    return JSON.parse(JSON.stringify(db.settings));
  }
}

export const adminSettingsService = new AdminSettingsService();
