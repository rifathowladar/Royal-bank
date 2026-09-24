import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminCardNav } from '../../../components/admin/AdminCardNav.tsx';
import { AdminStatCard } from '../../../components/admin/AdminStatCard.tsx';
import { AdminDataTable, Column } from '../../../components/admin/AdminDataTable.tsx';
import { AdminFilterBar } from '../../../components/admin/AdminFilterBar.tsx';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency } from '../../../utils/formatters.ts';
import {
  adminCardService,
  AdminCardItem,
} from '../../../backend/services/adminCardService.ts';
import {
  CreditCard,
  PlusCircle,
  Snowflake,
  Ban,
  RefreshCw,
  Sliders,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Eye,
  Key,
  Shield,
} from 'lucide-react';

export const AdminCardsDashboardPage: React.FC = () => {
  const [cards, setCards] = useState<AdminCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [activeCard, setActiveCard] = useState<AdminCardItem | null>(null);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Form states
  const [limitsForm, setLimitsForm] = useState({
    dailyLimit: 25000,
    atmDailyLimit: 5000,
    onlineLimit: 25000,
    reason: '',
  });

  const [replaceReason, setReplaceReason] = useState('Physical chip demagnetization / wear');
  const [blockReason, setBlockReason] = useState('Suspicious fraudulent telemetry reported by cardholder');

  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadCards = async () => {
    setLoading(true);
    try {
      const data = await adminCardService.getCards({
        search,
        status: statusFilter,
        type: typeFilter,
      });
      setCards(data);
    } catch {
      addToast('Error loading cards fleet', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [search, statusFilter, typeFilter]);

  const activeCount = cards.filter((c) => c.status === 'active').length;
  const frozenCount = cards.filter((c) => c.status === 'frozen').length;
  const blockedCount = cards.filter((c) => c.status === 'blocked').length;

  const handleToggleFreeze = async (card: AdminCardItem) => {
    const isFrozen = card.status === 'frozen';
    try {
      if (isFrozen) {
        await adminCardService.unfreezeCard(card.id, 'Administrative unfreeze authorized');
        addToast(`Card ${card.cardNumberMasked} unfrozen`, 'success');
      } else {
        await adminCardService.freezeCard(card.id, 'Administrative temporary freeze applied');
        addToast(`Card ${card.cardNumberMasked} temporarily frozen`, 'warning');
      }
      loadCards();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      addToast(msg, 'error');
    }
  };

  const handleBlockConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard) return;
    try {
      await adminCardService.blockCard(activeCard.id, blockReason);
      addToast(`Card ${activeCard.cardNumberMasked} hotlisted and blocked`, 'error');
      setShowBlockModal(false);
      loadCards();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Block action failed';
      addToast(msg, 'error');
    }
  };

  const handleReplaceConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard) return;
    try {
      const result = await adminCardService.replaceCard(activeCard.id, replaceReason);
      addToast(
        `Replacement card issued: ${result.newCard ? result.newCard.cardNumberMasked : result.cardNumberMasked}. Previous card hotlisted.`,
        'success'
      );
      setShowReplaceModal(false);
      loadCards();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Replacement failed';
      addToast(msg, 'error');
    }
  };

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard) return;
    try {
      await adminCardService.updateLimits(
        activeCard.id,
        {
          dailyLimit: limitsForm.dailyLimit,
          atmDailyLimit: limitsForm.atmDailyLimit,
          onlineLimit: limitsForm.onlineLimit,
        },
        limitsForm.reason || 'Client discretionary limit adjustment'
      );
      addToast('Spending limits updated on Visa/Mastercard clearing network', 'success');
      setShowLimitsModal(false);
      loadCards();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update limits';
      addToast(msg, 'error');
    }
  };

  const columns: Column<AdminCardItem>[] = [
    {
      header: 'Card Instrument',
      accessor: (c) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-7 rounded-md flex items-center justify-center text-[10px] font-bold tracking-wider text-white shadow-sm ${
              c.colorScheme === 'black_titanium'
                ? 'bg-slate-950 border border-amber-500/40'
                : c.colorScheme === 'midnight_blue'
                ? 'bg-blue-950'
                : 'bg-amber-600'
            }`}
          >
            {c.network.toUpperCase()}
          </div>
          <div>
            <div className="font-mono font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{c.cardNumberMasked}</span>
              {c.cardLabel?.toLowerCase().includes('virtual') && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Virtual
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 capitalize">
              {c.network} • {c.type} Card
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Cardholder',
      accessor: (c) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-white">
            {c.cardholderName}
          </div>
          <div className="text-slate-500 font-mono mt-0.5">
            Exp: {c.expiryMonth}/{c.expiryYear}
          </div>
        </div>
      ),
    },
    {
      header: 'Card Status',
      accessor: (c) => <AdminBadge type="card_status" value={c.status} />,
    },
    {
      header: 'Spending Controls',
      accessor: (c) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-slate-800 dark:text-slate-200">
            Monthly: {formatCurrency(c.spendingLimitMonthly, 'USD')}
          </div>
          <div className="text-slate-500">
            ATM Daily: {formatCurrency(c.dailyAtmLimit ?? 5000, 'USD')}
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleToggleFreeze(c)}
            title={c.status === 'frozen' ? 'Unfreeze Card' : 'Freeze Card'}
            className={`p-1.5 rounded transition-colors ${
              c.status === 'frozen'
                ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Snowflake className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveCard(c);
              setLimitsForm({
                dailyLimit: c.dailyPosLimit ?? 25000,
                atmDailyLimit: c.dailyAtmLimit ?? 5000,
                onlineLimit: c.dailyOnlineLimit ?? 25000,
                reason: '',
              });
              setShowLimitsModal(true);
            }}
            title="Adjust Spending Limits"
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveCard(c);
              setShowReplaceModal(true);
            }}
            title="Issue Replacement Card"
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {c.status !== 'blocked' && c.status !== 'cancelled' && (
            <button
              onClick={() => {
                setActiveCard(c);
                setShowBlockModal(true);
              }}
              title="Hotlist & Block Permanently"
              className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
            >
              <Ban className="w-4 h-4" />
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
            Card Fleet & Payment Instruments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervise Mastercard/Visa black, platinum and virtual credit/debit card portfolios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => navigate('/admin/cards/issuance')}
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue New Card</span>
          </Button>
        </div>
      </div>

      <AdminCardNav />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <AdminStatCard
          title="Active Cards in Circulation"
          value={activeCount.toString()}
          icon={CreditCard}
          badge={{ text: 'Operational', variant: 'success' }}
        />
        <AdminStatCard
          title="Temporarily Frozen"
          value={frozenCount.toString()}
          icon={Snowflake}
          badge={{ text: 'Suspended by admin/user', variant: 'info' }}
        />
        <AdminStatCard
          title="Hotlisted / Blocked"
          value={blockedCount.toString()}
          icon={Ban}
          badge={{ text: 'Permanent termination', variant: 'danger' }}
        />
        <AdminStatCard
          title="Fraud Risk Alerts"
          value="2 Pending"
          icon={ShieldAlert}
          change={{ value: -33, isPositive: true }}
          period="under compliance review"
        />
      </div>

      {/* Filter Bar */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search cardholder, card number, account ID..."
        filters={[
          {
            label: 'Card Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Frozen', value: 'frozen' },
              { label: 'Blocked / Hotlisted', value: 'blocked' },
            ],
          },
          {
            label: 'Card Tier',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Tiers', value: 'all' },
              { label: 'Royal Black Titanium', value: 'black' },
              { label: 'Platinum Executive', value: 'platinum' },
              { label: 'Gold Premier', value: 'gold' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
          setTypeFilter('all');
        }}
      />

      {/* Card Table */}
      <AdminDataTable
        columns={columns}
        data={cards}
        keyExtractor={(c) => c.id}
        isLoading={loading}
        emptyTitle="No cards match criteria"
        emptyDescription="Adjust your search criteria or issue a new card."
      />

      {/* Modal: Adjust Spending Limits */}
      {activeCard && (
        <Modal
          isOpen={showLimitsModal}
          onClose={() => setShowLimitsModal(false)}
          title={`Card Spending Controls • ${activeCard.cardNumberMasked}`}
          subtitle={`Adjust velocity controls for cardholder ${activeCard.cardholderName}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveLimits} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily POS Purchase Limit ($)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={limitsForm.dailyLimit}
                  onChange={(e) =>
                    setLimitsForm({ ...limitsForm, dailyLimit: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily ATM Cash Withdrawal Limit ($)
                </label>
                <input
                  type="number"
                  step="500"
                  value={limitsForm.atmDailyLimit}
                  onChange={(e) =>
                    setLimitsForm({ ...limitsForm, atmDailyLimit: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Single Online / E-commerce Transaction Limit ($)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={limitsForm.onlineLimit}
                  onChange={(e) =>
                    setLimitsForm({ ...limitsForm, onlineLimit: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Change Authorization Reason
                </label>
                <textarea
                  value={limitsForm.reason}
                  onChange={(e) => setLimitsForm({ ...limitsForm, reason: e.target.value })}
                  placeholder="e.g. VIP client requested temporary travel spending elevation..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowLimitsModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Save Velocity Limits
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Replace Card */}
      {activeCard && (
        <Modal
          isOpen={showReplaceModal}
          onClose={() => setShowReplaceModal(false)}
          title={`Issue Replacement Card • ${activeCard.cardNumberMasked}`}
          subtitle={`Current card will be cancelled immediately and a fresh card issued to ${activeCard.cardholderName}`}
          maxWidth="md"
        >
          <form onSubmit={handleReplaceConfirm} className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-amber-900 dark:text-amber-200">
                Card Lifecycle Replacement Policy:
              </span>
              <p className="text-amber-800 dark:text-amber-300">
                A replacement card with a new 16-digit PAN and CVV will be provisioned. Linked Apple Pay / Google Pay tokens will update dynamically.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Replacement
              </label>
              <select
                value={replaceReason}
                onChange={(e) => setReplaceReason(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="Physical chip demagnetization / wear">Physical chip demagnetization / wear</option>
                <option value="Card lost by customer during international travel">Card lost by customer</option>
                <option value="Compromised credentials at merchant terminal">Compromised credentials suspected</option>
                <option value="Proactive reissue due to BIN security notice">Proactive reissue (BIN notice)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowReplaceModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Authorize Reissue
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Block / Hotlist */}
      {activeCard && (
        <Modal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          title={`Permanent Hotlist Block • ${activeCard.cardNumberMasked}`}
          subtitle="Permanently deactivates card instrument across global Visa/Mastercard rails"
          maxWidth="md"
        >
          <form onSubmit={handleBlockConfirm} className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs text-rose-800 dark:text-rose-300">
              <strong>Warning:</strong> Hotlisting is irreversible. All subsequent authorizations on this card PAN will decline with code 04 (Pick Up Card).
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Hotlist Rationale
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowBlockModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
                Confirm Hotlist Block
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
