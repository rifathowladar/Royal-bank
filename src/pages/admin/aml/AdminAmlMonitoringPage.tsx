import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Scale,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Lock,
  FilePlus,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { PermissionGate } from '../../../components/common/PermissionGate.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminAmlService } from '../../../backend/services/adminAmlService.ts';
import { AmlAlert, AmlActivityType } from '../../../backend/types/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';

export const AdminAmlMonitoringPage: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AmlAlert[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  // Case creation modal
  const [selectedAlert, setSelectedAlert] = useState<AmlAlert | null>(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [casePriority, setCasePriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [caseNarrative, setCaseNarrative] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await adminAmlService.getAlerts({
        status: statusFilter,
        activityType: activityFilter,
        riskRating: riskFilter,
        search,
      });
      setAlerts(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to load monitoring stream.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, activityFilter, riskFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAlerts();
  };

  const handleUpdateStatus = async (alertId: string, newStatus: AmlAlert['status']) => {
    try {
      await adminAmlService.updateAlertStatus(alertId, newStatus, `Status updated to ${newStatus}`);
      addToast(`Alert updated to ${newStatus.toUpperCase()}`, 'success');
      fetchAlerts();
    } catch (err: any) {
      addToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setIsSubmitting(true);

    try {
      const created = await adminAmlService.createAmlCase({
        alertId: selectedAlert.id,
        customerId: selectedAlert.customerId,
        customerName: selectedAlert.customerName,
        riskScore: selectedAlert.matchScore,
        totalVolumeUSD: selectedAlert.amount,
        priority: casePriority,
        narrativeSummary: caseNarrative || selectedAlert.notes || 'Initiated from transaction monitoring feed.',
      });
      addToast(`AML Case ${created.caseNumber} registered successfully.`, 'success');
      setShowCaseModal(false);
      setSelectedAlert(null);
      setCaseNarrative('');
      fetchAlerts();
    } catch (err: any) {
      addToast(err.message || 'Failed to create case.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link to="/admin/aml" className="text-xs text-royal-600 dark:text-royal-400 hover:underline">
            &larr; Back to AML Hub
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Transaction Monitoring & Surveillance Grid
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous real-time surveillance of cross-border transfers, smurfing patterns, and sanctions hits.
          </p>
        </div>

        {/* Sub-Nav */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/aml"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Hub
          </Link>
          <Link
            to="/admin/aml/monitoring"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            Transaction Monitoring
          </Link>
          <Link
            to="/admin/aml/cases"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Case Management
          </Link>
          <Link
            to="/admin/aml/reports"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            SAR Reports
          </Link>
          <Button variant="outline" size="sm" onClick={fetchAlerts}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Ref #, Customer, Destination Country, or Sanctions List..."
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
              <span className="text-slate-500 font-medium">Activity Type:</span>
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Patterns</option>
                <option value="Structuring / Smurfing">Structuring / Smurfing</option>
                <option value="Rapid Movement of Funds">Rapid Movement of Funds</option>
                <option value="High-Risk Jurisdiction Wire">High-Risk Jurisdiction Wire</option>
                <option value="PEP Match Hit">PEP Match Hit</option>
                <option value="Sanctions List Candidate">Sanctions List Candidate</option>
                <option value="Inconsistent with Declared Profile">Inconsistent with Declared Profile</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Customer Risk:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Risk Levels</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="PEP">PEP</option>
                <option value="Sanctioned">Sanctioned</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="detected">Detected</option>
                <option value="reviewing">Reviewing</option>
                <option value="cleared">Cleared</option>
                <option value="sar_filed">SAR Filed</option>
                <option value="frozen">Frozen</option>
              </select>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Alerts: <span className="font-bold text-slate-800 dark:text-slate-200">{alerts.length}</span>
          </div>
        </div>
      </Card>

      {/* Surveillance Table */}
      <Card className="overflow-hidden">
        {loading && !alerts.length ? (
          <div className="p-8">
            <LoadingState message="Monitoring live transaction wires..." />
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Activity className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold">No AML alerts matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Reference / Date</th>
                  <th className="px-4 py-3">Customer Risk</th>
                  <th className="px-4 py-3">Activity Pattern</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Jurisdiction</th>
                  <th className="px-4 py-3">Watchlist Match</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-royal-600 dark:text-royal-400">
                        {alert.refNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatDate(alert.detectedAt)}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {alert.customerName}
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          alert.customerRiskRating === 'PEP'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : alert.customerRiskRating === 'High'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {alert.customerRiskRating} Risk
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {alert.activityType}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1" title={alert.notes}>
                        {alert.notes}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(alert.amount, alert.currency)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {alert.destinationCountry}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                        {alert.matchScore}%
                      </span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={alert.matchedList}>
                        {alert.matchedList || 'Behavioral Model'}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          alert.status === 'detected'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : alert.status === 'reviewing'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : alert.status === 'sar_filed'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {alert.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <PermissionGate resource="aml" action="create">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setShowCaseModal(true);
                            }}
                            className="h-7 px-2 text-xs"
                          >
                            <FilePlus className="w-3 h-3 mr-1" />
                            Case
                          </Button>
                        </PermissionGate>

                        <PermissionGate resource="aml" action="edit">
                          {alert.status === 'detected' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(alert.id, 'reviewing')}
                              className="h-7 px-2 text-xs text-amber-600"
                            >
                              Review
                            </Button>
                          )}
                        </PermissionGate>

                        <PermissionGate resource="aml" action="approve">
                          {alert.status !== 'cleared' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(alert.id, 'cleared')}
                              className="h-7 px-2 text-xs text-emerald-600"
                            >
                              Clear
                            </Button>
                          )}
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Case Creation Modal */}
      {showCaseModal && selectedAlert && (
        <Modal
          isOpen={showCaseModal}
          onClose={() => setShowCaseModal(false)}
          title={`Initiate AML Investigation Case • ${selectedAlert.refNumber}`}
          subtitle={`Subject: ${selectedAlert.customerName} (${formatCurrency(selectedAlert.amount, selectedAlert.currency)})`}
          maxWidth="md"
        >
          <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Investigation Priority
              </label>
              <select
                value={casePriority}
                onChange={(e) => setCasePriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="critical">Critical (Imminent Sanctions / Terrorist Financing Risk)</option>
                <option value="high">High (Substantial Structuring / Pass-Through)</option>
                <option value="medium">Medium (Uncharacteristic Activity)</option>
                <option value="low">Low (Routine Attestation)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Forensic Case Narrative
              </label>
              <textarea
                required
                rows={4}
                value={caseNarrative}
                onChange={(e) => setCaseNarrative(e.target.value)}
                placeholder="Detail suspicious structuring, jurisdiction risks, and initial evidence..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCaseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Opening Case...' : 'Register Formal Case'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
