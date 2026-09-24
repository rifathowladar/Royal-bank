import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  Search,
  Filter,
  RefreshCw,
  FileCheck,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { PermissionGate } from '../../../components/common/PermissionGate.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminAmlService } from '../../../backend/services/adminAmlService.ts';
import { AmlCase } from '../../../backend/types/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';

export const AdminAmlCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<AmlCase[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Selected case
  const [selectedCase, setSelectedCase] = useState<AmlCase | null>(null);

  // File SAR Modal
  const [sarModalOpen, setSarModalOpen] = useState(false);
  const [sarRegulator, setSarRegulator] = useState('Financial Crimes Enforcement Network (FinCEN)');
  const [sarNarrative, setSarNarrative] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await adminAmlService.getCases({
        status: statusFilter,
        priority: priorityFilter,
        search,
      });
      setCases(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch AML cases.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter, priorityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCases();
  };

  const handleFileSar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setIsSubmitting(true);

    try {
      const rep = await adminAmlService.fileSarReport({
        customerId: selectedCase.customerId,
        customerName: selectedCase.customerName,
        regulator: sarRegulator,
        suspectTransactions: selectedCase.alertIds,
        narrative: sarNarrative || selectedCase.narrativeSummary,
        totalSuspiciousAmountUSD: selectedCase.totalVolumeUSD,
      });

      addToast(`SAR Report ${rep.reportNumber} transmitted to ${rep.regulator}`, 'success');
      setSarModalOpen(false);
      fetchCases();
      navigate('/admin/aml/reports');
    } catch (err: any) {
      addToast(err.message || 'SAR filing failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (p: AmlCase['priority']) => {
    switch (p) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link to="/admin/aml" className="text-xs text-royal-600 dark:text-royal-400 hover:underline">
            &larr; Back to AML Hub
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            AML Case Management & FIU Inquiries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured forensic investigations, regulatory disclosure filings, and compliance officer endorsements.
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
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Transaction Monitoring
          </Link>
          <Link
            to="/admin/aml/cases"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            Case Management
          </Link>
          <Link
            to="/admin/aml/reports"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            SAR Reports
          </Link>
          <Button variant="outline" size="sm" onClick={fetchCases}>
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
              placeholder="Search by Case #, Customer, or Assigned Analyst..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <Button type="submit" size="sm" variant="primary">
            Search
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
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
                <option value="regulatory_reporting">Regulatory Reporting</option>
                <option value="sar_submitted">SAR Submitted</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">All Priorities</option>
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

      {/* Case Grid */}
      <div className="space-y-3">
        {loading && !cases.length ? (
          <div className="p-8">
            <LoadingState message="Loading case dossiers..." />
          </div>
        ) : cases.length === 0 ? (
          <Card className="p-12 text-center text-slate-500">
            <Scale className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold">No AML cases found.</p>
          </Card>
        ) : (
          cases.map((c) => (
            <Card
              key={c.id}
              className="p-5 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-royal-600 dark:text-royal-400">
                      {c.caseNumber}
                    </span>
                    {getPriorityBadge(c.priority)}
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {c.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Updated {formatDate(c.updatedAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Subject: {c.customerName}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {c.narrativeSummary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>
                      Total Exposure: <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(c.totalVolumeUSD, 'USD')}</span>
                    </span>
                    <span>
                      Assigned: <span className="font-medium text-slate-700 dark:text-slate-300">{c.assignedAnalyst}</span>
                    </span>
                    {c.fiuReportRef && (
                      <span className="font-mono text-purple-600 dark:text-purple-400">
                        FIU Ref: {c.fiuReportRef}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCase(c)}
                    className="text-xs"
                  >
                    Examine Dossier &rarr;
                  </Button>

                  <PermissionGate resource="aml" action="approve">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSelectedCase(c);
                        setSarNarrative(c.narrativeSummary);
                        setSarModalOpen(true);
                      }}
                      className="text-xs"
                    >
                      <FileCheck className="w-3.5 h-3.5 mr-1" />
                      File SAR
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Case Detailed Modal */}
      {selectedCase && !sarModalOpen && (
        <Modal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title={`Forensic Case Dossier • ${selectedCase.caseNumber}`}
          subtitle={`Subject: ${selectedCase.customerName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Priority</span>
                <div className="mt-1">{getPriorityBadge(selectedCase.priority)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Status</span>
                <div className="mt-1 font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">
                  {selectedCase.status.replace('_', ' ')}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Suspicious Volume</span>
                <div className="mt-1 font-mono font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedCase.totalVolumeUSD, 'USD')}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Assigned Unit</span>
                <div className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                  {selectedCase.assignedAnalyst}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Forensic Case Narrative & Structuring Rationale
              </h4>
              <p className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCase.narrativeSummary}
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button size="sm" variant="outline" onClick={() => setSelectedCase(null)}>
                Close
              </Button>
              <PermissionGate resource="aml" action="approve">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setSarNarrative(selectedCase.narrativeSummary);
                    setSarModalOpen(true);
                  }}
                >
                  <FileCheck className="w-3.5 h-3.5 mr-1" />
                  Proceed to SAR Filing &rarr;
                </Button>
              </PermissionGate>
            </div>
          </div>
        </Modal>
      )}

      {/* SAR Regulatory Filing Modal */}
      {sarModalOpen && selectedCase && (
        <Modal
          isOpen={sarModalOpen}
          onClose={() => setSarModalOpen(false)}
          title={`File Suspicious Activity Report (SAR) • ${selectedCase.caseNumber}`}
          subtitle={`Filing for ${selectedCase.customerName} (${formatCurrency(selectedCase.totalVolumeUSD, 'USD')})`}
          maxWidth="md"
        >
          <form onSubmit={handleFileSar} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Regulatory Body
              </label>
              <select
                value={sarRegulator}
                onChange={(e) => setSarRegulator(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Financial Crimes Enforcement Network (FinCEN)">
                  FinCEN (US Treasury)
                </option>
                <option value="Financial Conduct Authority (FCA)">
                  FCA (United Kingdom)
                </option>
                <option value="Swiss Financial Market Supervisory Authority (FINMA)">
                  FINMA (Switzerland)
                </option>
                <option value="Monetary Authority of Singapore (MAS)">
                  MAS (Singapore)
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Statutory SAR Narrative
              </label>
              <textarea
                required
                rows={5}
                value={sarNarrative}
                onChange={(e) => setSarNarrative(e.target.value)}
                placeholder="Include complete details on funds flow, declared versus actual profile, and suspect transactions..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setSarModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="danger" disabled={isSubmitting}>
                {isSubmitting ? 'Transmitting...' : 'Submit Regulatory SAR'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
