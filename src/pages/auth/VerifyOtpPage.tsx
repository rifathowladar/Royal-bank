import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../backend/services/authService.ts';
import { useToast } from '../../hooks/index.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { OTPInput } from '../../components/ui/OTPInput.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import { ShieldCheck, ArrowRight, ArrowLeft, Smartphone, RefreshCw } from 'lucide-react';

export const VerifyOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const purpose = (searchParams.get('purpose') as any) || 'transaction';
  const target = searchParams.get('target') || 'registered security device';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { success, info } = useToast();
  const navigate = useNavigate();

  const handleVerify = async (codeToSubmit?: string) => {
    const code = codeToSubmit || otp;
    if (code.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await authService.verifyOtp(code, purpose);
    setLoading(false);

    if (res.success) {
      success('Verification Confirmed', res.message);
      navigate('/bank/dashboard');
    } else {
      setErrorMsg(res.message);
      setOtp('');
    }
  };

  const handleResend = async () => {
    await authService.resendOtp(target);
    info('Security Token Dispatched', `A new one-time passcode has been sent to ${target}.`);
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
          Verify Security Code
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          A 6-digit one-time password has been transmitted to <span className="font-semibold text-slate-700 dark:text-slate-300">{target}</span>.
        </p>

        {errorMsg && (
          <Alert variant="error" className="mb-4" onDismiss={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}

        <div className="py-2 mb-4">
          <OTPInput
            value={otp}
            onChange={setOtp}
            onComplete={(c) => handleVerify(c)}
            disabled={loading}
          />
        </div>

        <div className="text-xs text-slate-500 mb-6">
          <span>Demo verification code: </span>
          <button
            type="button"
            onClick={() => setOtp('123456')}
            className="font-mono font-bold text-royal-600 dark:text-gold-400 underline"
          >
            123456
          </button>
        </div>

        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={otp.length !== 6}
          isLoading={loading}
          onClick={() => handleVerify()}
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
        >
          Confirm Authorization
        </Button>

        <div className="mt-5 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResend}
            className="text-royal-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resend Passcode</span>
          </button>
          <Link to="/bank/login" className="hover:underline">
            Cancel
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
          <span>Complies with PSD2 RTS Strong Customer Authentication</span>
        </div>
      </div>
    </div>
  );
};
