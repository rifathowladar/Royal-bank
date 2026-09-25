import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Search,
  Activity,
  UserCheck,
  TrendingUp,
  RefreshCw,
  Building,
  Globe,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminAmlService } from '../../../backend/services/adminAmlService.ts';
import { AmlAlert, AmlCase, AmlReport } from '../../../backend/types/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';

export const AdminAmlDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AmlAlert[]>([]);
  const [cases, setCases] = useState<AmlCase[]>([]);
  const [reports, setReports] = useState<AmlReport[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedAlerts, fetchedCases, fetchedReports, fetchedMetrics] = await Promise.all([
        adminAmlService.getAlerts(),
        adminAmlService.getCases(),
        adminAmlService.getReports(),
        adminAmlService.getMetrics(),
      ]);
      setAlerts(fetchedAlerts);
      setCases(fetchedCases);
      setReports(fetchedReports);
      setMetrics(fetchedMetrics);
    } catch (err: any) {
      addToast(err.message || 'Failed to load AML surveillance metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !alerts.length) {
    return (
      <div className="p-8">
        <LoadingState message="Connecting to FinCEN, OFAC, and AML Sanctions Engine..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              REGULATORY COMPLIANCE SUITE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Anti-Money Laundering (AML) & Sanctions Screen
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated structuring detection, Politically Exposed Persons (PEP) watchlist matching, and FinCEN SAR filings.
          </p>
        </div>

        {/* Sub-Nav Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/aml"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
          >
            Surveillance Hub
          </Link>
          <Link
            to="/admin/aml/monitoring"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Transaction Monitoring ({alerts.length})
          </Link>
          <Link
            to="/admin/aml/cases"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            AML Cases ({cases.length})
          </Link>
          <Link
            to="/admin/aml/reports"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            SAR Reports ({reports.length})
          </Link>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>PEP & Sanctions Hits</span>
            <AlertTriangle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {metrics?.pepHits + metrics?.sanctionCandidates} Matches
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            World-Check & OFAC SDN screened
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Active Case Files</span>
            <Scale className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {metrics?.activeInvestigations ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Under formal regulatory review
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>SAR Reports Filed</span>
            <FileCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {metrics?.sarReportsSubmitted ?? 0} Transmitted
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Simulated Regulatory SAR Filings
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-royal-600">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Monitored Flow Volume</span>
            <TrendingUp className="w-4 h-4 text-royal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(metrics?.monitoredVolumeUSD ?? 0, 'USD')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            High-risk jurisdiction wires
          </p>
        </Card>
      </div>

      {/* Main Split: Live Transaction Monitoring Feed & Case Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Transaction Monitoring Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Real-time Transaction Monitoring Feed
            </h2>
            <Link
              to="/admin/aml/monitoring"
              className="text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline"
            >
              Full Monitoring Grid ({alerts.length}) &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <Card
                key={alert.id}
                className="p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {alert.refNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          alert.customerRiskRating === 'PEP' || alert.customerRiskRating === 'High'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        Risk: {alert.customerRiskRating}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(alert.detectedAt)}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {alert.customerName}
                    </div>

                    <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      Pattern: <span className="font-semibold">{alert.activityType}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {alert.notes}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Destination: <span className="font-medium text-slate-700 dark:text-slate-300">{alert.destinationCountry}</span></span>
                      <span>Amount: <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(alert.amount, alert.currency)}</span></span>
                      <span>Watchlist Match: <span className="font-mono font-semibold text-rose-600">{alert.matchScore}%</span></span>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/admin/aml/monitoring')}
                      className="text-xs"
                    >
                      Investigate &rarr;
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Col: Active AML Cases & Recent Reports */}
        <div className="space-y-6">
          {/* AML Case Files */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-royal-600" />
                Active AML Cases ({cases.length})
              </h3>
              <Link to="/admin/aml/cases" className="text-xs text-royal-600 hover:underline">
                All Cases &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {cases.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/admin/aml/cases')}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {c.caseNumber}
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {c.priority}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                    {c.customerName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between mt-0.5">
                    <span>{c.status.replace('_', ' ')}</span>
                    <span className="font-mono font-semibold">{formatCurrency(c.totalVolumeUSD, 'USD')}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Regulatory SAR Reports */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-rose-500" />
                Regulatory Filings ({reports.length})
              </h3>
              <Link to="/admin/aml/reports" className="text-xs text-royal-600 hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {reports.slice(0, 2).map((r) => (
                <div
                  key={r.id}
                  onClick={() => navigate('/admin/aml/reports')}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {r.reportNumber} ({r.type})
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {r.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                    Filing Target: {r.customerName}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Regulator: {r.regulator}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
