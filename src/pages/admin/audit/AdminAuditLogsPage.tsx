import React, { useState, useEffect } from 'react';
import { ScrollText, ShieldCheck, Download, Filter, RefreshCw } from 'lucide-react';
import { AuditLogTable } from '../../../components/admin/AuditLogTable.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminAuditService, PaginatedAuditLogResult } from '../../../backend/services/adminAuditService.ts';
import { AdminAuditLog } from '../../../backend/types/index.ts';

export const AdminAuditLogsPage: React.FC = () => {
  const [logsResult, setLogsResult] = useState<PaginatedAuditLogResult>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    modules: [],
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAuditService.getAuditLogs({
        search,
        module: moduleFilter,
        status: statusFilter,
        page,
        pageSize,
        sortBy: 'timestamp',
        sortOrder: 'desc',
      });
      setLogsResult(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, moduleFilter, statusFilter, page]);

  const exportHeaders = [
    'Log ID',
    'User',
    'Employee ID',
    'Role',
    'Action',
    'Module',
    'Resource',
    'Timestamp',
    'IP Address',
    'Device',
    'Reason',
    'Status',
  ];

  const exportRows: (string | number)[][] = logsResult.data.map((l) => [
    l.id,
    l.user || l.adminName || 'System Admin',
    l.employeeId || l.adminId || 'SYS-001',
    l.role || l.adminRole || 'Administrator',
    l.action,
    l.module || 'System',
    l.resource || l.targetName || 'Core Banking',
    new Date(l.timestamp).toISOString(),
    l.ip || l.ipAddress || '',
    l.device || '',
    l.reason || l.details || '',
    l.status,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Immutable Supervisory Audit Ledger
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3 h-3" /> WORM Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Non-repudiation forensic record tracking all administrative mutations, credit sign-offs, and state transitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <ExportMenu
            reportTitle="Supervisory Audit Log"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-audit-logs"
          />
        </div>
      </div>

      {/* Audit Log Table Component */}
      <AuditLogTable
        logs={logsResult.data}
        loading={loading}
        total={logsResult.total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        modules={logsResult.modules}
        selectedModule={moduleFilter}
        onModuleChange={(m) => {
          setModuleFilter(m);
          setPage(1);
        }}
        selectedStatus={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        search={search}
        onSearchChange={(q) => {
          setSearch(q);
          setPage(1);
        }}
      />
    </div>
  );
};
