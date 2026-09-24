import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Landmark,
  Globe2,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { Card } from '../../components/ui/Card.tsx';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Header */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Institutional Heritage & Governance
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              A Century of Uncompromising Custody & Financial Discretion.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Founded on principles of conservative balance sheet stewardship, Royal Bank International protects and compounds sovereign, corporate, and private family office capital across major financial hubs.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Unleveraged Solvency" subtitle="Basel III & Beyond">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              We maintain a Common Equity Tier 1 (CET1) capital ratio of 18.4%—more than double international regulatory minimums. Our balance sheet remains resilient against macroeconomic dislocations.
            </p>
            <div className="font-mono text-xs text-royal-600 dark:text-gold-400 font-bold">
              18.4% CET1 Ratio
            </div>
          </Card>

          <Card title="Jurisdictional Discretion" subtitle="Neutrality & Sovereignty">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Operating through charter nodes in London, Zurich, and Singapore allows clients to isolate counterparty risk and manage multi-currency reserves in gold-standard legal environments.
            </p>
            <div className="font-mono text-xs text-royal-600 dark:text-gold-400 font-bold">
              3 Sovereign Hubs
            </div>
          </Card>

          <Card title="Technological Sovereignty" subtitle="Cryptographic Architecture">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              We combine private ledger technology with FIPS 140-2 Level 3 hardware security modules, delivering sub-second international clearing without compromising privacy or auditability.
            </p>
            <div className="font-mono text-xs text-royal-600 dark:text-gold-400 font-bold">
              FIPS 140-2 Level 3
            </div>
          </Card>
        </div>
      </section>

      {/* Leadership & Oversight */}
      <section className="py-16 px-6 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
              Supervisory Board
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Executive Stewardship
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Guided by career central bankers, sovereign risk specialists, and cryptographic architects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Sir Charles Cavendish',
                role: 'Chairman of the Board',
                prev: 'Former Governor, Bank of International Settlements committee',
              },
              {
                name: 'Dr. Helene Vaudreuil',
                role: 'Chief Executive Officer',
                prev: 'Ex-Head of Fixed Income & Liquidity, Swiss National Banking Group',
              },
              {
                name: 'Marcus Sterling',
                role: 'Chief Risk & AML Officer',
                prev: 'Senior Advisor on Financial Crimes, Basel Committee Secretariat',
              },
              {
                name: 'Elena Rostova, Ph.D.',
                role: 'Chief Cryptographic Architect',
                prev: 'Specialist in Quantum-Resistant Key Exchange, Cambridge Security Lab',
              },
            ].map((exec, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-royal-50 dark:bg-royal-950 text-royal-700 dark:text-gold-400 flex items-center justify-center font-bold">
                  {exec.name[0]}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm pt-1">
                  {exec.name}
                </h3>
                <span className="text-royal-600 dark:text-gold-400 font-medium block">
                  {exec.role}
                </span>
                <p className="text-slate-500 leading-relaxed text-[11px] pt-1">
                  {exec.prev}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
          Partner with an Institution Built for Longevity
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mb-6">
          Schedule a private consultation at our London, Zurich, or New York offices.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="gold" onClick={() => navigate('/bank/register')}>
            Open Account
          </Button>
          <Button variant="outline" onClick={() => navigate('/contact')}>
            Contact Governors Desk
          </Button>
        </div>
      </section>
    </div>
  );
};
