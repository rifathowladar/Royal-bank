import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, ArrowRight, ShieldCheck, CheckCircle2, Zap, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';

export const QrPaymentPublicPage: React.FC = () => {
  const [amount, setAmount] = useState('250.00');
  const [currency, setCurrency] = useState('USD');
  const [merchantName, setMerchantName] = useState('Mayfair Sovereign Club');
  const [simulatedPaid, setSimulatedPaid] = useState(false);
  const navigate = useNavigate();

  const handleSimulatePayment = () => {
    setSimulatedPaid(true);
    setTimeout(() => setSimulatedPaid(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Next-Gen Contactless Rails
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Direct Account-to-Account QR Clearing.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Bypass 3% card interchange fees. Royal Bank QR enables merchants and private clients to generate signed EMVCo QR payment tokens with instant ledger settlement.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive QR Demo */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-royal-600 dark:text-gold-400">
              Interactive Prototype
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Experience Sub-Second Contactless QR Settlements
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Test how a merchant generates an invoice QR code, and how a client scans to authorize instant clearance from their sovereign vault.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Invoice Value</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-sm font-bold"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-xs"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Receiving Merchant / Entity</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="gold"
                  className="w-full text-xs"
                  onClick={handleSimulatePayment}
                  icon={<Zap className="w-4 h-4" />}
                >
                  Simulate Client Scan & Settle
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-sm w-full text-center space-y-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-royal-600/40 dark:border-gold-400/40 inline-block relative">
                <QrCode className="w-48 h-48 text-royal-950 dark:text-gold-400 mx-auto" />
                {simulatedPaid && (
                  <div className="absolute inset-0 bg-emerald-600/90 rounded-2xl flex flex-col items-center justify-center text-white backdrop-blur-sm animate-in fade-in">
                    <CheckCircle2 className="w-12 h-12 mb-2" />
                    <span className="font-bold text-sm">Settlement Finalized</span>
                    <span className="font-mono text-xs text-emerald-100">
                      {currency} {amount} Transferred
                    </span>
                  </div>
                )}
              </div>

              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  {merchantName}
                </span>
                <span className="font-mono text-slate-500 text-[11px] block mt-0.5">
                  Amount Due: <span className="font-bold text-slate-900 dark:text-white">{currency} {amount}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  EMVCo Payload: RB-QR-990214-SHA256
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
