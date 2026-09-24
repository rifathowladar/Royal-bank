import React, { useState } from 'react';
import { Account, TransferRequest } from '../../backend/index.ts';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import {
  ShieldCheck,
  ArrowRight,
  Landmark,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface TransferConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void>;
  request: TransferRequest | null;
  sourceAccount: Account | null;
  targetAccount?: Account | null;
  isLoading?: boolean;
}

export const TransferConfirmation: React.FC<TransferConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  request,
  sourceAccount,
  targetAccount,
  isLoading = false,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!request || !sourceAccount) return null;

  const totalDebit = request.amount + (request.fee || 0);
  const remainingBalance = sourceAccount.availableBalance - totalDebit;

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('Please enter a valid 4-digit transaction authorization PIN.');
      return;
    }

    try {
      await onConfirm(pin);
    } catch (err: any) {
      setError(err?.message || 'Transaction authorization failed.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Authorize Fund Transfer"
      subtitle="Institutional Real-Time Settlement Protocol"
      maxWidth="md"
    >
      <form onSubmit={handleAuthorize} className="space-y-5 text-xs">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Amount & Network Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-royal-950 via-slate-900 to-royal-950 text-white text-center space-y-1 relative overflow-hidden">
          <span className="px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-gold-400/30">
            {request.transferType.replace('_', ' ').toUpperCase()} CLEARING
          </span>
          <div className="text-3xl font-extrabold font-mono text-white pt-1">
            {request.currency}{' '}
            {request.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            Fee: {request.fee > 0 ? `${request.currency} ${request.fee.toFixed(2)}` : 'FREE (No Charge)'}
          </div>
        </div>

        {/* Source and Recipient Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
          {/* Source */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">From Ledger</span>
            <div className="font-bold text-slate-900 dark:text-white truncate">
              {sourceAccount.customNickName || sourceAccount.name}
            </div>
            <div className="font-mono text-[11px] text-slate-500">{sourceAccount.accountNumber}</div>
            <div className="text-[10px] text-slate-500">
              Post-Transfer: <strong className="font-mono text-slate-700 dark:text-slate-300">${remainingBalance.toLocaleString()}</strong>
            </div>
          </div>

          {/* Recipient */}
          <div className="space-y-1 sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-3">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">To Recipient</span>
            <div className="font-bold text-slate-900 dark:text-white truncate">
              {request.recipientName}
            </div>
            <div className="font-mono text-[11px] text-slate-500">{request.recipientAccount}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              {request.recipientBank || 'Royal Bank'} • Verified
            </div>
          </div>
        </div>

        {/* Details & Disclosures */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {request.referenceNote && (
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Payment Purpose / Note:</span>
              <span className="font-medium text-slate-900 dark:text-white">{request.referenceNote}</span>
            </div>
          )}

          {request.scheduledDate && (
            <div className="py-2 flex justify-between items-center text-amber-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Scheduled Post Date:
              </span>
              <span className="font-mono font-bold">{request.scheduledDate}</span>
            </div>
          )}

          {request.recurringFrequency && (
            <div className="py-2 flex justify-between items-center text-blue-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Recurring Interval:
              </span>
              <span className="capitalize font-bold">{request.recurringFrequency}</span>
            </div>
          )}

          <div className="py-2 flex justify-between">
            <span className="text-slate-500">Clearing Network:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {request.transferType === 'npsb'
                ? 'NPSB Real-Time Switch'
                : request.transferType === 'beftn'
                ? 'BEFTN Electronic Batch'
                : request.transferType === 'rtgs'
                ? 'RTGS High-Value Gross'
                : request.transferType === 'own_account'
                ? 'Intra-Bank Ledger Settlement'
                : 'Royal Bank Core Wire'}
            </span>
          </div>

          <div className="py-2 flex justify-between font-bold text-slate-900 dark:text-white">
            <span>Total Amount Debited:</span>
            <span className="font-mono text-sm">
              {request.currency} {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* PIN Security Input */}
        <div className="space-y-2 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
          <div className="flex items-center justify-between">
            <label className="block text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              Authorization PIN
            </label>
            <button
              type="button"
              onClick={() => setPin('1234')}
              className="text-[10px] text-royal-600 dark:text-gold-400 hover:underline font-mono"
            >
              Demo Auto-Fill (1234)
            </button>
          </div>

          <input
            type="password"
            maxLength={4}
            required
            autoFocus
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full text-center text-xl font-mono tracking-widest px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <p className="text-[10px] text-slate-500 text-center">
            Enter your 4-digit mobile transaction PIN or security token
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            isLoading={isLoading}
            disabled={pin.length < 4}
            className="flex-1 text-xs"
          >
            Authorize & Execute
          </Button>
        </div>
      </form>
    </Modal>
  );
};
