import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  QrCode,
  Zap,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Transaction } from '../../backend/types/index.ts';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: (transaction: Transaction) => void;
  showAccountBadge?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onClick,
  showAccountBadge = false,
}) => {
  const isCredit = transaction.amount > 0;

  const getIcon = () => {
    switch (transaction.type) {
      case 'card_purchase':
        return <CreditCard className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
      case 'qr_payment':
        return <QrCode className="w-4 h-4 text-gold-500" />;
      case 'interest':
      case 'dps_installment':
      case 'fdr_creation':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'bill_payment':
        return <FileText className="w-4 h-4 text-amber-500" />;
      default:
        return isCredit ? (
          <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
        ) : (
          <ArrowUpRight className="w-4 h-4 text-slate-500" />
        );
    }
  };

  const getStatusBadge = () => {
    switch (transaction.status) {
      case 'completed':
        return null; // clean UI for normal completed
      case 'pending':
      case 'processing':
        return (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Failed
          </span>
        );
      case 'reversed':
        return (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            Reversed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(transaction)}
      className={`group flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all ${
        onClick ? 'cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40' : ''
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`p-2.5 rounded-2xl border shrink-0 ${
            isCredit
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700/80'
          }`}
        >
          {getIcon()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors">
              {transaction.counterpartyName || transaction.description}
            </h4>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate">
            <span>{transaction.category}</span>
            <span>•</span>
            <span>{new Date(transaction.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {transaction.paymentMethod && (
              <>
                <span>•</span>
                <span className="font-medium text-slate-400">{transaction.paymentMethod}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div
          className={`font-mono font-bold text-xs sm:text-sm ${
            isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
          }`}
        >
          {isCredit ? '+' : ''}
          {transaction.currency}{' '}
          {Math.abs(transaction.amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <span className="text-[10px] text-slate-400 font-mono block">
          {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
