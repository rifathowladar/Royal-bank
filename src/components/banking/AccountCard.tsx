import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  FileText,
  Copy,
  Check,
  MoreVertical,
  BookOpen,
  Landmark,
  PiggyBank,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { Account } from '../../backend/types/index.ts';
import { Button } from '../ui/Button.tsx';

interface AccountCardProps {
  account: Account;
  onTransfer?: (account: Account) => void;
  onViewStatement?: (account: Account) => void;
  onRename?: (account: Account) => void;
  onChequeBook?: (account: Account) => void;
  onCloseAccount?: (account: Account) => void;
  compact?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onTransfer,
  onViewStatement,
  onRename,
  onChequeBook,
  onCloseAccount,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = () => {
    switch (account.type) {
      case 'savings':
        return <PiggyBank className="w-4 h-4 text-emerald-500" />;
      case 'dps':
      case 'fdr':
        return <TrendingUp className="w-4 h-4 text-gold-500" />;
      case 'multi_currency':
        return <Wallet className="w-4 h-4 text-blue-500" />;
      default:
        return <Landmark className="w-4 h-4 text-royal-600 dark:text-gold-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (account.type) {
      case 'checking':
        return 'Checking';
      case 'current':
        return 'Current';
      case 'savings':
        return 'Savings';
      case 'dps':
        return 'DPS Scheme';
      case 'fdr':
        return 'FDR Receipt';
      case 'multi_currency':
        return 'Multi-Currency';
      default:
        return account.type;
    }
  };

  return (
    <div
      onClick={() => navigate(`/bank/accounts/${account.id}`)}
      className="group relative cursor-pointer rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-gold-400/60 dark:hover:border-gold-400/40 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80">
              {getTypeIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors">
                  {account.customNickName || account.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {getTypeLabel()}
                </span>
                <span>•</span>
                <span className="font-mono">{account.currency}</span>
              </div>
            </div>
          </div>

          {/* Account status & actions dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Account actions menu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-30 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 text-xs animate-in fade-in"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/bank/accounts/${account.id}`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/bank/accounts/${account.id}/transactions`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                >
                  View Transactions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/bank/accounts/${account.id}/statement`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                >
                  Download Statement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/bank/accounts/cheque-book?accountId=${account.id}`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                >
                  Request Cheque Book
                </button>
                {onRename && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onRename(account);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                  >
                    Rename Account
                  </button>
                )}
                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/bank/accounts/close?accountId=${account.id}`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium text-rose-600 dark:text-rose-400"
                >
                  Close Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Number with Copy button */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400">
          <span>{account.accountNumber}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-royal-600 dark:text-gold-400 hover:underline"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Balance Display */}
        <div className="mt-4 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
            Available Balance
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {account.currency}{' '}
            {account.balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {account.interestRateAnnual && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono pt-0.5">
              <Percent className="w-3 h-3" />
              <span>{account.interestRateAnnual}% Annual Yield</span>
            </div>
          )}
        </div>

        {/* DPS / FDR specific highlights */}
        {account.type === 'dps' && account.monthlyInstallment && (
          <div className="mt-3 p-2.5 rounded-xl bg-gold-400/10 border border-gold-400/20 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Monthly Deposit:</span>
              <span className="font-mono font-bold">${account.monthlyInstallment}</span>
            </div>
            {account.maturityDate && (
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Matures On:</span>
                <span>{new Date(account.maturityDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        {account.type === 'fdr' && account.maturityDate && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Term Maturity:</span>
              <span className="font-semibold">{new Date(account.maturityDate).toLocaleDateString()}</span>
            </div>
            {account.maturityAmount && (
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Maturity Yield Value:</span>
                <span className="font-mono font-bold text-emerald-600">
                  ${account.maturityAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/bank/accounts/${account.id}`);
          }}
          className="flex-1 text-xs"
        >
          Details
        </Button>
        <Button
          variant="gold"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/bank/transfers?from=${account.id}`);
          }}
          icon={<ArrowUpRight className="w-3.5 h-3.5" />}
          className="flex-1 text-xs"
        >
          Transfer
        </Button>
      </div>
    </div>
  );
};
