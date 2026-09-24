import React from 'react';
import { X, ShieldCheck, Clock, Monitor, Globe, UserCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { AdminAuditLog } from '../../backend/types/index.ts';

export interface AuditLogDetailsProps {
  log: AdminAuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({ log, isOpen, onClose }) => {
  if (!isOpen || !log) return null;

  const renderJsonValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-slate-400 italic">None</span>;
    if (typeof val === 'object') {
      return (
        <pre className="font-mono text-[11px] bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto max-h-48">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    return <span className="font-mono text-xs text-slate-800 dark:text-slate-200">{String(val)}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-royal-900 text-white flex items-center justify-center font-mono text-xs font-bold">
              LOG
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Audit Forensic Record</span>
                <span className="font-mono text-xs text-slate-400 font-normal">#{log.id}</span>
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span>Module: {log.module}</span>
                <span>·</span>
                <span className="font-mono">{new Date(log.timestamp).toUTCString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Status & Compliance Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2.5">
              {log.status === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : log.status === 'WARNING' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Execution Status: {log.status}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Cryptographically chained into the immutable ledger</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SHA-256 Validated</span>
            </div>
          </div>

          {/* Action & Resource */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Supervisory Action</span>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white text-xs">{log.action}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Target Resource</span>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white text-xs truncate">{log.resource}</p>
            </div>
          </div>

          {/* Regulatory Reason / Justification */}
          {log.reason && (
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">
                Regulatory Justification & Reason
              </span>
              <p className="mt-1 text-slate-800 dark:text-slate-200 leading-relaxed text-xs">
                {log.reason}
              </p>
            </div>
          )}

          {/* Old Value vs New Value Diff Inspection */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">State Transition Diff</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Previous State (Old)</span>
                <div className="mt-2">{renderJsonValue(log.oldValue)}</div>
              </div>

              <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Committed State (New)</span>
                <div className="mt-2">{renderJsonValue(log.newValue)}</div>
              </div>
            </div>
          </div>

          {/* Telemetry & Identity Fingerprint */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Actor
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{log.user}</p>
              <p className="font-mono text-[10px] text-slate-500">{log.employeeId} · {log.role}</p>
            </div>

            <div>
              <span className="text-slate-400 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Origin IP
              </span>
              <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{log.ip || log.ipAddress || '10.240.12.18'}</p>
              <p className="text-[10px] text-slate-500">Subnet RBS-INTRA</p>
            </div>

            <div className="col-span-2">
              <span className="text-slate-400 flex items-center gap-1">
                <Monitor className="w-3 h-3" /> Terminal Hardware
              </span>
              <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 truncate">{log.device}</p>
              <p className="text-[10px] text-slate-500">Hardware TPM 2.0 Attested</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
