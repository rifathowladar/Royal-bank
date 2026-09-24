import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowRightLeft,
  Users,
  WalletCards,
  Building2,
  CreditCard,
  QrCode,
  AlertOctagon,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Download,
  Calendar,
} from 'lucide-react';
import { AdminReportNav } from '../../../components/admin/AdminReportNav.tsx';
import { ReportSummaryCard } from '../../../components/admin/ReportSummaryCard.tsx';
import { ExportMenu } from '../../../components/admin/ExportMenu.tsx';
import { adminReportService } from '../../../backend/services/adminReportService.ts';
import { ReportSummaryMetric } from '../../../backend/types/index.ts';

export const AdminReportsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [revenueBreakdown, setRevenueBreakdown] = useState<any>(null);
  const [summaryMetrics, setSummaryMetrics] = useState<ReportSummaryMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const revResult = await adminReportService.getRevenueReport({});
        setRevenueBreakdown(revResult.breakdown);
        setSummaryMetrics(revResult.summaryMetrics);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const reportModules = [
    {
      title: 'Transactions Report',
      description: 'Clearing, gross volumes, interchange fees, payment rails, and exception logs.',
      path: '/admin/reports/transactions',
      icon: ArrowRightLeft,
      stat: '$22.4M Volume',
      statLabel: 'Last 30 Days',
    },
    {
      title: 'Customers Report',
      description: 'KYC tier breakdowns, customer risk levels, registry accounts, and balances.',
      path: '/admin/reports/customers',
      icon: Users,
      stat: '100% KYC Ratio',
      statLabel: 'Verified Accounts',
    },
    {
      title: 'Deposits Report',
      description: 'High Yield Sovereign CDs, term fixed deposits, maturity timelines, and accrued interest.',
      path: '/admin/reports/deposits',
      icon: WalletCards,
      stat: '$350,000 Book',
      statLabel: '4.95% Weighted Yield',
    },
    {
      title: 'Loans & Credit Report',
      description: 'Mortgage facilities, commercial growth loans, outstanding principal, and scheduled EMIs.',
      path: '/admin/reports/loans',
      icon: Building2,
      stat: '$1.45M Principal',
      statLabel: '0.00% NPL Ratio',
    },
    {
      title: 'Card Portfolio Report',
      description: 'Visa Infinite, Mastercard Elite, spend velocities, limits, and transactions.',
      path: '/admin/reports/cards',
      icon: CreditCard,
      stat: '$168,000 Limit',
      statLabel: 'Active Issuance',
    },
    {
      title: 'QR Merchant Report',
      description: 'EMVCo instant payment transactions, MDR interchange fees, and T+0 settlements.',
      path: '/admin/reports/qr',
      icon: QrCode,
      stat: '$186,000 GMV',
      statLabel: '1.25% MDR Net Fee',
    },
    {
      title: 'Fraud Surveillance Report',
      description: 'Automated 24/7 rule detections, risk scores, velocity spikes, and threat resolutions.',
      path: '/admin/reports/fraud',
      icon: AlertOctagon,
      stat: '0 Critical Incidents',
      statLabel: 'Protected by AI Guard',
    },
    {
      title: 'Revenue & Yield Report',
      description: 'Consolidated interest margins, interchange, wire transfer tariffs, and treasury spreads.',
      path: '/admin/reports/revenue',
      icon: DollarSign,
      stat: revenueBreakdown ? `$${revenueBreakdown.totalRevenueUSD.toLocaleString()}` : '$158,400',
      statLabel: 'Consolidated YTD',
    },
  ];

  const exportHeaders = ['Report Module', 'Direct Route', 'Primary Metric', 'Cadence'];
  const exportRows = reportModules.map((m) => [m.title, m.path, m.stat, m.statLabel]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Executive Regulatory & Financial Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time business intelligence, compliance reporting, and audited statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu
            reportTitle="Executive Reports Inventory"
            headers={exportHeaders}
            rows={exportRows}
            fileName="royal-bank-reports-index"
          />
        </div>
      </div>

      {/* Nav Tabs */}
      <AdminReportNav />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((m, i) => (
          <ReportSummaryCard key={i} metric={m} />
        ))}
      </div>

      {/* Report Module Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Departmental Reporting Catalogs
          </h2>
          <span className="text-xs text-slate-400 font-mono">8 Operational Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.path}
                onClick={() => navigate(module.path)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-royal-900 group-hover:text-white dark:group-hover:bg-amber-500 dark:group-hover:text-slate-950 transition-colors mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                    {module.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      {module.stat}
                    </div>
                    <div className="text-[10px] text-slate-400">{module.statLabel}</div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
