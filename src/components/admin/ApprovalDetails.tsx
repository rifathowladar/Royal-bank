import React from 'react';
import { X, CheckCircle2, XCircle, Clock, ShieldCheck, UserCheck, FileText, ArrowRight } from 'lucide-react';
import { ApprovalItem } from '../../backend/types/index.ts';

export interface ApprovalDetailsProps {
  item: ApprovalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveClick: (item: ApprovalItem) => void;
  onRejectClick: (item: ApprovalItem) => void;
}

export const ApprovalDetails: React.FC<ApprovalDetailsProps> = ({
  item,
  isOpen,
  onClose,
  onApproveClick,
  onRejectClick,
}) => {
  if (!isOpen || !item) return null;

  const isPending = item.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-royal-900 text-white flex items-center justify-center font-mono text-xs font-bold">
              SOD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Maker-Checker Authorization Dossier</h2>
                <span className="font-mono text-xs text-slate-400 font-normal">#{item.id}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Segregation of Duties Policy RB-SOD-SEC-09
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Status & Priority Badge Line */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Status:</span>
              {item.status === 'pending' ? (
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> Pending Checker Review
                </span>
              ) : item.status === 'approved' ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Committed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                  <XCircle className="w-3.5 h-3.5" /> Rejected by Supervisor
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Priority:</span>
              <span
                className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-md ${
                  item.priority === 'critical'
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : item.priority === 'high'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.priority}
              </span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Request Type</span>
              <p className="mt-1 font-bold text-slate-900 dark:text-white text-sm">{item.requestType}</p>
              <p className="text-[11px] text-slate-500 mt-1">Resource: {item.customerOrResource}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Originating Maker</span>
              <p className="mt-1 font-bold text-slate-900 dark:text-white text-sm">{item.requester.name}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                {item.requester.employeeId} · {item.requester.role}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Submitted: {new Date(item.requestDate).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Previous vs Requested Value Diff Box */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Proposed Parameter Transformation
            </span>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1 p-3 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Current Baseline Value</div>
                <div className="mt-1 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {item.previousValue}
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-center text-slate-400">
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="flex-1 p-3 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30">
                <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">
                  Requested Target Value
                </div>
                <div className="mt-1 font-mono text-xs font-bold text-amber-900 dark:text-amber-200">
                  {item.requestedValue}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Justification */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Business Justification & Context
            </span>
            <p className="mt-1.5 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {item.reason}
            </p>
          </div>

          {/* Supporting Evidence */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-royal-600 dark:text-royal-400" />
              Supporting Information & Verification Artifacts
            </span>
            <p className="mt-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
              {item.supportingInformation}
            </p>
          </div>

          {/* Reviewer Resolution (if already resolved) */}
          {item.reviewedBy && (
            <div
              className={`p-3.5 rounded-xl border ${
                item.status === 'approved'
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-rose-500/20 bg-rose-500/5'
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  item.status === 'approved' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                Checker Resolution Details
              </span>
              <p className="mt-1 text-slate-800 dark:text-slate-200">
                Audited by <strong>{item.reviewedBy.name}</strong> ({item.reviewedBy.role}) on{' '}
                {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : ''}
              </p>
              {item.rejectionReason && (
                <div className="mt-2 p-2.5 rounded-lg bg-rose-100/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium">
                  <strong>Rejection Rationale:</strong> {item.rejectionReason}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            {isPending ? 'Dual-key authorization required for execution' : 'Action resolved in immutable audit log'}
          </div>

          <div className="flex items-center gap-2">
            {isPending ? (
              <>
                <button
                  type="button"
                  onClick={() => onRejectClick(item)}
                  className="px-4 py-2 rounded-lg border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold cursor-pointer transition-colors"
                >
                  Reject Action
                </button>
                <button
                  type="button"
                  onClick={() => onApproveClick(item)}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white cursor-pointer transition-colors shadow-xs"
                >
                  Approve & Execute
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold cursor-pointer"
              >
                Close Dossier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
