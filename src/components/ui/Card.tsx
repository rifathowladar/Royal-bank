import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'royal' | 'subtle' | 'interactive';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  action?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  header,
  footer,
  action,
  title,
  subtitle,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default:
      'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs',
    royal:
      'bg-gradient-to-br from-royal-950 via-royal-900 to-royal-850 text-white border border-royal-700/60 shadow-md',
    subtle:
      'bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-slate-900 dark:text-slate-100',
    interactive:
      'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-royal-400 dark:hover:border-royal-500 cursor-pointer transition-colors shadow-xs',
  };

  const hasHeaderContent = header || title || subtitle || action;

  return (
    <div
      className={`rounded-2xl overflow-hidden ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {hasHeaderContent && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          {header ? (
            header
          ) : (
            <div>
              {title && (
                <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
