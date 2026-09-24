import React, { useState } from 'react';
import { Eye, CheckCircle2, AlertTriangle, XCircle, Search, Filter, Shield } from 'lucide-react';
import { AdminAuditLog } from '../../backend/types/index.ts';
import { AuditLogDetails } from './AuditLogDetails.tsx';

export interface AuditLogTableProps {
  logs: AdminAuditLog[];
  loading?: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  modules: string[];
  selectedModule: string;
  onModuleChange: (mod: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  loading = false,
  total,
  page,
  pageSize,
  onPageChange,
  modules,
  selectedModule,
  onModuleChange,
  selectedStatus,
  onStatusChange,
  search,
  onSearchChange,
}) => {
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      {/* Filtering Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit actions, resources, users, IP..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-royal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Module filter */}
          <select
            value={selectedModule}
            onChange={(e) => onModuleChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="WARNING">WARNING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">IP & Device</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-sm w-full" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Shield className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No audit events found
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Try clearing filter parameters or expanding search keywords.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    {/* User & Role */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{log.user}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {log.employeeId} · {log.role}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {log.action}
                    </td>

                    {/* Module */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.module}
                      </span>
                    </td>

                    {/* Resource */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={log.resource}>
                      {log.resource}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px] tabular-nums">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      })}
                    </td>

                    {/* IP & Device */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      <div className="font-mono text-[11px]">{log.ip || log.ipAddress || '10.240.12.18'}</div>
                      <div className="text-[10px] text-slate-400 max-w-[140px] truncate" title={log.device}>
                        {log.device}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          SUCCESS
                        </span>
                      ) : log.status === 'WARNING' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          WARNING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          FAILED
                        </span>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 text-xs text-slate-500">
          <div className="tabular-nums">
            Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{startIdx}</span> to{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{endIdx}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{total}</span> audit records
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs px-2 tabular-nums">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Drawer/Modal */}
      <AuditLogDetails
        log={selectedLog}
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};
