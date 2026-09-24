import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/index.ts';
import {
  accountService,
  qrService,
  Account,
} from '../../../backend/index.ts';
import { QRCodeView } from '../../../components/common/QRCodeView.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  Sparkles,
  Sliders,
} from 'lucide-react';

export const MyQrPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [includeAmount, setIncludeAmount] = useState(false);
  const [amount, setAmount] = useState('500');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    accountService.getAccounts(user?.id || 'cust-001').then((accs) => {
      setAccounts(accs);
      if (accs.length > 0) setSelectedAccountId(accs[0].id);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <LoadingState type="card" message="Generating personal cryptographic QR..." />;
  }

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const { payload } = qrService.generateCustomerQR({
    customerId: user?.id || 'cust-001',
    accountId: selectedAccount?.id || 'acc-001',
    amount: includeAmount ? parseFloat(amount) || 0 : undefined,
    currency: selectedAccount?.currency,
    note: includeAmount && note ? note : undefined,
  });

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textContent = `ROYAL BANK CUSTOMER QR CREDENTIALS
==================================================
Account Holder: ${user?.firstName} ${user?.lastName}
Account Number: ${selectedAccount?.accountNumber}
Clearing Hub:   ${selectedAccount?.branch}
Currency:       ${selectedAccount?.currency}
${includeAmount ? `Fixed Amount:   ${selectedAccount?.currency} ${amount}` : 'Amount:         Dynamic / Payer Enters'}
${note ? `Purpose Note:   ${note}` : ''}
Payload URI:    ${payload}
==================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RoyalBank_QR_${user?.lastName}_${selectedAccount?.accountNumber.slice(-4)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bank/qr')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-600 dark:text-slate-400 text-xs"
          >
            Back to QR Hub
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            My Receiving QR Code
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          icon={<Download className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Download
        </Button>
      </div>

      {/* Main QR Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-6 relative overflow-hidden">
        {/* Top Insignia */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-royal-600 dark:text-gold-400 font-bold block">
            Royal Bank Sovereign Depository
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-xs font-mono text-slate-500">
            Account: {selectedAccount?.accountNumber}
          </p>
        </div>

        {/* Dynamic / Static QR Code View */}
        <div className="flex justify-center py-2">
          <QRCodeView value={payload} size={220} className="shadow-lg" />
        </div>

        {/* Dynamic Amount Banner if set */}
        {includeAmount && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-mono">
            <strong>Fixed Request:</strong> {selectedAccount?.currency} {parseFloat(amount).toLocaleString()}
            {note && <span className="block text-[11px] text-amber-700 dark:text-amber-300 font-sans mt-0.5">{note}</span>}
          </div>
        )}

        {/* Account Details & Branch */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center text-slate-600 dark:text-slate-400 font-mono">
          <span>Clearing Hub: {selectedAccount?.branch}</span>
          <span className="text-emerald-600 font-bold font-sans">Active & Verified</span>
        </div>

        {/* Copy Payload Button */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPayload}
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            className="flex-1 text-xs"
          >
            {copied ? 'Payload Copied!' : 'Copy QR Payload Link'}
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Royal Bank QR', url: payload });
              } else {
                handleCopyPayload();
              }
            }}
            icon={<Share2 className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Share
          </Button>
        </div>
      </div>

      {/* QR Settings & Dynamic Amount Customizer */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-royal-600 dark:text-gold-400" />
          QR Code Customizer & Presets
        </h3>

        <div className="space-y-3">
          {/* Target Account */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Receiving Ledger Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.customNickName || acc.name} (#{acc.accountNumber.slice(-4)}) — {acc.currency}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Preset Amount */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Set Pre-Defined Payment Amount
              </span>
              <span className="text-[11px] text-slate-500">
                Payer's phone will automatically lock to this amount when scanned
              </span>
            </div>
            <input
              type="checkbox"
              checked={includeAmount}
              onChange={(e) => setIncludeAmount(e.target.checked)}
              className="w-4 h-4 rounded text-royal-600 focus:ring-royal-500"
            />
          </div>

          {includeAmount && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Preset Amount ($)
                </label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Payment Note / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Consulting Invoice #102"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
