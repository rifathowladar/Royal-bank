import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { billService } from '../../../backend/services/billService.ts';
import { accountService } from '../../../backend/services/accountService.ts';
import {
  SavedBiller,
  Biller,
  Account,
} from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  BookmarkCheck,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Bell,
  ArrowLeft,
  ArrowRight,
  Receipt,
  Search,
} from 'lucide-react';

export const SavedBillersPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [savedBillers, setSavedBillers] = useState<SavedBiller[]>([]);
  const [billers, setBillers] = useState<Biller[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Biller Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedBillerId, setSelectedBillerId] = useState('');
  const [newCustomerRef, setNewCustomerRef] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [enableAutoPay, setEnableAutoPay] = useState(false);
  const [autoPayAccId, setAutoPayAccId] = useState('');

  // Edit / Delete Modals
  const [editingBiller, setEditingBiller] = useState<SavedBiller | null>(null);
  const [deleteConfirmBiller, setDeleteConfirmBiller] = useState<SavedBiller | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const sb = await billService.getSavedBillers(user?.id);
      setSavedBillers(sb);

      const b = await billService.getBillers();
      setBillers(b);
      if (b.length > 0) setSelectedBillerId(b[0].id);

      const accs = await accountService.getAccounts(user?.id);
      setAccounts(accs);
      if (accs.length > 0) setAutoPayAccId(accs[0].id);
    } catch (err: any) {
      toastError(err.message || 'Failed to load saved billers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleAutoPay = async (sb: SavedBiller) => {
    try {
      const updated = await billService.toggleAutoPay(sb.id, !sb.autoPayEnabled, accounts[0]?.id);
      setSavedBillers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      success(`Auto-Pay ${updated.autoPayEnabled ? 'enabled' : 'disabled'} for ${updated.nickName}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update Auto-Pay');
    }
  };

  const handleToggleReminder = async (sb: SavedBiller) => {
    try {
      const updated = await billService.toggleReminder(sb.id, !sb.reminderEnabled);
      setSavedBillers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      success(`Payment reminder ${updated.reminderEnabled ? 'activated' : 'deactivated'}.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update reminder');
    }
  };

  const handleAddBiller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillerId || !newCustomerRef.trim() || !newNickname.trim()) {
      toastError('Please fill in all required fields');
      return;
    }

    try {
      await billService.saveBiller({
        customerId: user?.id || 'cust-001',
        billerId: selectedBillerId,
        customerNumber: newCustomerRef.trim(),
        nickName: newNickname.trim(),
        autoPayEnabled: enableAutoPay,
        autoPayAccountId: enableAutoPay ? autoPayAccId : undefined,
        reminderEnabled: true,
      });

      success(`Added "${newNickname}" to saved billers.`);
      setAddModalOpen(false);
      setNewCustomerRef('');
      setNewNickname('');
      setEnableAutoPay(false);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to save biller');
    }
  };

  const handleDeleteBiller = async () => {
    if (!deleteConfirmBiller) return;
    try {
      await billService.deleteSavedBiller(deleteConfirmBiller.id);
      success(`Removed "${deleteConfirmBiller.nickName}".`);
      setDeleteConfirmBiller(null);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete biller');
    }
  };

  const handleUpdateBiller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBiller) return;
    try {
      await billService.updateSavedBiller(editingBiller.id, {
        nickName: editingBiller.nickName,
        autoPayEnabled: editingBiller.autoPayEnabled,
        reminderEnabled: editingBiller.reminderEnabled,
      });
      success('Biller settings updated.');
      setEditingBiller(null);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to update');
    }
  };

  const filteredBillers = savedBillers.filter(
    (sb) =>
      sb.nickName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sb.billerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sb.accountReference.includes(searchQuery)
  );

  if (loading && savedBillers.length === 0) {
    return <LoadingState message="Loading saved biller registry..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bank/bills')}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookmarkCheck className="w-6 h-6 text-royal-600 dark:text-gold-400" />
              Saved Billers & Auto-Pay Management
            </h1>
            <p className="text-xs text-slate-500">
              Manage saved utility accounts, configure automatic direct debits, and set due-date alerts.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Biller
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search saved billers by nickname, organization, or ref..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Grid of Saved Billers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBillers.map((sb) => (
          <Card
            key={sb.id}
            className="p-5 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {sb.category}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingBiller(sb)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Edit Biller"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmBiller(sb)}
                    className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    title="Delete Biller"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {sb.nickName}
              </h3>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {sb.billerName} · Ref: {sb.accountReference}
              </div>

              {/* Toggles */}
              <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Auto-Pay (Direct Debit)
                  </span>
                  <button
                    onClick={() => handleToggleAutoPay(sb)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      sb.autoPayEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                        sb.autoPayEnabled ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Bell className="w-3.5 h-3.5 text-amber-500" /> Due Date Alerts
                  </span>
                  <button
                    onClick={() => handleToggleReminder(sb)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      sb.reminderEnabled ? 'bg-royal-600 dark:bg-gold-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                        sb.reminderEnabled ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {sb.lastPaidDate ? `Last paid on ${formatDate(sb.lastPaidDate)}` : 'No payments yet'}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/bank/bills/pay?biller=${sb.billerId}&ref=${sb.accountReference}`)}
                className="text-xs flex items-center gap-1"
              >
                Pay Bill <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Biller Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Saved Biller">
        <form onSubmit={handleAddBiller} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Select Biller Organization
            </label>
            <select
              value={selectedBillerId}
              onChange={(e) => setSelectedBillerId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            >
              {billers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.category})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Customer / Account / Meter Number"
            value={newCustomerRef}
            onChange={(e) => setNewCustomerRef(e.target.value)}
            placeholder="e.g. 984029482"
            required
          />

          <Input
            label="Friendly Nickname"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            placeholder="e.g. Penthouse Electricity, Mountain Lodge Gas"
            required
          />

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Enable Auto-Pay (Direct Debit)
              </span>
              <input
                type="checkbox"
                checked={enableAutoPay}
                onChange={(e) => setEnableAutoPay(e.target.checked)}
                className="w-4 h-4 text-royal-600 rounded cursor-pointer"
              />
            </div>

            {enableAutoPay && (
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Debit From Account</label>
                <select
                  value={autoPayAccId}
                  onChange={(e) => setAutoPayAccId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.accountNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Biller
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Biller Modal */}
      {editingBiller && (
        <Modal
          isOpen={!!editingBiller}
          onClose={() => setEditingBiller(null)}
          title="Edit Saved Biller"
        >
          <form onSubmit={handleUpdateBiller} className="space-y-4">
            <Input
              label="Biller Nickname"
              value={editingBiller.nickName}
              onChange={(e) => setEditingBiller({ ...editingBiller, nickName: e.target.value })}
              required
            />

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <span>Enable Auto-Pay</span>
              <input
                type="checkbox"
                checked={editingBiller.autoPayEnabled}
                onChange={(e) =>
                  setEditingBiller({ ...editingBiller, autoPayEnabled: e.target.checked })
                }
                className="w-4 h-4 text-royal-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <span>Enable Payment Due Alerts</span>
              <input
                type="checkbox"
                checked={editingBiller.reminderEnabled}
                onChange={(e) =>
                  setEditingBiller({ ...editingBiller, reminderEnabled: e.target.checked })
                }
                className="w-4 h-4 text-royal-600 rounded"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" type="button" onClick={() => setEditingBiller(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBiller && (
        <Modal
          isOpen={!!deleteConfirmBiller}
          onClose={() => setDeleteConfirmBiller(null)}
          title="Remove Saved Biller"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to remove <strong>"{deleteConfirmBiller.nickName}"</strong> from your saved billers?
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" type="button" onClick={() => setDeleteConfirmBiller(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteBiller}>
                Remove Biller
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
