import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { kycService } from '../../../backend/services/kycService.ts';
import { KYCProfileState, KYCDocumentItem, KYCVerificationStatus } from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertOctagon,
  FileText,
  UploadCloud,
  CheckCircle2,
  Camera,
  Eye,
  Download,
  RefreshCw,
  Sparkles,
  Award,
  Layers,
  Fingerprint,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const KycPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [kycState, setKycState] = useState<KYCProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<'nid' | 'passport' | 'address_proof' | 'photograph'>('nid');
  const [docNumber, setDocNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<KYCDocumentItem | null>(null);

  // Tab detection
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes('/status')) return 'status';
    if (path.includes('/documents')) return 'documents';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'status' | 'documents'>(getInitialTab());

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await kycService.getKycStatus(user?.id || 'cust-001');
      setKycState(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load KYC status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    const tab = getInitialTab();
    setActiveTab(tab);
  }, [location.pathname]);

  const handleTabChange = (tab: 'overview' | 'status' | 'documents') => {
    setActiveTab(tab);
    if (tab === 'overview') navigate('/bank/kyc');
    else navigate(`/bank/kyc/${tab}`);
  };

  const handleOpenUpload = (type: 'nid' | 'passport' | 'address_proof' | 'photograph') => {
    setSelectedDocType(type);
    setDocNumber('');
    setUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setIsScanningOcr(true);

      const titles: Record<string, string> = {
        nid: 'National Identity Card (Real ID)',
        passport: 'Biometric Passport Diplomatic Scan',
        address_proof: 'Bank/Utility Statement Proof of Residence',
        photograph: 'Live Biometric Facial Liveness Capture',
      };

      const fileNames: Record<string, string> = {
        nid: 'national_id_front_back.pdf',
        passport: 'passport_biometric_chip.pdf',
        address_proof: 'residence_utility_deed.pdf',
        photograph: 'liveness_face_scan.jpg',
      };

      const updated = await kycService.uploadDocument(user?.id || 'cust-001', {
        type: selectedDocType,
        title: titles[selectedDocType],
        documentNumber: docNumber.trim() || undefined,
        fileName: fileNames[selectedDocType],
        fileSize: '3.2 MB',
      });

      setKycState(updated);
      setUploadModalOpen(false);
      success(`${titles[selectedDocType]} uploaded and verified successfully!`);
    } catch (err: any) {
      toastError(err.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
      setIsScanningOcr(false);
    }
  };

  const handleTestStatusChange = async (newStatus: KYCVerificationStatus) => {
    try {
      const updated = await kycService.setKycStatusManual(user?.id || 'cust-001', newStatus);
      setKycState(updated);
      success(`KYC status simulated as: ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      toastError(err.message || 'Status update failed');
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to Sovereign KYC & Compliance Engine..." />;
  }

  if (!kycState) return null;

  const getStatusBadge = (status: KYCVerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" /> Fully Verified (Tier 3)
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-4 h-4" /> Pending Compliance Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
            <AlertOctagon className="w-4 h-4" /> Document Rejected
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/30">
            <ShieldAlert className="w-4 h-4" /> Verification Expired
          </span>
        );
    }
  };

  const requiredTypes: Array<{
    type: 'nid' | 'passport' | 'address_proof' | 'photograph';
    title: string;
    description: string;
    icon: any;
  }> = [
    {
      type: 'nid',
      title: 'National Identity Card (NID)',
      description: 'Government-issued smart card, Real ID, or state identity document.',
      icon: FileText,
    },
    {
      type: 'passport',
      title: 'Biometric Passport',
      description: 'Valid international travel document with biometric chip data page.',
      icon: Layers,
    },
    {
      type: 'address_proof',
      title: 'Proof of Residence',
      description: 'Utility statement, municipal tenancy deed, or certified banking reference (< 90 days).',
      icon: FileText,
    },
    {
      type: 'photograph',
      title: 'Live Biometric Photograph',
      description: 'Real-time 3D facial liveness video selfie validated against document chip.',
      icon: Camera,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-royal-950 via-royal-900 to-navy-950 p-6 md:p-8 text-white shadow-xl border border-gold-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {getStatusBadge(kycState.overallStatus)}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                {kycState.verificationLevel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white">
                Risk Score: {kycState.riskCategory}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gold-100">
              KYC & Anti-Money Laundering (AML) Compliance
            </h1>
            <p className="text-royal-200 text-sm mt-1 max-w-2xl">
              Statutory client identity verification in accordance with Federal Reserve, FinCEN, and FATF international wealth standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick simulation tester buttons */}
            <div className="bg-royal-900/80 backdrop-blur-md p-1.5 rounded-xl border border-gold-500/30 flex items-center gap-1 text-xs">
              <span className="text-gold-300 px-2 font-medium">Demo State:</span>
              <button
                onClick={() => handleTestStatusChange('verified')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  kycState.overallStatus === 'verified'
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => handleTestStatusChange('pending')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  kycState.overallStatus === 'pending'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleTestStatusChange('rejected')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  kycState.overallStatus === 'rejected'
                    ? 'bg-red-500 text-white font-bold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => handleTestStatusChange('expired')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  kycState.overallStatus === 'expired'
                    ? 'bg-gray-600 text-white font-bold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Expired
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'KYC Hub Overview', icon: ShieldCheck },
            { id: 'status', label: 'Compliance Status & Limits', icon: Award },
            { id: 'documents', label: 'Identity Documents & Proofs', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500 text-royal-950 font-semibold shadow-md'
                    : 'text-royal-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Summary Banner */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                    Biometric Digital KYC Certification
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Your sovereign account tier unlock status and statutory clearing validity.
                  </p>
                </div>
                {getStatusBadge(kycState.overallStatus)}
              </div>

              {kycState.reviewerNotes && (
                <div className="mt-4 p-3.5 rounded-xl bg-royal-50 dark:bg-navy-900/80 border border-royal-100 dark:border-royal-800 text-xs text-royal-900 dark:text-white">
                  <strong className="block font-semibold mb-0.5 text-royal-800 dark:text-gold-300">
                    Compliance Officer Note:
                  </strong>
                  {kycState.reviewerNotes}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-800">
                  <span className="text-gray-400 text-xs block">Last Verified Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {kycState.lastVerifiedDate ? new Date(kycState.lastVerifiedDate).toLocaleDateString() : 'Pending'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-800">
                  <span className="text-gray-400 text-xs block">Next Re-Verification Due</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {kycState.expiresAt ? new Date(kycState.expiresAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-800">
                  <span className="text-gray-400 text-xs block">Verified Documents</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {kycState.documents.length} of 4 Registered
                  </span>
                </div>
              </div>
            </Card>

            {/* Checklist of 4 Documents */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  Mandatory Document Dossier
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Select an item to update or re-upload
                </span>
              </div>

              <div className="space-y-3">
                {requiredTypes.map((item) => {
                  const Icon = item.icon;
                  const existingDoc = kycState.documents.find((d) => d.type === item.type);
                  const isUploaded = !!existingDoc;

                  return (
                    <div
                      key={item.type}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isUploaded
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/20'
                          : 'bg-white dark:bg-navy-900 border-gray-200 dark:border-navy-800'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`p-2.5 rounded-xl ${
                            isUploaded
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-royal-500/10 text-royal-600 dark:text-gold-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</h4>
                            {isUploaded && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                          {existingDoc && (
                            <p className="text-[11px] font-mono text-gray-600 dark:text-gray-300 mt-1">
                              File: {existingDoc.fileName} • Ref: {existingDoc.documentNumber || 'Auto-Extracted'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {existingDoc && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewDoc(existingDoc)}
                            className="text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View OCR
                          </Button>
                        )}
                        <Button
                          variant={isUploaded ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleOpenUpload(item.type)}
                          className="text-xs"
                        >
                          <UploadCloud className="w-3.5 h-3.5 mr-1" />
                          {isUploaded ? 'Replace' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column: Tier limits & benefits */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-royal-900 to-navy-950 text-white border-gold-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-gold-400" />
                <div>
                  <h3 className="font-bold text-gold-200 text-sm">Tier 3 Sovereign Limits</h3>
                  <p className="text-xs text-royal-200">Unlocked via Full Biometric KYC</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-royal-200">
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span>Daily Outbound Fedwire:</span>
                  <span className="font-bold text-white font-mono">$5,000,000 USD</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span>International SWIFT Wire:</span>
                  <span className="font-bold text-white font-mono">Unlimited with 2FA</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span>ATM Cash Withdrawal:</span>
                  <span className="font-bold text-white font-mono">$25,000 / Day</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span>Multi-Currency FX Trades:</span>
                  <span className="font-bold text-white font-mono">Real-Time Institutional</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Gold & Bullion Vaulting:</span>
                  <span className="font-bold text-emerald-400">Available Zurich & NYC</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 border-gold-500/40 text-gold-300 hover:bg-gold-500/10 text-xs"
                onClick={() => handleTabChange('status')}
              >
                Inspect All Tier Entitlements
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                Compliance FAQ
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All uploaded documents are cryptographically encrypted using AES-256 and stored on isolated HSM sovereign hardware.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Status */}
      {activeTab === 'status' && (
        <Card className="p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-navy-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              KYC Verification Tiers & Privileges
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Comparison of accounts capabilities unlocked across regulatory validation stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-royal-800 bg-gray-50/50 dark:bg-royal-900/40">
              <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 block mb-1">Tier 1</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Basic Digital KYC</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">Email + Phone + NID validation</p>

              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Max Daily Transfer: $25,000</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Domestic Transfers only</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Standard Debit Card Access</span>
                </li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-royal-800 bg-gray-50/50 dark:bg-royal-900/40">
              <span className="text-xs font-bold uppercase text-royal-600 dark:text-gold-400 block mb-1">Tier 2</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Enhanced Verification</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">NID + Address Proof + Tax ID</p>

              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Max Daily Transfer: $250,000</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>International Wire Enabled</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Credit Card & Loan Applications</span>
                </li>
              </ul>
            </div>

            {/* Tier 3 (Current) */}
            <div className="p-5 rounded-2xl border-2 border-gold-500 bg-gradient-to-b from-gold-500/10 to-transparent relative">
              <div className="absolute -top-3 right-4 bg-gold-500 text-royal-950 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                Current Level
              </div>
              <span className="text-xs font-bold uppercase text-gold-600 dark:text-gold-400 block mb-1">Tier 3</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Royal Sovereign HNWI</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">Biometric Passport + 3D Liveness + Source of Wealth</p>

              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-200">
                <li className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Unlimited High-Value Fedwire</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Dedicated Private Banking Desk</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Centurion Metal Card Issuance</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Swiss & London Vault Allocations</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <Card className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-navy-800">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                Uploaded KYC Identification Files
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Manage documents, review OCR biometric matching scores, and submit renewal proofs.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenUpload('passport')}
              className="text-xs"
            >
              <UploadCloud className="w-4 h-4 mr-1.5" /> Upload New Document
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kycState.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-royal-800 bg-gray-50/50 dark:bg-royal-900/40 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-royal-100 dark:bg-royal-900 text-royal-700 dark:text-gold-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{doc.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {doc.fileName} ({doc.fileSize})
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {doc.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-royal-800 text-xs text-gray-600 dark:text-gray-300 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Document Reference:</span>
                    <span className="font-mono font-medium">{doc.documentNumber || 'Verified In-Chip'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Upload Timestamp:</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View OCR Data
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-navy-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Upload Identity Document
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Upload high-resolution color scan (PDF, JPG, PNG up to 10MB).
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Document Type
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                >
                  <option value="nid">National Identity Card (NID / Real ID)</option>
                  <option value="passport">Biometric Passport (Information & Chip Page)</option>
                  <option value="address_proof">Proof of Residence (Utility Bill / Tenancy)</option>
                  <option value="photograph">Live Biometric Selfie Capture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Document ID / Passport Number (Optional)
                </label>
                <Input
                  placeholder="e.g. P984021980 or ID-994021"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                />
              </div>

              {/* Drag & Drop Simulation */}
              <div className="border-2 border-dashed border-gray-300 dark:border-navy-700 rounded-xl p-6 text-center hover:border-gold-500 transition-colors cursor-pointer bg-gray-50 dark:bg-navy-950/40">
                <UploadCloud className="w-10 h-10 text-royal-600 dark:text-gold-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: PDF, JPG, PNG with high DPI
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-navy-800">
                <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Scanning Biometrics...' : 'Upload & Verify'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OCR Extraction Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-navy-700">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-navy-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                OCR Biometric Extraction Result
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-royal-50 dark:bg-navy-950 border border-royal-100 dark:border-navy-800">
                <span className="text-gray-400 block mb-1">Document Title</span>
                <span className="font-bold text-gray-900 dark:text-white">{previewDoc.title}</span>
              </div>

              {previewDoc.ocrExtractedData &&
                Object.entries(previewDoc.ocrExtractedData).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-navy-800">
                    <span className="text-gray-500 dark:text-gray-400">{k}:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">{v}</span>
                  </div>
                ))}
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
