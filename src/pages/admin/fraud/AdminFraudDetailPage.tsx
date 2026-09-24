import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  MessageSquare,
  FilePlus,
  ArrowLeft,
  Globe,
  Smartphone,
  CheckCircle2,
  Clock,
  User,
  CreditCard,
  Wifi,
  Cpu,
  Fingerprint,
  Radio,
  FileText,
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

export const AdminFraudDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [alert, setAlert] = useState<FraudAlert | null>(null);
  const [loading, setLoading] = useState(true);

  // Actions
  const [modalMode, setModalMode] = useState<'block' | 'release' | 'note' | 'case' | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [caseSeverity, setCaseSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [caseTitle, setCaseTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAlert = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await adminFraudService.getAlertById(id);
      if (!data) {
        addToast(`Fraud alert #${id} not found.`, 'error');
        navigate('/admin/fraud/alerts');
        return;
      }
      setAlert(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to load alert details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlert();
  }, [id]);

  const handleInvestigate = async () => {
    if (!alert) return;
    try {
      const updated = await adminFraudService.investigateAlert(alert.id, 'Investigation initiated from alert cockpit.');
      setAlert(updated);
      addToast('Alert marked as under investigation.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alert) return;
    setIsSubmitting(true);

    try {
      if (modalMode === 'block') {
        const updated = await adminFraudService.blockAlert(alert.id, actionInput || 'Critical fraud confirmed');
        setAlert(updated);
        addToast(`Alert ${alert.alertNumber} blocked. Hard freeze enforced.`, 'success');
      } else if (modalMode === 'release') {
        const updated = await adminFraudService.releaseAlert(alert.id, actionInput || 'Legitimate verified activity');
        setAlert(updated);
        addToast(`Alert ${alert.alertNumber} released successfully.`, 'success');
      } else if (modalMode === 'note') {
        const updated = await adminFraudService.addNote(alert.id, actionInput);
        setAlert(updated);
        addToast('Security note recorded.', 'success');
      } else if (modalMode === 'case') {
        const newCase = await adminFraudService.createCase({
          alertId: alert.id,
          title: caseTitle || `Fraud Incident: ${alert.customerName}`,
          severity: caseSeverity,
          notes: actionInput || 'Formal escalation from alert cockpit.',
        });
        addToast(`Formal Case ${newCase.caseNumber} created.`, 'success');
        navigate('/admin/fraud/cases');
        return;
      }

      setModalMode(null);
      setActionInput('');
      setCaseTitle('');
    } catch (err: any) {
      addToast(err.message || 'Action failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading fraud telemetry details & neural radar..." />
      </div>
    );
  }

  if (!alert) return null;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link
            to="/admin/fraud/alerts"
            className="text-xs text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Alerts Feed
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {alert.alertNumber}
            </h1>
            <span
              className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${
                alert.status === 'blocked'
                  ? 'bg-red-600 text-white'
                  : alert.status === 'flagged'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : alert.status === 'under_investigation'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {alert.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Detected on {formatDate(alert.timestamp)} • Rule Category: {alert.ruleCategory}
          </p>
        </div>

        {/* 5 Primary Actions: Investigate, Block, Release, Create Case, Add Note */}
        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate resource="fraud" action="edit">
            {alert.status === 'flagged' && (
              <Button size="sm" variant="outline" onClick={handleInvestigate}>
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
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
                  setModalMode('block');
                }}
              >
                <Lock className="w-3.5 h-3.5 mr-1" />
                Block & Freeze Assets
              </Button>
            )}
          </PermissionGate>

          <PermissionGate resource="fraud" action="approve">
            {alert.status !== 'released' && (
              <Button
                size="sm"
                variant="outline"
                className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                onClick={() => {
                  setModalMode('release');
                }}
              >
                <Unlock className="w-3.5 h-3.5 mr-1" />
                Release as Legitimate
              </Button>
            )}
          </PermissionGate>

          <PermissionGate resource="fraud" action="create">
            {alert.status !== 'case_created' && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setModalMode('case');
                }}
              >
                <FilePlus className="w-3.5 h-3.5 mr-1" />
                Create Case Dossier
              </Button>
            )}
          </PermissionGate>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setModalMode('note');
            }}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Core Forensic Highlights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Score & Rule Banner */}
          <Card className="p-5 border-l-4 border-l-rose-500 bg-rose-50/20 dark:bg-rose-950/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                  Primary Detection Rule Triggered
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {alert.detectionRule}
                </h3>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Neural Risk Score</div>
                <div className="font-mono text-3xl font-black text-rose-600 dark:text-rose-400">
                  {alert.riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  alert.riskScore >= 80 ? 'bg-rose-500' : alert.riskScore >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${alert.riskScore}%` }}
              />
            </div>
          </Card>

          {/* Suspicious Transaction & Amount Details */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-royal-600" />
              Suspicious Transaction Details
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Transaction Ref</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {alert.transactionReference || 'N/A'}
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Suspicious Amount</span>
                <div className="font-mono font-bold text-base text-rose-600 dark:text-rose-400 mt-0.5">
                  {formatCurrency(alert.amount, alert.currency)}
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Target Account</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {alert.accountNumberMasked}
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Timestamp</span>
                <div className="text-slate-900 dark:text-white mt-0.5">
                  {formatDate(alert.timestamp)}
                </div>
              </div>
            </div>
          </Card>

          {/* Device Telemetry & IP Geolocation */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-500" />
              Device Forensic & IP Telemetry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Smartphone className="w-4 h-4 text-royal-600" />
                  Client Hardware & Browser
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Device Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{alert.device.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operating System:</span>
                    <span className="text-slate-800 dark:text-slate-200">{alert.device.os}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Browser User-Agent:</span>
                    <span className="text-slate-800 dark:text-slate-200">{alert.device.browser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Device Familiarity:</span>
                    <span className={`font-semibold ${alert.device.isNewDevice ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {alert.device.isNewDevice ? '⚠️ Unrecognized / First Seen' : '✓ Verified Known Device'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px]">
                    <span className="text-slate-400">Canvas Fingerprint:</span>
                    <span className="text-slate-600 dark:text-slate-400">{alert.device.fingerprint}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  IP Geolocation & Threat Intel
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">IP Address:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{alert.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Physical Origin:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{alert.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jurisdiction Code:</span>
                    <span className="font-mono">{alert.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">VPN / Tor Exit Proxy:</span>
                    <span className={`font-semibold ${alert.device.isVpnOrProxy ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                      {alert.device.isVpnOrProxy ? '⚠️ Detected Tor / Datacenter Proxy' : 'No Proxy Flag'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Investigation Notes & Audit Log */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-royal-600" />
                Forensic Case Notes ({alert.notes.length})
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalMode('note')}
                className="text-xs"
              >
                + Append Note
              </Button>
            </div>

            <div className="space-y-3">
              {alert.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {note.author} <span className="font-normal text-slate-400">({note.authorRole})</span>
                    </span>
                    <span className="text-slate-400">{formatDate(note.timestamp)}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{note.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 col): Customer Profile & Action Panel */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-royal-600" />
              Customer Profile
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Account Holder</span>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {alert.customerName}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Email</span>
                <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                  {alert.customerEmail}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Customer ID</span>
                <div className="font-mono text-royal-600 dark:text-royal-400 font-medium">
                  {alert.customerId}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to={`/admin/customers/${alert.customerId}`}
                  className="text-royal-600 dark:text-royal-400 hover:underline font-semibold flex items-center gap-1"
                >
                  View Full Customer Dossier &rarr;
                </Link>
              </div>
            </div>
          </Card>

          {/* Assigned Analyst */}
          <Card className="p-5 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Assigned SIU Unit
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {alert.assignedTo || 'Unassigned (General Queue)'}
            </p>
            {alert.caseId && (
              <div className="pt-2 text-xs">
                <span className="text-slate-400">Formal Case:</span>{' '}
                <Link to="/admin/fraud/cases" className="font-mono font-bold text-royal-600 hover:underline">
                  {alert.caseId}
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Action Modal */}
      {modalMode && (
        <Modal
          isOpen={!!modalMode}
          onClose={() => setModalMode(null)}
          title={
            modalMode === 'block'
              ? `Hard Freeze Asset Execution • ${alert.alertNumber}`
              : modalMode === 'release'
              ? `Release & Clear Alert • ${alert.alertNumber}`
              : modalMode === 'note'
              ? `Add Security Note • ${alert.alertNumber}`
              : `Create Case Dossier • ${alert.alertNumber}`
          }
          subtitle={`Target: ${alert.customerName}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmAction} className="space-y-4">
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
                    placeholder="e.g. Account Takeover via Headless Botnet"
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
                {modalMode === 'note' ? 'Security Commentary' : 'Regulatory & Forensic Rationale'}
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
