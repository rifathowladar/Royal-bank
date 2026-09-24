import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import {
  Sliders,
  Shield,
  ArrowRightLeft,
  DollarSign,
  Gauge,
  Bell,
  Building,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { SettingsSection } from '../../../components/admin/SettingsSection.tsx';
import {
  SettingsFormField,
  ToggleSwitch,
  NumberInput,
} from '../../../components/admin/SettingsForm.tsx';
import { PermissionGuard } from '../../../components/admin/PermissionGuard.tsx';
import { adminSettingsService } from '../../../backend/services/adminSettingsService.ts';
import { SystemSettings } from '../../../backend/types/index.ts';
import { useAdminPermissions } from '../../../hooks/index.ts';
import { useToast } from '../../../context/ToastContext.tsx';

export const AdminSettingsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const permissions = useAdminPermissions();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Derive active tab from URL path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const subroute = pathParts[2] || 'general'; // e.g. /admin/settings/security -> "security"

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const s = await adminSettingsService.getSettings();
        setSettings(s);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (section: keyof SystemSettings) => {
    if (!settings) return;
    setSavingSection(section);
    try {
      if (section === 'general') {
        await adminSettingsService.updateGeneralSettings(
          settings.general,
          permissions.roleTitle,
          'EMP-9101',
          permissions.role
        );
      } else if (section === 'security') {
        await adminSettingsService.updateSecuritySettings(
          settings.security,
          permissions.roleTitle,
          'EMP-9101',
          permissions.role
        );
      } else if (section === 'transactions') {
        await adminSettingsService.updateTransactionSettings(
          settings.transactions,
          permissions.roleTitle,
          'EMP-9101',
          permissions.role
        );
      } else if (section === 'fees') {
        await adminSettingsService.updateFeeSettings(
          settings.fees,
          permissions.roleTitle,
          'EMP-9101',
          permissions.role
        );
      } else if (section === 'limits') {
        await adminSettingsService.updateLimitsSettings(
          settings.limits,
          permissions.roleTitle,
          'EMP-9101',
          permissions.role
        );
      } else if (section === 'notifications') {
        await adminSettingsService.updateNotificationSettings(
          settings.notifications,
          permissions.roleTitle,
          'EMP-9101',
          permissions.role
        );
      } else if (section === 'rates') {
        await adminSettingsService.updateRatesSettings(
          settings.rates,
          permissions.roleTitle,
          'EMP-9101',
          permissions.role
        );
      }
      showToast('success', `${section.toUpperCase()} settings saved and logged to audit register.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save settings.');
    } finally {
      setSavingSection(null);
    }
  };

  const navTabs = [
    { id: 'general', label: 'General & Core', path: '/admin/settings/general', icon: Building },
    { id: 'security', label: 'Security & HSM', path: '/admin/settings/security', icon: Shield },
    { id: 'transactions', label: 'Transaction Clearing', path: '/admin/settings/transactions', icon: ArrowRightLeft },
    { id: 'fees', label: 'Fee Schedules', path: '/admin/settings/fees', icon: DollarSign },
    { id: 'limits', label: 'Channel Limits', path: '/admin/settings/limits', icon: Gauge },
    { id: 'notifications', label: 'Notifications & Hooks', path: '/admin/settings/notifications', icon: Bell },
  ];

  if (loading || !settings) {
    return (
      <div className="py-12 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
        <p className="text-xs mt-3">Loading central system parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Institutional System Configuration
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              RBS-CONFIG-V2
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Central parameters governing clearing thresholds, security cipher suites, MDR tariffs, and operational limits.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1 min-w-max pb-px">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = subroute === tab.id || (subroute === 'general' && tab.id === 'general' && location.pathname === '/admin/settings');
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-royal-900 text-royal-900 dark:border-amber-400 dark:text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENT: General */}
      {(subroute === 'general' || location.pathname === '/admin/settings') && (
        <div className="space-y-6">
          <SettingsSection
            title="Institutional Charter & Base Currency"
            description="Core identifiers for SWIFT settlement and operating jurisdiction."
            actions={
              <button
                type="button"
                onClick={() => handleSave('general')}
                disabled={savingSection === 'general'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === 'general' ? 'Saving...' : 'Save General'}</span>
              </button>
            }
          >
            <SettingsFormField
              label="Financial Institution Legal Name"
              description="Official registered corporate name displayed on customer receipts and wire advices."
            >
              <input
                type="text"
                value={settings.general.bankName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, bankName: e.target.value },
                  })
                }
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              />
            </SettingsFormField>

            <SettingsFormField
              label="SWIFT / BIC Routing Code"
              description="8-11 character standard correspondent banking identifier."
            >
              <input
                type="text"
                value={settings.general.swiftBic}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, swiftBic: e.target.value },
                  })
                }
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </SettingsFormField>

            <SettingsFormField
              label="Operating Timezone"
              description="Standard clearing day cut-off anchor."
            >
              <input
                type="text"
                value={settings.general.operatingTimezone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, operatingTimezone: e.target.value },
                  })
                }
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            </SettingsFormField>

            <SettingsFormField
              label="Maintenance Mode"
              description="Suspends retail customer logins while preserving admin operations."
            >
              <ToggleSwitch
                checked={settings.general.maintenanceMode}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, maintenanceMode: val },
                  })
                }
              />
            </SettingsFormField>
          </SettingsSection>
        </div>
      )}

      {/* TAB CONTENT: Security & HSM */}
      {subroute === 'security' && (
        <div className="space-y-6">
          <SettingsSection
            title="Zero-Trust Authentication & Session Controls"
            description="Policy thresholds for employee and customer session security."
            badge="ISO 27001"
            actions={
              <button
                type="button"
                onClick={() => handleSave('security')}
                disabled={savingSection === 'security'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === 'security' ? 'Saving...' : 'Save Security'}</span>
              </button>
            }
          >
            <SettingsFormField
              label="Inactivity Session Timeout"
              description="Minutes before idle user or staff sessions are terminated."
            >
              <NumberInput
                value={settings.security.sessionTimeoutMinutes}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeoutMinutes: val },
                  })
                }
                suffix="min"
                min={5}
                max={120}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Enforce Mandatory 2FA / MFA"
              description="Requires hardware TOTP token or biometric passkey for all logins."
            >
              <ToggleSwitch
                checked={settings.security.mfaEnforced}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, mfaEnforced: val },
                  })
                }
              />
            </SettingsFormField>

            <SettingsFormField
              label="Password Expiry Rotation"
              description="Forced credential renewal cycle for bank administrators."
            >
              <NumberInput
                value={settings.security.passwordExpiryDays}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, passwordExpiryDays: val },
                  })
                }
                suffix="days"
                min={30}
                max={365}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Max Failed Login Attempts"
              description="Lockout trigger threshold before administrative verification is required."
            >
              <NumberInput
                value={settings.security.maxFailedLoginAttempts}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, maxFailedLoginAttempts: val },
                  })
                }
                suffix="tries"
                min={3}
                max={10}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Hardware Security Module (HSM)"
              description="Dedicated cryptographic appliance for key storage and ledger signing."
            >
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" /> {settings.security.hardwareSecurityModuleStatus} (FIPS 140-3 Level 4)
              </span>
            </SettingsFormField>
          </SettingsSection>
        </div>
      )}

      {/* TAB CONTENT: Transactions */}
      {subroute === 'transactions' && (
        <div className="space-y-6">
          <SettingsSection
            title="Straight-Through Processing & Clearing Rules"
            description="Automated transaction limits and maker-checker dual authorization triggers."
            actions={
              <button
                type="button"
                onClick={() => handleSave('transactions')}
                disabled={savingSection === 'transactions'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === 'transactions' ? 'Saving...' : 'Save Clearing'}</span>
              </button>
            }
          >
            <SettingsFormField
              label="Single Transaction Straight-Through Limit"
              description="Maximum amount processed automatically without supervisory review."
            >
              <NumberInput
                value={settings.transactions.singleTransactionLimit}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    transactions: { ...settings.transactions, singleTransactionLimit: val },
                  })
                }
                prefix="$"
                step={5000}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Dual-Key Maker-Checker Trigger Threshold"
              description="Transfers equal to or above this value mandate secondary supervisor authorization."
            >
              <NumberInput
                value={settings.transactions.highValueThresholdApproval}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    transactions: { ...settings.transactions, highValueThresholdApproval: val },
                  })
                }
                prefix="$"
                step={5000}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Daily Customer Transfer Cap"
              description="Standard aggregate daily outbound velocity ceiling."
            >
              <NumberInput
                value={settings.transactions.dailyTransferLimit}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    transactions: { ...settings.transactions, dailyTransferLimit: val },
                  })
                }
                prefix="$"
                step={10000}
              />
            </SettingsFormField>

            <SettingsFormField
              label="New Beneficiary Cooling Period"
              description="Hours before a newly added external payee can receive high-value transfers."
            >
              <NumberInput
                value={settings.transactions.coolingPeriodHours}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    transactions: { ...settings.transactions, coolingPeriodHours: val },
                  })
                }
                suffix="hrs"
                min={0}
                max={72}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Auto-Reconciliation Engine"
              description="Continuously reconciles SWIFT and local clearing rails against core ledger."
            >
              <ToggleSwitch
                checked={settings.transactions.autoReconciliationEnabled}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    transactions: { ...settings.transactions, autoReconciliationEnabled: val },
                  })
                }
              />
            </SettingsFormField>
          </SettingsSection>
        </div>
      )}

      {/* TAB CONTENT: Fees & Rates */}
      {subroute === 'fees' && (
        <div className="space-y-6">
          <SettingsSection
            title="Institutional Tariff & Fee Schedule"
            description="Published fee structures for domestic transfers, wires, and QR merchant acquiring."
            actions={
              <button
                type="button"
                onClick={() => handleSave('fees')}
                disabled={savingSection === 'fees'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === 'fees' ? 'Saving...' : 'Save Fees'}</span>
              </button>
            }
          >
            <SettingsFormField
              label="Domestic Transfer Fee"
              description="Internal book transfers and local ACH clearing fees."
            >
              <NumberInput
                value={settings.fees.domesticTransferFee}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    fees: { ...settings.fees, domesticTransferFee: val },
                  })
                }
                prefix="$"
                step={1}
              />
            </SettingsFormField>

            <SettingsFormField
              label="International SWIFT Wire Percentage"
              description="Cross-border wire tariff percentage on gross transfer amount."
            >
              <NumberInput
                value={settings.fees.internationalWireFeePercent}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    fees: { ...settings.fees, internationalWireFeePercent: val },
                  })
                }
                suffix="%"
                step={0.01}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Minimum Wire Fee Floor"
              description="Minimum fee deducted for international remittances."
            >
              <NumberInput
                value={settings.fees.minimumWireFee}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    fees: { ...settings.fees, minimumWireFee: val },
                  })
                }
                prefix="$"
                step={5}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Merchant QR MDR (Acquiring Fee)"
              description="Merchant discount rate deducted on EMVCo contactless QR settlements."
            >
              <NumberInput
                value={settings.fees.qrMerchantMdrPercent}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    fees: { ...settings.fees, qrMerchantMdrPercent: val },
                  })
                }
                suffix="%"
                step={0.05}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Out-of-Network ATM Surcharge"
              description="Fee assessed on foreign ATM cash withdrawals."
            >
              <NumberInput
                value={settings.fees.atmOutNetworkFee}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    fees: { ...settings.fees, atmOutNetworkFee: val },
                  })
                }
                prefix="$"
                step={0.5}
              />
            </SettingsFormField>
          </SettingsSection>

          {/* Interest & Loan Rates Section */}
          <SettingsSection
            title="Treasury Benchmark Interest & Loan Rates"
            description="Base benchmark rates set by ALCO for deposits, savings, and mortgages."
            actions={
              <button
                type="button"
                onClick={() => handleSave('rates')}
                disabled={savingSection === 'rates'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === 'rates' ? 'Saving...' : 'Save Rates'}</span>
              </button>
            }
          >
            <SettingsFormField
              label="1-Year Fixed Deposit (FDR) Yield"
              description="Annual percentage yield guaranteed for 12-month certificates."
            >
              <NumberInput
                value={settings.rates.fdrFixedDepositRate1Yr}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    rates: { ...settings.rates, fdrFixedDepositRate1Yr: val },
                  })
                }
                suffix="% APY"
                step={0.05}
              />
            </SettingsFormField>

            <SettingsFormField
              label="High Yield Savings Base Annual Rate"
              description="Liquid sovereign savings account yield."
            >
              <NumberInput
                value={settings.rates.savingsInterestRateAnnual}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    rates: { ...settings.rates, savingsInterestRateAnnual: val },
                  })
                }
                suffix="% APY"
                step={0.05}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Prime Lending Rate (Benchmark)"
              description="Royal Bank commercial prime benchmark for enterprise borrowers."
            >
              <NumberInput
                value={settings.rates.primeLendingRate}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    rates: { ...settings.rates, primeLendingRate: val },
                  })
                }
                suffix="% APR"
                step={0.1}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Residential Mortgage Base Rate"
              description="Underwriting base for 30-year fixed home purchase facilities."
            >
              <NumberInput
                value={settings.rates.homeLoanBaseRate}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    rates: { ...settings.rates, homeLoanBaseRate: val },
                  })
                }
                suffix="% APR"
                step={0.1}
              />
            </SettingsFormField>
          </SettingsSection>
        </div>
      )}

      {/* TAB CONTENT: Limits */}
      {subroute === 'limits' && (
        <div className="space-y-6">
          <SettingsSection
            title="Channel Velocity & Card Limits"
            description="Terminal transaction limits across ATM, POS, e-commerce, and P2P rails."
            actions={
              <button
                type="button"
                onClick={() => handleSave('limits')}
                disabled={savingSection === 'limits'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === 'limits' ? 'Saving...' : 'Save Limits'}</span>
              </button>
            }
          >
            <SettingsFormField
              label="Daily ATM Cash Withdrawal Limit"
              description="Maximum physical cash dispenser volume per debit card."
            >
              <NumberInput
                value={settings.limits.dailyAtmLimit}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    limits: { ...settings.limits, dailyAtmLimit: val },
                  })
                }
                prefix="$"
                step={500}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Daily POS In-Store Purchase Limit"
              description="Maximum physical card terminal swipe or contactless tap limit."
            >
              <NumberInput
                value={settings.limits.dailyPosLimit}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    limits: { ...settings.limits, dailyPosLimit: val },
                  })
                }
                prefix="$"
                step={1000}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Daily Online E-Commerce Card Limit"
              description="Maximum card-not-present (CNP) 3D-Secure transaction velocity."
            >
              <NumberInput
                value={settings.limits.dailyOnlineLimit}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    limits: { ...settings.limits, dailyOnlineLimit: val },
                  })
                }
                prefix="$"
                step={1000}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Instant QR Scan Payment Limit"
              description="Single transaction maximum on merchant QR terminal scans."
            >
              <NumberInput
                value={settings.limits.instantQrLimit}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    limits: { ...settings.limits, instantQrLimit: val },
                  })
                }
                prefix="$"
                step={500}
              />
            </SettingsFormField>

            <SettingsFormField
              label="Corporate Account Daily Outflow Ceiling"
              description="Maximum institutional treasury disbursement without board resolution."
            >
              <NumberInput
                value={settings.limits.corporateDailyLimit}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    limits: { ...settings.limits, corporateDailyLimit: val },
                  })
                }
                prefix="$"
                step={50000}
              />
            </SettingsFormField>
          </SettingsSection>
        </div>
      )}

      {/* TAB CONTENT: Notifications */}
      {subroute === 'notifications' && (
        <div className="space-y-6">
          <SettingsSection
            title="Operational Alerting & Compliance Dispatch"
            description="Multi-channel notification triggers for high-value flows and suspicious activity."
            actions={
              <button
                type="button"
                onClick={() => handleSave('notifications')}
                disabled={savingSection === 'notifications'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === 'notifications' ? 'Saving...' : 'Save Notifications'}</span>
              </button>
            }
          >
            <SettingsFormField
              label="High-Value Alert Threshold"
              description="Transactions exceeding this value instantly dispatch an SMS/Email alert to customer."
            >
              <NumberInput
                value={settings.notifications.highValueAlertThresholdUSD}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, highValueAlertThresholdUSD: val },
                  })
                }
                prefix="$"
                step={1000}
              />
            </SettingsFormField>

            <SettingsFormField
              label="SMS Carrier Gateway Dispatch"
              description="Send automated real-time SMS for OTP verification and card authorizations."
            >
              <ToggleSwitch
                checked={settings.notifications.smsAlertsEnabled}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, smsAlertsEnabled: val },
                  })
                }
              />
            </SettingsFormField>

            <SettingsFormField
              label="Email Notification Service"
              description="Send daily PDF transaction statements and login device verification alerts."
            >
              <ToggleSwitch
                checked={settings.notifications.emailAlertsEnabled}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailAlertsEnabled: val },
                  })
                }
              />
            </SettingsFormField>

            <SettingsFormField
              label="Daily Executive Digest"
              description="Automated 06:00 EST morning briefing sent to senior bank administrators."
            >
              <ToggleSwitch
                checked={settings.notifications.dailyExecutiveDigest}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, dailyExecutiveDigest: val },
                  })
                }
              />
            </SettingsFormField>

            <SettingsFormField
              label="Slack SIEM / SOC Integration"
              description="Forward high-severity AML and fraud triggers to internal security channels."
            >
              <ToggleSwitch
                checked={settings.notifications.slackComplianceIntegration}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, slackComplianceIntegration: val },
                  })
                }
              />
            </SettingsFormField>
          </SettingsSection>
        </div>
      )}
    </div>
  );
};
