import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { billService } from '../../../backend/services/billService.ts';
import { BillPaymentRecord } from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  Receipt,
  Search,
  Filter,
  ArrowLeft,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building2,
} from 'lucide-react';

export const BillHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [history, setHistory] = useState<BillPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeReceipt, setActiveReceipt] = useState<BillPaymentRecord | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await billService.getBillHistory(user?.id);
      setHistory(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load bill history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const filtered = history.filter((r) => {
    const matchesSearch =
      r.billerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.accountReference.includes(searchQuery) ||
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || r.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  if (loading && history.length === 0) {
    return <LoadingState message="Loading payment history records..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bank/bills')}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-royal-600 dark:text-gold-400" />
              Bill Payment History & Audit Records
            </h1>
            <p className="text-xs text-slate-500">
              Official payment clearing receipts for tax deductions and utility verifications.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => success('Exported payment history CSV.')}
          className="flex items-center gap-1.5 text-xs"
        >
          <Download className="w-4 h-4" />
          Export Audit Ledger (.CSV)
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by biller, customer reference, or authorization code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="all">All Categories</option>
              <option value="Electricity">Electricity</option>
              <option value="Gas">Natural Gas</option>
              <option value="Water">Water & Sanitation</option>
              <option value="Internet">Internet</option>
              <option value="Telephone">Telephone</option>
              <option value="Education">Education</option>
              <option value="Insurance">Insurance</option>
              <option value="Government">Government & Tax</option>
              <option value="Credit card">Credit Card</option>
              <option value="Subscription">Subscriptions</option>
            </select>
          </div>
        </div>
      </Card>

      {/* History Table */}
      <Card className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No bill payment records matching your filter criteria.
          </div>
        ) : (
          filtered.map((record) => (
            <div
              key={record.id}
              onClick={() => setActiveReceipt(record)}
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-royal-50 dark:bg-royal-950/60 border border-royal-200 dark:border-royal-800 flex items-center justify-center text-royal-600 dark:text-gold-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {record.billerName}
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {record.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatDate(record.paymentDate)}</span>
                    <span>•</span>
                    <span className="font-mono">Ref: {record.accountReference}</span>
                    <span>•</span>
                    <span className="font-mono text-royal-600 dark:text-gold-400">Auth: {record.authCode}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                  -{formatCurrency(record.totalPaid)}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Cleared
                </div>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Official Receipt Modal */}
      {activeReceipt && (
        <Modal
          isOpen={!!activeReceipt}
          onClose={() => setActiveReceipt(null)}
          title="Official Bank Settlement Receipt"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Settled Amount</div>
              <div className="text-3xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
                {formatCurrency(activeReceipt.totalPaid)}
              </div>
              <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                Authorized & Cleared
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Biller Organization</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {activeReceipt.billerName}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Consumer Account / Meter</span>
                <span className="font-mono font-semibold">{activeReceipt.accountReference}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Payment Reference Number</span>
                <span className="font-mono font-semibold text-royal-600 dark:text-gold-400">
                  {activeReceipt.referenceNumber}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Interbank Auth Code</span>
                <span className="font-mono font-semibold">{activeReceipt.authCode}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Timestamp</span>
                <span>{new Date(activeReceipt.paymentDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Source Account</span>
                <span className="font-mono">{activeReceipt.sourceAccountNumber}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs">
                <Printer className="w-3.5 h-3.5" /> Print
              </Button>
              <Button variant="primary" onClick={() => setActiveReceipt(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
