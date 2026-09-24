import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Landmark,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Coins,
  Globe,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { ASSET_PATHS } from '../../assets/index.ts';

export const PersonalBankingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Header */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Private Client Wealth & Checking
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Bespoke Banking for Discerning Individuals.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              From multi-currency reserve vaults to private jet concierge booking, Royal Bank redefines relationship banking for high-net-worth families and global professionals.
            </p>
            <div className="pt-2 flex gap-3">
              <Button variant="gold" onClick={() => navigate('/bank/register')}>
                Open Private Account
              </Button>
              <Button variant="outline" onClick={() => navigate('/cards')} className="text-white border-white/20">
                Explore Sovereign Cards
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-slate-900">
              <img
                src={ASSET_PATHS.digitalBanking}
                alt="Personal Banking Digital Experience"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Comprehensive Personal Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every facility is calibrated to maximize yield, streamline liquidity, and preserve sovereign family wealth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Multi-Currency Vault Accounts" subtitle="USD · EUR · GBP · CHF · SGD">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Hold and transact in 5 core reserve currencies simultaneously with local clearing rails, avoiding volatile spot conversions.
            </p>
            <ul className="text-xs space-y-2 text-slate-500">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold-500" /> Dedicated local IBAN and Sort Code</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold-500" /> Automatic cross-currency rebalancing</li>
            </ul>
          </Card>

          <Card title="High Yield Fixed Term Deposits" subtitle="Guaranteed Returns up to 5.25% APY">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Commit balances from 3 to 36 months with monthly compounding interest. Fully protected under national deposit guarantee programs.
            </p>
            <ul className="text-xs space-y-2 text-slate-500">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold-500" /> Early liquidation flexibility options</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold-500" /> Monthly interest auto-wire options</li>
            </ul>
          </Card>

          <Card title="Private Relationship Director" subtitle="Direct Telephone & WhatsApp Line">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Skip automated phone queues. Your appointed private banker executes wire batches, drafts documentary letters, and structures mortgages.
            </p>
            <ul className="text-xs space-y-2 text-slate-500">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold-500" /> Average callback under 3 minutes</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-gold-500" /> Bespoke lombard credit approvals</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Card Feature Banner */}
      <section className="py-14 px-6 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Complimentary Card Privilege
            </span>
            <h3 className="text-2xl font-bold text-white">
              The Royal Sovereign Metal Debit Card
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              18 grams of machined tungsten alloy. 0% FX fees worldwide. VIP LoungeKey passes at 1,400+ international airports.
            </p>
          </div>
          <Button variant="gold" onClick={() => navigate('/cards')}>
            View Card Features
          </Button>
        </div>
      </section>
    </div>
  );
};
