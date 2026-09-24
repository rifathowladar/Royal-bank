import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck2,
  Server,
  EyeOff,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { ASSET_PATHS } from '../../assets/index.ts';

export const SecurityPublicPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Institutional Zero-Trust Depository
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Cryptographic Safeguards for Sovereign Wealth.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every customer reserve is protected by FIPS 140-2 Level 3 Hardware Security Modules, end-to-end TLS 1.3 quantum-resistant encryption, and automated anomaly isolation.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-slate-900">
              <img
                src={ASSET_PATHS.vaultSecurity}
                alt="Titanium Depository Vault"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Hardware Security Modules (HSM)" subtitle="FIPS 140-2 Level 3">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Cryptographic keys for wire authorization and client ledger seals are generated, stored, and executed inside tamper-evident physical HSMs. Keys never exist in unencrypted RAM.
            </p>
            <div className="font-mono text-xs text-royal-600 dark:text-gold-400 font-bold">
              Physical Tamper-Proof
            </div>
          </Card>

          <Card title="Continuous Behavioral Surveillance" subtitle="AI Anomaly Mitigation">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Our automated surveillance engine screens outbound wires against OFAC, FATF, and international sanctions registries in under 20 milliseconds without human delay.
            </p>
            <div className="font-mono text-xs text-royal-600 dark:text-gold-400 font-bold">
              20ms Sanction Check
            </div>
          </Card>

          <Card title="Statutory Protection Schemes" subtitle="FDIC & FSCS Guarantees">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Client liquidity is insulated from institutional balance-sheet risk. Qualifying customer deposits enjoy statutory protection up to $250,000 USD (FDIC) and £85,000 GBP (FSCS).
            </p>
            <div className="font-mono text-xs text-royal-600 dark:text-gold-400 font-bold">
              Segregated Balance Sheet
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
