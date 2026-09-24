import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/index.ts';
import {
  accountService,
  qrService,
  Account,
  QRPayment,
  DemoQRCodeItem,
} from '../../../backend/index.ts';
import { QRCodeView } from '../../../components/common/QRCodeView.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import {
  QrCode,
  ScanLine,
  ArrowRight,
  History,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  User,
  Zap,
} from 'lucide-react';

export const QrHubPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [history, setHistory] = useState<QRPayment[]>([]);
  const [demoQrs, setDemoQrs] = useState<DemoQRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      accountService.getAccounts(user?.id || 'cust-001'),
      qrService.getQRHistory(user?.id || 'cust-001'),
    ]).then(([accs, hist]) => {
      setAccounts(accs);
      setHistory(hist);
      setDemoQrs(qrService.getDemoQRCodes());
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <LoadingState type="card" message="Loading QR clearing interface..." />;
  }

  const primaryAccount = accounts[0];
  const { payload } = qrService.generateCustomerQR({
    customerId: user?.id || 'cust-001',
    accountId: primaryAccount?.id || 'acc-001',
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              QR Instant Payment & Clearing
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-600 dark:text-gold-400 font-mono text-[10px] font-bold border border-gold-400/30">
              EMVCo Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan and pay any merchant or peer instantly, or present your personalized Royal Bank QR code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/bank/qr/history')}
            icon={<History className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            QR History
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/bank/qr/scan')}
            icon={<ScanLine className="w-3.5 h-3.5" />}
            className="text-xs font-bold shadow-md"
          >
            Scan Any QR
          </Button>
        </div>
      </div>

      {/* Main Two Hero Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Scan & Pay Hero */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-royal-950 via-slate-900 to-royal-950 text-white shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-gold-400">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400 font-bold block">
                Sub-Second Point-of-Sale Settlement
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Scan QR to Pay
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly settle invoices, dine at fine restaurants, or transfer funds to another Royal Bank customer by pointing your camera.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 relative z-10 flex gap-3">
            <Button
              variant="gold"
              onClick={() => navigate('/bank/qr/scan')}
              icon={<ScanLine className="w-4 h-4" />}
              className="flex-1 text-xs py-3"
            >
              Open Camera Scanner
            </Button>
          </div>
        </div>

        {/* Card 2: My QR Code Preview */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="flex justify-center shrink-0">
            <QRCodeView value={payload} size={150} />
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-royal-600 dark:text-gold-400 font-bold block">
                Receive Money Instantly
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                My Personalized QR
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {user?.firstName} {user?.lastName} • #{primaryAccount?.accountNumber.slice(-4)}
              </p>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Show this QR to any Royal Bank customer or mobile user to receive real-time deposits.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/bank/qr/my-qr')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="w-full sm:w-auto text-xs"
            >
              View Fullscreen / Set Amount
            </Button>
          </div>
        </div>
      </div>

      {/* Demo Test QR Codes (1-Click Test Scenarios) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Interactive Demo QR Codes (Click to Simulate Scan)
            </h3>
            <p className="text-xs text-slate-500">
              Click any customer or merchant card to instantly simulate decoding their QR and test real balance transfers:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {demoQrs.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/bank/qr/pay?payload=${encodeURIComponent(item.qrPayload)}`)}
              className="group p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-royal-500 dark:hover:border-gold-400 hover:shadow-md cursor-pointer transition-all space-y-3 bg-slate-50/50 dark:bg-slate-950/40"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-gold-400 flex items-center justify-center font-bold text-xs">
                  {item.avatarText}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {item.type}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-500 truncate">{item.subtitle}</p>
                <div className="font-mono text-[10px] text-slate-400 pt-1">
                  Acc: {item.accountOrCode}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-royal-950 dark:text-gold-400">
                  ${item.suggestedAmount?.toLocaleString()}
                </span>
                <span className="text-[10px] text-royal-600 dark:text-gold-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Simulate Pay <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent QR Transactions Mini-Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent QR Settlements
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bank/qr/history')}
            className="text-xs text-royal-600 dark:text-gold-400"
          >
            View All ({history.length})
          </Button>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No QR payments recorded yet. Scan a QR code above to make your first payment.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {history.slice(0, 5).map((q) => (
              <div key={q.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                    <QrCode className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {q.recipientName || q.merchantName}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {q.reference} • {new Date(q.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold font-mono text-slate-900 dark:text-white">
                    -${q.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">Completed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
