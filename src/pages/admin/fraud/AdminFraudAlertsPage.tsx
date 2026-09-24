import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  FilePlus,
  ExternalLink,
  Smartphone,
  Globe,
  Radio,
  ArrowUpDown,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { PermissionGate } from '../../../components/common/PermissionGate.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminFraudService } from '../../../backend/services/adminFraudService.ts';
import { FraudAlert, FraudAlertStatus } from '../../../backend/types/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';

export const AdminFraudAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ruleFilter, setRuleFilter] = useState<string>('all');
  const [minRisk, setMinRisk] = useState<number>(0);

  // Modal actions
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [modalMode, setModalMode] = useState<'block' | 'release' | 'note' | 'case' | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [caseSeverity, setCaseSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [caseTitle, setCaseTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await adminFraudService.getAlerts({
        status: statusFilter,
        ruleCategory: ruleFilter,
        minRisk: minRisk > 0 ? minRisk : undefined,
        search,
      });
      setAlerts(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch alerts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, ruleFilter, minRisk]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAlerts();
  };

  const handleInvestigate = async (alert: FraudAlert) => {
    try {
      await adminFraudService.investigateAlert(alert.id, 'Investigator assigned from alerts console.');
      addToast(`Alert ${alert.alertNumber} moved to Under Investigation.`, 'success');
      fetchAlerts();
    } catch (err: any) {
      addToast(err.message || 'Investigation action failed.', 'error');
    }
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setIsSubmitting(true);

    try {
      if (modalMode === 'block') {
        await adminFraudService.blockAlert(selectedAlert.id, actionInput || 'Confirmed fraud signature');
        addToast(`Alert ${selectedAlert.alertNumber} BLOCKED. Hard freeze applied to customer assets.`, 'success');
      } else if (modalMode === 'release') {
        await adminFraudService.releaseAlert(selectedAlert.id, actionInput || 'Legitimacy verified by analyst');
        addToast(`Alert ${selectedAlert.alertNumber} RELEASED and cleared.`, 'success');
      } else if (modalMode === 'note') {
        await adminFraudService.addNote(selectedAlert.id, actionInput);
        addToast(`Operational note appended to ${selectedAlert.alertNumber}.`, 'success');
      } else if (modalMode === 'case') {
        const newCase = await adminFraudService.createCase({
          alertId: selectedAlert.id,
          title: caseTitle || `Fraud Incident for ${selectedAlert.customerName}`,
          severity: caseSeverity,
          notes: actionInput || 'Formal escalation from alerts grid.',
        });
        addToast(`Formal Case ${newCase.caseNumber} initiated.`, 'success');
      }

      setModalMode(null);
      setSelectedAlert(null);
      setActionInput('');
      setCaseTitle('');
      fetchAlerts();
    } catch (err: any) {
      addToast(err.message || 'Action failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: FraudAlertStatus) => {
    switch (status) {
      case 'flagged':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            Flagged
          </span>
        );
      case 'under_investigation':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Under Investigation
          </span>
        );
      case 'blocked':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-red-600 text-white font-semibold">
            Hard Blocked
          </span>
        );
      case 'released':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Released
          </span>
        );
      case 'case_created':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-royal-100 text-royal-800 dark:bg-royal-950 dark:text-royal-300">
            Case Created
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/fraud"
              className="text-xs text-royal-600 dark:text-royal-400 hover:underline"
            >
              &larr; Back to Fraud Radar
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Suspicious Transaction & Anomaly Feed
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time feed of flagged behavioral triggers, velocity violations, and impossible travel patterns.
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/fraud"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Radar Overview
          </Link>
          <Link
            to="/admin/fraud/alerts"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            Live Alerts
          </Link>
          <Link
            to="/admin/fraud/cases"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Case Dossiers
          </Link>
          <Button variant="outline" size="sm" onClick={fetchAlerts}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Alert #, Customer Name, IP Address, Location, or Rule..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <Button type="submit" size="sm" variant="primary">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="flagged">Flagged</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="blocked">Blocked</option>
                <option value="released">Released</option>
                <option value="case_created">Case Created</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Rule Category:</span>
              <select
                value={ruleFilter}
                onChange={(e) => setRuleFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Categories</option>
                <option value="Geolocation">Geolocation</option>
                <option value="Velocity">Velocity</option>
                <option value="Device Anomaly">Device Anomaly</option>
                <option value="Amount Anomaly">Amount Anomaly</option>
                <option value="High-Risk MCC">High-Risk MCC</option>
                <option value="Credential Stuffing">Credential Stuffing</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Min Risk Score:</span>
              <select
                value={minRisk}
                onChange={(e) => setMinRisk(Number(e.target.value))}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              >
                <option value={0}>Any (&ge; 0)</option>
                <option value={50}>&ge; 50 (Elevated)</option>
                <option value={75}>&ge; 75 (High)</option>
                <option value={90}>&ge; 90 (Critical)</option>
              </select>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{alerts.length}</span> alerts
          </div>
        </div>
      </Card>

      {/* Main Alerts Table */}
      <Card className="overflow-hidden">
        {loading && !alerts.length ? (
          <div className="p-8">
            <LoadingState message="Filtering telemetry alerts..." />
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold">No fraud alerts matching active criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Adjust filters or search parameters to view broader data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Alert / Time</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Detection Rule</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Location & IP</th>
                  <th className="px-4 py-3">Device Details</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        to={`/admin/fraud/${alert.id}`}
                        className="font-mono font-bold text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1"
                      >
                        {alert.alertNumber}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatDate(alert.timestamp)}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            alert.riskScore >= 80
                              ? 'bg-rose-500 text-white'
                              : alert.riskScore >= 60
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {alert.riskScore}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {alert.customerName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {alert.accountNumberMasked}
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-medium text-slate-900 dark:text-white line-clamp-1" title={alert.detectionRule}>
                        {alert.detectionRule}
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {alert.ruleCategory}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(alert.amount, alert.currency)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        IP: {alert.ipAddress}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[140px]" title={alert.device.name}>
                          {alert.device.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {alert.device.browser} • {alert.device.isNewDevice ? '⚠️ New Device' : 'Known Device'}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(alert.status)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/admin/fraud/${alert.id}`)}
                          className="h-7 px-2 text-xs"
                          title="Open Cockpit"
                        >
                          Details
                        </Button>

                        <PermissionGate resource="fraud" action="edit">
                          {alert.status === 'flagged' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInvestigate(alert)}
                              className="h-7 px-2 text-xs text-amber-600 dark:text-amber-400"
                              title="Investigate"
                            >
                              Investigate
                            </Button>
                          )}
                        </PermissionGate>

                        <PermissionGate resource="fraud" action="reject">
                          {alert.status !== 'blocked' && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setModalMode('block');
                              }}
                              className="h-7 px-2 text-xs"
                              title="Block Transaction & Assets"
                            >
                              <Lock className="w-3 h-3 mr-0.5" />
                              Block
                            </Button>
                          )}
                        </PermissionGate>

                        <PermissionGate resource="fraud" action="approve">
                          {alert.status !== 'released' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setModalMode('release');
                              }}
                              className="h-7 px-2 text-xs text-emerald-600 dark:text-emerald-400"
                              title="Release"
                            >
                              <Unlock className="w-3 h-3" />
                            </Button>
                          )}
                        </PermissionGate>

                        <PermissionGate resource="fraud" action="create">
                          {alert.status !== 'case_created' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setModalMode('case');
                              }}
                              className="h-7 px-2 text-xs text-royal-600"
                              title="Create Formal Case"
                            >
                              <FilePlus className="w-3 h-3" />
                            </Button>
                          )}
                        </PermissionGate>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setModalMode('note');
                          }}
                          className="h-7 px-2 text-xs text-slate-500"
                          title="Add Note"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Action Modal */}
      {modalMode && selectedAlert && (
        <Modal
          isOpen={!!modalMode}
          onClose={() => setModalMode(null)}
          title={
            modalMode === 'block'
              ? `Block Suspicious Transaction • ${selectedAlert.alertNumber}`
              : modalMode === 'release'
              ? `Release & Clear Alert • ${selectedAlert.alertNumber}`
              : modalMode === 'note'
              ? `Append Security Note • ${selectedAlert.alertNumber}`
              : `Create Case Dossier • ${selectedAlert.alertNumber}`
          }
          subtitle={`Target: ${selectedAlert.customerName} (${formatCurrency(selectedAlert.amount, selectedAlert.currency)})`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmAction} className="space-y-4">
            {modalMode === 'block' && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
                <p className="font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  CONFIRM HARD ASSET FREEZE
                </p>
                <p className="mt-1">
                  Will instantly freeze outbound transactions and debit cards associated with this account.
                </p>
              </div>
            )}

            {modalMode === 'release' && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                <p className="font-bold flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5" />
                  CONFIRM RELEASE & CLEARANCE
                </p>
                <p className="mt-1">
                  Marks this behavioral alert as confirmed legitimate. Outbound transaction will proceed.
                </p>
              </div>
            )}

            {modalMode === 'case' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Formal Dossier Title
                  </label>
                  <input
                    type="text"
                    required
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    placeholder="e.g. Synthetic Identity Investigation & Account Takeover"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={caseSeverity}
                    onChange={(e) => setCaseSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {modalMode === 'note' ? 'Security Commentary' : 'Mandatory Rationale & Audit Trail'}
              </label>
              <textarea
                required
                rows={3}
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="Enter regulatory rationale for administrative action..."
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
                  ? 'Saving...'
                  : modalMode === 'block'
                  ? 'Confirm Hard Freeze'
                  : modalMode === 'release'
                  ? 'Confirm Release'
                  : modalMode === 'case'
                  ? 'Create Case'
                  : 'Append Note'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
