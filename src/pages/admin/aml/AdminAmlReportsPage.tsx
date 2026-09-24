import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Search,
  Filter,
  RefreshCw,
  Download,
  ExternalLink,
  ShieldCheck,
  FileText,
  Building,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { PermissionGate } from '../../../components/common/PermissionGate.tsx';
import { useToast } from '../../../hooks/index.ts';
import { adminAmlService } from '../../../backend/services/adminAmlService.ts';
import { AmlReport } from '../../../backend/types/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';

export const AdminAmlReportsPage: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<AmlReport[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Preview modal
  const [selectedReport, setSelectedReport] = useState<AmlReport | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminAmlService.getReports({
        type: typeFilter,
        search,
      });
      setReports(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to load regulatory reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const handleExport = (report: AmlReport) => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `${report.reportNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast(`Exported ${report.reportNumber} regulatory filing.`, 'success');
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
            Regulatory Filings (SAR / CTR / STR)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Archived and submitted Suspicious Activity Reports (SAR) and Currency Transaction Reports (CTR).
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
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            Case Management
          </Link>
          <Link
            to="/admin/aml/reports"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            SAR Reports
          </Link>
          <Button variant="outline" size="sm" onClick={fetchReports}>
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
              placeholder="Search by Report #, Customer Name, or Regulator..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <Button type="submit" size="sm" variant="primary">
            Search
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">Report Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            >
              <option value="all">All Filing Types</option>
              <option value="SAR">SAR (Suspicious Activity Report)</option>
              <option value="CTR">CTR (Currency Transaction Report)</option>
              <option value="STR">STR (Suspicious Transaction Report)</option>
            </select>
          </div>

          <div className="text-slate-500 text-[11px]">
            Filings: <span className="font-bold text-slate-800 dark:text-slate-200">{reports.length}</span>
          </div>
        </div>
      </Card>

      {/* Reports Table */}
      <Card className="overflow-hidden">
        {loading && !reports.length ? (
          <div className="p-8">
            <LoadingState message="Accessing regulatory vault archives..." />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileCheck className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold">No regulatory reports found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Report Number</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Subject / Customer</th>
                  <th className="px-4 py-3">Filing Date</th>
                  <th className="px-4 py-3">Regulatory Body</th>
                  <th className="px-4 py-3">Suspicious Volume</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-royal-600 dark:text-royal-400">
                      {report.reportNumber}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {report.type}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                      {report.customerName}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {formatDate(report.filingDate)}
                    </td>

                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={report.regulator}>
                      {report.regulator}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(report.totalSuspiciousAmountUSD, 'USD')}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          report.status === 'submitted'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : report.status === 'acknowledged'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedReport(report)}
                          className="h-7 px-2 text-xs"
                        >
                          Preview
                        </Button>

                        <PermissionGate resource="reports" action="export">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExport(report)}
                            className="h-7 px-2 text-xs"
                            title="Export Encrypted Filing JSON"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
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

      {/* Preview Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Regulatory Dossier • ${selectedReport.reportNumber} (${selectedReport.type})`}
          subtitle={`Transmitted to: ${selectedReport.regulator}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Subject Customer</span>
                <div className="mt-1 font-bold text-slate-900 dark:text-white">{selectedReport.customerName}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Filing Date</span>
                <div className="mt-1 font-semibold">{formatDate(selectedReport.filingDate)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Reported Volume</span>
                <div className="mt-1 font-mono font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedReport.totalSuspiciousAmountUSD, 'USD')}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Compliance Officer</span>
                <div className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{selectedReport.preparedBy}</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                Filing Narrative & Supporting Facts
              </h4>
              <p className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {selectedReport.narrative}
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button size="sm" variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
              <PermissionGate resource="reports" action="export">
                <Button size="sm" variant="primary" onClick={() => handleExport(selectedReport)}>
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download Verified Dossier
                </Button>
              </PermissionGate>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
