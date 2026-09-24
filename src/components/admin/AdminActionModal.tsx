import React, { useState } from 'react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { AlertTriangle, ShieldAlert, Snowflake, KeyRound, ArrowRightLeft, CheckCircle2, RotateCcw } from 'lucide-react';

export type AdminActionType =
  | 'freeze_customer'
  | 'unfreeze_customer'
  | 'reset_password'
  | 'freeze_account'
  | 'unfreeze_account'
  | 'close_account'
  | 'change_limits'
  | 'approve_transaction'
  | 'reject_transaction'
  | 'reverse_transaction'
  | 'refund_transaction';

export interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: AdminActionType;
  targetId: string;
  targetName: string;
  onConfirm: (payload: { reason: string; extra?: any }) => Promise<void>;
  initialExtra?: any;
}

export const AdminActionModal: React.FC<AdminActionModalProps> = ({
  isOpen,
  onClose,
  actionType,
  targetId,
  targetName,
  onConfirm,
  initialExtra,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For change limits
  const [dailyTransferLimit, setDailyTransferLimit] = useState(initialExtra?.dailyTransferLimit || 250000);
  const [singleTxLimit, setSingleTxLimit] = useState(initialExtra?.singleTransactionLimit || 100000);
  const [overdraftLimit, setOverdraftLimit] = useState(initialExtra?.overdraftLimit || 0);

  // For refund
  const [refundAmount, setRefundAmount] = useState(initialExtra?.amount || 0);

  const config = {
    freeze_customer: {
      title: 'Freeze Customer Assets & Portals',
      description: `This will instantly suspend customer access, debit privileges, and freeze all linked ledgers for ${targetName}.`,
      icon: Snowflake,
      variant: 'danger' as const,
      confirmLabel: 'Confirm Full Account Freeze',
      requireReason: true,
      defaultReason: 'Flagged suspicious activity / KYC verification review pending',
    },
    unfreeze_customer: {
      title: 'Restore Customer Privileges',
      description: `Lift the freeze order and restore active online banking, card privileges, and fund movements for ${targetName}.`,
      icon: CheckCircle2,
      variant: 'primary' as const,
      confirmLabel: 'Restore Customer to Active',
      requireReason: true,
      defaultReason: 'Surveillance review concluded satisfactorily. Compliance clearance granted.',
    },
    reset_password: {
      title: 'Generate Temporary Access Token',
      description: `Invalidate existing customer credentials and generate a high-entropy temporary one-time password for ${targetName}.`,
      icon: KeyRound,
      variant: 'primary' as const,
      confirmLabel: 'Issue Temporary Password',
      requireReason: false,
      defaultReason: 'Customer security reset request initiated via verified support desk.',
    },
    freeze_account: {
      title: 'Freeze Specific Ledger',
      description: `Halt all debits and incoming automated clearing house (ACH) settlements for ledger ${targetName}.`,
      icon: Snowflake,
      variant: 'danger' as const,
      confirmLabel: 'Freeze Ledger Immediately',
      requireReason: true,
      defaultReason: 'Administrative hold pending dispute verification',
    },
    unfreeze_account: {
      title: 'Unfreeze Account Ledger',
      description: `Re-enable normal debit and credit posting for ledger ${targetName}.`,
      icon: CheckCircle2,
      variant: 'primary' as const,
      confirmLabel: 'Unfreeze Account',
      requireReason: true,
      defaultReason: 'Hold lifted following verified reconciliation.',
    },
    close_account: {
      title: 'Permanently Terminate Ledger',
      description: `Irreversibly close ledger ${targetName}. Remaining balances must be zero or wired prior to archival.`,
      icon: AlertTriangle,
      variant: 'danger' as const,
      confirmLabel: 'Permanently Close Account',
      requireReason: true,
      defaultReason: 'Account closure requested by account holder or regulatory decree.',
    },
    change_limits: {
      title: 'Adjust Operational Velocity Limits',
      description: `Configure daily and per-transaction settlement ceilings for ledger ${targetName}.`,
      icon: ArrowRightLeft,
      variant: 'primary' as const,
      confirmLabel: 'Save New Limits',
      requireReason: false,
      defaultReason: 'Tier-based limit adjustment authorized by Relationship Manager.',
    },
    approve_transaction: {
      title: 'Authorize High-Value Settlement',
      description: `Approve transaction ${targetName} and release funds to clearing network.`,
      icon: CheckCircle2,
      variant: 'primary' as const,
      confirmLabel: 'Approve & Release Funds',
      requireReason: false,
      defaultReason: 'Supervisory dual-key clearance authenticated.',
    },
    reject_transaction: {
      title: 'Reject & Cancel Transaction',
      description: `Cancel transaction ${targetName} and return reserved funds to the originating ledger.`,
      icon: AlertTriangle,
      variant: 'danger' as const,
      confirmLabel: 'Reject Transaction',
      requireReason: true,
      defaultReason: 'Sanctions check failure or counterparty discrepancy.',
    },
    reverse_transaction: {
      title: 'Execute Ledger Reversal (Dual-Key)',
      description: `Generate a mirror correcting debit/credit to neutralize transaction ${targetName}. Ledger balances will be adjusted.`,
      icon: RotateCcw,
      variant: 'danger' as const,
      confirmLabel: 'Execute Reversal',
      requireReason: true,
      defaultReason: 'Duplicate posting correction / clerical error reconciliation.',
    },
    refund_transaction: {
      title: 'Issue Administrative Refund',
      description: `Credit funds back to the customer originating account for transaction ${targetName}.`,
      icon: RotateCcw,
      variant: 'primary' as const,
      confirmLabel: 'Issue Refund Now',
      requireReason: true,
      defaultReason: 'Dispute resolved in favor of customer.',
    },
  }[actionType];

  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason.trim() || config.defaultReason;

    if (config.requireReason && !reason.trim() && !config.defaultReason) {
      setError('Please provide an operational audit reason');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let extra: any = undefined;
      if (actionType === 'change_limits') {
        extra = {
          dailyTransferLimit: Number(dailyTransferLimit),
          singleTransactionLimit: Number(singleTxLimit),
          overdraftLimit: Number(overdraftLimit),
        };
      } else if (actionType === 'refund_transaction') {
        extra = {
          refundAmount: Number(refundAmount),
        };
      }

      await onConfirm({ reason: finalReason, extra });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to execute administrative command');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white mb-0.5">
              Target: <span className="font-mono">{targetName}</span>
            </p>
            <p>{config.description}</p>
          </div>
        </div>

        {/* Change Limits Fields */}
        {actionType === 'change_limits' && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Daily Transfer Limit (USD)
              </label>
              <input
                type="number"
                value={dailyTransferLimit}
                onChange={(e) => setDailyTransferLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Single Transaction Ceiling (USD)
              </label>
              <input
                type="number"
                value={singleTxLimit}
                onChange={(e) => setSingleTxLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Authorized Overdraft Protection (USD)
              </label>
              <input
                type="number"
                value={overdraftLimit}
                onChange={(e) => setOverdraftLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Refund Field */}
        {actionType === 'refund_transaction' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Refund Amount to Credit
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* Mandatory / Recommended Audit Note */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Supervisory Audit Justification {config.requireReason && <span className="text-rose-500">*</span>}
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={config.defaultReason}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-royal-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Logged into immutable supervisory audit trail under ISO 27001 compliance standards.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={config.variant}
            size="sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : config.confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
