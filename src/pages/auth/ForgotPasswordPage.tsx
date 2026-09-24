import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../backend/services/authService.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import { ShieldCheck, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('alexander.sterling@royalbank.com');
  const [loading, setLoading] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setLoading(true);
    setErrorMsg(null);

    const res = await authService.requestPasswordReset(identifier);
    setLoading(false);

    if (res.success) {
      setMaskedEmail(res.maskedEmail);
      setResetToken(res.resetToken || 'demo_token');
      setDispatched(true);
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

        {!dispatched ? (
          <>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recover Client Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Enter your Customer ID or registered email address to receive password reset instructions.
            </p>

            {errorMsg && (
              <Alert variant="error" className="mb-4" onDismiss={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <Input
                label="Customer ID or Email Address"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. alexander@royalbank.com"
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
                Send Recovery Instructions
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <Link
                to="/bank/login"
                className="text-slate-500 hover:text-royal-600 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
              <Link
                to="/bank/contact"
                className="text-royal-600 dark:text-gold-400 font-medium hover:underline"
              >
                Contact Security Desk
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-5 text-left">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recovery Link Dispatched
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Instructions with an authorization token have been sent to{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{maskedEmail}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 block mb-1">Simulated Recovery Token:</span>
              <span className="font-mono font-bold text-royal-600 dark:text-gold-400 block break-all">
                {resetToken}
              </span>
            </div>

            <Button
              type="button"
              variant="gold"
              className="w-full"
              onClick={() => navigate(`/bank/reset-password?token=${resetToken}`)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Proceed to Reset Password
            </Button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
          <span>FIPS 140-2 Level 3 Secure Vault</span>
        </div>
      </div>
    </div>
  );
};
