import React from 'react';
import { TransferResult } from '../../backend/index.ts';
import { Button } from '../ui/Button.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { QRCodeView } from '../common/QRCodeView.tsx';
import {
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ArrowLeft,
  Share2,
} from 'lucide-react';

export interface TransferReceiptProps {
  result: TransferResult;
  onClose: () => void;
}

export const TransferReceipt: React.FC<TransferReceiptProps> = ({
  result,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textContent = `ROYAL BANK OF SOVEREIGN DEPOSITORY
INSTITUTIONAL TRANSACTION SETTLEMENT RECEIPT
==================================================
Reference Number: ${result.referenceNumber}
Transaction ID:   ${result.transactionId}
Execution Date:   ${new Date(result.timestamp).toUTCString()}
Status:           ${result.status.toUpperCase()}

SENDER DETAILS:
Account Holder:   ${result.sourceAccount.accountHolder}
Account Number:   ${result.sourceAccount.accountNumber}
Clearing Hub:     ${result.sourceAccount.branch}

BENEFICIARY DETAILS:
Recipient:        ${result.recipientName}
Account Number:   ${result.recipientAccount}
Receiving Bank:   ${result.recipientBank}

FINANCIAL SETTLEMENT:
Transfer Amount:  ${result.currency} ${result.amount.toFixed(2)}
Network Fee:      ${result.currency} ${result.fee.toFixed(2)}
Total Debited:    ${result.currency} ${(result.amount + result.fee).toFixed(2)}
Clearing Method:  ${result.transferType.toUpperCase()}
Note / Purpose:   ${result.referenceNote || 'N/A'}
==================================================
Cryptographically Sealed by Royal Bank Core Ledger.`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${result.referenceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const verificationPayload = `royalbank://verify?ref=${result.referenceNumber}&amt=${result.amount}&to=${encodeURIComponent(
    result.recipientName
  )}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top Controls (Hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="text-slate-600 dark:text-slate-400 text-xs"
        >
          Back to Transfers
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            icon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Export TXT
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Official Receipt Paper Canvas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg space-y-8 text-xs text-slate-900 dark:text-slate-100 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <BrandLogo />
            <p className="text-[11px] text-slate-500 mt-2">
              Royal Bank Global Clearing & Settlement Nexus
            </p>
            <p className="text-[10px] text-slate-400">
              Institutional Depository • Head Office NY & London Mayfair
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
              SETTLED & CONFIRMED
            </span>
            <div className="font-mono text-[11px] text-slate-500 pt-1">
              Doc Ref: {result.referenceNumber}
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Date: {new Date(result.timestamp).toUTCString()}
            </div>
          </div>
        </div>

        {/* Amount Highlight */}
        <div className="p-6 rounded-2xl bg-royal-950 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Transfer Settled</span>
            <div className="text-3xl font-extrabold font-mono text-gold-400">
              {result.currency} {result.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-300">
              Network Fee: {result.fee > 0 ? `${result.currency} ${result.fee.toFixed(2)}` : '$0.00 (Institutional Zero-Fee)'}
            </span>
          </div>

          {/* Verification Mini QR */}
          <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-xl border border-white/15">
            <QRCodeView value={verificationPayload} size={64} includeLogo={false} className="p-1 rounded-lg" />
            <div className="text-left text-[10px] text-slate-300">
              <strong className="block text-white font-mono">Scan to Verify</strong>
              <span>Digital Audit Hash</span>
            </div>
          </div>
        </div>

        {/* Participant Details Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          {/* Sender */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Originating Payer</span>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {result.sourceAccount.accountHolder}
            </div>
            <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
              Account: {result.sourceAccount.accountNumber}
            </div>
            <div className="text-[11px] text-slate-500">
              Originating Hub: {result.sourceAccount.branch}
            </div>
          </div>

          {/* Receiver */}
          <div className="space-y-1.5 sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-4">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Destination Payee</span>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {result.recipientName}
            </div>
            <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
              Account: {result.recipientAccount}
            </div>
            <div className="text-[11px] text-slate-500">
              Receiving Bank: {result.recipientBank}
            </div>
          </div>
        </div>

        {/* Itemized Audit Record */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
          <div className="py-2.5 flex justify-between font-sans">
            <span className="text-slate-500">Transaction ID</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{result.transactionId}</span>
          </div>

          <div className="py-2.5 flex justify-between font-sans">
            <span className="text-slate-500">Clearing Network</span>
            <span className="font-semibold text-slate-900 dark:text-white uppercase">
              {result.transferType.replace('_', ' ')}
            </span>
          </div>

          {result.referenceNote && (
            <div className="py-2.5 flex justify-between font-sans">
              <span className="text-slate-500">Remittance Purpose</span>
              <span className="text-slate-900 dark:text-white font-medium">{result.referenceNote}</span>
            </div>
          )}

          <div className="py-2.5 flex justify-between font-sans">
            <span className="text-slate-500">Execution Speed</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Immediate Real-Time Gross</span>
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-sans">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>FIPS 140-2 Cryptographic Ledger Signature Verified.</span>
          </div>
          <span className="font-mono">Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
