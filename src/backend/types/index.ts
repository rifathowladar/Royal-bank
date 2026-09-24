/**
 * Royal Bank Domain Types
 * Enterprise-grade type definitions designed for easy migration to real REST/GraphQL APIs.
 */

export type AdminRole =
  | 'super_admin'
  | 'bank_admin'
  | 'branch_manager'
  | 'operations_officer'
  | 'customer_service'
  | 'loan_officer'
  | 'card_officer'
  | 'kyc_officer'
  | 'compliance_officer'
  | 'finance_officer'
  | 'risk_officer'
  | 'fraud_analyst'
  | 'support_agent'
  | 'auditor'
  | 'admin'
  | 'teller';

export type UserRole = 'customer' | AdminRole;

export type UserStatus = 'active' | 'suspended' | 'pending_verification' | 'closed';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  twoFactorEnabled: boolean;
}

export interface Customer extends User {
  role: 'customer';
  customerNumber: string; // e.g., "RB-992014"
  tier: 'Standard' | 'Premier' | 'Private Client' | 'Royal Sovereign';
  dateOfBirth: string;
  nationalIdMasked: string; // e.g. "•••• 8912"
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  kycStatus: 'verified' | 'pending' | 'requires_update' | 'rejected';
  riskScore: 'Low' | 'Medium' | 'High';
  totalBalanceUSD: number;
}

export interface Admin extends User {
  role: 'admin' | 'compliance_officer' | 'super_admin';
  employeeId: string;
  department: 'Retail Banking' | 'Risk & AML' | 'Treasury' | 'Security Operations' | 'Customer Care';
  permissions: string[];
}

export type AccountType =
  | 'checking'
  | 'savings'
  | 'current'
  | 'multi_currency'
  | 'business_current'
  | 'wealth_deposit'
  | 'dps'
  | 'fdr';

export type AccountStatus = 'active' | 'dormant' | 'frozen' | 'restricted' | 'closed';

export interface ChequeBookRequest {
  id: string;
  accountId: string;
  accountNumber: string;
  leavesCount: 25 | 50 | 100;
  deliveryOption: 'branch_pickup' | 'registered_courier';
  branch?: string;
  status: 'pending' | 'processing' | 'dispatched' | 'delivered';
  requestedAt: string;
  trackingNumber?: string;
}

export interface ChequeStopRequest {
  id: string;
  accountId: string;
  chequeNumber: string;
  reason: string;
  amount?: number;
  stoppedAt: string;
  status: 'active' | 'cancelled';
}

export interface Account {
  id: string;
  customerId: string;
  accountNumber: string; // e.g. "0429-8812-9901"
  iban: string;
  swiftBic: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CHF' | 'SGD';
  name: string; // e.g. "Premier Checking Account"
  customNickName?: string;
  type: AccountType;
  balance: number;
  availableBalance: number;
  ledgerBalance: number;
  status: AccountStatus;
  openedAt: string;
  interestRateAnnual?: number;
  branch: string;
  accountHolder: string;
  // Optional DPS / FDR terms:
  monthlyInstallment?: number;
  tenureMonths?: number;
  maturityDate?: string;
  maturityAmount?: number;
}

export type TransactionType =
  | 'transfer_in'
  | 'transfer_out'
  | 'qr_payment'
  | 'card_purchase'
  | 'bill_payment'
  | 'loan_disbursement'
  | 'loan_repayment'
  | 'fee'
  | 'interest'
  | 'dps_installment'
  | 'fdr_creation'
  | 'deposit'
  | 'debit'
  | 'credit';

export type TransactionStatus = 'completed' | 'pending' | 'processing' | 'flagged' | 'failed' | 'reversed';

export type PaymentMethod =
  | 'Internal Transfer'
  | 'SWIFT Wire'
  | 'ACH Transfer'
  | 'Fedwire'
  | 'SEPA Instant'
  | 'Contactless Card'
  | 'EMVCo QR'
  | 'Direct Debit'
  | 'Cheque Deposit'
  | 'Electronic Cash'
  | 'NPSB Instant Clearing'
  | 'BEFTN Electronic Clearing'
  | 'RTGS Real-Time Settlement'
  | 'Internal Book Transfer'
  | 'Royal Bank Instant Transfer'
  | 'High-Value Wire';

export interface Transaction {
  id: string;
  accountId: string;
  customerId: string;
  referenceNumber: string;
  reference?: string;
  type: TransactionType;
  category: string;
  amount: number; // positive for credit, negative for debit
  currency: string;
  status: TransactionStatus;
  timestamp: string;
  description: string;
  counterpartyName: string;
  counterpartyAccount?: string;
  sender?: string;
  receiver?: string;
  senderAccount?: string;
  receiverAccount?: string;
  paymentMethod?: PaymentMethod;
  fee: number;
  exchangeRate?: number;
  isFlaggedByAML?: boolean;
}

export type CardType = 'debit' | 'credit' | 'virtual_prepaid';
export type CardNetwork = 'Visa Infinite' | 'Mastercard World Elite' | 'Royal Bank Private' | 'Visa' | 'Mastercard';

export interface Card {
  id: string;
  accountId: string;
  customerId: string;
  cardNumberMasked: string; // e.g. "•••• •••• •••• 4192"
  fullCardNumber?: string; // e.g. "4532 8819 0418 4192"
  cvvMasked?: string; // e.g. "842"
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  type: CardType;
  network: CardNetwork;
  status: 'active' | 'frozen' | 'cancelled' | 'expired' | 'blocked';
  spendingLimitMonthly: number;
  spendingCurrentMonthly: number;
  dailyAtmLimit?: number;
  dailyPosLimit?: number;
  dailyOnlineLimit?: number;
  isContactlessEnabled: boolean;
  isOnlinePaymentsEnabled: boolean;
  isInternationalEnabled: boolean;
  pinSet: boolean;
  isActivated?: boolean;
  colorScheme: 'royal_gold' | 'midnight_blue' | 'black_titanium' | 'emerald_prestige';
  cardLabel?: string;
  isBurner?: boolean;

  // Credit Card specific properties
  creditLimit?: number;
  availableCredit?: number;
  outstandingBalance?: number;
  minimumDue?: number;
  paymentDueDate?: string;
  lastStatementBalance?: number;
  lastStatementDate?: string;
  rewardPoints?: number;
  cashbackEarned?: number;
  aprPercentage?: number;
  cardReplacementStatus?: 'none' | 'requested' | 'shipped';
}

export interface CardReplacementRequest {
  id: string;
  cardId: string;
  customerId: string;
  reason: 'lost' | 'stolen' | 'damaged' | 'expired';
  deliveryAddress: string;
  instantVirtual: boolean;
  requestDate: string;
  status: 'processing' | 'shipped' | 'delivered';
  trackingNumber: string;
}

export interface EMIPlan {
  id: string;
  cardId: string;
  transactionId: string;
  merchantName: string;
  originalAmount: number;
  tenureMonths: 3 | 6 | 12 | 24;
  interestRate: number; // in percent e.g. 3.5
  monthlyInstallment: number;
  totalRepayment: number;
  remainingMonths: number;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface CardOffer {
  id: string;
  title: string;
  merchant: string;
  category: 'Dining' | 'Travel' | 'Shopping' | 'Lifestyle';
  discountText: string;
  validUntil: string;
  promoCode?: string;
  description: string;
  badge?: string;
}

export interface CardStatement {
  id: string;
  cardId: string;
  monthYear: string;
  statementDate: string;
  dueDate: string;
  openingBalance: number;
  newCharges: number;
  paymentsReceived: number;
  totalDue: number;
  minimumDue: number;
  rewardPointsEarned: number;
  pdfUrl?: string;
}

export type LoanType = 'personal' | 'mortgage' | 'auto' | 'business_growth';
export type LoanStatus = 'approved' | 'active' | 'in_review' | 'closed' | 'delinquent';

export interface Loan {
  id: string;
  customerId: string;
  loanNumber: string;
  type: LoanType;
  principalAmount: number;
  currentBalance: number;
  currency: string;
  annualInterestRate: number; // in percentage e.g. 5.45
  termMonths: number;
  remainingMonths: number;
  monthlyInstallment: number;
  nextDueDate: string;
  status: LoanStatus;
  disbursedAt: string;
}

export interface Deposit {
  id: string;
  customerId: string;
  accountId: string;
  certificateNumber: string;
  depositType: 'Term Fixed Deposit' | 'High Yield Sovereign' | 'Flexi-Saver';
  principalAmount: number;
  currency: string;
  interestRate: number; // in percent e.g. 4.85
  termDays: number;
  startDate: string;
  maturityDate: string;
  maturityPayoutAmount: number;
  status: 'active' | 'matured' | 'early_withdrawn';
  autoRenew: boolean;
}

export interface Beneficiary {
  id: string;
  customerId: string;
  name: string;
  nickName?: string;
  accountNumber: string;
  bankName: string;
  routingOrSwift: string;
  currency: string;
  type: 'internal' | 'domestic' | 'international_swift';
  country: string;
  isFavorite: boolean;
  lastTransferDate?: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  merchantCode: string;
  qrPayload: string;
  terminalLocation: string;
  logoUrl?: string;
}

export interface QRPayment {
  id: string;
  paymentCode: string;
  merchantId?: string;
  merchantName?: string;
  recipientType?: 'customer' | 'merchant';
  recipientCustomerId?: string;
  recipientName?: string;
  recipientAccountNumber?: string;
  customerId: string; // sender
  senderName?: string;
  accountId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'expired' | 'failed';
  timestamp: string;
  reference: string;
  note?: string;
}

export type TransferType =
  | 'own_account'
  | 'royal_bank'
  | 'other_bank'
  | 'npsb'
  | 'beftn'
  | 'rtgs'
  | 'scheduled'
  | 'recurring'
  | 'request_money'
  | 'split_bill';

export interface TransferRequest {
  sourceAccountId: string;
  transferType: TransferType;
  amount: number;
  currency: string;
  targetAccountId?: string; // For own account transfers
  recipientCustomerId?: string; // For Royal Bank customer transfers
  recipientName: string;
  recipientAccount: string;
  recipientBank?: string;
  recipientRoutingOrSwift?: string;
  purpose?: string;
  referenceNote?: string;
  scheduledDate?: string;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  recurringEndDate?: string;
  fee: number;
}

export interface TransferResult {
  success: boolean;
  transactionId: string;
  referenceNumber: string;
  timestamp: string;
  amount: number;
  fee: number;
  currency: string;
  sourceAccount: Account;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  transferType: TransferType;
  referenceNote?: string;
  status: 'completed' | 'scheduled' | 'processing';
}

export interface MoneyRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAccount: string;
  payerName?: string;
  payerEmailOrPhone?: string;
  amount: number;
  currency: string;
  note: string;
  status: 'pending' | 'paid' | 'declined' | 'cancelled';
  createdAt: string;
  qrPayload: string;
  referenceCode: string;
}

export interface SplitBillParticipant {
  name: string;
  emailOrPhone?: string;
  shareAmount: number;
  status: 'paid' | 'pending';
  paidAt?: string;
}

export interface SplitBill {
  id: string;
  creatorId: string;
  title: string;
  totalAmount: number;
  currency: string;
  participants: SplitBillParticipant[];
  createdAt: string;
  status: 'active' | 'settled';
}

export interface QRPayloadData {
  type: 'royal_bank_customer' | 'royal_bank_merchant' | 'emvco_standard';
  customerId?: string;
  merchantId?: string;
  name: string;
  accountNumber: string;
  currency: string;
  amount?: number;
  note?: string;
  bankName: string;
  terminalId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'security' | 'transaction' | 'statement' | 'regulatory' | 'marketing';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  timestamp?: string;
  actionUrl?: string;
}

export type BillCategory =
  | 'Electricity'
  | 'Gas'
  | 'Water'
  | 'Internet'
  | 'Telephone'
  | 'Education'
  | 'Insurance'
  | 'Government'
  | 'Credit card'
  | 'Subscription';

export interface Biller {
  id: string;
  name: string;
  category: BillCategory;
  accountReferenceLabel: string;
  accountReferencePlaceholder: string;
  customerNumberLabel?: string;
  sampleAccountFormat?: string;
  iconName: string;
  popular?: boolean;
  billerCode: string;
  helperText?: string;
  fee: number;
}

export interface Bill {
  id: string;
  customerId: string;
  billerId?: string;
  billerName: string;
  billerCategory: BillCategory;
  accountReference: string;
  consumerName?: string;
  amountDue: number;
  amount?: number;
  currency: string;
  dueDate: string;
  issueDate?: string;
  lateFee?: number;
  status: 'unpaid' | 'paid' | 'scheduled' | 'overdue';
  autoDebitEnabled: boolean;
  autoDebitAccountId?: string;
  reminderEnabled?: boolean;
}

export interface FetchedBill {
  billId: string;
  billerId: string;
  billerName: string;
  category: BillCategory;
  accountReference: string;
  consumerName: string;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  baseAmount: number;
  surcharge: number;
  lateFee: number;
  totalPayable: number;
  currency: string;
  status: 'unpaid' | 'paid' | 'overdue';
}

export interface SavedBiller {
  id: string;
  customerId: string;
  billerId: string;
  billerName: string;
  category: BillCategory;
  accountReference: string;
  nickName: string;
  autoPayEnabled: boolean;
  autoPayAccountId?: string;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  lastPaidAmount?: number;
  lastPaidDate?: string;
}

export interface BillPaymentRecord {
  id: string;
  customerId: string;
  billerId: string;
  billerName: string;
  category: BillCategory;
  accountReference: string;
  consumerName?: string;
  amount: number;
  fee: number;
  totalPaid: number;
  currency: string;
  sourceAccountId: string;
  sourceAccountNumber: string;
  status: 'completed' | 'processing' | 'scheduled';
  paymentDate: string;
  referenceNumber: string;
  authCode: string;
  note?: string;
  autoDebit?: boolean;
}

// Mobile Recharge Types
export interface MobileOperator {
  id: string;
  name: string;
  country: string;
  code: string;
  prefixMatch: string[];
  logoText: string;
  color: string;
  popular?: boolean;
}

export interface RechargePlan {
  id: string;
  operatorId: string;
  name: string;
  title?: string;
  category: 'Top-Up' | 'Data Add-on' | 'Unlimited Pack' | 'International Roaming' | string;
  price: number;
  amount?: number;
  validity: string;
  dataAmount?: string;
  talktime?: string;
  description: string;
  isPopular?: boolean;
  badge?: string;
}

export interface RechargeRecord {
  id: string;
  customerId: string;
  mobileNumber: string;
  operatorId: string;
  operatorName: string;
  connectionType: 'prepaid' | 'postpaid';
  amount: number;
  planName?: string;
  currency: string;
  sourceAccountId: string;
  paymentDate: string;
  transactionReference: string;
  operatorRef: string;
  status: 'successful' | 'failed' | 'processing';
}

export interface KYCApplication {
  id: string;
  customerId: string;
  customerName: string;
  documentType: 'Passport' | 'National ID' | 'Drivers License';
  documentNumberMasked: string;
  submittedAt: string;
  reviewedBy?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_investigation';
  riskRating: 'Low' | 'Medium' | 'High';
  notes?: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  ticketNumber: string;
  subject: string;
  category: 'Dispute' | 'Account Access' | 'Card Services' | 'Wire Transfer' | 'General';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved';
  createdAt: string;
  lastUpdatedAt: string;
  assignedAgent?: string;
}

// Authentication & Registration Types
export interface RegistrationPersonalStep {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  taxId: string;
}

export interface RegistrationContactStep {
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface RegistrationIdentityStep {
  idType: 'passport' | 'national_id' | 'driver_license';
  idNumber: string;
  idExpiryDate: string;
  issueAuthority: string;
}

export interface RegistrationSecurityStep {
  username: string;
  password: string;
  pinCode: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface RegistrationPayload {
  personal: RegistrationPersonalStep;
  contact: RegistrationContactStep;
  identity: RegistrationIdentityStep;
  security: RegistrationSecurityStep;
}

export interface RegistrationResult {
  success: boolean;
  customerId: string;
  customerNumber: string;
  accountNumber: string;
  iban: string;
  user: Customer;
  message: string;
}

export interface AuthSession {
  token: string;
  user: User;
  requires2FA: boolean;
  requiresDeviceVerification: boolean;
  deviceId?: string;
  deviceName?: string;
  deviceLocation?: string;
  expiresAt: string;
}

// Detailed Customer Profile Types
export interface NomineeDetails {
  fullName: string;
  relationship: 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Business Partner' | 'Other';
  dateOfBirth: string;
  phone: string;
  email?: string;
  identityType: 'NID' | 'Passport' | 'Birth Certificate';
  identityNumberMasked: string;
  sharePercentage: number;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmploymentDetails {
  employmentStatus: 'Employed' | 'Self-Employed' | 'Business Owner' | 'Retired' | 'Investor' | 'Student';
  occupation: string;
  designation: string;
  companyName: string;
  companyAddress: string;
  industry: string;
  monthlyIncome: number;
  annualIncome: number;
  sourceOfFunds: string;
  tinOrTaxId: string;
  experienceYears: number;
}

export interface FullCustomerProfile {
  id: string;
  customerNumber: string;
  title: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  nationality: string;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  fathersName?: string;
  mothersName?: string;
  taxResidency: string;
  nationalIdMasked: string;
  passportMasked?: string;
  phone: string;
  email: string;
  alternatePhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  residentialAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  permanentAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  sameAsResidential: boolean;
  employment: EmploymentDetails;
  nominee: NomineeDetails;
  tier: string;
  memberSince: string;
}

// Detailed KYC Types
export type KYCVerificationStatus = 'verified' | 'pending' | 'rejected' | 'expired';

export interface KYCDocumentItem {
  id: string;
  type: 'nid' | 'passport' | 'address_proof' | 'photograph';
  title: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fileUrl?: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: KYCVerificationStatus;
  ocrExtractedData?: Record<string, string>;
  rejectionReason?: string;
}

export interface KYCProfileState {
  customerId: string;
  overallStatus: KYCVerificationStatus;
  verificationLevel: 'Tier 1 (Standard)' | 'Tier 2 (Enhanced)' | 'Tier 3 (Ultra-High Net Worth)';
  lastVerifiedDate?: string;
  expiresAt?: string;
  submittedDate?: string;
  reviewerNotes?: string;
  riskCategory: 'Low' | 'Medium' | 'High';
  documents: KYCDocumentItem[];
}

// Detailed Security Types
export interface SecuritySettingsState {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'sms' | 'authenticator' | 'email';
  twoFactorPhoneMasked: string;
  twoFactorEmailMasked: string;
  biometricEnabled: boolean;
  loginAlertsEnabled: boolean;
  transactionPinSet: boolean;
  lastPasswordChangeDate: string;
  lastPinChangeDate: string;
  sessionTimeoutMinutes: number;
  allowInternationalLogins: boolean;
}

export interface TrustedDevice {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  operatingSystem: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrentDevice: boolean;
  isTrusted: boolean;
  firstUsed: string;
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  city: string;
  country: string;
  loginTime: string;
  lastActivity: string;
  isCurrent: boolean;
}

export interface LoginHistoryRecord {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  status: 'success' | 'failed';
  failureReason?: string;
}

// Detailed Notifications Types
export type NotificationCategory = 'transactions' | 'security' | 'cards' | 'loans' | 'bills' | 'promotions' | 'system';

export interface DetailedNotification {
  id: string;
  customerId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  iconType?: string;
  metaData?: Record<string, any>;
}

// Detailed Support & Concierge Types
export type SupportTicketCategory = 'General' | 'Dispute' | 'Account Access' | 'Card Services' | 'Wire Transfer' | 'Loan' | 'Technical';

export interface TicketMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  attachments?: Array<{ name: string; size: string; url: string }>;
}

export interface DetailedSupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  category: SupportTicketCategory;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved';
  createdAt: string;
  lastUpdatedAt: string;
  assignedAgent?: {
    name: string;
    role: string;
    avatar: string;
  };
  messages: TicketMessage[];
  rating?: number;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpfulCount: number;
}

export interface BranchAppointment {
  id: string;
  customerId: string;
  branchName: string;
  branchAddress: string;
  serviceType: string;
  date: string;
  timeSlot: string;
  specialRequirements?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  tokenNumber: string;
  advisorName?: string;
  createdAt: string;
}

// Admin Audit & Operational Types
export interface AdminAuditLog {
  id: string;
  adminId?: string;
  adminName?: string;
  adminRole?: string;
  user?: string;
  employeeId?: string;
  role?: string;
  action: string;
  module?:
    | 'Accounts'
    | 'Customers'
    | 'Transactions'
    | 'Cards'
    | 'Loans'
    | 'Deposits'
    | 'KYC'
    | 'Merchants'
    | 'QR'
    | 'Settings'
    | 'Security'
    | 'AML'
    | 'Fraud'
    | 'Approvals'
    | 'System'
    | string;
  resource?: string;
  targetType?:
    | 'customer'
    | 'account'
    | 'transaction'
    | 'card'
    | 'loan'
    | 'kyc'
    | 'security'
    | 'system'
    | 'deposit'
    | 'merchant'
    | 'qr_payment'
    | 'settlement';
  targetId?: string;
  targetName?: string;
  details?: string;
  ip?: string;
  ipAddress?: string;
  device?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  metadata?: Record<string, any>;
}

// Maker-Checker Approval Types
export type ApprovalRequestType =
  | 'Account limit change'
  | 'Large transaction'
  | 'Loan approval'
  | 'Customer freeze'
  | 'Customer unfreeze'
  | 'Card block'
  | 'Merchant approval'
  | 'KYC approval'
  | 'Fee configuration'
  | 'Interest rate change';

export type ApprovalPriority = 'low' | 'medium' | 'high' | 'critical';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalUser {
  name: string;
  employeeId: string;
  role: string;
  email?: string;
  avatar?: string;
}

export interface ApprovalItem {
  id: string;
  requester: ApprovalUser;
  requestDate: string;
  requestType: ApprovalRequestType;
  customerOrResource: string;
  resourceId: string;
  previousValue: string;
  requestedValue: string;
  reason: string;
  supportingInformation: string;
  priority: ApprovalPriority;
  status: ApprovalStatus;
  amount?: number;
  currency?: string;
  reviewedBy?: ApprovalUser;
  reviewedAt?: string;
  rejectionReason?: string;
  actionPayload?: Record<string, any>;
}

// System Settings Types
export interface SystemSettings {
  general: {
    bankName: string;
    institutionCode: string;
    swiftBic: string;
    baseCurrency: string;
    fiscalYearStart: string;
    maintenanceMode: boolean;
    contactEmail: string;
    supportPhone: string;
    operatingTimezone: string;
    headquartersAddress: string;
  };
  security: {
    sessionTimeoutMinutes: number;
    mfaEnforced: boolean;
    passwordExpiryDays: number;
    maxFailedLoginAttempts: number;
    lockoutDurationMinutes: number;
    ipWhitelistEnabled: boolean;
    allowedSubnets: string[];
    biometricAuthAllowed: boolean;
    hardwareSecurityModuleStatus: 'ONLINE' | 'STANDBY' | 'DEGRADED';
    dataEncryptionStandard: string;
  };
  transactions: {
    singleTransactionLimit: number;
    dailyTransferLimit: number;
    coolingPeriodHours: number;
    highValueThresholdApproval: number;
    instantSettlementCutoffTime: string;
    autoReconciliationEnabled: boolean;
    batchProcessingSchedule: string;
    allowWeekendSettlement: boolean;
  };
  fees: {
    domesticTransferFee: number;
    internationalWireFeePercent: number;
    minimumWireFee: number;
    expressTransferSurcharge: number;
    qrMerchantMdrPercent: number;
    atmOutNetworkFee: number;
    cardReplacementFee: number;
    accountMaintenanceQuarterly: number;
  };
  limits: {
    dailyAtmLimit: number;
    dailyPosLimit: number;
    dailyOnlineLimit: number;
    corporateDailyLimit: number;
    internationalDailyLimit: number;
    peerToPeerDailyLimit: number;
    instantQrLimit: number;
  };
  notifications: {
    emailAlertsEnabled: boolean;
    smsAlertsEnabled: boolean;
    pushNotificationsEnabled: boolean;
    criticalAlertWebhooks: string[];
    highValueAlertThresholdUSD: number;
    dailyExecutiveDigest: boolean;
    slackComplianceIntegration: boolean;
  };
  rates: {
    savingsInterestRateAnnual: number;
    dpsMonthlyInterestRate: number;
    fdrFixedDepositRate1Yr: number;
    primeLendingRate: number;
    personalLoanBaseRate: number;
    homeLoanBaseRate: number;
    creditCardApr: number;
  };
}

// Report Types
export interface ReportFilterState {
  startDate: string;
  endDate: string;
  accountId: string;
  customerId: string;
  branchId: string;
  status: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface ReportSummaryMetric {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export interface AccountLimits {
  accountId: string;
  dailyTransferLimit: number;
  dailyAtmLimit: number;
  singleTransactionLimit: number;
  internationalTransferLimit: number;
  isOverdraftAllowed: boolean;
  overdraftLimit: number;
  updatedAt: string;
  updatedBy: string;
}

export interface AdminDashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalDepositsUSD: number;
  totalLoansUSD: number;
  todayTransactionsCount: number;
  todayTransactionsVolumeUSD: number;
  qrTransactionsCount: number;
  failedTransactionsCount: number;
  pendingKycCount: number;
  pendingLoansCount: number;
  fraudAlertsCount: number;
  customerGrowthRate: number;
  totalRevenueUSD: number;
}

// ==========================================
// RBAC & PERMISSION MATRIX TYPES
// ==========================================

export type PermissionAction = 'view' | 'create' | 'edit' | 'approve' | 'reject' | 'delete' | 'export';

export type PermissionResource =
  | 'dashboard'
  | 'customers'
  | 'accounts'
  | 'transactions'
  | 'qr'
  | 'cards'
  | 'loans'
  | 'deposits'
  | 'kyc'
  | 'fraud'
  | 'aml'
  | 'branches'
  | 'employees'
  | 'roles'
  | 'permissions'
  | 'approvals'
  | 'reports'
  | 'audit_logs'
  | 'settings'
  | 'support';

export interface RoleDefinition {
  id: AdminRole;
  title: string;
  description: string;
  department: string;
  level: number;
  tier?: number;
  employeeCount: number;
  isSystemRole: boolean;
}

export type PermissionMatrix = Record<AdminRole, Record<PermissionResource, PermissionAction[]>>;

// ==========================================
// FRAUD DETECTION & SURVEILLANCE TYPES
// ==========================================

export type FraudAlertStatus =
  | 'flagged'
  | 'under_investigation'
  | 'blocked'
  | 'released'
  | 'case_created';

export interface FraudDeviceDetails {
  name: string;
  os: string;
  browser: string;
  fingerprint: string;
  isNewDevice: boolean;
  isVpnOrProxy?: boolean;
}

export interface FraudNote {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  timestamp: string;
}

export interface FraudAlert {
  id: string;
  alertNumber: string;
  transactionId?: string;
  transactionReference?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  accountNumberMasked: string;
  amount: number;
  currency: string;
  location: string;
  country: string;
  ipAddress: string;
  device: FraudDeviceDetails;
  riskScore: number; // 0 - 100
  detectionRule: string;
  ruleCategory: 'Velocity' | 'Geolocation' | 'Device Anomaly' | 'Amount Anomaly' | 'High-Risk MCC' | 'Credential Stuffing';
  status: FraudAlertStatus;
  timestamp: string;
  assignedTo?: string;
  caseId?: string;
  notes: FraudNote[];
}

export interface FraudCaseTimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  notes: string;
}

export interface FraudCase {
  id: string;
  caseNumber: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'escalated_fiu' | 'closed_blocked' | 'closed_cleared';
  assignedTo: string;
  assignedRole: string;
  alertIds: string[];
  customerId: string;
  customerName: string;
  totalExposureUSD: number;
  createdAt: string;
  updatedAt: string;
  summary: string;
  timeline: FraudCaseTimelineEvent[];
}

// ==========================================
// AML (ANTI-MONEY LAUNDERING) TYPES
// ==========================================

export type AmlCustomerRiskRating = 'Low' | 'Medium' | 'High' | 'PEP' | 'Sanctioned';

export type AmlActivityType =
  | 'Structuring / Smurfing'
  | 'Rapid Movement of Funds'
  | 'High-Risk Jurisdiction Wire'
  | 'PEP Match Hit'
  | 'Sanctions List Candidate'
  | 'Inconsistent with Declared Profile';

export type AmlAlertStatus = 'detected' | 'reviewing' | 'cleared' | 'sar_filed' | 'frozen';

export interface AmlAlert {
  id: string;
  refNumber: string;
  customerId: string;
  customerName: string;
  customerRiskRating: AmlCustomerRiskRating;
  activityType: AmlActivityType;
  transactionId?: string;
  transactionRef?: string;
  amount: number;
  currency: string;
  destinationCountry: string;
  matchScore: number; // e.g. 88%
  matchedList?: string; // e.g. OFAC SDN List, EU Sanctions List, UN Consolidated List
  status: AmlAlertStatus;
  detectedAt: string;
  assignedAnalyst?: string;
  notes?: string;
  sarId?: string;
}

export interface AmlCase {
  id: string;
  caseNumber: string;
  customerId: string;
  customerName: string;
  riskScore: number;
  alertIds: string[];
  totalVolumeUSD: number;
  status: 'open' | 'investigating' | 'regulatory_reporting' | 'sar_submitted' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAnalyst: string;
  narrativeSummary: string;
  fiuReportRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AmlReport {
  id: string;
  reportNumber: string;
  type: 'SAR' | 'CTR' | 'STR';
  customerName: string;
  customerId: string;
  filingDate: string;
  status: 'draft' | 'submitted' | 'acknowledged';
  regulator: string;
  suspectTransactions: string[];
  narrative: string;
  preparedBy: string;
  totalSuspiciousAmountUSD: number;
}

// ==========================================
// BRANCHES TYPES
// ==========================================

export interface BranchManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface BranchAtm {
  id: string;
  code: string;
  locationDetails: string;
  status: 'operational' | 'low_cash' | 'maintenance' | 'offline';
  cashRemainingUSD: number;
  capacityUSD: number;
  lastServiced: string;
}

export interface BranchCashPosition {
  vaultCashUSD: number;
  vaultCapacityUSD: number;
  localCurrencyBalance: number;
  lastAuditedAt: string;
  status: 'normal' | 'low' | 'excess';
}

export interface BranchPerformance {
  depositTargetUSD: number;
  depositActualUSD: number;
  loanTargetUSD: number;
  loanActualUSD: number;
  monthlyGrowth: number;
  customerRating: number; // e.g. 4.9
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  type: 'Flagship' | 'Corporate Centre' | 'Retail Branch' | 'Private Banking Suite';
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  branchManager: BranchManager;
  employeesCount: number;
  operatingHours: string;
  cashPosition: BranchCashPosition;
  atms: BranchAtm[];
  performance: BranchPerformance;
  transactionsCountToday: number;
  volumeUSDToday: number;
  status: 'active' | 'temporary_closure' | 'maintenance';
}

// ==========================================
// EMPLOYEES TYPES
// ==========================================

export interface EmployeeLoginActivity {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  status: 'success' | 'failed';
  failureReason?: string;
}

export interface Employee {
  id: string;
  employeeId: string; // e.g. EMP-9102
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  jobTitle?: string;
  department:
    | 'Retail Banking'
    | 'Risk & AML'
    | 'Treasury & FX'
    | 'Security & Fraud'
    | 'Credit & Lending'
    | 'Customer Operations'
    | 'Audit & Compliance'
    | 'Executive Management'
    | 'Operations';
  branchId: string;
  branchName: string;
  branchCode?: string;
  role: AdminRole;
  status: 'active' | 'on_leave' | 'suspended' | 'terminated';
  joinedDate: string;
  hireDate?: string;
  lastLoginAt: string;
  lastLoginIp?: string;
  mfaEnabled?: boolean;
  supervisorName?: string;
  directReportsCount: number;
  loginActivity: EmployeeLoginActivity[];
}



