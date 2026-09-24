import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../backend/services/authService.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { PasswordInput } from '../../components/ui/PasswordInput.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'token_demo_sample';

  const [password, setPassword] = useState('NewSecurePass2026!');
  const [confirmPassword, setConfirmPassword] = useState('NewSecurePass2026!');
  const [loading, setLoading] = useState(false);
  const [successComplete, setSuccessComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setErrorMsg('Password must be at least 8 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const result = await authService.resetPassword(token, password);
    setLoading(false);

    if (result.success) {
      setSuccessComplete(true);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-royal-700 via-gold-400 to-royal-800" />

        <div className="flex justify-center mb-4">
          <BrandLogo to="/" />
        </div>

        {!successComplete ? (
          <>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Define New Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Establish a robust cryptographic passkey for your Royal Bank account.
            </p>

            {errorMsg && (
              <Alert variant="error" className="mb-4" onDismiss={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleReset} className="space-y-4 text-left">
              <PasswordInput
                label="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showStrengthMeter
                required
              />

              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Update Password & Re-authenticate
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Password Successfully Updated
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your new security passkey is active across all global banking nodes.
              </p>
            </div>

            <Button
              type="button"
              variant="gold"
              className="w-full"
              onClick={() => navigate('/bank/login')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign In with New Password
            </Button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
          <span>Encrypted with SHA-256 / AES-GCM</span>
        </div>
      </div>
    </div>
  );
};
