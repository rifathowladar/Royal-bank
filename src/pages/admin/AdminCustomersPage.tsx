import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  adminCustomerService,
  Customer,
  CustomerListResult,
} from '../../backend/index.ts';
import {
  AdminDataTable,
  ColumnDef,
  AdminBadge,
  AdminFilterBar,
  FilterConfig,
  AdminActionModal,
  AdminActionType,
} from '../../components/admin/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';
import { useAdminPermissions, useToast } from '../../hooks/index.ts';
import {
  Users,
  Eye,
  Edit,
  Snowflake,
  CheckCircle2,
  KeyRound,
  Landmark,
  ArrowRightLeft,
  FileCheck,
  MoreVertical,
  ShieldAlert,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const permissions = useAdminPermissions();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerListResult>({
    customers: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [kycFilter, setKycFilter] = useState(searchParams.get('kyc') || 'all');
  const [riskFilter, setRiskFilter] = useState(searchParams.get('risk') || 'all');
  const [tierFilter, setTierFilter] = useState(searchParams.get('tier') || 'all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'balance' | 'customerNumber'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Modal States
  const [activeModal, setActiveModal] = useState<{
    type: AdminActionType;
    customer: Customer;
  } | null>(null);

  // Edit Customer Modal State
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    tier: 'Premier',
    riskScore: 'Low',
    status: 'active',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Temporary password reset result modal
  const [tempPasswordResult, setTempPasswordResult] = useState<{
    password: string;
    customerName: string;
  } | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminCustomerService.getCustomers({
        search: searchQuery,
        status: statusFilter,
        kycStatus: kycFilter,
        riskScore: riskFilter,
        tier: tierFilter,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      });
      setData(res);
    } catch (err: any) {
      addToast(err?.message || 'Failed to fetch customer records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, statusFilter, kycFilter, riskFilter, tierFilter, sortBy, sortOrder, page]);

  const handleSortChange = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key as any);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setKycFilter('all');
    setRiskFilter('all');
    setTierFilter('all');
    setPage(1);
  };

  const handleActionConfirm = async (payload: { reason: string; extra?: any }) => {
    if (!activeModal) return;
    const { type, customer } = activeModal;

    try {
      if (type === 'freeze_customer') {
        await adminCustomerService.freezeCustomer(customer.id, payload.reason);
        addToast(`Customer ${customer.firstName} ${customer.lastName} has been frozen.`, 'warning');
      } else if (type === 'unfreeze_customer') {
        await adminCustomerService.unfreezeCustomer(customer.id, payload.reason);
        addToast(`Customer ${customer.firstName} ${customer.lastName} has been unfrozen.`, 'success');
      } else if (type === 'reset_password') {
        const res = await adminCustomerService.resetPassword(customer.id);
        setTempPasswordResult({
          password: res.temporaryPassword,
          customerName: `${customer.firstName} ${customer.lastName}`,
        });
        addToast(`Password reset token issued for ${customer.firstName}.`, 'info');
      }
      fetchCustomers();
    } catch (err: any) {
      addToast(err?.message || 'Action failed', 'error');
    }
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      tier: customer.tier,
      riskScore: customer.riskScore,
      status: customer.status,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSavingEdit(true);

    try {
      await adminCustomerService.updateCustomer(editingCustomer.id, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phone: editFormData.phone,
        tier: editFormData.tier as any,
        riskScore: editFormData.riskScore as any,
        status: editFormData.status as any,
      });
      addToast('Customer record updated successfully', 'success');
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      addToast(err?.message || 'Failed to update customer', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filters: FilterConfig[] = [
    {
      id: 'status',
      label: 'Status',
      currentValue: statusFilter,
      onChange: (val) => {
        setStatusFilter(val);
        setPage(1);
      },
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended / Frozen', value: 'suspended' },
        { label: 'Pending Verification', value: 'pending_verification' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      id: 'kyc',
      label: 'KYC',
      currentValue: kycFilter,
      onChange: (val) => {
        setKycFilter(val);
        setPage(1);
      },
      options: [
        { label: 'All KYC', value: 'all' },
        { label: 'Verified', value: 'verified' },
        { label: 'Pending Review', value: 'pending' },
        { label: 'Action Required', value: 'requires_update' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      id: 'risk',
      label: 'Risk',
      currentValue: riskFilter,
      onChange: (val) => {
        setRiskFilter(val);
        setPage(1);
      },
      options: [
        { label: 'All Risk', value: 'all' },
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
      ],
    },
    {
      id: 'tier',
      label: 'Tier',
      currentValue: tierFilter,
      onChange: (val) => {
        setTierFilter(val);
        setPage(1);
      },
      options: [
        { label: 'All Tiers', value: 'all' },
        { label: 'Standard', value: 'Standard' },
        { label: 'Premier', value: 'Premier' },
        { label: 'Private Client', value: 'Private Client' },
        { label: 'Royal Sovereign', value: 'Royal Sovereign' },
      ],
    },
  ];

  const columns: ColumnDef<any>[] = [
    // Column 1: Customer
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 dark:bg-royal-800 dark:text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-slate-100 dark:ring-slate-800">
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div className="min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/customers/${row.id}`);
              }}
              className="font-semibold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 truncate block text-left"
            >
              {row.firstName} {row.lastName}
            </button>
            <p className="text-[11px] text-slate-400 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    // Column 2: Customer ID
    {
      key: 'customerNumber',
      header: 'Customer ID',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.customerNumber}
        </span>
      ),
    },
    // Column 3: Account
    {
      key: 'account',
      header: 'Account',
      render: (row) => (
        <div>
          <span className="font-mono text-xs text-slate-800 dark:text-slate-200 block">
            {row.primaryAccount}
          </span>
          <span className="text-[10px] text-slate-400">
            {row.totalAccounts} ledger{row.totalAccounts !== 1 ? 's' : ''} ({formatCurrency(row.totalBalanceUSD, 'USD')})
          </span>
        </div>
      ),
    },
    // Column 4: Status
    {
      key: 'status',
      header: 'Status',
      render: (row) => <AdminBadge type="customer_status" value={row.status} />,
    },
    // Column 5: KYC
    {
      key: 'kycStatus',
      header: 'KYC',
      render: (row) => <AdminBadge type="kyc_status" value={row.kycStatus} />,
    },
    // Column 6: Risk
    {
      key: 'riskScore',
      header: 'Risk',
      render: (row) => <AdminBadge type="risk_score" value={row.riskScore} />,
    },
    // Column 7: Created Date
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
    // Column 8: Actions
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const isFrozen = row.status === 'suspended' || row.status === 'closed';

        return (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* View */}
            <button
              onClick={() => navigate(`/admin/customers/${row.id}`)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-royal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Customer Dossier"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Edit */}
            {permissions.canEditCustomer && (
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit Customer"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            {/* Freeze / Unfreeze */}
            {permissions.canFreezeCustomer && (
              <button
                onClick={() =>
                  setActiveModal({
                    type: isFrozen ? 'unfreeze_customer' : 'freeze_customer',
                    customer: row,
                  })
                }
                className={`p-1.5 rounded-lg transition-colors ${
                  isFrozen
                    ? 'text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40'
                    : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
                title={isFrozen ? 'Unfreeze Customer' : 'Freeze Customer'}
              >
                {isFrozen ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Snowflake className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Reset Password */}
            {permissions.canResetPassword && (
              <button
                onClick={() =>
                  setActiveModal({
                    type: 'reset_password',
                    customer: row,
                  })
                }
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reset Password"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}

            {/* View Accounts */}
            <button
              onClick={() => navigate(`/admin/accounts?search=${row.customerNumber}`)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-royal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Customer Accounts"
            >
              <Landmark className="w-4 h-4" />
            </button>

            {/* View Transactions */}
            <button
              onClick={() => navigate(`/admin/transactions?search=${row.customerNumber}`)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Customer Transactions"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            {/* View KYC */}
            <button
              onClick={() => navigate(`/admin/customers/${row.id}?tab=kyc`)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View KYC Dossier"
            >
              <FileCheck className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
              Central Dossier Registry
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Supervisory RBAC Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Customer Directory & Asset Registry
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => adminCustomerService.getCustomers({}).then((res) => {
              // Export CSV helper
              const csv =
                'CustomerNumber,Name,Email,Status,KYC,Risk,Balance\n' +
                res.customers
                  .map(
                    (c) =>
                      `"${c.customerNumber}","${c.firstName} ${c.lastName}","${c.email}","${c.status}","${c.kycStatus}","${c.riskScore}",${c.totalBalanceUSD}`
                  )
                  .join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `royal-bank-customers-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
            })}
          >
            Export Directory (CSV)
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <AdminFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        searchPlaceholder="Search customer by name, email, RB ID, or phone..."
        filters={filters}
        totalResults={data.total}
        onReset={handleResetFilters}
        onRefresh={fetchCustomers}
      />

      {/* Customer Registry Table */}
      <AdminDataTable
        columns={columns}
        data={data.customers}
        loading={loading}
        page={data.page}
        totalPages={data.totalPages}
        totalRecords={data.total}
        pageSize={data.limit}
        onPageChange={(p) => setPage(p)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onRowClick={(row) => navigate(`/admin/customers/${row.id}`)}
        rowKey={(row) => row.id}
      />

      {/* Action Modal (Freeze, Unfreeze, Reset Password) */}
      {activeModal && (
        <AdminActionModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          actionType={activeModal.type}
          targetId={activeModal.customer.id}
          targetName={`${activeModal.customer.firstName} ${activeModal.customer.lastName} (${activeModal.customer.customerNumber})`}
          onConfirm={handleActionConfirm}
        />
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCustomer(null)}
          title={`Edit Customer: ${editingCustomer.customerNumber}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Verified Phone Number
              </label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Private Tier
                </label>
                <select
                  value={editFormData.tier}
                  onChange={(e) => setEditFormData({ ...editFormData, tier: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Standard">Standard</option>
                  <option value="Premier">Premier</option>
                  <option value="Private Client">Private Client</option>
                  <option value="Royal Sovereign">Royal Sovereign</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Risk Rating
                </label>
                <select
                  value={editFormData.riskScore}
                  onChange={(e) => setEditFormData({ ...editFormData, riskScore: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Account Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended / Frozen</option>
                  <option value="pending_verification">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingCustomer(null)}
                disabled={isSavingEdit}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSavingEdit}>
                {isSavingEdit ? 'Saving...' : 'Save Dossier Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Temporary Password Result Modal */}
      {tempPasswordResult && (
        <Modal
          isOpen={true}
          onClose={() => setTempPasswordResult(null)}
          title="Temporary Access Token Generated"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              A temporary high-security credential has been provisioned for{' '}
              <strong>{tempPasswordResult.customerName}</strong>. This must be changed on initial login.
            </p>

            <div className="p-4 bg-slate-900 text-amber-400 font-mono text-center rounded-xl font-bold tracking-widest text-lg select-all border border-amber-500/30">
              {tempPasswordResult.password}
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded-xl">
              Dispatched simultaneously via end-to-end encrypted notification to the verified contact phone and email on record.
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => setTempPasswordResult(null)}
            >
              Acknowledge & Dismiss
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
