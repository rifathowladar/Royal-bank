import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { securityService } from '../../../backend/services/securityService.ts';
import {
  SecuritySettingsState,
  TrustedDevice,
  ActiveSession,
  LoginHistoryRecord,
} from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { QRCodeView } from '../../../components/common/QRCodeView.tsx';
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Fingerprint,
  Laptop,
  LogOut,
  History,
  Lock,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Plus,
} from 'lucide-react';

export const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<SecuritySettingsState | null>(null);
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms & Modals
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [pinForm, setPinForm] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Tab detection: /bank/security, /bank/security/password, /bank/security/pin, /bank/security/2fa, /bank/security/devices, /bank/security/sessions
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes('/password')) return 'password';
    if (path.includes('/pin')) return 'pin';
    if (path.includes('/2fa')) return '2fa';
    if (path.includes('/devices')) return 'devices';
    if (path.includes('/sessions')) return 'sessions';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'password' | 'pin' | '2fa' | 'devices' | 'sessions'>(
    getInitialTab()
  );

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [sets, devs, sess, hist] = await Promise.all([
        securityService.getSecuritySettings(user?.id || 'cust-001'),
        securityService.getTrustedDevices(),
        securityService.getActiveSessions(),
        securityService.getLoginHistory(),
      ]);
      setSettings(sets);
      setDevices(devs);
      setSessions(sess);
      setLoginHistory(hist);
    } catch (err: any) {
      toastError(err.message || 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user?.id]);

  useEffect(() => {
    const tab = getInitialTab();
    setActiveTab(tab);
  }, [location.pathname]);

  const handleTabChange = (tab: 'overview' | 'password' | 'pin' | '2fa' | 'devices' | 'sessions') => {
    setActiveTab(tab);
    if (tab === 'overview') navigate('/bank/security');
    else navigate(`/bank/security/${tab}`);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toastError('New passwords do not match');
      return;
    }
    if (passwordForm.new.length < 8) {
      toastError('Password must be at least 8 characters long');
      return;
    }
    try {
      setIsProcessing(true);
      await securityService.updatePassword(user?.id || 'cust-001', passwordForm.current, passwordForm.new);
      setPasswordForm({ current: '', new: '', confirm: '' });
      success('Master online banking password changed successfully!');
      const updated = await securityService.getSecuritySettings(user?.id || 'cust-001');
      setSettings(updated);
    } catch (err: any) {
      toastError(err.message || 'Password update failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinForm.new !== pinForm.confirm) {
      toastError('PIN confirmation does not match');
      return;
    }
    if (pinForm.new.length !== 6 || !/^\d+$/.test(pinForm.new)) {
      toastError('PIN must be exactly 6 numeric digits');
      return;
    }
    try {
      setIsProcessing(true);
      await securityService.updateTransactionPin(user?.id || 'cust-001', pinForm.current, pinForm.new);
      setPinForm({ current: '', new: '', confirm: '' });
      success('6-digit Transaction PIN updated successfully!');
      const updated = await securityService.getSecuritySettings(user?.id || 'cust-001');
      setSettings(updated);
    } catch (err: any) {
      toastError(err.message || 'PIN update failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean, method: 'sms' | 'authenticator' | 'email' = 'authenticator') => {
    try {
      setIsProcessing(true);
      const updated = await securityService.toggle2FA(user?.id || 'cust-001', enabled, method);
      setSettings(updated);
      if (enabled && method === 'authenticator') {
        setQrModalOpen(true);
      }
      success(`Two-Factor Authentication ${enabled ? 'Enabled' : 'Disabled'}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update 2FA status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleBiometrics = async (enabled: boolean) => {
    try {
      setIsProcessing(true);
      const updated = await securityService.toggleBiometrics(user?.id || 'cust-001', enabled);
      setSettings(updated);
      success(`Biometric Authentication ${enabled ? 'Enabled' : 'Disabled'}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update biometrics');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      const updated = await securityService.revokeTrustedDevice(deviceId);
      setDevices(updated);
      success('Device revoked from trusted list.');
    } catch (err: any) {
      toastError(err.message || 'Failed to revoke device');
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const updated = await securityService.terminateSession(sessionId);
      setSessions(updated);
      success('Session terminated successfully.');
    } catch (err: any) {
      toastError(err.message || 'Failed to terminate session');
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      setIsProcessing(true);
      const currentOnly = await securityService.logoutAllOtherSessions();
      setSessions(currentOnly);
      setLogoutModalOpen(false);
      success('All other remote devices logged out successfully.');
    } catch (err: any) {
      toastError(err.message || 'Logout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading sovereign security telemetry..." />;
  }

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-royal-950 via-royal-900 to-slate-950 p-6 md:p-8 text-white shadow-xl border border-gold-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Defense Grade Security Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300">
                2FA {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gold-100">
              Security Operations & Authentication Control
            </h1>
            <p className="text-royal-200 text-sm mt-1 max-w-2xl">
              Configure multi-factor credentials, transaction authorization PINs, authorized hardware tokens, and session management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogoutAllDevices}
              disabled={isProcessing}
              className="border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Logout All Devices
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Security Hub', icon: Shield },
            { id: 'password', label: 'Change Password', icon: Lock },
            { id: 'pin', label: 'Transaction PIN', icon: KeyRound },
            { id: '2fa', label: 'Two-Factor (2FA)', icon: Smartphone },
            { id: 'devices', label: 'Trusted Devices', icon: Laptop },
            { id: 'sessions', label: 'Active Sessions & Logs', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500 text-royal-950 font-semibold shadow-md'
                    : 'text-royal-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Toggle Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-royal-100 dark:bg-royal-900 text-royal-700 dark:text-gold-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">2FA Authentication</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {settings.twoFactorEnabled ? `Active via ${settings.twoFactorMethod}` : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.twoFactorEnabled}
                    onChange={(e) => handleToggle2FA(e.target.checked, settings.twoFactorMethod)}
                    className="w-5 h-5 text-gold-500 rounded focus:ring-gold-400 cursor-pointer"
                  />
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">Biometric Login</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Touch ID / Face ID quick access
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.biometricEnabled}
                    onChange={(e) => handleToggleBiometrics(e.target.checked)}
                    className="w-5 h-5 text-gold-500 rounded focus:ring-gold-400 cursor-pointer"
                  />
                </div>
              </Card>
            </div>

            {/* Quick Actions List */}
            <Card className="p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                Security Credentials & Keys
              </h3>

              <div className="divide-y divide-gray-100 dark:divide-navy-800 text-sm">
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Account Password</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last changed: {new Date(settings.lastPasswordChangeDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleTabChange('password')}>
                    Update Password
                  </Button>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">6-Digit Transaction PIN</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Required for wire authorizations & high-value transfers
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleTabChange('pin')}>
                    Update PIN
                  </Button>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Hardware & App 2FA</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Configured with TOTP Authenticator (Google / 1Password)
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleTabChange('2fa')}>
                    Configure 2FA
                  </Button>
                </div>
              </div>
            </Card>

            {/* Active Sessions Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  Active Connected Devices
                </h3>
                <Button variant="outline" size="sm" onClick={() => handleTabChange('sessions')} className="text-xs">
                  View All ({sessions.length})
                </Button>
              </div>

              <div className="space-y-3">
                {sessions.slice(0, 2).map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{s.deviceName}</span>
                        {s.isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            Current Device
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {s.city}, {s.country} • IP: {s.ipAddress} • {s.lastActivity}
                      </p>
                    </div>

                    {!s.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateSession(s.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Terminate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Security Rating & Tips */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-royal-900 to-navy-950 text-white border-gold-500/30">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-gold-200 text-sm">Security Health: 98/100</h3>
                  <p className="text-xs text-royal-200">Sovereign Vault Grade</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-royal-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>2FA Authenticator Hardware Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Biometric Facial Liveness Linked</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Session Timeout: 15 Minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant Login Telemetry Alerts Enabled</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Radio className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                Fraud Defense System
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Royal Bank's real-time risk engine continuously scans for anomalous IP velocity, SIM swap attacks, and credential stuffing vectors.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Password */}
      {activeTab === 'password' && (
        <Card className="p-6 md:p-8 max-w-2xl mx-auto">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Change Master Password
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Must be at least 8 characters long with uppercase, lowercase, numbers, and special symbols.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Current Password
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                New Password
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm New Password
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPass"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 text-gold-500 rounded focus:ring-gold-400"
              />
              <label htmlFor="showPass" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                Show passwords
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <Button type="submit" variant="primary" disabled={isProcessing}>
                {isProcessing ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: PIN */}
      {activeTab === 'pin' && (
        <Card className="p-6 md:p-8 max-w-2xl mx-auto">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Set / Update 6-Digit Transaction PIN
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your confidential 6-digit PIN is requested before executing wire transfers and debit authorizations.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Current PIN (Optional for first-time setup)
              </label>
              <Input
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={pinForm.current}
                onChange={(e) => setPinForm({ ...pinForm, current: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                New 6-Digit PIN
              </label>
              <Input
                type="password"
                maxLength={6}
                placeholder="6 numbers"
                value={pinForm.new}
                onChange={(e) => setPinForm({ ...pinForm, new: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm New 6-Digit PIN
              </label>
              <Input
                type="password"
                maxLength={6}
                placeholder="Re-enter 6 numbers"
                value={pinForm.confirm}
                onChange={(e) => setPinForm({ ...pinForm, confirm: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <Button type="submit" variant="primary" disabled={isProcessing}>
                {isProcessing ? 'Updating...' : 'Save Transaction PIN'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: 2FA */}
      {activeTab === '2fa' && (
        <Card className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Two-Factor Authentication (2FA) Methods
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select your primary verification channel for high-value transactions and new device logins.
            </p>
          </div>

          <div className="space-y-4">
            {/* Authenticator App */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                settings.twoFactorMethod === 'authenticator'
                  ? 'border-gold-500 bg-gold-500/5'
                  : 'border-gray-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-500">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        Authenticator App (Recommended)
                      </h4>
                      {settings.twoFactorMethod === 'authenticator' && settings.twoFactorEnabled && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-500">
                          Active Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Generate offline time-based one-time codes (TOTP) using Google Authenticator, 1Password, or YubiKey.
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleToggle2FA(true, 'authenticator');
                    setQrModalOpen(true);
                  }}
                  className="text-xs"
                >
                  View QR Code
                </Button>
              </div>
            </div>

            {/* SMS OTP */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                settings.twoFactorMethod === 'sms'
                  ? 'border-gold-500 bg-gold-500/5'
                  : 'border-gray-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-royal-500/10 text-royal-600 dark:text-gold-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">SMS One-Time Passwords</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Send verification codes directly to your registered mobile ({settings.twoFactorPhoneMasked}).
                    </p>
                  </div>
                </div>

                <Button
                  variant={settings.twoFactorMethod === 'sms' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleToggle2FA(true, 'sms')}
                  className="text-xs"
                >
                  {settings.twoFactorMethod === 'sms' ? 'Active' : 'Select SMS'}
                </Button>
              </div>
            </div>

            {/* Email OTP */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                settings.twoFactorMethod === 'email'
                  ? 'border-gold-500 bg-gold-500/5'
                  : 'border-gray-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-royal-500/10 text-royal-600 dark:text-gold-400">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Email Verification OTP</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Transmit verification codes to your confidential email ({settings.twoFactorEmailMasked}).
                    </p>
                  </div>
                </div>

                <Button
                  variant={settings.twoFactorMethod === 'email' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleToggle2FA(true, 'email')}
                  className="text-xs"
                >
                  {settings.twoFactorMethod === 'email' ? 'Active' : 'Select Email'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Devices */}
      {activeTab === 'devices' && (
        <Card className="p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Trusted Hardware & Biometric Terminals
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Devices permitted to access online banking without repeated step-up challenge verification.
            </p>
          </div>

          <div className="space-y-3">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-royal-100 dark:bg-royal-900 text-royal-700 dark:text-gold-400">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{dev.deviceName}</h4>
                      {dev.isCurrentDevice && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          Current Device
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      OS: {dev.operatingSystem} • Browser: {dev.browser} • IP: {dev.ipAddress}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Location: {dev.location} • First Trusted: {new Date(dev.firstUsed).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {!dev.isCurrentDevice && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeDevice(dev.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Revoke Trust
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Sessions & Logs */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <Card className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  Active Web & Mobile Sessions
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Active authentication tokens currently valid across global servers.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogoutModalOpen(true)}
                className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" /> Terminate Other Sessions
              </Button>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{sess.deviceName}</h4>
                      {sess.isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          Active Now (This Session)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {sess.city}, {sess.country} • IP: {sess.ipAddress} • {sess.browser} ({sess.os})
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Logged in: {new Date(sess.loginTime).toLocaleString()}
                    </p>
                  </div>

                  {!sess.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(sess.id)}
                      className="text-xs text-red-500"
                    >
                      Disconnect
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Login Audit Trail */}
          <Card className="p-6 md:p-8">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Recent Login & Security Audit Trail
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Device / Browser</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                  {loginHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-900/30">
                      <td className="py-2.5 px-3 font-mono">{new Date(item.timestamp).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono">{item.ipAddress}</td>
                      <td className="py-2.5 px-3">{item.location}</td>
                      <td className="py-2.5 px-3">
                        {item.device} ({item.browser})
                      </td>
                      <td className="py-2.5 px-3">
                        {item.status === 'success' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            Success
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-600 dark:text-red-400">
                            Blocked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TOTP Authenticator QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-700 text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Configure Authenticator App
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Scan this QR code with Google Authenticator, 1Password, or Authy.
            </p>

            {/* QR Code visual - generated completely client-side via local SVG */}
            <div className="bg-white p-4 rounded-xl inline-block shadow-md border border-gray-200 mb-4">
              <QRCodeView
                value="otpauth://totp/RoyalBank:AlexanderSterling?secret=JBSWY3DPEHPK3PXP&issuer=RoyalBank"
                size={176}
                includeLogo={false}
                className="mx-auto"
              />
            </div>

            <div className="bg-gray-50 dark:bg-navy-950 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 text-xs mb-4">
              <span className="text-gray-400 block text-[10px] uppercase">Manual Secret Key:</span>
              <span className="font-mono font-bold text-royal-700 dark:text-gold-400">
                JBSW Y3DP EHPK 3PXP
              </span>
            </div>

            <Button variant="primary" size="sm" onClick={() => setQrModalOpen(false)} className="w-full">
              Done & Verified
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Terminate Other Sessions */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Terminate Remote Sessions"
        subtitle="Sovereign Session Revocation"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLogoutModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogoutAllDevices}
              isLoading={isProcessing}
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              Confirm Terminate All
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to terminate all active sessions on other phones, laptops, and tablets?
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            This will immediately invalidate OAuth tokens and session credentials across all devices except this current browser session.
          </p>
        </div>
      </Modal>
    </div>
  );
};
