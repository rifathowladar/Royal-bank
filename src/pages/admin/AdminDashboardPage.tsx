import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminTransactionService,
  adminCustomerService,
  adminAccountService,
  AdminDashboardMetrics,
} from '../../backend/index.ts';
import { AdminStatCard, AdminCharts } from '../../components/admin/index.ts';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { formatCurrency } from '../../utils/formatters.ts';
import { useAdminPermissions } from '../../hooks/index.ts';
import {
  Users,
  UserCheck,
  Landmark,
  Building2,
  ArrowRightLeft,
  QrCode,
  AlertTriangle,
  FileCheck,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const permissions = useAdminPermissions();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    adminTransactionService
      .getDashboardMetrics()
      .then((m) => {
        if (mounted) {
          setMetrics(m);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load admin metrics:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !metrics) {
    return (
      <LoadingState
        type="table"
        message="Loading executive command center & supervisory telemetry..."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-slate-800 to-royal-950 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-slate-700/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              <Shield className="w-3 h-3" />
              Tier-1 Central Registry Control
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-300 font-mono">Node RBS-CORE-01</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Executive Command & Supervisory Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Real-time custody ledger oversight, high-velocity AML surveillance, credit facilities, and multi-tenant customer operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={() => navigate('/admin/transactions')}
            icon={<ArrowRightLeft className="w-4 h-4 text-amber-400" />}
          >
            Live Transactions Stream
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/admin/customers')}
            icon={<Users className="w-4 h-4" />}
          >
            Customer Registry
          </Button>
        </div>
      </div>

      {/* 10 Required Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Core Operational Indicators
          </h2>
          <span className="text-xs text-slate-400 font-mono">Sync Interval: Real-Time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total customers */}
          <AdminStatCard
            title="Total Customers"
            value={metrics.totalCustomers.toLocaleString()}
            subtitle="Registered dossiers"
            icon={Users}
            variant="default"
            change={{ value: '+14.2%', trend: 'up' }}
            onClick={() => navigate('/admin/customers')}
          />

          {/* Card 2: Active customers */}
          <AdminStatCard
            title="Active Customers"
            value={metrics.activeCustomers.toLocaleString()}
            subtitle={`${Math.round((metrics.activeCustomers / metrics.totalCustomers) * 100)}% active ratio`}
            icon={UserCheck}
            variant="emerald"
            change={{ value: '+9.4%', trend: 'up' }}
            onClick={() => navigate('/admin/customers?status=active')}
          />

          {/* Card 3: Total deposits */}
          <AdminStatCard
            title="Total Deposits"
            value={formatCurrency(metrics.totalDepositsUSD, 'USD')}
            subtitle="Custody in vaults"
            icon={Landmark}
            variant="amber"
            change={{ value: '+12.8%', trend: 'up' }}
            onClick={() => navigate('/admin/accounts')}
          />

          {/* Card 4: Total loans */}
          <AdminStatCard
            title="Total Loans"
            value={formatCurrency(metrics.totalLoansUSD, 'USD')}
            subtitle="Outstanding principal"
            icon={Building2}
            variant="indigo"
            change={{ value: '+4.1%', trend: 'up' }}
            onClick={() => navigate('/admin/loans')}
          />

          {/* Card 5: Today's transactions */}
          <AdminStatCard
            title="Today's Transactions"
            value={metrics.todayTransactionsCount.toLocaleString()}
            subtitle={formatCurrency(metrics.todayTransactionsVolumeUSD, 'USD')}
            icon={ArrowRightLeft}
            variant="default"
            change={{ value: '+22.0%', trend: 'up' }}
            onClick={() => navigate('/admin/transactions')}
          />

          {/* Card 6: QR transactions */}
          <AdminStatCard
            title="QR Transactions"
            value={metrics.qrTransactionsCount.toLocaleString()}
            subtitle="EMVCo & Merchant terminals"
            icon={QrCode}
            variant="emerald"
            change={{ value: '+31.5%', trend: 'up' }}
            onClick={() => navigate('/admin/qr')}
          />

          {/* Card 7: Failed transactions */}
          <AdminStatCard
            title="Failed Transactions"
            value={metrics.failedTransactionsCount.toLocaleString()}
            subtitle="Declined / Stoppage"
            icon={AlertTriangle}
            variant="rose"
            change={{ value: '-2.3%', trend: 'down' }}
            onClick={() => navigate('/admin/transactions?status=failed')}
          />

          {/* Card 8: Pending KYC */}
          <AdminStatCard
            title="Pending KYC"
            value={metrics.pendingKycCount.toLocaleString()}
            subtitle="Identity review queues"
            icon={FileCheck}
            variant="amber"
            badge="Action Required"
            onClick={() => navigate('/admin/kyc')}
          />

          {/* Card 9: Pending loans */}
          <AdminStatCard
            title="Pending Loans"
            value={metrics.pendingLoansCount.toLocaleString()}
            subtitle="Underwriting committee"
            icon={Clock}
            variant="indigo"
            onClick={() => navigate('/admin/loans')}
          />

          {/* Card 10: Fraud alerts */}
          <AdminStatCard
            title="Fraud Alerts"
            value={metrics.fraudAlertsCount.toLocaleString()}
            subtitle="AML surveillance triggers"
            icon={ShieldAlert}
            variant="rose"
            badge="Surveillance"
            onClick={() => navigate('/admin/fraud')}
          />
        </div>
      </div>

      {/* 6 Required Charts Section */}
      <AdminCharts />

      {/* Quick Governance Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => navigate('/admin/customers')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mt-3">Customer Directory</h3>
          <p className="text-xs text-slate-500 mt-1">
            Search, freeze/unfreeze accounts, issue credentials, and review risk ratings.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/accounts')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-royal-500/10 text-royal-600 dark:text-royal-400 group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5" />
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-royal-500 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mt-3">Account Ledgers</h3>
          <p className="text-xs text-slate-500 mt-1">
            Provision new ledgers, adjust velocity limits, and execute regulatory freezes.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/transactions')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mt-3">Settlement Stream</h3>
          <p className="text-xs text-slate-500 mt-1">
            Audit wire transfers, approve flagged payments, and trigger dual-key reversals.
          </p>
        </div>
      </div>
    </div>
  );
};
