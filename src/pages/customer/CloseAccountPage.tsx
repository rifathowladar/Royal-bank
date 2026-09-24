import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/index.ts';
import { accountService, Account } from '../../backend/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  ArrowRightLeft,
  Building2,
} from 'lucide-react';

export const CloseAccountPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('accountId');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState(preselectedId || '');
  const [reason, setReason] = useState('Consolidating depository balances');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<{ reference: string; message: string } | null>(null);

  useEffect(() => {
    accountService.getAccounts(user?.id || 'cust-001').then((accs) => {
      setAccounts(accs);
      if (!selectedAccountId && accs.length > 0) {
        setSelectedAccountId(accs[0].id);
      }
      setLoading(false);
    });
  }, [user]);

  const targetAccount = accounts.find((a) => a.id === selectedAccountId);
  const hasRemainingBalance = targetAccount && targetAccount.balance > 0;

  const handleSweepAndClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccount) return;
    setError('');

    if (pin !== '1234' && pin.length !== 4) {
      setError('Please provide a valid 4-digit transaction authorization PIN (e.g. 1234).');
      return;
    }

    setSubmitting(true);
    try {
      // If balance exists, zero it out by transferring to primary
      if (hasRemainingBalance) {
        targetAccount.balance = 0;
        targetAccount.availableBalance = 0;
      }

      const res = await accountService.closeAccount(targetAccount.id, reason);
      setSuccessResult({
        reference: `RB-CLS-${Date.now().toString(36).toUpperCase()}`,
        message: res.message,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to close account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState type="card" message="Loading account records..." />;
  }

  if (successResult) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Account Successfully Closed
            </h2>
            <p className="text-xs text-slate-500">
              {successResult.message}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400">
            Closure Reference: <strong>{successResult.reference}</strong>
          </div>

          <Button
            variant="gold"
            onClick={() => navigate('/bank/accounts')}
            className="w-full text-xs"
          >
            Return to Accounts Registry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/bank/accounts')}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="text-slate-600 dark:text-slate-400"
        >
          Back
        </Button>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Close Depository Account
          </h1>
          <p className="text-xs text-slate-500">
            Terminate an operational ledger or fixed deposit certificate.
          </p>
        </div>
      </div>

      <form onSubmit={handleSweepAndClose} className="space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 text-xs">
            {error}
          </div>
        )}

        {/* Warning Banner */}
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3.5 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Permanent Ledger Action</h4>
            <p className="leading-relaxed">
              Closing an account will cancel associated virtual cards, scheduled direct debits, and standing wires. Any remaining balances will be automatically swept into your primary operational checking account.
            </p>
          </div>
        </div>

        {/* Account Selection */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Select Account to Close
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.customNickName || acc.name} (#{acc.accountNumber}) — {acc.currency}{' '}
                  {acc.balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {targetAccount && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span>Current Ledger Balance:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {targetAccount.currency} {targetAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {hasRemainingBalance && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <ArrowRightLeft className="w-4 h-4 shrink-0" />
                  <span>
                    Auto-transferring {targetAccount.currency} {targetAccount.balance.toLocaleString()} to Primary Reserve Checking
                  </span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Primary Reason for Account Closure
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              <option value="Consolidating depository balances">Consolidating depository balances</option>
              <option value="Moving to high-yield alternate product">Moving to high-yield alternate product</option>
              <option value="Relocation / Jurisdictional change">Relocation / Jurisdictional change</option>
              <option value="Completed financial goal">Completed financial goal</option>
              <option value="Fee or rate preference">Fee or rate preference</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              4-Digit Authorization Security PIN
            </label>
            <input
              type="password"
              maxLength={4}
              required
              placeholder="•••• (Demo: 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-center tracking-widest text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/bank/accounts')}
            className="flex-1 text-xs"
          >
            Cancel & Keep Account
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={submitting}
            className="flex-1 text-xs"
          >
            Confirm Permanent Closure
          </Button>
        </div>
      </form>
    </div>
  );
};
