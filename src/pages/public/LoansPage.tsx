import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Calculator,
  Percent,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';

export const LoansPage: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState('500000');
  const [interestRate, setInterestRate] = useState('4.75');
  const [loanYears, setLoanYears] = useState('20');
  const navigate = useNavigate();

  const calculateMonthlyPayment = () => {
    const P = parseFloat(loanAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12;
    const n = (parseInt(loanYears, 10) || 1) * 12;

    if (r === 0) {
      const m = P / n;
      return {
        monthly: m.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalPayment: P.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalInterest: '0.00',
      };
    }
    const monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthly * n;
    const totalInterest = totalPayment - P;

    return {
      monthly: monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalPayment: totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalInterest: totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
  };

  const results = calculateMonthlyPayment();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Header */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Sovereign Credit & Facilities
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Flexible Capital Facilities for Prime Opportunities.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Bespoke real estate mortgages in global capital cities, lombard securities lines of credit, and corporate working capital backed by liquid assets.
            </p>
          </div>
        </div>
      </section>

      {/* Facilities & Calculator */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Facilities list */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-royal-600 dark:text-gold-400 uppercase tracking-wider">
                Residential Mortgages
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Prime International Real Estate Finance
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Structured financing for luxury residences in London, Zurich, Geneva, Paris, and Manhattan. Available in multi-currency structures to hedge exchange risk.
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-500">
                <span>Rates from 4.25% APR</span>
                <span>·</span>
                <span>Terms up to 30 years</span>
                <span>·</span>
                <span>LTV up to 75%</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-royal-600 dark:text-gold-400 uppercase tracking-wider">
                Asset-Backed Liquidity
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Lombard Portfolio Credit Facilities
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Draw instantaneous cash credit against qualifying government bonds, blue-chip equities, and precious metals without triggering taxable capital gains events.
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-500">
                <span>SOFR / SONIA + 1.25%</span>
                <span>·</span>
                <span>Same-day drawdowns</span>
                <span>·</span>
                <span>Zero prepayment fees</span>
              </div>
            </div>
          </div>

          {/* Loan Calculator */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <Calculator className="w-4 h-4 text-royal-600 dark:text-gold-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Loan EMI & Repayment Calculator
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Mortgage Principal (USD)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Amortization Term (Years)</label>
                <select
                  value={loanYears}
                  onChange={(e) => setLoanYears(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-xs"
                >
                  <option value="5">5 Years (Short Term)</option>
                  <option value="10">10 Years</option>
                  <option value="15">15 Years</option>
                  <option value="20">20 Years (Standard)</option>
                  <option value="25">25 Years</option>
                  <option value="30">30 Years</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-royal-50/60 dark:bg-royal-950/40 border border-royal-200/60 dark:border-royal-900/60 space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Estimated Monthly EMI:</span>
                  <span className="font-mono font-bold text-royal-600 dark:text-gold-400 text-base">
                    ${results.monthly}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Interest Payable:</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    ${results.totalInterest}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-royal-200/40 dark:border-royal-900/40">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Total Repayable:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${results.totalPayment}
                  </span>
                </div>
              </div>

              <Button
                variant="gold"
                className="w-full text-xs"
                onClick={() => navigate('/contact')}
              >
                Inquire with Lending Director
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
