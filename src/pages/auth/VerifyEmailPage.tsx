import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../backend/services/authService.ts';
import { useToast } from '../../hooks/index.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { OTPInput } from '../../components/ui/OTPInput.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || 'alexander.sterling@royalbank.com';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { success } = useToast();
  const navigate = useNavigate();

  const handleVerify = async (codeToSubmit?: string) => {
    const val = codeToSubmit || code;
    if (val.length !== 6) return;

    setLoading(true);
    setErrorMsg(null);

    const res = await authService.verifyEmail(val);
    setLoading(false);

    if (res.success) {
      setIsVerified(true);
      success('Email Confirmed', 'Your contact email address has been verified.');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-royal-700 via-gold-400 to-royal-800" />

        <div className="flex justify-center mb-4">
          <BrandLogo to="/" />
        </div>

        {!isVerified ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-royal-50 dark:bg-royal-950/60 border border-royal-200 dark:border-royal-800 text-royal-600 dark:text-gold-400 mx-auto flex items-center justify-center mb-3">
              <Mail className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Verify Primary Email
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Enter the 6-digit confirmation code dispatched to{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{emailParam}</span>.
            </p>

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

            <p className="text-xs text-slate-400 mb-6">
              Demo code:{' '}
              <button
                type="button"
                onClick={() => setCode('123456')}
                className="font-mono text-royal-600 dark:text-gold-400 underline font-semibold"
              >
                123456
              </button>
            </p>

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
              Confirm Email Address
            </Button>
          </>
        ) : (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Email Address Confirmed
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your registered address has been linked with sovereign client status.
              </p>
            </div>

            <Button
              type="button"
              variant="gold"
              className="w-full"
              onClick={() => navigate('/bank/dashboard')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Continue to Private Client Vault
            </Button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
          <span>FIPS 140-2 Level 3 Cryptographic Security</span>
        </div>
      </div>
    </div>
  );
};
