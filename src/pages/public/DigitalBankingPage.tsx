import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Laptop,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
  BellRing,
  QrCode,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { ASSET_PATHS } from '../../assets/index.ts';

export const DigitalBankingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Omni-Channel Architecture
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Banking at the Speed of Global Thought.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Native biometric authentication, real-time push settlement notifications, sub-second FX conversions, and cryptographic wire authorizations directly from your mobile smartphone or desktop workstation.
            </p>
            <div className="pt-2 flex gap-3">
              <Button variant="gold" onClick={() => navigate('/bank/login')}>
                Open Web Client
              </Button>
              <Button variant="outline" onClick={() => navigate('/bank/register')} className="text-white border-white/20">
                Register New Client
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-slate-900">
              <img
                src={ASSET_PATHS.digitalBanking}
                alt="Royal Bank Mobile Experience"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Biometric Security Sign-in" subtitle="FaceID & Hardware Passkeys">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Eliminate vulnerable passwords. Authenticate using device-level WebAuthn biometrics tied directly to secure enclave hardware.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono text-royal-600 dark:text-gold-400 font-bold">
              <Fingerprint className="w-4 h-4" />
              <span>FIDO2 / WebAuthn Certified</span>
            </div>
          </Card>

          <Card title="Instant Push Settlement Alerts" subtitle="Zero-Latency Notifications">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Receive millisecond push alerts on incoming SWIFT GPI wires, card swipes, foreign exchange shifts, and anomalous login attempts.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 font-bold">
              <Zap className="w-4 h-4" />
              <span>&lt; 50ms Push Dispatch</span>
            </div>
          </Card>

          <Card title="Interactive Dynamic QR Rails" subtitle="Sub-Second Terminal Scans">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Pay invoices or accept high-value merchant transfers by scanning dynamic EMVCo QR tokens with automatic currency conversion.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono text-royal-600 dark:text-gold-400 font-bold">
              <QrCode className="w-4 h-4" />
              <span>EMVCo Compliant</span>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
