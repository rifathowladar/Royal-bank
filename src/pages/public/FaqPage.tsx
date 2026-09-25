import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { useNavigate } from 'react-router-dom';

export const FaqPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const navigate = useNavigate();

  const faqItems = [
    {
      category: 'ACCOUNTS',
      q: 'What is the minimum balance required to maintain a Private Client account?',
      a: 'Premier checking accounts require a minimum balance of $1,000 USD to waive standard maintenance fees. Private Client sovereign status and dedicated relationship manager services commence at combined balance commitments of $250,000 USD or equivalent.',
    },
    {
      category: 'ACCOUNTS',
      q: 'Which reserve currencies can I hold within my Multi-Currency Ledger?',
      a: 'Royal Bank accounts provide unified sub-ledgers in US Dollars (USD), Euros (EUR), British Pounds (GBP), Swiss Francs (CHF), and Singapore Dollars (SGD). You can convert funds instantaneously at wholesale interbank rates.',
    },
    {
      category: 'SECURITY',
      q: 'How are customer balances managed in this banking system?',
      a: 'This interface is an educational portfolio demonstration. All balances, accounts, and transactions are simulated in local client storage and memory. No real currency is accepted, held, or transferred.',
    },
    {
      category: 'SECURITY',
      q: 'What cryptographic protocols protect client wire transfers?',
      a: 'All wire approvals require dual-factor cryptographic token authorization backed by FIPS 140-2 Level 3 Hardware Security Modules (HSMs). Sessions utilize TLS 1.3 encryption with strict Perfect Forward Secrecy.',
    },
    {
      category: 'TRANSFERS',
      q: 'What are the cutoff times and execution speeds for international SWIFT wires?',
      a: 'SWIFT GPI transfers are processed continuously 24/7/365. Over 94% of transfers routed to Tier-1 financial institutions across Europe, the Americas, and Asia are credited within 30 minutes with real-time tracking hashes.',
    },
    {
      category: 'TRANSFERS',
      q: 'Are there transfer limits on sovereign wire transfers?',
      a: 'Standard online retail limits are set at $100,000 per transaction. Private Client accounts can execute unlimited transfers through our dedicated relationship desk with voice or biometric verification.',
    },
    {
      category: 'CARDS',
      q: 'Does the Royal Sovereign Metal Card carry foreign transaction fees?',
      a: 'No. Royal Sovereign Metal cards feature 0.0% foreign transaction markups worldwide. Purchases in any international currency are converted at the exact mid-market interbank rate without hidden surcharges.',
    },
    {
      category: 'CARDS',
      q: 'What airport lounge privileges are included with the metal card?',
      a: 'Private Client metal cards include complimentary, unlimited access to over 1,400 VIP airport lounges worldwide through LoungeKey, along with guest passes and travel delay compensation guarantees.',
    },
  ];

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Institutional Knowledge Base
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Frequently Asked Questions & Advisory.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Find detailed explanations regarding capital safety, regulatory compliance, foreign exchange clearing, and card privileges.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Search & Accordions */}
      <section className="py-16 px-6 max-w-4xl mx-auto w-full">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search questions (e.g. deposit insurance, wire limits, metal cards)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-royal-600 shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['ALL', 'ACCOUNTS', 'SECURITY', 'TRANSFERS', 'CARDS'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-royal-600 dark:bg-gold-500 text-white dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-royal-600 dark:text-gold-400 font-bold">
                      {faq.category}
                    </span>
                    <span>{faq.q}</span>
                  </span>
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

        {/* Still have questions card */}
        <div className="mt-12 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-royal-600 dark:text-gold-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Have a Bespoke Institutional Requirement?
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Our Private Banking and Regulatory Advisory teams are available for direct private briefings.
          </p>
          <div className="pt-2">
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate('/contact')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              Contact Advisory Desk
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
