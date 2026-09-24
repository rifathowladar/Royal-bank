import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, X } from 'lucide-react';
import { ApprovalItem } from '../../backend/types/index.ts';

export interface ApprovalDialogProps {
  item: ApprovalItem | null;
  mode: 'approve' | 'reject' | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApprove: (notes?: string) => Promise<void>;
  onConfirmReject: (reason: string) => Promise<void>;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  item,
  mode,
  isOpen,
  onClose,
  onConfirmApprove,
  onConfirmReject,
}) => {
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item || !mode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'approve') {
        await onConfirmApprove(notes);
      } else {
        if (!rejectionReason || rejectionReason.trim().length < 5) {
          setError('Please provide a specific rejection reason (minimum 5 characters).');
          setIsSubmitting(false);
          return;
        }
        await onConfirmReject(rejectionReason);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            mode === 'approve'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {mode === 'approve' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
            <h2 className="text-sm font-bold">
              {mode === 'approve' ? 'Dual-Key Authorization Sign-Off' : 'Checker Rejection Notice'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Request Type</span>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{item.requestType}</div>
            <div className="text-slate-500">{item.customerOrResource}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Requested Transition</span>
              <div className="flex items-center gap-2 mt-0.5 font-medium">
                <span className="text-slate-500 line-through truncate max-w-[180px]">{item.previousValue}</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[200px]">
                  {item.requestedValue}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Maker Justification</span>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 italic">{item.reason}</p>
            </div>
          </div>

          {mode === 'approve' ? (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Checker Approval Endorsement (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Add compliance notes, audit reference, or conditions of sign-off..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Authorizing this action will commit the state change to the live ledger and create an immutable audit record.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Regulatory Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="State specific deficiency, failed sanction screening, or policy mismatch..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-rose-300 dark:border-rose-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The maker and compliance team will be notified with this formal refusal rationale.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-lg font-semibold text-white cursor-pointer transition-colors shadow-xs ${
                mode === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600'
                  : 'bg-rose-600 hover:bg-rose-500 dark:bg-rose-600'
              }`}
            >
              {isSubmitting
                ? 'Processing...'
                : mode === 'approve'
                ? 'Confirm & Authorize Action'
                : 'Reject & Record Refusal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
