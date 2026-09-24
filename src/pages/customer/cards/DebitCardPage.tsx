import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  KeyRound,
  Snowflake,
  ShieldCheck,
  Globe,
  Wifi,
  ShoppingBag,
  Sliders,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const DebitCardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [card, setCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingLimits, setSavingLimits] = useState(false);

  // Limit States
  const [atmLimit, setAtmLimit] = useState(3000);
  const [posLimit, setPosLimit] = useState(15000);
  const [onlineLimit, setOnlineLimit] = useState(10000);
  const [monthlyLimit, setMonthlyLimit] = useState(50000);

  // Modals
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceReason, setReplaceReason] = useState<'lost' | 'stolen' | 'damaged' | 'expired'>('damaged');
  const [replaceAddress, setReplaceAddress] = useState('740 Park Avenue, Penthouse 18B, New York, NY 10021');

  const loadDebitCard = async () => {
    try {
      setLoading(true);
      const allCards = await cardService.getCards(user?.id);
      const debit = allCards.find((c) => c.type === 'debit') || allCards[0];
      if (debit) {
        setCard(debit);
        setAtmLimit(debit.dailyAtmLimit || 3000);
        setPosLimit(debit.dailyPosLimit || 15000);
        setOnlineLimit(debit.dailyOnlineLimit || 10000);
        setMonthlyLimit(debit.spendingLimitMonthly || 50000);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load debit card');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebitCard();
  }, [user]);

  const handleToggleFreeze = async () => {
    if (!card) return;
    try {
      const updated = await cardService.toggleFreezeCard(card.id);
      setCard(updated);
      success(
        updated.status === 'frozen'
          ? 'Debit card is temporarily frozen.'
          : 'Debit card is active.'
      );
    } catch (err: any) {
      toastError(err.message || 'Freeze action failed');
    }
  };

  const handleActivate = async () => {
    if (!card) return;
    try {
      const updated = await cardService.activateCard(card.id);
      setCard(updated);
      success('Debit card activated successfully!');
    } catch (err: any) {
      toastError(err.message || 'Activation failed');
    }
  };

  const handleToggleChannel = async (key: 'isOnlinePaymentsEnabled' | 'isInternationalEnabled' | 'isContactlessEnabled') => {
    if (!card) return;
    try {
      const updated = await cardService.updateChannels(card.id, {
        [key]: !card[key],
      });
      setCard(updated);
      success(`Updated security channel.`);
    } catch (err: any) {
      toastError(err.message || 'Channel update failed');
    }
  };

  const handleSaveLimits = async () => {
    if (!card) return;
    try {
      setSavingLimits(true);
      const updated = await cardService.updateLimits(card.id, {
        dailyAtmLimit: atmLimit,
        dailyPosLimit: posLimit,
        dailyOnlineLimit: onlineLimit,
        spendingLimitMonthly: monthlyLimit,
      });
      setCard(updated);
      success('Transaction limits successfully updated.');
    } catch (err: any) {
      toastError(err.message || 'Failed to save limits');
    } finally {
      setSavingLimits(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      toastError('PIN must be 4 numeric digits');
      return;
    }
    if (newPin !== confirmPin) {
      toastError('New PINs do not match');
      return;
    }
    try {
      await cardService.changePin(card.id, oldPin, newPin);
      success('Debit Card PIN changed successfully.');
      setPinModalOpen(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      toastError(err.message || 'Failed to change PIN');
    }
  };

  const handleRequestReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    try {
      const res = await cardService.requestCardReplacement({
        cardId: card.id,
        reason: replaceReason,
        deliveryAddress: replaceAddress,
        instantVirtual: true,
      });
      success(`Replacement ordered! Tracking: ${res.replacement.trackingNumber}`);
      setReplaceModalOpen(false);
      await loadDebitCard();
    } catch (err: any) {
      toastError(err.message || 'Replacement failed');
    }
  };

  if (loading || !card) {
    return <LoadingState message="Loading sovereign debit controls..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/bank/cards')}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-gold-400" />
            Debit Card Management
          </h1>
          <p className="text-xs text-slate-500">
            Real-time limits, hardware toggles, and contactless security controls for your primary debit card.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Card Visual & Primary Actions */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Physical Card Preview
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  card.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400'
                }`}
              >
                {card.status.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-center my-2">
              <CardVisual card={card} onFreezeToggle={handleToggleFreeze} />
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant={card.status === 'frozen' ? 'primary' : 'outline'}
                size="sm"
                onClick={handleToggleFreeze}
                className="flex items-center justify-center gap-2"
              >
                <Snowflake className="w-4 h-4" />
                {card.status === 'frozen' ? 'Unfreeze' : 'Freeze Card'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPinModalOpen(true)}
                className="flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-500" />
                Change PIN
              </Button>

              {!card.isActivated && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleActivate}
                  className="col-span-2 bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Activate Card Now
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplaceModalOpen(true)}
                className="col-span-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center gap-2 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Report Lost / Damaged / Replace Card
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Limits and Security Channels */}
        <div className="lg:col-span-7 space-y-6">
          {/* Channel Toggles */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Security & Payment Channels
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Toggle specific payment methods on or off instantly. Any unauthorized attempt will be immediately declined at terminal level.
            </p>

            <div className="space-y-4">
              {/* Online Transactions */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Online E-Commerce Payments
                    </div>
                    <div className="text-xs text-slate-500">
                      Allows internet transactions, web checkouts, and 3D-Secure approvals.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleChannel('isOnlinePaymentsEnabled')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    card.isOnlinePaymentsEnabled ? 'bg-royal-600 dark:bg-gold-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      card.isOnlinePaymentsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* International Payments */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      International & Cross-Border Usage
                    </div>
                    <div className="text-xs text-slate-500">
                      Enable overseas ATMs, foreign merchant POS, and multi-currency transactions.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleChannel('isInternationalEnabled')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    card.isInternationalEnabled ? 'bg-royal-600 dark:bg-gold-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      card.isInternationalEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Contactless / NFC */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                    <Wifi className="w-5 h-5 rotate-90" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Contactless Tap-to-Pay (NFC)
                    </div>
                    <div className="text-xs text-slate-500">
                      Allows tap payments up to $250 without physical PIN entry at compatible terminals.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleChannel('isContactlessEnabled')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    card.isContactlessEnabled ? 'bg-royal-600 dark:bg-gold-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      card.isContactlessEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Transaction Limits Management */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Adjust Transaction Limits
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Customize daily withdrawal and point-of-sale spending caps according to your personal liquidity needs.
            </p>

            <div className="space-y-6">
              {/* Daily ATM Withdrawal Limit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Daily ATM Cash Withdrawal</span>
                  <span className="font-mono text-royal-600 dark:text-gold-400 font-bold text-sm">
                    {formatCurrency(atmLimit)}
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={500}
                  value={atmLimit}
                  onChange={(e) => setAtmLimit(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-royal-600 dark:accent-gold-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Min: $500</span>
                  <span>Max: $10,000</span>
                </div>
              </div>

              {/* Daily POS Limit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Daily POS Merchant Spending</span>
                  <span className="font-mono text-royal-600 dark:text-gold-400 font-bold text-sm">
                    {formatCurrency(posLimit)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={50000}
                  step={1000}
                  value={posLimit}
                  onChange={(e) => setPosLimit(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-royal-600 dark:accent-gold-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Min: $1,000</span>
                  <span>Max: $50,000</span>
                </div>
              </div>

              {/* Daily Online Limit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Daily Online Spending Limit</span>
                  <span className="font-mono text-royal-600 dark:text-gold-400 font-bold text-sm">
                    {formatCurrency(onlineLimit)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={30000}
                  step={1000}
                  value={onlineLimit}
                  onChange={(e) => setOnlineLimit(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-royal-600 dark:accent-gold-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Min: $1,000</span>
                  <span>Max: $30,000</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSaveLimits}
                  loading={savingLimits}
                  className="w-full sm:w-auto"
                >
                  Save Limit Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Change PIN Modal */}
      <Modal isOpen={pinModalOpen} onClose={() => setPinModalOpen(false)} title="Change Debit Card PIN">
        <form onSubmit={handleChangePin} className="space-y-4">
          <Input
            label="Current PIN"
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
              Confirm PIN Change
            </Button>
          </div>
        </form>
      </Modal>

      {/* Replacement Modal */}
      <Modal isOpen={replaceModalOpen} onClose={() => setReplaceModalOpen(false)} title="Card Replacement Request">
        <form onSubmit={handleRequestReplacement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Reason</label>
            <select
              value={replaceReason}
              onChange={(e) => setReplaceReason(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="damaged">Damaged or Unreadable Chip</option>
              <option value="lost">Lost Card</option>
              <option value="stolen">Stolen Card (Instant Block)</option>
              <option value="expired">Card Renewal / Expired</option>
            </select>
          </div>

          <Input
            label="Delivery Address"
            value={replaceAddress}
            onChange={(e) => setReplaceAddress(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setReplaceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Order New Debit Card
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
