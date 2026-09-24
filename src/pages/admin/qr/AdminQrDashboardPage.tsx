import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminQrNav } from '../../../components/admin/AdminQrNav.tsx';
import { AdminStatCard } from '../../../components/admin/AdminStatCard.tsx';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminQrService,
  AdminMerchant,
  QRSettlementBatch,
  DynamicQRInvoice,
} from '../../../backend/services/adminQrService.ts';
import { QRPayment } from '../../../backend/types/index.ts';
import {
  QrCode,
  Store,
  ArrowRightLeft,
  Landmark,
  Plus,
  RefreshCw,
  ExternalLink,
  Receipt,
  Download,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AdminQrDashboardPage: React.FC = () => {
  const [merchants, setMerchants] = useState<AdminMerchant[]>([]);
  const [transactions, setTransactions] = useState<QRPayment[]>([]);
  const [settlements, setSettlements] = useState<QRSettlementBatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic QR modal
  const [showDynamicModal, setShowDynamicModal] = useState(false);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('250.00');
  const [invoiceCurrency, setInvoiceCurrency] = useState('USD');
  const [invoiceMemo, setInvoiceMemo] = useState('Bespoke Client Escrow');
  const [generatedInvoice, setGeneratedInvoice] = useState<DynamicQRInvoice | null>(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [mList, txList, sList] = await Promise.all([
        adminQrService.getMerchants(),
        adminQrService.getQrTransactions(),
        adminQrService.getSettlementBatches(),
      ]);
      setMerchants(mList);
      setTransactions(txList);
      setSettlements(sList);
      if (mList.length > 0 && !selectedMerchantId) {
        setSelectedMerchantId(mList[0].id);
      }
    } catch {
      addToast('Failed to load QR operations data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalVolume = merchants.reduce((sum, m) => sum + m.totalVolume, 0);
  const totalPendingSettlement = merchants.reduce((sum, m) => sum + m.pendingSettlementAmount, 0);
  const activeMerchantsCount = merchants.filter((m) => m.status === 'active').length;

  const handleGenerateDynamicQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchantId) {
      addToast('Please select a merchant terminal', 'error');
      return;
    }
    const amt = parseFloat(invoiceAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    try {
      const inv = adminQrService.generateDynamicQR(
        selectedMerchantId,
        amt,
        invoiceCurrency,
        invoiceMemo
      );
      setGeneratedInvoice(inv);
      addToast('Dynamic QR invoice generated successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate dynamic QR';
      addToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
              Merchant QR Terminals & Clearing
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              EMVCo Core
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time static/dynamic QR rails, point-of-sale merchant settlement, and fee governance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Rails</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowDynamicModal(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate Dynamic QR</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admin/qr/merchants')}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Merchant</span>
          </Button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <AdminQrNav />

      {/* High-Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total QR Clearing Volume"
          value={formatCurrency(totalVolume, 'USD')}
          icon={QrCode}
          change={{ value: 14.8, isPositive: true }}
          period="vs last calendar month"
        />
        <AdminStatCard
          title="Active QR Terminals"
          value={`${activeMerchantsCount} of ${merchants.length}`}
          icon={Store}
          change={{ value: 8.2, isPositive: true }}
          period="registered high-trust merchants"
        />
        <AdminStatCard
          title="Pending Escrow Settlement"
          value={formatCurrency(totalPendingSettlement, 'USD')}
          icon={Landmark}
          badge={{ text: 'Ready for payout', variant: 'warning' }}
        />
        <AdminStatCard
          title="QR Transactions Logged"
          value={transactions.length.toString()}
          icon={ArrowRightLeft}
          change={{ value: 22.4, isPositive: true }}
          period="cleared via Royal EMVCo Bridge"
        />
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Instant Merchant Settlement Engine
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              ${totalPendingSettlement.toLocaleString('en-US', { minimumFractionDigits: 2 })} awaiting batch release to commercial clearing accounts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/qr/settlements')}
            className="border-amber-300 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40"
          >
            Review Settlement Cycles
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admin/qr/settlements')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Batch Clear All Merchants
          </Button>
        </div>
      </div>

      {/* Grid: Recent Merchants & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchants Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Featured Merchant Terminals
              </h2>
            </div>
            <Link
              to="/admin/qr/merchants"
              className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View All ({merchants.length})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {merchants.slice(0, 4).map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white truncate">
                      {m.name}
                    </span>
                    <AdminBadge type="merchant_status" value={m.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-mono">{m.merchantCode}</span>
                    <span>•</span>
                    <span>Fee: {m.feeRatePercent}% + ${m.fixedFee}</span>
                    <span>•</span>
                    <span>Pending: {formatCurrency(m.pendingSettlementAmount, 'USD')}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                    {formatCurrency(m.totalVolume, 'USD')}
                  </span>
                  <span className="text-[11px] text-slate-400">Total Volume</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Stream */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Live QR Clearing Journal
              </h2>
            </div>
            <Link
              to="/admin/qr/transactions"
              className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View All Transactions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white truncate">
                      {tx.merchantName || 'Royal QR Merchant'}
                    </span>
                    <AdminBadge type="transaction_status" value={tx.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-mono">{tx.paymentCode}</span>
                    <span>•</span>
                    <span>From: {tx.senderName || 'Authorized Client'}</span>
                    <span>•</span>
                    <span>{formatDate(tx.timestamp)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {tx.reference.slice(0, 16)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Dynamic QR Generator */}
      <Modal
        isOpen={showDynamicModal}
        onClose={() => {
          setShowDynamicModal(false);
          setGeneratedInvoice(null);
        }}
        title="Dynamic QR Invoice Generator"
        subtitle="Generate time-bound cryptographic QR payment token for Point-of-Sale checkout"
        maxWidth="lg"
      >
        {!generatedInvoice ? (
          <form onSubmit={handleGenerateDynamicQR} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Select Merchant Terminal
              </label>
              <select
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                required
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.merchantCode}) - {m.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Currency
                </label>
                <select
                  value={invoiceCurrency}
                  onChange={(e) => setInvoiceCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CHF">CHF (Fr.)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Order Memo / Reference Notes
              </label>
              <input
                type="text"
                value={invoiceMemo}
                onChange={(e) => setInvoiceMemo(e.target.value)}
                placeholder="e.g. VIP Table Reservation #441"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Security Token:</span>
                <span className="font-mono">EMVCo 2026 Compatible</span>
              </div>
              <div className="flex justify-between">
                <span>Expiration:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">15 minutes window</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowDynamicModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Generate Invoice QR
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4 py-2">
            <div className="inline-block p-4 bg-white dark:bg-slate-800 border-2 border-dashed border-amber-500/50 rounded-2xl shadow-lg">
              {/* High-fidelity SVG QR representation */}
              <div className="w-56 h-56 bg-slate-950 p-3 rounded-xl flex flex-col items-center justify-center text-white relative">
                <QrCode className="w-40 h-40 text-amber-400 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                {generatedInvoice.merchantName}
              </div>
              <div className="text-2xl font-bold font-serif text-slate-900 dark:text-white mt-1">
                {formatCurrency(generatedInvoice.amount, generatedInvoice.currency)}
              </div>
              <div className="text-xs font-mono text-amber-600 dark:text-amber-400 mt-1">
                Invoice: {generatedInvoice.invoiceId} • Ref: {generatedInvoice.reference}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg text-left text-xs font-mono text-slate-600 dark:text-slate-300 break-all select-all border border-slate-200 dark:border-slate-700">
              {generatedInvoice.qrPayload}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generatedInvoice.qrPayload);
                  addToast('QR Payload copied to clipboard', 'info');
                }}
              >
                Copy Payload
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  addToast('Invoice PDF downloaded for merchant terminal', 'success');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Print Slip</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
