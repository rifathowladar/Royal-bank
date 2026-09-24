import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminCardNav } from '../../../components/admin/AdminCardNav.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminCardService } from '../../../backend/services/adminCardService.ts';
import { db } from '../../../backend/mockApi/storage.ts';
import { Card } from '../../../backend/types/index.ts';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Send,
  Zap,
  Building2,
  Lock,
} from 'lucide-react';

export const AdminCardsIssuancePage: React.FC = () => {
  const [customerId, setCustomerId] = useState('cust-001');
  const [accountId, setAccountId] = useState('acc-001');
  const [cardholderName, setCardholderName] = useState('Alexander Sterling');
  const [cardType, setCardType] = useState<'debit' | 'credit'>('credit');
  const [cardTier, setCardTier] = useState<'black' | 'platinum' | 'gold'>('black');
  const [brand, setBrand] = useState<'mastercard' | 'visa'>('mastercard');
  const [isVirtual, setIsVirtual] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(50000);
  const [atmDailyLimit, setAtmDailyLimit] = useState(10000);
  const [onlineLimit, setOnlineLimit] = useState(50000);
  const [dispatchMethod, setDispatchMethod] = useState('Secure Armored Diplomatic Courier');
  const [issuing, setIssuing] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleCustomerChange = (cid: string) => {
    setCustomerId(cid);
    const cust = db.customers.find((c) => c.id === cid);
    if (cust) {
      setCardholderName(`${cust.firstName} ${cust.lastName}`);
      const acc = db.accounts.find((a) => a.customerId === cid);
      if (acc) setAccountId(acc.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssuing(true);
    try {
      const colorScheme =
        cardTier === 'black'
          ? 'black_titanium'
          : cardTier === 'gold'
          ? 'royal_gold'
          : 'midnight_blue';

      const network = (brand === 'visa' ? 'Visa' : 'Mastercard') as Card['network'];

      const card = await adminCardService.issueCard({
        customerId,
        accountId,
        cardHolderName: cardholderName,
        type: cardType,
        network,
        colorScheme,
        spendingLimitMonthly: dailyLimit * 3,
        dailyPosLimit: dailyLimit,
        dailyAtmLimit: atmDailyLimit,
        dailyOnlineLimit: onlineLimit,
        isContactlessEnabled: true,
        isInternationalEnabled: true,
        isOnlinePaymentsEnabled: true,
        physicalShippingAddress: dispatchMethod,
      });

      addToast(
        `Successfully issued ${card.network} ${card.type.toUpperCase()} card ${card.cardNumberMasked}`,
        'success'
      );
      navigate('/admin/cards');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Issuance failed';
      addToast(msg, 'error');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
          Card Issuance & Embossing Desk
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Mint and dispatch bespoke private wealth credit/debit instruments and virtual tokens
        </p>
      </div>

      <AdminCardNav />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Card Program Specifications</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select cardholder profile and specify payment rail credentials
            </p>
          </div>

          {/* Customer Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Client
              </label>
              <select
                value={customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {db.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Linked Settlement Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {db.accounts
                  .filter((a) => a.customerId === customerId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountNumber} ({a.type})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Embossed Cardholder Name (Max 26 characters)
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
              maxLength={26}
              className="w-full px-3 py-2 text-sm font-mono tracking-wider uppercase rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Tier & Brand Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tier Program
              </label>
              <select
                value={cardTier}
                onChange={(e) => setCardTier(e.target.value as 'black' | 'platinum' | 'gold')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="black">Royal Black Titanium</option>
                <option value="platinum">Platinum Executive</option>
                <option value="gold">Gold Premier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Network
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as 'mastercard' | 'visa')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="mastercard">Mastercard World Elite</option>
                <option value="visa">Visa Infinite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instrument Type
              </label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value as 'debit' | 'credit')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="credit">Revolving Credit Facility</option>
                <option value="debit">Direct Debit Settlement</option>
              </select>
            </div>
          </div>

          {/* Physical vs Virtual */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isVirtual}
                onChange={(e) => setIsVirtual(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Issue as Virtual Tokenized Card Only
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant activation in Apple Wallet / Google Pay without plastic embossing
                </p>
              </div>
            </label>
          </div>

          {/* Velocity Limits */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Initial Spending & Velocity Controls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Daily Purchase Cap ($)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Daily ATM Limit ($)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={atmDailyLimit}
                  onChange={(e) => setAtmDailyLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Online Transaction Cap ($)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={onlineLimit}
                  onChange={(e) => setOnlineLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => navigate('/admin/cards')}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={issuing}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Mint & Issue Card</span>
            </Button>
          </div>
        </form>

        {/* Live Visual Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Real-Time Card Render
            </h3>

            {/* Simulated Card Rendering */}
            <div
              className={`w-full aspect-[1.586] rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                cardTier === 'black'
                  ? 'bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white border border-amber-500/50'
                  : cardTier === 'platinum'
                  ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white border border-slate-500/50'
                  : 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white border border-amber-300/40'
              }`}
            >
              {/* Subtle background luxury texture watermark */}
              <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="text-[11px] font-serif tracking-widest text-amber-400 uppercase font-semibold">
                    ROYAL BANK
                  </div>
                  <div className="text-[9px] tracking-widest uppercase text-slate-300">
                    Private Banking & Trust
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/30">
                    {cardTier}
                  </span>
                </div>
              </div>

              {/* EMV Chip & Contactless */}
              <div className="flex items-center gap-3 relative z-10 my-1">
                <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 border border-amber-500/60 shadow-inner flex flex-col justify-around p-1">
                  <div className="w-full h-px bg-amber-600/40" />
                  <div className="w-full h-px bg-amber-600/40" />
                </div>
                <span className="text-xs text-amber-200">)))</span>
              </div>

              {/* Card Number & Details */}
              <div className="relative z-10 space-y-2">
                <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-slate-100 drop-shadow">
                  4892 •••• •••• {Math.floor(1000 + Math.random() * 9000)}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400">
                      Cardholder
                    </div>
                    <div className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white uppercase truncate max-w-[190px]">
                      {cardholderName || 'ROYAL CLIENT'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[8px] uppercase tracking-wider text-slate-400">
                      Network
                    </div>
                    <div className="font-bold text-xs sm:text-sm tracking-wider uppercase text-amber-300 font-mono">
                      {brand}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Details */}
            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Network Protocol:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  3D Secure 2.3 & Apple Pay Tokenization
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dispatch Method:</span>
                <span className="text-slate-900 dark:text-white font-medium">{dispatchMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Issuance Fee:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Waived (Private Client Tier)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
