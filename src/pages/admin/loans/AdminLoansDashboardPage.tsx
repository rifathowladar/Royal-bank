import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLoanNav } from '../../../components/admin/AdminLoanNav.tsx';
import { AdminStatCard } from '../../../components/admin/AdminStatCard.tsx';
import { AdminDataTable, Column } from '../../../components/admin/AdminDataTable.tsx';
import { AdminFilterBar } from '../../../components/admin/AdminFilterBar.tsx';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminLoanService,
  AdminLoanApplication,
} from '../../../backend/services/adminLoanService.ts';
import {
  Banknote,
  FileCheck,
  TrendingUp,
  Percent,
  Eye,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const AdminLoansDashboardPage: React.FC = () => {
  const [loans, setLoans] = useState<AdminLoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadLoans = async () => {
    setLoading(true);
    try {
      const data = await adminLoanService.getLoans({
        search,
        stage: stageFilter,
        type: typeFilter,
      });
      setLoans(data);
    } catch {
      addToast('Error loading credit facilities', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [search, stageFilter, typeFilter]);

  const totalOutstanding = loans
    .filter((l) => l.stage === 'active')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const pendingCount = loans.filter((l) =>
    ['pending', 'kyc_review', 'credit_assessment', 'risk_review'].includes(l.stage)
  ).length;

  const approvedAwaitingDisbursal = loans.filter((l) => l.stage === 'approved').length;

  const columns: Column<AdminLoanApplication>[] = [
    {
      header: 'Facility Number & Purpose',
      accessor: (l) => (
        <div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{l.loanNumber}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[240px]">
            {l.purpose}
          </div>
        </div>
      ),
    },
    {
      header: 'Borrower',
      accessor: (l) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-white">
            {l.customerName}
          </div>
          <div className="text-slate-500 font-mono mt-0.5">
            FICO: <span className="font-semibold text-emerald-600">{l.creditScore}</span> • DTI: {l.debtToIncomeRatio}%
          </div>
        </div>
      ),
    },
    {
      header: 'Workflow Stage',
      accessor: (l) => <AdminBadge type="loan_stage" value={l.stage} />,
    },
    {
      header: 'Facility Terms',
      accessor: (l) => (
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(l.approvedAmount || l.requestedAmount, l.currency)}
          </div>
          <div className="text-slate-500">
            {l.annualInterestRate}% p.a. • {l.termMonths} mo (EMI: {formatCurrency(l.monthlyInstallment, l.currency)})
          </div>
        </div>
      ),
    },
    {
      header: 'Applied / Matures',
      accessor: (l) => (
        <div className="text-xs space-y-0.5 text-slate-500">
          <div>Applied: {formatDate(l.appliedAt)}</div>
          {l.maturityDate && <div>Matures: {l.maturityDate}</div>}
        </div>
      ),
    },
    {
      header: 'Underwriting',
      accessor: (l) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            onClick={() => navigate(`/admin/loans/${l.id}`)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs py-1 px-2.5 h-auto flex items-center gap-1"
          >
            <span>Review</span>
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
          Credit Facilities & Commercial Lending
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Supervise bespoke mortgages, corporate lines of credit, and risk-adjusted lending portfolios
        </p>
      </div>

      <AdminLoanNav />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <AdminStatCard
          title="Active Credit Book"
          value={formatCurrency(totalOutstanding, 'USD')}
          icon={Banknote}
          change={{ value: 12.3, isPositive: true }}
          period="vs prior quarter"
        />
        <AdminStatCard
          title="Underwriting Pipeline"
          value={`${pendingCount} Applications`}
          icon={FileCheck}
          badge={{ text: 'Action required', variant: 'warning' }}
        />
        <AdminStatCard
          title="Ready for Disbursement"
          value={`${approvedAwaitingDisbursal} Facilities`}
          icon={Zap}
          badge={{ text: 'Escrow clear', variant: 'success' }}
        />
        <AdminStatCard
          title="Delinquency / NPL Rate"
          value="0.00%"
          icon={ShieldCheck}
          badge={{ text: 'Zero Defaults', variant: 'success' }}
        />
      </div>

      {/* Filter Bar */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search facility number, customer, purpose..."
        filters={[
          {
            label: 'Workflow Stage',
            value: stageFilter,
            onChange: setStageFilter,
            options: [
              { label: 'All Stages', value: 'all' },
              { label: 'Active Facilities', value: 'active' },
              { label: 'Approved (Awaiting Disbursal)', value: 'approved' },
              { label: 'Pending Intake', value: 'pending' },
              { label: 'KYC Review', value: 'kyc_review' },
              { label: 'Credit Assessment', value: 'credit_assessment' },
              { label: 'Risk Review', value: 'risk_review' },
              { label: 'Declined', value: 'rejected' },
            ],
          },
          {
            label: 'Facility Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Types', value: 'all' },
              { label: 'Mortgage', value: 'mortgage' },
              { label: 'Business Growth', value: 'business_growth' },
              { label: 'Auto Finance', value: 'auto' },
              { label: 'Personal Wealth', value: 'personal' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStageFilter('all');
          setTypeFilter('all');
        }}
      />

      <AdminDataTable
        columns={columns}
        data={loans}
        keyExtractor={(l) => l.id}
        isLoading={loading}
        emptyTitle="No credit facilities found"
        emptyDescription="Adjust your search criteria to view other loan facilities."
      />
    </div>
  );
};
