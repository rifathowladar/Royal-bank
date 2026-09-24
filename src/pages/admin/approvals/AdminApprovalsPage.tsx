import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ShieldCheck, Clock, CheckCircle2, XCircle, Search, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { ApprovalTable } from '../../../components/admin/ApprovalTable.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminApprovalService, PaginatedApprovalResult } from '../../../backend/services/adminApprovalService.ts';
import { ApprovalItem } from '../../../backend/types/index.ts';
import { useAdminPermissions } from '../../../hooks/index.ts';
import { useToast } from '../../../context/ToastContext.tsx';

export interface AdminApprovalsPageProps {
  forcedStatus?: 'pending' | 'history';
}

export const AdminApprovalsPage: React.FC<AdminApprovalsPageProps> = ({ forcedStatus }) => {
  const location = useLocation();
  const permissions = useAdminPermissions();
  const { showToast } = useToast();

  const isPendingRoute = forcedStatus === 'pending' || location.pathname.endsWith('/pending');
  const isHistoryRoute = forcedStatus === 'history' || location.pathname.endsWith('/history');
  const currentTab = isPendingRoute ? 'pending' : isHistoryRoute ? 'history' : 'all';

  const [approvalsResult, setApprovalsResult] = useState<PaginatedApprovalResult>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [requestType, setRequestType] = useState('all');
  const [priority, setPriority] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await adminApprovalService.getApprovals({
        status: currentTab,
        requestType,
        priority,
        search,
        page,
        pageSize,
        sortBy: 'requestDate',
        sortOrder: 'desc',
      });
      setApprovalsResult(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [currentTab, requestType, priority, search, page]);

  const handleApprove = async (id: string, notes?: string) => {
    try {
      const checker = {
        name: permissions.role === 'super_admin' ? 'Victoria Ashford' : 'Julian Cross',
        employeeId: permissions.role === 'super_admin' ? 'EMP-9101' : 'EMP-9102',
        role: permissions.roleTitle,
      };
      const result = await adminApprovalService.approveRequest(id, checker, notes);
      showToast('success', result.message);
      await fetchApprovals();
    } catch (err: any) {
      showToast('error', err.message || 'Approval failed.');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const checker = {
        name: permissions.role === 'super_admin' ? 'Victoria Ashford' : 'Julian Cross',
        employeeId: permissions.role === 'super_admin' ? 'EMP-9101' : 'EMP-9102',
        role: permissions.roleTitle,
      };
      const result = await adminApprovalService.rejectRequest(id, checker, reason);
      showToast('warning', result.message);
      await fetchApprovals();
    } catch (err: any) {
      showToast('error', err.message || 'Rejection failed.');
    }
  };

  const exportHeaders = [
    'Request ID',
    'Maker Name',
    'Maker ID',
    'Request Type',
    'Resource',
    'Previous Value',
    'Requested Value',
    'Priority',
    'Status',
    'Request Date',
    'Reason',
  ];

  const exportRows = approvalsResult.data.map((a) => [
    a.id,
    a.requester.name,
    a.requester.employeeId,
    a.requestType,
    a.customerOrResource,
    a.previousValue,
    a.requestedValue,
    a.priority,
    a.status,
    new Date(a.requestDate).toISOString(),
    a.reason,
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Maker-Checker Authorization Console
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold">
              Dual-Key Gate
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Segregation of Duties (SoD) workflow requiring secondary supervisory sign-off for critical operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchApprovals}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Refresh queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <ExportMenu
            reportTitle="Approvals Register"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-approvals"
          />
        </div>
      </div>

      {/* Workflow Explanation Banner */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Enforced Flow:</span>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">1. Maker Creates</span>
            <span>&rarr;</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">2. Pending Approval</span>
            <span>&rarr;</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">3. Checker Review</span>
            <span>&rarr;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">4. Action Executed & Logged</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 font-mono text-slate-400 text-[11px]">
          <span>Current Checker Clearance:</span>
          <strong className="text-royal-600 dark:text-amber-400">{permissions.roleTitle}</strong>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <NavLink
          to="/admin/approvals"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              isActive
                ? 'border-royal-900 text-royal-900 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`
          }
        >
          <span>All Requests</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {approvalsResult.total}
          </span>
        </NavLink>

        <NavLink
          to="/admin/approvals/pending"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              isActive
                ? 'border-royal-900 text-royal-900 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`
          }
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Authorization</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
            {approvalsResult.pendingCount}
          </span>
        </NavLink>

        <NavLink
          to="/admin/approvals/history"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              isActive
                ? 'border-royal-900 text-royal-900 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`
          }
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Audit History</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {approvalsResult.approvedCount + approvalsResult.rejectedCount}
          </span>
        </NavLink>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search request type, maker, customer, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-royal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Request Type filter */}
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Request Types</option>
            <option value="Account limit change">Account limit change</option>
            <option value="Large transaction">Large transaction</option>
            <option value="Loan approval">Loan approval</option>
            <option value="Customer freeze">Customer freeze</option>
            <option value="Customer unfreeze">Customer unfreeze</option>
            <option value="Card block">Card block</option>
            <option value="Merchant approval">Merchant approval</option>
            <option value="KYC approval">KYC approval</option>
            <option value="Fee configuration">Fee configuration</option>
            <option value="Interest rate change">Interest rate change</option>
          </select>

          {/* Priority filter */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Approvals Table */}
      <ApprovalTable
        items={approvalsResult.data}
        loading={loading}
        total={approvalsResult.total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
