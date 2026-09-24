import React, { useState } from 'react';
import { Transaction } from '../../backend/index.ts';
import { Button } from '../ui/Button.tsx';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
} from 'lucide-react';

export interface TransferHistoryProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}

export const TransferHistory: React.FC<TransferHistoryProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Filter only transfer-related transactions
  const transferTxs = transactions.filter(
    (t) =>
      t.type === 'transfer_out' ||
      t.type === 'transfer_in' ||
      t.type === 'qr_payment' ||
      t.category === 'Transfer'
  );

  const filtered = transferTxs.filter((t) => {
    if (filterType === 'out' && t.type !== 'transfer_out') return false;
    if (filterType === 'in' && t.type !== 'transfer_in') return false;
    if (filterType === 'qr' && t.type !== 'qr_payment') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.counterpartyName.toLowerCase().includes(q) ||
        t.referenceNumber.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transfers by recipient, reference, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Transfers' },
            { id: 'out', label: 'Outbound' },
            { id: 'in', label: 'Inbound' },
            { id: 'qr', label: 'QR Clearing' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors text-[11px] ${
                filterType === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
          No transfers found matching your filters.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Date & Time</th>
                <th className="p-3.5 font-semibold">Reference</th>
                <th className="p-3.5 font-semibold">Recipient / Counterparty</th>
                <th className="p-3.5 font-semibold">Clearing Rail</th>
                <th className="p-3.5 font-semibold text-right">Amount</th>
                <th className="p-3.5 font-semibold text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filtered.map((tx) => {
                const isDebit = tx.amount < 0;
                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleDateString()}{' '}
                      <span className="text-[10px] text-slate-400 block sm:inline">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-500 truncate max-w-[120px]">
                      {tx.referenceNumber}
                    </td>

                    <td className="p-3.5 font-sans">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {tx.counterpartyName || tx.receiver || tx.description}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {tx.counterpartyAccount || 'Direct Clearing'}
                      </span>
                    </td>

                    <td className="p-3.5 font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {tx.paymentMethod || 'Wire Transfer'}
                      </span>
                    </td>

                    <td
                      className={`p-3.5 text-right font-bold text-sm ${
                        isDebit ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isDebit ? '-' : '+'}
                      {tx.currency} {Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(tx);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-royal-600 dark:text-gold-400"
                        title="View Record"
                      >
                        <FileText className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
