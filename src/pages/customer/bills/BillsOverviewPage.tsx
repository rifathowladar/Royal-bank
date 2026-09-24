import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { billService } from '../../../backend/services/billService.ts';
import {
  Biller,
  SavedBiller,
  BillPaymentRecord,
  Bill,
  BillCategory,
} from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  Zap,
  Flame,
  Droplets,
  Wifi,
  Phone,
  GraduationCap,
  Shield,
  Landmark,
  CreditCard,
  Tv,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  BookmarkCheck,
  History,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const BillsOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [billers, setBillers] = useState<Biller[]>([]);
  const [savedBillers, setSavedBillers] = useState<SavedBiller[]>([]);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [recentPayments, setRecentPayments] = useState<BillPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const categories: Array<{ id: BillCategory; name: string; icon: React.ReactNode; color: string }> = [
    { id: 'Electricity', name: 'Electricity', icon: <Zap className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    { id: 'Gas', name: 'Natural Gas', icon: <Flame className="w-5 h-5 text-rose-500" />, color: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
    { id: 'Water', name: 'Water & Utilities', icon: <Droplets className="w-5 h-5 text-cyan-500" />, color: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800' },
    { id: 'Internet', name: 'Broadband Fiber', icon: <Wifi className="w-5 h-5 text-indigo-500" />, color: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' },
    { id: 'Telephone', name: 'Mobile & Landline', icon: <Phone className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    { id: 'Education', name: 'Tuition & University', icon: <GraduationCap className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    { id: 'Insurance', name: 'Premium Insurance', icon: <Shield className="w-5 h-5 text-purple-500" />, color: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
    { id: 'Government', name: 'Tax & Municipal', icon: <Landmark className="w-5 h-5 text-slate-600 dark:text-slate-300" />, color: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
    { id: 'Credit card', name: 'External Cards', icon: <CreditCard className="w-5 h-5 text-gold-500" />, color: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800' },
    { id: 'Subscription', name: 'Digital Media', icon: <Tv className="w-5 h-5 text-pink-500" />, color: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const bList = await billService.getBillers();
      setBillers(bList);

      const sbList = await billService.getSavedBillers(user?.id);
      setSavedBillers(sbList);

      const pBills = await billService.getPendingBills(user?.id);
      setPendingBills(pBills);

      const hist = await billService.getBillHistory(user?.id);
      setRecentPayments(hist.slice(0, 5));
    } catch (err: any) {
      toastError(err.message || 'Failed to load bill payment console');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading && billers.length === 0) {
    return <LoadingState message="Loading utility billing hub..." />;
  }

  const unpaidPending = pendingBills.filter((b) => b.status !== 'paid');
  const totalDuePending = unpaidPending.reduce((sum, b) => sum + (b.amountDue || b.amount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-royal-600 dark:text-gold-400" />
            Bill Payments & Utilities Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Zero-fee instant settlement for municipal utilities, educational institutions, telecommunications, and taxes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/bank/bills/recharge')}
            className="flex items-center gap-1.5"
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            Mobile Recharge
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/bank/bills/saved')}
            className="flex items-center gap-1.5"
          >
            <BookmarkCheck className="w-4 h-4 text-royal-600 dark:text-gold-400" />
            Saved Billers ({savedBillers.length})
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/bank/bills/pay')}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Pay New Bill
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-sm font-medium">
        <button
          onClick={() => navigate('/bank/bills')}
          className="px-4 py-2 border-b-2 border-royal-600 dark:border-gold-400 text-royal-600 dark:text-gold-400 font-semibold cursor-pointer shrink-0"
        >
          Hub Overview
        </button>
        <button
          onClick={() => navigate('/bank/bills/pay')}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer shrink-0"
        >
          Pay a Bill
        </button>
        <button
          onClick={() => navigate('/bank/bills/recharge')}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer shrink-0"
        >
          Mobile Recharge
        </button>
        <button
          onClick={() => navigate('/bank/bills/saved')}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer shrink-0"
        >
          Saved Billers & Auto-Pay
        </button>
        <button
          onClick={() => navigate('/bank/bills/history')}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer shrink-0"
        >
          Payment History
        </button>
      </div>

      {/* Pending Due Bills Alert Banner */}
      {unpaidPending.length > 0 && (
        <Card className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-amber-200 dark:border-amber-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{unpaidPending.length} Bills Due for Settlement Soon</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                    Action Required
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Total outstanding of {formatCurrency(totalDuePending)} pending across verified utilities.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/bank/bills/pay?biller=${unpaidPending[0].billerId || ''}&ref=${unpaidPending[0].accountReference}`)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold"
              >
                Pay {unpaidPending[0].billerName} ({formatCurrency(unpaidPending[0].amountDue || unpaidPending[0].amount || 0)})
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Browse by Category Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
            Select Biller Category
          </h2>
          <span className="text-xs text-slate-400">10 Official Categories Supported</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/bank/bills/pay?category=${encodeURIComponent(cat.id)}`)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] ${cat.color}`}
            >
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 mb-2 shadow-xs">
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Saved Billers Quick-Pay Carousel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-royal-600 dark:text-gold-400" />
            <h2 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
              Saved Billers & Quick Pay
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bank/bills/saved')}
            className="text-royal-600 dark:text-gold-400 text-xs flex items-center gap-1"
          >
            Manage All <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedBillers.map((sb) => (
            <Card
              key={sb.id}
              className="p-5 hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {sb.category}
                  </span>
                  {sb.autoPayEnabled && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <Sparkles className="w-3 h-3" /> Auto-Pay On
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {sb.nickName}
                </h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Ref: {sb.accountReference}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Biller: {sb.billerName}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Last paid: <span className="font-semibold">{sb.lastPaidAmount ? formatCurrency(sb.lastPaidAmount) : 'N/A'}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/bank/bills/pay?biller=${sb.billerId}&ref=${sb.accountReference}`)}
                  className="text-xs text-royal-600 dark:text-gold-400"
                >
                  Pay Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Bill Payments History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            <h2 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
              Recent Settled Payments
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bank/bills/history')}
            className="text-royal-600 dark:text-gold-400 text-xs flex items-center gap-1"
          >
            Full Ledger <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <Card className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No recent utility payments logged yet.
            </div>
          ) : (
            recentPayments.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate('/bank/bills/history')}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-royal-50 dark:bg-royal-950/60 border border-royal-200 dark:border-royal-800 flex items-center justify-center text-royal-600 dark:text-gold-400">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {r.billerName}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{formatDate(r.paymentDate)}</span>
                      <span>•</span>
                      <span className="font-mono">Ref: {r.referenceNumber}</span>
                      <span>•</span>
                      <span>{r.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                    -{formatCurrency(r.totalPaid)}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Settled
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
};
