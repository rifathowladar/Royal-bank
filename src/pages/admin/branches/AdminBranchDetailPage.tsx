import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  GitBranch,
  Building,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  DollarSign,
  TrendingUp,
  Radio,
  Clock,
  CreditCard,
  Users,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { PermissionGate } from '../../../components/common/PermissionGate.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminBranchService } from '../../../backend/services/adminBranchService.ts';
import { Branch, Employee, Transaction } from '../../../backend/types/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';

export const AdminBranchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Update vault cash modal
  const [showCashModal, setShowCashModal] = useState(false);
  const [newVaultCash, setNewVaultCash] = useState<number>(0);
  const [isUpdatingCash, setIsUpdatingCash] = useState(false);

  const loadBranchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const b = await adminBranchService.getBranchById(id);
      if (!b) {
        addToast('Branch facility not found.', 'error');
        navigate('/admin/branches');
        return;
      }
      setBranch(b);
      setNewVaultCash(b.cashPosition.vaultCashUSD);

      const [staff, txs] = await Promise.all([
        adminBranchService.getBranchEmployees(b.id),
        adminBranchService.getBranchTransactions(b.id),
      ]);
      setEmployees(staff);
      setTransactions(txs);
    } catch (err: any) {
      addToast(err.message || 'Failed to load branch details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranchData();
  }, [id]);

  const handleUpdateVaultCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branch) return;
    setIsUpdatingCash(true);

    try {
      const updated = await adminBranchService.updateCashPosition(branch.id, Number(newVaultCash));
      setBranch(updated);
      addToast(`Vault cash reserve updated to ${formatCurrency(newVaultCash, 'USD')}.`, 'success');
      setShowCashModal(false);
    } catch (err: any) {
      addToast(err.message || 'Authorization failed.', 'error');
    } finally {
      setIsUpdatingCash(false);
    }
  };

  if (loading || !branch) {
    return (
      <div className="p-8">
        <LoadingState message="Connecting to facility vault & telemetry nodes..." />
      </div>
    );
  }

  const depositProgress = Math.min(100, Math.round((branch.performance.depositActualUSD / branch.performance.depositTargetUSD) * 100));
  const loanProgress = Math.min(100, Math.round((branch.performance.loanActualUSD / branch.performance.loanTargetUSD) * 100));

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link
            to="/admin/branches"
            className="text-xs text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Branches Network
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {branch.name}
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-royal-100 text-royal-800 dark:bg-royal-950 dark:text-royal-300">
              {branch.code}
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {branch.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {branch.address}, {branch.city}, {branch.state} {branch.postalCode}, {branch.country}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate resource="branches" action="edit">
            <Button size="sm" variant="outline" onClick={() => setShowCashModal(true)}>
              <Edit className="w-3.5 h-3.5 mr-1" />
              Adjust Vault Cash
            </Button>
          </PermissionGate>
          <Button size="sm" variant="outline" onClick={loadBranchData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Highlights: Manager + Cash Position + ATM Network */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Branch Manager */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Branch Leadership</span>
            <UserCheck className="w-4 h-4 text-royal-600" />
          </div>

          <div className="flex items-center gap-3">
            <img
              src={branch.branchManager.avatar}
              alt={branch.branchManager.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-royal-500"
            />
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {branch.branchManager.name}
              </div>
              <div className="text-xs text-slate-500">Branch General Manager</div>
            </div>
          </div>

          <div className="text-xs space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{branch.branchManager.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{branch.branchManager.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{branch.operatingHours}</span>
            </div>
          </div>
        </Card>

        {/* Vault Cash Position */}
        <Card className="p-5 space-y-3 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Vault Cash Reserves</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(branch.cashPosition.vaultCashUSD, 'USD')}
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Vault Capacity Utilization</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {Math.round((branch.cashPosition.vaultCashUSD / branch.cashPosition.vaultCapacityUSD) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${(branch.cashPosition.vaultCashUSD / branch.cashPosition.vaultCapacityUSD) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Audited: {formatDate(branch.cashPosition.lastAuditedAt)}</span>
              <span className="uppercase font-bold text-emerald-600">Status: {branch.cashPosition.status}</span>
            </div>
          </div>
        </Card>

        {/* Performance Targets */}
        <Card className="p-5 space-y-3 border-l-4 border-l-royal-600">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Commercial Performance</span>
            <TrendingUp className="w-4 h-4 text-royal-600" />
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Deposit Target</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(branch.performance.depositActualUSD, 'USD')} / {formatCurrency(branch.performance.depositTargetUSD, 'USD')} ({depositProgress}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-royal-600" style={{ width: `${depositProgress}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Loan Underwriting Target</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(branch.performance.loanActualUSD, 'USD')} / {formatCurrency(branch.performance.loanTargetUSD, 'USD')} ({loanProgress}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-indigo-600" style={{ width: `${loanProgress}%` }} />
              </div>
            </div>

            <div className="flex justify-between text-[11px] pt-1 text-slate-400">
              <span>Monthly Growth: <strong className="text-emerald-600">+{branch.performance.monthlyGrowth}%</strong></span>
              <span>Client CSAT: <strong className="text-amber-500">★ {branch.performance.customerRating}</strong></span>
            </div>
          </div>
        </Card>
      </div>

      {/* ATM Fleet Status */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-indigo-500" />
          ATM Network Telemetry ({branch.atms.length} Terminals)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {branch.atms.map((atm) => (
            <div
              key={atm.id}
              className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {atm.code}
                </span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                    atm.status === 'operational'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : atm.status === 'low_cash'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {atm.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                {atm.locationDetails}
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Cash Dispenser</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(atm.cashRemainingUSD, 'USD')} / {formatCurrency(atm.capacityUSD, 'USD')}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      atm.cashRemainingUSD / atm.capacityUSD < 0.2 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(atm.cashRemainingUSD / atm.capacityUSD) * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                Last Serviced: {formatDate(atm.lastServiced)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Staff Roster & Recent Transactions Tabular Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Personnel Roster */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-royal-600" />
              Branch Personnel Roster ({employees.length})
            </h3>
            <Link to="/admin/employees" className="text-xs text-royal-600 hover:underline">
              All Employees &rarr;
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {employees.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No assigned staff registered.</p>
            ) : (
              employees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => navigate(`/admin/employees/${emp.id}`)}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={emp.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{emp.fullName}</div>
                      <div className="text-[11px] text-slate-500">{emp.department} • {emp.role.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">{emp.employeeId}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Live Branch Activity */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Live Counter & OTC Transactions
          </h3>

          <div className="space-y-2 text-xs">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{tx.description}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{tx.reference} • {formatDate(tx.timestamp)}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(tx.amount, tx.currency)}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-emerald-600">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Adjust Vault Cash Modal */}
      {showCashModal && (
        <Modal
          isOpen={showCashModal}
          onClose={() => setShowCashModal(false)}
          title={`Adjust Vault Cash Reserves • ${branch.name}`}
          subtitle={`Current Physical Vault Balance: ${formatCurrency(branch.cashPosition.vaultCashUSD, 'USD')}`}
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateVaultCash} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Vault Cash Balance (USD)
              </label>
              <input
                type="number"
                min="0"
                max={branch.cashPosition.vaultCapacityUSD}
                value={newVaultCash}
                onChange={(e) => setNewVaultCash(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Max vault structural capacity: {formatCurrency(branch.cashPosition.vaultCapacityUSD, 'USD')}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCashModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary" disabled={isUpdatingCash}>
                {isUpdatingCash ? 'Saving...' : 'Authorize Vault Update'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
