import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  adminAccountService,
  adminCustomerService,
  Account,
  AccountType,
  AccountStatus,
  AccountListResult,
  Customer,
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
  Landmark,
  Eye,
  Plus,
  Snowflake,
  CheckCircle2,
  SlidersHorizontal,
  XCircle,
  RotateCcw,
  Building2,
  Clock,
  ArrowRightLeft,
  DollarSign,
} from 'lucide-react';

export const AdminAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const permissions = useAdminPermissions();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AccountListResult>({
    accounts: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'openedAt' | 'name' | 'balance' | 'accountNumber'>('openedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Modal States
  const [actionModal, setActionModal] = useState<{
    type: AdminActionType;
    account: Account;
  } | null>(null);

  // Create Account Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [createFormData, setCreateFormData] = useState({
    customerId: '',
    type: 'checking' as AccountType,
    currency: 'USD' as 'USD' | 'EUR' | 'GBP' | 'CHF',
    name: 'Sovereign Premier Checking',
    customNickName: 'Operating Reserve',
    initialDeposit: 50000,
    branch: 'Zurich Private Wealth Office',
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Change Status Direct Modal State
  const [statusChangeAccount, setStatusChangeAccount] = useState<Account | null>(null);
  const [newStatus, setNewStatus] = useState<AccountStatus>('active');
  const [statusReason, setStatusReason] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await adminAccountService.getAccounts({
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
        currency: currencyFilter,
        branch: branchFilter,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      });
      setData(res);
    } catch (err: any) {
      addToast(err?.message || 'Failed to fetch accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [searchQuery, statusFilter, typeFilter, currencyFilter, branchFilter, sortBy, sortOrder, page]);

  // Load customer list when create modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      adminCustomerService.getCustomers({ limit: 100 }).then((res) => {
        setCustomersList(res.customers);
        if (res.customers.length > 0 && !createFormData.customerId) {
          setCreateFormData((prev) => ({ ...prev, customerId: res.customers[0].id }));
        }
      });
    }
  }, [isCreateModalOpen]);

  const handleActionConfirm = async (payload: { reason: string; extra?: any }) => {
    if (!actionModal) return;
    const { type, account } = actionModal;

    try {
      if (type === 'freeze_account') {
        await adminAccountService.freezeAccount(account.id, payload.reason);
        addToast(`Account ledger ${account.accountNumber} frozen.`, 'warning');
      } else if (type === 'unfreeze_account') {
        await adminAccountService.unfreezeAccount(account.id, payload.reason);
        addToast(`Account ledger ${account.accountNumber} unfrozen.`, 'success');
      } else if (type === 'close_account') {
        await adminAccountService.closeAccount(account.id, payload.reason);
        addToast(`Account ledger ${account.accountNumber} permanently closed.`, 'warning');
      } else if (type === 'change_limits') {
        await adminAccountService.changeLimits(account.id, payload.extra);
        addToast(`Limits for account ${account.accountNumber} updated.`, 'success');
      }
      fetchAccounts();
    } catch (err: any) {
      addToast(err?.message || 'Action failed', 'error');
    }
  };

  const handleApproveAccount = async (account: Account) => {
    try {
      await adminAccountService.approveAccount(account.id);
      addToast(`Account ${account.accountNumber} approved and cleared for operations.`, 'success');
      fetchAccounts();
    } catch (err: any) {
      addToast(err?.message || 'Failed to approve account', 'error');
    }
  };

  const handleReactivateAccount = async (account: Account) => {
    try {
      await adminAccountService.reactivateAccount(account.id, 'Administrative reinstatement');
      addToast(`Account ${account.accountNumber} reactivated.`, 'success');
      fetchAccounts();
    } catch (err: any) {
      addToast(err?.message || 'Failed to reactivate account', 'error');
    }
  };

  const handleSaveStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusChangeAccount) return;
    try {
      await adminAccountService.changeAccountStatus(
        statusChangeAccount.id,
        newStatus,
        statusReason || 'Administrative status shift'
      );
      addToast(`Status changed to ${newStatus}`, 'success');
      setStatusChangeAccount(null);
      fetchAccounts();
    } catch (err: any) {
      addToast(err?.message || 'Failed to update status', 'error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.customerId) {
      addToast('Please select a target customer', 'error');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const created = await adminAccountService.createAccount({
        customerId: createFormData.customerId,
        type: createFormData.type,
        currency: createFormData.currency,
        name: createFormData.name,
        customNickName: createFormData.customNickName,
        initialDeposit: Number(createFormData.initialDeposit),
        branch: createFormData.branch,
      });

      addToast(`Ledger account ${created.accountNumber} provisioned successfully!`, 'success');
      setIsCreateModalOpen(false);
      fetchAccounts();
    } catch (err: any) {
      addToast(err?.message || 'Failed to create ledger account', 'error');
    } finally {
      setIsSubmittingCreate(false);
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
        { label: 'Frozen', value: 'frozen' },
        { label: 'Restricted', value: 'restricted' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      id: 'type',
      label: 'Type',
      currentValue: typeFilter,
      onChange: (val) => {
        setTypeFilter(val);
        setPage(1);
      },
      options: [
        { label: 'All Types', value: 'all' },
        { label: 'Checking', value: 'checking' },
        { label: 'Savings', value: 'savings' },
        { label: 'Investment', value: 'investment' },
        { label: 'Corporate', value: 'corporate' },
      ],
    },
    {
      id: 'currency',
      label: 'Currency',
      currentValue: currencyFilter,
      onChange: (val) => {
        setCurrencyFilter(val);
        setPage(1);
      },
      options: [
        { label: 'All Currencies', value: 'all' },
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'GBP (£)', value: 'GBP' },
        { label: 'CHF (Fr)', value: 'CHF' },
      ],
    },
    {
      id: 'branch',
      label: 'Branch',
      currentValue: branchFilter,
      onChange: (val) => {
        setBranchFilter(val);
        setPage(1);
      },
      options: [
        { label: 'All Branches', value: 'all' },
        { label: 'Zurich Office', value: 'Zurich Private Wealth Office' },
        { label: 'London Mayfair', value: 'London Mayfair Branch' },
        { label: 'New York Wall St', value: 'New York Wall St Headquarters' },
        { label: 'Singapore Marina', value: 'Singapore Marina Bay Financial Centre' },
      ],
    },
  ];

  const columns: ColumnDef<any>[] = [
    // Column 1: Account
    {
      key: 'name',
      header: 'Account / Number',
      sortable: true,
      render: (row) => (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/accounts/${row.id}`);
            }}
            className="font-semibold text-slate-900 dark:text-white hover:text-amber-600 block text-left"
          >
            {row.name}
          </button>
          <span className="font-mono text-xs text-slate-400">{row.accountNumber}</span>
        </div>
      ),
    },
    // Column 2: Customer
    {
      key: 'customerName',
      header: 'Customer / Holder',
      render: (row) => (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/customers/${row.customerId}`);
            }}
            className="font-medium text-slate-800 dark:text-slate-200 hover:text-royal-600 dark:hover:text-amber-400 block text-left"
          >
            {row.customerName}
          </button>
          <span className="text-[11px] text-slate-400">{row.customerEmail || 'Verified'}</span>
        </div>
      ),
    },
    // Column 3: Type
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
          {row.type}
        </span>
      ),
    },
    // Column 4: Balance
    {
      key: 'balance',
      header: 'Balance',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {formatCurrency(row.balance, row.currency)}
        </span>
      ),
    },
    // Column 5: Status
    {
      key: 'status',
      header: 'Status',
      render: (row) => <AdminBadge type="account_status" value={row.status} />,
    },
    // Column 6: Branch
    {
      key: 'branch',
      header: 'Branch',
      render: (row) => (
        <span className="text-xs text-slate-500 max-w-xs truncate block">{row.branch}</span>
      ),
    },
    // Column 7: Opened Date
    {
      key: 'openedAt',
      header: 'Opened Date',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">{formatDate(row.openedAt)}</span>
      ),
    },
    // Column 8: Actions
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const isFrozen = row.status === 'frozen';
        const isClosed = row.status === 'closed';

        return (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* View */}
            <button
              onClick={() => navigate(`/admin/accounts/${row.id}`)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-royal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Inspect Ledger"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Approve (if pending/restricted) */}
            {row.status !== 'active' && permissions.canApproveAccount && (
              <button
                onClick={() => handleApproveAccount(row)}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                title="Approve Ledger"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}

            {/* Freeze / Unfreeze */}
            {permissions.canFreezeAccount && !isClosed && (
              <button
                onClick={() =>
                  setActionModal({
                    type: isFrozen ? 'unfreeze_account' : 'freeze_account',
                    account: row,
                  })
                }
                className={`p-1.5 rounded-lg transition-colors ${
                  isFrozen
                    ? 'text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40'
                    : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
                title={isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
              >
                {isFrozen ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Snowflake className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Reactivate if closed */}
            {isClosed && permissions.canChangeAccountStatus && (
              <button
                onClick={() => handleReactivateAccount(row)}
                className="p-1.5 rounded-lg text-royal-600 hover:bg-royal-50 dark:hover:bg-royal-950/40 transition-colors"
                title="Reactivate Account"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Change Limits */}
            {permissions.canChangeAccountLimits && (
              <button
                onClick={() =>
                  setActionModal({
                    type: 'change_limits',
                    account: row,
                  })
                }
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Configure Limits"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}

            {/* Change Status */}
            {permissions.canChangeAccountStatus && (
              <button
                onClick={() => {
                  setStatusChangeAccount(row);
                  setNewStatus(row.status);
                  setStatusReason('');
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
                title="Change Account Status"
              >
                Status
              </button>
            )}

            {/* Close Account */}
            {permissions.canCloseAccount && !isClosed && (
              <button
                onClick={() =>
                  setActionModal({
                    type: 'close_account',
                    account: row,
                  })
                }
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Close Account"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
              Core Banking General Ledger
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Asset Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Accounts & Custody Ledgers
          </h1>
        </div>

        {permissions.canCreateAccount && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Provision New Ledger
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <AdminFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        searchPlaceholder="Search accounts by number, title, holder, IBAN..."
        filters={filters}
        totalResults={data.total}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('all');
          setTypeFilter('all');
          setCurrencyFilter('all');
          setBranchFilter('all');
          setPage(1);
        }}
        onRefresh={fetchAccounts}
      />

      {/* Accounts Table */}
      <AdminDataTable
        columns={columns}
        data={data.accounts}
        loading={loading}
        page={data.page}
        totalPages={data.totalPages}
        totalRecords={data.total}
        pageSize={data.limit}
        onPageChange={(p) => setPage(p)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(key) => {
          if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(key as any);
            setSortOrder('desc');
          }
        }}
        onRowClick={(row) => navigate(`/admin/accounts/${row.id}`)}
        rowKey={(row) => row.id}
      />

      {/* Action Modal (Freeze, Unfreeze, Close, Change Limits) */}
      {actionModal && (
        <AdminActionModal
          isOpen={true}
          onClose={() => setActionModal(null)}
          actionType={actionModal.type}
          targetId={actionModal.account.id}
          targetName={`${actionModal.account.name} (${actionModal.account.accountNumber})`}
          onConfirm={handleActionConfirm}
        />
      )}

      {/* Change Status Modal */}
      {statusChangeAccount && (
        <Modal
          isOpen={true}
          onClose={() => setStatusChangeAccount(null)}
          title={`Alter Ledger Status: ${statusChangeAccount.accountNumber}`}
          size="sm"
        >
          <form onSubmit={handleSaveStatusChange} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Ledger Status
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
                Reason & Audit Trail Justification
              </label>
              <textarea
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Supervisory justification..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusChangeAccount(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit Status Change
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Provision New Account Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
          title="Provision New Custody Ledger"
          size="md"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Beneficiary Customer
              </label>
              <select
                value={createFormData.customerId}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, customerId: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              >
                {customersList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.customerNumber} - {c.tier})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ledger Type
                </label>
                <select
                  value={createFormData.type}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, type: e.target.value as AccountType })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="checking">Premier Checking</option>
                  <option value="savings">High-Yield Savings</option>
                  <option value="investment">Wealth Management Custody</option>
                  <option value="corporate">Commercial Corporate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Denominated Currency
                </label>
                <select
                  value={createFormData.currency}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, currency: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="USD">USD - United States Dollar</option>
                  <option value="EUR">EUR - Euro Sovereign</option>
                  <option value="GBP">GBP - British Pound Sterling</option>
                  <option value="CHF">CHF - Swiss Franc Reserve</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account Ledger Title
              </label>
              <input
                type="text"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Initial Vault Opening Deposit
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={createFormData.initialDeposit}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      initialDeposit: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Booking Branch
                </label>
                <select
                  value={createFormData.branch}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, branch: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Zurich Private Wealth Office">Zurich Private Wealth Office</option>
                  <option value="London Mayfair Branch">London Mayfair Branch</option>
                  <option value="New York Wall St Headquarters">New York Wall St Headquarters</option>
                  <option value="Singapore Marina Bay Financial Centre">
                    Singapore Marina Bay Financial Centre
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmittingCreate}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmittingCreate}>
                {isSubmittingCreate ? 'Provisioning...' : 'Provision Ledger'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
