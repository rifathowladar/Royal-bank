import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  Snowflake,
  KeyRound,
  Sliders,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Globe,
  Wifi,
  ShoppingBag,
} from 'lucide-react';

export const CardDetailPage: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [card, setCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);

  // Limits
  const [atmLimit, setAtmLimit] = useState(3000);
  const [posLimit, setPosLimit] = useState(15000);
  const [onlineLimit, setOnlineLimit] = useState(10000);
  const [monthlyLimit, setMonthlyLimit] = useState(50000);
  const [savingLimits, setSavingLimits] = useState(false);

  // PIN modal
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const loadCard = async () => {
    try {
      setLoading(true);
      if (!cardId) return;
      const found = await cardService.getCardById(cardId);
      if (found) {
        setCard(found);
        setAtmLimit(found.dailyAtmLimit || 3000);
        setPosLimit(found.dailyPosLimit || 15000);
        setOnlineLimit(found.dailyOnlineLimit || 10000);
        setMonthlyLimit(found.spendingLimitMonthly || 50000);
      } else {
        toastError('Card not found');
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load card');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCard();
  }, [cardId, user]);

  const handleToggleFreeze = async () => {
    if (!card) return;
    try {
      const updated = await cardService.toggleFreezeCard(card.id);
      setCard(updated);
      success(updated.status === 'frozen' ? 'Card frozen.' : 'Card is active.');
    } catch (err: any) {
      toastError(err.message || 'Failed to toggle freeze');
    }
  };

  const handleToggleChannel = async (key: 'isOnlinePaymentsEnabled' | 'isInternationalEnabled' | 'isContactlessEnabled') => {
    if (!card) return;
    try {
      const updated = await cardService.updateChannels(card.id, {
        [key]: !card[key],
      });
      setCard(updated);
      success('Channel setting updated.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update channel');
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
      success('Limits updated successfully.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update limits');
    } finally {
      setSavingLimits(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      toastError('PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      toastError('PINs do not match');
      return;
    }
    try {
      await cardService.changePin(card.id, oldPin, newPin);
      success('Card PIN updated.');
      setPinModalOpen(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      toastError(err.message || 'Failed to change PIN');
    }
  };

  if (loading || !card) {
    return <LoadingState message="Loading card credentials..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/bank/cards')}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {card.cardLabel || card.type.toUpperCase()} ({card.cardNumberMasked})
          </h1>
          <p className="text-xs text-slate-500">
            Hardware configuration and spending parameters for Card ID {card.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Card Visual & Primary Actions */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800">
            <div className="flex justify-center my-2">
              <CardVisual card={card} onFreezeToggle={handleToggleFreeze} />
            </div>

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
            </div>
          </Card>
        </div>

        {/* Channels & Limits */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Security Channels
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Online E-Commerce Payments
                </div>
                <button
                  onClick={() => handleToggleChannel('isOnlinePaymentsEnabled')}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    card.isOnlinePaymentsEnabled ? 'bg-royal-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      card.isOnlinePaymentsEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  International & Cross-Border Usage
                </div>
                <button
                  onClick={() => handleToggleChannel('isInternationalEnabled')}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    card.isInternationalEnabled ? 'bg-royal-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      card.isInternationalEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Contactless NFC Payments
                </div>
                <button
                  onClick={() => handleToggleChannel('isContactlessEnabled')}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    card.isContactlessEnabled ? 'bg-royal-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      card.isContactlessEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Transaction Limits
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Daily ATM Limit</span>
                  <span className="font-mono text-royal-600 dark:text-gold-400">{formatCurrency(atmLimit)}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={500}
                  value={atmLimit}
                  onChange={(e) => setAtmLimit(Number(e.target.value))}
                  className="w-full accent-royal-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Daily POS Limit</span>
                  <span className="font-mono text-royal-600 dark:text-gold-400">{formatCurrency(posLimit)}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={50000}
                  step={1000}
                  value={posLimit}
                  onChange={(e) => setPosLimit(Number(e.target.value))}
                  className="w-full accent-royal-600"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <Button variant="primary" onClick={handleSaveLimits} loading={savingLimits}>
                  Save Limits
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Change PIN Modal */}
      <Modal isOpen={pinModalOpen} onClose={() => setPinModalOpen(false)} title="Change PIN">
        <form onSubmit={handleChangePin} className="space-y-4">
          <Input
            label="Current PIN"
            type="password"
            maxLength={4}
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
            required
          />
          <Input
            label="New PIN"
            type="password"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            required
          />
          <Input
            label="Confirm New PIN"
            type="password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setPinModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm PIN
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
