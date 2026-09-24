import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import {
  SecuritySettingsState,
  TrustedDevice,
  ActiveSession,
  LoginHistoryRecord,
  Notification,
} from '../types/index.ts';

const defaultSecuritySettings: Record<string, SecuritySettingsState> = {
  'cust-001': {
    twoFactorEnabled: true,
    twoFactorMethod: 'authenticator',
    twoFactorPhoneMasked: '+1 (212) •••-0199',
    twoFactorEmailMasked: 'al•••••••@royalbank.com',
    biometricEnabled: true,
    loginAlertsEnabled: true,
    transactionPinSet: true,
    lastPasswordChangeDate: '2026-08-14T11:20:00Z',
    lastPinChangeDate: '2026-08-14T11:25:00Z',
    sessionTimeoutMinutes: 15,
    allowInternationalLogins: true,
  },
};

const defaultTrustedDevices: TrustedDevice[] = [
  {
    id: 'dev-mac-001',
    deviceName: 'MacBook Pro 16" M3 Max',
    deviceType: 'desktop',
    operatingSystem: 'macOS Sonoma 14.6',
    browser: 'Chrome 128.0 (Enterprise)',
    ipAddress: '198.51.100.42',
    location: 'New York, NY, United States',
    lastActive: 'Active Now (Current Session)',
    isCurrentDevice: true,
    isTrusted: true,
    firstUsed: '2025-01-10T09:00:00Z',
  },
  {
    id: 'dev-iphone-002',
    deviceName: 'iPhone 16 Pro Max',
    deviceType: 'mobile',
    operatingSystem: 'iOS 18.1',
    browser: 'Safari Mobile',
    ipAddress: '198.51.100.89',
    location: 'New York, NY, United States',
    lastActive: '2 hours ago',
    isCurrentDevice: false,
    isTrusted: true,
    firstUsed: '2025-09-20T14:15:00Z',
  },
  {
    id: 'dev-ipad-003',
    deviceName: 'iPad Pro 13" M4',
    deviceType: 'tablet',
    operatingSystem: 'iPadOS 18.0',
    browser: 'Safari 18.0',
    ipAddress: '192.0.2.14',
    location: 'London, United Kingdom (Roaming)',
    lastActive: '3 days ago',
    isCurrentDevice: false,
    isTrusted: true,
    firstUsed: '2025-11-04T18:30:00Z',
  },
];

const defaultActiveSessions: ActiveSession[] = [
  {
    id: 'sess-current-01',
    deviceName: 'MacBook Pro 16" M3 Max',
    deviceType: 'desktop',
    browser: 'Google Chrome 128.0',
    os: 'macOS Sonoma',
    ipAddress: '198.51.100.42',
    city: 'New York',
    country: 'United States',
    loginTime: '2026-09-23T06:14:00Z',
    lastActivity: 'Just now',
    isCurrent: true,
  },
  {
    id: 'sess-mobile-02',
    deviceName: 'iPhone 16 Pro Max',
    deviceType: 'mobile',
    browser: 'Safari Mobile',
    os: 'iOS 18.1',
    ipAddress: '198.51.100.89',
    city: 'New York',
    country: 'United States',
    loginTime: '2026-09-23T04:22:00Z',
    lastActivity: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 'sess-travel-03',
    deviceName: 'Private Terminal - London Mayfair Suite',
    deviceType: 'desktop',
    browser: 'Safari 18.0',
    os: 'macOS Sonoma',
    ipAddress: '82.165.197.1',
    city: 'London',
    country: 'United Kingdom',
    loginTime: '2026-09-20T19:30:00Z',
    lastActivity: '3 days ago',
    isCurrent: false,
  },
];

const defaultLoginHistory: LoginHistoryRecord[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-23T06:14:00Z',
    ipAddress: '198.51.100.42',
    location: 'New York, United States',
    device: 'MacBook Pro 16" M3 Max',
    browser: 'Chrome 128.0',
    status: 'success',
  },
  {
    id: 'log-002',
    timestamp: '2026-09-23T04:22:00Z',
    ipAddress: '198.51.100.89',
    location: 'New York, United States',
    device: 'iPhone 16 Pro Max (Face ID)',
    browser: 'Royal Bank iOS App',
    status: 'success',
  },
  {
    id: 'log-003',
    timestamp: '2026-09-22T19:30:00Z',
    ipAddress: '82.165.197.1',
    location: 'London, United Kingdom',
    device: 'Safari on macOS',
    browser: 'Safari 18.0',
    status: 'success',
  },
  {
    id: 'log-004',
    timestamp: '2026-09-21T02:11:00Z',
    ipAddress: '103.251.167.88',
    location: 'Frankfurt, Germany',
    device: 'Unknown Firefox Linux',
    browser: 'Firefox 120.0',
    status: 'failed',
    failureReason: '2FA TOTP Token Verification Failed (Blocked by Risk Guard)',
  },
  {
    id: 'log-005',
    timestamp: '2026-09-18T14:40:00Z',
    ipAddress: '198.51.100.42',
    location: 'New York, United States',
    device: 'MacBook Pro 16"',
    browser: 'Chrome 128.0',
    status: 'success',
  },
];

const STORAGE_KEY_SETTINGS = 'royal_bank_security_settings';
const STORAGE_KEY_DEVICES = 'royal_bank_trusted_devices';
const STORAGE_KEY_SESSIONS = 'royal_bank_active_sessions';
const STORAGE_KEY_HISTORY = 'royal_bank_login_history';

function loadSettings(): Record<string, SecuritySettingsState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(defaultSecuritySettings));
      return defaultSecuritySettings;
    }
    return JSON.parse(raw);
  } catch {
    return defaultSecuritySettings;
  }
}

function saveSettings(data: Record<string, SecuritySettingsState>) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save security settings', e);
  }
}

function loadDevices(): TrustedDevice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(defaultTrustedDevices));
      return defaultTrustedDevices;
    }
    return JSON.parse(raw);
  } catch {
    return defaultTrustedDevices;
  }
}

function saveDevices(devs: TrustedDevice[]) {
  try {
    localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(devs));
  } catch (e) {
    console.warn('Failed to save devices', e);
  }
}

function loadSessions(): ActiveSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(defaultActiveSessions));
      return defaultActiveSessions;
    }
    return JSON.parse(raw);
  } catch {
    return defaultActiveSessions;
  }
}

function saveSessions(sess: ActiveSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sess));
  } catch (e) {
    console.warn('Failed to save sessions', e);
  }
}

function loadHistory(): LoginHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(defaultLoginHistory));
      return defaultLoginHistory;
    }
    return JSON.parse(raw);
  } catch {
    return defaultLoginHistory;
  }
}

function saveHistory(hist: LoginHistoryRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(hist));
  } catch (e) {
    console.warn('Failed to save history', e);
  }
}

class SecurityService {
  async getSecuritySettings(customerId = 'cust-001'): Promise<SecuritySettingsState> {
    await simulateNetworkDelay(100);
    const sets = loadSettings();
    if (sets[customerId]) {
      return sets[customerId];
    }
    const init = { ...defaultSecuritySettings['cust-001'] };
    sets[customerId] = init;
    saveSettings(sets);
    return init;
  }

  async updatePassword(
    customerId: string,
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> {
    await simulateNetworkDelay(300);
    if (!currentPass || currentPass.length < 6) {
      throw new Error('Current password is incorrect.');
    }
    if (newPass.length < 8) {
      throw new Error('New password must be at least 8 characters long with numbers and symbols.');
    }

    const sets = loadSettings();
    const current = sets[customerId] || defaultSecuritySettings['cust-001'];
    current.lastPasswordChangeDate = new Date().toISOString();
    sets[customerId] = current;
    saveSettings(sets);

    // Notify user
    const notif: Notification = {
      id: `notif-pwd-${Date.now()}`,
      userId: customerId,
      title: 'Security Notice: Password Updated',
      message: 'Your Royal Bank online banking password was successfully updated.',
      type: 'security',
      priority: 'high',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/bank/security',
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return {
      success: true,
      message: 'Account password updated successfully across all online channels.',
    };
  }

  async updateTransactionPin(
    customerId: string,
    currentPin: string,
    newPin: string
  ): Promise<{ success: boolean; message: string }> {
    await simulateNetworkDelay(300);
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      throw new Error('PIN must be exactly 6 numeric digits.');
    }

    const sets = loadSettings();
    const current = sets[customerId] || defaultSecuritySettings['cust-001'];
    current.transactionPinSet = true;
    current.lastPinChangeDate = new Date().toISOString();
    sets[customerId] = current;
    saveSettings(sets);

    const notif: Notification = {
      id: `notif-pin-${Date.now()}`,
      userId: customerId,
      title: 'Transaction PIN Changed',
      message: 'Your 6-digit transaction authorization PIN was changed.',
      type: 'security',
      priority: 'high',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/bank/security',
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return {
      success: true,
      message: '6-digit Transaction PIN successfully updated.',
    };
  }

  async toggle2FA(
    customerId: string,
    enabled: boolean,
    method: 'sms' | 'authenticator' | 'email' = 'authenticator'
  ): Promise<SecuritySettingsState> {
    await simulateNetworkDelay(250);
    const sets = loadSettings();
    const current = sets[customerId] || defaultSecuritySettings['cust-001'];
    current.twoFactorEnabled = enabled;
    current.twoFactorMethod = method;
    sets[customerId] = current;
    saveSettings(sets);
    return current;
  }

  async toggleBiometrics(customerId: string, enabled: boolean): Promise<SecuritySettingsState> {
    await simulateNetworkDelay(200);
    const sets = loadSettings();
    const current = sets[customerId] || defaultSecuritySettings['cust-001'];
    current.biometricEnabled = enabled;
    sets[customerId] = current;
    saveSettings(sets);
    return current;
  }

  async updateSessionTimeout(customerId: string, minutes: number): Promise<SecuritySettingsState> {
    await simulateNetworkDelay(150);
    const sets = loadSettings();
    const current = sets[customerId] || defaultSecuritySettings['cust-001'];
    current.sessionTimeoutMinutes = minutes;
    sets[customerId] = current;
    saveSettings(sets);
    return current;
  }

  async getTrustedDevices(): Promise<TrustedDevice[]> {
    await simulateNetworkDelay(120);
    return loadDevices();
  }

  async revokeTrustedDevice(deviceId: string): Promise<TrustedDevice[]> {
    await simulateNetworkDelay(200);
    const list = loadDevices();
    const filtered = list.filter((d) => d.id !== deviceId);
    saveDevices(filtered);
    return filtered;
  }

  async addTrustedDevice(device: Partial<TrustedDevice>): Promise<TrustedDevice[]> {
    await simulateNetworkDelay(200);
    const list = loadDevices();
    const newDev: TrustedDevice = {
      id: `dev-${Date.now()}`,
      deviceName: device.deviceName || 'New Verified Terminal',
      deviceType: device.deviceType || 'desktop',
      operatingSystem: device.operatingSystem || 'macOS / Windows',
      browser: device.browser || 'Chrome Browser',
      ipAddress: device.ipAddress || '198.51.100.1',
      location: device.location || 'New York, United States',
      lastActive: 'Active Now',
      isCurrentDevice: false,
      isTrusted: true,
      firstUsed: new Date().toISOString(),
    };
    list.push(newDev);
    saveDevices(list);
    return list;
  }

  async getActiveSessions(): Promise<ActiveSession[]> {
    await simulateNetworkDelay(100);
    return loadSessions();
  }

  async terminateSession(sessionId: string): Promise<ActiveSession[]> {
    await simulateNetworkDelay(200);
    const sessions = loadSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    saveSessions(filtered);
    return filtered;
  }

  async logoutAllOtherSessions(): Promise<ActiveSession[]> {
    await simulateNetworkDelay(300);
    const sessions = loadSessions();
    const currentOnly = sessions.filter((s) => s.isCurrent);
    saveSessions(currentOnly);
    return currentOnly;
  }

  async getLoginHistory(): Promise<LoginHistoryRecord[]> {
    await simulateNetworkDelay(150);
    return loadHistory();
  }
}

export const securityService = new SecurityService();
