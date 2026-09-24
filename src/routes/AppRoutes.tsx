import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { CustomerLayout } from '../layouts/CustomerLayout.tsx';
import { AdminLayout } from '../layouts/AdminLayout.tsx';
import { PublicLayout } from '../layouts/PublicLayout.tsx';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute.tsx';

// Public & Marketing Pages
import { LandingPage } from '../pages/public/LandingPage.tsx';
import { AboutPage } from '../pages/public/AboutPage.tsx';
import { PersonalBankingPage } from '../pages/public/PersonalBankingPage.tsx';
import { BusinessBankingPage } from '../pages/public/BusinessBankingPage.tsx';
import { AccountsPage } from '../pages/public/AccountsPage.tsx';
import { CardsPage } from '../pages/public/CardsPage.tsx';
import { LoansPage } from '../pages/public/LoansPage.tsx';
import { DepositsPage } from '../pages/public/DepositsPage.tsx';
import { DigitalBankingPage } from '../pages/public/DigitalBankingPage.tsx';
import { QrPaymentPublicPage } from '../pages/public/QrPaymentPublicPage.tsx';
import { SecurityPublicPage } from '../pages/public/SecurityPublicPage.tsx';
import { ContactPage } from '../pages/public/ContactPage.tsx';
import { BranchesPage } from '../pages/public/BranchesPage.tsx';
import { AtmLocatorPage } from '../pages/public/AtmLocatorPage.tsx';
import { FaqPage } from '../pages/public/FaqPage.tsx';

// Authentication Pages
import { LoginPage } from '../pages/auth/LoginPage.tsx';
import { RegisterPage } from '../pages/auth/RegisterPage.tsx';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.tsx';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage.tsx';
import { VerifyOtpPage } from '../pages/auth/VerifyOtpPage.tsx';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage.tsx';
import { TwoFactorAuthPage } from '../pages/auth/TwoFactorAuthPage.tsx';
import { DeviceVerificationPage } from '../pages/auth/DeviceVerificationPage.tsx';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage.tsx';
import { NotFoundPage } from '../pages/NotFoundPage.tsx';

// Customer Pages
import { CustomerDashboardPage } from '../pages/customer/CustomerDashboardPage.tsx';
import { CustomerAccountsPage } from '../pages/customer/CustomerAccountsPage.tsx';
import { AccountDetailsPage } from '../pages/customer/AccountDetailsPage.tsx';
import { AccountTransactionsPage } from '../pages/customer/AccountTransactionsPage.tsx';
import { AccountStatementPage } from '../pages/customer/AccountStatementPage.tsx';
import { OpenAccountPage } from '../pages/customer/OpenAccountPage.tsx';
import { CloseAccountPage } from '../pages/customer/CloseAccountPage.tsx';
import { ChequeBookPage } from '../pages/customer/ChequeBookPage.tsx';
import { TransfersPage } from '../pages/customer/TransfersPage.tsx';
import { BeneficiariesPage } from '../pages/customer/BeneficiariesPage.tsx';
import { TransferHistoryPage } from '../pages/customer/TransferHistoryPage.tsx';
import {
  QrHubPage,
  QrScanPage,
  QrPayPage,
  MyQrPage,
  QrHistoryPage,
} from '../pages/customer/qr/index.ts';

// Card Management Pages
import { CardsOverviewPage } from '../pages/customer/cards/CardsOverviewPage.tsx';
import { DebitCardPage } from '../pages/customer/cards/DebitCardPage.tsx';
import { CreditCardPage } from '../pages/customer/cards/CreditCardPage.tsx';
import { VirtualCardsPage } from '../pages/customer/cards/VirtualCardsPage.tsx';
import { CardTransactionsPage } from '../pages/customer/cards/CardTransactionsPage.tsx';
import { CardDetailPage } from '../pages/customer/cards/CardDetailPage.tsx';

// Bill Payment & Recharge Pages
import { BillsOverviewPage } from '../pages/customer/bills/BillsOverviewPage.tsx';
import { PayBillPage } from '../pages/customer/bills/PayBillPage.tsx';
import { SavedBillersPage } from '../pages/customer/bills/SavedBillersPage.tsx';
import { BillHistoryPage } from '../pages/customer/bills/BillHistoryPage.tsx';
import { MobileRechargePage } from '../pages/customer/bills/MobileRechargePage.tsx';

// Profile, KYC, Security, Notification & Support Pages
import { ProfilePage } from '../pages/customer/profile/ProfilePage.tsx';
import { KycPage } from '../pages/customer/kyc/KycPage.tsx';
import { SecurityPage } from '../pages/customer/security/SecurityPage.tsx';
import { NotificationsPage } from '../pages/customer/notifications/NotificationsPage.tsx';
import { SupportHubPage } from '../pages/customer/support/SupportHubPage.tsx';
import { SupportTicketsPage } from '../pages/customer/support/SupportTicketsPage.tsx';
import { SupportTicketDetailPage } from '../pages/customer/support/SupportTicketDetailPage.tsx';

import { CustomerModulePage } from '../pages/customer/CustomerModulePage.tsx';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage.tsx';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage.tsx';
import { AdminCustomerDetailPage } from '../pages/admin/AdminCustomerDetailPage.tsx';
import { AdminAccountsPage } from '../pages/admin/AdminAccountsPage.tsx';
import { AdminAccountDetailPage } from '../pages/admin/AdminAccountDetailPage.tsx';
import { AdminTransactionsPage } from '../pages/admin/AdminTransactionsPage.tsx';
import { AdminTransactionDetailPage } from '../pages/admin/AdminTransactionDetailPage.tsx';
import { AdminModulePage } from '../pages/admin/AdminModulePage.tsx';

// Admin Advanced Banking Operations Pages
import { AdminQrDashboardPage } from '../pages/admin/qr/AdminQrDashboardPage.tsx';
import { AdminQrMerchantsPage } from '../pages/admin/qr/AdminQrMerchantsPage.tsx';
import { AdminQrTransactionsPage } from '../pages/admin/qr/AdminQrTransactionsPage.tsx';
import { AdminQrSettlementsPage } from '../pages/admin/qr/AdminQrSettlementsPage.tsx';

import { AdminCardsDashboardPage } from '../pages/admin/cards/AdminCardsDashboardPage.tsx';
import { AdminCardsIssuancePage } from '../pages/admin/cards/AdminCardsIssuancePage.tsx';
import { AdminCardsTransactionsPage } from '../pages/admin/cards/AdminCardsTransactionsPage.tsx';
import { AdminCardsFraudPage } from '../pages/admin/cards/AdminCardsFraudPage.tsx';

import { AdminLoansDashboardPage } from '../pages/admin/loans/AdminLoansDashboardPage.tsx';
import { AdminLoanApplicationsPage } from '../pages/admin/loans/AdminLoanApplicationsPage.tsx';
import { AdminLoanDetailPage } from '../pages/admin/loans/AdminLoanDetailPage.tsx';

import { AdminDepositsPage } from '../pages/admin/deposits/AdminDepositsPage.tsx';
import { AdminKycPage } from '../pages/admin/kyc/AdminKycPage.tsx';

// Admin Banking Operations & Security Modules
import { AdminFraudDashboardPage } from '../pages/admin/fraud/AdminFraudDashboardPage.tsx';
import { AdminFraudAlertsPage } from '../pages/admin/fraud/AdminFraudAlertsPage.tsx';
import { AdminFraudCasesPage } from '../pages/admin/fraud/AdminFraudCasesPage.tsx';
import { AdminFraudDetailPage } from '../pages/admin/fraud/AdminFraudDetailPage.tsx';

import { AdminAmlDashboardPage } from '../pages/admin/aml/AdminAmlDashboardPage.tsx';
import { AdminAmlMonitoringPage } from '../pages/admin/aml/AdminAmlMonitoringPage.tsx';
import { AdminAmlCasesPage } from '../pages/admin/aml/AdminAmlCasesPage.tsx';
import { AdminAmlReportsPage } from '../pages/admin/aml/AdminAmlReportsPage.tsx';

import { AdminBranchesPage } from '../pages/admin/branches/AdminBranchesPage.tsx';
import { AdminBranchDetailPage } from '../pages/admin/branches/AdminBranchDetailPage.tsx';

import { AdminEmployeesPage } from '../pages/admin/employees/AdminEmployeesPage.tsx';
import { AdminEmployeeDetailPage } from '../pages/admin/employees/AdminEmployeeDetailPage.tsx';

import { AdminRolesPage } from '../pages/admin/rbac/AdminRolesPage.tsx';
import { AdminPermissionsPage } from '../pages/admin/rbac/AdminPermissionsPage.tsx';

// Admin Reporting, Audit, Approvals & Settings Modules
import { AdminReportsHubPage } from '../pages/admin/reports/AdminReportsHubPage.tsx';
import { AdminTransactionReportPage } from '../pages/admin/reports/AdminTransactionReportPage.tsx';
import { AdminCustomerReportPage } from '../pages/admin/reports/AdminCustomerReportPage.tsx';
import { AdminDepositReportPage } from '../pages/admin/reports/AdminDepositReportPage.tsx';
import { AdminLoanReportPage } from '../pages/admin/reports/AdminLoanReportPage.tsx';
import { AdminCardReportPage } from '../pages/admin/reports/AdminCardReportPage.tsx';
import { AdminQrReportPage } from '../pages/admin/reports/AdminQrReportPage.tsx';
import { AdminFraudReportPage } from '../pages/admin/reports/AdminFraudReportPage.tsx';
import { AdminRevenueReportPage } from '../pages/admin/reports/AdminRevenueReportPage.tsx';
import { AdminAuditLogsPage } from '../pages/admin/audit/AdminAuditLogsPage.tsx';
import { AdminApprovalsPage } from '../pages/admin/approvals/AdminApprovalsPage.tsx';
import { AdminSettingsPage } from '../pages/admin/settings/AdminSettingsPage.tsx';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages & Marketing */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/personal-banking" element={<PersonalBankingPage />} />
        <Route path="/business-banking" element={<BusinessBankingPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/deposits" element={<DepositsPage />} />
        <Route path="/digital-banking" element={<DigitalBankingPage />} />
        <Route path="/qr-payment" element={<QrPaymentPublicPage />} />
        <Route path="/security" element={<SecurityPublicPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/atm-locator" element={<AtmLocatorPage />} />
        <Route path="/faq" element={<FaqPage />} />

        {/* Authentication Pages */}
        <Route path="/bank/login" element={<LoginPage />} />
        <Route path="/bank/register" element={<RegisterPage />} />
        <Route path="/bank/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/bank/reset-password" element={<ResetPasswordPage />} />
        <Route path="/bank/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/bank/verify-email" element={<VerifyEmailPage />} />
        <Route path="/bank/2fa" element={<TwoFactorAuthPage />} />
        <Route path="/bank/device-verification" element={<DeviceVerificationPage />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      {/* Customer Web Portal Route Group (/bank/*) */}
      <Route
        path="/bank"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/bank/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboardPage />} />
        <Route path="accounts" element={<CustomerAccountsPage />} />
        <Route path="accounts/open" element={<OpenAccountPage />} />
        <Route path="accounts/close" element={<CloseAccountPage />} />
        <Route path="accounts/cheque-book" element={<ChequeBookPage />} />
        <Route path="accounts/statement" element={<Navigate to="/bank/accounts/acc-001/statement" replace />} />
        <Route path="accounts/:accountId" element={<AccountDetailsPage />} />
        <Route path="accounts/:accountId/transactions" element={<AccountTransactionsPage />} />
        <Route path="accounts/:accountId/statement" element={<AccountStatementPage />} />
        <Route path="transactions" element={<AccountTransactionsPage />} />
        
        {/* Money Transfer Routes */}
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="transfers/send" element={<TransfersPage />} />
        <Route path="transfers/own-account" element={<Navigate to="/bank/transfers?type=own_account" replace />} />
        <Route path="transfers/bank" element={<Navigate to="/bank/transfers?type=other_bank" replace />} />
        <Route path="transfers/beneficiaries" element={<BeneficiariesPage />} />
        <Route path="transfers/history" element={<TransferHistoryPage />} />

        {/* QR Payment Routes */}
        <Route path="qr" element={<QrHubPage />} />
        <Route path="qr/scan" element={<QrScanPage />} />
        <Route path="qr/pay" element={<QrPayPage />} />
        <Route path="qr/my-qr" element={<MyQrPage />} />
        <Route path="qr/history" element={<QrHistoryPage />} />
        <Route path="qr/success" element={<QrPayPage />} />

        {/* Card Management Routes */}
        <Route path="cards" element={<CardsOverviewPage />} />
        <Route path="cards/debit" element={<DebitCardPage />} />
        <Route path="cards/credit" element={<CreditCardPage />} />
        <Route path="cards/virtual" element={<VirtualCardsPage />} />
        <Route path="cards/transactions" element={<CardTransactionsPage />} />
        <Route path="cards/:cardId" element={<CardDetailPage />} />

        {/* Bill Payment & Mobile Recharge Routes */}
        <Route path="bills" element={<BillsOverviewPage />} />
        <Route path="bills/pay" element={<PayBillPage />} />
        <Route path="bills/saved" element={<SavedBillersPage />} />
        <Route path="bills/history" element={<BillHistoryPage />} />
        <Route path="bills/recharge" element={<MobileRechargePage />} />

        <Route path="loans" element={<CustomerModulePage moduleType="loans" />} />
        <Route path="deposits" element={<CustomerModulePage moduleType="deposits" />} />
        <Route path="investments" element={<CustomerModulePage moduleType="investments" />} />
        <Route path="remittance" element={<CustomerModulePage moduleType="remittance" />} />
        <Route path="cheques" element={<ChequeBookPage />} />

        {/* Customer Profile Routes */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/personal" element={<ProfilePage />} />
        <Route path="profile/contact" element={<ProfilePage />} />
        <Route path="profile/nominee" element={<ProfilePage />} />
        <Route path="profile/employment" element={<ProfilePage />} />

        {/* KYC Compliance Routes */}
        <Route path="kyc" element={<KycPage />} />
        <Route path="kyc/status" element={<KycPage />} />
        <Route path="kyc/documents" element={<KycPage />} />

        {/* Security & Authentication Routes */}
        <Route path="security" element={<SecurityPage />} />
        <Route path="security/password" element={<SecurityPage />} />
        <Route path="security/pin" element={<SecurityPage />} />
        <Route path="security/2fa" element={<SecurityPage />} />
        <Route path="security/devices" element={<SecurityPage />} />
        <Route path="security/sessions" element={<SecurityPage />} />

        {/* Notifications Route */}
        <Route path="notifications" element={<NotificationsPage />} />

        {/* Support & Concierge Routes */}
        <Route path="support" element={<SupportHubPage />} />
        <Route path="support/contact" element={<SupportHubPage />} />
        <Route path="support/faq" element={<SupportHubPage />} />
        <Route path="support/tickets" element={<SupportTicketsPage />} />
        <Route path="support/tickets/:id" element={<SupportTicketDetailPage />} />
      </Route>

      {/* Admin Web Console Route Group (/admin/*) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
        <Route path="accounts" element={<AdminAccountsPage />} />
        <Route path="accounts/:id" element={<AdminAccountDetailPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="transactions/:id" element={<AdminTransactionDetailPage />} />
        {/* QR Banking Operations */}
        <Route path="qr" element={<AdminQrDashboardPage />} />
        <Route path="qr/merchants" element={<AdminQrMerchantsPage />} />
        <Route path="qr/transactions" element={<AdminQrTransactionsPage />} />
        <Route path="qr/settlements" element={<AdminQrSettlementsPage />} />

        {/* Card Management Operations */}
        <Route path="cards" element={<AdminCardsDashboardPage />} />
        <Route path="cards/issuance" element={<AdminCardsIssuancePage />} />
        <Route path="cards/transactions" element={<AdminCardsTransactionsPage />} />
        <Route path="cards/fraud" element={<AdminCardsFraudPage />} />

        {/* Loans Underwriting & Credit Operations */}
        <Route path="loans" element={<AdminLoansDashboardPage />} />
        <Route path="loans/applications" element={<AdminLoanApplicationsPage />} />
        <Route path="loans/:id" element={<AdminLoanDetailPage />} />

        {/* Deposits, DPS & FDR Operations */}
        <Route path="deposits" element={<AdminDepositsPage />} />
        <Route path="deposits/dps" element={<AdminDepositsPage forcedCategory="DPS" />} />
        <Route path="deposits/fdr" element={<AdminDepositsPage forcedCategory="FDR" />} />

        {/* KYC Due Diligence Operations */}
        <Route path="kyc" element={<AdminKycPage />} />
        <Route path="kyc/pending" element={<AdminKycPage forcedStatus="pending" />} />
        <Route path="kyc/verified" element={<AdminKycPage forcedStatus="verified" />} />
        <Route path="kyc/rejected" element={<AdminKycPage forcedStatus="rejected" />} />
        {/* Fraud Detection & Prevention */}
        <Route path="fraud" element={<AdminFraudDashboardPage />} />
        <Route path="fraud/alerts" element={<AdminFraudAlertsPage />} />
        <Route path="fraud/cases" element={<AdminFraudCasesPage />} />
        <Route path="fraud/:id" element={<AdminFraudDetailPage />} />

        {/* AML & Sanctions Surveillance */}
        <Route path="aml" element={<AdminAmlDashboardPage />} />
        <Route path="aml/monitoring" element={<AdminAmlMonitoringPage />} />
        <Route path="aml/cases" element={<AdminAmlCasesPage />} />
        <Route path="aml/reports" element={<AdminAmlReportsPage />} />

        {/* Physical Infrastructure & Branches */}
        <Route path="branches" element={<AdminBranchesPage />} />
        <Route path="branches/:id" element={<AdminBranchDetailPage />} />

        {/* Bank Employees & Staff Registry */}
        <Route path="employees" element={<AdminEmployeesPage />} />
        <Route path="employees/:id" element={<AdminEmployeeDetailPage />} />

        {/* RBAC Roles & Authorization Matrix */}
        <Route path="roles" element={<AdminRolesPage />} />
        <Route path="permissions" element={<AdminPermissionsPage />} />
        {/* Executive Regulatory & Financial Reports */}
        <Route path="reports" element={<AdminReportsHubPage />} />
        <Route path="reports/transactions" element={<AdminTransactionReportPage />} />
        <Route path="reports/customers" element={<AdminCustomerReportPage />} />
        <Route path="reports/deposits" element={<AdminDepositReportPage />} />
        <Route path="reports/loans" element={<AdminLoanReportPage />} />
        <Route path="reports/cards" element={<AdminCardReportPage />} />
        <Route path="reports/qr" element={<AdminQrReportPage />} />
        <Route path="reports/fraud" element={<AdminFraudReportPage />} />
        <Route path="reports/revenue" element={<AdminRevenueReportPage />} />

        {/* Immutable Supervisory Audit Ledger */}
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />

        {/* Maker-Checker Segregation of Duties Dual-Key Approvals */}
        <Route path="approvals" element={<AdminApprovalsPage />} />
        <Route path="approvals/pending" element={<AdminApprovalsPage forcedStatus="pending" />} />
        <Route path="approvals/history" element={<AdminApprovalsPage forcedStatus="history" />} />

        {/* Core Institutional System Configuration */}
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="settings/general" element={<AdminSettingsPage />} />
        <Route path="settings/security" element={<AdminSettingsPage />} />
        <Route path="settings/transactions" element={<AdminSettingsPage />} />
        <Route path="settings/fees" element={<AdminSettingsPage />} />
        <Route path="settings/limits" element={<AdminSettingsPage />} />
        <Route path="settings/notifications" element={<AdminSettingsPage />} />

        <Route path="support" element={<AdminModulePage moduleType="support" />} />
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFoundPage />
          </PublicLayout>
        }
      />
    </Routes>
  );
};
