import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../backend/services/authService.ts';
import { useAuth, useToast } from '../../hooks/index.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import { ShieldAlert, ShieldCheck, Laptop, MapPin, Clock, Globe, ArrowRight } from 'lucide-react';

export const DeviceVerificationPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [deviceApproved, setDeviceApproved] = useState<boolean | null>(null);
  const { loginCustomer } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleApprove = async () => {
    setLoading(true);
    await authService.verifyDevice(true, 'Chrome on macOS (Zurich)');
    await loginCustomer('alexander.sterling@royalbank.com');
    setLoading(false);
    setDeviceApproved(true);
    success('Device Authorized', 'This browser has been registered as a trusted workstation.');
    setTimeout(() => {
      navigate('/bank/dashboard');
    }, 1200);
  };

  const handleDeny = async () => {
    setLoading(true);
    await authService.verifyDevice(false);
    setLoading(false);
    setDeviceApproved(false);
    error('Access Denied', 'Session blocked. Security team alerted.');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-gold-400 to-amber-600" />

        <div className="flex justify-center mb-4">
          <BrandLogo to="/" />
        </div>

        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 mx-auto flex items-center justify-center mb-3">
          <Laptop className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Device Verification
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
          Royal Bank detected a sign-in attempt from a previously unregistered hardware environment.
        </p>

        {deviceApproved === null ? (
          <>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2.5 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" /> Hardware Client
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Safari / macOS Sonoma 14.5
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> IP & Geolocation
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Zurich, CH · 194.230.14.92
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Timestamp
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  Just now
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500">Security Certificate</span>
                <span className="text-emerald-600 font-medium">Valid TLS 1.3 / EAL4+</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={loading}
                onClick={handleDeny}
              >
                Deny & Block
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                isLoading={loading}
                onClick={handleApprove}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Trust Device
              </Button>
            </div>
          </>
        ) : deviceApproved ? (
          <Alert variant="success" title="Device Authorized">
            Your workstation has been recorded in the secure hardware registry. Redirecting to your dashboard...
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert variant="error" title="Access Terminated">
              This sign-in attempt was rejected and recorded in compliance surveillance logs.
            </Alert>
            <Link to="/bank/login">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Real-time Anti-Fraud Anomaly Screening</span>
        </div>
      </div>
    </div>
  );
};
