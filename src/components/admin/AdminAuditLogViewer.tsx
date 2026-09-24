import React from 'react';
import { AdminAuditLog } from '../../backend/types/index.ts';
import { formatDate } from '../../utils/formatters.ts';
import { ShieldCheck, AlertTriangle, ShieldAlert, Clock, User, Terminal } from 'lucide-react';

export interface AdminAuditLogViewerProps {
  logs: AdminAuditLog[];
  emptyMessage?: string;
}

export const AdminAuditLogViewer: React.FC<AdminAuditLogViewerProps> = ({
  logs,
  emptyMessage = 'No administrative actions recorded yet.',
}) => {
  if (logs.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const isSuccess = log.status === 'SUCCESS';
        const isWarning = log.status === 'WARNING';

        return (
          <div
            key={log.id}
            className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isSuccess
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : isWarning
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                {isSuccess ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isSuccess
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300">{log.details}</p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <strong>{log.adminName || log.user}</strong> ({(log.adminRole || log.role || 'Admin').replace(/_/g, ' ')})
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Terminal className="w-3 h-3" />
                    {log.ipAddress || log.ip || '10.240.12.18'}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right sm:self-start">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Clock className="w-3 h-3" />
                {formatDate(log.timestamp)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
