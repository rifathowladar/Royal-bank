import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Transaction } from '../../backend/types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';

interface TransactionDetailsProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadReceipt?: () => void;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  isOpen,
  onClose,
  onDownloadReceipt,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);

  if (!transaction) return null;

  const isCredit = transaction.amount > 0;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handlePrintReceipt = () => {
    if (onDownloadReceipt) {
      onDownloadReceipt();
    } else {
      window.print();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Settlement Record"
      subtitle={`Reference: ${transaction.referenceNumber}`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-xs">
        {/* Main Status & Amount Card */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            {isCredit ? '+' : '-'}
            {transaction.currency}{' '}
            {Math.abs(transaction.amount).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <p className="text-slate-500 font-medium">{transaction.description}</p>

          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-500/20">
              Settlement Status: {transaction.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Audit Details Grid */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="flex justify-between items-center p-3.5">
            <span className="text-slate-500">Transaction ID</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {transaction.id}
            </span>
          </div>

          <div className="flex justify-between items-center p-3.5">
            <span className="text-slate-500">Date & Timestamp</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {new Date(transaction.timestamp).toUTCString()}
            </span>
          </div>

          <div className="flex justify-between items-center p-3.5">
            <span className="text-slate-500">Sender Entity</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {transaction.sender || 'Alexander Sterling'}
            </span>
          </div>

          <div className="flex justify-between items-center p-3.5">
            <span className="text-slate-500">Receiver / Beneficiary</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {transaction.receiver || transaction.counterpartyName}
            </span>
          </div>

          <div className="flex justify-between items-center p-3.5">
            <span className="text-slate-500">Payment Rail / Method</span>
            <span className="font-medium text-royal-600 dark:text-gold-400">
              {transaction.paymentMethod || 'Internal Transfer Rail'}
            </span>
          </div>

          <div className="flex justify-between items-center p-3.5">
            <span className="text-slate-500">Network / Processing Fee</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {transaction.fee === 0 ? 'Complimentary ($0.00)' : `$${transaction.fee.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between items-center p-3.5">
            <span className="text-slate-500">Category Tag</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {transaction.category}
            </span>
          </div>

          <div className="flex justify-between items-center p-3.5">
            <span className="text-slate-500">Clearing Reference</span>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-900 dark:text-white">
              <span>{transaction.referenceNumber}</span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="p-1 rounded text-royal-600 dark:text-gold-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Copy Reference"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Security Disclosures */}
        <div className="p-3.5 rounded-2xl bg-royal-50/60 dark:bg-royal-950/40 border border-royal-200/60 dark:border-royal-900/60 flex items-start gap-2.5 text-slate-600 dark:text-slate-300 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-royal-600 dark:text-gold-400 shrink-0 mt-0.5" />
          <span>
            This record represents a finalized ledger settlement cryptographic stamp backed by Royal Bank Basel III liquidity reserves.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handlePrintReceipt}
            className="flex-1 text-xs"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Download Official Voucher
          </Button>
          <Button
            variant="gold"
            onClick={onClose}
            className="flex-1 text-xs"
          >
            Close Dossier
          </Button>
        </div>
      </div>
    </Modal>
  );
};
