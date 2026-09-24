import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLoanNav } from '../../../components/admin/AdminLoanNav.tsx';
import { AdminDataTable, Column } from '../../../components/admin/AdminDataTable.tsx';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminLoanService,
  AdminLoanApplication,
} from '../../../backend/services/adminLoanService.ts';
import {
  FileCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export const AdminLoanApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<AdminLoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await adminLoanService.getLoans();
      // Filter in-flight or approved applications
      setApplications(data.filter((l) => l.stage !== 'completed'));
    } catch {
      addToast('Error loading underwriting queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const columns: Column<AdminLoanApplication>[] = [
    {
      header: 'Application ID & Type',
      accessor: (l) => (
        <div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{l.loanNumber}</span>
          </div>
          <div className="text-xs text-slate-500 capitalize mt-0.5">
            {l.type.replace('_', ' ')} Facility
          </div>
        </div>
      ),
    },
    {
      header: 'Applicant & Score',
      accessor: (l) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-white">
            {l.customerName}
          </div>
          <div className="text-slate-500 mt-0.5">
            FICO: <span className="font-bold text-emerald-600">{l.creditScore}</span> • DTI: {l.debtToIncomeRatio}%
          </div>
        </div>
      ),
    },
    {
      header: 'Amount Requested / Approved',
      accessor: (l) => (
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(l.approvedAmount || l.requestedAmount, l.currency)}
          </div>
          <div className="text-slate-500">
            {l.annualInterestRate}% p.a. • {l.termMonths} mos
          </div>
        </div>
      ),
    },
    {
      header: 'Current Workflow Stage',
      accessor: (l) => <AdminBadge type="loan_stage" value={l.stage} />,
    },
    {
      header: 'Supporting Documents',
      accessor: (l) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {l.documents.filter((d) => d.status === 'verified').length} of {l.documents.length}
          </span>{' '}
          verified
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: (l) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => navigate(`/admin/loans/${l.id}`)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs py-1 px-3 h-auto flex items-center gap-1"
          >
            <span>Underwrite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
          Underwriting & Credit Approval Desk
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review borrower dossiers, adjust risk-adjusted pricing, verify collateral deeds, and clear disbursements
        </p>
      </div>

      <AdminLoanNav />

      {/* Stage Progression Pipeline Summary */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Royal Credit Committee Workflow Pipeline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {[
            { stage: 'pending', label: '1. Intake' },
            { stage: 'kyc_review', label: '2. KYC Review' },
            { stage: 'credit_assessment', label: '3. Credit Assess' },
            { stage: 'risk_review', label: '4. Risk Board' },
            { stage: 'approved', label: '5. Approved' },
            { stage: 'disbursed', label: '6. Disbursed' },
            { stage: 'active', label: '7. Active' },
            { stage: 'completed', label: '8. Settled' },
          ].map((s) => {
            const count = applications.filter((a) => a.stage === s.stage).length;
            return (
              <div
                key={s.stage}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60"
              >
                <div className="text-[11px] text-slate-500 truncate">{s.label}</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        data={applications}
        keyExtractor={(l) => l.id}
        isLoading={loading}
        emptyTitle="No pending underwriting files"
        emptyDescription="All incoming credit applications have been processed."
      />
    </div>
  );
};
