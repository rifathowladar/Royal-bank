import { db } from '../mockApi/storage.ts';
import { AdminAuditLog } from '../types/index.ts';

export type KycRiskClassification = 'Low' | 'Medium' | 'High' | 'PEP/Sanctioned';
export type AdminKycStatus = 'pending' | 'verified' | 'rejected' | 'correction_requested';

export interface KycDocumentItem {
  id: string;
  type: 'passport' | 'national_id' | 'driver_license' | 'utility_bill' | 'tax_return' | 'biometric_selfie';
  title: string;
  documentNumberMasked?: string;
  expiryDate?: string;
  issueCountry: string;
  fileUrl: string;
  fileType: 'image/jpeg' | 'image/png' | 'application/pdf';
  uploadedAt: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  rejectionReason?: string;
}

export interface KycChecklistItem {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  score?: string; // e.g. "99.2% Match"
  checkedAt?: string;
  checkedBy?: string;
}

export interface AdminKycDossier {
  id: string;
  customerId: string;
  customerNumber: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  taxIdentificationNumber: string;
  residentialAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  occupation: string;
  employer: string;
  sourceOfWealth: string;
  estimatedAnnualIncomeUSD: number;
  expectedMonthlyTurnoverUSD: number;
  isPep: boolean; // Politically Exposed Person
  pepDetails?: string;
  sanctionHits: number;
  riskRating: KycRiskClassification;
  status: AdminKycStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  correctionInstructions?: string;
  rejectionReason?: string;
  documents: KycDocumentItem[];
  checklist: KycChecklistItem[];
  notesHistory: {
    date: string;
    author: string;
    text: string;
  }[];
}

const INITIAL_KYC_DOSSIERS: AdminKycDossier[] = [
  {
    id: 'kyc-001',
    customerId: 'cust-004',
    customerNumber: 'RB-984024',
    fullName: 'Sophia Lorenzen',
    email: 'sophia.l@royalbank.com',
    phone: '+49 89 2049 1102',
    dateOfBirth: '1989-11-23',
    nationality: 'German',
    taxIdentificationNumber: 'DE-920194821',
    residentialAddress: {
      street: 'Maximilianstraße 35',
      city: 'Munich',
      state: 'Bavaria',
      postalCode: '80539',
      country: 'Germany',
    },
    occupation: 'Contemporary Art Dealer & Gallery Owner',
    employer: 'Galerie Maximilian GmbH',
    sourceOfWealth: 'Commercial Art Advisory, Auctions & Family Trust',
    estimatedAnnualIncomeUSD: 450000,
    expectedMonthlyTurnoverUSD: 120000,
    isPep: false,
    sanctionHits: 0,
    riskRating: 'Medium',
    status: 'pending',
    submittedAt: '2026-09-23T14:15:00Z',
    documents: [
      {
        id: 'kdoc-1',
        type: 'passport',
        title: 'Federal Republic of Germany Passport',
        documentNumberMasked: 'C98•••412',
        expiryDate: '2034-05-18',
        issueCountry: 'Germany',
        fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
        fileType: 'image/jpeg',
        uploadedAt: '2026-09-23T14:15:00Z',
        verificationStatus: 'pending',
      },
      {
        id: 'kdoc-2',
        type: 'utility_bill',
        title: 'Munich Municipal Utility Statement (SWM)',
        expiryDate: '2026-11-01',
        issueCountry: 'Germany',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        fileType: 'image/jpeg',
        uploadedAt: '2026-09-23T14:15:00Z',
        verificationStatus: 'pending',
      },
      {
        id: 'kdoc-3',
        type: 'biometric_selfie',
        title: 'Live 3D Biometric Liveness Capture',
        issueCountry: 'Germany',
        fileUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
        fileType: 'image/jpeg',
        uploadedAt: '2026-09-23T14:18:00Z',
        verificationStatus: 'pending',
      },
    ],
    checklist: [
      { id: 'chk-1', label: 'Government ID Validation', description: 'MRZ machine readable code, holograms and cryptographic chip check', passed: true, score: 'MRZ Valid' },
      { id: 'chk-2', label: 'Biometric Face Match & Liveness', description: 'Anti-spoofing liveness passive and 3D depth geometry', passed: true, score: '99.4% Match' },
      { id: 'chk-3', label: 'OFAC, EU & UN Sanctions Watchlist', description: 'Zero matches on international consolidated sanctions screening', passed: true, score: '0 Hits' },
      { id: 'chk-4', label: 'Politically Exposed Person (PEP) Check', description: 'Screening for public office holders and close associates', passed: true, score: 'Clear' },
      { id: 'chk-5', label: 'Residential Address Verification', description: 'Utility proof matches applicant declared address within 90 days', passed: false, score: 'Pending Manual Review' },
      { id: 'chk-6', label: 'Adverse Media & Negative News', description: 'Automated global media surveillance for financial misconduct', passed: true, score: 'Clean' },
    ],
    notesHistory: [
      { date: '2026-09-23T14:20:00Z', author: 'System Sentinel', text: 'Intake successful. Biometric verification score 99.4% passed.' },
    ],
  },
  {
    id: 'kyc-002',
    customerId: 'cust-001',
    customerNumber: 'RB-984021',
    fullName: 'Alexander Sterling',
    email: 'alexander.sterling@royalbank.com',
    phone: '+1 (212) 555-0199',
    dateOfBirth: '1982-04-18',
    nationality: 'United States',
    taxIdentificationNumber: 'US-•••-••-4921',
    residentialAddress: {
      street: '450 Park Avenue, Suite 2800',
      city: 'New York',
      state: 'NY',
      postalCode: '10022',
      country: 'United States',
    },
    occupation: 'Managing Partner, Sterling Global Capital',
    employer: 'Sterling Global Capital Management LLC',
    sourceOfWealth: 'Private Equity Dividends & Asset Holdings',
    estimatedAnnualIncomeUSD: 2800000,
    expectedMonthlyTurnoverUSD: 750000,
    isPep: false,
    sanctionHits: 0,
    riskRating: 'Low',
    status: 'verified',
    submittedAt: '2025-01-10T10:00:00Z',
    reviewedAt: '2025-01-11T12:00:00Z',
    reviewedBy: 'Julian Cross',
    documents: [
      {
        id: 'kdoc-4',
        type: 'passport',
        title: 'United States Passport (Diplomatic/Official Format)',
        documentNumberMasked: '592•••104',
        expiryDate: '2032-09-12',
        issueCountry: 'United States',
        fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
        fileType: 'image/jpeg',
        uploadedAt: '2025-01-10T10:00:00Z',
        verificationStatus: 'verified',
      },
      {
        id: 'kdoc-5',
        type: 'utility_bill',
        title: 'Consolidated Edison Power & Gas Statement',
        issueCountry: 'United States',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        fileType: 'image/jpeg',
        uploadedAt: '2025-01-10T10:00:00Z',
        verificationStatus: 'verified',
      },
    ],
    checklist: [
      { id: 'chk-1', label: 'Government ID Validation', description: 'MRZ machine readable code, holograms and cryptographic chip check', passed: true, score: 'Verified' },
      { id: 'chk-2', label: 'Biometric Face Match & Liveness', description: 'Anti-spoofing liveness passive and 3D depth geometry', passed: true, score: '99.8% Match' },
      { id: 'chk-3', label: 'OFAC, EU & UN Sanctions Watchlist', description: 'Zero matches on international consolidated sanctions screening', passed: true, score: '0 Hits' },
      { id: 'chk-4', label: 'Politically Exposed Person (PEP) Check', description: 'Screening for public office holders and close associates', passed: true, score: 'Clear' },
      { id: 'chk-5', label: 'Residential Address Verification', description: 'Utility proof matches applicant declared address within 90 days', passed: true, score: 'Verified' },
      { id: 'chk-6', label: 'Adverse Media & Negative News', description: 'Automated global media surveillance for financial misconduct', passed: true, score: 'Clean' },
    ],
    notesHistory: [
      { date: '2025-01-11T12:00:00Z', author: 'Julian Cross', text: 'Tier 3 Sovereign Private Client KYC verified. Full documentation on custody file.' },
    ],
  },
  {
    id: 'kyc-003',
    customerId: 'cust-002',
    customerNumber: 'RB-984022',
    fullName: 'Elena Rostova',
    email: 'elena.rostova@royalbank.com',
    phone: '+44 20 7946 0912',
    dateOfBirth: '1987-08-14',
    nationality: 'United Kingdom / Cyprus',
    taxIdentificationNumber: 'GB-990-1284-91',
    residentialAddress: {
      street: '14 Eaton Square, Belgravia',
      city: 'London',
      state: 'Greater London',
      postalCode: 'SW1W 9AJ',
      country: 'United Kingdom',
    },
    occupation: 'Venture Capital Partner',
    employer: 'Helios Ventures Europe LLP',
    sourceOfWealth: 'Tech Company Exit & Seed Fund Carried Interest',
    estimatedAnnualIncomeUSD: 1400000,
    expectedMonthlyTurnoverUSD: 400000,
    isPep: false,
    sanctionHits: 0,
    riskRating: 'Low',
    status: 'verified',
    submittedAt: '2025-03-04T09:00:00Z',
    reviewedAt: '2025-03-05T14:00:00Z',
    reviewedBy: 'Victoria Ashford',
    documents: [
      {
        id: 'kdoc-6',
        type: 'passport',
        title: 'British Citizen Passport',
        documentNumberMasked: '531•••891',
        expiryDate: '2033-02-14',
        issueCountry: 'United Kingdom',
        fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
        fileType: 'image/jpeg',
        uploadedAt: '2025-03-04T09:00:00Z',
        verificationStatus: 'verified',
      },
    ],
    checklist: [
      { id: 'chk-1', label: 'Government ID Validation', description: 'MRZ machine readable code, holograms and cryptographic chip check', passed: true, score: 'Verified' },
      { id: 'chk-2', label: 'Biometric Face Match & Liveness', description: 'Anti-spoofing liveness passive and 3D depth geometry', passed: true, score: '99.1% Match' },
      { id: 'chk-3', label: 'OFAC, EU & UN Sanctions Watchlist', description: 'Zero matches on international consolidated sanctions screening', passed: true, score: '0 Hits' },
      { id: 'chk-4', label: 'Politically Exposed Person (PEP) Check', description: 'Screening for public office holders and close associates', passed: true, score: 'Clear' },
      { id: 'chk-5', label: 'Residential Address Verification', description: 'Utility proof matches applicant declared address within 90 days', passed: true, score: 'Verified' },
      { id: 'chk-6', label: 'Adverse Media & Negative News', description: 'Automated global media surveillance for financial misconduct', passed: true, score: 'Clean' },
    ],
    notesHistory: [
      { date: '2025-03-05T14:00:00Z', author: 'Victoria Ashford', text: 'Verified and approved with high-trust limit allocation.' },
    ],
  },
  {
    id: 'kyc-004',
    customerId: 'cust-005',
    customerNumber: 'RB-984029',
    fullName: 'Viktor Voronin',
    email: 'v.voronin@offshore-holding.cy',
    phone: '+357 25 819 001',
    dateOfBirth: '1974-03-02',
    nationality: 'Cyprus / Foreign National',
    taxIdentificationNumber: 'CY-81920491X',
    residentialAddress: {
      street: '28 October Avenue, Kanika Centre',
      city: 'Limassol',
      state: 'Limassol',
      postalCode: '3105',
      country: 'Cyprus',
    },
    occupation: 'Director of Commodity Escrow',
    employer: 'Aegean Maritime Capital Ltd',
    sourceOfWealth: 'Crude Oil Freight Brokering',
    estimatedAnnualIncomeUSD: 5200000,
    expectedMonthlyTurnoverUSD: 1800000,
    isPep: true,
    pepDetails: 'First-degree associate of former Deputy Minister of Transport',
    sanctionHits: 2,
    riskRating: 'PEP/Sanctioned',
    status: 'rejected',
    submittedAt: '2026-09-12T11:00:00Z',
    reviewedAt: '2026-09-14T16:30:00Z',
    reviewedBy: 'Julian Cross',
    rejectionReason: 'Failed AML screening: Unsubstantiated source of offshore wealth and potential designated sanctions nexus under EU Regulation 269/2014.',
    documents: [
      {
        id: 'kdoc-7',
        type: 'passport',
        title: 'Republic of Cyprus Passport',
        documentNumberMasked: 'CY-•••-192',
        expiryDate: '2027-11-20',
        issueCountry: 'Cyprus',
        fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
        fileType: 'image/jpeg',
        uploadedAt: '2026-09-12T11:00:00Z',
        verificationStatus: 'rejected',
      },
    ],
    checklist: [
      { id: 'chk-1', label: 'Government ID Validation', description: 'MRZ machine readable code check', passed: true, score: 'Valid' },
      { id: 'chk-2', label: 'Biometric Face Match & Liveness', description: 'Anti-spoofing liveness passive', passed: true, score: '98.0% Match' },
      { id: 'chk-3', label: 'OFAC, EU & UN Sanctions Watchlist', description: 'Sanctions watch filter match', passed: false, score: '2 HITS DETECTED' },
      { id: 'chk-4', label: 'Politically Exposed Person (PEP) Check', description: 'Screening for public office holders', passed: false, score: 'PEP Associate Flag' },
      { id: 'chk-5', label: 'Residential Address Verification', description: 'P.O. Box address rejected', passed: false, score: 'Failed' },
      { id: 'chk-6', label: 'Adverse Media & Negative News', description: 'Regulatory probe mentions in Maritime News', passed: false, score: 'Adverse Hits' },
    ],
    notesHistory: [
      { date: '2026-09-14T16:30:00Z', author: 'Julian Cross', text: 'Strict refusal issued per Compliance Directive 401. Case escalated to FIU.' },
    ],
  },
];

class AdminKycService {
  private getDossiersFromStorage(): AdminKycDossier[] {
    try {
      const raw = localStorage.getItem('royal_bank_admin_kyc_dossiers');
      if (!raw) {
        localStorage.setItem('royal_bank_admin_kyc_dossiers', JSON.stringify(INITIAL_KYC_DOSSIERS));
        return INITIAL_KYC_DOSSIERS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_KYC_DOSSIERS;
    }
  }

  private saveDossiersToStorage(dossiers: AdminKycDossier[]): void {
    try {
      localStorage.setItem('royal_bank_admin_kyc_dossiers', JSON.stringify(dossiers));
    } catch (err) {
      console.warn('Failed to save kyc dossiers:', err);
    }
  }

  /**
   * Get all dossiers with filtering
   */
  async getDossiers(params?: {
    status?: AdminKycStatus | 'all';
    riskRating?: KycRiskClassification | 'all';
    search?: string;
  }): Promise<AdminKycDossier[]> {
    let list = this.getDossiersFromStorage();

    if (params?.status && params.status !== 'all') {
      list = list.filter((d) => d.status === params.status);
    }

    if (params?.riskRating && params.riskRating !== 'all') {
      list = list.filter((d) => d.riskRating === params.riskRating);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.customerNumber.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.nationality.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async getDossierById(id: string): Promise<AdminKycDossier | null> {
    const list = this.getDossiersFromStorage();
    return list.find((d) => d.id === id || d.customerId === id) || null;
  }

  /**
   * Toggle checklist item state
   */
  async toggleChecklistItem(dossierId: string, checklistId: string, passed: boolean): Promise<AdminKycDossier> {
    const list = this.getDossiersFromStorage();
    const dossier = list.find((d) => d.id === dossierId);
    if (!dossier) throw new Error('Dossier not found');

    const item = dossier.checklist.find((c) => c.id === checklistId);
    if (item) {
      item.passed = passed;
      item.checkedAt = new Date().toISOString();
      item.checkedBy = 'Julian Cross';
    }

    this.saveDossiersToStorage(list);
    return dossier;
  }

  /**
   * Approve KYC Dossier
   */
  async approveKyc(dossierId: string, notes: string): Promise<AdminKycDossier> {
    const list = this.getDossiersFromStorage();
    const dossier = list.find((d) => d.id === dossierId);
    if (!dossier) throw new Error('Dossier not found');

    dossier.status = 'verified';
    dossier.reviewedAt = new Date().toISOString();
    dossier.reviewedBy = 'Julian Cross';
    dossier.rejectionReason = undefined;
    dossier.correctionInstructions = undefined;

    dossier.documents.forEach((d) => {
      d.verificationStatus = 'verified';
    });

    dossier.checklist.forEach((c) => {
      c.passed = true;
    });

    dossier.notesHistory.unshift({
      date: new Date().toISOString(),
      author: 'Julian Cross (Compliance)',
      text: `KYC dossier approved and customer risk classified as ${dossier.riskRating}. Notes: ${notes}`,
    });

    // Update customer entity in db
    const cust = db.customers.find((c) => c.id === dossier.customerId);
    if (cust) {
      cust.kycStatus = 'verified';
      db.persist('customers', db.customers);
    }

    this.saveDossiersToStorage(list);

    this.logAudit(
      'APPROVE_KYC_DOSSIER',
      'kyc',
      dossier.id,
      dossier.fullName,
      `KYC verified for ${dossier.fullName} (${dossier.customerNumber}). Risk: ${dossier.riskRating}.`
    );

    return dossier;
  }

  /**
   * Reject KYC Dossier
   */
  async rejectKyc(dossierId: string, reason: string): Promise<AdminKycDossier> {
    const list = this.getDossiersFromStorage();
    const dossier = list.find((d) => d.id === dossierId);
    if (!dossier) throw new Error('Dossier not found');

    dossier.status = 'rejected';
    dossier.reviewedAt = new Date().toISOString();
    dossier.reviewedBy = 'Julian Cross';
    dossier.rejectionReason = reason;

    dossier.notesHistory.unshift({
      date: new Date().toISOString(),
      author: 'Julian Cross (Compliance)',
      text: `KYC dossier formally rejected. Rationale: ${reason}`,
    });

    // Update customer entity
    const cust = db.customers.find((c) => c.id === dossier.customerId);
    if (cust) {
      cust.kycStatus = 'rejected';
      db.persist('customers', db.customers);
    }

    this.saveDossiersToStorage(list);

    this.logAudit(
      'REJECT_KYC_DOSSIER',
      'kyc',
      dossier.id,
      dossier.fullName,
      `KYC rejected for ${dossier.fullName}. Reason: ${reason}`
    );

    return dossier;
  }

  /**
   * Request document correction
   */
  async requestCorrection(
    dossierId: string,
    instructions: string,
    specificDocumentIds: string[]
  ): Promise<AdminKycDossier> {
    const list = this.getDossiersFromStorage();
    const dossier = list.find((d) => d.id === dossierId);
    if (!dossier) throw new Error('Dossier not found');

    dossier.status = 'correction_requested';
    dossier.correctionInstructions = instructions;

    dossier.documents.forEach((doc) => {
      if (specificDocumentIds.includes(doc.id)) {
        doc.verificationStatus = 'rejected';
        doc.rejectionReason = instructions;
      }
    });

    dossier.notesHistory.unshift({
      date: new Date().toISOString(),
      author: 'Julian Cross (Compliance)',
      text: `Requested customer correction: ${instructions}`,
    });

    this.saveDossiersToStorage(list);

    this.logAudit(
      'REQUEST_KYC_CORRECTION',
      'kyc',
      dossier.id,
      dossier.fullName,
      `Requested correction from ${dossier.fullName}: ${instructions}`
    );

    return dossier;
  }

  /**
   * Update risk classification
   */
  async updateRiskClassification(
    dossierId: string,
    riskRating: KycRiskClassification,
    reason: string
  ): Promise<AdminKycDossier> {
    const list = this.getDossiersFromStorage();
    const dossier = list.find((d) => d.id === dossierId);
    if (!dossier) throw new Error('Dossier not found');

    const oldRating = dossier.riskRating;
    dossier.riskRating = riskRating;

    dossier.notesHistory.unshift({
      date: new Date().toISOString(),
      author: 'Julian Cross (Compliance)',
      text: `Risk classification re-rated from ${oldRating} to ${riskRating}. Reason: ${reason}`,
    });

    this.saveDossiersToStorage(list);

    this.logAudit(
      'UPDATE_KYC_RISK_RATING',
      'kyc',
      dossier.id,
      dossier.fullName,
      `Risk rating updated from ${oldRating} to ${riskRating}. Rationale: ${reason}`
    );

    return dossier;
  }

  private logAudit(
    action: string,
    targetType: AdminAuditLog['targetType'],
    targetId: string,
    targetName: string,
    details: string
  ) {
    const log: AdminAuditLog = {
      id: `aud-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      adminId: 'adm-002',
      adminName: 'Julian Cross',
      adminRole: 'compliance_officer',
      action,
      targetType,
      targetId,
      targetName,
      details,
      ipAddress: '10.240.12.44',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };
    db.auditLogs.unshift(log);
    db.persist('auditLogs', db.auditLogs);
  }
}

export const adminKycService = new AdminKycService();
