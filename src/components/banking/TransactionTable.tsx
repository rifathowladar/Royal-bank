import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';
import { Transaction } from '../../backend/types/index.ts';
import { Button } from '../ui/Button.tsx';
import { TransactionDetails } from './TransactionDetails.tsx';

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectTransaction?: (tx: Transaction) => void;
  isLoading?: boolean;
  showFilters?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onSelectTransaction,
  isLoading = false,
  showFilters = true,
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.counterpartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || tx.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesType =
      selectedType === 'all' || tx.type === selectedType;
    const matchesStatus =
      selectedStatus === 'all' || tx.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsDetailsOpen(true);
    if (onSelectTransaction) onSelectTransaction(tx);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Method', 'Reference', 'Status', 'Amount', 'Currency'];
    const rows = filtered.map((tx) => [
      new Date(tx.timestamp).toISOString(),
      `"${tx.description}"`,
      tx.category,
      tx.paymentMethod || 'Wire',
      tx.referenceNumber,
      tx.status,
      tx.amount,
      tx.currency,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `royal_bank_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by counterparty, reference, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-royal-600 dark:focus:ring-gold-400"
              />
            </div>

            {/* Quick Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              icon={<Download className="w-3.5 h-3.5" />}
              className="text-xs shrink-0 w-full md:w-auto"
            >
              Export CSV
            </Button>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Categories</option>
                <option value="Salary">Salary</option>
                <option value="Investment">Investment</option>
                <option value="Transfer">Transfer</option>
                <option value="Travel">Travel</option>
                <option value="Dining">Dining</option>
                <option value="Utilities">Utilities</option>
                <option value="Banking">Banking</option>
              </select>
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Types</option>
                <option value="transfer_in">Credits (Inbound)</option>
                <option value="transfer_out">Debits (Outbound)</option>
                <option value="card_purchase">Card Purchase</option>
                <option value="qr_payment">QR Clearing</option>
                <option value="bill_payment">Bill Payment</option>
                <option value="interest">Interest Yield</option>
                <option value="dps_installment">DPS Installment</option>
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Date & Time</th>
                <th className="py-3.5 px-5 font-semibold">Description / Counterparty</th>
                <th className="py-3.5 px-5 font-semibold">Category</th>
                <th className="py-3.5 px-5 font-semibold">Rail / Method</th>
                <th className="py-3.5 px-5 font-semibold">Status</th>
                <th className="py-3.5 px-5 font-semibold text-right">Amount</th>
                <th className="py-3.5 px-5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => handleRowClick(tx)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <div>{new Date(tx.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate">
                          {tx.counterpartyName || tx.description}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {tx.referenceNumber}
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                          {tx.category}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-slate-500 whitespace-nowrap">
                        {tx.paymentMethod || 'Wire'}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        {tx.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Settled
                          </span>
                        )}
                        {(tx.status === 'pending' || tx.status === 'processing') && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="w-3 h-3" /> Processing
                          </span>
                        )}
                        {tx.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                            <AlertCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            isCredit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-white'
                          }
                        >
                          {isCredit ? '+' : ''}
                          {tx.currency}{' '}
                          {Math.abs(tx.amount).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(tx);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-royal-600 dark:hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
};
