import React, { useEffect, useState } from 'react';
import { useAuth, useToast } from '../../hooks/index.ts';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { StatusIndicator } from '../../components/ui/StatusIndicator.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';
import {
  getCards,
  getLoans,
  getDeposits,
  getBeneficiaries,
  getBills,
  getNotifications,
  getSupportTickets,
  getQrPayments,
  Card as CardType,
  Loan,
  Deposit,
  Beneficiary,
  Bill,
  Notification,
  SupportTicket,
  QRPayment,
} from '../../backend/index.ts';
import {
  ArrowRight,
  Send,
  Plus,
  QrCode,
  CreditCard,
  Building,
  PiggyBank,
  Receipt,
  TrendingUp,
  Globe2,
  FileCheck2,
  ShieldCheck,
  Bell,
  HeadphonesIcon,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ModuleProps {
  moduleType:
    | 'transfers'
    | 'qr'
    | 'cards'
    | 'loans'
    | 'deposits'
    | 'bills'
    | 'investments'
    | 'remittance'
    | 'cheques'
    | 'profile'
    | 'security'
    | 'notifications'
    | 'support';
}

export const CustomerModulePage: React.FC<ModuleProps> = ({ moduleType }) => {
  const { user } = useAuth();
  const { success, info } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadData = async () => {
      switch (moduleType) {
        case 'cards':
          return await getCards(user?.id);
        case 'loans':
          return await getLoans(user?.id);
        case 'deposits':
          return await getDeposits(user?.id);
        case 'transfers':
        case 'remittance':
          return await getBeneficiaries(user?.id);
        case 'qr':
          return await getQrPayments(user?.id);
        case 'bills':
          return await getBills(user?.id);
        case 'notifications':
          return await getNotifications(user?.id);
        case 'support':
          return await getSupportTickets(user?.id);
        default:
          return [];
      }
    };

    loadData().then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [moduleType, user]);

  if (loading) {
    return <LoadingState type="table" message="Loading secure financial ledger records..." />;
  }

  // Render specific views based on module type
  if (moduleType === 'cards') {
    const cardsList: CardType[] = data || [];
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Payment Cards & Physical Metal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage physical Visa Infinite, virtual prepaid, and contactless security limits.
            </p>
          </div>
          <Button
            size="sm"
            variant="gold"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => success('Card Request', 'Virtual card request created instantly.')}
          >
            Issue Virtual Card
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cardsList.map((c) => (
            <Card
              key={c.id}
              className="bg-gradient-to-br from-royal-950 via-slate-900 to-royal-900 text-white border-royal-700/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gold-400 font-semibold">{c.network}</span>
                <StatusIndicator status={c.status} />
              </div>
              <p className="font-mono text-lg tracking-widest my-6 text-slate-200">
                {c.cardNumberMasked}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div>
                  <p className="text-[10px] uppercase">Cardholder</p>
                  <p className="font-semibold text-white">{c.cardholderName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase">Limit</p>
                  <p className="font-mono text-white">${c.spendingLimitMonthly.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Contactless: {c.isContactlessEnabled ? 'Active' : 'Off'}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10 text-xs py-1"
                  onClick={() => success('Security Updated', `Lock state toggled for ${c.cardNumberMasked}`)}
                >
                  Freeze Card
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (moduleType === 'transfers') {
    const beneficiaries: Beneficiary[] = data || [];
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transfers & Global Wires
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Execute real-time SWIFT wires, domestic ACH, and internal ledger transfers.
            </p>
          </div>
          <Button
            size="sm"
            variant="gold"
            icon={<Send className="w-4 h-4" />}
            onClick={() => info('New Transfer', 'Wire transfer modal will open in next prompt step.')}
          >
            Initiate New Wire
          </Button>
        </div>

        <Card title="Saved Beneficiaries & Routing Directory">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {beneficiaries.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{b.name}</p>
                  <p className="text-xs text-slate-500">
                    {b.bankName} · {b.accountNumber} · {b.routingOrSwift}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-medium">{b.currency}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => success('Wire Initiated', `Selected beneficiary: ${b.name}`)}
                  >
                    Send Funds
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (moduleType === 'qr') {
    const qrList: QRPayment[] = data || [];
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              QR Instant Payment Terminal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scan merchant terminal QR codes or generate custom peer-to-peer receipt codes.
            </p>
          </div>
          <Button
            size="sm"
            variant="gold"
            icon={<QrCode className="w-4 h-4" />}
            onClick={() => success('Scanner Active', 'Camera viewfinder ready for EMVCo QR code.')}
          >
            Launch Camera Scanner
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Personal Sovereign QR Code" subtitle="Share to receive instant funds">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                <QrCode className="w-40 h-40 text-slate-950" />
              </div>
              <p className="text-xs font-mono text-slate-500 mt-4">
                royalbank://pay?account=RB-984021&user=Alexander+Sterling
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => success('QR Exported', 'QR payload copied to clipboard.')}
              >
                Copy Payment Link
              </Button>
            </div>
          </Card>

          <Card title="Recent QR Merchant Settlements">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {qrList.map((q) => (
                <div key={q.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {q.merchantName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Ref: {q.reference} · {formatDate(q.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(q.amount, q.currency)}
                    </p>
                    <StatusIndicator status={q.status} className="justify-end" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (moduleType === 'loans') {
    const loansList: Loan[] = data || [];
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Credit Facilities & Mortgages
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active sovereign lending arrangements, amortizations, and prime rate schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loansList.map((l) => (
            <Card
              key={l.id}
              title={`${l.type === 'mortgage' ? 'Prime Residential Mortgage' : 'Commercial Growth Facility'}`}
              subtitle={`Loan ID: ${l.loanNumber}`}
              action={<StatusIndicator status={l.status} />}
            >
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-500">Remaining Balance</span>
                  <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(l.currentBalance, l.currency)}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Interest Rate</span>
                    <span className="font-mono font-semibold">{l.annualInterestRate}% Fixed</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Monthly Pmt</span>
                    <span className="font-mono font-semibold">{formatCurrency(l.monthlyInstallment, l.currency)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Remaining</span>
                    <span className="font-mono font-semibold">{l.remainingMonths} mos</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (moduleType === 'deposits') {
    const depositsList: Deposit[] = data || [];
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Term Fixed Deposits & Vault Notes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            High-yield certificates of deposit guaranteed under Royal Sovereign charter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {depositsList.map((d) => (
            <Card
              key={d.id}
              title={d.depositType}
              subtitle={`Certificate #${d.certificateNumber} · Matures: ${d.maturityDate}`}
              action={<StatusIndicator status={d.status} />}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-slate-500">Principal Deposit</span>
                    <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(d.principalAmount, d.currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Maturity Payout</span>
                    <p className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(d.maturityPayoutAmount, d.currency)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Guaranteed Yield</span>
                    <span className="font-mono font-semibold text-emerald-600">{d.interestRate}% APY</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Auto-Renew Option</span>
                    <span className="font-mono font-semibold">{d.autoRenew ? 'Active' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (moduleType === 'bills') {
    const billsList: Bill[] = data || [];
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bills & Recurring Utilities
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated standing orders, tax settlements, and municipal service accounts.
          </p>
        </div>

        <Card title="Scheduled & Pending Payables">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {billsList.map((b) => (
              <div key={b.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{b.billerName}</p>
                  <p className="text-xs text-slate-500">
                    Category: {b.billerCategory} · Due: {b.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">{formatCurrency(b.amountDue, b.currency)}</p>
                    <StatusIndicator status={b.status} className="justify-end" />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => success('Payment Executed', `Paid ${formatCurrency(b.amountDue, b.currency)} to ${b.billerName}`)}
                  >
                    Pay Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (moduleType === 'notifications') {
    const notifs: Notification[] = data || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Institutional Notifications & Notices
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Regulatory compliance bulletins, wire receipts, and security logs.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => success('Notices Cleared', 'All marked as read.')}>
            Mark All Read
          </Button>
        </div>

        <div className="space-y-3">
          {notifs.map((n) => (
            <Card key={n.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">· {formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (moduleType === 'security') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Security Architecture & Cryptographic Keys
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hardware security keys, biometric approval policies, and session logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Two-Factor Authentication (2FA)">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              FIPS 140-2 Level 3 compliance enabled. Hardware YubiKey and biometric passkeys configured for wire approval over $50,000.
            </p>
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Hardware 2FA Active
              </span>
              <span className="font-mono">Enforced</span>
            </div>
          </Card>

          <Card title="Active Cryptographic Session">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Authenticated ID</span>
                <span className="font-mono font-medium">{user?.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Device Fingerprint</span>
                <span className="font-mono font-medium">Apple WebKit / macOS 15.4</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Audit Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified Clean</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (moduleType === 'profile') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Client Profile & KYC Verification
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified identity records held securely under Swiss and US banking secrecy charters.
          </p>
        </div>

        <Card title="Verified Identification Record">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Full Legal Name</span>
              <span className="text-sm font-semibold">{user?.firstName} {user?.lastName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Customer Number</span>
              <span className="text-sm font-mono font-semibold">RB-984021</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Verified Email</span>
              <span className="text-sm font-mono">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">KYC Verification State</span>
              <StatusIndicator status="verified" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Generic fallback module
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
          {moduleType.replace(/-/g, ' ')} Module
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Royal Bank enterprise subsystem running on high-availability ledger sync.
        </p>
      </div>

      <Card title="Operational Status" subtitle="Ready for transaction parameters">
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} subsystem initialized.
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            This module is connected to the Royal Bank demo service layer and ready for feature implementation in upcoming milestone prompts.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => success('Subsystem Pinged', `${moduleType} ledger response: 200 OK`)}
          >
            Check Ledger Health
          </Button>
        </div>
      </Card>
    </div>
  );
};
