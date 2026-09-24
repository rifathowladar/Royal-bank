import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  to?: string;
  variant?: 'customer' | 'admin' | 'public';
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
  variant = 'customer',
  compact = false,
}) => {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded-lg py-1"
    >
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-900 via-royal-900 to-royal-800 dark:from-royal-850 dark:to-royal-950 flex items-center justify-center text-gold-400 border border-gold-400/30 shadow-xs group-hover:border-gold-400/60 transition-colors shrink-0">
        <ShieldCheck className="w-5 h-5 text-gold-400" />
      </div>
      {!compact && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Royal Bank
            </span>
            {variant === 'admin' && (
              <span className="text-[10px] font-mono tracking-wider font-semibold text-amber-600 dark:text-gold-400 uppercase">
                Console
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
            {variant === 'admin' ? 'Operations & Risk Governance' : 'Private & Retail Banking'}
          </span>
        </div>
      )}
    </Link>
  );
};
