import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, useToast } from '../../hooks/index.ts';
import { authService } from '../../backend/services/authService.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { PasswordInput } from '../../components/ui/PasswordInput.tsx';
import { OTPInput } from '../../components/ui/OTPInput.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import {
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Smartphone,
  KeyRound,
  Laptop,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('alexander.sterling@royalbank.com');
  const [password, setPassword] = useState('VaultSecure2026!');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Secondary challenge states
  const [challengeStep, setChallengeStep] = useState<'credentials' | '2fa' | 'device'>('credentials');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempToken, setTempToken] = useState<string | undefined>(undefined);

  const { loginCustomer } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = (location.state as any)?.from?.pathname || '/bank/dashboard';

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await authService.login({
        identifier,
        password,
        rememberDevice,
      });

      setLoading(false);

      if (!result.success) {
        setErrorMessage(result.message || 'Authentication failed. Please verify your credentials.');
        return;
      }

      if (result.requires2FA) {
        setTempToken(result.tempToken);
        setChallengeStep('2fa');
        return;
      }

      if (result.requiresDeviceVerification) {
        setChallengeStep('device');
        return;
      }

      // Successful login
      await loginCustomer(identifier);
      success('Secure Session Initialized', `Welcome to Royal Bank, ${result.user?.firstName || 'Client'}.`);
      navigate(destination, { replace: true });
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('A network security exception occurred. Please try again.');
    }
  };

  const handleVerify2FA = async (codeToSubmit?: string) => {
    const code = codeToSubmit || twoFactorCode;
    if (code.length !== 6) return;

    setLoading(true);
    setErrorMessage(null);

    const result = await authService.verify2FA(code, tempToken);
    setLoading(false);

    if (result.success) {
      await loginCustomer(identifier);
      success('Identity Confirmed', 'Two-factor cryptographic challenge verified.');
      navigate(destination, { replace: true });
    } else {
      setErrorMessage(result.message || 'Invalid two-factor authentication code.');
      setTwoFactorCode('');
    }
  };

  const handleDemoFill = async () => {
    setIdentifier('alexander.sterling@royalbank.com');
    setPassword('VaultSecure2026!');
    setLoading(true);
    await loginCustomer('alexander.sterling@royalbank.com');
    setLoading(false);
    success('Demo Access Granted', 'Logged in as Alexander Sterling (Private Client).');
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 my-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Royal Gold accent line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-royal-700 via-gold-400 to-royal-800" />

        <div className="flex justify-center mb-4">
          <BrandLogo to="/" />
        </div>

        {challengeStep === 'credentials' && (
          <>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Client Online Banking
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Access your sovereign reserve, multi-currency ledgers, and wire vaults.
            </p>

            {/* Portfolio Demo Notice */}
            <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-900 dark:text-amber-200">
              <span className="font-semibold">Demo Simulation:</span> Fictitious banking portal. Pre-filled with demo credentials. Do not enter real passwords or personal data.
            </div>

            {errorMessage && (
              <Alert variant="error" className="mb-4" onDismiss={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-left">
              <Input
                label="Customer ID / Email"
                type="text"
                placeholder="e.g. RB-992014 or alexander@royalbank.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />

              <PasswordInput
                label="Security Password"
                placeholder="Enter client password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded border-slate-300 text-royal-600 focus:ring-royal-500"
                  />
                  <span>Remember this device</span>
                </label>
                <Link
                  to="/bank/forgot-password"
                  className="text-royal-600 dark:text-royal-400 font-medium hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Authenticate Securely
              </Button>
            </form>

            <div className="mt-5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
              <span>New to Royal Bank?</span>
              <Link
                to="/bank/register"
                className="text-royal-600 dark:text-gold-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Open an Account</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Quick Demo Fill */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-2">Simulate Client Verification:</span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleDemoFill}
                  className="text-[11px] py-1.5"
                  icon={<UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  Instant Login
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setChallengeStep('2fa')}
                  className="text-[11px] py-1.5"
                  icon={<Smartphone className="w-3.5 h-3.5 text-royal-600" />}
                >
                  Test 2FA Step
                </Button>
              </div>
            </div>
          </>
        )}

        {challengeStep === '2fa' && (
          <div className="space-y-5 text-left">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-royal-50 dark:bg-royal-950/60 border border-royal-200 dark:border-royal-800 text-royal-600 dark:text-gold-400 mx-auto flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Two-Factor Challenge
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Enter the 6-digit cryptographic security code from your Authenticator app or registered SMS device.
              </p>
            </div>

            {errorMessage && (
              <Alert variant="error" onDismiss={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            <div className="py-2">
              <OTPInput
                value={twoFactorCode}
                onChange={setTwoFactorCode}
                onComplete={(code) => handleVerify2FA(code)}
                disabled={loading}
              />
            </div>

            <div className="text-center">
              <p className="text-[11px] text-slate-400">
                Demo code: <span className="font-mono font-semibold text-royal-600 dark:text-gold-400">123456</span> or any 6 digits
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setChallengeStep('credentials')}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                disabled={twoFactorCode.length !== 6}
                isLoading={loading}
                onClick={() => handleVerify2FA()}
              >
                Verify Token
              </Button>
            </div>
          </div>
        )}

        {challengeStep === 'device' && (
          <div className="space-y-4 text-left">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 mx-auto flex items-center justify-center mb-3">
                <Laptop className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                New Device Authorization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A login request originated from an unrecognized browser environment.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Detected Client</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Chrome on macOS 14.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IP Location</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Zurich, Switzerland (194.230.14.92)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security Audit</span>
                <span className="text-emerald-600 font-medium">No Known Vulnerabilities</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setChallengeStep('credentials')}
              >
                Deny & Exit
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1 text-xs"
                onClick={async () => {
                  setLoading(true);
                  await authService.verifyDevice(true);
                  await loginCustomer(identifier);
                  setLoading(false);
                  navigate(destination, { replace: true });
                }}
              >
                Authorize Device
              </Button>
            </div>
          </div>
        )}

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
          <span>FIPS 140-2 Level 3 Cryptographic Security</span>
        </div>
      </div>
    </div>
  );
};
