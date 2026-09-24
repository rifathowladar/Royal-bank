import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Clock,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminFraudService } from '../../../backend/services/adminFraudService.ts';
import { FraudCase } from '../../../backend/types/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';

export const AdminFraudCasesPage: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Selected Case Details Modal
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await adminFraudService.getCases({
        status: statusFilter,
        severity: severityFilter,
        search,
      });
      setCases(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to load fraud case dossiers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter, severityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCases();
  };

  const getSeverityBadge = (sev: FraudCase['severity']) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-500 text-white">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500 text-white">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-500 text-white">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-500 text-white">Low</span>;
    }
  };

  const getStatusBadge = (status: FraudCase['status']) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Open</span>;
      case 'investigating':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Investigating</span>;
      case 'escalated_fiu':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Escalated to FIU</span>;
      case 'closed_blocked':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Closed (Blocked)</span>;
      case 'closed_cleared':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Closed (Cleared)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin/fraud" className="text-xs text-royal-600 dark:text-royal-400 hover:underline">
              &larr; Back to Fraud Radar
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Fraud Case Dossiers & SIU Dossiers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Special Investigations Unit (SIU) formal inquiry dossiers, multi-alert bundling, and forensic timeline milestones.
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
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Live Alerts
          </Link>
          <Link
            to="/admin/fraud/cases"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            Case Dossiers
          </Link>
          <Button variant="outline" size="sm" onClick={fetchCases}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <Card className="p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Case #, Title, Customer, or Assigned Analyst..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <Button type="submit" size="sm" variant="primary">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="escalated_fiu">Escalated to FIU</option>
                <option value="closed_blocked">Closed (Blocked)</option>
                <option value="closed_cleared">Closed (Cleared)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Total Cases: <span className="font-bold text-slate-800 dark:text-slate-200">{cases.length}</span>
          </div>
        </div>
      </Card>

      {/* Cases List */}
      <div className="space-y-3">
        {loading && !cases.length ? (
          <div className="p-8">
            <LoadingState message="Retrieving forensic case dossiers..." />
          </div>
        ) : cases.length === 0 ? (
          <Card className="p-12 text-center text-slate-500">
            <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold">No case dossiers found.</p>
          </Card>
        ) : (
          cases.map((c) => (
            <Card
              key={c.id}
              className="p-5 hover:border-royal-300 dark:hover:border-royal-700 transition-colors cursor-pointer"
              onClick={() => setSelectedCase(c)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-royal-600 dark:text-royal-400">
                      {c.caseNumber}
                    </span>
                    {getSeverityBadge(c.severity)}
                    {getStatusBadge(c.status)}
                    <span className="text-[11px] text-slate-400">
                      Opened {formatDate(c.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {c.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>
                      Customer: <span className="font-semibold text-slate-800 dark:text-slate-200">{c.customerName}</span>
                    </span>
                    <span>
                      Assigned: <span className="font-medium text-slate-700 dark:text-slate-300">{c.assignedTo}</span>
                    </span>
                    <span>
                      Exposure: <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatCurrency(c.totalExposureUSD, 'USD')}</span>
                    </span>
                    <span>
                      Linked Alerts: <span className="font-mono font-semibold">{c.alertIds.length}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <Button size="sm" variant="outline" className="text-xs">
                    View Forensic Timeline &rarr;
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Case Detailed Modal */}
      {selectedCase && (
        <Modal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title={`Forensic Dossier • ${selectedCase.caseNumber}`}
          subtitle={selectedCase.title}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs">
            {/* Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Severity</div>
                <div className="mt-1">{getSeverityBadge(selectedCase.severity)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
                <div className="mt-1">{getStatusBadge(selectedCase.status)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Exposure</div>
                <div className="mt-1 font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedCase.totalExposureUSD, 'USD')}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Unit</div>
                <div className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                  {selectedCase.assignedTo}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Executive Incident Narrative
              </h4>
              <p className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCase.summary}
              </p>
            </div>

            {/* Forensic Timeline */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                Chain of Custody & Milestone Timeline
              </h4>
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
                {selectedCase.timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-royal-600 border-2 border-white dark:border-slate-900" />
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{event.action}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        {formatDate(event.timestamp)} • by {event.actor}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{event.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button size="sm" variant="outline" onClick={() => setSelectedCase(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
