import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { cardService } from '../../../backend/services/cardService.ts';
import { Card as CardType } from '../../../backend/types/index.ts';
import { CardVisual } from '../../../components/banking/CardVisual.tsx';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { formatCurrency } from '../../../utils/formatters.ts';
import {
  CreditCard,
  Shield,
  Snowflake,
  KeyRound,
  Sliders,
  Plus,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  ExternalLink,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const CardsOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Replacement Modal
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceReason, setReplaceReason] = useState<'lost' | 'stolen' | 'damaged' | 'expired'>('damaged');
  const [replaceAddress, setReplaceAddress] = useState('740 Park Avenue, Penthouse 18B, New York, NY 10021');
  const [instantVirtual, setInstantVirtual] = useState(true);
  const [isSubmittingReplace, setIsSubmittingReplace] = useState(false);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await cardService.getCards(user?.id);
      setCards(data);
      if (data.length > 0 && !selectedCardId) {
        setSelectedCardId(data[0].id);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [user]);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleToggleFreeze = async (cardId: string) => {
    try {
      const updated = await cardService.toggleFreezeCard(cardId);
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      success(
        updated.status === 'frozen'
          ? `Card ending in ${updated.cardNumberMasked.slice(-4)} has been frozen.`
          : `Card ending in ${updated.cardNumberMasked.slice(-4)} is now active.`
      );
    } catch (err: any) {
      toastError(err.message || 'Action failed');
    }
  };

  const handleActivate = async (cardId: string) => {
    try {
      const updated = await cardService.activateCard(cardId);
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      success('Card successfully activated!');
    } catch (err: any) {
      toastError(err.message || 'Activation failed');
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      toastError('PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      toastError('New PIN confirmation does not match');
      return;
    }
    try {
      await cardService.changePin(selectedCard.id, oldPin, newPin);
      success('Card PIN has been updated successfully');
      setPinModalOpen(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      toastError(err.message || 'Failed to update PIN');
    }
  };

  const handleRequestReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    try {
      setIsSubmittingReplace(true);
      const res = await cardService.requestCardReplacement({
        cardId: selectedCard.id,
        reason: replaceReason,
        deliveryAddress: replaceAddress,
        instantVirtual,
      });
      success(`Replacement requested. Dispatched via courier: ${res.replacement.trackingNumber}`);
      setReplaceModalOpen(false);
      await loadCards();
    } catch (err: any) {
      toastError(err.message || 'Replacement request failed');
    } finally {
      setIsSubmittingReplace(false);
    }
  };

  if (loading && cards.length === 0) {
    return <LoadingState message="Loading card management vault..." />;
  }

  const debitCards = cards.filter((c) => c.type === 'debit');
  const creditCards = cards.filter((c) => c.type === 'credit');
  const virtualCards = cards.filter((c) => c.type === 'virtual_prepaid');

  const totalMonthlySpent = cards.reduce((acc, c) => acc + (c.spendingCurrentMonthly || 0), 0);
  const totalCreditAvailable = creditCards.reduce((acc, c) => acc + (c.availableCredit || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-royal-600 dark:text-gold-400" />
            Card Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control physical debit, private client credit, and virtual spending shields with real-time hardware security.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/bank/cards/virtual')}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-royal-600 dark:text-gold-400" />
            Issue Virtual Card
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/bank/cards/transactions')}
            className="flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            Card Activity
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-sm font-medium">
        <button
          onClick={() => navigate('/bank/cards')}
          className="px-4 py-2 border-b-2 border-royal-600 dark:border-gold-400 text-royal-600 dark:text-gold-400 font-semibold cursor-pointer shrink-0"
        >
          All Cards Overview
        </button>
        <button
          onClick={() => navigate('/bank/cards/debit')}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer shrink-0"
        >
          Debit Card Controls
        </button>
        <button
          onClick={() => navigate('/bank/cards/credit')}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer shrink-0"
        >
          Credit Card & EMI
        </button>
        <button
          onClick={() => navigate('/bank/cards/virtual')}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer shrink-0"
        >
          Virtual Cards ({virtualCards.length})
        </button>
        <button
          onClick={() => navigate('/bank/cards/transactions')}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer shrink-0"
        >
          Card Transactions
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-royal-50 dark:bg-royal-950/60 border border-royal-200 dark:border-royal-800 flex items-center justify-center text-royal-600 dark:text-gold-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Cards</div>
            <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-0.5">
              {cards.filter((c) => c.status === 'active').length} <span className="text-xs text-slate-400 font-sans font-normal">of {cards.length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Current Month Spend</div>
            <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-0.5">
              {formatCurrency(totalMonthlySpent)}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Available Credit</div>
            <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-0.5">
              {formatCurrency(totalCreditAvailable)}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Reward Points</div>
            <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-0.5">
              {(creditCards[0]?.rewardPoints || 48250).toLocaleString()} <span className="text-xs text-gold-500 font-sans font-medium">pts</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Hero Showcase: Interactive Card & Quick Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Card Visual & Switcher */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Selected Card Preview
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  selectedCard?.status === 'active'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : selectedCard?.status === 'frozen'
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                    : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedCard?.status === 'active'
                      ? 'bg-emerald-500'
                      : selectedCard?.status === 'frozen'
                      ? 'bg-blue-500'
                      : 'bg-red-500'
                  }`}
                />
                {selectedCard?.status.toUpperCase()}
              </span>
            </div>

            {selectedCard && (
              <div className="flex justify-center my-2">
                <CardVisual
                  card={selectedCard}
                  onFreezeToggle={() => handleToggleFreeze(selectedCard.id)}
                />
              </div>
            )}

            {/* Card Switcher Carousel */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">
                Switch Card ({cards.length})
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {cards.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCardId(c.id)}
                    className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer shrink-0 ${
                      selectedCardId === c.id
                        ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-500 dark:border-gold-400 ring-2 ring-royal-400/20'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {c.cardLabel || c.type.toUpperCase()}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {c.cardNumberMasked.slice(-4)} · {c.network.slice(0, 10)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Quick Controls for Selected Card */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center justify-between">
              <span>Card Controls & Security</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                {selectedCard?.cardNumberMasked}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Real-time hardware commands executed instantaneously across global card rails.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {/* Freeze Button */}
              <button
                onClick={() => selectedCard && handleToggleFreeze(selectedCard.id)}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedCard?.status === 'frozen'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Snowflake className="w-5 h-5" />
                <span className="text-xs font-bold">
                  {selectedCard?.status === 'frozen' ? 'Unfreeze Card' : 'Freeze Card'}
                </span>
              </button>

              {/* Change PIN */}
              <button
                onClick={() => setPinModalOpen(true)}
                className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold">Change PIN</span>
              </button>

              {/* Limits & Controls */}
              <button
                onClick={() => navigate(selectedCard?.type === 'credit' ? '/bank/cards/credit' : '/bank/cards/debit')}
                className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sliders className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                <span className="text-xs font-bold">Manage Limits</span>
              </button>

              {/* Replace Card */}
              <button
                onClick={() => setReplaceModalOpen(true)}
                className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold">Card Replacement</span>
              </button>

              {/* View Activity */}
              <button
                onClick={() => navigate('/bank/cards/transactions')}
                className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold">Transactions</span>
              </button>

              {/* Activate Card (if needed) */}
              <button
                onClick={() => selectedCard && handleActivate(selectedCard.id)}
                disabled={selectedCard?.isActivated}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedCard?.isActivated
                    ? 'bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 border-slate-200/50 dark:border-slate-800 cursor-not-allowed'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 cursor-pointer hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold">
                  {selectedCard?.isActivated ? 'Activated' : 'Activate Card'}
                </span>
              </button>
            </div>

            {/* Selected Card Limits Progress */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Spend Progress
                </span>
                <span className="font-mono text-slate-500">
                  {formatCurrency(selectedCard?.spendingCurrentMonthly || 0)} / {formatCurrency(selectedCard?.spendingLimitMonthly || 50000)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-royal-600 to-gold-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (((selectedCard?.spendingCurrentMonthly || 0) / (selectedCard?.spendingLimitMonthly || 50000)) * 100)
                    )}%`,
                  }}
                />
              </div>

              {/* Channels Status badges */}
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                    selectedCard?.isOnlinePaymentsEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200'
                  }`}
                >
                  <Lock className="w-3 h-3" /> Online {selectedCard?.isOnlinePaymentsEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                    selectedCard?.isInternationalEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> International {selectedCard?.isInternationalEnabled ? 'Active' : 'Locked'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                    selectedCard?.isContactlessEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200'
                  }`}
                >
                  Contactless {selectedCard?.isContactlessEnabled ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cards Catalog: Debit, Credit & Virtual Sections */}
      <div className="space-y-6">
        {/* Debit Cards Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-400" />
              Debit Cards ({debitCards.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/bank/cards/debit')}
              className="text-royal-600 dark:text-gold-400 flex items-center gap-1 text-xs"
            >
              Configure Debit Card <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debitCards.map((card) => (
              <Card
                key={card.id}
                className="p-5 hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 cursor-pointer"
                onClick={() => navigate(`/bank/cards/${card.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {card.cardLabel || 'Royal Sovereign Debit'}
                    </span>
                    <div className="text-xs text-slate-500 font-mono">{card.cardNumberMasked}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-gold-400 border border-amber-300 dark:border-amber-800">
                    {card.network}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily ATM Limit:</span>
                    <span className="font-semibold">{formatCurrency(card.dailyAtmLimit || 3000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily POS Limit:</span>
                    <span className="font-semibold">{formatCurrency(card.dailyPosLimit || 15000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-semibold capitalize text-emerald-600 dark:text-emerald-400">{card.status}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-royal-600 dark:text-gold-400">
                  <span>Manage Card Settings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Credit Cards Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-800 dark:bg-zinc-200" />
              Credit Cards ({creditCards.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/bank/cards/credit')}
              className="text-royal-600 dark:text-gold-400 flex items-center gap-1 text-xs"
            >
              Open Credit Console & EMI <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCards.map((card) => (
              <Card
                key={card.id}
                className="p-5 hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 cursor-pointer"
                onClick={() => navigate('/bank/cards/credit')}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {card.cardLabel || 'Palladium Private Credit'}
                    </span>
                    <div className="text-xs text-slate-500 font-mono">{card.cardNumberMasked}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                    Limit {formatCurrency(card.creditLimit || 100000)}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Limit:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatCurrency(card.availableCredit || 85750)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Outstanding:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                      {formatCurrency(card.outstandingBalance || 14250)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Due Date:</span>
                    <span className="font-semibold text-amber-600 dark:text-gold-400">
                      {card.paymentDueDate || 'October 15, 2026'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-royal-600 dark:text-gold-400">
                  <span>Pay Bill / EMI Options</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Virtual Cards Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Virtual Cards & Merchant Shields ({virtualCards.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/bank/cards/virtual')}
              className="flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate Virtual Card
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {virtualCards.map((card) => (
              <Card
                key={card.id}
                className="p-5 hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 cursor-pointer"
                onClick={() => navigate('/bank/cards/virtual')}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {card.cardLabel || 'Virtual Shield'}
                    </span>
                    <div className="text-xs text-slate-500 font-mono">{card.cardNumberMasked}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      card.isBurner
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300'
                    }`}
                  >
                    {card.isBurner ? 'Single-Use Burner' : 'Multi-Use Virtual'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Limit:</span>
                    <span className="font-semibold font-mono">{formatCurrency(card.spendingLimitMonthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Spent This Month:</span>
                    <span className="font-semibold font-mono">{formatCurrency(card.spendingCurrentMonthly)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-royal-600 dark:text-gold-400">
                  <span>Reveal CVV & Full Number</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Change PIN Modal */}
      <Modal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        title="Change Card PIN"
      >
        <form onSubmit={handleChangePin} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter your current PIN and choose a new 4-digit security PIN for ATM withdrawals and POS point-of-sale authorizations.
          </p>

          <Input
            label="Current 4-Digit PIN"
            type="password"
            maxLength={4}
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            required
          />

          <Input
            label="New 4-Digit PIN"
            type="password"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            required
          />

          <Input
            label="Confirm New 4-Digit PIN"
            type="password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setPinModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update PIN
            </Button>
          </div>
        </form>
      </Modal>

      {/* Card Replacement Modal */}
      <Modal
        isOpen={replaceModalOpen}
        onClose={() => setReplaceModalOpen(false)}
        title="Request Card Replacement"
      >
        <form onSubmit={handleRequestReplacement} className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Security Protocol:</strong> Requesting a replacement will immediately deactivate your existing card ending in{' '}
              <strong>{selectedCard?.cardNumberMasked.slice(-4)}</strong> to prevent unauthorized charges.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Reason for Replacement
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'damaged', label: 'Damaged / Chip Defect' },
                { id: 'lost', label: 'Lost in Transit' },
                { id: 'stolen', label: 'Stolen / Suspicious' },
                { id: 'expired', label: 'Approaching Expiry' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReplaceReason(r.id as any)}
                  className={`p-2.5 rounded-lg border text-left text-xs font-medium cursor-pointer transition-all ${
                    replaceReason === r.id
                      ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 dark:border-gold-400 font-bold text-royal-700 dark:text-gold-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Courier Delivery Address"
            value={replaceAddress}
            onChange={(e) => setReplaceAddress(e.target.value)}
            required
            helperText="Dispatched via Private Client Armored Courier (1-2 business days with biometric signature)."
          />

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Issue Instant Virtual Card
              </div>
              <div className="text-[11px] text-slate-500">
                Start transacting online right away while your physical metal card is in transit.
              </div>
            </div>
            <input
              type="checkbox"
              checked={instantVirtual}
              onChange={(e) => setInstantVirtual(e.target.checked)}
              className="w-4 h-4 text-royal-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setReplaceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmittingReplace}>
              Confirm & Dispatch Card
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
