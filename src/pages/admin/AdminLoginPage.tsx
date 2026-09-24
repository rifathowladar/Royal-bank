import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useToast } from '../../hooks/index.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { ShieldAlert, KeyRound, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@royalbank.com');
  const [password, setPassword] = useState('••••••••••••');
  const [token, setToken] = useState('890 142');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
  const roleMismatch = (location.state as any)?.roleMismatch;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await loginAdmin(email);
    setLoading(false);

    if (ok) {
      success('Supervisory Credentials Verified', 'Access granted to Royal Bank Core.');
      navigate(from, { replace: true });
    } else {
      error('Authentication Denied', 'Invalid administrator credentials or token.');
    }
  };

  const handleDemoFill = async () => {
    setEmail('admin@royalbank.com');
    setPassword('SuperAdminMasterKey2026!');
    setLoading(true);
    await loginAdmin('admin@royalbank.com');
    setLoading(false);
    success('Supervisory Override Active', 'Logged in as Victoria Ashford (Super Admin).');
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-500" />

        <div className="flex justify-center mb-4">
          <BrandLogo to="/" variant="admin" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Administrative Terminal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Surveillance, Compliance, Core Ledgers & Fraud Governance
        </p>

        {roleMismatch && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs text-left">
            Administrative privileges required. Please authenticate with supervisory credentials.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <Input
            label="Supervisory Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Master Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4" />}
            required
          />

          <Input
            label="Hardware Token (TOTP)"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            helperText="Simulated YubiKey / RSA SecurID passcode"
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
            Authenticate Terminal
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-2.5">Demo Admin Access:</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDemoFill}
            className="w-full text-xs"
            icon={<ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
          >
            Instant Admin Sign In (Victoria Ashford)
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>All sessions logged into immutable audit vault</span>
        </div>
      </div>
    </div>
  );
};
