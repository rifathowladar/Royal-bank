import React, { useState } from 'react';
import { Search, MapPin, ShieldCheck, CreditCard, Clock, Globe, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';

export const AtmLocatorPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('ALL');

  const atms = [
    {
      name: 'Mayfair Berkeley Square Terminal',
      address: '14 Berkeley Square, London W1J 6BQ',
      currencies: ['GBP', 'EUR', 'USD'],
      hours: '24 Hours / 7 Days',
      features: ['Contactless NFC', 'High-denomination cash dispense', 'Deposit envelope drops'],
      limit: 'Up to £10,000 / day',
    },
    {
      name: 'Heathrow Terminal 5 VIP Wing ATM',
      address: 'Heathrow Airport Terminal 5 First Class Lounge, London',
      currencies: ['GBP', 'EUR', 'USD', 'CHF'],
      hours: '24 Hours / 7 Days',
      features: ['Direct multi-currency cash', 'Biometric cardless withdrawal'],
      limit: 'Up to £10,000 / day',
    },
    {
      name: 'Zurich Bahnhofstrasse Kiosk',
      address: 'Bahnhofstrasse 45, 8001 Zürich',
      currencies: ['CHF', 'EUR', 'USD'],
      hours: '24 Hours / 7 Days',
      features: ['Swiss Franc 1,000 note dispense', 'NFC Apple Pay'],
      limit: 'Up to CHF 15,000 / day',
    },
    {
      name: 'Geneva Rue du Rhône Depository',
      address: 'Rue du Rhône 32, 1204 Genève',
      currencies: ['CHF', 'EUR'],
      hours: '24 Hours / 7 Days',
      features: ['Contactless NFC', 'Multi-lingual touch terminal'],
      limit: 'Up to CHF 10,000 / day',
    },
    {
      name: 'New York Wall Street Vault ATM',
      address: '48 Wall Street, Ground Concourse, New York, NY 10005',
      currencies: ['USD', 'EUR'],
      hours: '24 Hours / 7 Days',
      features: ['Crisp hundred-dollar note dispenser', 'Check scanner'],
      limit: 'Up to $10,000 / day',
    },
    {
      name: 'Singapore Marina Bay Financial Concourse',
      address: '10 Marina Boulevard, Tower 2 Lobby, Singapore 018983',
      currencies: ['SGD', 'USD', 'EUR'],
      hours: '24 Hours / 7 Days',
      features: ['NFC Pay', 'FAST settlement deposit'],
      limit: 'Up to SGD 15,000 / day',
    },
  ];

  const filteredAtms = atms.filter((atm) => {
    const matchesSearch =
      atm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atm.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCurrency =
      selectedCurrency === 'ALL' || atm.currencies.includes(selectedCurrency);
    return matchesSearch && matchesCurrency;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Cash & Liquidity Rail
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Global ATM Network & Multi-Currency Terminals.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Withdraw physical reserve currencies with zero foreign transaction fees using your Royal Sovereign Metal Card across our worldwide partner network.
            </p>
          </div>
        </div>
      </section>

      {/* Directory & Filters */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search ATM locations (e.g. Heathrow, Zurich, Wall Street)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-royal-600"
            />
          </div>

          <div className="flex gap-1.5 p-1 rounded-xl bg-slate-200 dark:bg-slate-800 w-full sm:w-auto">
            {['ALL', 'USD', 'EUR', 'GBP', 'CHF', 'SGD'].map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setSelectedCurrency(curr)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  selectedCurrency === curr
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* ATM Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAtms.map((atm, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {atm.name}
                </h3>
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
              </div>

              <p className="text-xs text-slate-500">{atm.address}</p>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{atm.hours}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Available Currencies:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {atm.currencies.join(' · ')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Daily Withdrawal:</span>
                  <span className="font-mono font-semibold text-emerald-600">
                    {atm.limit}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {atm.features.map((f, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
