import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';

interface BalanceCardProps {
  totalBalance: number;
  availableBalance: number;
  savingsTotal?: number;
  currentTotal?: number;
  dpsTotal?: number;
  fdrTotal?: number;
  currency?: string;
  onSendMoney?: () => void;
  onDeposit?: () => void;
  className?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  availableBalance,
  savingsTotal = 0,
  currentTotal = 0,
  dpsTotal = 0,
  fdrTotal = 0,
  currency = 'USD',
  onSendMoney,
  onDeposit,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const formatAmount = (num: number) => {
    if (!isVisible) return '••••••••';
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-royal-950 via-slate-900 to-royal-950 text-white border border-gold-500/30 p-6 sm:p-8 shadow-xl ${className}`}
    >
      {/* Decorative ambient gradients */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-royal-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Main Balance Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Consolidated Net Liquidity
            </span>
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              aria-label={isVisible ? 'Hide Balance' : 'Show Balance'}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <TrendingUp className="w-3 h-3" /> +4.2% YTD
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-mono">
              {formatAmount(totalBalance)}
            </h2>
            <span className="text-xs text-slate-400 font-mono">USD Eqv</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
            <span>
              Available to Wire:{' '}
              <strong className="text-white font-mono">{formatAmount(availableBalance)}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-gold-300">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" /> FIPS 140-2 Custody
            </span>
          </div>
        </div>

        {/* Quick Balance Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {onSendMoney && (
            <Button
              variant="gold"
              onClick={onSendMoney}
              icon={<ArrowUpRight className="w-4 h-4" />}
              iconPosition="right"
              className="shadow-lg shadow-gold-500/10 text-xs px-4"
            >
              Send Money
            </Button>
          )}
          {onDeposit && (
            <Button
              variant="outline"
              onClick={onDeposit}
              icon={<ArrowDownLeft className="w-4 h-4" />}
              className="text-white border-white/20 hover:bg-white/10 text-xs px-4"
            >
              Add Funds
            </Button>
          )}
        </div>
      </div>

      {/* Account Type Mini Breakdown */}
      <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[11px] text-slate-400 block">Checking / Current</span>
          <span className="font-mono font-bold text-white text-sm block">
            {formatAmount(currentTotal)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[11px] text-slate-400 block">High Yield Savings</span>
          <span className="font-mono font-bold text-emerald-400 text-sm block">
            {formatAmount(savingsTotal)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[11px] text-slate-400 block">DPS Schemes</span>
          <span className="font-mono font-bold text-gold-400 text-sm block">
            {formatAmount(dpsTotal)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[11px] text-slate-400 block">FDR Receipts</span>
          <span className="font-mono font-bold text-blue-400 text-sm block">
            {formatAmount(fdrTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};
