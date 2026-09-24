import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileSpreadsheet,
  Terminal,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { Card } from '../../components/ui/Card.tsx';

export const BusinessBankingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Header */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Commercial & Corporate Treasury
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise Liquidity Rails for Global Commerce.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Consolidate multi-subsidiary cash management, automate high-volume supplier wires, and deploy real-time merchant payment clearing.
            </p>
            <div className="pt-2 flex gap-3">
              <Button variant="gold" onClick={() => navigate('/bank/register')}>
                Open Corporate Account
              </Button>
              <Button variant="outline" onClick={() => navigate('/contact')} className="text-white border-white/20">
                Inquire with Institutional Desk
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Features */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Multi-Entity Corporate Ledgers" subtitle="Hierarchical Cash Pooling">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Create sub-accounts for regional business units with custom access control lists (RBAC), multi-approval transaction thresholds, and instant internal transfers.
            </p>
            <div className="text-xs font-mono text-royal-600 dark:text-gold-400 font-bold">
              Multi-Tier Signatures
            </div>
          </Card>

          <Card title="Batch Payroll & Supplier Wires" subtitle="SWIFT GPI, Fedwire & SEPA">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Upload automated payroll CSV batches or connect ERP systems via REST API to disburse global vendor payments in seconds with guaranteed wholesale FX rates.
            </p>
            <div className="text-xs font-mono text-royal-600 dark:text-gold-400 font-bold">
              Up to 10,000 Wires / Batch
            </div>
          </Card>

          <Card title="Trade Finance & Letters of Credit" subtitle="Documentary Collections">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Back cross-border maritime shipments and complex equipment acquisitions with irrevocable Letters of Credit, performance bonds, and standby credit lines.
            </p>
            <div className="text-xs font-mono text-royal-600 dark:text-gold-400 font-bold">
              Global Port Acceptance
            </div>
          </Card>
        </div>
      </section>

      {/* API / Developer Section */}
      <section className="py-14 px-6 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs text-gold-400 font-mono">
              <Terminal className="w-4 h-4" />
              <span>Programmatic Banking API</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Connect Royal Bank Directly to Your Treasury ERP
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Generate OAuth API keys with granular scopes to automate balance inquiries, webhook event dispatches on incoming wires, and automated sweeping.
            </p>
            <div className="flex gap-2 text-xs pt-1">
              <span className="font-mono px-2 py-1 rounded bg-white/10 text-slate-300">RESTful JSON</span>
              <span className="font-mono px-2 py-1 rounded bg-white/10 text-slate-300">ISO 20022 XML</span>
              <span className="font-mono px-2 py-1 rounded bg-white/10 text-slate-300">mTLS & HMAC</span>
            </div>
          </div>

          <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <div className="text-slate-500">// Royal Bank API: Create Corporate Wire</div>
            <div className="text-emerald-400">POST https://api.royalbank.com/v2/wires/dispatch</div>
            <div className="text-gold-400">Authorization: Bearer sec_tok_8912b...</div>
            <div className="text-slate-400">{`{
  "sourceVault": "CORP-TREASURY-USD",
  "amount": 1500000.00,
  "currency": "EUR",
  "rail": "SWIFT_GPI",
  "beneficiaryIban": "CH9300762011623852957"
}`}</div>
          </div>
        </div>
      </section>
    </div>
  );
};
