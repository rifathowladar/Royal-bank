import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/index.ts';
import { accountService, Account, AccountType } from '../../backend/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import {
  Wallet,
  Landmark,
  PiggyBank,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Calendar,
  Building2,
} from 'lucide-react';

export const OpenAccountPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [existingAccounts, setExistingAccounts] = useState<Account[]>([]);
  const [selectedType, setSelectedType] = useState<AccountType>('savings');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'CHF' | 'SGD'>('USD');
  const [accountName, setAccountName] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [initialDeposit, setInitialDeposit] = useState<number>(5000);
  const [branch, setBranch] = useState('New York Wall Street Flagship');

  // DPS fields
  const [monthlyInstallment, setMonthlyInstallment] = useState<number>(1000);
  const [tenureMonths, setTenureMonths] = useState<number>(36);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<Account | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    accountService.getAccounts(user?.id || 'cust-001').then((accs) => {
      setExistingAccounts(accs);
      if (accs.length > 0) {
        setSourceAccountId(accs[0].id);
      }
    });
  }, [user]);

  // Projected returns calculation
  const calculateDPSMaturity = () => {
    const totalContributed = monthlyInstallment * tenureMonths;
    const rate = 0.0625; // 6.25%
    const estimatedInterest = totalContributed * rate * (tenureMonths / 24);
    return Math.round(totalContributed + estimatedInterest);
  };

  const calculateFDRMaturity = () => {
    const rate = 0.055; // 5.50%
    return Math.round(initialDeposit * (1 + rate * (tenureMonths / 12)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sourceAcc = existingAccounts.find((a) => a.id === sourceAccountId);
    if (!sourceAcc || sourceAcc.balance < initialDeposit) {
      setError('Insufficient funds in the selected funding account for initial deposit.');
      return;
    }

    setSubmitting(true);
    try {
      const newAcc = await accountService.openAccount({
        customerId: user?.id || 'cust-001',
        name: accountName || (selectedType === 'dps' ? 'Royal Wealth DPS Scheme' : selectedType === 'fdr' ? 'Imperial Fixed Deposit Receipt' : 'New Depository Account'),
        type: selectedType,
        currency,
        initialDeposit,
        branch,
        monthlyInstallment: selectedType === 'dps' ? monthlyInstallment : undefined,
        tenureMonths: selectedType === 'dps' || selectedType === 'fdr' ? tenureMonths : undefined,
      });

      setCreatedAccount(newAcc);
    } catch (err: any) {
      setError(err?.message || 'Failed to open account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdAccount) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Account Provisioned Successfully
            </h2>
            <p className="text-xs text-slate-500">
              Your new sovereign depository ledger is immediately active and encrypted.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Account Number</span>
              <strong className="text-slate-900 dark:text-white">{createdAccount.accountNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">IBAN</span>
              <span className="text-slate-700 dark:text-slate-300">{createdAccount.iban}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Opening Balance</span>
              <span className="text-emerald-600 font-bold">
                {createdAccount.currency} {createdAccount.balance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account Type</span>
              <span className="capitalize">{createdAccount.type}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate('/bank/accounts')}
              className="flex-1 text-xs"
            >
              All Accounts
            </Button>
            <Button
              variant="gold"
              onClick={() => navigate(`/bank/accounts/${createdAccount.id}`)}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="flex-1 text-xs"
            >
              View New Vault
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
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
            Open Depository Account
          </h1>
          <p className="text-xs text-slate-500">
            Provision personal checking, high-yield reserves, periodic DPS schemes, or guaranteed FDR notes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Select Account Product Type */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Select Depository Vehicle
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              {
                type: 'savings',
                title: 'High Yield Savings Vault',
                rate: '4.85% APY',
                desc: 'Daily compound interest, zero lock-in, unrestricted liquidity wires.',
                icon: <PiggyBank className="w-4 h-4 text-emerald-500" />,
              },
              {
                type: 'checking',
                title: 'Premier Checking Ledger',
                rate: '1.25% APY',
                desc: 'Day-to-day operational liquidity, international debit card privileges.',
                icon: <Landmark className="w-4 h-4 text-royal-600 dark:text-gold-400" />,
              },
              {
                type: 'dps',
                title: 'Deposit Pension Scheme (DPS)',
                rate: '6.25% Fixed',
                desc: 'Automated monthly recurring savings with guaranteed compounding return.',
                icon: <TrendingUp className="w-4 h-4 text-gold-500" />,
              },
              {
                type: 'fdr',
                title: 'Fixed Deposit Receipt (FDR)',
                rate: '5.50% Fixed',
                desc: 'Guaranteed lump-sum certificate yield for fixed maturities (6 - 36 months).',
                icon: <ShieldCheck className="w-4 h-4 text-blue-500" />,
              },
              {
                type: 'multi_currency',
                title: 'Multi-Currency Foreign Vault',
                rate: 'Wholesale FX',
                desc: 'Hold and clear natively in GBP, CHF, EUR, or SGD.',
                icon: <Wallet className="w-4 h-4 text-purple-500" />,
              },
            ].map((p) => (
              <label
                key={p.type}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  selectedType === p.type
                    ? 'border-royal-600 dark:border-gold-400 bg-royal-50/40 dark:bg-royal-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      {p.icon}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{p.title}</div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {p.rate}
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="accountType"
                    checked={selectedType === p.type}
                    onChange={() => setSelectedType(p.type as AccountType)}
                    className="mt-1"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{p.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Step 2: Product Specific Terms (if DPS or FDR) */}
        {selectedType === 'dps' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. DPS Scheme Parameters & Term Yield
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Monthly Installment Deposit ($)
                </label>
                <select
                  value={monthlyInstallment}
                  onChange={(e) => setMonthlyInstallment(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                >
                  <option value={250}>$250 / Month</option>
                  <option value={500}>$500 / Month</option>
                  <option value={1000}>$1,000 / Month</option>
                  <option value={2500}>$2,500 / Month</option>
                  <option value={5000}>$5,000 / Month</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Tenure Term
                </label>
                <select
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value={12}>1 Year (12 Months)</option>
                  <option value={24}>2 Years (24 Months)</option>
                  <option value={36}>3 Years (36 Months)</option>
                  <option value={60}>5 Years (60 Months)</option>
                </select>
              </div>
            </div>

            {/* Projected Maturity Callout */}
            <div className="p-4 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-xs flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Projected Payout at Maturity</span>
                <div className="text-xl font-extrabold font-mono text-royal-950 dark:text-gold-400">
                  ${calculateDPSMaturity().toLocaleString()}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <span>Principal: ${monthlyInstallment * tenureMonths}</span>
                <span className="block text-emerald-600 font-bold">+6.25% Fixed Compound</span>
              </div>
            </div>
          </div>
        )}

        {selectedType === 'fdr' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Fixed Deposit Lock-in Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Term Duration
                </label>
                <select
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value={6}>6 Months (5.10% APY)</option>
                  <option value={12}>12 Months (5.25% APY)</option>
                  <option value={24}>24 Months (5.50% APY)</option>
                  <option value={36}>36 Months (5.75% APY)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Maturity Settlement
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  Auto-Credit Principal & Interest to Operational Ledger
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Guaranteed Maturity Amount</span>
                <div className="text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                  ${calculateFDRMaturity().toLocaleString()}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <span>Principal: ${initialDeposit.toLocaleString()}</span>
                <span className="block text-emerald-600 font-bold">+5.50% Guaranteed Fixed</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Depository Currency, Initial Funding & Domicile */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. Account Details & Initial Funding
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Account Alias / Custom Name
              </label>
              <input
                type="text"
                placeholder="e.g. Zurich Sovereign Depot, Family Trust Reserve"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Base Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
              >
                <option value="USD">USD - United States Dollar ($)</option>
                <option value="GBP">GBP - British Pound Sterling (£)</option>
                <option value="EUR">EUR - European Euro (€)</option>
                <option value="CHF">CHF - Swiss Franc (CHF)</option>
                <option value="SGD">SGD - Singapore Dollar (S$)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Initial Opening Deposit Amount ({currency})
              </label>
              <input
                type="number"
                min={100}
                required
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Funding Account Source
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                {existingAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.customNickName || acc.name} (${acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Primary Branch Domicile
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="New York Wall Street Flagship">New York Wall Street Flagship</option>
                <option value="London Mayfair Global Pavilion">London Mayfair Global Pavilion</option>
                <option value="Zurich Bahnhofstrasse Pavilion">Zurich Bahnhofstrasse Pavilion</option>
                <option value="Singapore Marina Bay Financial Tower">Singapore Marina Bay Financial Tower</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/bank/accounts')}
            className="flex-1 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            isLoading={submitting}
            className="flex-1 text-xs"
          >
            Confirm & Open Account
          </Button>
        </div>
      </form>
    </div>
  );
};
