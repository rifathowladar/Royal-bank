import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { cardService } from '../../../backend/services/cardService.ts';
import { accountService } from '../../../backend/services/accountService.ts';
import { Card as CardType, Account } from '../../../backend/types/index.ts';
import { CardVisual } from '../../../components/banking/CardVisual.tsx';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { formatCurrency } from '../../../utils/formatters.ts';
import {
  ShieldCheck,
  Plus,
  Snowflake,
  Trash2,
  Lock,
  Flame,
  ArrowLeft,
  Sparkles,
  Eye,
  Copy,
  Check,
} from 'lucide-react';

export const VirtualCardsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [virtualCards, setVirtualCards] = useState<CardType[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate Modal
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [limit, setLimit] = useState('2500');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [colorScheme, setColorScheme] = useState<'midnight_blue' | 'royal_gold' | 'black_titanium' | 'emerald_prestige'>('midnight_blue');
  const [isBurner, setIsBurner] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardType | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const allCards = await cardService.getCards(user?.id);
      const vCards = allCards.filter((c) => c.type === 'virtual_prepaid');
      setVirtualCards(vCards);

      const accs = await accountService.getAccounts(user?.id);
      setAccounts(accs);
      if (accs.length > 0) setSelectedAccountId(accs[0].id);
    } catch (err: any) {
      toastError(err.message || 'Failed to load virtual cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleFreeze = async (cardId: string) => {
    try {
      const updated = await cardService.toggleFreezeCard(cardId);
      setVirtualCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      success(
        updated.status === 'frozen'
          ? `Virtual card "${updated.cardLabel}" has been frozen.`
          : `Virtual card "${updated.cardLabel}" is now active.`
      );
    } catch (err: any) {
      toastError(err.message || 'Freeze action failed');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      toastError('Please enter a valid spending limit');
      return;
    }

    try {
      setIsGenerating(true);
      const newCard = await cardService.generateVirtualCard({
        customerId: user?.id || 'cust-001',
        accountId: selectedAccountId,
        label: label.trim() || (isBurner ? 'Burner Shield' : 'Virtual Card'),
        spendingLimitMonthly: numLimit,
        colorScheme,
        isBurner,
      });
      success(`Virtual card "${newCard.cardLabel}" generated successfully!`);
      setGenModalOpen(false);
      setLabel('');
      setIsBurner(false);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to generate virtual card');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!cardToDelete) return;
    try {
      await cardService.deleteVirtualCard(cardToDelete.id);
      success(`Virtual card "${cardToDelete.cardLabel}" permanently deleted.`);
      setDeleteModalOpen(false);
      setCardToDelete(null);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'Deletion failed');
    }
  };

  if (loading && virtualCards.length === 0) {
    return <LoadingState message="Loading digital virtual cards..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bank/cards')}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
              Virtual Cards & Merchant Shields
            </h1>
            <p className="text-xs text-slate-500">
              Create isolated digital card numbers with custom spend limits to protect your primary bank account from leaks and recurring charges.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setGenModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Generate New Virtual Card
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Zero-Liability Merchant Tokenization</div>
          <div className="text-blue-700/80 dark:text-blue-300/80 mt-0.5">
            Use burner cards for free trials or one-time transactions. If a merchant is breached or tries to bill you twice, our core banking system immediately declines the charge without affecting your physical cards.
          </div>
        </div>
      </div>

      {/* Virtual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {virtualCards.map((card) => (
          <Card
            key={card.id}
            className="p-5 flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {card.cardLabel}
                  </span>
                  {card.isBurner && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-300">
                      <Flame className="w-3 h-3" /> Burner
                    </span>
                  )}
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    card.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400'
                  }`}
                >
                  {card.status}
                </span>
              </div>

              {/* Realistic Mini Card Preview */}
              <div className="flex justify-center">
                <CardVisual
                  card={card}
                  showDetailsToggle={true}
                  onFreezeToggle={() => handleToggleFreeze(card.id)}
                />
              </div>

              {/* Spending progress */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Monthly Spending Limit</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(card.spendingCurrentMonthly || 0)} / {formatCurrency(card.spendingLimitMonthly)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (((card.spendingCurrentMonthly || 0) / (card.spendingLimitMonthly || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleFreeze(card.id)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Snowflake className="w-3.5 h-3.5" />
                {card.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCardToDelete(card);
                  setDeleteModalOpen(true);
                }}
                className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Card
              </Button>
            </div>
          </Card>
        ))}

        {/* Create Card Placeholder Card */}
        <div
          onClick={() => setGenModalOpen(true)}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-royal-500 dark:hover:border-gold-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/40 min-h-[300px]"
        >
          <div className="w-14 h-14 rounded-full bg-royal-50 dark:bg-royal-950/60 border border-royal-200 dark:border-royal-800 flex items-center justify-center text-royal-600 dark:text-gold-400 mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Issue Another Virtual Card
          </h3>
          <p className="text-xs text-slate-500 max-w-[220px] mt-1">
            Instant digital provisioning with customized spend limits and isolated tokenization.
          </p>
        </div>
      </div>

      {/* Generate Virtual Card Modal */}
      <Modal
        isOpen={genModalOpen}
        onClose={() => setGenModalOpen(false)}
        title="Generate Instant Virtual Card"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <Input
            label="Card Label / Purpose"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. AWS & Cloud Hosting, OpenAI API, Travel"
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Link to Source Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) - {formatCurrency(acc.availableBalance)}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Monthly Spending Limit ($ USD)"
            type="number"
            min="100"
            max="50000"
            step="100"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Card Color Aesthetic
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'midnight_blue', name: 'Sapphire Blue', bg: 'bg-indigo-900 text-white' },
                { id: 'royal_gold', name: 'Royal Gold', bg: 'bg-amber-900 text-gold-300' },
                { id: 'black_titanium', name: 'Black Titanium', bg: 'bg-zinc-900 text-zinc-100' },
                { id: 'emerald_prestige', name: 'Emerald', bg: 'bg-emerald-900 text-emerald-200' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorScheme(c.id as any)}
                  className={`p-2 rounded-lg border text-center text-[11px] font-semibold cursor-pointer ${c.bg} ${
                    colorScheme === c.id ? 'ring-2 ring-gold-400 ring-offset-2' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                Single-Use Burner Card
              </div>
              <div className="text-[11px] text-slate-500">
                Card expires immediately after first merchant transaction or authorization.
              </div>
            </div>
            <input
              type="checkbox"
              checked={isBurner}
              onChange={(e) => setIsBurner(e.target.checked)}
              className="w-4 h-4 text-royal-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setGenModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isGenerating}>
              Instantly Issue Card
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {cardToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Virtual Card"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete the virtual card{' '}
              <strong>"{cardToDelete.cardLabel}"</strong> ending in{' '}
              <strong>{cardToDelete.cardNumberMasked.slice(-4)}</strong>?
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Any recurring subscriptions or future charges tied to this virtual card number will be permanently declined.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" type="button" onClick={() => setDeleteModalOpen(false)}>
                Keep Card
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Permanently Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
