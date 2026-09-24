import React, { useEffect, useState } from 'react';
import { AdminCardNav } from '../../../components/admin/AdminCardNav.tsx';
import { AdminDataTable, Column } from '../../../components/admin/AdminDataTable.tsx';
import { AdminFilterBar } from '../../../components/admin/AdminFilterBar.tsx';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminCardService,
  AdminCardTransaction,
} from '../../../backend/services/adminCardService.ts';
import {
  CreditCard,
  Eye,
  ShieldAlert,
  Globe,
  Store,
  DollarSign,
  Download,
  AlertTriangle,
} from 'lucide-react';

export const AdminCardsTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<AdminCardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState<AdminCardTransaction | null>(null);

  const { addToast } = useToast();

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await adminCardService.getCardTransactions({
        search,
        status: statusFilter,
      });
      setTransactions(data);
    } catch {
      addToast('Error loading card authorizations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [search, statusFilter]);

  const columns: Column<AdminCardTransaction>[] = [
    {
      header: 'Authorization / Card',
      accessor: (t) => (
        <div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t.cardNumberMasked}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auth Code: {t.authCode} • {t.entryMethod || t.channel}
          </div>
        </div>
      ),
    },
    {
      header: 'Merchant & Location',
      accessor: (t) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-slate-200">
            {t.merchantName}
          </div>
          <div className="text-slate-500 mt-0.5">
            {t.city}, {t.country} • MCC: {t.mccCode}
          </div>
        </div>
      ),
    },
    {
      header: 'Cardholder',
      accessor: (t) => (
        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
          {t.customerName}
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (t) => (
        <div className="text-right">
          <div className="font-bold text-sm text-slate-900 dark:text-white">
            {formatCurrency(t.amount, t.currency)}
          </div>
          <div className="text-[11px] text-slate-400">
            Interchange: {formatCurrency(t.interchangeFee, 'USD')}
          </div>
        </div>
      ),
    },
    {
      header: 'Status & Time',
      accessor: (t) => (
        <div className="space-y-1">
          <div>
            <AdminBadge type="transaction_status" value={t.status} />
          </div>
          <div className="text-[11px] text-slate-500">
            {formatDate(t.timestamp)}
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (t) => (
        <div className="flex justify-end">
          <button
            onClick={() => setSelectedTx(t)}
            title="Inspect ISO 8583 Packet"
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
          Card Authorization & Clearing Stream
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Live point-of-sale, ATM cash dispensation and e-commerce 3DS payment logs
        </p>
      </div>

      <AdminCardNav />

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search merchant, cardholder, masked PAN, auth code..."
        filters={[
          {
            label: 'Auth Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Settled / Authorized', value: 'settled' },
              { label: 'Pending Auth', value: 'authorized' },
              { label: 'AML Flagged', value: 'flagged' },
              { label: 'Declined', value: 'declined' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
        }}
      />

      <AdminDataTable
        columns={columns}
        data={transactions}
        keyExtractor={(t) => t.id}
        isLoading={loading}
        emptyTitle="No card transactions found"
        emptyDescription="Transactions will populate as cardholders transact on global rails."
      />

      {/* ISO Details Modal */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Authorization Telemetry • ${selectedTx.authCode}`}
          subtitle="Visa / Mastercard ISO 8583 message details"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-500">Gross Authorization</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedTx.amount, selectedTx.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedTx.merchantName} ({selectedTx.city}, {selectedTx.country})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant Category Code (MCC):</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedTx.mccCode} ({selectedTx.mccCategory})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cardholder:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {selectedTx.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Card Instrument:</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {selectedTx.cardNumberMasked}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel / Entry Mode:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 uppercase">
                  {selectedTx.entryMethod || selectedTx.channel} (EMV Contactless Chip)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clearing Status:</span>
                <AdminBadge type="transaction_status" value={selectedTx.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatDate(selectedTx.timestamp)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTx(null)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  addToast('Exported ISO 8583 trace log', 'success');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Trace Log</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
