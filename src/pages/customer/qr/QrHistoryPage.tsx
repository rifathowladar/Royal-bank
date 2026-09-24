import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/index.ts';
import {
  qrService,
  QRPayment,
} from '../../../backend/index.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import {
  ArrowLeft,
  Search,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  ScanLine,
  Printer,
  CheckCircle2,
} from 'lucide-react';

export const QrHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState<QRPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Selected for Receipt Modal
  const [selectedPayment, setSelectedPayment] = useState<QRPayment | null>(null);

  useEffect(() => {
    qrService.getQRHistory(user?.id || 'cust-001').then((res) => {
      setHistory(res);
      setLoading(false);
    });
  }, [user]);

  const filtered = history.filter((p) => {
    const isSender = p.customerId === (user?.id || 'cust-001');
    if (filterType === 'sent' && !isSender) return false;
    if (filterType === 'received' && isSender) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.reference.toLowerCase().includes(q) ||
        (p.recipientName && p.recipientName.toLowerCase().includes(q)) ||
        (p.senderName && p.senderName.toLowerCase().includes(q)) ||
        (p.merchantName && p.merchantName.toLowerCase().includes(q)) ||
        (p.note && p.note.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (loading) {
    return <LoadingState type="table" message="Loading EMVCo QR transaction log..." />;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bank/qr')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-600 dark:text-slate-400 text-xs"
          >
            QR Hub
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              QR Settlement History
            </h1>
            <p className="text-xs text-slate-500">
              Audit log of Point-of-Sale, peer-to-peer, and merchant QR transactions.
            </p>
          </div>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => navigate('/bank/qr/scan')}
          icon={<ScanLine className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Scan QR Code
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by counterparty, reference number, or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
          {[
            { id: 'all', label: 'All QR Clearings' },
            { id: 'sent', label: 'Sent' },
            { id: 'received', label: 'Received' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap text-xs transition-colors ${
                filterType === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs text-xs">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            No QR payments found matching your filter criteria.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Date & Time</th>
                <th className="p-4 font-semibold">Reference</th>
                <th className="p-4 font-semibold">Counterparty</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filtered.map((item) => {
                const isDebit = item.customerId === (user?.id || 'cust-001');
                const counterparty = isDebit
                  ? item.recipientName || item.merchantName
                  : item.senderName || 'Peer Depositor';

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedPayment(item)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleDateString()}{' '}
                      <span className="text-[10px] text-slate-400 block sm:inline">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      {item.reference}
                    </td>

                    <td className="p-4 font-sans">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {counterparty}
                      </div>
                      {item.note && (
                        <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                          {item.note}
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.recipientType}
                      </span>
                    </td>

                    <td
                      className={`p-4 text-right font-bold text-sm ${
                        isDebit ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isDebit ? '-' : '+'}${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayment(item);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-royal-600 dark:text-gold-400"
                      >
                        <FileText className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title="QR Transaction Record"
          subtitle="EMVCo Cryptographic Audit Entry"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-2xl bg-royal-950 text-white text-center space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400 font-bold block">
                Total Cleared
              </span>
              <div className="text-3xl font-mono font-extrabold text-white">
                ${selectedPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] font-mono text-slate-300">
                Ref: {selectedPayment.reference}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Recipient / Counterparty</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedPayment.recipientName || selectedPayment.merchantName}
                </span>
              </div>

              <div className="py-2.5 flex justify-between font-mono">
                <span className="text-slate-500 font-sans">Account Reference</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {selectedPayment.recipientAccountNumber || 'Merchant Register'}
                </span>
              </div>

              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Originating Payer</span>
                <span className="text-slate-900 dark:text-white">
                  {selectedPayment.senderName || 'Alexander Sterling'}
                </span>
              </div>

              <div className="py-2.5 flex justify-between font-mono">
                <span className="text-slate-500 font-sans">Timestamp</span>
                <span>{new Date(selectedPayment.timestamp).toUTCString()}</span>
              </div>

              {selectedPayment.note && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Note</span>
                  <span className="text-slate-900 dark:text-white">{selectedPayment.note}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                icon={<Printer className="w-3.5 h-3.5" />}
                className="flex-1 text-xs"
              >
                Print Slip
              </Button>
              <Button
                variant="gold"
                onClick={() => setSelectedPayment(null)}
                className="flex-1 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
