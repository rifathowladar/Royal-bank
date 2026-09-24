import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Landmark,
  CreditCard,
  Building,
  Smartphone,
  QrCode,
  Lock,
  Globe2,
  TrendingUp,
  Percent,
  MapPin,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calculator,
  RefreshCw,
  Search,
  CheckCircle2,
  Coins,
  Shield,
  PhoneCall,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { ASSET_PATHS } from '../../assets/index.ts';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Exchange rate calculator state
  const [fxFrom, setFxFrom] = useState('USD');
  const [fxTo, setFxTo] = useState('EUR');
  const [fxAmount, setFxAmount] = useState('10000');

  const exchangeRates: Record<string, number> = {
    USD: 1.0,
    EUR: 0.9214,
    GBP: 0.7852,
    CHF: 0.8841,
    SGD: 1.3412,
    JPY: 154.2,
  };

  const calculateFx = () => {
    const fromRate = exchangeRates[fxFrom] || 1;
    const toRate = exchangeRates[fxTo] || 1;
    const numericAmount = parseFloat(fxAmount) || 0;
    const converted = (numericAmount / fromRate) * toRate;
    return converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Interest calculator state
  const [depositAmount, setDepositAmount] = useState('50000');
  const [depositTenure, setDepositTenure] = useState('12'); // months
  const depositRates: Record<string, number> = {
    '3': 4.15,
    '6': 4.65,
    '12': 5.25,
    '24': 5.0,
    '36': 4.85,
  };

  const calculateInterestEarned = () => {
    const principal = parseFloat(depositAmount) || 0;
    const rate = depositRates[depositTenure] || 5.25;
    const months = parseInt(depositTenure, 10);
    const interest = principal * (rate / 100) * (months / 12);
    return {
      rate,
      interest: interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      total: (principal + interest).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
  };

  // Branch/ATM Locator search state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'branch' | 'atm'>('all');

  const locations = [
    {
      id: 1,
      name: 'Mayfair Global Private Office',
      type: 'branch',
      city: 'London',
      address: '14 Berkeley Square, London W1J 6BQ, UK',
      hours: 'Mon-Fri 08:30 - 18:00',
      amenities: ['Safe Deposit Vaults', 'Private Wealth Advisory', '24/7 ATM Rail'],
    },
    {
      id: 2,
      name: 'Zurich Bahnhofstrasse Flagship',
      type: 'branch',
      city: 'Zurich',
      address: 'Bahnhofstrasse 45, 8001 Zürich, Switzerland',
      hours: 'Mon-Fri 08:30 - 17:30',
      amenities: ['Bullion Custody', 'Multi-Currency Cashier', '24/7 ATM Rail'],
    },
    {
      id: 3,
      name: 'Manhattan Financial District',
      type: 'branch',
      city: 'New York',
      address: '48 Wall Street, New York, NY 10005, USA',
      hours: 'Mon-Fri 09:00 - 18:00',
      amenities: ['Commercial Escrow Desk', 'Private Client Salon', 'ATM Rail'],
    },
    {
      id: 4,
      name: 'Marina Bay Financial Centre',
      type: 'branch',
      city: 'Singapore',
      address: '10 Marina Boulevard, Tower 2, Singapore 018983',
      hours: 'Mon-Fri 09:00 - 18:00',
      amenities: ['Asia-Pac Treasury Desk', 'Sovereign Wealth Office', 'ATM Rail'],
    },
    {
      id: 5,
      name: 'Geneva Rhone Depository ATM',
      type: 'atm',
      city: 'Geneva',
      address: 'Rue du Rhône 32, 1204 Genève, Switzerland',
      hours: '24 Hours / 7 Days',
      amenities: ['Multi-Currency Cash Dispense', 'Biometric NFC Access'],
    },
    {
      id: 6,
      name: 'Tokyo Marunouchi Terminal ATM',
      type: 'atm',
      city: 'Tokyo',
      address: '1-1 Marunouchi, Chiyoda-ku, Tokyo 100-0005',
      hours: '24 Hours / 7 Days',
      amenities: ['Multi-Currency Cash Dispense', 'NFC Contactless'],
    },
  ];

  const filteredLocations = locations.filter((loc) => {
    const matchesFilter = locationFilter === 'all' || loc.type === locationFilter;
    const matchesSearch =
      loc.name.toLowerCase().includes(locationQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(locationQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(locationQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Royal Bank safeguard multi-currency deposits?',
      a: 'Deposits are held in segregated, sovereign-tiered balance sheets adhering to Basel III liquidity coverage ratios. In addition, eligible deposits enjoy statutory protection including FDIC insurance up to $250,000 in the US and FSCS up to £85,000 in the UK.',
    },
    {
      q: 'What are the qualifying criteria for Private Client & Sovereign Tiers?',
      a: 'Private Client membership is extended to individuals and family offices maintaining combined liquid treasury balances exceeding $250,000 USD (or equivalent). Sovereign tier status is available by invitation to institutions with balances exceeding $1,000,000 USD.',
    },
    {
      q: 'Are cross-border wires executed over real-time settlement rails?',
      a: 'Yes. Royal Bank operates direct SWIFT GPI, Fedwire, CHAPS, and SEPA Instant rails. Over 94% of international transfers to G10 recipient banks are finalized and acknowledged within under 60 minutes.',
    },
    {
      q: 'How do the contactless QR payment rails work for private merchants?',
      a: 'Our QR rail generates dynamic, cryptographically signed EMVCo compliant payment tokens. Merchants receive sub-second confirmation with zero interchange surcharges and direct ledger settlement.',
    },
    {
      q: 'Can I issue physical metal cards and manage spending limits remotely?',
      a: 'Yes. All Private Client accounts include our brushed tungsten Royal Sovereign Metal Card with instant mobile card controls, zero foreign transaction markups, and one-tap biometric freeze features.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-royal-950 via-slate-900 to-royal-950 text-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Chartered International Depository & Custody</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
                The Sovereign Standard in Global Banking.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl text-balance">
                Royal Bank provides discerning clientele and enterprise stewards with multi-currency liquidity vaults, rapid cross-border SWIFT settlement, and institutional surveillance infrastructure.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  variant="gold"
                  onClick={() => navigate('/bank/register')}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Open Private Client Account
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/bank/login')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Client Sign In
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span>FDIC & FSCS Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-gold-400" />
                  <span>Basel III CET1: 18.4%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-400" />
                  <span>256-Bit HSM Vaults</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Image Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900 aspect-[16/10] group">
                <img
                  src={ASSET_PATHS.heroBanking}
                  alt="Royal Bank International Headquarters"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-royal-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">London Sovereign Exchange</span>
                    <span className="text-[11px] text-slate-300">Berkeley Square Headquarters</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-gold-300 font-bold">
                    <span>99.999% Uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BANKING OVERVIEW STATS */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums block">
              $48.2B+
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Custodial Assets Under Administration
            </span>
          </div>

          <div>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums block">
              18.4%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Tier 1 Common Equity (CET1) Ratio
            </span>
          </div>

          <div>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums block">
              &lt; 30 Mins
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Average G10 SWIFT GPI Settlement
            </span>
          </div>

          <div>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-gold-600 dark:text-gold-400 tabular-nums block">
              140+
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Jurisdictions Connected Directly
            </span>
          </div>
        </div>
      </section>

      {/* 3. PERSONAL BANKING */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
              Personal & Wealth Management
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Private Client Banking Tailored to Your Legacy
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the pinnacle of individualized wealth management. Each client receives a dedicated Private Banker in London, Zurich, or New York, with direct telephone access and bespoke credit facilities.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Multi-currency checking accounts across USD, EUR, GBP, CHF, and SGD</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Zero fee wire transfers worldwide with preferred wholesale exchange spreads</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Complimentary physical tungsten metal debit card with airport lounge access</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link to="/personal-banking">
                <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                  Explore Personal Banking
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <Landmark className="w-6 h-6 text-royal-600 dark:text-gold-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sovereign Vaults</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hold diverse liquidity reserves protected by segregated account structures.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <Coins className="w-6 h-6 text-royal-600 dark:text-gold-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">High Yield Deposits</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Lock in yields up to 5.25% APY with fixed term commitments and daily interest accrual.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <PhoneCall className="w-6 h-6 text-royal-600 dark:text-gold-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dedicated Banker</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Direct single-point-of-contact advisor handling transactions, loans, and foreign exchange.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <Shield className="w-6 h-6 text-royal-600 dark:text-gold-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Estate & Escrow</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Structured trust custody, multi-sig escrow, and generational asset transfer protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BUSINESS BANKING */}
      <section className="py-16 px-6 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
              Enterprise & Commercial Treasury
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Global Scale Treasury & Liquidity Architecture
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Equip your corporate enterprise with automated multi-entity ledgers, bulk batch payroll disbursement, and programmatic API access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Commercial Multi-Currency Ledgers" subtitle="Consolidate Global Cash Flow">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Receive client payments internationally via local account details in the US (ACH/Fedwire), UK (Sort Code), Europe (IBAN), and Singapore (FAST).
              </p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500 flex justify-between">
                <span>Local Rails</span>
                <span className="text-slate-900 dark:text-white font-medium">8 Instant Clearing Networks</span>
              </div>
            </Card>

            <Card title="Merchant Acquiring & QR Rail" subtitle="Sub-Second Terminal Settlements">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Deploy EMVCo QR codes across physical retail and digital storefronts with 0% interchange fees on Royal Bank client transactions.
              </p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500 flex justify-between">
                <span>Settlement Speed</span>
                <span className="text-emerald-600 font-medium">Instant Real-Time</span>
              </div>
            </Card>

            <Card title="Corporate Lending & Lines" subtitle="Flexible Working Capital Facilities">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Access structured revolving credit lines and syndicated trade finance backed by receivables and liquid securities portfolios.
              </p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500 flex justify-between">
                <span>Credit Limit</span>
                <span className="text-slate-900 dark:text-white font-medium">Up to $50,000,000</span>
              </div>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Link to="/business-banking">
              <Button variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                Explore Business Treasury
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. ACCOUNT PRODUCTS SHOWCASE */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
            Account Architecture
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Accounts Engineered for Global Sovereignty
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Choose the depository relationship suited to your wealth preservation requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: 'Premier Checking',
              type: 'Everyday Liquidity',
              rate: '1.75% APY',
              min: '$1,000 min balance',
              desc: 'Seamless day-to-day wires, contactless payments, and direct debit facilities.',
              badge: 'Most Popular',
            },
            {
              title: 'Multi-Currency Vault',
              type: 'G10 FX Ledgers',
              rate: 'Up to 3.50% APY',
              min: '$10,000 min balance',
              desc: 'Hold and convert 5 currencies instantly with zero foreign conversion markups.',
              badge: 'International',
            },
            {
              title: 'Fixed Yield Deposit',
              type: 'Capital Preservation',
              rate: '5.25% APY',
              min: '$25,000 min commitment',
              desc: 'Guaranteed maturity yield locked for 3 to 36 months, compounding monthly.',
              badge: 'Guaranteed',
            },
            {
              title: 'Sovereign Private Reserve',
              type: 'Custodial Wealth',
              rate: 'Custom Tiered',
              min: '$250,000 min balance',
              desc: 'Comprehensive wealth preservation with bespoke Lombard credit and concierge.',
              badge: 'By Invitation',
            },
          ].map((acc, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-gold-400/60 transition-all"
            >
              <div>
                <span className="text-[11px] font-semibold text-royal-600 dark:text-gold-400 uppercase tracking-wider">
                  {acc.type}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {acc.title}
                </h3>
                <div className="mt-4 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                    {acc.rate}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{acc.min}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {acc.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate('/bank/register')}
                >
                  Apply Online
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CARDS & METAL INFRASTRUCTURE */}
      <section className="py-16 px-6 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-slate-950">
              <img
                src={ASSET_PATHS.cardMetal}
                alt="Royal Sovereign Metal Card"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Payment Instruments
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              The Royal Sovereign Metal Card
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Crafted from 18-gram aerospace-grade tungsten alloy with laser-etched insignia. Delivered with comprehensive worldwide insurance, unlimited airport lounge access, and zero foreign transaction fees.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">Foreign Exchange Markup</span>
                <span className="font-mono text-base font-bold text-emerald-400">0.0% Exact Interbank</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">LoungeKey Access</span>
                <span className="font-mono text-base font-bold text-gold-300">1,400+ VIP Lounges</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">ATM Withdrawal Limit</span>
                <span className="font-mono text-base font-bold text-white">$10,000 / Day</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">Contactless & Biometric</span>
                <span className="font-mono text-base font-bold text-white">Apple Pay & Google Pay</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Link to="/cards">
                <Button variant="gold" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                  Compare Card Privileges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LOANS & CREDIT LINES */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
              Credit & Lending
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sovereign Real Estate & Lombard Credit
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Unlock purchasing power without divesting assets. Royal Bank provides prime residential mortgages across London, Geneva, and New York, alongside asset-backed Lombard facilities with competitive margin rates.
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-royal-100 dark:bg-royal-950 text-royal-600 dark:text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Prime Residential Mortgages</h4>
                  <p className="text-slate-500">Fixed and variable mortgages from 4.25% APR for luxury international properties.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-royal-100 dark:bg-royal-950 text-royal-600 dark:text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Lombard Portfolio Liquidity</h4>
                  <p className="text-slate-500">Draw credit against equities and fixed income holdings up to 75% loan-to-value.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/loans">
                <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                  View Lending Facilities
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <Calculator className="w-4 h-4 text-royal-600 dark:text-gold-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Simulate Fixed Term Deposit Yield
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Deposit Amount (USD)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Commitment Tenure</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.entries(depositRates).map(([tenure, rate]) => (
                    <button
                      key={tenure}
                      type="button"
                      onClick={() => setDepositTenure(tenure)}
                      className={`py-1.5 rounded-lg font-mono text-xs font-medium border transition-colors ${
                        depositTenure === tenure
                          ? 'bg-royal-600 text-white border-royal-600 dark:bg-gold-500 dark:text-slate-950 dark:border-gold-500 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tenure} Mo
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-royal-50/60 dark:bg-royal-950/40 border border-royal-200/60 dark:border-royal-900/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Contracted APY:</span>
                  <span className="font-mono font-bold text-royal-600 dark:text-gold-400 text-sm">
                    {calculateInterestEarned().rate}% APY
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Estimated Interest Yield:</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    +${calculateInterestEarned().interest}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-royal-200/40 dark:border-royal-900/40">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Total Maturity Payout:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                    ${calculateInterestEarned().total}
                  </span>
                </div>
              </div>

              <Button
                variant="gold"
                className="w-full text-xs"
                onClick={() => navigate('/bank/register')}
              >
                Lock In This Rate Today
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DIGITAL BANKING APPS */}
      <section className="py-16 px-6 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
              Digital Banking Architecture
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Instant Global Control in the Palm of Your Hand
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Engineered with responsive precision. The Royal Bank digital suite integrates real-time biometric FaceID logins, multi-currency sub-ledgers, instant contactless QR settlements, and continuous AML surveillance.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <Smartphone className="w-4 h-4 text-royal-600 dark:text-gold-400 mb-1.5" />
                <span className="font-bold text-slate-900 dark:text-white block">Mobile Banking App</span>
                <span className="text-slate-500 text-[11px]">Smartphone simulator with quick pay thumb nav.</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <Globe2 className="w-4 h-4 text-royal-600 dark:text-gold-400 mb-1.5" />
                <span className="font-bold text-slate-900 dark:text-white block">Client Web Terminal</span>
                <span className="text-slate-500 text-[11px]">Desktop dashboard for wire batches and vaults.</span>
              </div>
            </div>
            <div className="pt-2">
              <Link to="/digital-banking">
                <Button variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                  Explore Digital Features
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl aspect-[4/3] bg-slate-950">
              <img
                src={ASSET_PATHS.digitalBanking}
                alt="Digital Banking Mobile Interface"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 9. QR PAYMENTS RAIL */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-xs w-full text-center space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-royal-600/40 dark:border-gold-400/40 inline-block">
                <QrCode className="w-36 h-36 text-royal-900 dark:text-gold-400 mx-auto" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">Royal Pay Contactless Rail</span>
                <span className="text-slate-400 font-mono text-[11px]">EMVCo Dynamic Settlement</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-mono text-xs font-semibold text-emerald-600">Sub-second Payout Approved</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
              Next-Gen Rail
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Instant Contactless QR Payment Infrastructure
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Eliminate third-party interchange fees. Royal Bank QR enables direct consumer-to-merchant clearing without payment gateway markups. Scan invoices from mobile, settle instantly in any supported currency.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Zero Intermediary Fees</span>
                <span className="text-slate-500">Direct account-to-account settlement over private ledger.</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Cryptographic Receipts</span>
                <span className="text-slate-500">Every payment receives an immutable SHA-256 clearance seal.</span>
              </div>
            </div>
            <div className="pt-2">
              <Link to="/qr-payment">
                <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                  Learn About QR Rails
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SECURITY & VAULT INTEGRITY */}
      <section className="py-16 px-6 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Cryptographic Safeguards
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Institutional Zero-Trust Depository
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every customer reserve is guarded by Hardware Security Modules (FIPS 140-2 Level 3). We combine behavioral anomaly detection, automated AML screening, and biometric transaction signing.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AES-256 and RSA-4096 end-to-end data encryption across all nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Independent annual SOC 2 Type II and ISO/IEC 27001 certifications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 AI-driven fraud mitigation and suspicious wire isolation</span>
              </div>
            </div>
            <div className="pt-2">
              <Link to="/security">
                <Button variant="gold" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                  Read Security Whitepaper
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-slate-950">
              <img
                src={ASSET_PATHS.vaultSecurity}
                alt="Royal Bank Titanium Depository Vault"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 11. BENEFITS BENTO */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
            Client Advantages
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Why Discerning Clients Trust Royal Bank
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            A comprehensive suite of institutional benefits designed for modern global citizens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <Globe2 className="w-7 h-7 text-royal-600 dark:text-gold-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Seamless Cross-Border Mobility</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Open accounts across London, Zurich, and Singapore under a single unified master client identifier.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <ShieldCheck className="w-7 h-7 text-royal-600 dark:text-gold-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">100% Capital Solvency</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Unleveraged treasury assets and unmatched Basel III Tier 1 capital ratios ensuring complete depositor safety.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <Sparkles className="w-7 h-7 text-royal-600 dark:text-gold-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Global Lifestyle Concierge</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              24/7 access to private jet charters, art procurement advisory, and Michelin dining table reservations.
            </p>
          </div>
        </div>
      </section>

      {/* 12. LATEST OFFERS */}
      <section className="py-12 px-6 bg-gold-400/10 border-y border-gold-400/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-400 text-royal-950 flex items-center justify-center shrink-0 font-bold shadow-md">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gold-700 dark:text-gold-300 uppercase tracking-widest block">
                Exclusive Q3 Promotion
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                5.25% APY on 12-Month Fixed Term Deposits + Free Sovereign Metal Card
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Commit $25,000 or more before October 31, 2026 to lock in guaranteed interest yields with zero account fees.
              </p>
            </div>
          </div>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/bank/register')}
            className="shrink-0"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            Claim Promotional Yield
          </Button>
        </div>
      </section>

      {/* 13. LIVE EXCHANGE RATES & CONVERTER */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
            Real-Time FX Market
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            G10 Foreign Exchange & Converter
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Interbank mid-market exchange rates refreshed continuously with transparent wholesale spreads.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Rate Board */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Live Benchmark Rates (Base USD)</span>
              <span className="text-emerald-600 font-mono text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Market Feed
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {[
                { pair: 'EUR / USD', rate: '1.0853', change: '+0.12%', high: '1.0870', low: '1.0832' },
                { pair: 'GBP / USD', rate: '1.2735', change: '+0.24%', high: '1.2760', low: '1.2710' },
                { pair: 'USD / CHF', rate: '0.8841', change: '-0.08%', high: '0.8860', low: '0.8825' },
                { pair: 'USD / SGD', rate: '1.3412', change: '+0.05%', high: '1.3430', low: '1.3395' },
                { pair: 'USD / JPY', rate: '154.20', change: '-0.15%', high: '154.80', low: '153.90' },
              ].map((row, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between font-mono">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{row.pair}</span>
                  <span className="text-slate-900 dark:text-white font-medium">{row.rate}</span>
                  <span className={row.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}>
                    {row.change}
                  </span>
                  <span className="text-slate-400 hidden sm:inline">Range: {row.low} - {row.high}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive FX Converter */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Wholesale Currency Converter</span>
              <span className="text-[11px] text-slate-400 font-mono">Zero Fee</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Convert From</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={fxAmount}
                    onChange={(e) => setFxAmount(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-sm font-bold"
                  />
                  <select
                    value={fxFrom}
                    onChange={(e) => setFxFrom(e.target.value)}
                    className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-xs"
                  >
                    {Object.keys(exchangeRates).map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center my-1">
                <button
                  type="button"
                  onClick={() => {
                    const temp = fxFrom;
                    setFxFrom(fxTo);
                    setFxTo(temp);
                  }}
                  className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Converted To</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-royal-50/50 dark:bg-royal-950/30 border border-royal-200/50 dark:border-royal-900/50 rounded-xl px-3 py-2 font-mono text-sm font-bold text-royal-900 dark:text-gold-300 flex items-center">
                    {calculateFx()}
                  </div>
                  <select
                    value={fxTo}
                    onChange={(e) => setFxTo(e.target.value)}
                    className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-xs"
                  >
                    {Object.keys(exchangeRates).map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="gold"
                  className="w-full text-xs"
                  onClick={() => navigate('/bank/register')}
                >
                  Transfer at This Rate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14. BRANCH & ATM LOCATOR */}
      <section className="py-16 px-6 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
              International Presence
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Global Private Offices & Depository ATMs
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Locate physical wealth offices, safe deposit centers, and surcharge-free private ATMs across key financial centers.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by city, address, or branch name (e.g. London, Zurich, New York)..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-royal-600"
              />
            </div>

            <div className="flex gap-1.5 p-1 rounded-xl bg-slate-200 dark:bg-slate-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setLocationFilter('all')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  locationFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                All Locations
              </button>
              <button
                type="button"
                onClick={() => setLocationFilter('branch')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  locationFilter === 'branch'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Private Branches
              </button>
              <button
                type="button"
                onClick={() => setLocationFilter('atm')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  locationFilter === 'atm'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                ATMs
              </button>
            </div>
          </div>

          {/* Location Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs shadow-sm hover:border-royal-500 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm block">
                      {loc.name}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-500" /> {loc.city}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                    {loc.type}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-400">{loc.address}</p>

                <div className="flex items-center gap-1.5 text-slate-500 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{loc.hours}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                  {loc.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 text-slate-500"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
            Institutional Clarity
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Answers regarding regulatory compliance, capital safety, and account management.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 16. FINAL CTA BANNER */}
      <section className="py-20 px-6 bg-gradient-to-r from-royal-950 via-royal-900 to-royal-950 text-white text-center border-t border-slate-800">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Chartered Financial Institution #8912</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Protect and Compound Your Global Capital.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Open your Private Client multi-currency account online in under five minutes with expedited verification.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant="gold"
              onClick={() => navigate('/bank/register')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Open Account in 5 Minutes
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/contact')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Schedule Private Advisor Call
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
