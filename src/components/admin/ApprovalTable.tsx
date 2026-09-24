import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye, AlertCircle, Check, X, ShieldAlert } from 'lucide-react';
import { ApprovalItem } from '../../backend/types/index.ts';
import { ApprovalDetails } from './ApprovalDetails.tsx';
import { ApprovalDialog } from './ApprovalDialog.tsx';

export interface ApprovalTableProps {
  items: ApprovalItem[];
  loading?: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export const ApprovalTable: React.FC<ApprovalTableProps> = ({
  items,
  loading = false,
  total,
  page,
  pageSize,
  onPageChange,
  onApprove,
  onReject,
}) => {
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [actionItem, setActionItem] = useState<ApprovalItem | null>(null);
  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | null>(null);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  const handleOpenApprove = (item: ApprovalItem) => {
    setActionItem(item);
    setDialogMode('approve');
  };

  const handleOpenReject = (item: ApprovalItem) => {
    setActionItem(item);
    setDialogMode('reject');
  };

  const handleConfirmApprove = async (notes?: string) => {
    if (!actionItem) return;
    await onApprove(actionItem.id, notes);
    setActionItem(null);
    setDialogMode(null);
    if (selectedItem?.id === actionItem.id) {
      setSelectedItem(null);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!actionItem) return;
    await onReject(actionItem.id, reason);
    setActionItem(null);
    setDialogMode(null);
    if (selectedItem?.id === actionItem.id) {
      setSelectedItem(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
                <th className="py-3 px-4">Request Type</th>
                <th className="py-3 px-4">Requester (Maker)</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Baseline vs Requested</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-sm w-full" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No approval requests in this queue
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        All segregation of duties checks are cleared or have been processed.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isPending = item.status === 'pending';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Request Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.requestType}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{item.id}</div>
                      </td>

                      {/* Requester */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.requester.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.requester.employeeId} · {item.requester.role}
                        </div>
                      </td>

                      {/* Resource */}
                      <td className="py-3 px-4 max-w-[180px] truncate text-slate-600 dark:text-slate-300" title={item.customerOrResource}>
                        {item.customerOrResource}
                      </td>

                      {/* Baseline vs Requested */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="truncate text-slate-400 text-[11px]">
                          Was: <span className="line-through">{item.previousValue}</span>
                        </div>
                        <div className="truncate font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          Target: {item.requestedValue}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500 tabular-nums">
                        {new Date(item.requestDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-md ${
                            item.priority === 'critical'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold'
                              : item.priority === 'high'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {item.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        ) : item.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Review Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReject(item)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenApprove(item)}
                                className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-2xs"
                              >
                                Approve
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 text-xs text-slate-500">
          <div className="tabular-nums">
            Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{startIdx}</span> to{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{endIdx}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{total}</span> requests
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

      {/* Review Dossier Drawer */}
      <ApprovalDetails
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onApproveClick={(it) => handleOpenApprove(it)}
        onRejectClick={(it) => handleOpenReject(it)}
      />

      {/* Confirmation & Rejection Modal */}
      <ApprovalDialog
        item={actionItem}
        mode={dialogMode}
        isOpen={Boolean(dialogMode)}
        onClose={() => {
          setDialogMode(null);
          setActionItem(null);
        }}
        onConfirmApprove={handleConfirmApprove}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
};
