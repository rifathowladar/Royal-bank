import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Radio,
  FilePlus,
  MessageSquare,
  Globe,
  Smartphone,
  Cpu,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { PermissionGate } from '../../../components/common/PermissionGate.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminFraudService } from '../../../backend/services/adminFraudService.ts';
import { FraudAlert, FraudCase } from '../../../backend/types/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';

export const AdminFraudDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  // Modal states
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [modalMode, setModalMode] = useState<'block' | 'release' | 'note' | 'case' | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [caseSeverity, setCaseSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [caseTitle, setCaseTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedAlerts, fetchedCases, fetchedMetrics] = await Promise.all([
        adminFraudService.getAlerts(),
        adminFraudService.getCases(),
        adminFraudService.getMetrics(),
      ]);
      setAlerts(fetchedAlerts);
      setCases(fetchedCases);
      setMetrics(fetchedMetrics);
    } catch (err: any) {
      addToast(err.message || 'Failed to load fraud surveillance telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvestigate = async (alert: FraudAlert) => {
    try {
      await adminFraudService.investigateAlert(alert.id, 'Investigation opened from Command Radar.');
      addToast(`Alert ${alert.alertNumber} is now under active investigation.`, 'success');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Authorization error or failure.', 'error');
    }
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setIsSubmitting(true);

    try {
      if (modalMode === 'block') {
        await adminFraudService.blockAlert(selectedAlert.id, actionInput || 'Confirmed critical threat signature');
        addToast(`Alert ${selectedAlert.alertNumber} BLOCKED. Hard freeze applied to customer assets.`, 'success');
      } else if (modalMode === 'release') {
        await adminFraudService.releaseAlert(selectedAlert.id, actionInput || 'Legitimacy verified by security desk');
        addToast(`Alert ${selectedAlert.alertNumber} RELEASED and cleared.`, 'success');
      } else if (modalMode === 'note') {
        await adminFraudService.addNote(selectedAlert.id, actionInput);
        addToast(`Operational note appended to ${selectedAlert.alertNumber}.`, 'success');
      } else if (modalMode === 'case') {
        const newCase = await adminFraudService.createCase({
          alertId: selectedAlert.id,
          title: caseTitle || `Fraud Investigation for ${selectedAlert.customerName}`,
          severity: caseSeverity,
          notes: actionInput || 'Escalated from primary surveillance alert.',
        });
        addToast(`Formal Case ${newCase.caseNumber} registered successfully.`, 'success');
      }

      setModalMode(null);
      setSelectedAlert(null);
      setActionInput('');
      setCaseTitle('');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Operation failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !alerts.length) {
    return (
      <div className="p-8">
        <LoadingState message="Connecting to Behavioral Fraud Detection Core & Neural Radar..." />
      </div>
    );
  }

  const highRiskAlerts = alerts.filter((a) => a.riskScore >= 75);
  const activeAlerts = alerts.filter((a) => a.status === 'flagged' || a.status === 'under_investigation');

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold inline-flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
              LIVE SURVEILLANCE ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Fraud Detection & Countermeasure Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated behavioral anomaly detection, impossible travel telemetry, device heuristics, and instant asset containment.
          </p>
        </div>

        {/* Sub-Nav Pills */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/fraud"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
          >
            Surveillance Radar
          </Link>
          <Link
            to="/admin/fraud/alerts"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Live Alerts ({alerts.length})
          </Link>
          <Link
            to="/admin/fraud/cases"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Case Dossiers ({cases.length})
          </Link>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Critical Threat Index</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {highRiskAlerts.length} Flagged
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Risk score &ge; 75 / 100 threshold
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Active Investigations</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {metrics?.underInvestigationCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Assigned to SIU analysts
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Attacks Neutralized</span>
            <Lock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics?.blockedCount ?? 0} Blocked
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Hard freeze execution verified
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-royal-600">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Monitored Exposure</span>
            <TrendingUp className="w-4 h-4 text-royal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(metrics?.totalExposureUSD ?? 0, 'USD')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {alerts.length} behavioral events
          </p>
        </Card>
      </div>

      {/* Main Grid: Priority Threat Stream + Radar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Surveillance Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Priority Suspicious Activity Stream
            </h2>
            <Link
              to="/admin/fraud/alerts"
              className="text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1"
            >
              View Full Alert Feed ({alerts.length}) &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {activeAlerts.slice(0, 5).map((alert) => (
              <Card
                key={alert.id}
                className="p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {alert.alertNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                          alert.riskScore >= 80
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : alert.riskScore >= 60
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        Risk Score: {alert.riskScore}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(alert.timestamp)}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{alert.customerName}</span>
                      <span className="text-xs font-normal text-slate-500">({alert.customerEmail})</span>
                    </div>

                    <div className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{alert.detectionRule}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        {alert.location} • IP: <span className="font-mono">{alert.ipAddress}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-slate-400" />
                        {alert.device.name} ({alert.device.os})
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Amount: {formatCurrency(alert.amount, alert.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-row sm:flex-col items-end gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/fraud/${alert.id}`)}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Investigate
                    </Button>

                    <div className="flex items-center gap-1">
                      <PermissionGate resource="fraud" action="reject">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setModalMode('block');
                          }}
                          className="text-[11px] px-2 py-1 h-7"
                          title="Hard Freeze Assets"
                        >
                          <Lock className="w-3 h-3 mr-1" />
                          Block
                        </Button>
                      </PermissionGate>

                      <PermissionGate resource="fraud" action="approve">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setModalMode('release');
                          }}
                          className="text-[11px] px-2 py-1 h-7 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                          title="Release as Legitimate"
                        >
                          <Unlock className="w-3 h-3" />
                        </Button>
                      </PermissionGate>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setModalMode('note');
                        }}
                        className="text-[11px] px-2 py-1 h-7 text-slate-500"
                        title="Add Note"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Col: Active Cases & Detection Rules Breakdown */}
        <div className="space-y-6">
          {/* Active Cases Dossier */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-royal-600" />
                Active Incident Dossiers ({cases.length})
              </h3>
              <Link
                to="/admin/fraud/cases"
                className="text-xs text-royal-600 dark:text-royal-400 hover:underline"
              >
                All Cases &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {cases.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/admin/fraud/cases')}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      {c.caseNumber}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${
                        c.severity === 'critical'
                          ? 'bg-rose-500 text-white'
                          : c.severity === 'high'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                    {c.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                    <span>Target: {c.customerName}</span>
                    <span>{formatCurrency(c.totalExposureUSD, 'USD')}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Neural Radar Rule Breakdown */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-500" />
              Surveillance Trigger Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Impossible Geolocation Travel</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">42%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Automated Headless / Botnet</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">28%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Sub-Threshold Velocity Bursts</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">18%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Dormant High-Value Drain</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">12%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Dynamic Action Modal (Block / Release / Note / Case) */}
      {modalMode && selectedAlert && (
        <Modal
          isOpen={!!modalMode}
          onClose={() => setModalMode(null)}
          title={
            modalMode === 'block'
              ? `Execute Hard Freeze • ${selectedAlert.alertNumber}`
              : modalMode === 'release'
              ? `Release & Clear Alert • ${selectedAlert.alertNumber}`
              : modalMode === 'note'
              ? `Append Security Note • ${selectedAlert.alertNumber}`
              : `Open Formal Case Dossier • ${selectedAlert.alertNumber}`
          }
          subtitle={`Target: ${selectedAlert.customerName} (${formatCurrency(selectedAlert.amount, selectedAlert.currency)})`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmAction} className="space-y-4">
            {modalMode === 'block' && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-900 dark:text-rose-200">
                  <Lock className="w-3.5 h-3.5" />
                  CONFIRM HARD FREEZE ACTION
                </div>
                <p>
                  Executing this action will immediately suspend outgoing transfers, block associated cards, and mark client profile as High Risk.
                </p>
              </div>
            )}

            {modalMode === 'release' && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CONFIRM RELEASE JUSTIFICATION
                </div>
                <p>
                  Alert will be cleared from active radar. Outbound transaction processing will resume normally.
                </p>
              </div>
            )}

            {modalMode === 'case' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Incident Dossier Title
                  </label>
                  <input
                    type="text"
                    required
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    placeholder="e.g. Coordinated Credential Stuffing & Wire Surge"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Severity Tier
                  </label>
                  <select
                    value={caseSeverity}
                    onChange={(e) => setCaseSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="critical">Critical (Immediate containment required)</option>
                    <option value="high">High (Under active attack)</option>
                    <option value="medium">Medium (Behavioral suspicion)</option>
                    <option value="low">Low (Standard review)</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {modalMode === 'note' ? 'Security Commentary' : 'Justification & Audit Rationale'}
              </label>
              <textarea
                required
                rows={3}
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="Enter mandatory regulatory / operational narrative..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalMode(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant={modalMode === 'block' ? 'danger' : 'primary'}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Processing...'
                  : modalMode === 'block'
                  ? 'Confirm Hard Freeze'
                  : modalMode === 'release'
                  ? 'Confirm Release'
                  : modalMode === 'case'
                  ? 'Create Formal Case'
                  : 'Append Note'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
