import React, { useState } from 'react';
import { TransferResult } from '../../backend/index.ts';
import { Button } from '../ui/Button.tsx';
import {
  CheckCircle2,
  Copy,
  Check,
  FileText,
  ArrowRight,
  UserPlus,
  RefreshCw,
  Share2,
} from 'lucide-react';

export interface TransferSuccessProps {
  result: TransferResult;
  onViewReceipt: () => void;
  onNewTransfer: () => void;
  onReturnDashboard: () => void;
  onSaveBeneficiary?: () => void;
}

export const TransferSuccess: React.FC<TransferSuccessProps> = ({
  result,
  onViewReceipt,
  onNewTransfer,
  onReturnDashboard,
  onSaveBeneficiary,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-6">
        {/* Animated Success Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center ring-8 ring-emerald-50 dark:ring-emerald-950/30">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
            Cryptographically Cleared & Settled
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Transfer Successful
          </h2>
          <p className="text-xs text-slate-500">
            Funds have been instantly routed through the Royal Bank clearing nexus.
          </p>
        </div>

        {/* Big Amount Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="text-3xl font-extrabold font-mono text-royal-950 dark:text-gold-400">
            {result.currency} {result.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1 font-mono">
            <span>Ref: {result.referenceNumber}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Copy Reference"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Summary Table */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-left">
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-500">Beneficiary / Recipient</span>
            <span className="font-bold text-slate-900 dark:text-white">{result.recipientName}</span>
          </div>

          <div className="py-2.5 flex justify-between font-mono">
            <span className="text-slate-500 font-sans">Recipient Account</span>
            <span className="text-slate-700 dark:text-slate-300">{result.recipientAccount}</span>
          </div>

          <div className="py-2.5 flex justify-between">
            <span className="text-slate-500">Receiving Clearing Hub</span>
            <span className="font-medium text-slate-900 dark:text-white">{result.recipientBank}</span>
          </div>

          <div className="py-2.5 flex justify-between font-mono">
            <span className="text-slate-500 font-sans">Debited Account</span>
            <span className="text-slate-700 dark:text-slate-300">
              {result.sourceAccount.customNickName || result.sourceAccount.name} ({result.sourceAccount.accountNumber.slice(-4)})
            </span>
          </div>

          <div className="py-2.5 flex justify-between">
            <span className="text-slate-500">Remaining Balance</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {result.currency} {result.sourceAccount.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex justify-between font-mono text-[11px] text-slate-400">
            <span className="font-sans">Time of Execution</span>
            <span>{new Date(result.timestamp).toLocaleTimeString()} • {new Date(result.timestamp).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-2">
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewReceipt}
              icon={<FileText className="w-3.5 h-3.5" />}
              className="flex-1 text-xs"
            >
              Official Receipt
            </Button>
            {onSaveBeneficiary && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveBeneficiary}
                icon={<UserPlus className="w-3.5 h-3.5" />}
                className="flex-1 text-xs"
              >
                Save Payee
              </Button>
            )}
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReturnDashboard}
              className="flex-1 text-xs"
            >
              Dashboard
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={onNewTransfer}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              className="flex-1 text-xs"
            >
              Make Another Transfer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
