import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Landmark,
  PiggyBank,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';

interface AccountSummaryProps {
  savingsTotal: number;
  currentTotal: number;
  dpsTotal: number;
  fdrTotal: number;
  accountCount: number;
  onOpenNew?: () => void;
  className?: string;
}

export const AccountSummary: React.FC<AccountSummaryProps> = ({
  savingsTotal,
  currentTotal,
  dpsTotal,
  fdrTotal,
  accountCount,
  onOpenNew,
  className = '',
}) => {
  const navigate = useNavigate();

  const items = [
    {
      title: 'Current & Checking',
      desc: 'Operational liquidity & clearing',
      amount: currentTotal,
      currency: 'USD',
      icon: <Landmark className="w-4 h-4 text-royal-600 dark:text-gold-400" />,
      tag: 'Liquid',
      type: 'checking',
    },
    {
      title: 'High Yield Savings',
      desc: 'Compounding reserve interest',
      amount: savingsTotal,
      currency: 'USD',
      icon: <PiggyBank className="w-4 h-4 text-emerald-500" />,
      tag: '4.85% APY',
      type: 'savings',
    },
    {
      title: 'Deposit Pension (DPS)',
      desc: 'Monthly systematic wealth plan',
      amount: dpsTotal,
      currency: 'USD',
      icon: <TrendingUp className="w-4 h-4 text-gold-500" />,
      tag: '6.25% Fixed',
      type: 'dps',
    },
    {
      title: 'Fixed Deposits (FDR)',
      desc: 'Guaranteed term deposit notes',
      amount: fdrTotal,
      currency: 'USD',
      icon: <ShieldCheck className="w-4 h-4 text-blue-500" />,
      tag: '5.50% Fixed',
      type: 'fdr',
    },
  ];

  return (
    <div
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Depository Portfolio Architecture
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {accountCount} active depository vault accounts
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => (onOpenNew ? onOpenNew() : navigate('/bank/accounts/open'))}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Open New Account
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => navigate('/bank/accounts')}
            className="group cursor-pointer p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-gold-400/60 dark:hover:border-gold-400/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700/60">
                {item.icon}
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {item.tag}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
            </div>

            <div className="pt-2 border-t border-slate-200/40 dark:border-slate-700/40 font-mono font-bold text-slate-900 dark:text-white text-sm">
              ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
