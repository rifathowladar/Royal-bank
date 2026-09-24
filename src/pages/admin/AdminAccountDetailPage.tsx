import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  adminAccountService,
  AccountFullDetailResult,
  AccountStatus,
} from '../../backend/index.ts';
import {
  AdminBadge,
  AdminActionModal,
  AdminActionType,
  AdminAuditLogViewer,
} from '../../components/admin/index.ts';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';
import { useAdminPermissions, useToast } from '../../hooks/index.ts';
import {
  Landmark,
  ArrowLeft,
  Snowflake,
  CheckCircle2,
  SlidersHorizontal,
  XCircle,
  RotateCcw,
  User,
  ArrowRightLeft,
  CreditCard,
  ScrollText,
  ShieldAlert,
  Building2,
  DollarSign,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const AdminAccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = useAdminPermissions();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<AccountFullDetailResult | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'limits' | 'transactions' | 'cards' | 'audit'>('overview');

  // Modal State
  const [actionModal, setActionModal] = useState<AdminActionType | null>(null);

  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<AccountStatus>('active');
  const [statusReason, setStatusReason] = useState('');

  const loadAccount = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminAccountService.getAccountFullDetails(id);
      if (!res) {
        addToast('Account ledger record not found', 'error');
        navigate('/admin/accounts');
        return;
      }
      setDetail(res);
      setNewStatus(res.account.status);
    } catch (err: any) {
      addToast(err?.message || 'Failed to load account ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, [id]);

  if (loading || !detail) {
    return (
      <LoadingState
        type="table"
        message="Auditing core banking ledger and verifying balance integrity..."
      />
    );
  }

  const { account, customer, limits, transactions, cards, auditLogs } = detail;
  const isFrozen = account.status === 'frozen';
  const isClosed = account.status === 'closed';

  const handleActionConfirm = async (payload: { reason: string; extra?: any }) => {
    if (!actionModal) return;
    try {
      if (actionModal === 'freeze_account') {
        await adminAccountService.freezeAccount(account.id, payload.reason);
        addToast(`Ledger ${account.accountNumber} frozen.`, 'warning');
      } else if (actionModal === 'unfreeze_account') {
        await adminAccountService.unfreezeAccount(account.id, payload.reason);
        addToast(`Ledger ${account.accountNumber} reactivated.`, 'success');
      } else if (actionModal === 'close_account') {
        await adminAccountService.closeAccount(account.id, payload.reason);
        addToast(`Ledger ${account.accountNumber} closed.`, 'warning');
      } else if (actionModal === 'change_limits') {
        await adminAccountService.changeLimits(account.id, payload.extra);
        addToast(`Limits for ${account.accountNumber} updated.`, 'success');
      }
      loadAccount();
    } catch (err: any) {
      addToast(err?.message || 'Action failed', 'error');
    }
  };

  const handleApprove = async () => {
    try {
      await adminAccountService.approveAccount(account.id);
      addToast('Ledger approved and cleared for customer use.', 'success');
      loadAccount();
    } catch (err: any) {
      addToast(err?.message || 'Approval failed', 'error');
    }
  };

  const handleCommitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAccountService.changeAccountStatus(account.id, newStatus, statusReason);
      addToast(`Status updated to ${newStatus}`, 'success');
      setIsStatusModalOpen(false);
      loadAccount();
    } catch (err: any) {
      addToast(err?.message || 'Failed to update status', 'error');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Return Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/accounts')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Accounts Registry
        </button>

        <span className="font-mono text-xs text-slate-400">
          Internal Ledger UID: {account.id}
        </span>
      </div>

      {/* Account Master Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-royal-900 dark:bg-royal-950 text-amber-400 font-bold text-xl flex items-center justify-center shrink-0 ring-4 ring-slate-100 dark:ring-slate-800 shadow-sm">
              <Landmark className="w-8 h-8" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {account.name}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {account.accountNumber}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 capitalize">
                  {account.type}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>Branch: {account.branch}</span>
                <span>·</span>
                <span>IBAN: {account.iban}</span>
                <span>·</span>
                <span>BIC: {account.swiftBic}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <AdminBadge type="account_status" value={account.status} />
              </div>
            </div>
          </div>

          {/* Balance and Action Controls */}
          <div className="flex flex-wrap items-center gap-4 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-6">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Ledger Balance
              </p>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {formatCurrency(account.balance, account.currency)}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Available: {formatCurrency(account.availableBalance, account.currency)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {account.status !== 'active' && permissions.canApproveAccount && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleApprove}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Approve Ledger
                </Button>
              )}

              {permissions.canFreezeAccount && !isClosed && (
                <Button
                  size="sm"
                  variant={isFrozen ? 'primary' : 'outline'}
                  onClick={() =>
                    setActionModal(isFrozen ? 'unfreeze_account' : 'freeze_account')
                  }
                  icon={
                    isFrozen ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Snowflake className="w-3.5 h-3.5 text-cyan-500" />
                    )
                  }
                >
                  {isFrozen ? 'Unfreeze' : 'Freeze'}
                </Button>
              )}

              {permissions.canChangeAccountLimits && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActionModal('change_limits')}
                  icon={<SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />}
                >
                  Limits
                </Button>
              )}

              {permissions.canChangeAccountStatus && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsStatusModalOpen(true)}
                >
                  Change Status
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 overflow-x-auto mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Ledger Overview', icon: Landmark },
            { id: 'limits', label: 'Operational Limits', icon: SlidersHorizontal },
            { id: 'transactions', label: `Transactions (${transactions.length})`, icon: ArrowRightLeft },
            { id: 'cards', label: `Linked Cards (${cards.length})`, icon: CreditCard },
            { id: 'audit', label: `Supervisory Audit (${auditLogs.length})`, icon: ScrollText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-royal-800 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Coordinates */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              Settlement Coordinates & Clearing Specs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  International IBAN
                </span>
                <div className="flex items-center justify-between font-mono font-bold text-slate-900 dark:text-white">
                  <span>{account.iban}</span>
                  <button
                    onClick={() => copyToClipboard(account.iban, 'IBAN')}
                    className="p-1 hover:text-amber-500"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  SWIFT / BIC Network Code
                </span>
                <div className="flex items-center justify-between font-mono font-bold text-slate-900 dark:text-white">
                  <span>{account.swiftBic}</span>
                  <button
                    onClick={() => copyToClipboard(account.swiftBic, 'SWIFT BIC')}
                    className="p-1 hover:text-amber-500"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  Annual Yield Interest Rate
                </span>
                <p className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                  {account.interestRateAnnual}% Annualized APR
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  Ledger Opening Timestamp
                </span>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {formatDate(account.openedAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Linked Customer Card */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              Beneficiary Dossier
            </h3>

            {customer ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center shrink-0">
                    {customer.firstName[0]}
                    {customer.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {customer.firstName} {customer.lastName}
                    </h4>
                    <span className="font-mono text-slate-400">{customer.customerNumber}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-slate-600 dark:text-slate-300">
                  <p>Tier: <strong className="text-amber-500">{customer.tier}</strong></p>
                  <p>Risk: <strong className="text-slate-900 dark:text-white">{customer.riskScore}</strong></p>
                  <p>Email: <span className="font-mono">{customer.email}</span></p>
                  <p>Phone: <span className="font-mono">{customer.phone}</span></p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/admin/customers/${customer.id}`)}
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View Full Customer Dossier
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Institutional Master Book</p>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Limits */}
      {activeTab === 'limits' && (
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Operational Velocity Limits & Safeguards
              </h3>
              <p className="text-xs text-slate-500">
                Risk rules enforced at real-time settlement gateway
              </p>
            </div>
            {permissions.canChangeAccountLimits && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setActionModal('change_limits')}
                icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              >
                Modify Limits
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Daily Transfer Ceiling
              </span>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                ${limits.dailyTransferLimit.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Per 24h rolling cycle</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Single Transaction Limit
              </span>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                ${limits.singleTransactionLimit.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Maximum per wire/ACH</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Daily ATM Cash Withdrawal
              </span>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                ${limits.dailyAtmLimit.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Cirrus & Plus Network</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Overdraft Facility Protection
              </span>
              <p className="text-2xl font-bold font-mono text-amber-500 mt-2">
                ${limits.overdraftLimit.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Authorized overdraft</span>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Transactions */}
      {activeTab === 'transactions' && (
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Ledger Settlement Stream ({transactions.length})
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/admin/transactions?search=${account.accountNumber}`)}
            >
              Open in Clearing Center &rarr;
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.slice(0, 10).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {t.referenceNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{formatDate(t.timestamp)}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {t.description}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold ${
                        t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {formatCurrency(t.amount, t.currency)}
                    </td>
                    <td className="py-3 px-3">
                      <AdminBadge type="transaction_status" value={t.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/transactions/${t.id}`)}
                        className="text-amber-600 hover:text-amber-500 font-semibold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Cards */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c) => (
            <Card key={c.id} className="p-5 border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-500 uppercase text-xs">{c.network}</span>
                <AdminBadge type="customer_status" value={c.status} />
              </div>
              <p className="font-mono text-xl font-bold tracking-wider text-slate-900 dark:text-white">
                {c.cardNumberMasked}
              </p>
              <div className="pt-2 flex justify-between text-xs text-slate-400">
                <span>Holder: {c.cardholderName}</span>
                <span>Exp: {c.expiryMonth}/{c.expiryYear}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 5: Audit Activity */}
      {activeTab === 'audit' && (
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Immutable Supervisory Audit Trail
          </h3>
          <AdminAuditLogViewer logs={auditLogs} />
        </Card>
      )}

      {/* Action Modal (Freeze/Unfreeze/Close/Limits) */}
      {actionModal && (
        <AdminActionModal
          isOpen={true}
          onClose={() => setActionModal(null)}
          actionType={actionModal}
          targetId={account.id}
          targetName={`${account.name} (${account.accountNumber})`}
          initialExtra={limits}
          onConfirm={handleActionConfirm}
        />
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Alter Status: ${account.accountNumber}`}
          size="sm"
        >
          <form onSubmit={handleCommitStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as AccountStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="frozen">Frozen</option>
                <option value="restricted">Restricted / Compliance Hold</option>
                <option value="dormant">Dormant</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Supervisory Audit Justification
              </label>
              <textarea
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Compliance rationale..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsStatusModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit Status
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
