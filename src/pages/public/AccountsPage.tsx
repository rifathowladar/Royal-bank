import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();

  const accounts = [
    {
      name: 'Premier Checking',
      tagline: 'Day-to-day liquidity & wires',
      minBalance: '$1,000',
      apy: '1.75%',
      monthlyFee: '$0 (with min balance)',
      features: [
        'Unlimited domestic & SEPA transfers',
        'Complimentary contactless debit card',
        'Full mobile & web banking suite',
        'Automated bill pay & direct debits',
      ],
      idealFor: 'Everyday personal liquidity',
    },
    {
      name: 'Multi-Currency Vault',
      tagline: 'Cross-border multi-ledger portfolio',
      minBalance: '$10,000',
      apy: 'Up to 3.50%',
      monthlyFee: '$0',
      features: [
        'USD, EUR, GBP, CHF, and SGD ledgers',
        'Real-time FX conversions at mid-market',
        'Direct local IBANs and clearing codes',
        'Integrated SWIFT GPI transfer tracker',
      ],
      idealFor: 'International professionals & expats',
    },
    {
      name: 'Fixed Yield Deposit',
      tagline: 'Guaranteed capital compounding',
      minBalance: '$25,000',
      apy: '5.25%',
      monthlyFee: '$0',
      features: [
        'Guaranteed fixed return over 3–36 months',
        'Protected by statutory deposit schemes',
        'Monthly interest payout or re-investment',
        'Zero management fees or commissions',
      ],
      idealFor: 'Low-risk capital preservation',
    },
    {
      name: 'Sovereign Private Reserve',
      tagline: 'Bespoke high-net-worth depository',
      minBalance: '$250,000',
      apy: 'Custom Tiered',
      monthlyFee: 'Waived',
      features: [
        'Appointed personal Private Banker',
        'Physical tungsten metal card included',
        'Lombard margin borrowing facilities',
        'VIP concierge and bullion custody access',
      ],
      idealFor: 'Family offices & wealth preservation',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Account Selection
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Accounts Engineered for Capital Security.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Compare our accounts to find the ideal balance of yield, multi-currency access, and private banking privileges.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accounts.map((acc, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-gold-400/80 transition-all"
            >
              <div>
                <span className="text-[11px] font-semibold text-royal-600 dark:text-gold-400 uppercase tracking-wider">
                  {acc.idealFor}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {acc.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{acc.tagline}</p>

                <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Interest APY</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                      {acc.apy}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Min. Deposit</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      {acc.minBalance}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  {acc.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="gold"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate('/bank/register')}
                >
                  Open This Account
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
