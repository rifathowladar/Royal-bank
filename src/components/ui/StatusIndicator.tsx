import React from 'react';

export type StatusVariant =
  | 'completed'
  | 'active'
  | 'verified'
  | 'approved'
  | 'pending'
  | 'processing'
  | 'in_review'
  | 'flagged'
  | 'failed'
  | 'rejected'
  | 'delinquent'
  | 'frozen'
  | 'neutral';

interface StatusIndicatorProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  variant,
  className = '',
}) => {
  const normalized = (variant || status.toLowerCase()) as StatusVariant;

  const getStyle = (): { dotClass: string; textClass: string; label: string } => {
    switch (normalized) {
      case 'completed':
      case 'active':
      case 'verified':
      case 'approved':
        return {
          dotClass: 'bg-emerald-500',
          textClass: 'text-emerald-700 dark:text-emerald-400 font-medium',
          label: status,
        };
      case 'pending':
      case 'processing':
      case 'in_review':
        return {
          dotClass: 'bg-amber-500',
          textClass: 'text-amber-700 dark:text-amber-400 font-medium',
          label: status,
        };
      case 'flagged':
      case 'failed':
      case 'rejected':
      case 'delinquent':
      case 'frozen':
        return {
          dotClass: 'bg-rose-500',
          textClass: 'text-rose-700 dark:text-rose-400 font-medium',
          label: status,
        };
      default:
        return {
          dotClass: 'bg-slate-400',
          textClass: 'text-slate-600 dark:text-slate-400 font-medium',
          label: status,
        };
    }
  };

  const { dotClass, textClass, label } = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs whitespace-nowrap ${textClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      <span className="capitalize">{label.replace(/_/g, ' ')}</span>
    </span>
  );
};
