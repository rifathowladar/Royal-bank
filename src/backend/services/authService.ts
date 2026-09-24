import { Customer, User, RegistrationPayload, RegistrationResult, AuthSession } from '../types/index.ts';
import { getDatabase, saveDatabase, getStorageItem, setStorageItem, removeStorageItem, simulateLatency } from '../mockApi/storage.ts';

const SESSION_STORAGE_KEY = 'royal_bank_auth_session';
const PENDING_REGISTRATION_KEY = 'royal_bank_pending_registration';
const REMEMBERED_DEVICES_KEY = 'royal_bank_remembered_devices';

export interface LoginResult {
  success: boolean;
  user?: User;
  session?: AuthSession;
  requires2FA?: boolean;
  requiresDeviceVerification?: boolean;
  deviceInfo?: {
    id: string;
    name: string;
    location: string;
    ipAddress: string;
  };
  tempToken?: string;
  message?: string;
}

export interface OtpVerificationResult {
  success: boolean;
  message: string;
  token?: string;
}

/**
 * Authentication Service for Royal Bank
 * Handles all authentication, 2FA, OTP verification, device trust, and customer registration.
 * Pure service layer with decoupled business logic.
 */
export const authService = {
  /**
   * Primary Login handler
   */
  async login(credentials: {
    identifier: string;
    password?: string;
    rememberDevice?: boolean;
  }): Promise<LoginResult> {
    await simulateLatency(300);
    const db = getDatabase();
    const cleanId = credentials.identifier.trim().toLowerCase();

    // Check customer pool
    let customer = db.customers.find(
      (c) =>
        c.email.toLowerCase() === cleanId ||
        c.customerNumber.toLowerCase() === cleanId ||
        cleanId === 'alexander' ||
        cleanId === 'alexander.sterling'
    );

    // If identifier doesn't match default, check if any registered customer exists
    if (!customer && db.customers.length > 0) {
      customer = db.customers[0];
    }

    if (!customer) {
      return {
        success: false,
        message: 'No account matching the supplied Customer ID or email address was found in our registry.',
      };
    }

    // Check device trust if not remembered
    const rememberedDevices = getStorageItem<string[]>(REMEMBERED_DEVICES_KEY, ['device_primary_macbook']);
    const currentDeviceId = 'device_current_' + (credentials.rememberDevice ? 'trusted' : 'unverified');

    // Simulate 2FA requirement for Private Client & Sovereign tiers
    if (customer.twoFactorEnabled) {
      const tempToken = `tmp_2fa_${Date.now()}_${customer.id}`;
      return {
        success: true,
        requires2FA: true,
        user: customer,
        tempToken,
        message: 'Secondary authentication challenge initiated.',
      };
    }

    // Create session
    const session: AuthSession = {
      token: `rb_token_${Date.now()}_${customer.id}`,
      user: customer,
      requires2FA: false,
      requiresDeviceVerification: false,
      expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    };

    setStorageItem(SESSION_STORAGE_KEY, session);
    setStorageItem('royal_bank_current_user', customer);

    if (credentials.rememberDevice) {
      if (!rememberedDevices.includes(currentDeviceId)) {
        rememberedDevices.push(currentDeviceId);
        setStorageItem(REMEMBERED_DEVICES_KEY, rememberedDevices);
      }
    }

    return {
      success: true,
      user: customer,
      session,
      message: 'Authentication successful. Access to Private Client Vault granted.',
    };
  },

  /**
   * Verify Two-Factor Authentication code (TOTP / SMS)
   */
  async verify2FA(code: string, tempToken?: string): Promise<LoginResult> {
    await simulateLatency(250);
    const cleanCode = code.trim().replace(/\D/g, '');

    // Allow '123456' or any 6-digit number in demo environment
    if (cleanCode.length !== 6) {
      return {
        success: false,
        message: 'The two-factor security token must consist of exactly 6 numeric digits.',
      };
    }

    const db = getDatabase();
    const customer = db.customers[0]; // Active demo account

    const session: AuthSession = {
      token: `rb_token_2fa_${Date.now()}_${customer?.id || 'demo'}`,
      user: customer,
      requires2FA: false,
      requiresDeviceVerification: false,
      expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    };

    setStorageItem(SESSION_STORAGE_KEY, session);
    setStorageItem('royal_bank_current_user', customer);

    return {
      success: true,
      user: customer,
      session,
      message: 'Two-factor token validated with cryptographic assurance.',
    };
  },

  /**
   * Device Verification Approval
   */
  async verifyDevice(approved: boolean, deviceName: string = 'Authorized Workstation'): Promise<boolean> {
    await simulateLatency(250);
    if (!approved) return false;

    const remembered = getStorageItem<string[]>(REMEMBERED_DEVICES_KEY, []);
    remembered.push(`device_${Date.now()}_${encodeURIComponent(deviceName)}`);
    setStorageItem(REMEMBERED_DEVICES_KEY, remembered);
    return true;
  },

  /**
   * Multi-Step Customer Onboarding & Registration
   */
  async registerCustomer(payload: RegistrationPayload): Promise<RegistrationResult> {
    await simulateLatency(400);
    const db = getDatabase();

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const customerId = `cust_rb_${randomSuffix}`;
    const customerNumber = `RB-${randomSuffix}`;
    const accountNumber = `0429-8812-${Math.floor(1000 + Math.random() * 9000)}`;
    const iban = `GB82ROYAL04298812${randomSuffix}`;

    const newCustomer: Customer = {
      id: customerId,
      customerNumber,
      email: payload.contact.email,
      firstName: payload.personal.firstName,
      lastName: payload.personal.lastName,
      phone: payload.contact.phone,
      role: 'customer',
      status: 'active',
      tier: 'Premier',
      dateOfBirth: payload.personal.dateOfBirth,
      nationalIdMasked: `•••• ${payload.identity.idNumber.slice(-4) || '8912'}`,
      address: {
        line1: payload.contact.streetAddress,
        city: payload.contact.city,
        state: payload.contact.state,
        postalCode: payload.contact.postalCode,
        country: payload.contact.country,
      },
      kycStatus: 'verified',
      riskScore: 'Low',
      twoFactorEnabled: true,
      createdAt: new Date().toISOString(),
      totalBalanceUSD: 10000.0,
    };

    // Add checking account
    db.customers.push(newCustomer);
    db.accounts.push({
      id: `acc_${Date.now()}`,
      customerId: newCustomer.id,
      accountNumber,
      iban,
      swiftBic: 'ROYALGB2L',
      currency: 'USD',
      name: 'Premier Liquidity Account',
      type: 'checking',
      balance: 10000.0,
      availableBalance: 10000.0,
      ledgerBalance: 10000.0,
      status: 'active',
      openedAt: new Date().toISOString(),
      interestRateAnnual: 2.25,
      branch: 'London Mayfair Global Pavilion',
      accountHolder: `${newCustomer.firstName} ${newCustomer.lastName}`,
    });

    db.persist('customers', db.customers);
    db.persist('accounts', db.accounts);

    // Auto-login into created account
    const session: AuthSession = {
      token: `rb_token_reg_${Date.now()}_${customerId}`,
      user: newCustomer,
      requires2FA: false,
      requiresDeviceVerification: false,
      expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    };
    setStorageItem(SESSION_STORAGE_KEY, session);
    setStorageItem('royal_bank_current_user', newCustomer);

    return {
      success: true,
      customerId,
      customerNumber,
      accountNumber,
      iban,
      user: newCustomer,
      message: 'Private Client Account successfully provisioned. Welcome to Royal Bank.',
    };
  },

  /**
   * Generic One-Time Password Verification
   */
  async verifyOtp(code: string, purpose: 'registration' | 'reset' | 'login' | 'email' = 'registration'): Promise<OtpVerificationResult> {
    await simulateLatency(250);
    const clean = code.trim().replace(/\D/g, '');

    // Allow 123456 or any 6 digit input in demo mode
    if (clean.length === 6) {
      return {
        success: true,
        message: 'Security one-time passcode successfully validated.',
        token: `otp_auth_${Date.now()}`,
      };
    }

    return {
      success: false,
      message: 'Invalid security code. Please input the 6-digit authentication token sent to your device.',
    };
  },

  /**
   * Resend One-Time Password
   */
  async resendOtp(target: string): Promise<{ success: boolean; message: string }> {
    await simulateLatency(200);
    return {
      success: true,
      message: `A new 6-digit cryptographic verification code has been dispatched to ${target || 'your registered contact channel'}.`,
    };
  },

  /**
   * Request Password Reset token
   */
  async requestPasswordReset(identifier: string): Promise<{ success: boolean; resetToken?: string; maskedEmail: string; message: string }> {
    await simulateLatency(300);
    const cleanId = identifier.trim().toLowerCase();
    const db = getDatabase();

    const customer = db.customers.find(
      (c) => c.email.toLowerCase() === cleanId || c.customerNumber.toLowerCase() === cleanId
    ) || db.customers[0];

    const maskedEmail = customer?.email
      ? customer.email.replace(/(.{2})(.*)(?=@)/, (_gp, a, b) => a + '•'.repeat(b.length))
      : 'al••••••••@royalbank.com';

    return {
      success: true,
      resetToken: `rst_${Date.now()}_${customer?.id || 'demo'}`,
      maskedEmail,
      message: `Password reset authorization instructions dispatched to ${maskedEmail}.`,
    };
  },

  /**
   * Complete Password Reset
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    await simulateLatency(350);
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        message: 'New password must contain at least 8 characters including mixed case, numerals, and a symbol.',
      };
    }

    return {
      success: true,
      message: 'Your banking passkey has been successfully updated. Please authenticate with your new credentials.',
    };
  },

  /**
   * Verify Registered Email
   */
  async verifyEmail(code: string): Promise<{ success: boolean; message: string }> {
    await simulateLatency(250);
    if (code.trim().length >= 4) {
      return {
        success: true,
        message: 'Customer email address successfully certified and locked.',
      };
    }
    return {
      success: false,
      message: 'Invalid email verification token.',
    };
  },

  /**
   * Retrieve active session
   */
  getCurrentSession(): AuthSession | null {
    return getStorageItem<AuthSession | null>(SESSION_STORAGE_KEY, null);
  },

  /**
   * Terminate Active Session
   */
  async logout(): Promise<void> {
    await simulateLatency(150);
    removeStorageItem(SESSION_STORAGE_KEY);
    removeStorageItem('royal_bank_current_user');
  },
};
