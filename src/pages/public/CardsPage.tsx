import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Plane,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  Eye,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { ASSET_PATHS } from '../../assets/index.ts';

export const CardsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Header */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Sovereign Payment Instruments
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Machined Tungsten. Zero Foreign Transaction Fees.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Issued in heavy metal alloy and backed by Visa Infinite Privilege and Mastercard World Elite networks. Experience effortless purchasing power across 200+ countries.
            </p>
            <div className="pt-2 flex gap-3">
              <Button variant="gold" onClick={() => navigate('/bank/register')}>
                Order Sovereign Card
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-slate-900">
              <img
                src={ASSET_PATHS.cardMetal}
                alt="Royal Sovereign Metal Card"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Card Lineup */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              tier: 'Royal Classic',
              material: 'Recycled Ocean Plastic (5g)',
              annualFee: '$0',
              limit: '$5,000 / day',
              fx: '0.25% wholesale spread',
              lounge: 'Standard pay-per-entry',
              bestFor: 'Everyday accounts',
            },
            {
              tier: 'Royal Sovereign Metal',
              material: 'Laser-Etched Tungsten (18g)',
              annualFee: 'Complimentary with $25k balance',
              limit: '$25,000 / day',
              fx: '0.0% Exact mid-market',
              lounge: 'Unlimited LoungeKey Pass',
              bestFor: 'Private Clients',
              highlight: true,
            },
            {
              tier: 'Imperial Obsidian Privilege',
              material: 'Aerospace Titanium & Diamond Chip',
              annualFee: 'By Invitation Only',
              limit: '$100,000 / day',
              fx: '0.0% Exact mid-market',
              lounge: 'Private VIP Terminals & Tarmac escort',
              bestFor: 'Sovereign Treasury Tiers',
            },
          ].map((c, i) => (
            <div
              key={i}
              className={`p-6 rounded-3xl border flex flex-col justify-between ${
                c.highlight
                  ? 'bg-royal-950 text-white border-gold-400/60 shadow-xl'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                  c.highlight ? 'text-gold-400' : 'text-royal-600 dark:text-gold-400'
                }`}>
                  {c.bestFor}
                </span>
                <h3 className="text-xl font-bold mt-1">{c.tier}</h3>
                <p className={`text-xs mt-1 ${c.highlight ? 'text-slate-300' : 'text-slate-500'}`}>
                  {c.material}
                </p>

                <div className={`my-5 p-4 rounded-2xl border text-xs space-y-2 ${
                  c.highlight
                    ? 'bg-white/5 border-white/10 text-slate-200'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                }`}>
                  <div className="flex justify-between">
                    <span className="opacity-70">Annual Cost</span>
                    <span className="font-semibold">{c.annualFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Daily Limit</span>
                    <span className="font-mono font-semibold">{c.limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">FX Markup</span>
                    <span className="font-mono font-semibold">{c.fx}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Lounge Access</span>
                    <span className="font-semibold">{c.lounge}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/20">
                <Button
                  variant={c.highlight ? 'gold' : 'outline'}
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate('/bank/register')}
                >
                  Apply for Card
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
