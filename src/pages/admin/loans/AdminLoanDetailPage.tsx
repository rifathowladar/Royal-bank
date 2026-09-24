import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminBadge } from '../../../components/admin/AdminBadge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/index.ts';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  adminLoanService,
  AdminLoanApplication,
  LoanWorkflowStage,
} from '../../../backend/services/adminLoanService.ts';
import {
  Banknote,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Sliders,
  Percent,
  DollarSign,
  Zap,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Building,
  User,
  History,
  Send,
  Plus,
} from 'lucide-react';

const WORKFLOW_STEPS: { stage: LoanWorkflowStage; label: string }[] = [
  { stage: 'pending', label: '1. Intake' },
  { stage: 'kyc_review', label: '2. KYC Review' },
  { stage: 'credit_assessment', label: '3. Credit Assess' },
  { stage: 'risk_review', label: '4. Risk Review' },
  { stage: 'approved', label: '5. Approved' },
  { stage: 'disbursed', label: '6. Disbursed' },
  { stage: 'active', label: '7. Active Facility' },
];

export const AdminLoanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<AdminLoanApplication | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [targetAdvanceStage, setTargetAdvanceStage] = useState<LoanWorkflowStage>('kyc_review');
  const [advanceNotes, setAdvanceNotes] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [showInterestModal, setShowInterestModal] = useState(false);
  const [newInterestRate, setNewInterestRate] = useState(5.5);
  const [interestReason, setInterestReason] = useState('');

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [newAmount, setNewAmount] = useState(1000000);
  const [limitReason, setLimitReason] = useState('');

  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docNotes, setDocNotes] = useState('');

  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseNotes, setDisburseNotes] = useState('');

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchLoan = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminLoanService.getLoanById(id);
      if (!data) {
        addToast('Loan facility not found', 'error');
        navigate('/admin/loans');
        return;
      }
      setLoan(data);
      setNewInterestRate(data.annualInterestRate);
      setNewAmount(data.approvedAmount || data.requestedAmount);
    } catch {
      addToast('Error fetching loan facility', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan();
  }, [id]);

  if (loading || !loan) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading credit facility file...
      </div>
    );
  }

  // Get current step index
  const currentStepIdx = WORKFLOW_STEPS.findIndex((s) => s.stage === loan.stage);

  // Next logical stage in sequence
  const getNextStage = (curr: LoanWorkflowStage): LoanWorkflowStage | null => {
    switch (curr) {
      case 'pending':
        return 'kyc_review';
      case 'kyc_review':
        return 'credit_assessment';
      case 'credit_assessment':
        return 'risk_review';
      case 'risk_review':
        return 'approved';
      default:
        return null;
    }
  };

  const nextStage = getNextStage(loan.stage);

  const handleAdvanceConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLoanService.advanceWorkflowStage(
        loan.id,
        targetAdvanceStage,
        advanceNotes || `Stage advanced to ${targetAdvanceStage}`
      );
      addToast(`Advanced workflow stage to ${targetAdvanceStage}`, 'success');
      setShowAdvanceModal(false);
      setAdvanceNotes('');
      fetchLoan();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stage advancement failed';
      addToast(msg, 'error');
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLoanService.rejectLoan(loan.id, rejectReason || 'Did not meet credit policy threshold');
      addToast('Application declined and archived', 'warning');
      setShowRejectModal(false);
      fetchLoan();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      addToast(msg, 'error');
    }
  };

  const handleInterestConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLoanService.changeInterestRate(
        loan.id,
        newInterestRate,
        interestReason || 'Board discretionary margin adjustment'
      );
      addToast(`Interest rate updated to ${newInterestRate}%`, 'success');
      setShowInterestModal(false);
      fetchLoan();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update interest';
      addToast(msg, 'error');
    }
  };

  const handleLimitConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLoanService.changeLoanAmount(
        loan.id,
        newAmount,
        limitReason || 'Approved amount revised per collateral valuation'
      );
      addToast(`Approved facility amount updated to $${newAmount.toLocaleString()}`, 'success');
      setShowLimitModal(false);
      fetchLoan();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update facility amount';
      addToast(msg, 'error');
    }
  };

  const handleRequestDocConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;
    try {
      await adminLoanService.requestDocuments(loan.id, [docName], docNotes);
      addToast(`Requested supplementary document: ${docName}`, 'success');
      setShowDocModal(false);
      setDocName('');
      setDocNotes('');
      fetchLoan();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to request document';
      addToast(msg, 'error');
    }
  };

  const handleDisburseConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLoanService.approveDisbursement(
        loan.id,
        disburseNotes || 'Cleared by Treasury Escrow Desk'
      );
      addToast(`Disbursed $${loan.approvedAmount.toLocaleString()} to ledger account`, 'success');
      setShowDisburseModal(false);
      fetchLoan();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Disbursement failed';
      addToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/loans')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Facilities</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                {loan.loanNumber}
              </h1>
              <AdminBadge type="loan_stage" value={loan.stage} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Borrower: <span className="font-semibold text-slate-700 dark:text-slate-300">{loan.customerName}</span> ({loan.customerId})
            </p>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-2 flex-wrap">
          {loan.stage !== 'active' && loan.stage !== 'completed' && loan.stage !== 'rejected' && (
            <>
              {nextStage && (
                <Button
                  size="sm"
                  onClick={() => {
                    setTargetAdvanceStage(nextStage);
                    setShowAdvanceModal(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Advance to {nextStage.replace('_', ' ').toUpperCase()}</span>
                </Button>
              )}

              {loan.stage === 'approved' && (
                <Button
                  size="sm"
                  onClick={() => setShowDisburseModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Approve Disbursement</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInterestModal(true)}
                className="flex items-center gap-1"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Rate ({loan.annualInterestRate}%)</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLimitModal(true)}
                className="flex items-center gap-1"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Adjust Limit</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDocModal(true)}
                className="flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Request Doc</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectModal(true)}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                <span>Decline</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Visual Workflow Stepper */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Underwriting Lifecycle Progress
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isCompleted = currentStepIdx > idx || loan.stage === 'active' || loan.stage === 'completed';
            const isCurrent = step.stage === loan.stage;

            return (
              <div
                key={step.stage}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold shadow-sm'
                    : isCompleted
                    ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  )}
                </div>
                <div className="text-xs font-semibold">{step.label}</div>
              </div>
            );
          })}
        </div>

        {loan.statusNotes && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">Stage Note:</span>
            <span>{loan.statusNotes}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Details & Underwriting Rationale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Financial Structure */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Banknote className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Facility Terms & Economics
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Requested Principal:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(loan.requestedAmount, loan.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Approved Principal:</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(loan.approvedAmount, loan.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Annual Interest Rate:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {loan.annualInterestRate}% Fixed
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Facility Term:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {loan.termMonths} Months ({loan.termMonths / 12} Years)
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="text-slate-500 font-semibold">Monthly EMI:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrency(loan.monthlyInstallment, loan.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Interest & Repayment:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {formatCurrency(loan.totalRepayment, loan.currency)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="text-slate-500">Disbursement Ledger:</span>
              <span className="font-mono text-slate-900 dark:text-white">
                {loan.disbursementAccountNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Creditworthiness & Collateral */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Underwriting Ratios & Collateral
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Credit Score (FICO):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {loan.creditScore} (Super-Prime Tier)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Debt-to-Income (DTI):</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {loan.debtToIncomeRatio}% (Policy Cap: 45%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Facility Type:</span>
              <span className="capitalize font-semibold text-slate-900 dark:text-white">
                {loan.type.replace('_', ' ')}
              </span>
            </div>

            {loan.collateralDescription && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700/60">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Pledged Collateral
                </div>
                <div className="text-slate-800 dark:text-slate-200 font-medium">
                  {loan.collateralDescription}
                </div>
                {loan.collateralValueUSD && (
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Appraised Value:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(loan.collateralValueUSD, 'USD')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Documentation Checklist */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Document Verification
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDocModal(true)}
              className="text-xs h-7 px-2"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2 text-xs">
            {loan.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white truncate">
                    {doc.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {doc.category} {doc.submittedAt && `• ${doc.submittedAt}`}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 ${
                    doc.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : doc.status === 'requested'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit History Timeline */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Underwriting & Decision Audit Trail
          </h3>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {loan.stageHistory.map((item, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {item.stage.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {formatDate(item.changedAt)}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    by {item.changedBy}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Advance Stage */}
      <Modal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        title="Advance Underwriting Stage"
        subtitle={`Promote application to ${targetAdvanceStage.replace('_', ' ').toUpperCase()}`}
        maxWidth="md"
      >
        <form onSubmit={handleAdvanceConfirm} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Target Workflow Stage
            </label>
            <select
              value={targetAdvanceStage}
              onChange={(e) => setTargetAdvanceStage(e.target.value as LoanWorkflowStage)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="kyc_review">KYC Review</option>
              <option value="credit_assessment">Credit Assessment</option>
              <option value="risk_review">Risk Review</option>
              <option value="approved">Approved by Credit Committee</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Underwriting Assessment Notes
            </label>
            <textarea
              value={advanceNotes}
              onChange={(e) => setAdvanceNotes(e.target.value)}
              placeholder="e.g. Borrower verified. Net liquid assets exceed 3x facility requirements..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowAdvanceModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
              Advance Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Approve Disbursement */}
      <Modal
        isOpen={showDisburseModal}
        onClose={() => setShowDisburseModal(false)}
        title="Execute Loan Disbursement"
        subtitle={`Release $${loan.approvedAmount.toLocaleString()} to ${loan.disbursementAccountNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleDisburseConfirm} className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-1 text-emerald-800 dark:text-emerald-300">
            <p className="font-semibold">Core Ledger Credit Authorized</p>
            <p>
              Confirming disbursement will credit <strong>${loan.approvedAmount.toLocaleString()}</strong> directly to customer ledger <strong>{loan.disbursementAccountNumber}</strong> and activate recurring monthly amortizations.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Treasury Settlement Reference / Notes
            </label>
            <textarea
              value={disburseNotes}
              onChange={(e) => setDisburseNotes(e.target.value)}
              placeholder="Settlement advice #TR-9901 issued. Collateral deed escrow recorded."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowDisburseModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Authorize Disbursement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Adjust Interest Rate */}
      <Modal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        title="Adjust Facility Interest Rate"
        subtitle="Recalculates monthly installments (EMI) and total facility repayment schedule"
        maxWidth="md"
      >
        <form onSubmit={handleInterestConfirm} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Annual Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.05"
              value={newInterestRate}
              onChange={(e) => setNewInterestRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span>Estimated New EMI:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                ${adminLoanService.calculateEMI(loan.approvedAmount, newInterestRate, loan.termMonths).toLocaleString()} / mo
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Credit Committee Rationale
            </label>
            <textarea
              value={interestReason}
              onChange={(e) => setInterestReason(e.target.value)}
              placeholder="e.g. Risk premium reduced due to high-value liquid securities pledge..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowInterestModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
              Save Interest Rate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Adjust Approved Amount / Limit */}
      <Modal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Adjust Approved Limit"
        subtitle="Revise principal facility ceiling"
        maxWidth="md"
      >
        <form onSubmit={handleLimitConfirm} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Approved Principal ($)
            </label>
            <input
              type="number"
              step="10000"
              value={newAmount}
              onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Underwriter Justification
            </label>
            <textarea
              value={limitReason}
              onChange={(e) => setLimitReason(e.target.value)}
              placeholder="e.g. Collateral appraisal permits higher debt ceiling at 65% LTV..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowLimitModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
              Update Facility Amount
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Request Documents */}
      <Modal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        title="Request Supplementary Documentation"
        subtitle="Prompt borrower portal for specific proof or certified certificates"
        maxWidth="md"
      >
        <form onSubmit={handleRequestDocConfirm} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Requirement Title
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Certified Property Appraisal 2026 or 3-Year Audited Ledger"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Instructions for Applicant
            </label>
            <textarea
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              placeholder="Provide signed certified copy from a licensed appraiser..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowDocModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
              Send Requirement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Decline Loan */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Decline Credit Facility"
        subtitle="Issue formal administrative decline notice to borrower"
        maxWidth="md"
      >
        <form onSubmit={handleRejectConfirm} className="space-y-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs text-rose-800 dark:text-rose-300">
            <strong>Adverse Action Notice:</strong> A documented rationale must be recorded per credit underwriting regulations.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mandatory Adverse Action Rationale
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Unsubstantiated debt-service coverage ratio or insufficient collateral margin..."
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
              Confirm Facility Decline
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
