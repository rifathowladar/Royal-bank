import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Percent, ShieldCheck, CheckCircle2, ArrowRight, Clock, Coins } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';

export const DepositsPage: React.FC = () => {
  const navigate = useNavigate();

  const depositTiers = [
    { months: 3, apy: '4.15%', minDeposit: '$10,000', interestPayout: 'At Maturity', guaranteed: true },
    { months: 6, apy: '4.65%', minDeposit: '$15,000', interestPayout: 'Monthly or Maturity', guaranteed: true },
    { months: 12, apy: '5.25%', minDeposit: '$25,000', interestPayout: 'Monthly Compounding', guaranteed: true, popular: true },
    { months: 24, apy: '5.00%', minDeposit: '$25,000', interestPayout: 'Quarterly', guaranteed: true },
    { months: 36, apy: '4.85%', minDeposit: '$50,000', interestPayout: 'Quarterly', guaranteed: true },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Guaranteed Yield Architecture
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Fixed Term Deposits Compounding at up to 5.25% APY.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Lock in sovereign-grade returns with zero exposure to equity market swings. Backed by institutional statutory deposit guarantees.
            </p>
          </div>
        </div>
      </section>

      {/* Rates Table */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Guaranteed Deposit Yield Board
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current active rates fixed upon contract date across USD, EUR, and GBP.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              No Advisory Fees · Guaranteed Principal
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6 font-semibold">Term Duration</th>
                  <th className="py-3 px-6 font-semibold">Annual Percentage Yield</th>
                  <th className="py-3 px-6 font-semibold">Minimum Deposit</th>
                  <th className="py-3 px-6 font-semibold">Interest Payment Frequency</th>
                  <th className="py-3 px-6 font-semibold">Capital Protection</th>
                  <th className="py-3 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {depositTiers.map((tier, idx) => (
                  <tr key={idx} className={tier.popular ? 'bg-gold-400/5 font-medium' : ''}>
                    <td className="py-4 px-6 text-slate-900 dark:text-white font-bold flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
                      <span>{tier.months} Months</span>
                      {tier.popular && (
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-gold-400 text-royal-950 font-bold">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      {tier.apy}
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                      {tier.minDeposit}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-sans">
                      {tier.interestPayout}
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-sans flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                      <span>Simulated Reserve Tier</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant={tier.popular ? 'gold' : 'outline'}
                        className="text-xs"
                        onClick={() => navigate('/bank/register')}
                      >
                        Lock Yield
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
