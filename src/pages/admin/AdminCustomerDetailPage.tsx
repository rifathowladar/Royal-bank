import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  adminCustomerService,
  CustomerFullDetailResult,
  Customer,
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
  Users,
  Landmark,
  ArrowRightLeft,
  CreditCard,
  Building2,
  FileCheck,
  ShieldCheck,
  Smartphone,
  LifeBuoy,
  ScrollText,
  Snowflake,
  CheckCircle2,
  KeyRound,
  Edit,
  ArrowLeft,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  User,
  ShieldAlert,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const AdminCustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const permissions = useAdminPermissions();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<CustomerFullDetailResult | null>(null);

  // Tab State
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Action modal
  const [activeModal, setActiveModal] = useState<AdminActionType | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // Risk update modal
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [newRisk, setNewRisk] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [riskNotes, setRiskNotes] = useState('');

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminCustomerService.getCustomerFullDetails(id);
      if (!res) {
        addToast('Customer record not found', 'error');
        navigate('/admin/customers');
        return;
      }
      setDetail(res);
      setNewRisk(res.customer.riskScore);
    } catch (err: any) {
      addToast(err?.message || 'Failed to load customer dossier', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading || !detail) {
    return (
      <LoadingState
        type="table"
        message="Decrypting and loading comprehensive customer dossier..."
      />
    );
  }

  const { customer, profile, accounts, transactions, cards, loans, kyc, security, devices, sessions, tickets, auditLogs } = detail;
  const isFrozen = customer.status === 'suspended' || customer.status === 'closed';

  const handleActionConfirm = async (payload: { reason: string; extra?: any }) => {
    if (!activeModal) return;
    try {
      if (activeModal === 'freeze_customer') {
        await adminCustomerService.freezeCustomer(customer.id, payload.reason);
        addToast('Customer dossier and linked ledgers frozen.', 'warning');
      } else if (activeModal === 'unfreeze_customer') {
        await adminCustomerService.unfreezeCustomer(customer.id, payload.reason);
        addToast('Freeze lifted. Customer is now active.', 'success');
      } else if (activeModal === 'reset_password') {
        const res = await adminCustomerService.resetPassword(customer.id);
        setTempPassword(res.temporaryPassword);
        addToast('Temporary security token created.', 'info');
      }
      loadData();
    } catch (err: any) {
      addToast(err?.message || 'Operation failed', 'error');
    }
  };

  const handleSaveRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCustomerService.updateRiskScore(customer.id, newRisk, riskNotes);
      addToast(`Risk rating adjusted to ${newRisk}`, 'success');
      setIsRiskModalOpen(false);
      loadData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to update risk rating', 'error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User, count: undefined },
    { id: 'accounts', label: 'Accounts', icon: Landmark, count: accounts.length },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft, count: transactions.length },
    { id: 'cards', label: 'Cards', icon: CreditCard, count: cards.length },
    { id: 'loans', label: 'Loans', icon: Building2, count: loans.length },
    { id: 'kyc', label: 'KYC & ID', icon: FileCheck, count: undefined },
    { id: 'security', label: 'Security', icon: ShieldCheck, count: undefined },
    { id: 'devices', label: 'Devices', icon: Smartphone, count: devices.length },
    { id: 'support', label: 'Support Tickets', icon: LifeBuoy, count: tickets.length },
    { id: 'audit', label: 'Audit Activity', icon: ScrollText, count: auditLogs.length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customer Registry
        </button>

        <span className="font-mono text-xs text-slate-400">
          Dossier Internal UID: {customer.id}
        </span>
      </div>

      {/* Customer Header Dossier Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-royal-800 text-amber-400 dark:text-amber-300 font-bold text-xl flex items-center justify-center shrink-0 ring-4 ring-slate-100 dark:ring-slate-800 shadow-sm">
              {customer.firstName[0]}
              {customer.lastName[0]}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {customer.firstName} {customer.lastName}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {customer.customerNumber}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {customer.tier}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {customer.email}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5" />
                  {customer.phone}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {customer.address.city}, {customer.address.country}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <AdminBadge type="customer_status" value={customer.status} />
                <AdminBadge type="kyc_status" value={customer.kycStatus} />
                <AdminBadge type="risk_score" value={customer.riskScore} />
              </div>
            </div>
          </div>

          {/* Quick Metrics and Actions */}
          <div className="flex flex-wrap items-center gap-3 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-6">
            <div className="mr-2 text-right">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Vault Balance
              </p>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {formatCurrency(customer.totalBalanceUSD, 'USD')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {permissions.canFreezeCustomer && (
                <Button
                  size="sm"
                  variant={isFrozen ? 'primary' : 'outline'}
                  onClick={() =>
                    setActiveModal(isFrozen ? 'unfreeze_customer' : 'freeze_customer')
                  }
                  icon={
                    isFrozen ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Snowflake className="w-3.5 h-3.5 text-cyan-500" />
                    )
                  }
                >
                  {isFrozen ? 'Unfreeze' : 'Freeze Assets'}
                </Button>
              )}

              {permissions.canResetPassword && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveModal('reset_password')}
                  icon={<KeyRound className="w-3.5 h-3.5 text-amber-500" />}
                >
                  Reset Token
                </Button>
              )}

              {permissions.canManageRisk && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRiskModalOpen(true)}
                  icon={<ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
                >
                  Adjust Risk
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-royal-800 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity & Legal Info */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              Verified Identity & Tax Residency
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Legal Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.title} {customer.firstName} {customer.lastName}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Date of Birth</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {customer.dateOfBirth}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">National ID Masked</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {customer.nationalIdMasked}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Tax Residency</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {customer.address.country}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Registration Date</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {formatDate(customer.createdAt)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Last Session Login</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {customer.lastLoginAt ? formatDate(customer.lastLoginAt) : 'Never'}
                </span>
              </div>
            </div>
          </Card>

          {/* Employment & Source of Funds */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-500" />
              Employment & Provenance of Wealth
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.employment.employmentStatus}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Principal Entity</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.employment.companyName}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Designation</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.employment.designation}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Annual Declared Income</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ${profile.employment.annualIncome.toLocaleString()} USD
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Source of Funds</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.employment.sourceOfFunds}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">TIN / Tax Identifier</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {profile.employment.tinOrTaxId}
                </span>
              </div>
            </div>
          </Card>

          {/* Succession & Nominee */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Designated Nominee & Succession
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Nominee Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.nominee.fullName}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Relationship</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.nominee.relationship}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Share Allocation</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {profile.nominee.sharePercentage}%
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Identity Number</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {profile.nominee.identityNumberMasked}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Contact Phone</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {profile.nominee.phone}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Accounts */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Allocated Ledger Accounts ({accounts.length})
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/admin/accounts?search=${customer.customerNumber}`)}
            >
              Open in Account Manager &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <Card
                key={acc.id}
                className="p-5 border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {acc.type} ledger
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">{acc.name}</h4>
                    <p className="font-mono text-xs text-slate-500">{acc.accountNumber}</p>
                  </div>
                  <AdminBadge type="account_status" value={acc.status} />
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CURRENT BALANCE</span>
                    <strong className="text-lg font-mono text-slate-900 dark:text-white">
                      {formatCurrency(acc.balance, acc.currency)}
                    </strong>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/accounts/${acc.id}`)}
                  >
                    Manage Ledger
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Transactions */}
      {activeTab === 'transactions' && (
        <Card className="p-5 border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Transaction Stream ({transactions.length})
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/admin/transactions?search=${customer.customerNumber}`)}
            >
              Filter in Transaction Center &rarr;
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
                  <th className="py-2.5 px-3 text-right">Action</th>
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
                        Inspect
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Issued Payment Cards ({cards.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((c) => (
              <Card key={c.id} className="p-5 border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-500 uppercase">{c.network}</span>
                  <AdminBadge type="customer_status" value={c.status} />
                </div>
                <div className="py-2">
                  <p className="font-mono text-lg font-bold text-slate-900 dark:text-white tracking-wider">
                    {c.cardNumberMasked}
                  </p>
                  <p className="text-xs text-slate-400 uppercase mt-1">{c.cardholderName}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Expires {c.expiryMonth}/{c.expiryYear}</span>
                  <span className="font-mono font-medium">
                    Limit: ${c.spendingLimitMonthly.toLocaleString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Loans */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Credit & Sovereign Facilities ({loans.length})
            </h3>
          </div>

          {loans.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No outstanding loan agreements recorded for this customer.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map((l) => (
                <Card key={l.id} className="p-5 border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        {l.loanNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white capitalize">
                        {l.type.replace('_', ' ')} Facility
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full uppercase">
                      {l.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div>
                      <span className="text-slate-400 text-[10px] block">OUTSTANDING</span>
                      <strong className="text-base font-mono text-slate-900 dark:text-white">
                        {formatCurrency(l.currentBalance, l.currency)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">INTEREST RATE</span>
                      <strong className="text-base font-mono text-amber-500">
                        {l.annualInterestRate}% APR
                      </strong>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: KYC */}
      {activeTab === 'kyc' && (
        <div className="space-y-4">
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Supervisory KYC & AML Dossier
                </h3>
                <p className="text-xs text-slate-500">
                  Biometric compliance and governmental document validation
                </p>
              </div>
              <AdminBadge type="kyc_status" value={customer.kycStatus} />
            </div>

            {kyc ? (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-[10px] block">TIER LEVEL</span>
                    <strong className="text-slate-900 dark:text-white">{kyc.verificationLevel}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-[10px] block">VERIFICATION EXPIRY</span>
                    <strong className="font-mono text-slate-900 dark:text-white">
                      {kyc.expiresAt ? formatDate(kyc.expiresAt) : 'Perpetual Tier 3'}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-[10px] block">RISK CLASSIFICATION</span>
                    <strong className="text-slate-900 dark:text-white">{kyc.riskCategory} Risk</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Verified Document Archive
                  </h4>
                  <div className="space-y-2">
                    {kyc.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <FileCheck className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{doc.title}</p>
                            <p className="text-[11px] text-slate-400">
                              Uploaded {formatDate(doc.uploadedAt)} · Size {doc.fileSize}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-600 font-semibold">
                          VERIFIED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                KYC records are managed under Tier-1 centralized archive.
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Tab 7: Security */}
      {activeTab === 'security' && (
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Security & Authentication Posture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Two-Factor Enforcement
              </span>
              <p className="text-slate-500">
                Status: {security.twoFactorEnabled ? 'Enabled & Enforced' : 'Disabled'}
              </p>
              <p className="text-slate-500 font-mono">
                Primary Method: {security.twoFactorMethod.toUpperCase()} (Hardware OTP)
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Session Control
              </span>
              <p className="text-slate-500">
                Session Idle Timeout: {security.sessionTimeoutMinutes} minutes
              </p>
              <p className="text-slate-500">
                International Roaming Logins: {security.allowInternationalLogins ? 'Allowed' : 'Blocked'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 8: Devices */}
      {activeTab === 'devices' && (
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Authorized Hardware & Trusted Nodes ({devices.length})
          </h3>
          <div className="space-y-2">
            {devices.map((d) => (
              <div
                key={d.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{d.deviceName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {d.ipAddress} · {d.location} · Last Active: {formatDate(d.lastActive)}
                    </p>
                  </div>
                </div>
                {d.isCurrentDevice && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                    Current Session
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 9: Support Tickets */}
      {activeTab === 'support' && (
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Concierge & Support Inquiries ({tickets.length})
          </h3>
          {tickets.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No outstanding tickets filed by this customer.
            </p>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 block">{t.ticketNumber}</span>
                    <strong className="text-slate-900 dark:text-white">{t.subject}</strong>
                    <p className="text-[11px] text-slate-500">{t.category} · Priority: {t.priority}</p>
                  </div>
                  <span className="font-semibold uppercase text-[11px] text-amber-600">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 10: Audit Activity */}
      {activeTab === 'audit' && (
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Immutable Supervisory Audit Trail
          </h3>
          <AdminAuditLogViewer logs={auditLogs} />
        </Card>
      )}

      {/* Action Modal (Freeze/Unfreeze/Reset) */}
      {activeModal && (
        <AdminActionModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          actionType={activeModal}
          targetId={customer.id}
          targetName={`${customer.firstName} ${customer.lastName}`}
          onConfirm={handleActionConfirm}
        />
      )}

      {/* Risk Score Modal */}
      {isRiskModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsRiskModalOpen(false)}
          title="Adjust AML Risk Rating"
          size="sm"
        >
          <form onSubmit={handleSaveRisk} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Risk Classification
              </label>
              <select
                value={newRisk}
                onChange={(e) => setNewRisk(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Supervisory Justification
              </label>
              <textarea
                rows={3}
                value={riskNotes}
                onChange={(e) => setRiskNotes(e.target.value)}
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
                onClick={() => setIsRiskModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit Risk Rating
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Temporary Password Token Display Modal */}
      {tempPassword && (
        <Modal
          isOpen={true}
          onClose={() => setTempPassword(null)}
          title="Supervisory Password Issued"
          size="sm"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Temporary access key generated for customer <strong>{customer.firstName}</strong>:
            </p>
            <div className="p-3 bg-slate-900 text-amber-400 font-mono text-center font-bold tracking-widest text-lg rounded-xl border border-amber-500/30">
              {tempPassword}
            </div>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => setTempPassword(null)}
            >
              Done
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
