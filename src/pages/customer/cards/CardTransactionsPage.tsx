import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { cardService } from '../../../backend/services/cardService.ts';
import { Card as CardType, Transaction } from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  CreditCard,
  Search,
  Filter,
  ArrowLeft,
  Download,
  ShoppingBag,
  Plane,
  Utensils,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const CardTransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Selected Transaction for Details Modal
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const allCards = await cardService.getCards(user?.id);
      setCards(allCards);
      const txs = await cardService.getCardTransactions('all');
      setTransactions(txs);
    } catch (err: any) {
      toastError(err.message || 'Failed to load card activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Filter transactions
  const filteredTxs = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.counterpartyName && tx.counterpartyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || tx.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'dining':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'travel':
        return <Plane className="w-4 h-4 text-blue-500" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-royal-600 dark:text-gold-400" />;
    }
  };

  if (loading && transactions.length === 0) {
    return <LoadingState message="Retrieving card transaction telemetry..." />;
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
              <CreditCard className="w-6 h-6 text-royal-600 dark:text-gold-400" />
              Card Transactions & Spend Activity
            </h1>
            <p className="text-xs text-slate-500">
              Complete history of card point-of-sale authorizations, online payments, and contactless taps.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => success('Exporting card transaction log CSV...')}
          className="flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          Export Statement (.CSV)
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search merchant, authorization, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Card selector */}
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
            >
              <option value="all">All Linked Cards ({cards.length})</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cardLabel || c.type.toUpperCase()} ({c.cardNumberMasked.slice(-4)})
                </option>
              ))}
            </select>

            {/* Category selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="all">All Categories</option>
              <option value="dining">Dining & Fine Dining</option>
              <option value="travel">Travel & Aviation</option>
              <option value="shopping">Luxury & Retail</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
        {filteredTxs.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No card transactions found matching current filters.
          </div>
        ) : (
          filteredTxs.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setActiveTx(tx)}
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {getCategoryIcon(tx.category)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {tx.counterpartyName || tx.description}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatDate(tx.timestamp)}</span>
                    <span>•</span>
                    <span className="font-mono">{tx.referenceNumber}</span>
                    <span>•</span>
                    <span className="capitalize">{tx.category}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                  -{formatCurrency(tx.amount)}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  +{Math.round(tx.amount * 2)} pts
                </div>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Transaction Details Modal */}
      {activeTx && (
        <Modal
          isOpen={!!activeTx}
          onClose={() => setActiveTx(null)}
          title="Card Authorization Receipt"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Authorized Amount</div>
              <div className="text-3xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
                {formatCurrency(activeTx.amount)}
              </div>
              <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                Authorized & Settled
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Merchant</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {activeTx.counterpartyName || activeTx.description}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Authorization Reference</span>
                <span className="font-mono font-semibold">{activeTx.referenceNumber}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Timestamp</span>
                <span>{new Date(activeTx.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold">{activeTx.category}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Private Client Rewards Earned</span>
                <span className="font-bold text-gold-500">+{Math.round(activeTx.amount * 2)} Points</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="primary" onClick={() => setActiveTx(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
