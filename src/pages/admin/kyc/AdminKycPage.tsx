import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminKycNav } from '../../../components/admin/AdminKycNav.tsx';
import { AdminStatCard } from '../../../components/admin/AdminStatCard.tsx';
import { AdminDataTable, Column } from '../../../components/admin/AdminDataTable.tsx';
import { AdminFilterBar } from '../../../components/admin/AdminFilterBar.tsx';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminKycService,
  AdminKycDossier,
  AdminKycStatus,
  KycRiskClassification,
  KycDocumentItem,
} from '../../../backend/services/adminKycService.ts';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  User,
  MapPin,
  Briefcase,
  DollarSign,
  Shield,
  Layers,
  CheckSquare,
  Square,
  ZoomIn,
  Send,
  Sliders,
} from 'lucide-react';

interface AdminKycPageProps {
  forcedStatus?: AdminKycStatus;
}

export const AdminKycPage: React.FC<AdminKycPageProps> = ({ forcedStatus }) => {
  const location = useLocation();
  const inferredStatus: AdminKycStatus | 'all' = forcedStatus
    ? forcedStatus
    : location.pathname.includes('/pending')
    ? 'pending'
    : location.pathname.includes('/verified')
    ? 'verified'
    : location.pathname.includes('/rejected')
    ? 'rejected'
    : 'all';

  const [dossiers, setDossiers] = useState<AdminKycDossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  // Active Dossier Workbench
  const [selectedDossier, setSelectedDossier] = useState<AdminKycDossier | null>(null);
  const [activeDocPreview, setActiveDocPreview] = useState<KycDocumentItem | null>(null);

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionInstructions, setCorrectionInstructions] = useState('');

  const [showRiskModal, setShowRiskModal] = useState(false);
  const [newRiskRating, setNewRiskRating] = useState<KycRiskClassification>('Low');
  const [riskReason, setRiskReason] = useState('');

  const { addToast } = useToast();

  const loadDossiers = async () => {
    setLoading(true);
    try {
      const data = await adminKycService.getDossiers({
        status: inferredStatus,
        riskRating: riskFilter as any,
        search,
      });
      setDossiers(data);
      // Keep selected dossier in sync if open
      if (selectedDossier) {
        const refreshed = data.find((d) => d.id === selectedDossier.id);
        if (refreshed) {
          setSelectedDossier(refreshed);
          if (activeDocPreview) {
            const docRefreshed = refreshed.documents.find((d) => d.id === activeDocPreview.id);
            if (docRefreshed) setActiveDocPreview(docRefreshed);
          }
        }
      }
    } catch {
      addToast('Error loading KYC compliance dossiers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDossiers();
  }, [inferredStatus, riskFilter, search]);

  const pendingCount = dossiers.filter((d) => d.status === 'pending').length;
  const verifiedCount = dossiers.filter((d) => d.status === 'verified').length;
  const rejectedCount = dossiers.filter((d) => d.status === 'rejected').length;

  const handleToggleChecklist = async (dossierId: string, checklistId: string, currentPassed: boolean) => {
    try {
      const updated = await adminKycService.toggleChecklistItem(dossierId, checklistId, !currentPassed);
      setSelectedDossier(updated);
      loadDossiers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checklist update failed';
      addToast(msg, 'error');
    }
  };

  const handleApproveKyc = async () => {
    if (!selectedDossier) return;
    try {
      const updated = await adminKycService.approveKyc(
        selectedDossier.id,
        'Full compliance clearance issued by Julian Cross (Compliance Officer)'
      );
      addToast(`KYC verified for ${updated.fullName}`, 'success');
      setSelectedDossier(updated);
      loadDossiers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed';
      addToast(msg, 'error');
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDossier) return;
    try {
      const updated = await adminKycService.rejectKyc(
        selectedDossier.id,
        rejectReason || 'Declined under AML customer due diligence criteria'
      );
      addToast(`KYC rejected for ${updated.fullName}`, 'warning');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedDossier(updated);
      loadDossiers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed';
      addToast(msg, 'error');
    }
  };

  const handleCorrectionConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDossier) return;
    try {
      const updated = await adminKycService.requestCorrection(
        selectedDossier.id,
        correctionInstructions,
        activeDocPreview ? [activeDocPreview.id] : []
      );
      addToast('Correction notice sent to customer', 'info');
      setShowCorrectionModal(false);
      setCorrectionInstructions('');
      setSelectedDossier(updated);
      loadDossiers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      addToast(msg, 'error');
    }
  };

  const handleRiskConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDossier) return;
    try {
      const updated = await adminKycService.updateRiskClassification(
        selectedDossier.id,
        newRiskRating,
        riskReason || 'Annual risk committee re-evaluation'
      );
      addToast(`Risk re-rated to ${newRiskRating}`, 'success');
      setShowRiskModal(false);
      setRiskReason('');
      setSelectedDossier(updated);
      loadDossiers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Risk re-rating failed';
      addToast(msg, 'error');
    }
  };

  const columns: Column<AdminKycDossier>[] = [
    {
      header: 'Applicant Dossier',
      accessor: (d) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{d.fullName}</span>
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {d.customerNumber} • {d.nationality}
          </div>
        </div>
      ),
    },
    {
      header: 'Occupation & Wealth Origin',
      accessor: (d) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
            {d.occupation}
          </div>
          <div className="text-slate-500 truncate max-w-[200px] mt-0.5">
            {d.sourceOfWealth}
          </div>
        </div>
      ),
    },
    {
      header: 'Expected Monthly Turnover',
      accessor: (d) => (
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(d.expectedMonthlyTurnoverUSD, 'USD')} / mo
          </div>
          <div className="text-slate-500">
            Income: {formatCurrency(d.estimatedAnnualIncomeUSD, 'USD')}
          </div>
        </div>
      ),
    },
    {
      header: 'Risk Classification',
      accessor: (d) => <AdminBadge type="risk_score" value={d.riskRating.toLowerCase()} />,
    },
    {
      header: 'Status & Screening',
      accessor: (d) => (
        <div className="space-y-1">
          <AdminBadge type="kyc_status" value={d.status} />
          {d.isPep && (
            <span className="block text-[10px] font-bold text-rose-600 dark:text-rose-400">
              PEP Nexus Flag
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Verification',
      accessor: (d) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              setSelectedDossier(d);
              if (d.documents.length > 0) setActiveDocPreview(d.documents[0]);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs py-1 px-3 h-auto flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open Dossier</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            KYC Verification & AML Customer Due Diligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Biometric facial match, sanctions watchlist screening, PEP disclosures, and document authentication
          </p>
        </div>
      </div>

      <AdminKycNav />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <AdminStatCard
          title="Pending Compliance Intake"
          value={pendingCount.toString()}
          icon={Clock}
          badge={{ text: 'Action required', variant: 'warning' }}
        />
        <AdminStatCard
          title="Verified Sovereign Clients"
          value={verifiedCount.toString()}
          icon={CheckCircle2}
          badge={{ text: 'Compliant Tier', variant: 'success' }}
        />
        <AdminStatCard
          title="AML Declines / Refusals"
          value={rejectedCount.toString()}
          icon={XCircle}
          badge={{ text: 'Watchlist Flagged', variant: 'danger' }}
        />
        <AdminStatCard
          title="Sanction Surveillance"
          value="100% Screened"
          icon={ShieldCheck}
          badge={{ text: 'UN/OFAC Core', variant: 'info' }}
        />
      </div>

      {/* Filter Bar */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customer name, ID, nationality, email, occupation..."
        filters={[
          {
            label: 'Risk Classification',
            value: riskFilter,
            onChange: setRiskFilter,
            options: [
              { label: 'All Risk Ratings', value: 'all' },
              { label: 'Low Risk', value: 'Low' },
              { label: 'Medium Risk', value: 'Medium' },
              { label: 'High Risk', value: 'High' },
              { label: 'PEP / Sanctioned', value: 'PEP/Sanctioned' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setRiskFilter('all');
        }}
      />

      {/* Table */}
      <AdminDataTable
        columns={columns}
        data={dossiers}
        keyExtractor={(d) => d.id}
        isLoading={loading}
        emptyTitle="No KYC dossiers found"
        emptyDescription="All customer files in this section are processed."
      />

      {/* Complete Underwriting & Verification Workbench Modal */}
      {selectedDossier && (
        <Modal
          isOpen={!!selectedDossier}
          onClose={() => {
            setSelectedDossier(null);
            setActiveDocPreview(null);
          }}
          title={`KYC Compliance Dossier • ${selectedDossier.fullName} (${selectedDossier.customerNumber})`}
          subtitle={`Submitted: ${formatDate(selectedDossier.submittedAt)} • Risk: ${selectedDossier.riskRating}`}
          maxWidth="xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Action Bar Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <AdminBadge type="kyc_status" value={selectedDossier.status} />
                <AdminBadge type="risk_score" value={selectedDossier.riskRating.toLowerCase()} />
                {selectedDossier.isPep && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    PEP Flag
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewRiskRating(selectedDossier.riskRating);
                    setShowRiskModal(true);
                  }}
                  className="flex items-center gap-1 text-xs"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Re-rate Risk</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCorrectionModal(true)}
                  className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Request Correction</span>
                </Button>

                {selectedDossier.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center gap-1 text-xs border-rose-300 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </Button>
                )}

                {selectedDossier.status !== 'verified' && (
                  <Button
                    size="sm"
                    onClick={handleApproveKyc}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Split View: Left Document Previewer, Right Customer Info & Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Document Viewer (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Document Viewer</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {selectedDossier.documents.length} files
                  </span>
                </div>

                {/* Document Selector Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {selectedDossier.documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setActiveDocPreview(doc)}
                      className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                        activeDocPreview?.id === doc.id
                          ? 'bg-amber-600 text-white font-medium shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {doc.type.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Active Document Viewer Card */}
                {activeDocPreview && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-3 space-y-3">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                      <img
                        src={activeDocPreview.fileUrl}
                        alt={activeDocPreview.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            activeDocPreview.verificationStatus === 'verified'
                              ? 'bg-emerald-500 text-white'
                              : activeDocPreview.verificationStatus === 'rejected'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {activeDocPreview.verificationStatus}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="font-semibold text-white">{activeDocPreview.title}</div>
                      {activeDocPreview.documentNumberMasked && (
                        <div className="font-mono text-slate-400">
                          Number: {activeDocPreview.documentNumberMasked}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400">
                        Country: {activeDocPreview.issueCountry}{' '}
                        {activeDocPreview.expiryDate && `• Expires: ${activeDocPreview.expiryDate}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Customer Dossier & Checklist (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Customer Information Dossier */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <h4 className="font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <User className="w-4 h-4 text-amber-500" />
                    <span>Applicant Profile & Source of Wealth</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500">Date of Birth:</span>
                      <span className="font-medium text-slate-900 dark:text-white block mt-0.5">
                        {selectedDossier.dateOfBirth}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Tax Identification No:</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-white block mt-0.5">
                        {selectedDossier.taxIdentificationNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Occupation / Employer:</span>
                      <span className="font-medium text-slate-900 dark:text-white block mt-0.5">
                        {selectedDossier.occupation} ({selectedDossier.employer})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Residential Address:</span>
                      <span className="font-medium text-slate-900 dark:text-white block mt-0.5">
                        {selectedDossier.residentialAddress.street}, {selectedDossier.residentialAddress.city} (
                        {selectedDossier.residentialAddress.country})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Estimated Annual Income:</span>
                      <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                        {formatCurrency(selectedDossier.estimatedAnnualIncomeUSD, 'USD')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Expected Monthly Turnover:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        {formatCurrency(selectedDossier.expectedMonthlyTurnoverUSD, 'USD')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 block mb-0.5">Documented Source of Wealth:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedDossier.sourceOfWealth}
                    </span>
                  </div>

                  {selectedDossier.isPep && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-800 dark:text-rose-200">
                      <div className="font-bold">Politically Exposed Person (PEP) Disclosure:</div>
                      <div>{selectedDossier.pepDetails}</div>
                    </div>
                  )}
                </div>

                {/* Interactive Verification Checklist */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Compliance Verification Checklist</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      {selectedDossier.checklist.filter((c) => c.passed).length} of{' '}
                      {selectedDossier.checklist.length} satisfied
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedDossier.checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          handleToggleChecklist(selectedDossier.id, item.id, item.passed)
                        }
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 cursor-pointer hover:border-amber-400 transition-colors"
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.passed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {item.label}
                            </span>
                            {item.score && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                  item.passed
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {item.score}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit & Notes Log */}
                {selectedDossier.notesHistory.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Audit Notes History
                    </h5>
                    <div className="space-y-1.5">
                      {selectedDossier.notesHistory.map((n, i) => (
                        <div
                          key={i}
                          className="p-2 bg-slate-100 dark:bg-slate-800/60 rounded text-xs text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                            <span className="font-semibold">{n.author}</span>
                            <span>{formatDate(n.date)}</span>
                          </div>
                          <p>{n.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Request Correction */}
      {selectedDossier && (
        <Modal
          isOpen={showCorrectionModal}
          onClose={() => setShowCorrectionModal(false)}
          title={`Request Correction • ${selectedDossier.fullName}`}
          subtitle="Prompt applicant portal for corrected or clearer document uploads"
          maxWidth="md"
        >
          <form onSubmit={handleCorrectionConfirm} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Specific Correction Instructions
              </label>
              <textarea
                value={correctionInstructions}
                onChange={(e) => setCorrectionInstructions(e.target.value)}
                placeholder="The utility bill statement must be dated within 90 days. Please provide your latest municipal council tax or electricity statement..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowCorrectionModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Dispatch Correction Request
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Decline KYC */}
      {selectedDossier && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title={`Decline KYC Dossier • ${selectedDossier.fullName}`}
          subtitle="Document statutory compliance rationale for formal refusal"
          maxWidth="md"
        >
          <form onSubmit={handleRejectConfirm} className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs text-rose-800 dark:text-rose-300">
              <strong>Refusal Notice:</strong> Account onboarding will terminate and the customer will be marked unverified.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Compliance Officer Refusal Rationale
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Unsubstantiated source of funds or sanctioned jurisdiction nexus..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
                Confirm KYC Refusal
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Re-Rate Risk */}
      {selectedDossier && (
        <Modal
          isOpen={showRiskModal}
          onClose={() => setShowRiskModal(false)}
          title={`Re-Rate AML Risk Rating • ${selectedDossier.fullName}`}
          subtitle="Adjust customer risk profile"
          maxWidth="md"
        >
          <form onSubmit={handleRiskConfirm} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Risk Tier
              </label>
              <select
                value={newRiskRating}
                onChange={(e) => setNewRiskRating(e.target.value as KycRiskClassification)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
                <option value="PEP/Sanctioned">PEP / Sanctioned Watch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Risk Committee Re-Rating Justification
              </label>
              <textarea
                value={riskReason}
                onChange={(e) => setRiskReason(e.target.value)}
                placeholder="Client verified as beneficial owner with international liquid audit..."
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowRiskModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Update Risk Rating
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
