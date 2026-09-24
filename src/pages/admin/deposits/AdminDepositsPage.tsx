import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminDepositNav } from '../../../components/admin/AdminDepositNav.tsx';
import { AdminStatCard } from '../../../components/admin/AdminStatCard.tsx';
import { AdminDataTable, Column } from '../../../components/admin/AdminDataTable.tsx';
import { AdminFilterBar } from '../../../components/admin/AdminFilterBar.tsx';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminDepositService,
  AdminDepositScheme,
  AdminDepositCategory,
} from '../../../backend/services/adminDepositService.ts';
import { db } from '../../../backend/mockApi/storage.ts';
import {
  Vault,
  PiggyBank,
  Award,
  Plus,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
} from 'lucide-react';

interface AdminDepositsPageProps {
  forcedCategory?: AdminDepositCategory;
}

export const AdminDepositsPage: React.FC<AdminDepositsPageProps> = ({ forcedCategory }) => {
  const location = useLocation();
  const inferredCategory: AdminDepositCategory | 'all' = forcedCategory
    ? forcedCategory
    : location.pathname.includes('/dps')
    ? 'DPS'
    : location.pathname.includes('/fdr')
    ? 'FDR'
    : 'all';

  const [deposits, setDeposits] = useState<AdminDepositScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showMatureModal, setShowMatureModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showEarlyWithdrawModal, setShowEarlyWithdrawModal] = useState(false);
  const [activeDeposit, setActiveDeposit] = useState<AdminDepositScheme | null>(null);

  // Forms
  const [newDepositForm, setNewDepositForm] = useState({
    customerId: 'cust-001',
    customerName: 'Alexander Sterling',
    category: (inferredCategory === 'DPS' ? 'DPS' : 'FDR') as AdminDepositCategory,
    schemeTitle: 'Sovereign High Yield Term Fixed Deposit',
    sourceAccountId: 'acc-001',
    sourceAccountNumber: 'RB-NY-092144',
    principalAmount: 100000,
    monthlyInstallment: 2500,
    termMonths: 24,
    interestRateAnnual: 5.85,
    autoRenew: true,
    renewalType: 'principal_and_interest' as 'principal_only' | 'principal_and_interest',
    nomineeName: 'Evelyn Sterling',
    nomineeRelationship: 'Spouse',
  });

  const [renewalType, setRenewalType] = useState<'principal_only' | 'principal_and_interest'>('principal_and_interest');
  const [withdrawalReason, setWithdrawalReason] = useState('Immediate liquidity need for international asset acquisition');

  const { addToast } = useToast();

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const data = await adminDepositService.getDeposits({
        category: inferredCategory,
        status: statusFilter as any,
        search,
      });
      setDeposits(data);
    } catch {
      addToast('Error loading term deposits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, [inferredCategory, statusFilter, search]);

  const totalDeposited = deposits
    .filter((d) => d.status === 'active')
    .reduce((sum, d) => {
      if (d.category === 'DPS') {
        return sum + (d.monthlyInstallment || 0) * (d.installmentsPaid || 0);
      }
      return sum + d.principalAmount;
    }, 0);

  const activeCount = deposits.filter((d) => d.status === 'active').length;
  const pendingCount = deposits.filter((d) => d.status === 'pending_approval').length;

  const handleOpenScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await adminDepositService.openDepositScheme(newDepositForm);
      addToast(`Opened ${created.category} (${created.schemeNumber}) successfully`, 'success');
      setShowOpenModal(false);
      loadDeposits();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to open deposit';
      addToast(msg, 'error');
    }
  };

  const handleApprove = async (dep: AdminDepositScheme) => {
    try {
      await adminDepositService.approveDeposit(dep.id, 'Administrative treasury signoff');
      addToast(`Deposit ${dep.schemeNumber} approved and activated`, 'success');
      loadDeposits();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed';
      addToast(msg, 'error');
    }
  };

  const handleMatureConfirm = async () => {
    if (!activeDeposit) return;
    try {
      const res = await adminDepositService.matureDeposit(activeDeposit.id);
      addToast(`Matured and paid out $${res.payoutAmount.toLocaleString()} to ledger`, 'success');
      setShowMatureModal(false);
      loadDeposits();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payout failed';
      addToast(msg, 'error');
    }
  };

  const handleRenewConfirm = async () => {
    if (!activeDeposit) return;
    try {
      const renewed = await adminDepositService.renewDeposit(activeDeposit.id, renewalType);
      addToast(`Deposit renewed. New maturity payout: $${renewed.maturityPayoutAmount.toLocaleString()}`, 'success');
      setShowRenewModal(false);
      loadDeposits();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rollover failed';
      addToast(msg, 'error');
    }
  };

  const handleWithdrawConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeposit) return;
    try {
      const res = await adminDepositService.executeEarlyWithdrawal(activeDeposit.id, withdrawalReason);
      addToast(
        `Early liquidation executed. Net payout: $${res.netPayout.toLocaleString()} (Penalty -$${res.penaltyDeducted.toLocaleString()})`,
        'success'
      );
      setShowEarlyWithdrawModal(false);
      loadDeposits();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed';
      addToast(msg, 'error');
    }
  };

  const columns: Column<AdminDepositScheme>[] = [
    {
      header: 'Scheme Ref & Product',
      accessor: (d) => (
        <div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            {d.category === 'DPS' ? (
              <PiggyBank className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{d.schemeNumber}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {d.category}
            </span>
          </div>
          <div className="text-xs text-slate-500 truncate max-w-[200px] mt-0.5">
            {d.schemeTitle}
          </div>
        </div>
      ),
    },
    {
      header: 'Depositor',
      accessor: (d) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-white">
            {d.customerName}
          </div>
          <div className="text-slate-500 font-mono mt-0.5">
            Ledger: {d.sourceAccountNumber}
          </div>
        </div>
      ),
    },
    {
      header: 'Deposit Capital & Term',
      accessor: (d) => (
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white">
            {d.category === 'DPS'
              ? `${formatCurrency(d.monthlyInstallment || 0, d.currency)} / mo`
              : formatCurrency(d.principalAmount, d.currency)}
          </div>
          <div className="text-slate-500">
            {d.interestRateAnnual}% p.a. • {d.termMonths} mos
            {d.category === 'DPS' && ` (${d.installmentsPaid || 0}/${d.totalInstallments} paid)`}
          </div>
        </div>
      ),
    },
    {
      header: 'Maturity Target',
      accessor: (d) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(d.maturityPayoutAmount, d.currency)}
          </div>
          <div className="text-slate-500">
            Matures: {d.maturityDate}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (d) => <AdminBadge type="deposit_status" value={d.status} />,
    },
    {
      header: 'Actions',
      accessor: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          {d.status === 'pending_approval' && (
            <Button
              size="sm"
              onClick={() => handleApprove(d)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-2.5 h-auto flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </Button>
          )}

          {d.status === 'active' && (
            <>
              <button
                onClick={() => {
                  setActiveDeposit(d);
                  setShowMatureModal(true);
                }}
                title="Execute Maturity Payout"
                className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveDeposit(d);
                  setShowRenewModal(true);
                }}
                title="Renew / Rollover Scheme"
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveDeposit(d);
                  setShowEarlyWithdrawModal(true);
                }}
                title="Premature Liquidation & Early Withdrawal"
                className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            {inferredCategory === 'DPS'
              ? 'Deposit Pension Schemes (DPS)'
              : inferredCategory === 'FDR'
              ? 'Fixed Deposit Receipts (FDR)'
              : 'Term Deposits & Wealth Schemes'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervise fixed certificates of deposit, recurring pension schemes, maturities, and early liquidations
          </p>
        </div>
        <Button
          onClick={() => {
            setNewDepositForm({
              ...newDepositForm,
              category: inferredCategory === 'DPS' ? 'DPS' : 'FDR',
              schemeTitle:
                inferredCategory === 'DPS'
                  ? 'Royal Dynasty Pension Scheme'
                  : 'Sovereign High Yield Term Fixed Deposit',
            });
            setShowOpenModal(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Open Deposit Scheme</span>
        </Button>
      </div>

      <AdminDepositNav />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Active Deposit Capital"
          value={formatCurrency(totalDeposited, 'USD')}
          icon={Vault}
          change={{ value: 9.4, isPositive: true }}
          period="vs prior 30 days"
        />
        <AdminStatCard
          title="Active Schemes In Portfolio"
          value={activeCount.toString()}
          icon={TrendingUp}
          badge={{ text: 'Accruing Interest', variant: 'success' }}
        />
        <AdminStatCard
          title="Pending Approval Queue"
          value={pendingCount.toString()}
          icon={Award}
          badge={{ text: 'Action required', variant: 'warning' }}
        />
      </div>

      {/* Filter Bar */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search scheme number, customer name, title..."
        filters={[
          {
            label: 'Deposit Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Active & Accruing', value: 'active' },
              { label: 'Pending Approval', value: 'pending_approval' },
              { label: 'Matured', value: 'matured' },
              { label: 'Prematurely Liquidated', value: 'early_withdrawn' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
        }}
      />

      {/* Table */}
      <AdminDataTable
        columns={columns}
        data={deposits}
        keyExtractor={(d) => d.id}
        isLoading={loading}
        emptyTitle="No deposit schemes found"
        emptyDescription="Open a new term deposit or adjust your filter selection."
      />

      {/* Modal: Open New Deposit */}
      <Modal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        title="Open Term Deposit Scheme"
        subtitle="Provision bespoke fixed deposit receipt or monthly pension savings plan"
        maxWidth="lg"
      >
        <form onSubmit={handleOpenScheme} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client / Depositor
              </label>
              <select
                value={newDepositForm.customerId}
                onChange={(e) => {
                  const cust = db.customers.find((c) => c.id === e.target.value);
                  const acc = db.accounts.find((a) => a.customerId === e.target.value);
                  setNewDepositForm({
                    ...newDepositForm,
                    customerId: e.target.value,
                    customerName: cust ? `${cust.firstName} ${cust.lastName}` : 'Client',
                    sourceAccountId: acc ? acc.id : 'acc-001',
                    sourceAccountNumber: acc ? acc.accountNumber : 'RB-NY-092144',
                  });
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {db.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Scheme Category
              </label>
              <select
                value={newDepositForm.category}
                onChange={(e) =>
                  setNewDepositForm({
                    ...newDepositForm,
                    category: e.target.value as AdminDepositCategory,
                    schemeTitle:
                      e.target.value === 'DPS'
                        ? 'Executive Wealth Accumulator DPS'
                        : 'Sovereign High Yield Term Fixed Deposit',
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="FDR">FDR - Fixed Deposit Receipt (Term Deposit)</option>
                <option value="DPS">DPS - Deposit Pension Scheme (Monthly Recurring)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Scheme Name / Branding Title
            </label>
            <input
              type="text"
              value={newDepositForm.schemeTitle}
              onChange={(e) => setNewDepositForm({ ...newDepositForm, schemeTitle: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {newDepositForm.category === 'FDR' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Principal Amount ($)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={newDepositForm.principalAmount}
                  onChange={(e) =>
                    setNewDepositForm({
                      ...newDepositForm,
                      principalAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Installment ($)
                </label>
                <input
                  type="number"
                  step="250"
                  value={newDepositForm.monthlyInstallment}
                  onChange={(e) =>
                    setNewDepositForm({
                      ...newDepositForm,
                      monthlyInstallment: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Term (Months)
              </label>
              <select
                value={newDepositForm.termMonths}
                onChange={(e) =>
                  setNewDepositForm({ ...newDepositForm, termMonths: parseInt(e.target.value) || 12 })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
                <option value="24">24 Months (2 Years)</option>
                <option value="36">36 Months (3 Years)</option>
                <option value="60">60 Months (5 Years)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.05"
                value={newDepositForm.interestRateAnnual}
                onChange={(e) =>
                  setNewDepositForm({
                    ...newDepositForm,
                    interestRateAnnual: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominee Name
              </label>
              <input
                type="text"
                value={newDepositForm.nomineeName}
                onChange={(e) => setNewDepositForm({ ...newDepositForm, nomineeName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominee Relationship
              </label>
              <input
                type="text"
                value={newDepositForm.nomineeRelationship}
                onChange={(e) =>
                  setNewDepositForm({ ...newDepositForm, nomineeRelationship: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newDepositForm.autoRenew}
                onChange={(e) => setNewDepositForm({ ...newDepositForm, autoRenew: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span className="font-semibold text-slate-900 dark:text-white">
                Enable Automatic Rollover upon Maturity Date
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowOpenModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
              Open & Book Scheme
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Maturity Payout Execution */}
      {activeDeposit && (
        <Modal
          isOpen={showMatureModal}
          onClose={() => setShowMatureModal(false)}
          title={`Execute Maturity Payout • ${activeDeposit.schemeNumber}`}
          subtitle={`Credit principal and accumulated yield to ledger ${activeDeposit.sourceAccountNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-200 dark:border-emerald-800">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Total Maturity Payout
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(activeDeposit.maturityPayoutAmount, activeDeposit.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Depositor:</span>
                <span className="font-medium text-slate-900 dark:text-white">{activeDeposit.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Destination Ledger:</span>
                <span className="font-mono text-slate-900 dark:text-white">{activeDeposit.sourceAccountNumber}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowMatureModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleMatureConfirm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Release Payout to Ledger
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Rollover / Renew */}
      {activeDeposit && (
        <Modal
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          title={`Rollover & Renew • ${activeDeposit.schemeNumber}`}
          subtitle="Extend term and rollover deposit capital"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Rollover Capital Structure
              </label>
              <select
                value={renewalType}
                onChange={(e) =>
                  setRenewalType(e.target.value as 'principal_only' | 'principal_and_interest')
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="principal_and_interest">
                  Compound Rollover: Principal + Accrued Yield ($
                  {activeDeposit.maturityPayoutAmount.toLocaleString()})
                </option>
                <option value="principal_only">
                  Base Rollover: Original Principal Only ($
                  {activeDeposit.principalAmount.toLocaleString()})
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRenewModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRenewConfirm}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Confirm Rollover
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Early Withdrawal Liquidation */}
      {activeDeposit && (
        <Modal
          isOpen={showEarlyWithdrawModal}
          onClose={() => setShowEarlyWithdrawModal(false)}
          title={`Premature Liquidation • ${activeDeposit.schemeNumber}`}
          subtitle="Early redemption with penalty deduction"
          maxWidth="md"
        >
          <form onSubmit={handleWithdrawConfirm} className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs space-y-1.5 text-rose-900 dark:text-rose-200">
              <div className="flex justify-between font-semibold">
                <span>Early Penalty Deduction:</span>
                <span>{activeDeposit.earlyWithdrawalPenaltyPercent}% of capital</span>
              </div>
              <p className="text-rose-700 dark:text-rose-300">
                Prorated interest will be capped at 40% of standard yield and the penalty deducted prior to ledger payout.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Premature Liquidation
              </label>
              <textarea
                value={withdrawalReason}
                onChange={(e) => setWithdrawalReason(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowEarlyWithdrawModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
                Liquidate & Refund
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
