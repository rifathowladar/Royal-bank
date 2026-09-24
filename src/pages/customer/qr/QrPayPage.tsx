import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/index.ts';
import {
  accountService,
  qrService,
  Account,
  QRPayment,
  Transaction,
} from '../../../backend/index.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { QRCodeView } from '../../../components/common/QRCodeView.tsx';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  KeyRound,
  ArrowRight,
  Sparkles,
  Zap,
  Printer,
  Copy,
  Check,
} from 'lucide-react';

export const QrPayPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawPayload = searchParams.get('payload') || '';

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [loading, setLoading] = useState(true);

  // Recipient details decoded from QR
  const [recipient, setRecipient] = useState<{
    name: string;
    accountNumber: string;
    currency: string;
    suggestedAmount?: number;
    note?: string;
    isMerchant: boolean;
    tier: string;
    branch: string;
    verified: boolean;
    customerId?: string;
  } | null>(null);

  // Payment Form State
  const [amount, setAmount] = useState('1000');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  // 2FA / PIN Verification Modal
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Success Result State
  const [successData, setSuccessData] = useState<{
    payment: QRPayment;
    referenceNumber: string;
    timestamp: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const accs = await accountService.getAccounts(user?.id || 'cust-001');
        setAccounts(accs);
        if (accs.length > 0) setSelectedAccountId(accs[0].id);

        if (rawPayload) {
          const rec = await qrService.getQRRecipient(rawPayload);
          setRecipient(rec);
          if (rec.suggestedAmount) {
            setAmount(rec.suggestedAmount.toString());
          }
          if (rec.note) {
            setNote(rec.note);
          }
        } else {
          // Default fallback to Marcus Vance if no payload passed
          const rec = await qrService.getQRRecipient(
            'royalbank://pay?type=customer&cid=cust-003&name=Marcus+Vance&acc=3824-5018-1192&cur=USD&amt=1000'
          );
          setRecipient(rec);
          setAmount('1000');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user, rawPayload]);

  const sourceAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const parsedAmount = parseFloat(amount) || 0;

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (parsedAmount <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }

    if (!sourceAccount || sourceAccount.availableBalance < parsedAmount) {
      setFormError(
        `Insufficient funds. Available: ${sourceAccount?.currency} ${sourceAccount?.availableBalance.toLocaleString()}`
      );
      return;
    }

    setPinModalOpen(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setFormError('PIN must be 4 digits.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await qrService.confirmQRPayment({
        senderCustomerId: user?.id || 'cust-001',
        senderAccountId: sourceAccount.id,
        amount: parsedAmount,
        recipientName: recipient?.name || 'Verified Recipient',
        recipientAccountNumber: recipient?.accountNumber || '4820-9901-0000',
        recipientCustomerId: recipient?.customerId,
        isMerchant: recipient?.isMerchant,
        note: note || undefined,
      });

      setPinModalOpen(false);
      setSuccessData(res);
      // Refresh accounts in local state
      const updatedAccounts = await accountService.getAccounts(user?.id || 'cust-001');
      setAccounts(updatedAccounts);
    } catch (err: any) {
      setFormError(err?.message || 'Payment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (!successData) return;
    navigator.clipboard.writeText(successData.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <LoadingState type="card" message="Decoding recipient clearing credentials..." />;
  }

  // Success Screen
  if (successData) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4 space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50 dark:ring-emerald-950/30">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
              EMVCo Instant QR Clearance
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Payment Successful!
            </h2>
            <p className="text-xs text-slate-500">
              Funds have been transferred to {recipient?.name}.
            </p>
          </div>

          {/* Amount Badge */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-3xl font-extrabold font-mono text-royal-950 dark:text-gold-400">
              ${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-mono pt-1">
              <span>Ref: {successData.referenceNumber}</span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Recipient & Balance Breakdown */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-left">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Beneficiary</span>
              <span className="font-bold text-slate-900 dark:text-white">{recipient?.name}</span>
            </div>
            <div className="py-2.5 flex justify-between font-mono">
              <span className="text-slate-500 font-sans">Account Reference</span>
              <span className="text-slate-700 dark:text-slate-300">{recipient?.accountNumber}</span>
            </div>
            <div className="py-2.5 flex justify-between font-mono">
              <span className="text-slate-500 font-sans">Updated Sender Balance</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ${sourceAccount.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {note && (
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Note</span>
                <span className="text-slate-800 dark:text-slate-200">{note}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              icon={<Printer className="w-3.5 h-3.5" />}
              className="flex-1 text-xs"
            >
              Print Receipt
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate('/bank/dashboard')}
              className="flex-1 text-xs"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/bank/qr')}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="text-slate-600 dark:text-slate-400 text-xs"
        >
          Cancel
        </Button>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Confirm QR Payment
          </h1>
          <p className="text-xs text-slate-500">
            Verify recipient credentials and authorize instant debit.
          </p>
        </div>
      </div>

      <form onSubmit={handleReview} className="space-y-6">
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Verified Recipient Card */}
        {recipient && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Verified Recipient
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Active
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-gold-400 flex items-center justify-center font-bold text-base">
                {recipient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {recipient.name}
                </h3>
                <div className="font-mono text-xs text-slate-500">
                  Account: {recipient.accountNumber}
                </div>
                <div className="text-[10px] text-slate-400">
                  {recipient.tier} • {recipient.branch}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <label className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
            Payment Amount
          </label>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-slate-400">
              $
            </span>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-2xl font-mono font-extrabold text-slate-900 dark:text-white"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex gap-2">
            {[100, 250, 500, 1000, 2500].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v.toString())}
                className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                ${v}
              </button>
            ))}
          </div>

          {/* Source Account Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Funding Source Ledger
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.customNickName || acc.name} (#{acc.accountNumber.slice(-4)}) — Balance: $
                  {acc.availableBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Note / Reference
            </label>
            <input
              type="text"
              placeholder="e.g. Lunch split, Seed funding, Consultation"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Action Button */}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
          className="w-full text-xs font-bold py-3.5 shadow-md"
        >
          Review & Authorize Payment
        </Button>
      </form>

      {/* PIN Verification Modal */}
      <Modal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        title="Authorize Instant QR Payment"
        subtitle="Royal Bank EMVCo Cryptographic Protocol"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Transferring</span>
            <div className="text-2xl font-mono font-extrabold text-royal-950 dark:text-gold-400">
              ${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500">
              To: <strong>{recipient?.name}</strong> (#{recipient?.accountNumber})
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
            <div className="flex items-center justify-between">
              <label className="block text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                4-Digit Security PIN
              </label>
              <button
                type="button"
                onClick={() => setPin('1234')}
                className="text-[10px] text-royal-600 dark:text-gold-400 hover:underline font-mono"
              >
                Auto-Fill (1234)
              </button>
            </div>

            <input
              type="password"
              maxLength={4}
              required
              autoFocus
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-xl font-mono tracking-widest px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPinModalOpen(false)}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              isLoading={submitting}
              disabled={pin.length < 4}
              className="flex-1 text-xs font-bold"
            >
              Confirm & Pay
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
