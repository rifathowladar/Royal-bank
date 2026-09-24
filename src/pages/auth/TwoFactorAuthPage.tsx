import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../backend/services/authService.ts';
import { useAuth, useToast } from '../../hooks/index.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { OTPInput } from '../../components/ui/OTPInput.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import { ShieldCheck, ArrowRight, Smartphone, Key, Lock } from 'lucide-react';

export const TwoFactorAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [code, setCode] = useState('');
  const [method, setMethod] = useState<'app' | 'sms'>('app');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { loginCustomer } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleVerify = async (codeToSubmit?: string) => {
    const val = codeToSubmit || code;
    if (val.length !== 6) return;

    setLoading(true);
    setErrorMsg(null);

    const res = await authService.verify2FA(val, token);
    setLoading(false);

    if (res.success) {
      await loginCustomer('alexander.sterling@royalbank.com');
      success('Secondary Authentication Verified', 'Access to online vaults initialized.');
      navigate('/bank/dashboard');
    } else {
      setErrorMsg(res.message || 'Verification failed');
      setCode('');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-royal-700 via-gold-400 to-royal-800" />

        <div className="flex justify-center mb-4">
          <BrandLogo to="/" />
        </div>

        <div className="w-12 h-12 rounded-2xl bg-royal-50 dark:bg-royal-950/60 border border-royal-200 dark:border-royal-800 text-royal-600 dark:text-gold-400 mx-auto flex items-center justify-center mb-3">
          <Smartphone className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Secondary Security Verification
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
          Two-Factor Authentication is mandated for all Sovereign & Private Client treasury accounts.
        </p>

        {/* Method Toggle */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setMethod('app')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              method === 'app'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Authenticator App (TOTP)
          </button>
          <button
            type="button"
            onClick={() => setMethod('sms')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              method === 'sms'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            SMS Mobile OTP
          </button>
        </div>

        {errorMsg && (
          <Alert variant="error" className="mb-4" onDismiss={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}

        <div className="py-2 mb-4">
          <OTPInput
            value={code}
            onChange={setCode}
            onComplete={(c) => handleVerify(c)}
            disabled={loading}
          />
        </div>

        <div className="text-xs text-slate-500 mb-6">
          <span>Demo 2FA Token: </span>
          <button
            type="button"
            onClick={() => setCode('123456')}
            className="font-mono font-bold text-royal-600 dark:text-gold-400 underline"
          >
            123456 (Click to autofill)
          </button>
        </div>

        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={code.length !== 6}
          isLoading={loading}
          onClick={() => handleVerify()}
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
        >
          Verify Cryptographic Token
        </Button>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <Link to="/bank/login" className="hover:underline">
            Back to Login
          </Link>
          <Link to="/bank/forgot-password" className="text-royal-600 dark:text-gold-400 font-medium hover:underline">
            Lost Authenticator?
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
          <span>Hardware Security Module (HSM) Backed</span>
        </div>
      </div>
    </div>
  );
};
