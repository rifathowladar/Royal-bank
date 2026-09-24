import React, { useEffect, useState } from 'react';
import { AdminQrNav } from '../../../components/admin/AdminQrNav.tsx';
import { AdminDataTable, Column } from '../../../components/admin/AdminDataTable.tsx';
import { AdminFilterBar } from '../../../components/admin/AdminFilterBar.tsx';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminQrService,
  AdminMerchant,
} from '../../../backend/services/adminQrService.ts';
import {
  Store,
  Plus,
  QrCode,
  Sliders,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Ban,
  Download,
  Copy,
  Receipt,
  Eye,
  Building2,
  DollarSign,
} from 'lucide-react';

export const AdminQrMerchantsPage: React.FC = () => {
  const [merchants, setMerchants] = useState<AdminMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showStaticQrModal, setShowStaticQrModal] = useState(false);
  const [showFeeLimitModal, setShowFeeLimitModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeMerchant, setActiveMerchant] = useState<AdminMerchant | null>(null);

  // Form states
  const [newMerchant, setNewMerchant] = useState({
    name: '',
    category: 'Fine Dining & Hospitality',
    terminalLocation: '',
    contactPerson: '',
    email: '',
    phone: '',
    taxId: '',
    bankAccount: '•••• 9104',
    bankName: 'Royal Bank Private',
    feeRatePercent: 1.25,
    dailyVolumeLimit: 150000,
    singleTransactionLimit: 25000,
  });

  const [feeLimits, setFeeLimits] = useState({
    feeRatePercent: 1.25,
    fixedFee: 0.25,
    dailyVolumeLimit: 100000,
    singleTransactionLimit: 25000,
    reason: '',
  });

  const [kycReview, setKycReview] = useState({
    status: 'verified' as AdminMerchant['kycStatus'],
    notes: 'Commercial documentation and beneficiary verification passed.',
  });

  const { addToast } = useToast();

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const data = await adminQrService.getMerchants({
        search,
        status: statusFilter,
        kycStatus: kycFilter,
      });
      setMerchants(data);
    } catch {
      addToast('Error loading merchants list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, [search, statusFilter, kycFilter]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminQrService.registerMerchant(newMerchant);
      addToast('New merchant terminal registered successfully', 'success');
      setShowRegisterModal(false);
      fetchMerchants();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      addToast(msg, 'error');
    }
  };

  const handleUpdateStatus = async (
    merchant: AdminMerchant,
    newStatus: AdminMerchant['status']
  ) => {
    try {
      await adminQrService.updateMerchantStatus(
        merchant.id,
        newStatus,
        `Administrative update to ${newStatus}`
      );
      addToast(`Merchant status changed to ${newStatus}`, 'success');
      fetchMerchants();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      addToast(msg, 'error');
    }
  };

  const handleUpdateFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMerchant) return;
    try {
      await adminQrService.updateMerchantFeesAndLimits(
        activeMerchant.id,
        {
          feeRatePercent: feeLimits.feeRatePercent,
          fixedFee: feeLimits.fixedFee,
          dailyVolumeLimit: feeLimits.dailyVolumeLimit,
          singleTransactionLimit: feeLimits.singleTransactionLimit,
        },
        feeLimits.reason || 'Annual commercial tariff revision'
      );
      addToast('Fees and limits updated successfully', 'success');
      setShowFeeLimitModal(false);
      fetchMerchants();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update fees';
      addToast(msg, 'error');
    }
  };

  const handleUpdateKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMerchant) return;
    try {
      await adminQrService.updateMerchantKyc(
        activeMerchant.id,
        kycReview.status,
        kycReview.notes
      );
      addToast(`Merchant KYC marked as ${kycReview.status}`, 'success');
      setShowKycModal(false);
      fetchMerchants();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update KYC';
      addToast(msg, 'error');
    }
  };

  const columns: Column<AdminMerchant>[] = [
    {
      header: 'Merchant Terminal',
      accessor: (m) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Store className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{m.name}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            {m.merchantCode} • {m.category}
          </div>
        </div>
      ),
    },
    {
      header: 'Location & Contact',
      accessor: (m) => (
        <div className="text-xs">
          <div className="text-slate-900 dark:text-slate-200 truncate max-w-[200px]">
            {m.terminalLocation}
          </div>
          <div className="text-slate-500 dark:text-slate-400 mt-0.5">
            {m.contactPerson} ({m.phone})
          </div>
        </div>
      ),
    },
    {
      header: 'Status & KYC',
      accessor: (m) => (
        <div className="space-y-1">
          <div>
            <AdminBadge type="merchant_status" value={m.status} />
          </div>
          <div>
            <AdminBadge type="merchant_kyc" value={m.kycStatus} />
          </div>
        </div>
      ),
    },
    {
      header: 'Commercial Terms',
      accessor: (m) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            MDR: {m.feeRatePercent}% + ${m.fixedFee}
          </div>
          <div className="text-slate-500">
            Daily Cap: {formatCurrency(m.dailyVolumeLimit, 'USD')}
          </div>
        </div>
      ),
    },
    {
      header: 'Volumes & Escrow',
      accessor: (m) => (
        <div className="text-xs space-y-0.5 text-right">
          <div className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(m.totalVolume, 'USD')}
          </div>
          <div className="text-amber-600 dark:text-amber-400 font-semibold">
            Escrow: {formatCurrency(m.pendingSettlementAmount, 'USD')}
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setActiveMerchant(m);
              setShowStaticQrModal(true);
            }}
            title="View Static QR"
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <QrCode className="w-4 h-4 text-amber-600" />
          </button>
          <button
            onClick={() => {
              setActiveMerchant(m);
              setFeeLimits({
                feeRatePercent: m.feeRatePercent,
                fixedFee: m.fixedFee,
                dailyVolumeLimit: m.dailyVolumeLimit,
                singleTransactionLimit: m.singleTransactionLimit,
                reason: '',
              });
              setShowFeeLimitModal(true);
            }}
            title="Configure Fees & Limits"
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
          </button>
          <button
            onClick={() => {
              setActiveMerchant(m);
              setKycReview({
                status: m.kycStatus,
                notes: 'Compliance clearance documentation verified.',
              });
              setShowKycModal(true);
            }}
            title="Merchant KYC Review"
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </button>
          {m.status === 'active' ? (
            <button
              onClick={() => handleUpdateStatus(m, 'suspended')}
              title="Suspend Terminal"
              className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
            >
              <Ban className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus(m, 'active')}
              title="Activate Terminal"
              className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
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
            Merchant Registry & Point-of-Sale Terminals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage commercial merchant accounts, EMVCo static/dynamic QR setups, KYC clearance and fee tariffs
          </p>
        </div>
        <Button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Register Merchant</span>
        </Button>
      </div>

      <AdminQrNav />

      {/* Filter Bar */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by merchant name, code, address, contact..."
        filters={[
          {
            label: 'Terminal Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Pending Approval', value: 'pending_approval' },
              { label: 'Suspended', value: 'suspended' },
              { label: 'Terminated', value: 'terminated' },
            ],
          },
          {
            label: 'KYC Status',
            value: kycFilter,
            onChange: setKycFilter,
            options: [
              { label: 'All KYC', value: 'all' },
              { label: 'Verified', value: 'verified' },
              { label: 'Pending Review', value: 'pending_review' },
              { label: 'Rejected', value: 'rejected' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
          setKycFilter('all');
        }}
      />

      {/* Data Table */}
      <AdminDataTable
        columns={columns}
        data={merchants}
        keyExtractor={(m) => m.id}
        isLoading={loading}
        emptyTitle="No merchants found"
        emptyDescription="Try clearing search filters or onboard a new merchant terminal."
      />

      {/* Modal: Static QR Standee Viewer */}
      {activeMerchant && (
        <Modal
          isOpen={showStaticQrModal}
          onClose={() => setShowStaticQrModal(false)}
          title={`Static POS QR • ${activeMerchant.name}`}
          subtitle="Official Royal Bank EMVCo Terminal QR Standee for physical counter checkout"
          maxWidth="md"
        >
          <div className="text-center space-y-4 py-2">
            <div className="inline-block p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-amber-500 rounded-3xl shadow-2xl text-white max-w-xs mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span className="font-serif font-bold tracking-wider text-sm text-amber-300">
                  ROYAL BANK
                </span>
              </div>

              <div className="bg-white p-3 rounded-2xl mb-3 shadow-inner">
                <div className="w-48 h-48 mx-auto flex items-center justify-center text-slate-900">
                  <QrCode className="w-44 h-44 text-slate-950" />
                </div>
              </div>

              <div className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                {activeMerchant.merchantCode}
              </div>
              <div className="text-sm font-semibold text-white mt-1">
                {activeMerchant.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-800 pt-2">
                Scan with Royal Bank App or any EMVCo QR Wallet
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-mono text-left break-all select-all">
              {activeMerchant.qrPayload}
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(activeMerchant.qrPayload);
                  addToast('Static QR Payload copied', 'info');
                }}
              >
                Copy Payload
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  addToast('High-resolution printable standee PDF generated', 'success');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Print Acrylic Standee</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Fee & Limit Configuration */}
      {activeMerchant && (
        <Modal
          isOpen={showFeeLimitModal}
          onClose={() => setShowFeeLimitModal(false)}
          title={`Configure Commercial Terms • ${activeMerchant.name}`}
          subtitle="Adjust Merchant Discount Rate (MDR), fixed fees and daily transaction volume ceilings"
          maxWidth="md"
        >
          <form onSubmit={handleUpdateFees} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  MDR Fee Rate (%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={feeLimits.feeRatePercent}
                  onChange={(e) =>
                    setFeeLimits({ ...feeLimits, feeRatePercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fixed Fee Per Transaction ($)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={feeLimits.fixedFee}
                  onChange={(e) =>
                    setFeeLimits({ ...feeLimits, fixedFee: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Volume Ceiling ($)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={feeLimits.dailyVolumeLimit}
                  onChange={(e) =>
                    setFeeLimits({ ...feeLimits, dailyVolumeLimit: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Single Transaction Max ($)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={feeLimits.singleTransactionLimit}
                  onChange={(e) =>
                    setFeeLimits({ ...feeLimits, singleTransactionLimit: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Audit Justification / Pricing Committee Ref
              </label>
              <textarea
                value={feeLimits.reason}
                onChange={(e) => setFeeLimits({ ...feeLimits, reason: e.target.value })}
                placeholder="Reason for tariff modification..."
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowFeeLimitModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Save Commercial Terms
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Merchant KYC Review */}
      {activeMerchant && (
        <Modal
          isOpen={showKycModal}
          onClose={() => setShowKycModal(false)}
          title={`Merchant KYC Clearance • ${activeMerchant.name}`}
          subtitle="Verify corporate tax certificate, merchant jurisdiction and anti-money laundering checks"
          maxWidth="md"
        >
          <form onSubmit={handleUpdateKyc} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Tax Identification No:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {activeMerchant.taxId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Corporate Payout Account:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {activeMerchant.bankAccount} ({activeMerchant.bankName})
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                KYC Decision
              </label>
              <select
                value={kycReview.status}
                onChange={(e) =>
                  setKycReview({ ...kycReview, status: e.target.value as AdminMerchant['kycStatus'] })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="verified">KYC Cleared & Approved</option>
                <option value="pending_review">Pending Review / Supplementary Info Needed</option>
                <option value="rejected">Rejected / Compliance Decline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Compliance Officer Assessment Notes
              </label>
              <textarea
                value={kycReview.notes}
                onChange={(e) => setKycReview({ ...kycReview, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowKycModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Record KYC Clearance
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Register New Merchant */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Onboard Commercial Merchant Terminal"
        subtitle="Provision EMVCo compliant QR merchant profile with default commercial settlement escrow"
        maxWidth="lg"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Merchant Business Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ritz-Carlton Presidential Suites"
                value={newMerchant.name}
                onChange={(e) => setNewMerchant({ ...newMerchant, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Industry Category
              </label>
              <select
                value={newMerchant.category}
                onChange={(e) => setNewMerchant({ ...newMerchant, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="Fine Dining & Hospitality">Fine Dining & Hospitality</option>
                <option value="Art, Antiquities & Luxury">Art, Antiquities & Luxury</option>
                <option value="Haute Horlogerie & Fashion">Haute Horlogerie & Fashion</option>
                <option value="Private Aviation & Charter">Private Aviation & Charter</option>
                <option value="Medical & Private Health">Medical & Private Health</option>
                <option value="Corporate Legal & Escrow">Corporate Legal & Escrow</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Terminal Location / Address
              </label>
              <input
                type="text"
                placeholder="e.g. 50 Central Park South, New York NY"
                value={newMerchant.terminalLocation}
                onChange={(e) => setNewMerchant({ ...newMerchant, terminalLocation: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Tax ID / EIN
              </label>
              <input
                type="text"
                placeholder="e.g. US-13-9021948"
                value={newMerchant.taxId}
                onChange={(e) => setNewMerchant({ ...newMerchant, taxId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Authorized Signatory
              </label>
              <input
                type="text"
                placeholder="e.g. Arthur Pendelton"
                value={newMerchant.contactPerson}
                onChange={(e) => setNewMerchant({ ...newMerchant, contactPerson: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                placeholder="finance@merchant.com"
                value={newMerchant.email}
                onChange={(e) => setNewMerchant({ ...newMerchant, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 (212) 555-0199"
                value={newMerchant.phone}
                onChange={(e) => setNewMerchant({ ...newMerchant, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Fee Rate MDR (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={newMerchant.feeRatePercent}
                onChange={(e) =>
                  setNewMerchant({ ...newMerchant, feeRatePercent: parseFloat(e.target.value) || 1.25 })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Clearing Limit ($)
              </label>
              <input
                type="number"
                step="10000"
                value={newMerchant.dailyVolumeLimit}
                onChange={(e) =>
                  setNewMerchant({ ...newMerchant, dailyVolumeLimit: parseFloat(e.target.value) || 100000 })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowRegisterModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
              Provision Terminal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
