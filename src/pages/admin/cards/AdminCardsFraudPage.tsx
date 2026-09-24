import React, { useEffect, useState } from 'react';
import { AdminCardNav } from '../../../components/admin/AdminCardNav.tsx';
import { AdminStatCard } from '../../../components/admin/AdminStatCard.tsx';
import { AdminDataTable, Column } from '../../../components/admin/AdminDataTable.tsx';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminCardService,
  CardFraudAlert,
} from '../../../backend/services/adminCardService.ts';
import {
  ShieldAlert,
  AlertTriangle,
  Snowflake,
  Ban,
  CheckCircle,
  Eye,
  Shield,
  Activity,
  UserCheck,
} from 'lucide-react';

export const AdminCardsFraudPage: React.FC = () => {
  const [alerts, setAlerts] = useState<CardFraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending');

  // Action Modals
  const [selectedAlert, setSelectedAlert] = useState<CardFraudAlert | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'freeze_card' | 'block_card' | 'dismiss' | 'mark_false_positive'>('freeze_card');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await adminCardService.getFraudAlerts(
        statusFilter === 'all' ? undefined : { status: statusFilter }
      );
      setAlerts(data);
    } catch {
      addToast('Error loading fraud alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [statusFilter]);

  const pendingAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'investigating');
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setSubmitting(true);
    try {
      await adminCardService.resolveFraudAlert(
        selectedAlert.id,
        actionType,
        resolutionNotes || 'Resolution recorded by compliance officer'
      );
      addToast(`Fraud case ${selectedAlert.id} resolved with action ${actionType}`, 'success');
      setShowActionModal(false);
      setResolutionNotes('');
      loadAlerts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Resolution failed';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<CardFraudAlert>[] = [
    {
      header: 'Alert & Trigger',
      accessor: (a) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{a.triggerRule}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Card: {a.cardNumberMasked} • {a.customerName}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm line-clamp-1">
            {a.description}
          </div>
        </div>
      ),
    },
    {
      header: 'Severity',
      accessor: (a) => <AdminBadge type="card_fraud_risk" value={a.severity} />,
    },
    {
      header: 'Transaction Details',
      accessor: (a) => (
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(a.amount ?? 0, a.currency ?? 'USD')}
          </div>
          <div className="text-slate-500">
            {a.location}
          </div>
        </div>
      ),
    },
    {
      header: 'Status & Detected',
      accessor: (a) => (
        <div className="text-xs space-y-0.5">
          <div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                a.status === 'open' || a.status === 'investigating'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {a.status}
            </span>
          </div>
          <div className="text-slate-400 text-[11px]">
            {formatDate(a.detectedAt)}
          </div>
        </div>
      ),
    },
    {
      header: 'Intervention',
      accessor: (a) => (
        <div className="flex justify-end gap-1.5">
          {a.status === 'open' || a.status === 'investigating' ? (
            <Button
              size="sm"
              onClick={() => {
                setSelectedAlert(a);
                setActionType(a.severity === 'critical' ? 'block_card' : 'freeze_card');
                setShowActionModal(true);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs py-1 px-2.5 h-auto flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Intervene</span>
            </Button>
          ) : (
            <span className="text-xs text-slate-400 italic">Resolved</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
          Card Fraud Radar & Behavioral Anomalies
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Machine learning anomaly detection, velocity spikes, and emergency card hotlisting
        </p>
      </div>

      <AdminCardNav />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Active Fraud Alerts"
          value={pendingAlerts.length.toString()}
          icon={AlertTriangle}
          badge={{ text: 'Requires immediate action', variant: 'warning' }}
        />
        <AdminStatCard
          title="Critical Severity Cases"
          value={criticalCount.toString()}
          icon={ShieldAlert}
          badge={{ text: 'Immediate freeze recommended', variant: 'danger' }}
        />
        <AdminStatCard
          title="Prevented Loss Volume"
          value="$148,200.00"
          icon={Shield}
          change={{ value: 41.2, isPositive: true }}
          period="vs prior 90 days"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(['pending', 'all', 'resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
              statusFilter === tab
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {tab === 'all' ? 'All Alerts' : `${tab} Alerts`}
          </button>
        ))}
      </div>

      <AdminDataTable
        columns={columns}
        data={alerts}
        keyExtractor={(a) => a.id}
        isLoading={loading}
        emptyTitle="No fraud alerts found"
        emptyDescription="All card transactions are within normal statistical risk parameters."
      />

      {/* Action Modal */}
      {selectedAlert && (
        <Modal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          title={`Fraud Countermeasure • ${selectedAlert.cardNumberMasked}`}
          subtitle={`Trigger: ${selectedAlert.triggerRule} (${formatCurrency(selectedAlert.amount ?? 0, selectedAlert.currency ?? 'USD')})`}
          maxWidth="md"
        >
          <form onSubmit={handleResolve} className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-semibold text-rose-900 dark:text-rose-200">
                <span>Cardholder:</span>
                <span>{selectedAlert.customerName}</span>
              </div>
              <div className="flex justify-between text-rose-800 dark:text-rose-300">
                <span>Location:</span>
                <span>{selectedAlert.location}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Administrative Intervention Action
              </label>
              <select
                value={actionType}
                onChange={(e) =>
                  setActionType(e.target.value as 'freeze_card' | 'block_card' | 'dismiss' | 'mark_false_positive')
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="freeze_card">Apply Immediate Temporary Freeze (Cardholder Contact Pending)</option>
                <option value="block_card">Hotlist & Permanently Block Card (Confirmed Compromise)</option>
                <option value="dismiss">Dismiss Alert (Verified Legitimate Customer Activity)</option>
                <option value="mark_false_positive">Mark as False Positive (Recalibrate Fraud Radar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Compliance Resolution Case Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Spoke with client on verified satellite phone. Client confirmed in Dubai..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowActionModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={submitting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Execute Action & Close Alert
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
