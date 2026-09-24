import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  ShieldAlert,
  Snowflake,
  Ban,
  Activity,
} from 'lucide-react';

export type AdminBadgeType =
  | 'customer_status'
  | 'kyc_status'
  | 'risk_score'
  | 'account_status'
  | 'transaction_status'
  | 'merchant_status'
  | 'merchant_kyc'
  | 'card_status'
  | 'card_fraud_risk'
  | 'loan_stage'
  | 'deposit_status';

export interface AdminBadgeProps {
  type: AdminBadgeType;
  value: string;
  size?: 'sm' | 'md';
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({ type, value, size = 'sm' }) => {
  const norm = (value || '').toLowerCase();

  let label = value;
  let bgClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let borderClass = 'border-slate-200 dark:border-slate-700';
  let Icon: React.ElementType = Activity;

  if (type === 'customer_status' || type === 'account_status') {
    switch (norm) {
      case 'active':
        label = 'Active';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      case 'frozen':
      case 'suspended':
        label = norm === 'frozen' ? 'Frozen' : 'Suspended';
        bgClass = 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300';
        borderClass = 'border-cyan-200 dark:border-cyan-800/60';
        Icon = Snowflake;
        break;
      case 'pending_verification':
      case 'restricted':
        label = norm === 'restricted' ? 'Restricted' : 'Pending';
        bgClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        borderClass = 'border-amber-200 dark:border-amber-800/60';
        Icon = Clock;
        break;
      case 'closed':
      case 'dormant':
        label = norm === 'closed' ? 'Closed' : 'Dormant';
        bgClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        borderClass = 'border-slate-300 dark:border-slate-700';
        Icon = Ban;
        break;
      default:
        break;
    }
  } else if (type === 'kyc_status') {
    switch (norm) {
      case 'verified':
      case 'approved':
        label = 'KYC Verified';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      case 'pending':
      case 'in_investigation':
        label = norm === 'pending' ? 'Pending Review' : 'Under Review';
        bgClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        borderClass = 'border-amber-200 dark:border-amber-800/60';
        Icon = Clock;
        break;
      case 'requires_update':
        label = 'Action Required';
        bgClass = 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300';
        borderClass = 'border-orange-200 dark:border-orange-800/60';
        Icon = AlertTriangle;
        break;
      case 'rejected':
        label = 'KYC Rejected';
        bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        borderClass = 'border-rose-200 dark:border-rose-800/60';
        Icon = XCircle;
        break;
      default:
        break;
    }
  } else if (type === 'risk_score') {
    switch (norm) {
      case 'low':
        label = 'Low Risk';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      case 'medium':
        label = 'Medium Risk';
        bgClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        borderClass = 'border-amber-200 dark:border-amber-800/60';
        Icon = AlertTriangle;
        break;
      case 'high':
        label = 'High Risk';
        bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        borderClass = 'border-rose-200 dark:border-rose-800/60';
        Icon = ShieldAlert;
        break;
      default:
        break;
    }
  } else if (type === 'transaction_status') {
    switch (norm) {
      case 'completed':
        label = 'Completed';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      case 'pending':
      case 'processing':
        label = norm === 'pending' ? 'Pending Approval' : 'Processing';
        bgClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        borderClass = 'border-amber-200 dark:border-amber-800/60';
        Icon = Clock;
        break;
      case 'flagged':
        label = 'AML Flagged';
        bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        borderClass = 'border-rose-200 dark:border-rose-800/60';
        Icon = ShieldAlert;
        break;
      case 'failed':
        label = 'Failed';
        bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        borderClass = 'border-rose-200 dark:border-rose-800/60';
        Icon = XCircle;
        break;
      case 'reversed':
        label = 'Reversed';
        bgClass = 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300';
        borderClass = 'border-purple-200 dark:border-purple-800/60';
        Icon = Snowflake;
        break;
      default:
        break;
    }
  } else if (type === 'merchant_status') {
    switch (norm) {
      case 'active':
        label = 'Active Terminal';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      case 'pending_approval':
        label = 'Pending Clearance';
        bgClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        borderClass = 'border-amber-200 dark:border-amber-800/60';
        Icon = Clock;
        break;
      case 'suspended':
        label = 'Suspended';
        bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        borderClass = 'border-rose-200 dark:border-rose-800/60';
        Icon = Ban;
        break;
      case 'terminated':
        label = 'Terminated';
        bgClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        borderClass = 'border-slate-300 dark:border-slate-700';
        Icon = XCircle;
        break;
      default:
        break;
    }
  } else if (type === 'merchant_kyc') {
    switch (norm) {
      case 'verified':
        label = 'KYC Cleared';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      case 'pending_review':
        label = 'Awaiting KYC';
        bgClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        borderClass = 'border-amber-200 dark:border-amber-800/60';
        Icon = Clock;
        break;
      case 'rejected':
        label = 'KYC Declined';
        bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        borderClass = 'border-rose-200 dark:border-rose-800/60';
        Icon = XCircle;
        break;
      default:
        break;
    }
  } else if (type === 'card_status') {
    switch (norm) {
      case 'active':
        label = 'Active';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      case 'frozen':
        label = 'Temporarily Frozen';
        bgClass = 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300';
        borderClass = 'border-cyan-200 dark:border-cyan-800/60';
        Icon = Snowflake;
        break;
      case 'cancelled':
      case 'blocked':
        label = 'Hotlisted / Blocked';
        bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        borderClass = 'border-rose-200 dark:border-rose-800/60';
        Icon = Ban;
        break;
      case 'expired':
        label = 'Expired';
        bgClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        borderClass = 'border-slate-300 dark:border-slate-700';
        Icon = Clock;
        break;
      default:
        break;
    }
  } else if (type === 'card_fraud_risk') {
    switch (norm) {
      case 'critical':
        label = 'Critical Risk';
        bgClass = 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 font-bold';
        borderClass = 'border-red-300 dark:border-red-800';
        Icon = ShieldAlert;
        break;
      case 'high':
        label = 'High Risk';
        bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        borderClass = 'border-rose-200 dark:border-rose-800/60';
        Icon = AlertTriangle;
        break;
      case 'medium':
        label = 'Medium Risk';
        bgClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        borderClass = 'border-amber-200 dark:border-amber-800/60';
        Icon = AlertTriangle;
        break;
      case 'low':
        label = 'Low Risk';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      default:
        break;
    }
  } else if (type === 'loan_stage') {
    switch (norm) {
      case 'pending':
        label = 'Pending Intake';
        bgClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        borderClass = 'border-slate-300 dark:border-slate-700';
        Icon = Clock;
        break;
      case 'kyc_review':
        label = 'KYC Review';
        bgClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
        borderClass = 'border-blue-200 dark:border-blue-800/60';
        Icon = Clock;
        break;
      case 'credit_assessment':
        label = 'Credit Assessment';
        bgClass = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300';
        borderClass = 'border-indigo-200 dark:border-indigo-800/60';
        Icon = Activity;
        break;
      case 'risk_review':
        label = 'Risk Review';
        bgClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        borderClass = 'border-amber-200 dark:border-amber-800/60';
        Icon = ShieldAlert;
        break;
      case 'approved':
        label = 'Approved (Awaiting Disbursement)';
        bgClass = 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300';
        borderClass = 'border-teal-200 dark:border-teal-800/60';
        Icon = CheckCircle2;
        break;
      case 'disbursed':
        label = 'Disbursed';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      case 'active':
        label = 'Active Facility';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      case 'completed':
        label = 'Settled & Closed';
        bgClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        borderClass = 'border-slate-300 dark:border-slate-700';
        Icon = CheckCircle2;
        break;
      case 'rejected':
        label = 'Declined';
        bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        borderClass = 'border-rose-200 dark:border-rose-800/60';
        Icon = XCircle;
        break;
      case 'defaulted':
        label = 'Default / Delinquent';
        bgClass = 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 font-bold';
        borderClass = 'border-red-300 dark:border-red-800';
        Icon = ShieldAlert;
        break;
      default:
        break;
    }
  } else if (type === 'deposit_status') {
    switch (norm) {
      case 'active':
        label = 'Active & Accruing';
        bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        borderClass = 'border-emerald-200 dark:border-emerald-800/60';
        Icon = CheckCircle2;
        break;
      case 'pending_approval':
        label = 'Pending Authorization';
        bgClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        borderClass = 'border-amber-200 dark:border-amber-800/60';
        Icon = Clock;
        break;
      case 'matured':
        label = 'Matured';
        bgClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
        borderClass = 'border-blue-200 dark:border-blue-800/60';
        Icon = CheckCircle2;
        break;
      case 'early_withdrawn':
        label = 'Prematurely Liquidated';
        bgClass = 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300';
        borderClass = 'border-purple-200 dark:border-purple-800/60';
        Icon = Snowflake;
        break;
      case 'closed':
        label = 'Closed';
        bgClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        borderClass = 'border-slate-300 dark:border-slate-700';
        Icon = Ban;
        break;
      default:
        break;
    }
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bgClass} ${borderClass} ${sizeClass}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
    </span>
  );
};
