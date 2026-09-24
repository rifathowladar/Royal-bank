import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { KYCProfileState, KYCDocumentItem, KYCVerificationStatus, Notification } from '../types/index.ts';

const defaultKycState: Record<string, KYCProfileState> = {
  'cust-001': {
    customerId: 'cust-001',
    overallStatus: 'verified',
    verificationLevel: 'Tier 3 (Ultra-High Net Worth)',
    lastVerifiedDate: '2026-03-15T10:00:00Z',
    expiresAt: '2028-03-15T10:00:00Z',
    submittedDate: '2026-03-12T08:30:00Z',
    reviewerNotes: 'Verified against United States Department of State database and FinCEN Registry. Risk assessment passed with pristine sovereign grade rating.',
    riskCategory: 'Low',
    documents: [
      {
        id: 'doc-nid-001',
        type: 'nid',
        title: 'National Identity Card / Real ID',
        documentNumber: 'USA-ID-994021-NY',
        issueDate: '2022-04-18',
        expiryDate: '2030-04-18',
        fileName: 'alexander_us_real_id_front_back.pdf',
        fileSize: '3.4 MB',
        uploadedAt: '2026-03-12T08:30:00Z',
        status: 'verified',
        ocrExtractedData: {
          FullName: 'Alexander Sterling',
          DateOfBirth: '1982-04-18',
          DocumentNo: 'USA-ID-994021-NY',
          State: 'New York, USA',
          MatchScore: '99.8%',
        },
      },
      {
        id: 'doc-pass-001',
        type: 'passport',
        title: 'Diplomatic / Standard Biometric Passport',
        documentNumber: 'P984021980',
        issueDate: '2021-05-10',
        expiryDate: '2031-05-09',
        fileName: 'us_biometric_passport_scan.pdf',
        fileSize: '4.8 MB',
        uploadedAt: '2026-03-12T08:32:00Z',
        status: 'verified',
        ocrExtractedData: {
          FullName: 'Alexander Sterling',
          Nationality: 'USA',
          PassportNo: 'P984021980',
          IssuingCountry: 'United States of America',
          ChipVerification: 'Valid & Cryptographically Signed',
        },
      },
      {
        id: 'doc-addr-001',
        type: 'address_proof',
        title: 'Proof of Address (Utility / Tenancy Deed)',
        documentNumber: 'CE-992019482',
        issueDate: '2026-02-01',
        expiryDate: '2026-05-01',
        fileName: 'conedison_residence_statement_feb2026.pdf',
        fileSize: '1.9 MB',
        uploadedAt: '2026-03-12T08:35:00Z',
        status: 'verified',
        ocrExtractedData: {
          EntityName: 'Con Edison New York',
          BillingAddress: '450 Park Avenue, Penthouse North, New York NY 10022',
          AddressMatchStatus: '100% Exact Street Match',
        },
      },
      {
        id: 'doc-photo-001',
        type: 'photograph',
        title: 'Live Biometric Photograph / Selfie',
        fileName: 'biometric_face_scan_liveness.jpg',
        fileSize: '2.1 MB',
        uploadedAt: '2026-03-12T08:38:00Z',
        status: 'verified',
        ocrExtractedData: {
          LivenessCheck: 'Passed (3D Anti-Spoofing Validated)',
          FacialMatchScore: '99.4% against Passport Biometric Chip',
        },
      },
    ],
  },
};

const STORAGE_KEY = 'royal_bank_kyc_data';

function loadKycStore(): Record<string, KYCProfileState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultKycState));
      return defaultKycState;
    }
    return JSON.parse(raw);
  } catch {
    return defaultKycState;
  }
}

function saveKycStore(data: Record<string, KYCProfileState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save KYC store', e);
  }
}

class KycService {
  async getKycStatus(customerId = 'cust-001'): Promise<KYCProfileState> {
    await simulateNetworkDelay(120);
    const store = loadKycStore();
    if (store[customerId]) {
      return store[customerId];
    }
    const defaultInit: KYCProfileState = {
      customerId,
      overallStatus: 'pending',
      verificationLevel: 'Tier 1 (Standard)',
      riskCategory: 'Low',
      documents: [],
    };
    store[customerId] = defaultInit;
    saveKycStore(store);
    return defaultInit;
  }

  async uploadDocument(
    customerId: string,
    docData: {
      type: 'nid' | 'passport' | 'address_proof' | 'photograph';
      title: string;
      documentNumber?: string;
      issueDate?: string;
      expiryDate?: string;
      fileName: string;
      fileSize: string;
      fileUrl?: string;
    }
  ): Promise<KYCProfileState> {
    await simulateNetworkDelay(300);
    const store = loadKycStore();
    const current = store[customerId] || {
      customerId,
      overallStatus: 'pending',
      verificationLevel: 'Tier 1 (Standard)',
      riskCategory: 'Low',
      documents: [],
    };

    const newDoc: KYCDocumentItem = {
      id: `doc-${docData.type}-${Date.now()}`,
      type: docData.type,
      title: docData.title,
      documentNumber: docData.documentNumber || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: docData.issueDate || new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      expiryDate: docData.expiryDate || new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      fileName: docData.fileName,
      fileSize: docData.fileSize,
      fileUrl: docData.fileUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      uploadedAt: new Date().toISOString(),
      status: 'verified',
      ocrExtractedData: {
        ExtractedDocumentNo: docData.documentNumber || `RB-DOC-${Date.now().toString().slice(-6)}`,
        ValidationStatus: 'Biometrically Validated',
        SecurityFeatures: 'Hologram & Microprint Verified',
        Confidence: '99.2%',
      },
    };

    // Remove older doc of same type if present
    const filtered = current.documents.filter((d) => d.type !== docData.type);
    filtered.push(newDoc);

    current.documents = filtered;
    current.submittedDate = new Date().toISOString();
    
    // If all 4 types uploaded, set verified
    const hasNid = filtered.some((d) => d.type === 'nid');
    const hasPass = filtered.some((d) => d.type === 'passport');
    const hasAddr = filtered.some((d) => d.type === 'address_proof');
    const hasPhoto = filtered.some((d) => d.type === 'photograph');

    if ((hasNid || hasPass) && hasAddr && hasPhoto) {
      current.overallStatus = 'verified';
      current.verificationLevel = 'Tier 3 (Ultra-High Net Worth)';
      current.lastVerifiedDate = new Date().toISOString();
      current.expiresAt = new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString();
      current.reviewerNotes = 'All statutory compliance verifications passed instantly via Royal Bank AI & Automated Biometric Clearing Engine.';
    } else {
      current.overallStatus = 'pending';
    }

    store[customerId] = current;
    saveKycStore(store);

    // Add security / compliance notification
    const notif: Notification = {
      id: `notif-kyc-${Date.now()}`,
      userId: customerId,
      title: 'KYC Document Processed',
      message: `Your ${docData.title} was successfully uploaded and verified by our automated compliance system.`,
      type: 'security',
      priority: 'normal',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/bank/kyc',
    };
    db.notifications.unshift(notif);
    db.persist('notifications', db.notifications);

    return current;
  }

  async simulateOcrScan(docType: string): Promise<{
    documentNumber: string;
    fullName: string;
    dateOfBirth: string;
    expiryDate: string;
    confidence: number;
    matchDetails: string;
  }> {
    await simulateNetworkDelay(400);
    return {
      documentNumber: docType === 'passport' ? 'P984021980' : 'USA-ID-994021-NY',
      fullName: 'Alexander Sterling',
      dateOfBirth: '1982-04-18',
      expiryDate: '2031-05-09',
      confidence: 99.4,
      matchDetails: 'Facial recognition match 99.4% against existing customer record.',
    };
  }

  async setKycStatusManual(
    customerId: string,
    status: KYCVerificationStatus,
    reason?: string
  ): Promise<KYCProfileState> {
    await simulateNetworkDelay(200);
    const store = loadKycStore();
    const current = store[customerId] || {
      customerId,
      overallStatus: 'pending',
      verificationLevel: 'Tier 1 (Standard)',
      riskCategory: 'Low',
      documents: [],
    };

    current.overallStatus = status;
    if (status === 'verified') {
      current.lastVerifiedDate = new Date().toISOString();
      current.expiresAt = new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString();
    }
    if (status === 'rejected') {
      current.reviewerNotes = reason || 'Document image clarity inadequate or signature discrepancy noted.';
    }
    if (status === 'expired') {
      current.reviewerNotes = 'Periodic KYC review cycle expired. Please refresh your proof of residence.';
    }

    store[customerId] = current;
    saveKycStore(store);
    return current;
  }
}

export const kycService = new KycService();
