import React, { useState } from 'react';
import { Card as CardType } from '../../backend/types/index.ts';
import { Eye, EyeOff, Copy, Check, Wifi, ShieldAlert, Sparkles, Snowflake } from 'lucide-react';

interface CardVisualProps {
  card: CardType;
  showDetailsToggle?: boolean;
  className?: string;
  onFreezeToggle?: () => void;
}

export const CardVisual: React.FC<CardVisualProps> = ({
  card,
  showDetailsToggle = true,
  className = '',
  onFreezeToggle,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayNumber = revealed && card.fullCardNumber ? card.fullCardNumber : card.cardNumberMasked;
  const displayCvv = revealed && card.cvvMasked ? card.cvvMasked : '•••';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const numToCopy = card.fullCardNumber || card.cardNumberMasked.replace(/•/g, '4');
    navigator.clipboard.writeText(numToCopy.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Background style based on colorScheme
  const getCardTheme = () => {
    switch (card.colorScheme) {
      case 'black_titanium':
        return {
          bg: 'bg-gradient-to-tr from-zinc-950 via-neutral-900 to-zinc-800 text-zinc-100 border-zinc-700/60 shadow-zinc-950/60',
          accent: 'text-zinc-300',
          chip: 'from-amber-200 via-yellow-400 to-amber-600',
          foil: 'bg-gradient-to-r from-zinc-400/20 via-white/10 to-transparent',
          badge: 'bg-zinc-800/80 text-zinc-200 border-zinc-700',
        };
      case 'midnight_blue':
        return {
          bg: 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-900 text-blue-50 border-blue-800/50 shadow-indigo-950/60',
          accent: 'text-blue-200',
          chip: 'from-amber-200 via-yellow-400 to-amber-600',
          foil: 'bg-gradient-to-r from-blue-400/20 via-indigo-200/10 to-transparent',
          badge: 'bg-indigo-900/60 text-blue-200 border-indigo-700',
        };
      case 'emerald_prestige':
        return {
          bg: 'bg-gradient-to-tr from-emerald-950 via-teal-950 to-slate-900 text-emerald-50 border-emerald-800/50 shadow-emerald-950/60',
          accent: 'text-emerald-200',
          chip: 'from-amber-200 via-yellow-400 to-amber-600',
          foil: 'bg-gradient-to-r from-emerald-400/20 via-teal-200/10 to-transparent',
          badge: 'bg-emerald-900/60 text-emerald-200 border-emerald-700',
        };
      case 'royal_gold':
      default:
        return {
          bg: 'bg-gradient-to-tr from-amber-950 via-stone-900 to-neutral-900 text-amber-50 border-amber-800/50 shadow-amber-950/50',
          accent: 'text-gold-300',
          chip: 'from-amber-200 via-yellow-400 to-amber-600',
          foil: 'bg-gradient-to-r from-gold-400/20 via-amber-200/10 to-transparent',
          badge: 'bg-amber-900/60 text-gold-300 border-amber-700',
        };
    }
  };

  const theme = getCardTheme();
  const isFrozen = card.status === 'frozen';

  return (
    <div
      className={`relative w-full aspect-[1.586/1] max-w-[420px] rounded-2xl p-6 sm:p-7 shadow-2xl border flex flex-col justify-between overflow-hidden select-none transition-all duration-300 ${theme.bg} ${className}`}
    >
      {/* Metallic Sheen Overlay */}
      <div className={`absolute inset-0 pointer-events-none ${theme.foil}`} />

      {/* Frozen Overlay */}
      {isFrozen && (
        <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 mb-2 animate-pulse">
            <Snowflake className="w-6 h-6" />
          </div>
          <span className="text-white font-bold tracking-wider text-sm uppercase">Card Frozen</span>
          <p className="text-blue-200/80 text-xs mt-1 max-w-[200px]">
            Transactions temporarily locked. Tap below to unfreeze.
          </p>
          {onFreezeToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFreezeToggle();
              }}
              className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-colors cursor-pointer"
            >
              Unfreeze Card
            </button>
          )}
        </div>
      )}

      {/* Top Row: Bank Brand + Contactless + Card Type Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center font-serif font-black text-slate-950 text-xs shadow-md">
            R
          </div>
          <div>
            <div className="font-serif font-bold text-xs tracking-wider uppercase text-white/90">
              Royal Bank
            </div>
            <div className="text-[9px] uppercase tracking-widest text-gold-300/80 font-mono">
              {card.type === 'virtual_prepaid'
                ? 'Digital Shield'
                : card.type === 'credit'
                ? 'Private Credit'
                : 'Sovereign Debit'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-white/70 rotate-90" />
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border tracking-wider uppercase ${theme.badge}`}
          >
            {card.type.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Middle Row: EMV Chip + Quick Reveal */}
      <div className="relative z-10 my-auto flex items-center justify-between">
        {/* Realistic EMV Chip */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 p-[1px] shadow-md">
            <div className="w-full h-full rounded-[5px] bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 grid grid-cols-2 grid-rows-2 gap-[1px] p-1 opacity-90">
              <div className="border border-amber-700/30 rounded-xs" />
              <div className="border border-amber-700/30 rounded-xs" />
              <div className="border border-amber-700/30 rounded-xs" />
              <div className="border border-amber-700/30 rounded-xs" />
            </div>
          </div>

          {card.cardLabel && (
            <span className="text-[11px] font-medium text-white/60 tracking-wide truncate max-w-[140px]">
              {card.cardLabel}
            </span>
          )}
        </div>

        {/* Action button to Reveal/Hide numbers */}
        {showDetailsToggle && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setRevealed(!revealed)}
              className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors cursor-pointer"
              title={revealed ? 'Hide card numbers' : 'Reveal card numbers'}
            >
              {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Copy card number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Card Number */}
      <div className="relative z-10 my-2">
        <div className="font-mono text-lg sm:text-xl font-bold tracking-[0.18em] text-white/95 drop-shadow-sm">
          {displayNumber}
        </div>
      </div>

      {/* Bottom Row: Cardholder, Expiry, CVV, Network */}
      <div className="relative z-10 flex items-end justify-between pt-1">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-white/50 font-medium">Cardholder</div>
          <div className="font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/90">
            {card.cardholderName}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/50 font-medium">Expires</div>
            <div className="font-mono text-xs font-semibold text-white/90">
              {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
            </div>
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/50 font-medium">CVV</div>
            <div className="font-mono text-xs font-semibold text-white/90">
              {displayCvv}
            </div>
          </div>

          <div className="text-right">
            <span className="font-serif italic font-black text-sm tracking-wide text-white/90">
              {card.network.includes('Visa') ? 'VISA' : card.network.includes('Mastercard') ? 'Mastercard' : 'ROYAL'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
